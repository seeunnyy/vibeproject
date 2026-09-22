import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // tests/e2e/**는 Playwright 전용 — vitest가 .spec.ts로 잘못 집어가지 않도록 제외.
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
});
