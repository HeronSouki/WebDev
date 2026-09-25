import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteSingleFile } from "vite-plugin-singlefile"
import { fileURLToPath } from "node:url"

// Serves /preview with the Framer components from /framer.
// `npm run build` produces a single self-contained dist/index.html.
export default defineConfig({
    root: "preview",
    plugins: [react(), viteSingleFile()],
    resolve: {
        alias: { framer: fileURLToPath(new URL("./preview/framer-shim.tsx", import.meta.url)) },
    },
    build: { outDir: "../dist", emptyOutDir: true },
})
