import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setupEnv.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    // Integration tests share one SQLite file; running files in parallel
    // workers would race on it (and on deleteMany() resets in beforeEach).
    fileParallelism: false,
  },
});
