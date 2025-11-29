import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@types": path.resolve(__dirname, "src/types"),
      "@blockly": path.resolve(__dirname, "src/Blockly"),
      "@App/Lib/Blockly": path.resolve(__dirname, "src/Blockly"),
      "App/Lib/Blockly": path.resolve(__dirname, "src/Blockly"),
      "Assets": path.resolve(__dirname, "src/Assets")
    }
  },
  optimizeDeps: {
    include: ["avrgirl-arduino/dist/avrgirl-arduino.js"]
  },
  build: {
    outDir: "dist",
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/avrgirl-arduino/, /node_modules/]
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/__compiler": {
        target: "http://localhost:3100",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/__compiler/, "")
      },
      // NEW: forward /api/* to the local Airtable server on :3200
      "/api": {
        target: "http://localhost:3200",
        changeOrigin: true
      }
    }
  }
});
