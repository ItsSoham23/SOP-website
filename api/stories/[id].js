import { sql, json, publicStory } from "../_lib/db.js";

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed." });
  try {
    const [story] = await sql`
      SELECT id, title, author_name, institution, bio, body, anonymous, submitted_at
      FROM stories WHERE id = ${request.query.id}
    `;
    return story ? response.status(200).json(publicStory(story)) : response.status(404).json({ error: "Story not found." });
  } catch (error) {
    console.error("Could not load story", error);
    return response.status(500).json({ error: "The story could not be loaded." });
  }
}
