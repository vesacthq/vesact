---
status: final
reviewed: 2026-09-13
---

# 账号中心

本文回答账号中心放什么、怎么做。定位只有一条规则，写在 §1，没有单独的 product.md。实现进度在 #45 和它的子 issue，已全部完成；标（草稿）的段落是切分轨 #118 的目标形态。

## 1. 目标与约束

一条规则：凡是脱离产品仍然存在的东西，放账号中心；需要产品数据才有意义的东西，放产品里。（草稿）账号中心属于 Studio 单元；Relay 有自己的登录、组织和成员（../relay/architecture.md §2、§7.1），不经这里。

| 在账号中心                                               | 在产品里                                     |
| -------------------------------------------------------- | -------------------------------------------- |
| 身份：登录、注册、密码、passkey、两步验证、登录设备      | 产品数据                                     |
| 个人：姓名、头像、邮箱、语言、通知偏好、删除账号         | 产品设置：自动回复、收件箱配置               |
| 组织：创建、名称与 logo、删除；onboarding                | 组织切换器                                   |
| 成员：邀请、移除、组织角色、每个产品的访问和产品角色     | 产品内的资源权限：谁负责哪个收件箱、哪些渠道 |
| 计费：套餐、发票、付款方式，按组织                       |                                              |
| 平台管理：全部用户与组织，封禁、模拟登录、全局管理员角色 |                                              |

产品从共享库读组织和成员，只读。同一件事只在一处可改。

## 2. 上下文与主机名

`apps/account`。prod `account.vesact.com`，preview `account.preview.vesact.com`，dev 端口 3004。它同时提供 Better Auth 端点，`VITE_ACCOUNT_URL` 是它的地址。（草稿）prod 跑 Docker 目标，和 studio 同一台机器；worker `vesact-account-preview` 只剩 preview，见 §6。`auth.vesact.com` 和 `auth.preview.vesact.com` 继续挂在账号 worker 上，301 到 account，保留一个季度。

路由：

| 路径                                                                                           | 内容                                                           |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `/login` `/signup` `/forgot-password` `/reset-password` `/verify`                              | 身份                                                           |
| `/onboarding`                                                                                  | 新用户第一步                                                   |
| `/account`                                                                                     | 资料；`/account/security`、`/account/notifications`            |
| `/orgs`                                                                                        | 组织列表；`/orgs/new` 创建                                     |
| `/orgs/$slug`                                                                                  | 名称、logo、删除；`/orgs/$slug/members`、`/orgs/$slug/billing` |
| `/invitations/$id`                                                                             | 接受邀请                                                       |
| `/checkout-return`                                                                             | 支付回跳                                                       |
| `/admin/users`、`/admin/organizations`、`/admin/organizations/new`、`/admin/organizations/$id` | 平台管理，仅 `user.role = admin`                               |
| `/api/auth/*`、`/api/rpc/*`、`/api/webhooks/payments`                                          | Better Auth、oRPC、支付回调                                    |

## 3. 原则

1. 同一件事只在一处可改。
2. 从产品指向账号中心的链接带 `from=<绝对地址>`；账号中心每页右上角"返回"回 `from`，按钮上写出产品名，没有 `from` 回默认产品（Studio）。账号中心内部的链接把 `from` 一路带下去。身份流程（登录、注册、onboarding）用 `redirectTo`：那是流程结束后要去的地方，不是返回。只认自家产品的地址，其他一律回 Studio。
3. 账号中心和产品同一套设计 token、同一个 Logo 和头部；标题 `<页面> – Vesact`。
4. 产品的"设置"菜单把账号中心条目列进去，视觉和站内条目一致；用户感知到的是设置的某一页。

## 4. 构件与目录

`apps/account/modules/`：`auth`（会话、跳转规则）、`account`（个人资料、安全、通知）、`organizations`（组织、成员、邀请、产品角色）、`onboarding`、`payments`、`admin`（平台管理）、`i18n`、`shared`（头部、导航、oRPC 客户端）。别名见 `apps/account/tsconfig.json`。

账号 worker 挂 `@repo/api` 的 Hono app，头像上传的 oRPC 和存储绑定随之；`billingAttachedTo` 为 organization。

