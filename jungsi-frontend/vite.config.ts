import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), TanStackRouterVite()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3002,
      cors: true, // CORS 활성화
      proxy: {
        // Spring 백엔드는 더 이상 사용하지 않음 (2024-12 NestJS로 완전 마이그레이션)
        // "/api-spring": {
        //   target: "http://localhost:8080",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api-spring/, ""),
        // },
        // Nest.js 백엔드 프록시 규칙
        "/api-nest": {
          target: "http://localhost:4002",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-nest/, ""),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
    },
  };
});
