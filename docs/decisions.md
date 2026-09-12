# 决策记录

倒序。只写结论和理由，过程在对应的 issue 里。

## 2026-09-13 账号中心挂在 Studio 主机名的 /account 路径下

- 账号中心仍是独立的应用和进程，对外挂在 `studio.<域名>/account/*`：Docker 目标里 Caddy 按路径分发到两个容器，Worker 目标里用 Workers 路由。cookie 只在主机名上，跨子域 cookie 那套（`crossSubDomainCookies`、父域推导、preview 的 cookie 前缀）去掉；`from`、`redirectTo` 成为同源路径。`account.<域名>` 和 `auth.<域名>` 主机名退役，不做 301。取代 2026-09-09「认证拓扑」里会话 cookie 设在 `.vesact.com` 和 2026-09-11「Relay API 约定与骨架」里 preview cookie 域与前缀的安排。
- 理由：账号中心只服务 Studio 后，两个主机名唯一剩下的效果是用户在登录和设置页之间跳主机名。路径挂载用一条代理规则消掉这个跳转，代码边界和独立进程都不动；将来有第二个产品，同一个应用再挂到它的主机名下即可，登录态要跨产品共享时再回到父域 cookie，那是配置。没有用户，主机名直接退役。

## 2026-09-13 Relay 独立：自己的包、库和登录

- Relay 的服务端代码、schema、迁移和 Better Auth 实例收进一个包 `packages/relay`（`@repo/relay`，子路径 `api`、`auth`、`db`、`contract`）。`apps/relay` 和这个包只依赖 `@repo/ui`、`@repo/utils`、`@repo/i18n`、`@repo/logs` 四个纯库，lint 规则挡住其他 `@repo/*`。自己的 Neon 项目和 Hyperdrive；Better Auth 的 handler 挂在 relay worker 上（Google、organization、apiKey），cookie 只在控制台主机名上，控制台自带登录、建组织、邀请成员页。账号中心从此只服务 Studio。取代 2026-09-11「Relay API 约定与骨架」里三个环境都用 Studio 的 auth、「Relay 定稿的几项」里服务端先放 `packages/api/modules/relay`、「账号中心」里 Studio 和 Relay 对称、2026-09-09「认证拓扑」里各产品共享同一个 Better Auth 实例和用户库，以及 2026-09-10「Relay 的架构基线」里认证复用现有机制那一行。
- 理由：Relay 是卖给开发者的平台，Studio 是它的第一个客户；客户和平台共用一张用户表，是 Studio 换地方部署时唯一绕不开的耦合。Relay 的身份需求只有开发者登录、组织、key、按账号计费；账号中心里的 onboarding、产品角色、按渠道计费都是卖家的事。分开后 `member.role` 不再需要产品前缀。数据不迁：A1 的库里只有内部的 key，新库重跑 A1 验收。落地在 #118。

## 2026-09-13 Studio 是 Relay 的一个客户组织

- 每个 Studio 部署在 Relay 里是一个组织、一把 key，Zernio 的模型：所有卖家的渠道挂在这个组织下，Relay 按接入账号向 Studio 计费，Studio 按渠道向卖家计费。渠道带 `externalId`（Studio 侧的组织 id），连接会话带回跳地址，webhook 带渠道 id；卖家之间的隔离由 Studio 做，Relay 不知道卖家。
- 理由：Relay 的限流和配额按套餐给客户配，用量按接入账号记，都不需要按卖家。每个卖家一个 Relay 组织要一套代建端点和影子组织，换来的隔离 Studio 本来就有。一把 key 管所有渠道和 Stripe 的 secret key 是同一类风险，key 只在 Studio 服务端。

## 2026-09-13 Studio 单元两个构建目标

