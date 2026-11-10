export function requireAdmin(request) {
  const token = typeof request.headers?.get === "function"
    ? request.headers.get("x-admin-token")
    : request.headers?.["x-admin-token"];
  return Boolean(token && process.env.SESSION_SECRET && token === process.env.SESSION_SECRET);
}

export function checkCredentials(email, password) {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}
