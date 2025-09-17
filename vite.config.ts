import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  // Configure the dev server to bind to localhost instead of the IPv6
  // address. Using "::" caused issues on some environments because Vite
  // tries to listen on the IPv6 all‑interfaces address. Binding to
  // localhost makes it easier to run the development server locally.
  server: {
    host: "localhost",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
