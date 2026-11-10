import { zipSync, strToU8 } from "fflate";
import { requireAdmin } from "../_lib/auth.js";
import { sql } from "../_lib/db.js";

export default async function handler(request, response) {
  if (!requireAdmin(request)) return response.status(401).json({ error: "Unauthorized." });
  try {
    const stories = await sql`SELECT * FROM stories ORDER BY submitted_at DESC`;
    const files = {};
    const index = ["id,title,author,institution,submitted_at,file_name"];
    for (const story of stories) {
      const folder = `${story.id}-${story.title.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 50)}`;
      files[`${folder}/story.txt`] = strToU8(
        `Title: ${story.title}\nAuthor: ${story.anonymous ? "Anonymous" : story.author_name}\nInstitution: ${story.institution}\n\n${story.body}\n`
      );
      if (story.file_data) files[`${folder}/original-${story.file_name}`] = new Uint8Array(story.file_data);
      index.push([story.id, story.title, story.anonymous ? "Anonymous" : story.author_name,
        story.institution, story.submitted_at, story.file_name || ""]
        .map(value => `"${String(value).replaceAll('"', '""')}"`).join(","));
    }
    files["index.csv"] = strToU8(index.join("\n"));
    const archive = zipSync(files);
    response.setHeader("content-type", "application/zip");
    response.setHeader("content-disposition", 'attachment; filename="environmental-futures-stories.zip"');
    return response.status(200).send(Buffer.from(archive));
  } catch (error) {
    console.error("Could not export stories", error);
    return response.status(500).json({ error: "The export could not be created." });
  }
}
