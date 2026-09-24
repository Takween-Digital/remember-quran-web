import vinext from "vinext";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
    vinext({
      cache: {
        data: kvDataAdapter(),
      },
    }),
  ],
  ssr: {
    external: ["firebase-admin", "@grpc/grpc-js", "protobufjs", "@grpc/proto-loader"],
  },
  optimizeDeps: {
    exclude: ["firebase-admin", "@grpc/grpc-js", "protobufjs", "@grpc/proto-loader"],
  },
  build: {
    cssMinify: false,
  },
});
