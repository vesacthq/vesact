---
name: port-app-to-cloudflare
description: "Use when moving an app in this repo from the nitro node build to Cloudflare Workers, or when a Workers deploy of a TanStack Start app fails to boot."
---

# Porting an app to Cloudflare Workers

The template ships every app on nitro's node preset. Cloudflare needs
`@cloudflare/vite-plugin` instead — nitro's own `cloudflare_module` preset does
not work here (see Rejected below). `apps/marketing` is the reference
implementation.

## Procedure

1. Add the plugin to the importing workspace, keeping the catalog convention:

   ```yaml
   # pnpm-workspace.yaml
   catalog:
     "@cloudflare/vite-plugin": ^1.54.4
     wrangler: ^4.129.0
   ```

   ```jsonc
   // apps/<app>/package.json
   "devDependencies": {
     "@cloudflare/vite-plugin": "catalog:",
     "wrangler": "catalog:"
   }
   ```

   Drop `nitro` from that app's dependencies. Other apps still on nitro keep theirs.

2. Allow the workerd build script once, in `pnpm-workspace.yaml`:

   ```yaml
   allowBuilds:
     workerd: true
   ```

   Without it the local runtime binary never installs and `wrangler dev` cannot start.

3. Swap the plugin in `apps/<app>/vite.config.ts`. Remove the `nitro({...})`
   plugin and its import, remove `environments.ssr.build.rollupOptions`, and add:

   ```ts
   import { cloudflare } from "@cloudflare/vite-plugin";

   build: {
     outDir: ".output",
   },
   plugins: [
     cloudflare({ viteEnvironment: { name: "ssr" } }),
     tanstackStart({ srcDirectory: "." }),
     // ...
   ],
   ```

   **`outDir` must start with a dot.** See Pitfalls.

4. Delete the nitro dispatch workaround from `apps/<app>/src/server.ts`. The
   template forwards the first request into the ssr environment through
   `fetchViteEnv` from `nitro/vite/runtime`, guarded by an `x-ssr-dispatch`
   header. `cloudflare({ viteEnvironment: { name: "ssr" } })` already runs the
   worker in that environment, so the whole hop goes away. Keep whatever real
   middleware the entry has (locale handling, auth), keep the default export,
   and drop the nitro import.

5. Add `apps/<app>/wrangler.jsonc`:

   ```jsonc
   {
   	"$schema": "node_modules/wrangler/config-schema.json",
   	"name": "vesact-<app>",
   	"account_id": "6a8e5373d12070c930f09f1a82541a0b",
   	"compatibility_date": "2026-09-03",
   	"compatibility_flags": ["nodejs_compat"],
   	"main": "./server.ts",
   }
   ```

   `main` is the app's own entry. See Pitfalls before reaching for
   `@tanstack/react-start/server-entry`.

   Do not declare `assets` — the plugin computes that directory itself and
   overrides anything written here.

6. Point that app's `start` script at `wrangler dev`; the old one runs
   `node .output/server/index.mjs`, which no longer exists.

7. Deploy from the app directory:

   ```bash
   CLOUDFLARE_ACCOUNT_ID=6a8e5373d12070c930f09f1a82541a0b pnpm exec wrangler deploy
   ```

## Pitfalls

**`outDir` must be a dot directory.** Oxlint skips dot-prefixed directories but
walks `dist/`, and `tooling/typescript/base.json` sets `allowJs: true`, so a
build output at `dist/` makes every emitted `.js` a lint input and `pnpm lint`
fails with `Cannot write file ... because it would overwrite input file`. The
tsconfig is innocent — `tsc --showConfig` shows zero dist files in the program
and `tsc --noEmit` passes. Nothing on the ignore side helps: `--ignore-pattern`,
`--ignore-path`, `ignorePatterns`, and `typeCheck: false` were all tried and all
failed, because the error happens while tsgolint builds its program, not while
scanning files. `.output` also matches the existing `turbo.json` outputs and
`.gitignore` entries.

