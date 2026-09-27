export function sanitizeFilenameBase(value, fallback) {
  const sanitized = String(value ?? "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return sanitized || fallback;
}
