import path from "node:path";
import { fileURLToPath } from "node:url";

import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const marketingRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(marketingRoot, "../..");

// BUILD_TARGET=node builds the Docker image's entry: no Workers runtime, the
// Start server entry is the app itself and srvx serves it (see start:node).
const nodeTarget = process.env.BUILD_TARGET === "node";

export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, monorepoRoot, ""));

	return {
		build: {
			outDir: nodeTarget ? ".output/node" : ".output",
		},
		envDir: monorepoRoot,
		envPrefix: ["VITE_"],
		server: {
			port: Number.parseInt(process.env.PORT ?? "3001", 10),
			fs: { allow: [monorepoRoot] },
		},
		plugins: [
			contentCollections(),
			nodeTarget ? [] : cloudflare({ viteEnvironment: { name: "ssr" } }),
			tanstackStart({
				srcDirectory: ".",
				server: nodeTarget ? { entry: "./src/server.ts" } : undefined,
			}),
			viteReact(),
			tailwindcss(),
		],
		resolve: {
			dedupe: ["react", "react-dom"],
			tsconfigPaths: true,
		},
	};
});
