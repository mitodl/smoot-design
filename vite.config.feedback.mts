import path from "path"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/bundles/",
    emptyOutDir: false,
    lib: {
      entry: [path.resolve(__dirname, "src/bundles/feedbackDrawerManager.tsx")],
      name: "feedbackDrawerManager",
      fileName: (format) => `feedbackDrawerManager.${format}.js`,
    },
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}))
