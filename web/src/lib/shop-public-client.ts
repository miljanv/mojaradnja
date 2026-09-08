export function getInstagramUrl(username?: string | null) {
  if (!username) return null;
  return `https://instagram.com/${username.replace(/^@/, "")}`;
}
