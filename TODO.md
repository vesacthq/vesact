# TODO

## 待办

- [ ] **CF 部署**：先用 wrangler 手动跑通 `apps/marketing`，验证 TanStack Start + Nitro 的 cloudflare preset，再写 workflow。marketing 没有数据库依赖，最适合先验证。
- [ ] **环境变量**：本地 `.env.local` / GitHub Actions secrets / `wrangler secret` 三处各配各的，不引入 secrets 管理工具。新增密钥时同步更新 `.env.local.example` 的键名。
- [ ] **Neon + Hyperdrive**：用 Hyperdrive 保持 `pg` driver，不改 `packages/database/drizzle/client.ts`。Neon 区域选 `ap-southeast-1` 或 `ap-northeast-1`。
- [ ] **Turbo Remote Cache**：需要 Vercel 账号。现在 CI 五个 job 各自 install，无跨 run 复用。
- [ ] **Durable Objects**：收件箱的 WebSocket 用 DO，`locationHint` 显式设 `apac`，否则会话对象可能创建在美西。

## 触发式

到条件了再做，提前做是浪费。

| 事项                                                 | 触发点                              |
| ---------------------------------------------------- | ----------------------------------- |
| secrets 管理工具（Infisical / 1Password）            | 第二个人加入                        |
| 拆 `packages/` 边界、独立产品的 api 包               | 第二个产品                          |
| TanStack DB 替换收件箱的数据层                       | 开写收件箱                          |
| 断开模板上游                                         | 为保持可 merge 而不敢重构模板代码时 |
| `.claude/` hooks                                     | 出现具体的重复痛点                  |
| CI 换 affected filter（`--filter=...[origin/main]`） | app 数量明显变多                    |

## 约定

- 自己的 skill 放 `.agents/skills/`，用模板不会用的名字。
- 产品代码只加不改模板文件。已知接缝：`packages/api/orpc/router.ts`、`packages/database/drizzle/schema/index.ts`、`apps/saas/modules/shared/components/AppSidebar.tsx`、`packages/permissions/definition.ts`。
- 模板同步用真正的 merge commit，不能 squash，否则 merge base 失效。
