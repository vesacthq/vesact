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

export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, monorepoRoot, ""));

	return {
		build: {
			outDir: ".output",
		},
		envDir: monorepoRoot,
		envPrefix: ["VITE_"],
		server: {
			port: Number.parseInt(process.env.PORT ?? "3001", 10),
			fs: { allow: [monorepoRoot] },
		},
		plugins: [
			contentCollections(),
			cloudflare({ viteEnvironment: { name: "ssr" } }),
			tanstackStart({
				srcDirectory: ".",
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
