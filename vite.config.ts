// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";
import path from "node:path";
import fs from "node:fs";

// Load all env vars (including non-VITE_ server secrets) into process.env for server routes.
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

/**
 * Inlina los .wasm importados por workers-og (satori/resvg) como WebAssembly.Module,
 * para que funcionen tanto en el dev server de Node como en el runtime edge.
 */
const inlineWasm = (): Plugin => ({
  name: "qsy-inline-wasm",
  enforce: "pre",
  load(id) {
    const file = id.split("?")[0] ?? "";
    if (!file.endsWith(".wasm")) return null;
    const b64 = fs.readFileSync(file).toString("base64");
    return `const bin = Uint8Array.from(atob(${JSON.stringify(b64)}), (c) => c.charCodeAt(0));
export default new WebAssembly.Module(bin);`;
  },
});

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [inlineWasm()],
    ssr: { noExternal: ["workers-og"] },
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
        entities: path.resolve(process.cwd(), "node_modules/entities"),
      },
    },
  },
});

});
