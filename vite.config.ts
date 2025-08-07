import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'serve-apple-app-site-association',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.originalUrl === '/.well-known/apple-app-site-association') {
            res.setHeader('Content-Type', 'application/json');
            const filePath = path.join(
              __dirname,
              'public/.well-known/apple-app-site-association'
            );
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      },
      configurePreviewServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.originalUrl === '/.well-known/apple-app-site-association') {
            res.setHeader('Content-Type', 'application/json');
            const filePath = path.join(
              __dirname,
              'public/.well-known/apple-app-site-association'
            );
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
