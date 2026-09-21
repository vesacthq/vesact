import path from "node:path";
import { fileURLToPath } from "node:url";

import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(appRoot, "../..");

export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, monorepoRoot, ""));
	const port = Number.parseInt(process.env.PORT ?? "3006", 10);

	return {
		build: {
			outDir: ".output",
		},
		envDir: monorepoRoot,
		envPrefix: ["VITE_"],
		server: {
			port,
			fs: { allow: [monorepoRoot] },
		},
		plugins: [
			contentCollections(),
			cloudflare({ viteEnvironment: { name: "ssr" }, inspectorPort: port + 6229 }),
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
