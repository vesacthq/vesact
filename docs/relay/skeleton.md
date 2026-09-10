# Relay 骨架（A1）

A 轨的第一步：把 Relay 最薄的一条端到端链路跑到线上，后面的切片都长在它上面。公共约定在 engineering.md §8.3，进度在 #26 和它的子 issue。

## 1. 目标

一个带 API key 的请求从 `api.vesact.com` 进来，经过鉴权、限流、配额、用量记录，返回 OpenAPI 描述过的响应；Meta 的 webhook 通过握手并原样落库；开发者在 `relay.vesact.com` 登录、建组织、发 key。领域表不在这一步建。

## 2. 不做

- conversation / message / account 等领域表和端点：A2 设计，A3 实现。
- Cloudflare Queues 消费者、出站 webhook 投递：A3。
- 权限 scope 的实际检查：A3 的第一个业务端点才有 scope 可查。
- 计费、配额默认值、对外开放注册：A6。
- 控制台视觉：用现成 shadcn 主题，#30 之后再对齐。
- `developers.vesact.com`：A1 的文档挂在 `api.vesact.com/v1/docs`。

## 3. 拓扑

|        | prod                                                            | preview                                                                              | dev                                            |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Worker | `vesact-relay`                                                  | `vesact-relay-preview`                                                               | `pnpm --filter relay dev`，端口 3005           |
| 控制台 | `relay.vesact.com`                                              | `relay.preview.vesact.com`                                                           | `localhost:3005`                               |
| API    | `api.vesact.com`                                                | `api.preview.vesact.com`                                                             | `localhost:3005`                               |
| 认证   | `account.vesact.com`（`apps/account`），cookie 域 `.vesact.com` | `account.preview.vesact.com`，cookie 域 `.preview.vesact.com`，前缀 `vesact-preview` | `localhost:3004`，localhost 的 cookie 不分端口 |
| 数据库 | Hyperdrive `vesact-db` → Neon `production`                      | Hyperdrive `vesact-preview` → Neon `preview`                                         | docker postgres 5433                           |

一个 worker 每个环境挂两个 custom domain，按路径前缀分发：`/v1/*`、`/webhooks/*`、`/oauth/*` 进 Hono，其余进 TanStack Start 控制台。API 主机名上的非 API 路径返回 404 JSON，其他情况不看主机名。

三个环境的认证都由账号中心 `apps/account` 提供（docs/account/overview.md），组织和成员也在那里管理，Relay 只读。Relay 不挂 Better Auth 的 handler，只在进程内用同一个 `packages/auth` 实例校验 key 和读会话；会话 cookie 设在环境的父域上，两个产品共享登录态。preview 能和 prod 同构，是因为 preview 主机名在 `preview.vesact.com` 下；`workers.dev` 在 Public Suffix List 上做不到这一点，preview 已经迁走。

## 4. 交付项

### 4.1 应用与部署

内容：

- `apps/relay`：照 `apps/studio` 建 `vite.config.ts`、`wrangler.jsonc`（prod + `env.preview`）、`server.ts`（Hyperdrive 延迟加载 + 路径分发）、`start.ts`、`router.tsx`、`routes/__root.tsx`。
- vars：`VITE_RELAY_URL`、`VITE_RELAY_API_URL`、`VITE_ACCOUNT_URL`、`META_APP_ID`；preview 加 `AUTH_COOKIE_PREFIX=vesact-preview`。
- secrets：`secrets/relay.{prod,preview,dev}.env`，内容是对应 `studio.*.env` 的认证与邮件项（`BETTER_AUTH_SECRET` 必须同值）加 `META_APP_SECRET`、`META_WEBHOOK_VERIFY_TOKEN`。`pnpm secrets:pull` 同时产出 `apps/relay/.dev.vars`。
- CI：`deploy.yml` 加 `relay` job，`needs: studio`，表由 studio job 的 migrate 建；`select-target.sh` 加 relay 的 URL；smoke 打 `/v1/health` 和 `/login`。
- Cloudflare：prod 和 preview 各两个 custom domain，先在 API 或面板上挂好再首次部署；preview 的 Access 由 `*.preview.vesact.com` 通配应用覆盖，另建一个路径为 `api.preview.vesact.com/webhooks` 的 Access 应用，策略 Bypass Everyone，Meta 才打得到。
- `GET /v1/health`：无鉴权，返回 `{ "status": "ok" }`。

