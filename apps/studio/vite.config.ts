import path from "node:path";
import { fileURLToPath } from "node:url";

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const studioRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(studioRoot, "../..");

// BUILD_TARGET=node builds the Docker image's entry: no Workers runtime, the
// Start server entry is the app itself and srvx serves it (see start:node).
const nodeTarget = process.env.BUILD_TARGET === "node";

export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, monorepoRoot, ""));
	const port = Number.parseInt(process.env.PORT ?? "3000", 10);

	return {
		build: {
			outDir: nodeTarget ? ".output/node" : ".output",
		},
		// The Workers target has to bundle its server dependencies; the node target
		// does the same, so the image carries the bundle instead of a node_modules.
		environments: nodeTarget ? { ssr: { resolve: { noExternal: true } } } : undefined,
		envDir: monorepoRoot,
		envPrefix: ["VITE_"],
		server: {
			port,
			fs: { allow: [monorepoRoot] },
		},
		plugins: [
			nodeTarget
				? []
				: cloudflare({ viteEnvironment: { name: "ssr" }, inspectorPort: port + 6229 }),
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
