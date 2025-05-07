import path from "path"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/bundled/",
    lib: {
      entry: [path.resolve(__dirname, "src/bundles/remoteTutorDrawer.tsx")],
      name: "remoteTutorDrawer",
      fileName: (format) => `remoteTutorDrawer.${format}.js`,
    },
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}))
