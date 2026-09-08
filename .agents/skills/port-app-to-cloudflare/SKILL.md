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
   	"main": "@tanstack/react-start/server-entry",
   }
   ```

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
check the visible text length rather than the byte count.

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
