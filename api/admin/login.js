import { checkCredentials } from "../_lib/auth.js";

export default function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const { email, password } = request.body || {};
  if (!checkCredentials(email, password)) return response.status(401).json({ error: "Invalid admin credentials." });
  return response.status(200).json({ token: process.env.SESSION_SECRET });
}
