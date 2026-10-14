const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "orbit2024";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "orbit-dev-session-secret";

async function safeEqual(a: string, b: string): Promise<boolean> {
  const crypto = await import("node:crypto");
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

async function expectedToken(): Promise<string> {
  const crypto = await import("node:crypto");
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`admin:${ADMIN_PASSWORD}`)
    .digest("hex");
}

export async function checkPassword(
  password: string,
): Promise<{ ok: false } | { ok: true; token: string }> {
  if (!(await safeEqual(password, ADMIN_PASSWORD))) return { ok: false };
  return { ok: true, token: await expectedToken() };
}

export async function checkSession(): Promise<boolean> {
  // Local dev is exempt — auth is enforced only in production builds.
  if (process.env.NODE_ENV !== "production") return true;
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  const raw = /(?:^|;\s*)admin_token=([^;]+)/.exec(req.headers.get("cookie") ?? "")?.[1] ?? "";
  if (!raw) return false;
  return safeEqual(decodeURIComponent(raw), await expectedToken());
}

export async function assertAdmin(): Promise<void> {
  if (!(await checkSession())) {
    throw new Error("Unauthorized — log in at /admin-login");
  }
}
