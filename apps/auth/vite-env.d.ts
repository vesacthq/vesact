/// <reference types="vite/client" />

declare module "*.css?url" {
	const src: string;
	export default src;
}

interface ImportMetaEnv {
	readonly VITE_AUTH_URL?: string;
	readonly VITE_STUDIO_URL?: string;
	readonly VITE_MARKETING_URL?: string;
	readonly VITE_RELAY_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
