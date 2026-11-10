import fs from "node:fs/promises";
import { formidable } from "formidable";
import { sql, json, publicStory } from "./_lib/db.js";

export const config = {
  api: { bodyParser: false }
};

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function wordCount(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

async function parseSubmission(request) {
  const form = formidable({
    maxFileSize: 4 * 1024 * 1024,
    keepExtensions: true,
    allowEmptyFiles: true
  });
  const [fields, files] = await form.parse(request);
  const parsedFile = first(files.story_file);
  const uploaded = parsedFile && parsedFile.size > 0 ? parsedFile : null;
  return {
    title: String(first(fields.title) || "").trim(),
    authorName: String(first(fields.name) || "").trim(),
    email: String(first(fields.email) || "").trim(),
    institution: String(first(fields.institution) || "").trim(),
    bio: String(first(fields.bio) || "").trim(),
    body: String(first(fields.story) || "").trim(),
    anonymous: first(fields.publish_anonymously) === "true",
    file: uploaded
  };
}

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      const stories = await sql`
        SELECT id, title, author_name, institution, bio, body, anonymous, submitted_at
        FROM stories
        ORDER BY submitted_at DESC
      `;
      return response.status(200).json(stories.map(publicStory));
    }

    if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });

    const submission = await parseSubmission(request);
    if (!submission.title || submission.title.length > 120 || !submission.authorName ||
        !submission.email || !submission.institution ||
        (!submission.body && !submission.file)) {
      return response.status(400).json({ error: "Please complete all required submission fields." });
    }
    if (wordCount(submission.body) > 1000) {
      return response.status(400).json({ error: "Stories must be 1,000 words or fewer." });
    }
    if (wordCount(submission.bio) > 60) {
      return response.status(400).json({ error: "Bios must be 60 words or fewer." });
    }

    const fileData = submission.file ? await fs.readFile(submission.file.filepath) : null;
    const fileHex = fileData ? fileData.toString("hex") : null;
    const fileName = submission.file?.originalFilename || null;
    const fileType = submission.file?.mimetype || null;
    const fileSize = submission.file?.size || null;
    const [created] = await sql`
      INSERT INTO stories (
        title, author_name, email, institution, bio, body, anonymous,
        file_name, file_path, file_type, file_size, file_data
      )
      VALUES (
        ${submission.title}, ${submission.authorName}, ${submission.email},
        ${submission.institution}, ${submission.bio}, ${submission.body},
        ${submission.anonymous}, ${fileName}, ${fileName}, ${fileType},
        ${fileSize},
        CASE WHEN ${fileHex} IS NULL THEN NULL ELSE decode(${fileHex}, 'hex') END
      )
      RETURNING id
    `;
    if (submission.file) await fs.unlink(submission.file.filepath).catch(() => {});
    return response.status(201).json({ id: created.id });
  } catch (error) {
    console.error("Could not save story", error?.message || error);
    return response.status(500).json({ error: "The story could not be saved." });
  }
}
