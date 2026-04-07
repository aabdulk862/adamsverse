import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Rewrite clean guide URLs to their .html files in dev (mirrors netlify.toml redirects)
function guideRewritePlugin() {
  const routes = ["/dsa", "/leetcode", "/github", "/ai-website"];
  return {
    name: "guide-rewrite",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (routes.includes(req.url?.split("?")[0])) {
          req.url += ".html";
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [guideRewritePlugin(), react()],
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-router": ["react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-stripe": ["@stripe/stripe-js", "@stripe/react-stripe-js"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.js",
  },
});
