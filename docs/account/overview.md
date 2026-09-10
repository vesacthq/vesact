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
| `/orgs`                                                           | 组织列表；`/orgs/new` 创建                                     |
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

前两层用 Better Auth organization 的 access control 表达（`packages/auth/lib/access.ts`），第三层是产品的业务数据，由产品的权限规则结合前两层判断。

`member.role` 存一个组织角色加每个产品至多一个角色，逗号分隔，例如 `member,studio:member,relay:developer`。组织的 owner 和 admin 天然拥有所有产品的全部权限，成员页对他们显示"全部权限"而不是下拉框；只有 member 需要逐个产品开通。`@repo/permissions` 解析同一个值（`parseMemberRoles`），产品用 `studio.access`、`relay.manage` 这样的规则判断；Studio 在进入组织前检查 `studio.access`，没有的成员看到指向账号中心成员页的提示。

## 5. 导航与回跳

1. 从产品指向账号中心的链接带 `from=<绝对地址>`；账号中心每页右上角"返回"回 `from`，按钮上写出产品名，没有 `from` 回默认产品（Studio）。账号中心内部的链接把 `from` 一路带下去。身份流程（登录、注册、onboarding）用 `redirectTo`：那是流程结束后要去的地方，不是返回。只认自家产品的地址，其他一律回 Studio。
2. 账号中心和产品同一套设计 token、同一个 Logo 和头部；标题 `<页面> – Vesact`。
3. 产品的"设置"菜单把账号中心条目列进去，视觉和站内条目一致；用户感知到的是设置的某一页。

验收：从 Studio 任意设置页进账号中心再点"返回"回到出发页；并排截图头部一致；下表每项只有一个位置。

| 操作                                    | 位置                              |
| --------------------------------------- | --------------------------------- |
| 登录、注册、找回密码、邮箱验证          | 账号中心 `/login` 等              |
| 改姓名、头像、邮箱、语言，删除账号      | 账号中心 `/account`               |
| 密码、passkey、两步验证、登录设备       | 账号中心 `/account/security`      |
| 通知偏好                                | 账号中心 `/account/notifications` |
| 新用户 onboarding                       | 账号中心 `/onboarding`            |
| 创建组织                                | 账号中心 `/orgs/new`              |
| 组织名称、logo、删除                    | 账号中心 `/orgs/$slug`            |
| 邀请、移除成员，组织角色，产品访问      | 账号中心 `/orgs/$slug/members`    |
| 接受邀请                                | 账号中心 `/invitations/$id`       |
| 套餐、付款方式、发票                    | 账号中心 `/orgs/$slug/billing`    |
| 切换当前组织                            | 产品的组织切换器                  |
| 产品内资源权限（收件箱、渠道、API key） | 产品自己的设置                    |
| 平台管理员管用户和组织                  | Studio 的 admin 模块（暂留）      |

## 6. 顺序

#46 改名与主机名 → #47 个人资料与通知、#48 组织与成员、#49 计费 → #50 导航与回跳 → #51 文档与清理。全部完成于 2026-09-11。Relay 的 #38 依赖 #48。
