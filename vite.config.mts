import path from "path"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/bundles/",
    lib: {
      entry: [path.resolve(__dirname, "src/bundles/aiDrawerManager.tsx")],
      name: "aiDrawerManager",
      fileName: (format) => `aiDrawerManager.${format}.js`,
    },
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}))
