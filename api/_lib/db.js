import { neon } from "@neondatabase/serverless";

export const sql = neon(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL
);

export function publicStory(story) {
  return {
    id: story.id,
    title: story.title,
    author: story.anonymous ? "Anonymous" : story.author_name,
    anonymous: story.anonymous,
    institution: story.institution,
    bio: story.bio,
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: story.body,
    submittedAt: story.submitted_at
  };
}

export function adminStory(story) {
  return {
    ...publicStory(story),
    authorName: story.author_name,
    email: story.email,
    fileName: story.file_name,
    fileSize: story.file_size
  };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
