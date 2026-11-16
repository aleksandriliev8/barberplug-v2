import { defineConfig } from "vitest/config";

// Separate from vite.config.ts: the React Router plugin must not run under Vitest.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    include: ["app/**/*.test.{ts,tsx}"],
  },
});
