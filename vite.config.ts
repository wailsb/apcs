import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 3002,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Auth Service - handles authentication, JWT tokens
      "/api/auth": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
      // Booking Service - handles booking management
      "/api/bookings": {
        target: "http://localhost:8082",
        changeOrigin: true,
        secure: false,
      },
      // Slot Service - handles time slots and terminals
      "/api/slots": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
      },
      "/api/terminals": {
        target: "http://localhost:8083",
        changeOrigin: true,
        secure: false,
      },
      // AI Orchestrator Service
      "/api/ai": {
        target: "http://localhost:8084",
        changeOrigin: true,
        secure: false,
      },
      // Audit Service
      "/api/audit": {
        target: "http://localhost:8085",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
