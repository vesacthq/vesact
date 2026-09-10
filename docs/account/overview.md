# 账号中心

一条规则：凡是脱离任何一个产品仍然存在的东西，放账号中心；需要产品数据才有意义的东西，放产品里。没有主产品，Studio 和 Relay 对称。进度在 #45 和它的子 issue。

## 1. 归属

| 在账号中心                                           | 在产品里                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| 身份：登录、注册、密码、passkey、两步验证、登录设备  | 产品数据                                                           |
| 个人：姓名、头像、邮箱、语言、通知偏好、删除账号     | 产品设置：Studio 的自动回复、收件箱配置；Relay 的 API key 与 scope |
| 组织：创建、名称与 logo、删除；onboarding            | 组织切换器                                                         |
| 成员：邀请、移除、组织角色、每个产品的访问和产品角色 | 产品内的资源权限：谁负责哪个收件箱、哪些渠道                       |
| 计费：套餐、发票、付款方式，按组织                   | 平台管理员的 admin 模块暂留 Studio                                 |

产品从共享库读组织和成员，只读。同一件事只在一处可改。

## 2. 应用与主机名

`apps/account`，worker `vesact-account`。prod `account.vesact.com`，preview `account.preview.vesact.com`，dev 端口 3004。它同时提供 Better Auth 端点，`VITE_ACCOUNT_URL` 是它的地址。`auth.vesact.com` 和 `auth.preview.vesact.com` 继续挂在账号 worker 上，301 到 account，保留一个季度。

路由：

| 路径                                                              | 内容                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `/login` `/signup` `/forgot-password` `/reset-password` `/verify` | 身份                                                           |
| `/onboarding`                                                     | 新用户第一步                                                   |
| `/account`                                                        | 资料；`/account/security`、`/account/notifications`            |
| `/orgs`                                                           | 组织列表与创建                                                 |
| `/orgs/$slug`                                                     | 名称、logo、删除；`/orgs/$slug/members`、`/orgs/$slug/billing` |
| `/invitations/$id`                                                | 接受邀请                                                       |
| `/checkout-return`                                                | 支付回跳                                                       |
| `/api/auth/*`、`/api/rpc/*`、`/api/webhooks/payments`             | Better Auth、oRPC、支付回调                                    |

## 3. 从 Studio 搬走的东西

| Studio 现在                                                      | 账号中心                                       |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| `settings/general`、`settings/notifications`、`settings/billing` | `/account`、`/account/notifications`、组织计费 |
| `$organizationSlug/settings/{general,members,billing}`           | `/orgs/$slug/*`                                |
| `new-organization`、`organization-invitation/$id`、`onboarding`  | `/orgs`、`/invitations/$id`、`/onboarding`     |
| `choose-plan`、`checkout-return`                                 | `/orgs/$slug/billing`、`/checkout-return`      |

账号 worker 挂 `@repo/api` 的 Hono app，头像上传的 oRPC 和存储绑定随之；`billingAttachedTo` 改为 organization。

## 4. 成员与权限的三层

| 层                 | 内容                                                              | 存在哪                                                         | 在哪管                       |
| ------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------- |
| 组织角色           | owner / admin / member                                            | Better Auth 的 `member.role`                                   | 账号中心成员页               |
| 产品访问与产品角色 | `studio:admin`、`studio:member`、`relay:admin`、`relay:developer` | 同一个 `member.role`，多角色逗号分隔；statement 按产品命名空间 | 账号中心成员页，每个产品一列 |
| 资源权限           | 收件箱归属、渠道分配、API key scope                               | 产品自己的表                                                   | 产品内部                     |

前两层用 Better Auth organization 的 access control 表达，第三层是产品的业务数据，由产品的权限规则结合前两层判断。

## 5. 导航与回跳

1. 从产品指向账号中心的链接带 `from=<绝对地址>`；账号中心每页右上角"返回"回 `from`，没有 `from` 回默认产品（Studio）。
2. 账号中心和产品同一套设计 token、同一个 Logo 和头部；标题 `<页面> – Vesact`。
3. 产品的"设置"菜单把账号中心条目列进去，视觉和站内条目一致；用户感知到的是设置的某一页。

验收：从 Studio 任意设置页进账号中心再点"返回"回到出发页；并排截图头部一致；本文 §1 的表每项只有一个位置。

## 6. 顺序

#46 改名与主机名 → #47 个人资料与通知、#48 组织与成员、#49 计费（可并行）→ #50 导航与回跳（贯穿，最后统一验收）→ #51 文档与清理。Relay 的 #38 依赖 #48。
