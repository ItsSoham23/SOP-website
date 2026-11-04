import { zipSync, strToU8 } from "fflate";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function response(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers }
  });
}

function corsHeaders(env) {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, x-admin-token",
    "access-control-allow-methods": "GET, POST, OPTIONS"
  };
}

function withCors(result, env) {
  const headers = new Headers(result.headers);
  Object.entries(corsHeaders(env)).forEach(([key, value]) => headers.set(key, value));
  return new Response(result.body, { status: result.status, headers });
}

async function supabase(env, path, options = {}) {
  const result = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!result.ok) {
    throw new Error(`Supabase request failed (${result.status})`);
  }
  return result;
}

async function authenticate(request, env) {
  const token = request.headers.get("x-admin-token");
  if (!token || !env.SESSION_SECRET) return false;
  return token === env.SESSION_SECRET;
}

async function adminLogin(request, env) {
  const credentials = await request.json();
  if (credentials.email !== env.ADMIN_EMAIL || credentials.password !== env.ADMIN_PASSWORD) {
    return response({ error: "Invalid admin credentials." }, 401);
  }
  return response({ token: env.SESSION_SECRET });
}

async function handleSubmit(request, env) {
  const form = await request.formData();
  const story = {
    title: String(form.get("title") || "").trim(),
    author_name: String(form.get("name") || "").trim(),
    email: String(form.get("email") || "").trim(),
    institution: String(form.get("institution") || "").trim(),
    bio: String(form.get("bio") || "").trim(),
    body: String(form.get("story") || "").trim(),
    anonymous: form.get("publish_anonymously") === "true"
  };
  const file = form.get("story_file");

  if (!story.title || story.title.length > 120 || !story.author_name ||
      !story.email || !story.institution || (!story.body && !(file instanceof File))) {
    return response({ error: "Please complete all required submission fields." }, 400);
  }
  if (story.body.split(/\s+/).filter(Boolean).length > 1000) {
    return response({ error: "Stories must be 1,000 words or fewer." }, 400);
  }
  if (story.bio.split(/\s+/).filter(Boolean).length > 60) {
    return response({ error: "Bios must be 60 words or fewer." }, 400);
  }

  if (file instanceof File && file.size > 10 * 1024 * 1024) {
    return response({ error: "Uploaded files must be 10 MB or smaller." }, 400);
  }

  const inserted = await supabase(env, "stories", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify(story)
  });
  const [created] = await inserted.json();

  if (file instanceof File && file.size > 0) {
    const filePath = `${created.id}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const upload = await fetch(`${env.SUPABASE_URL}/storage/v1/object/story-files/${filePath}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": file.type || "application/octet-stream",
        "x-upsert": "false"
      },
      body: file.stream()
    });
    if (!upload.ok) return response({ error: "Story saved, but the file upload failed." }, 502);
    await supabase(env, `stories?id=eq.${created.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size
      })
    });
  }

  return response({ id: created.id }, 201);
}

function publicStory(story) {
  return {
    id: story.id,
    title: story.title,
    author: story.anonymous ? "Anonymous" : story.author_name,
    anonymous: story.anonymous,
    institution: story.institution,
    bio: story.bio,
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: story.body
  };
}

async function listStories(env) {
  const result = await supabase(env, "stories?select=*&order=submitted_at.desc");
  return response((await result.json()).map(publicStory));
}

async function getStory(id, env) {
  const result = await supabase(env, `stories?id=eq.${encodeURIComponent(id)}&select=*`);
  const stories = await result.json();
  return stories[0] ? response(publicStory(stories[0])) : response({ error: "Story not found." }, 404);
}

async function exportZip(request, env) {
  if (!(await authenticate(request, env))) return response({ error: "Unauthorized." }, 401);
  const result = await supabase(env, "stories?select=*&order=submitted_at.desc");
  const stories = await result.json();
  const files = {};
  const index = ["id,title,author,institution,submitted_at,file_name"];

  for (const story of stories) {
    const folder = `${story.id}-${story.title.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 50)}`;
    files[`${folder}/story.txt`] = strToU8(
      `Title: ${story.title}\nAuthor: ${story.anonymous ? "Anonymous" : story.author_name}\nInstitution: ${story.institution}\n\n${story.body}\n`
    );
    index.push([story.id, story.title, story.anonymous ? "Anonymous" : story.author_name,
      story.institution, story.submitted_at, story.file_name || ""]
      .map(value => `"${String(value).replaceAll('"', '""')}"`).join(","));

    if (story.file_path) {
      const fileResult = await fetch(`${env.SUPABASE_URL}/storage/v1/object/story-files/${story.file_path}`, {
        headers: { authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      });
      if (fileResult.ok) files[`${folder}/original-${story.file_name}`] = new Uint8Array(await fileResult.arrayBuffer());
    }
  }
  files["index.csv"] = strToU8(index.join("\n"));
  return new Response(zipSync(files), {
    headers: {
      ...corsHeaders(env),
      "content-type": "application/zip",
      "content-disposition": 'attachment; filename="environmental-futures-stories.zip"'
    }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(env) });
    const url = new URL(request.url);
    try {
      let result;
      if (request.method === "POST" && url.pathname === "/api/stories") result = await handleSubmit(request, env);
      else if (request.method === "GET" && url.pathname === "/api/stories") result = await listStories(env);
      else if (request.method === "GET" && url.pathname.startsWith("/api/stories/")) result = await getStory(url.pathname.split("/").pop(), env);
      else if (request.method === "POST" && url.pathname === "/api/admin/login") result = await adminLogin(request, env);
      else if (request.method === "GET" && url.pathname === "/api/admin/export.zip") result = await exportZip(request, env);
      else result = response({ error: "Not found." }, 404);
      return withCors(result, env);
    } catch (error) {
      console.error(error);
      return withCors(response({ error: "The server could not complete that request." }, 500), env);
    }
  }
};
