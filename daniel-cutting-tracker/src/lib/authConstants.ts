// Split out from src/lib/auth.ts so the Edge-runtime middleware can import
// just the cookie name without pulling in Node-only deps (bcryptjs,
// node:crypto) or the Prisma client.
export const SESSION_COOKIE_NAME = "dct_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
