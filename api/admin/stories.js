import { requireAdmin } from "../_lib/auth.js";
import { sql, adminStory } from "../_lib/db.js";

export default async function handler(request, response) {
  if (!requireAdmin(request)) return response.status(401).json({ error: "Unauthorized." });
  try {
    if (request.method === "GET") {
      const stories = await sql`
        SELECT id, title, author_name, email, institution, bio, body, anonymous,
          file_name, file_size, submitted_at
        FROM stories ORDER BY submitted_at DESC
      `;
      return response.status(200).json(stories.map(adminStory));
    }
    if (request.method === "DELETE") {
      const id = request.query.id;
      if (!id) return response.status(400).json({ error: "Story id is required." });
      const deleted = await sql`DELETE FROM stories WHERE id = ${id} RETURNING id`;
      return deleted.length ? response.status(200).json({ deleted: id }) : response.status(404).json({ error: "Story not found." });
    }
    return response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Could not manage stories", error);
    return response.status(500).json({ error: "The admin request could not be completed." });
  }
}