**`main` must point at the app's entry, not the package's.**
`@tanstack/react-start/server-entry` resolves to the framework's _default_
entry, which is `createStartHandler(defaultStreamHandler)` and nothing else.
Point `main` at it and the app's `server.ts` never runs — the build succeeds,
pages render, and every piece of entry middleware is silently skipped. The
locale redirect is the visible one: `/en/<path>` should answer 301, and it
answers 200 instead.

**`compatibility_date` cannot exceed the local workerd.** Cloudflare accepts a
future date on deploy, but `wrangler dev` refuses to start with
`the newest date supported by this server binary is ...`. Keep the date at or
below the release date of the pinned wrangler.

**`minimumReleaseAge: 1440` blocks fresh releases.** `pnpm install` fails on any
version published within 24 hours. Pick the newest release older than that.

**Do not delete `.wrangler/`.** The plugin writes `.wrangler/deploy/config.json`
at build time, redirecting wrangler to the generated config under the output
directory. Removing it makes wrangler read `wrangler.jsonc` directly, where it
cannot resolve `@tanstack/react-start/server-entry` as a file path.

## Apps that reach the database

`packages/database/drizzle/client.ts` builds one `pg` pool when its module body
runs, and everything imports that `db`. Workers bind a socket to the request
that opened it, so a pooled connection cannot be handed to the next request:
request one answers, request two hangs until the runtime kills it, request
three answers again. Two changes make the singleton safe.

1. Retire each client after a single checkout, so no socket outlives its
   request. Hyperdrive does the real pooling upstream.

   ```ts
   // packages/database/drizzle/client.ts
   export const db = drizzle({
   	connection: { connectionString: databaseUrl, maxUses: 1 },
   	schema,
   });
   ```

2. Bind Hyperdrive and load the app on the first request. The binding hands out
   its connection string only inside a handler — reading it at module scope
   fails with `Disallowed operation called within global scope`, because the
   getter generates values. The string is the same on every read, so capture it
   once and pull the app in behind it:

   ```ts
   // apps/<app>/server.ts
   import { env } from "cloudflare:workers";

   let server: (typeof import("./src/server"))["default"] | undefined;

   export default {
   	async fetch(request: Request, options?: RequestOptions<Register>) {
   		if (!server) {
   			if (env.HYPERDRIVE) {
   				process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
   			}

   			server = (await import("./src/server")).default;
   		}

   		return server.fetch(request, options);
   	},
   };
   ```

   A static import would not work: the app's module bodies run before the
   handler, and `client.ts` would read `DATABASE_URL` while it is still unset.

   The binding needs a `localConnectionString` or `vite dev` refuses to start.
   Declare the one property of `cloudflare:workers` the entry uses in
   `apps/<app>/cloudflare.d.ts` rather than running `wrangler types`, which
   writes 600 KB of runtime declarations and would need `.oxlintrc.json` and
   `.oxfmtrc.json` ignore entries to stay out of the gates.

## Verification

Run all five; the first three are the repo gates and the last two prove the
runtime, which the gates do not touch.

```bash
pnpm format:check                       # exit 0
pnpm lint                               # exit 0
pnpm type-check                         # exit 0
pnpm --filter <app> dev                 # vite dev, expect SSR HTML
cd apps/<app> && pnpm exec wrangler dev # built output inside workerd
```

Confirm the response is server-rendered, not an empty shell: strip the tags and
check the visible text length rather than the byte count. Request `/en/<path>`
and confirm the 301, which proves the app's entry is the one running. For an app
with a database, send the same request five times in a row — the second one is
where a cross-request socket shows up.

## Rejected: nitro's cloudflare_module preset

`NITRO_PRESET=cloudflare_module` builds and deploys with no code changes, but
the worker never serves a request. Two independent failures:

- Rollup hoists the named exports of imported modules onto the worker entry, so
  `defaultLocale` (a string) sits beside `default`. Workers requires every named
  export to be a handler or Durable Object class and rejects the whole module.
  A re-export wrapper gets past this one.
- `traceDeps: ["react", "react-dom"]` leaves react external for node to resolve,
  and the Workers `no_bundle` mode cannot resolve bare specifiers:
  `No such module "react"`.

Both are template-file changes anyway, so the officially supported plugin costs
no more and does not need a workaround per failure.