## 5. 运行时与契约

### 5.1 成员与权限的三层

| 层                 | 内容                                                                                    | 存在哪                               | 在哪管         |
| ------------------ | --------------------------------------------------------------------------------------- | ------------------------------------ | -------------- |
| 组织角色           | owner / admin / member                                                                  | Better Auth 的 `member.role`         | 账号中心成员页 |
| 产品访问与产品角色 | `studio:admin`、`studio:member`（草稿：切分收尾后取消前缀，`member.role` 只存组织角色） | 同一个 `member.role`，多角色逗号分隔 | 账号中心成员页 |
| 资源权限           | 收件箱归属、渠道分配、API key scope                                                     | 产品自己的表                         | 产品内部       |

前两层用 Better Auth organization 的 access control 表达（`packages/auth/lib/access.ts`），第三层是产品的业务数据，由产品的权限规则结合前两层判断。

`member.role` 存一个组织角色加每个产品至多一个角色，逗号分隔，例如 `member,studio:member`。组织的 owner 和 admin 天然拥有全部权限，成员页对他们显示"全部权限"而不是下拉框；只有 member 需要逐个产品开通。`@repo/permissions` 解析同一个值（`parseMemberRoles`），产品用 `studio.access` 这样的规则判断；Studio 在进入组织前检查 `studio.access`，没有的成员看到指向账号中心成员页的提示。

### 5.2 每个操作在哪

| 操作                                    | 位置                                            |
| --------------------------------------- | ----------------------------------------------- |
| 登录、注册、找回密码、邮箱验证          | 账号中心 `/login` 等                            |
| 改姓名、头像、邮箱、语言，删除账号      | 账号中心 `/account`                             |
| 密码、passkey、两步验证、登录设备       | 账号中心 `/account/security`                    |
| 通知偏好                                | 账号中心 `/account/notifications`               |
| 新用户 onboarding                       | 账号中心 `/onboarding`                          |
| 创建组织                                | 账号中心 `/orgs/new`                            |
| 组织名称、logo、删除                    | 账号中心 `/orgs/$slug`                          |
| 邀请、移除成员，组织角色，产品访问      | 账号中心 `/orgs/$slug/members`                  |
| 接受邀请                                | 账号中心 `/invitations/$id`                     |
| 套餐、付款方式、发票                    | 账号中心 `/orgs/$slug/billing`                  |
| 切换当前组织                            | 产品的组织切换器                                |
| 产品内资源权限（收件箱、渠道、API key） | 产品自己的设置                                  |
| 平台管理员管用户和组织                  | 账号中心 `/admin/users`、`/admin/organizations` |

## 6. 部署

| 环境    | worker                      | 主机                         | cookie                                          |
| ------- | --------------------------- | ---------------------------- | ----------------------------------------------- |
| prod    | Docker 目标（草稿）         | `account.vesact.com`         | 域 `.vesact.com`                                |
| preview | `vesact-account-preview`    | `account.preview.vesact.com` | 域 `.preview.vesact.com`，前缀 `vesact-preview` |
| dev     | `pnpm --filter account dev` | `localhost:3004`             | 无域，localhost 不分端口                        |

cookie 域从 `VITE_ACCOUNT_URL` 推导。secrets 在 `secrets/account.{prod,preview,dev}.env`。环境矩阵见 AGENTS.md，部署流程见 `.agents/skills/vesact-deploy-and-infra/SKILL.md`。

## 7. 横切

- 认证：Better Auth 只在这个 app 上挂 handler，Studio 共用同一个 `packages/auth` 实例读会话。Google OAuth 的回调是 `<VITE_ACCOUNT_URL>/api/auth/callback/google`。
- 权限：§5.1；平台管理路由要求 `user.role = admin`，组织的读改删走 `adminProcedure`。
- i18n scope `account`；`settings.menu` 等跨产品文案在 `shared`。
- 测试：`apps/account/e2e`（Playwright），`pnpm --filter account e2e`。

## 8. 风险

- `auth.vesact.com` 的 301 保留到 2026-12，之后从 wrangler 路由里移除。
