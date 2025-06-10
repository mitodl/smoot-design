import path from "path"
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist/bundled/",
    emptyOutDir: false,
    lib: {
      entry: [path.resolve(__dirname, "src/bundles/aiDrawerManager.tsx")],
      name: "remoteTutorDrawer",
      fileName: (format) => `remoteTutorDrawer.${format}.js`,
    },
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}))
