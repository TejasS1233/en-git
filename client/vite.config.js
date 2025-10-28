import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import sitemap from "vite-plugin-sitemap";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const isExtension = mode === "extension";

  return {
    plugins: [
      react(),
      tailwindcss(),
      !isExtension && {
        ...sitemap({
          hostname: "https://en-git.vercel.app",
          dynamicRoutes: [
            "/",
            "/compare",
            "/repo",
            "/login",
            "/signup",
            "/dashboard",
            "/auth/callback",
            "/privacy",
            "/contact",
          ],
          generateRobotsTxt: false,
        }),
        configResolved(config) {
          // Ensure dist directory exists before sitemap generation
          const distPath = path.resolve(config.root, "dist");
          if (!fs.existsSync(distPath)) {
            fs.mkdirSync(distPath, { recursive: true });
          }
        },
      },
    ].filter(Boolean),
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
