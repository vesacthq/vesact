# syntax=docker/dockerfile:1
# One image per app: docker build --build-arg APP=studio .
# The Node target of the app (BUILD_TARGET=node) served by srvx; see AGENTS.md.

FROM node:22-alpine AS build
ARG APP
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Inlined into the client bundle; a missing URL makes the app link to localhost.
ARG VITE_STUDIO_URL VITE_ACCOUNT_URL VITE_MARKETING_URL VITE_RELAY_URL VITE_RELAY_API_URL VITE_DOCS_URL
ARG VITE_POSTHOG_KEY VITE_POSTHOG_HOST
RUN test -n "$VITE_STUDIO_URL" && test -n "$VITE_ACCOUNT_URL" && test -n "$VITE_MARKETING_URL"
RUN pnpm --filter "$APP" build:node
# --legacy: the workspace links packages instead of injecting them (pnpm 10 default).
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter "$APP" deploy --prod --legacy /app

FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build /app /app
USER node
EXPOSE 3000
CMD ["node", "node_modules/srvx/bin/srvx.mjs", "--prod", "-s", "../client", ".output/node/server/server.js"]