- Studio 单元指 studio 和 account 两个 app；marketing 同样处理，但单独部署。每个 app 两个构建目标：Worker（`@cloudflare/vite-plugin`）和 Docker（Node 入口）。正式版跑 Docker 目标：先在海外 VPS，域名不变，橙云指向它；备案后搬腾讯云。Cloudflare 上的 Worker 部署降为 preview，CI 每个 PR 两个目标都构建。库沿用 Neon production，搬腾讯云时再换。VPS 部署用 compose，GitHub Actions 推镜像后经 SSH 更新，不上 Coolify 一类的平台。
- Docker 目标只用两个目标都有的东西：后台任务和定时走 Postgres 的 job 表，实时走 SSE，媒体走 S3 接口；Durable Objects、Queues、Workflows 留给 Relay。
- 理由：面向大陆卖家的 Studio 最终在国内，Docker 目标现在就跑正式流量，搬机器时只换目标机；Worker 目标留在 CI 里，Studio 就不会长出 Workers 跑不了的依赖。Neon 不动是因为过渡期没有真正的数据迁移。
- 国内入口不再靠优选 CNAME，取代 #96 的方案。备案用哪个域名（新注册 `vesact.cn`，或把 `vesact.com` 从 Cloudflare Registrar 转出）在搬腾讯云前定，倾向前者：不用转出、`.com` 不进备案义务、两个 Studio 部署不争同一个主机名。

## 2026-09-11 Hyperdrive 不缓存查询

- 四个 Hyperdrive 配置（`vesact-db`、`vesact-preview`、`vesact-relay-db`、`vesact-relay-preview`）都关闭查询缓存。只有出现能忍旧数据的热读时，再加一个带缓存的配置，只让那条查询走它。
- 理由：Hyperdrive 默认缓存只读查询 60 秒，写入不使缓存失效，也没有按查询绕过的手段，官方给的办法就是两个 binding 按查询路由。我们的读几乎都经 Better Auth 和 Drizzle 的同一个 `db`，而且都要求写后立即可见：建组织后列表 30 秒仍为空，Relay 的 key 计数在缓存期内空转、吊销的 key 继续有效。Hyperdrive 的价值在连接池，不在这层缓存。

## 2026-09-11 文档与进度的机制

- 文档按回答的问题分四类，章节固定：`<app>/product.md`（做什么、给谁）、`<app>/architecture.md`（怎么做，arc42 裁剪的 8 节）、`decisions.md`（为什么）、`reference/`（外部事实，标核对日期）。状态写在 frontmatter（`status: draft | final`、`reviewed`），取代 `.wip.md` 后缀；草稿章节在文内标，不单开文件。范围、验收、顺序只在 issue 里，文档不带任务清单。规范和地图在 docs/README.md。
- 进度只在 GitHub：轨道 → 阶段 → 交付项三层 issue 用 sub-issue 挂接；GitHub Project「Vesact」是视图层，Status 四列 Backlog / Next / Now / Done，Now 全仓库只有一个；`pnpm status` 从 issue 生成当前状态。
- 理由：原先按体裁命名的文件（overview、skeleton、engineering）把同一问题散在几处，状态编码在文件名里，进度写在文档里必然过期。调研了 arc42、Diátaxis、MADR、Oxide RFD、Google design doc 和 docs-as-code，取"按问题分类、固定章节、状态是元数据、文档随代码走 PR"四条，舍弃编号归档，git 历史就是归档。不上 Linear：一个人的项目不值第二个系统。

## 2026-09-11 平台管理搬入账号中心

- Studio 的 admin 模块（全部用户与组织：封禁、模拟登录、全局管理员角色，组织的增删改）搬到账号中心 `/admin/*`。Studio 侧栏保留 Admin 入口，是带 `from` 的外链。
- 理由：用户表和组织表脱离任何产品存在，按账号中心的归属规则本就该在那里；留在 Studio 时组织的增删改有两处入口，违反"同一件事只在一处可改"。搬完后归属表没有例外。组织的读、改、删走 `adminProcedure`（`admin.organizations.find / update / delete`），Better Auth 的组织端点要求调用者是成员，全局管理员通常不是；删除前照 auth hook 的做法取消该组织的订阅，保留 slug 的检查也在 procedure 里重做一遍。

