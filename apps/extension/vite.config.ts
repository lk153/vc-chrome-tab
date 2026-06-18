import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Hand-rolled MV3 build (no CRXJS): three Rollup entries — the two extension
 * pages (newtab, popup) and the background service worker. Filenames are kept
 * stable (no hashing) so the static `public/manifest.json` can reference them
 * by predictable paths. `public/` is copied verbatim into `dist/`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Consume the shared package as source so Vite transpiles its TS.
      "@vctabs/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, "newtab.html"),
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background/index.ts"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
