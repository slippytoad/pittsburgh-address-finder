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
    mode === 'development' && componentTagger(),
    {
      name: 'apple-app-site-association',
      configureServer(server: any) {
        server.middlewares.use('/.well-known/apple-app-site-association', (req: any, res: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(JSON.stringify({
            "applinks": {
              "details": [
                {
                  "appIDs": ["com.slippytoad.JFWViolationsApp"],
                  "components": [
                    {
                      "/": "*",
                      "comment": "Matches all paths"
                    }
                  ]
                }
              ]
            }
          }));
        });
        server.middlewares.use('/apple-app-site-association', (req: any, res: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(JSON.stringify({
            "applinks": {
              "details": [
                {
                  "appIDs": ["com.slippytoad.JFWViolationsApp"],
                  "components": [
                    {
                      "/": "*",
                      "comment": "Matches all paths"
                    }
                  ]
                }
              ]
            }
          }));
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
