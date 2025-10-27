import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const isExtension = mode === "extension";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
    },
    build: isExtension
      ? {
          outDir: "../chrome-extension",
          rollupOptions: {
            input: {
              popup: path.resolve(__dirname, "src/popup.jsx"),
              settings: path.resolve(__dirname, "src/settings.jsx"),
            },
            output: {
              entryFileNames: "[name].js",
              chunkFileNames: "chunks/[name].js",
              assetFileNames: "assets/[name].[ext]",
              format: "es",
              manualChunks: undefined,
            },
          },
          minify: true,
          sourcemap: false,
        }
      : undefined,
  };
});
