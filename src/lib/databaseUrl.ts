export function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return undefined;

  try {
    const url = new URL(value);
    const isLocalTunnel = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (isLocalTunnel && !url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "disable");
    }
    return url.toString();
  } catch {
    return value;
  }
}
