import path from "path"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/bundled/",
    lib: {
      entry: [path.resolve(__dirname, "src/bundles/edxAiChatDrawer.tsx")],
      name: "edxAiChatDrawer",
      fileName: (format) => `edxAiChatDrawer.${format}.js`,
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}))