## 2026-09-11 账号中心

- 凡是脱离任何一个产品仍然存在的东西放账号中心（`apps/account`，`account.vesact.com`）：身份、个人资料、组织、成员与每个产品的访问和角色、计费。产品只留产品设置和产品内的资源权限，组织和成员只读。这条取代上一条里"组织、成员在各产品里"的说法。
- 理由：两个产品对称，没有谁去谁家里管成员的问题；账号中心里全是低频的设置操作，每天干活的界面永远在产品内；一条规则决定新功能放哪。Google、Atlassian、Microsoft 是这个形状，Vercel 是把账号中心塞进主产品的简化版。
- 不做单一壳应用：Relay 要作为独立产品卖给开发者，有自己的域名和品牌。
- 用户不迷惑的三条：同一件事只在一处可改；入口在产品的设置菜单里且视觉一致；每个链接带 `from`，做完回原页。方案见 docs/account/architecture.md。

## 2026-09-11 身份与租户的边界

- 登录、注册、找回密码、邮箱验证、个人安全设置在独立的 auth 应用（后改名 `apps/account`，见上一条），它同时提供 Better Auth 端点。产品自己不带这些页面，未登录跳它的 `/login?redirectTo=…`，登录完跳回；日常操作不换域名。
- 组织、成员、邀请、角色、权限在各产品里。组织跨产品共享，产品是组织上的开通项；角色带产品前缀（`studio:admin`、`relay:developer`），权限 statement 按产品命名空间，用 Better Auth 的 access control。对应 Atlassian 的三层：组织成员、产品访问、产品内权限。
- 没有 `redirectTo` 时登录后去 Studio。

## 2026-09-11 Relay API 约定与骨架

- 约定值在 relay/architecture.md §5.4.3，范围与验收在 #34–#39。几个取舍：限流头用 `X-RateLimit-*`，IETF 的 `RateLimit` 结构化头仍是草案；幂等按 Stripe 的语义，IETF 草案已过期；出站 webhook 用 Standard Webhooks，客户各语言有现成校验库。
- preview 迁到 `*.preview.vesact.com`（`studio.preview`、`account.preview`、`www.preview`），cookie 域 `.preview.vesact.com`，Better Auth cookie 前缀 `vesact-preview`，防止和 prod 的 `.vesact.com` cookie 互相遮蔽；一个 Access 通配应用覆盖全部。理由：`workers.dev` 在 Public Suffix List 上，两个 preview worker 之间无法共享登录态，Relay 一上来就会撞上；preview 和 prod 同构后，Relay 三个环境都用 Studio 的 auth，不用自己挂。
- Relay 的表（含 Better Auth 的 `apikey`）放 `schema/relay.ts`，`client.ts` 改为导入 schema index；`postgres.ts` 不动。

## 2026-09-11 Relay 定稿的几项

- 不接 Zernio 托管，所有平台能力由 Relay 自己的应用直连各平台；开源客户端只搬组件。
- 主机名：`relay.vesact.com` 控制台、`api.vesact.com` API、`developers.vesact.com` 文档。
- 计费按接入的账号收。
- A 轨先骨架后领域设计：租户链、限流、配额、用量、OpenAPI、webhook 落库都只依赖租户模型，先把最薄的一条链路跑到线上；conversation / message 等领域模型在第一个切片前设计，用真实 webhook payload 校验。
- 代码位置：`apps/relay` 是 worker 和控制台，服务端逻辑先放 `packages/api/modules/relay`，有第二个消费方再拆包。
- Studio 文档拆成 overview（定位、用户、产品逻辑、边界、分期）和 architecture（模块、导航、联动、数据规则）。

## 2026-09-10 Relay 的架构基线