验收：

- push main 后 `curl https://api.vesact.com/v1/health` 200，`https://relay.vesact.com/login` 200。
- PR 部署后 `https://api.preview.vesact.com/v1/health` 和 `https://relay.preview.vesact.com/login` 带 Access 服务令牌 200、不带 302；`/webhooks/meta` 不带令牌到达 worker，返回 worker 的 4xx 而非 Access 的 302。
- `wrangler secret list --name vesact-relay` 列出 `relay.prod.env` 的全部键。
- AGENTS.md 的环境矩阵和 deploy-and-env-vars skill 各有 relay 一行。

### 4.2 API key 与租户链

内容：

- `@better-auth/api-key` 1.7.3（与 better-auth 同版本）装进 `packages/auth`，配置 `references: "organization"`、`defaultPrefix: "relay_"`、默认 `rateLimitMax: 300`、`rateLimitTimeWindow: 60_000`、`remaining: null`，允许不过期。
- `apikey` 表放 `packages/database/drizzle/schema/relay.ts`；`client.ts` 改为导入 `./schema`（index），Better Auth 的 adapter 和 `db.query` 才看得到；生成迁移。
- key 属于组织。创建、吊销、列出走 Better Auth 的端点，需要会话且用户在该组织有 Relay 访问（`relay.access`，见 docs/account/overview.md §4）。`permissions` 命名 `{ "<资源>": ["read" | "write"] }`，A1 不填、不检查。

验收：

- 迁移在 preview 和 prod 跑过，`apikey` 表存在。
- 用组织 A 的会话调 `POST /api/auth/api-key/create` 得到明文 key，只出现这一次；`GET /api/auth/api-key/list` 只列组织 A 的 key，组织 B 的成员看不到。
- 删除后 `verifyApiKey` 返回 `KEY_NOT_FOUND`，禁用后返回 `KEY_DISABLED`。

### 4.3 `/v1` 入口中间件链

内容，顺序固定：

1. request ID：`X-Request-Id: req_<ULID>`，出现在每个响应和用量记录里。
2. 取 key：`Authorization: Bearer <key>`；缺失或格式不对 → 401 `UNAUTHORIZED`。
3. verify：`auth.api.verifyApiKey`。映射：`KEY_NOT_FOUND`、`KEY_EXPIRED`、`KEY_DISABLED` → 401 `UNAUTHORIZED`，`data.reason` 保留原码；`RATE_LIMITED` → 429 `TOO_MANY_REQUESTS`；`USAGE_EXCEEDED` → 429 `QUOTA_EXCEEDED`。
4. 上下文：`{ organizationId, apiKeyId, permissions, requestId }` 进 oRPC context；`relayKeyProcedure` 建在其上，A3 起所有业务端点用它。
5. 限流头：鉴权后的每个响应带 `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`（unix 秒），429 带 `Retry-After`。
6. 用量：响应发出后 `waitUntil` 写一行 `relay_api_usage`，写失败只记日志。
7. 错误体：oRPC 默认 `{ defined, code, status, message, data }`，不再包一层。`/v1` 不设 CORS 头。

`GET /v1/me` 返回 `{ id, name, organizationId, permissions, rateLimit: { max, windowMs }, remaining, expiresAt }`，是 A1 唯一的鉴权端点。Hono 自带的 `request-id`、`bearer-auth`、`timing` 直接用。

验收，脚本进仓库：

