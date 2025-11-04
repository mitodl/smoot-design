import path from "path"
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/bundles/",
    emptyOutDir: false,
    lib: {
      entry: [
        path.resolve(__dirname, "src/bundles/TiptapEditor/tiptapDisplay.tsx"),
      ],
      name: "tiptapDisplay",
      fileName: (format) => `tiptapDisplay.${format}.js`,
    },
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}))