- 契约驱动的模块化单体；沿用现有框架、ORM、认证、部署和测试工具，缺什么补什么。普通 TypeScript 组织业务，暂不全栈引入 Effect，也不引入新的通用集成或任务平台。任务执行缺失时，CF Queues + Neon 持久化任务 + Cron 补偿是默认增量方案，Execution 动工时定稿。
- 理由：第一轮目标是一个 Meta 渠道上的文字收发闭环，底座已经在 Cloudflare 和 Neon 上跑着；新依赖要回答解决了哪个当前问题。全文见 relay/architecture.md。

## 2026-09-10 Relay 申请阶段的载体

- 审核载体是 Relay 自己的控制台，不运行 Zernio 的开源客户端，只搬它们的组件（MIT）。理由：Meta 只认 App ID；那些页面本来就是控制台要有的；不用先做一层 Zernio 形状的兼容 API 再换掉。
- API key、scope、限流、配额用 `@better-auth/api-key`，A1 就上；计费等权限齐了再接。
- 设计规范放 `docs/shared/design-system.md`（当时是 `docs/design.wip.md`），组件层用 ReUI。

## 2026-09-10 Relay 的范围

- 第一版是壳：Zernio 开源的 inbox、ads、数据分析拼成一个应用，先拿去过各平台审核，再长成 API 产品。
- API 按 Zernio 分六类：posting、comments、messaging、analytics、ads、comment to DM。
- 文档分目录：`docs/studio`、`docs/relay`、`docs/reference`，草稿用 `.wip.md` 后缀。

## 2026-09-10 模板上游

- 已从 supastarter 模板分叉：目录改名，模板文件随意改，不再 merge。
- 上游只 cherry-pick 依赖和安全更新。进度用 `template-reviewed` tag 记，操作见 AGENTS.md 的 Template sync。

## 2026-09-10 环境与 secrets

- dev、preview、prod 三套环境对每个 app 同构，定义见 AGENTS.md 的 Environments & deployment。
- preview 用固定的 workers.dev 地址，由 Cloudflare Access 保护，CI 用 service token 通过。
- 所有 secret 用 sops + age 加密提交在 `secrets/`，仓库外只有 age 私钥。GitHub secrets 只有 `SOPS_AGE_KEY` 和 `TURBO_TOKEN`。
- 生产和 preview 的 migration 由部署流水线在发布前执行，不再手动 `push`。

## 2026-09-09 命名

- 第一个产品叫 Studio：`apps/studio`、worker `vesact-studio`、`studio.vesact.com`。
- 第二个产品叫 Relay。主机名待定，倾向 `api.`、`console.`、`developers.vesact.com`。

## 2026-09-09 第二个产品的形态

- Relay 是按 Zernio 的 API spec 做的消息 API 底座，同时是三样东西：卖给海外开发者的产品、Studio 的渠道层、Zernio 与自有 Meta 应用之间的路由器。
- 它的主路径是机器身份（API key、服务端调用），不走浏览器会话。原先的多产品共享登录规划（#25）因此关闭；剩余的部分拆到 #26（渠道层按 Zernio 接口抽象）和 #27（Relay 的身份、租户与通道模型）。
- 先用 Zernio 的通道把 Studio 做起来，同时申请自有 Meta 应用的权限。走 Zernio 期间不需要自己过 App Review。
- 平台资质申请与 Studio 的设计、开发并行，互不阻塞。

## 2026-09-09 认证拓扑

- 认证端点集中在一个独立主机名上（当时定为 `auth.vesact.com`，后改为 `account.vesact.com`），会话 cookie 设在 `.vesact.com`，各产品共享同一个 Better Auth 实例和用户库。
- 登录方式：邮箱（magic link、密码）、passkey、Google。不做 GitHub。

## 2026-09-02 UI 组件库

- 底座 shadcn（base-vega registry）+ Base UI；后台重件（data grid、filters、表单、日历）用 ReUI 免费层。
- 营销页 blocks 买 shadcnblocks Pro；后台 blocks 需求成片时再买 ReUI Pro。
- 不引入第二套体系：HeroUI Pro、Untitled UI、Tailwind Plus 不买。coss ui、Kibo UI 按需抄源码自管。