- 无 Authorization → 401，`code` 为 `UNAUTHORIZED`，有 `X-Request-Id`。
- 错 key → 401；禁用的 key → 401 且 `data.reason` 为 `KEY_DISABLED`；删除的 key → `KEY_NOT_FOUND`。
- 正确 key → 200，`X-RateLimit-Limit: 300`，`X-RateLimit-Remaining` 每次减 1。
- 把一把 key 的 `rateLimitMax` 设为 3：第 4 次 429 `TOO_MANY_REQUESTS` 带 `Retry-After`，窗口过后恢复。
- `remaining` 设为 1：第 2 次 429 `QUOTA_EXCEEDED`。
- 每次调用后 `relay_api_usage` 多一行，`requestId` 与响应头一致，`path` 是路由模式 `/v1/me`。
- 上述映射有 vitest 单测。

### 4.4 表

都在 `packages/database/drizzle/schema/relay.ts`，由 `index.ts` 再导出，`postgres.ts` 不动。

| 表                      | 列                                                                                                                                             | 索引与约束                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `apikey`                | 插件定义                                                                                                                                       | 插件定义                                               |
| `relay_api_usage`       | `id`、`apiKeyId`、`organizationId`、`method`、`path`（路由模式）、`status`、`durationMs`、`requestId`、`createdAt`                             | `(organizationId, createdAt)`、`(apiKeyId, createdAt)` |
| `relay_idempotency_key` | `apiKeyId`、`routeKey`、`key`、`requestHash`、`state`（`in_flight` / `completed`）、`responseStatus`、`responseBody`、`expiresAt`、`createdAt` | 唯一 `(apiKeyId, routeKey, key)`                       |
| `relay_inbound_event`   | `id`、`platform`、`bodySha256`、`signatureValid`、`payload`（jsonb）、`receivedAt`、`processedAt`                                              | 唯一 `bodySha256`                                      |

验收：`pnpm --filter @repo/database generate` 产出一份迁移，`pnpm type-check` 通过。

### 4.5 OpenAPI 与文档

内容：

- `packages/api/modules/relay/router.ts` 独立于 Studio 的 `router.ts`。契约用 zod，`.route({ method, path, summary, tags })`，`.errors({...})` 声明每个端点可能的错误码。
- `apps/relay` 里的 `OpenAPIHandler` 前缀 `/v1`；`OpenAPIReferencePlugin` 出 `/v1/openapi.json` 和 `/v1/docs`；`info.title` 为 `Relay API`，`servers` 为 `VITE_RELAY_API_URL` + `/v1`，`securitySchemes.bearerAuth` 加全局 `security`。
- 文档在 prod 公开。

验收：

- `/v1/openapi.json` 是 OpenAPI 3.1，含 `/health` 和 `/me`；`/me` 有 `security` 和 401、429 的响应定义。
- `/v1/docs` 渲染，能在页面里填 key 调 `/me`。
- 契约变更只改 zod，spec 随 build 变化，没有手写副本。

### 4.6 幂等

内容：中间件加 `relay_idempotency_key` 表，语义按 §8.3：只作用于 POST；`Idempotency-Key` 不超过 255 字符；作用域 `apiKeyId` + 路由；首个响应含 5xx 连状态码存 24h；同 key 同请求摘要回放原响应并带 `Idempotent-Replayed: true`；同 key 不同摘要 422 `IDEMPOTENCY_CONFLICT`；处理中 409 `IDEMPOTENCY_IN_FLIGHT` 且不落库；过期后当新请求。A1 没有 POST 端点，中间件不挂路由，第一次挂在 A3 的发送端点。

验收：vitest 覆盖回放、冲突、处理中、过期四种；表在迁移里。

### 4.7 Meta webhook 接收

内容：

