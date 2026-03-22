import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["src/test-setup.ts"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.ts", "src/test-setup.ts"],
      reporter: ["text", "lcov"]
    }
  }
})
