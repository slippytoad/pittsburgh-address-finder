import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        // Ensure apple-app-site-association is copied to build
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'apple-app-site-association') {
            return '.well-known/apple-app-site-association';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
}));