- `GET /webhooks/meta`：`hub.mode=subscribe` 且 `hub.verify_token` 与 `META_WEBHOOK_VERIFY_TOKEN` 相同 → 200 纯文本 `hub.challenge`，否则 403。
- `POST /webhooks/meta`：读原始 body；`X-Hub-Signature-256` 与 `HMAC-SHA256(body, META_APP_SECRET)` 常量时间比较；不匹配 → 401 不落库；匹配 → 插入 `relay_inbound_event`，`bodySha256` 冲突则忽略 → 200。不做任何解析，5 秒内返回。
- 不接 Queue，`processedAt` 留给 A3 的消费者。

验收：

- curl 模拟握手 200 且 body 是 challenge；错 token 403。
- 用 `openssl dgst -sha256 -hmac` 算签名的 POST → 200，表多一行；同 body 重发 → 200 且行数不变；改一字节但签名不变 → 401。
- A0 的 Meta App 建好后，在 App Dashboard 订阅 `https://api.vesact.com/webhooks/meta`，验证通过；点 Test 发一条 `messages` 事件，表里有对应 `payload`。这一条依赖 A0。

### 4.8 控制台

内容：

- 路由：`/`（有组织进组织首页，没有则提示去账号中心创建）、`/settings/api-keys`（列表、创建后显示一次明文、吊销）。没有登录页和成员页：未登录时照 Studio 的 `loginUrl()` 跳账号中心，成员和 Relay 访问在账号中心的成员页管，Relay 只读。
- 认证：Better Auth client `baseURL` 为 `VITE_ACCOUNT_URL`。`getTrustedOrigins()` 加 `VITE_RELAY_URL`，auth 和 Studio 的 wrangler vars（prod 与 preview）和 `select-target.sh` 也加这个变量，auth 才会把用户送回 Relay。
- 模块从 `apps/studio/modules/{organizations,shared}` 复制需要的部分，第四次重复再抽到 packages。
- i18n scope `relay`，locale 集合与 Studio 相同。

验收：

- prod：在 Studio 已登录的浏览器打开 `relay.vesact.com` 直接是登录态；未登录跳到 `account.vesact.com/login`，登录后回到控制台原来的地址。
- preview：在 Studio preview 已登录的浏览器打开 `relay.preview.vesact.com` 直接是登录态。
- 创建 key 后 4.3 的脚本用它能过；吊销后 401。
- 组织 A 的用户看不到组织 B 的 key。

## 5. 整体验收

1. `curl -H "Authorization: Bearer $KEY" https://api.vesact.com/v1/me` 返回 key 与组织信息和限流头；无 key 401，超限 429，每次调用写一行用量。
2. `https://api.vesact.com/v1/openapi.json` 由 zod 契约生成，`/v1/docs` 能打开。
3. Meta 后台把 webhook 订到 `https://api.vesact.com/webhooks/meta`，握手通过，测试事件落库一行。
4. `https://relay.vesact.com` 用 Google 登录、切组织、建 key、吊销 key。
5. preview 在 Access 后面跑通同样四条，CI smoke 过。

## 6. 顺序

子 issue 在 #26 下：

1. #34 应用与部署（4.1）
2. #35 API key、`/v1` 中间件链、`/v1/me`、用量（4.2、4.3、4.4）
3. #36 OpenAPI 与文档（4.5）
4. #37 Meta webhook 接收（4.7）
5. #38 控制台（4.8）
6. #39 幂等（4.6）

#35 依赖 #34；#36、#37、#39 依赖 #35；#38 依赖 #34、#48 和 Studio 加上 `VITE_RELAY_URL`；#37 的最后一条依赖 A0。

## 7. 风险

- `BETTER_AUTH_SECRET` 两个 worker 必须同值，否则会话互不认。写进 secrets 的检查项。
- 插件限流每次校验写一次 key 行。单库扛不住时在前面加 Workers Rate Limiting binding，契约不变。
- Meta 一个 App 只能一个回调 URL，指向 prod；preview 只靠 curl 验证。
- `client.ts` 改导入是模板的六个缝之一，同步上游时留意。
