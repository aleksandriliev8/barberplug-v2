import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Same origin as production (CloudFront routes /api/* to the backend, ADR-0006),
    // so session and CSRF cookies behave the same in development.
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
