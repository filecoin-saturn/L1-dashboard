import * as path from "path";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // saturn-l2 depends on this path
    base: "/webui/",
    plugins: [react()],
    server: {
      port: 3010,
      strictPort: true,
      // proxy for aws metrics endpoint to get around strict cors settings when developing locally
      proxy: {
        "/metrics": {
          target: env.VITE_METRICS_ORIGIN ?? "https://ln3tnkd4d5uiufjgimi6jlkmci0bceff.lambda-url.us-west-2.on.aws/",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/metrics/, ""),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
