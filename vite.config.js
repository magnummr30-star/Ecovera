import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { resolve } from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const remoteTarget = env.DEV_REMOTE_TARGET?.replace(/\/+$/, "");
  const basicAuthUser = env.DEV_REMOTE_BASIC_AUTH_USER;
  const basicAuthPass = env.DEV_REMOTE_BASIC_AUTH_PASS;
  const proxyAuth =
    basicAuthUser && basicAuthPass ? `${basicAuthUser}:${basicAuthPass}` : undefined;

  const proxy = remoteTarget
    ? {
        "/api": {
          target: remoteTarget,
          changeOrigin: true,
          secure: false,
          ...(proxyAuth ? { auth: proxyAuth } : {}),
        },
        "/backend": {
          target: remoteTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/backend/, ""),
          ...(proxyAuth ? { auth: proxyAuth } : {}),
        },
      }
    : undefined;

  return {
    plugins: [react()],
    server: {
      host: true,
      ...(proxy ? { proxy } : {}),
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "index.html"),
      },
      cssCodeSplit: false,
    },
  };
});
