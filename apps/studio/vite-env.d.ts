/// <reference types="vite/client" />

declare module "*.css?url" {
	const src: string;
	export default src;
}

interface ImportMetaEnv {
	readonly VITE_ACCOUNT_URL?: string;
	readonly VITE_DOCS_URL?: string;
	readonly VITE_MARKETING_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
