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
      },
      writeBundle() {
        // Copy apple-app-site-association to both locations in dist
        const sourceFile = path.join(__dirname, 'public/.well-known/apple-app-site-association');
        const wellKnownDir = path.join(__dirname, 'dist/.well-known');
        const destFile1 = path.join(wellKnownDir, 'apple-app-site-association');
        const destFile2 = path.join(__dirname, 'dist/apple-app-site-association');
        
        // Create .well-known directory if it doesn't exist
        if (!fs.existsSync(wellKnownDir)) {
          fs.mkdirSync(wellKnownDir, { recursive: true });
        }
        
        // Copy to both locations
        if (fs.existsSync(sourceFile)) {
          fs.copyFileSync(sourceFile, destFile1);
          fs.copyFileSync(sourceFile, destFile2);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
