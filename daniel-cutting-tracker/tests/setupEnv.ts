// SQLite "file:" paths resolve relative to prisma/schema.prisma, so this
// points at the same prisma/test.db the "pretest" npm script pushes to.
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./test.db";
process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "test-secret";
process.env.AUTH_USER_EMAIL = process.env.AUTH_USER_EMAIL ?? "test@example.com";
// Force the AI layer to the deterministic rule-based parser during tests,
// regardless of what's in a developer's local .env.
process.env.ANTHROPIC_API_KEY = "";
