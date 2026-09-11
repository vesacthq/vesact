/// <reference types="vite/client" />

declare module "*.css?url" {
	const src: string;
	export default src;
}

interface ImportMetaEnv {
	readonly VITE_RELAY_URL?: string;
	readonly VITE_RELAY_API_URL?: string;
	readonly VITE_ACCOUNT_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
