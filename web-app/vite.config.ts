import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
    vinext(),
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
