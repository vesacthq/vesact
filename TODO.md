# TODO

## 按顺序

1. **CF 部署 `apps/marketing`** — 用 wrangler 手动跑通，验证 TanStack Start + Nitro 的 cloudflare preset。没有数据库依赖，适合先验证链路。
2. **Neon + Hyperdrive** — 用 Hyperdrive 保持 `pg` driver，不改 `packages/database/drizzle/client.ts`。区域选 `ap-southeast-1` 或 `ap-northeast-1`。
3. **CF 部署 `apps/saas`** — 依赖上面两步。环境变量三处各配各的：本地 `.env.local`、GitHub Actions secrets、`wrangler secret`。
4. **写 deploy workflow** — 手动跑通之后再自动化。

## 独立

- **Turbo Remote Cache** — 只影响 CI 速度，和部署无关，随时可做。需要 Vercel 账号。

## 触发式

到条件了再做，提前做是浪费。

| 事项 | 触发点 |
| --- | --- |
| Durable Objects（WebSocket，`locationHint` 设 `apac`） | 开写收件箱 |
| TanStack DB 替换收件箱数据层 | 开写收件箱 |
| 拆 `packages/` 边界、独立产品的 api 包 | 第二个产品 |
| secrets 管理工具（Infisical / 1Password） | 第二个人加入 |
| `apps/saas` 改名、`.claude/` hooks | 断开模板上游之后 |
| 断开模板上游 | 为保持可 merge 而不敢重构模板代码时 |
| CI 换 affected filter（`--filter=...[origin/main]`） | app 数量明显变多 |
