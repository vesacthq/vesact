# 决策记录

倒序。只写结论和理由，过程在对应的 issue 里。

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
