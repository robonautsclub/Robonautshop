import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit tests for business rules (AGENTS.md §41). Pure Node environment —
 * no browser, no network. D1-backed tests use an in-process Miniflare D1
 * (see lib/test/d1.ts).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
