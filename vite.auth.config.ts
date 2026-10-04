import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

// Build the public sign-in UI separately so it cannot share private wedding chunks.
export default defineConfig({
  root: path.resolve(__dirname, "src/client/auth"),
  base: "/auth/",
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist/auth"),
    emptyOutDir: true,
  },
});
