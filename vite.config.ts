import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    // Increase chunk warning limit to 1000 KB
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Automatically split node_modules into separate chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Extract the package name
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },

  // Optional: base path for Vercel deployment
  base: "/",
});

