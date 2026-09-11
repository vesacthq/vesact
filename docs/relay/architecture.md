---
status: final
reviewed: 2026-09-11
---

# Relay 架构

本文回答 Relay 怎么做。定位、术语和分期见 product.md；每个阶段的范围与验收在 #26 下的 issue 里；为什么这么定见 ../decisions.md。§5.5 的 Messaging 领域是草稿。

## 1. 目标与约束

**不要重建应用底座。不要先做完所有领域设计。先完成一轮工程定型，再按真实业务闭环推进。**

第一轮交付目标：

> Relay 能在一个 Meta 渠道上完成真实的文字消息收发，保存自己的记录，查询操作结果，并能够定位和解释失败。

第一轮的成功不是“架构看起来完整”，而是：在现有 Vesact 工程里，Relay 的边界清楚、公开语义可解释、第一条聊天链路可靠可用。做到这里，就进入业务迭代。后续 Publishing、Analytics 和 Ads 复用已经被验证的基础，而不是继续为未来建设基础。

### 1.1 基建指什么

不是部署、数据库、登录页面或整套 SaaS 模板，而是 Relay 的公共业务基础：

| 公共支撑域        | 要解决的问题                                                    |
| ----------------- | --------------------------------------------------------------- |
| **Connections**   | 账号归属、渠道授权、连接状态、外部 ID、可用能力、接入实现选择。 |
| **Execution**     | 幂等、持久化任务、执行尝试、限流协调、重试和结果核实。          |
| **Events & Sync** | 入站事件处理、业务数据同步、自己的事件、客户 Webhook 投递。     |

这些支撑 Messaging，并在后续被 Publishing、Analytics、Ads 复用。复用来自真实业务，不是先设计一个可以连接任意 SaaS 的通用平台。

### 1.2 技术栈约束：继承现状，只补缺口

| 能力                | 决策                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **基础工程**        | 保留 Supastarter 改造版、Cloudflare 部署和 Neon，不换模板、不换数据库。                                    |
| **API 框架**        | 以仓库为准。仍使用 Hono/oRPC 就沿用；已改成其他实现，不为本文件迁回去。                                    |
| **契约与校验**      | 复用当前 schema 工具，明确导出 Relay 公共契约，生成 OpenAPI。                                              |
| **数据库与迁移**    | 复用当前 ORM、Neon 连接方式和迁移流程；需要事务的路径必须实际验证驱动能力。                                |
| **认证、组织、Key** | 复用现有机制，补业务归属校验，不另外部署认证平台。                                                         |
| **任务执行**        | 优先复用已存在方案；缺失时，CF Queues + Neon 持久化任务 + Cron 补偿是默认增量方案。 Execution 动工时定稿。 |
| **媒体**            | 复用当前存储；需要新建对象存储能力时优先评估 R2，不能假定已配置。                                          |
| **长流程**          | 到多步骤发布确实需要时再加入 Workflows，不给每条聊天消息套一个 Workflow。                                  |
| **协调与实时**      | 不默认为每个账号建 DO。遇到明确跨实例协调或实时连接问题时再设计。                                          |
| **测试与 SDK**      | 复用当前测试链，补真实 CF 环境验证、契约检查；对外需要时再生成客户端。                                     |
| **Effect**          | 暂不上全栈 Effect，也不自己仿造一套；将来只在具体执行模块验证收益。                                        |

新依赖要回答：它解决了当前哪个问题，现有工具为什么不够，带来了什么维护成本。不得把“库支持”当成“仓库已经集成”。

运行时限制、库版本和官方配置都以当期文档和 lockfile 为准。本文不要求升级到最新大版本。

API key、scope、限流、配额用 `@better-auth/api-key` 插件，用量记录自己一张表，计费到权限拿到后再接 `packages/payments`。

## 2. 上下文与主机名

```text
Studio / 外部开发者
        │
        ▼
Relay 公共契约：REST API + Webhook
        │
        ▼
领域用例：Connections / Messaging / 后续业务
        │
        ├── 归属与能力检查
        ├── 持久化、执行尝试与幂等
        └── 事件、同步与通知
        │
        ▼
领域接入契约
        │
        ├── Meta 实现
        └── 后续 TikTok / Google 实现
```

|        | prod                                                            | preview                                                                              | dev                                            |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Worker | `vesact-relay`                                                  | `vesact-relay-preview`                                                               | `pnpm --filter relay dev`，端口 3005           |
| 控制台 | `relay.vesact.com`                                              | `relay.preview.vesact.com`                                                           | `localhost:3005`                               |
| API    | `api.vesact.com`                                                | `api.preview.vesact.com`                                                             | `localhost:3005`                               |
| 认证   | `account.vesact.com`（`apps/account`），cookie 域 `.vesact.com` | `account.preview.vesact.com`，cookie 域 `.preview.vesact.com`，前缀 `vesact-preview` | `localhost:3004`，localhost 的 cookie 不分端口 |
| 数据库 | Hyperdrive `vesact-relay-db` → Neon `production`，查询缓存关闭  | Hyperdrive `vesact-relay-preview` → Neon `preview`，查询缓存关闭                     | docker postgres 5433                           |

一个 worker 每个环境挂两个 custom domain，按路径前缀分发：`/v1/*`、`/webhooks/*`、`/oauth/*` 进 Hono，其余进 TanStack Start 控制台。API 主机名上的非 API 路径返回 404 JSON，其他情况不看主机名。开发者文档 `developers.vesact.com` 启用前挂在 `api.vesact.com/v1/docs`。

三个环境的认证都由账号中心 `apps/account` 提供（../account/architecture.md），组织和成员也在那里管理，Relay 只读。Relay 不挂 Better Auth 的 handler，只在进程内用同一个 `packages/auth` 实例校验 key 和读会话；会话 cookie 设在环境的父域上，两个产品共享登录态。preview 能和 prod 同构，是因为 preview 主机名在 `preview.vesact.com` 下；`workers.dev` 在 Public Suffix List 上做不到这一点，preview 已经迁走。

## 3. 原则

后续决策的判断依据。

### 3.1 公共业务身份稳定，外部连接可以更换

Relay 使用自己的账号、会话、消息、发布和事件 ID。平台原生 ID 作为带作用域的外部引用保存。

更换接入实现，主要影响连接、映射和执行路径，不应迫使 API 客户更换整套业务接口。能够保持哪些历史关联，要以实际平台身份映射能力为准，不承诺无法验证的无感迁移。

### 3.2 统一高频语义，明确保留差异

公共内容与平台专属能力分开。不为了统一而削成最低能力公约数，也不把所有请求退化成任意 JSON。

不支持的关键能力应明确拒绝，或由调用者明确选择降级策略；不能悄悄丢弃字段后返回成功。

### 3.3 接受请求、下游接受、最终送达是不同事实

接口返回成功必须有明确含义。平台请求超时可能意味着结果未知，不等于确定未执行。业务操作与执行尝试分开，消息与投递回执分开，业务事件与 Webhook 投递分开。

### 3.4 自己保存必要业务记录，不做平台全量镜像

Relay 保存自己承诺提供的数据、执行状态与关联；不依赖查询时全部透传供应商。与此同时，不为未来可能的需求复制全部原始数据，也不承诺上游没有提供的历史或状态。

### 3.5 边界提前定，抽象从第二个真实实现中提炼

提前确定领域责任、归属、安全和公共契约约定。具体参数、限流方式和平台细节按业务逐步增加。

第一个平台暴露问题，第二个平台检验共性。不要先为十几个未接入平台写空接口。

### 3.6 按业务切片交付，不按技术层堆进度

避免：

```text
先建完全部数据库表 → 写完全部 Adapter → 写完全部 API → 最后整体联调
```

采用：

```text
一条业务契约
   → 权限与归属检查
   → 数据和执行状态
   → 平台调用或事件处理
   → 结果查询 / 客户通知
   → 故障测试与真实验证
```

每个里程碑都交付可演示、可验证的行为，而不是“目录已建好”“接口定义了几十个”。设计允许修正，但要指出新证据和影响，不能仅因为出现新工具就换方向。

## 4. 构件与目录

### 4.1 契约驱动的模块化单体

§2 的分层是代码组织方式，不要求拆成独立服务。HTTP、Queue consumer、Cron 等入口可以调用同一组用例；部署单元是否分开，服从现有结构和真实运行需要。

### 4.2 层的职责

| 部分               | 负责                                                    | 不负责                            |
| ------------------ | ------------------------------------------------------- | --------------------------------- |
| **入口层**         | 解析请求、认证、建立调用上下文、返回响应或接收事件。    | 平台专属调用流程和整套重试规则。  |
| **领域用例**       | 业务状态、资源归属、有效能力、操作规则、事务。          | 平台的原始字段格式。              |
| **执行与事件支撑** | 持久化工作、尝试记录、补偿、投递与诊断。                | 所有领域共用的万能状态机。        |
| **接入实现**       | 授权协议差异、请求转换、原生 API 调用、错误和事件转换。 | 套餐、组织成员、Studio 销售流程。 |

执行模块应依赖一个受控的派发接口或显式注册表，不要让各领域和执行器互相导入形成循环依赖。普通函数组合即可，不为此建立插件平台。

### 4.3 目录

```text
apps/
  relay/                              worker：API 入口、OAuth 回调、webhook、控制台页面
  studio/                             消费 Relay 的应用

packages/
  api/modules/relay/                  用例、契约（zod → OpenAPI）、接入实现
    connections/  messaging/  execution/  events/  integrations/meta/
  database/drizzle/schema/relay.ts    Relay 的表（含 Better Auth 的 apikey），由 index.ts 再导出
  ...已有 auth、ui、payments 等
```

Relay 的服务端代码先是 `packages/api` 里的一个模块，和 Studio 共用 auth、database、ui。有第二个消费方（外部 SDK、独立部署）再拆成 `packages/relay-*`。`packages/api/modules/relay/router.ts` 独立于 Studio 的 router。控制台模块从 `apps/studio/modules/{organizations,shared}` 复制需要的部分，第四次重复再抽到 packages。

### 4.4 依赖规则

公共契约不能导入数据库、密钥、CF 服务端 bindings 或平台 SDK。Studio 可以使用契约和客户端，但不能直接读写 Relay 业务表、调用平台 Adapter。

服务端领域依赖自己定义的接入能力，具体实现由运行入口组装。平台特有代码留在对应集成目录中，不散落到公共路由和 Studio 页面。

内部调用不必强制跨 HTTP，但必须进入同一应用服务边界，经过相同的归属、能力、状态和执行规则。不要把共享 package 当作绕过 Relay 的后门。

### 4.5 命名与变更约定

沿用仓库已有命名风格。原生字段命名限制在映射边界内。

一项功能的契约、实现、迁移和测试一起交付。不要维护两套人工同步的 OpenAPI；不要为了减少类型数量，让输入、输出和数据库行共用一个巨大 schema。

## 5. 运行时与契约

### 5.1 Connections：授权、资产与能力

概念见 product.md §4。归属上下文必须由服务端验证，不能信任请求里随意传入的组织或客户 ID。

能力检查分为：平台是否支持、当前接入实现是否实现、App 是否获准、用户实际授予什么、资产权限是否足够、当前操作条件是否允许。

先用代码能力定义和运行时检查解决，不建设动态 schema 系统。静态“支持发消息”不等于当前会话可以发送任意内容。

参考 Apideck Vault 的连接生命周期：创建、更新、可调用、暂停、删除、撤销是不同概念；这是边界参考，不是全量功能清单。[R4]

### 5.2 Execution：持久化意图与可解释的尝试

建议的最小出站流程：

```text
校验调用者、账号归属、参数、能力、幂等键
                  ↓
数据库事务：业务记录 + 待执行记录
                  ↓
投递 taskId，消费者领取并固定本次接入绑定
                  ↓
调用下游，记录尝试与外部引用
                  ↓
更新结果；必要时等待回执或进行核实
```

数据库是“Relay 已接收哪些工作、它们现在是什么状态”的事实来源；队列只是传递执行机会。不要在持久化前返回“已接受”，也不要把入队成功等同于业务成功。

待执行记录可以同时承担 outbox 的角色。是否拆表取决于实现需要，不为模式名称多造表。数据库提交后入队失败，由 dispatcher/Cron 补投；已经派发但长期未完成的任务也必须可诊断。

Cloudflare Queues 采用至少一次投递，且不保证顺序。因此消费者需要去重和领取控制；同一会话需要的发送顺序由应用明确保证。[R1][R2]

**任务租约到期不是安全重发的证据。**进程可能在下游成功、数据库尚未更新时中断。是否重试应依据操作性质和平台证据；无法确认时保留结果未知，不能把它自动归为可重试失败。

Stripe 的错误文档将某些服务端错误明确视为不确定结果；借鉴的是这个语义，不是把 Stripe 的幂等保证套到所有下游平台上。[R3]

此外，刷新凭据的竞争可能发生在同一个 Connection 下，不一定是一账号一把锁。API 入口限流、客户套餐额度、平台 App/账号/收件人限流分别处理，不用一个计数器混合表示。

### 5.3 Events & Sync：两种事件链分清

入站：

```text
验签与基本校验
    → 可靠接收
    → 映射账号与连接
    → 去重、规范化
    → 更新领域数据并可靠记录待发送事件
```

出站：

```text
Relay 事件
    → 找到有权接收的客户端点
    → 签名并投递
    → 保存投递尝试
    → 重试或人工恢复
```

不可靠接收就不要假装成功。单个上游请求包含多条事件时，要明确拆分和去重单位。重复消息回显、重复 webhook 和同一消息不同状态事件是不同情况。

不要仅以 `messageId` 去重所有事件，否则可能丢掉编辑、送达、已读等变化；使用上游事件身份及适用的事件类型、版本等建立规则。

同步第一版只做当前通道的初次读取、后续事件、必要补查、可见的覆盖范围和同步进度。连接前的历史私信不会经 webhook 到达，只接 webhook 不足以获得历史。

客户事件与投递尝试分开，重复投递保持稳定 event ID。事件入库与对应业务变更之间也要有可靠衔接，不能更新数据后因进程中断永久丢通知。参考 Svix 的投递、重试和恢复机制。[R7]

### 5.4 契约

#### 5.4.1 契约先于大规模实现，但与数据模型一起推敲

每条业务链先确定输入、输出、状态、错误、事件及实例，再补保存和执行方案。不要先建所有表再自动暴露，也不要只画接口而忽略执行可行性。

公共契约应独立于 Studio 的页面结构。OpenAPI 来自仓库中的契约事实来源；手写示例用于解释语义，不成为另一份需要人工同步的完整规范。契约用 zod，`.route({ method, path, summary, tags })`，`.errors({...})` 声明每个端点可能的错误码；`OpenAPIHandler` 前缀 `/v1`，`OpenAPIReferencePlugin` 出 `/v1/openapi.json` 和 `/v1/docs`。

#### 5.4.2 第一批资源候选

下表是资源边界示例，具体路径和命名需结合现有框架确认，不要求现在全部实现：

| 资源                       | 目的                                       |
| -------------------------- | ------------------------------------------ |
| Connect sessions           | 创建短期有效的渠道连接流程。               |
| Accounts / Connections     | 查看资产、健康状态、能力、重新授权与断开。 |
| Conversations / Messages   | 会话、历史、发送、结果查询。               |
| Media                      | 上传、归属与附件引用，到附件切片时实现。   |
| Webhook endpoints / Events | 配置通知、检查投递、重投。                 |
| Posts                      | 到发布阶段再增加。                         |

OAuth callback 和上游 Webhook 是专用入口，不与普通 API Key 请求混淆。不要默认把控制台管理接口全部导出为公共 API。

#### 5.4.3 契约共同约定

已定，A1 落成中间件和 helper，后续端点不另定默认值。参考附录 [R8]–[R12]。

| 事项               | 决定                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **认证与归属**     | `Authorization: Bearer <key>`；key 前缀 `relay_`，属于组织；Studio 服务端用自己组织的 key 调 `/v1`；浏览器不持有 key。                                                                                                                                                                                                                                                                           |
| **公共 ID**        | `<类型>_<ULID>`：`acct_`、`conn_`、`conv_`、`msg_`、`evt_`、`req_`；text 主键；不暴露供应商 ID 作为业务身份。                                                                                                                                                                                                                                                                                    |
| **请求与响应**     | JSON；输入、输出、PATCH 各自 schema；凭据和内部字段不进响应。                                                                                                                                                                                                                                                                                                                                    |
| **异步写入**       | 202 加资源本体，`status: "queued"`；结果查资源本身；结果未知返回 `RESULT_UNKNOWN`。                                                                                                                                                                                                                                                                                                              |
| **幂等**           | `Idempotency-Key`，只作用于 POST；不超过 255 字符；作用域 key + 路由；首个响应含 5xx 连状态码存 24h；同 key 同摘要回放原响应并带 `Idempotent-Replayed: true`；同 key 不同摘要 422 `IDEMPOTENCY_CONFLICT`；处理中 409 `IDEMPOTENCY_IN_FLIGHT`，不落库。                                                                                                                                           |
| **分页**           | `limit` 默认 50、上限 200；`cursor` 不透明 base64url；响应 `{ data, nextCursor }`，没有更多时 `nextCursor` 为 `null`。                                                                                                                                                                                                                                                                           |
| **错误**           | oRPC 错误体 `{ defined, code, status, message, data }`；每个响应带 `X-Request-Id`。内置码 `BAD_REQUEST`、`UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`CONFLICT`、`TOO_MANY_REQUESTS`、`INTERNAL_SERVER_ERROR`；自定义 `QUOTA_EXCEEDED` 429、`IDEMPOTENCY_CONFLICT` 422、`IDEMPOTENCY_IN_FLIGHT` 409、`RESULT_UNKNOWN` 502、`UPSTREAM_ERROR` 502 带 `data.platform` 和原样的 `data.platformError`。 |
| **限流**           | 每 key 固定窗口，默认 300 次/分钟；响应带 `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`（unix 秒），429 带 `Retry-After`。配额是独立计数，超出 `QUOTA_EXCEEDED`。                                                                                                                                                                                                            |
| **时间与数据覆盖** | RFC 3339 UTC，`Z` 结尾；`createdAt`、`receivedAt`、`occurredAt` 分开；列表接口说明覆盖范围。                                                                                                                                                                                                                                                                                                     |
| **扩展**           | 平台专属参数放 `platformParams.<platform>`；未知字段 `BAD_REQUEST`，不静默。                                                                                                                                                                                                                                                                                                                     |
| **版本与兼容性**   | 路径 `/v1`；新增字段和枚举值是兼容变更，写进 changelog；删改字段进 `/v2`。                                                                                                                                                                                                                                                                                                                       |
| **Webhook**        | Standard Webhooks：`webhook-id`（`evt_` ID，重投不变）、`webhook-timestamp`、`webhook-signature: v1,<base64 HMAC-SHA256("{id}.{timestamp}.{body}")>`；轮换期多个签名空格分隔；接收方按 5 分钟容差校时。                                                                                                                                                                                          |

#### 5.4.4 文字发送示例

以下只展示建议语义，不是已实现接口：

```http
POST /v1/conversations/conv_123/messages
Authorization: Bearer <relay_api_key>
Idempotency-Key: followup-001
Content-Type: application/json

{
  "content": {
    "type": "text",
    "text": "您好，想确认一下采购数量。"
  }
}
```

建议返回：

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "id": "msg_123",
  "conversationId": "conv_123",
  "status": "queued"
}
```

这里的承诺是“Relay 已持久化接收请求”，不是“消息已送达”。状态字段是否拆成提交状态与投递状态，在正式 schema 中决定；不能用一个模糊状态掩盖两者区别。

同一个幂等 key 与相同请求应关联同一业务操作，不因重试新增消息。客户端 key 在 Relay 生效，不代表下游天然具备同样的幂等保证。

平台独有能力使用明确、可验证的扩展结构。Merge 的 Supplemental Data 值得学习“原始数据、额外字段、原生操作”的边界，但本轮不实现任意带凭据 HTTP 代理。[R6]

### 5.5 Messaging 领域（草稿，A2 产出）

#### 必须先定的语义

**会话保持渠道内语义。**同一买家在 WhatsApp 和 IG 上联系，不自动合成一个 Relay 会话。跨渠道 CRM 客户合并留给 Studio。

**参与者与渠道地址分开。**内部客户身份、平台用户标识和联系地址不是同一概念。外部标识要保留平台/App/连接作用域，不能假定跨 App 通用。Twilio Conversations Classic 的参与者与 messaging binding 可作为建模参考，而不是全量复制对象。[R5]

**提交与投递分开。**本地已排队、下游接受、接收者送达、已读分别建模。不能把缺少回执表示为 `false` 或伪造成功，也不能让迟到事件机械覆盖更可靠的已知状态。

**渠道状态与业务工作流分开。**平台的已读回执属于 Relay 能力；销售负责人、内部备注、客户阶段，以及某个 Studio 员工是否查看过，属于上层应用。

**回复与主动发起分开考虑。**首轮可只做已有会话回复；契约不能永远假设必须先有会话。未来平台允许的首触达/模板消息单独设计并检查条件，不能默认任意平台可主动发信。

#### 领域模型

待写：租户与 API key 的归属链；connection、conversation、message、event 与 Relay 自己的 ID；状态；幂等；webhook 事件。资源和字段词汇以 Zernio OpenAPI 为草稿，取舍见附录 [R13]。

#### 契约

待写：zod schema 位置与生成的 OpenAPI。

## 6. 部署

每个环境一个 worker，两个 custom domain（§2 的表）。`wrangler.jsonc` 是 prod 加 `env.preview`；`server.ts` 照 Studio 做 Hyperdrive 延迟加载加路径分发。

- vars：`VITE_RELAY_URL`、`VITE_RELAY_API_URL`、`VITE_ACCOUNT_URL`、`VITE_STUDIO_URL`、`VITE_MARKETING_URL`、`META_APP_ID`；preview 段重新声明全部并加 `AUTH_COOKIE_PREFIX=vesact-preview`。cookie 域从 `VITE_ACCOUNT_URL` 推导，`getTrustedOrigins()` 读 Studio 和 marketing 的 URL。
- secrets：`secrets/relay.{prod,preview,dev}.env`，内容是同环境 `studio.*.env` 去掉 `S3_*` 的键（`BETTER_AUTH_SECRET` 必须同值）加 `META_APP_SECRET`、`META_WEBHOOK_VERIFY_TOKEN`。`pnpm secrets:pull` 同时产出 `apps/relay/.dev.vars`。
- CI：`deploy.yml` 的 `relay` job，`needs: account`，表由 account job 的 migrate 建；`select-target.sh` 给出 relay 的 URL；smoke 打 API 主机的 `/v1/health` 和控制台的 `/`，后者跟随重定向到账号中心登录页。
- Cloudflare：preview 的 Access 由 `*.preview.vesact.com` 通配应用覆盖，另有一个路径为 `api.preview.vesact.com/webhooks` 的 Access 应用，策略 Bypass Everyone，Meta 才打得到。Meta 一个 App 只能一个回调 URL，指向 prod；preview 只靠 curl 验证。
- `GET /v1/health` 无鉴权，返回 `{ "status": "ok" }`。

## 7. 横切

### 7.1 认证与归属

`/v1` 用 API key：`Authorization: Bearer <key>`，key 属于组织，由 `@better-auth/api-key`（`references: "organization"`、`defaultPrefix: "relay_"`）签发和校验。创建、吊销、列出走 Better Auth 的端点，需要会话且用户在该组织有 Relay 访问（`relay.access`，见 ../account/architecture.md §5）。端点在账号中心的 worker 上，控制台跨域调用；插件按组织 access control 的 `apiKey` statement 检查每个操作，`packages/auth/lib/access.ts` 把它授予 admin 和 `relay:*` 角色。控制台用账号中心的会话；未登录时照 Studio 的 `loginUrl()` 跳账号中心。成员和 Relay 访问在账号中心的成员页管，Relay 只读。

`/v1` 入口中间件链，顺序固定：request ID（`X-Request-Id: req_<ULID>`）→ 取 key → `verifyApiKey` 与错误码映射（`INVALID_API_KEY`、`KEY_NOT_FOUND`、`KEY_EXPIRED`、`KEY_DISABLED` → 401 `UNAUTHORIZED` 且 `data.reason` 保留原码；`RATE_LIMITED` → 429 `TOO_MANY_REQUESTS`；`USAGE_EXCEEDED` → 429 `QUOTA_EXCEEDED`）→ 上下文 `{ organizationId, apiKeyId, permissions, requestId }` 与 `relayKeyProcedure` → 限流头 → `waitUntil` 写用量（写失败只记日志）。`/v1` 不设 CORS 头。

### 7.2 安全与诊断

接触真实 token 前确认加密保存和密钥分离；OAuth 校验 state、回调与适用的 PKCE；Webhook 验签并限制负载；文件和客户 Webhook URL 做访问控制与 SSRF 防护，不能开放内网地址、元数据地址或任意凭据代理。

日志默认记录关联 ID、操作类型、耗时与脱敏错误，不默认保存完整聊天正文、token 或长期原始 payload。凭据、消息、附件、事件和日志都要有保留与清理规则；删除路径应覆盖映射、缓存及恢复后的清理策略。

不先做漂亮监控大屏，但至少能查看连接健康、操作记录、失败/未知任务和 Webhook 投递。要实际验证恢复路径，不能只声明“供应商有备份”。

目标用户网络下的 API、控制台和附件访问要在早期实测；不要未经测试先设计第二套国内外基础设施。

### 7.3 测试

测试按当前项目惯例放置，确保每个 Connector 有可找到的脱敏 fixtures 和行为测试。验收脚本进仓库。i18n scope `relay`，locale 集合与 Studio 相同。

跨切片最低验证矩阵：

| 场景                               | 期望行为                                   |
| ---------------------------------- | ------------------------------------------ |
| 客户 A 使用客户 B 的资源 ID        | 拒绝访问，不泄露资源详情。                 |
| 同幂等 key、同内容重复提交         | 关联同一业务操作；不新增发送意图。         |
| 同幂等 key、不同内容               | 返回稳定、明确的冲突错误。                 |
| 数据库提交后入队失败               | 任务可补投，不永久消失。                   |
| 队列重复投递                       | 不因重复消费而自动重复执行副作用。         |
| 下游已执行但本地未落结果           | 核实或结果未知，不盲目再发。               |
| Webhook 重复、乱序、提前于发送响应 | 能关联、去重或暂存待关联，不丢掉有效状态。 |
| 凭据过期/撤销、账号断开            | 明确状态，不无限刷新或无限重试。           |
| 客户 Webhook 超时                  | 重投同一事件，保留尝试记录，不重做业务。   |
| 历史覆盖不完整                     | 返回可解释限制，缺失不冒充空白事实。       |

### 7.4 每条切片的完成定义

- 契约、示例、状态和错误含义已明确，OpenAPI 与实现没有人工分叉。
- 所有资源引用都检查所属客户，敏感凭据与原始错误不泄露。
- 需要的迁移已通过项目既有流程，未擅自操作生产数据。
- 正常路径、明确失败、重复请求/事件和结果不确定路径有测试。
- 有运行环境测试结果；真实平台验证已完成，或明确列为阻塞而非默认为通过。
- 能通过 request/message/task/event 等关联 ID 定位执行过程。
- 本轮变更没有让 Studio 直接依赖平台实现或 Relay 数据库内部结构。
- 文档、测试与实现同批更新，剩余限制已经写明。

## 8. 风险

- `BETTER_AUTH_SECRET` 两个 worker 必须同值，否则会话互不认。写进 secrets 的检查项。
- 插件限流每次校验写一次 key 行。单库扛不住时在前面加 Workers Rate Limiting binding，契约不变。
- Relay 的 Hyperdrive 必须关闭查询缓存。插件先读 key 行再带条件更新，读到 60 秒内的缓存就会一直更新失败、重读缓存，直到缓存过期；吊销的 key 也会在缓存期内继续有效。Studio 和账号中心的配置保留缓存，两边不共用。
- Meta 一个 App 只能一个回调 URL，指向 prod；preview 只靠 curl 验证。
- `client.ts` 改导入是模板的六个缝之一，同步上游时留意。

## 附录：参考资料

一个具体问题对应一个参考。学习节奏：遇到设计问题 → 阅读对应部分 → 写下取舍 → 实现与测试。不先安排“读完所有优秀规范”的大任务。

| 当前问题           | 参考                              | 学什么                                                                                                                                                                    | 不照搬什么                                                                                                                                                                                 |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 授权与连接生命周期 | Apideck Vault [R4]                | 客户、连接、可调用状态、暂停与撤销的区别。                                                                                                                                | 完整 Integration Marketplace 和通用连接管理平台。                                                                                                                                          |
| 会话和参与者       | Twilio Conversations Classic [R5] | 参与者身份、渠道地址绑定、会话边界。                                                                                                                                      | 跨所有渠道自动合并会话，以及旧 API 参数风格。                                                                                                                                              |
| 平台差异           | Merge Supplemental Data [R6]      | 原始数据、字段扩展与原生操作的边界。                                                                                                                                      | 第一版动态表单和任意 Passthrough。                                                                                                                                                         |
| 幂等与不确定结果   | Stripe [R3]                       | 操作与尝试分开、不能仅凭 HTTP 错误重做副作用。                                                                                                                            | 把 Stripe 的实际保证宣称为所有平台的保证。                                                                                                                                                 |
| 客户 Webhook       | Svix [R7]                         | 事件与投递分开，失败记录、重投与恢复。                                                                                                                                    | 第一版自建完整 Webhook SaaS。                                                                                                                                                              |
| 后续指标和广告     | Meta/TikTok/Google 官方 API 文档  | 原生对象、指标定义、状态、限制和审核条件。                                                                                                                                | 同名指标直接合并，或把不同广告层级强行等同。                                                                                                                                               |
| 资源与字段词汇     | Zernio OpenAPI [R13]              | inbox / comments / posts / accounts / webhook 事件这几组的资源和字段：`deliveryStatus` 枚举、平台专用字段的命名与标注、事件名、错误码。它的字段经过 16 个平台的生产打磨。 | 信封、分页、ID 和 webhook 传输格式：719 个操作里分页 6 种写法、列表信封 5 种、`id`/`_id` 混用；消息 `id` 在列表里是平台 ID、在 webhook 里是内部 ID；签名没签时间戳。这些用 §5.4.3 的约定。 |

以下资料于 **2026-09-10** 核对，[R8]–[R13] 于 **2026-09-11** 核对。它们用于支持外部平台行为和领域参考，不代表本项目已经安装相关工具、拥有相关权限或完成实际联调。实现时应再次确认对应版本和当前权限。

| 标记  | 官方资料                                   | 用途                               |
| ----- | ------------------------------------------ | ---------------------------------- |
| [R1]  | Cloudflare Queues — Delivery guarantees    | 至少一次投递与消费者去重。         |
| [R2]  | Cloudflare Queues — How Queues Works       | 无顺序保证、队列角色与运行边界。   |
| [R3]  | Stripe — Advanced error handling           | 幂等、网络错误和结果不确定。       |
| [R4]  | Apideck — Vault OpenAPI                    | 连接与授权生命周期。               |
| [R5]  | Twilio Conversations Classic — Participant | 参与者与渠道绑定。                 |
| [R6]  | Merge — Supplemental Data                  | 通用模型、原始数据与原生扩展边界。 |
| [R7]  | Svix — Retry Schedule                      | 客户 Webhook 投递与恢复。          |
| [R8]  | Stripe — Idempotent requests               | 幂等语义。                         |
| [R9]  | Standard Webhooks — Specification          | 出站 Webhook 签名与头。            |
| [R10] | Meta — Graph API Webhooks: Getting Started | 握手、签名、重试与批量。           |
| [R11] | Meta — Messenger Platform Webhooks         | payload 结构、5 秒响应、乱序。     |
| [R12] | Better Auth — API Key plugin               | key 校验、限流、配额。             |
| [R13] | Zernio — OpenAPI 3.1 (`openapi.yaml`)      | 资源与字段词汇；见上表的取舍。     |

[R1]: https://developers.cloudflare.com/queues/reference/delivery-guarantees/ "Cloudflare Queues delivery guarantees"
[R2]: https://developers.cloudflare.com/queues/reference/how-queues-works/ "How Cloudflare Queues works"
[R3]: https://docs.stripe.com/error-low-level "Stripe advanced error handling"
[R4]: https://raw.githubusercontent.com/apideck-libraries/openapi-specs/main/vault.yml "Apideck Vault OpenAPI"
[R5]: https://www.twilio.com/docs/conversations-classic/api/conversation-participant-resource "Twilio Conversations Classic Participant"
[R6]: https://docs.merge.dev/merge-unified/supplemental-data/overview "Merge Supplemental Data"
[R7]: https://docs.svix.com/retries "Svix retry schedule"
[R8]: https://docs.stripe.com/api/idempotent_requests "Stripe idempotent requests"
[R9]: https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md "Standard Webhooks specification"
[R10]: https://developers.facebook.com/docs/graph-api/webhooks/getting-started "Graph API Webhooks getting started"
[R11]: https://developers.facebook.com/docs/messenger-platform/webhooks "Messenger Platform webhooks"
[R12]: https://www.better-auth.com/docs/plugins/api-key "Better Auth API Key plugin"
[R13]: https://zernio.com/openapi.yaml "Zernio OpenAPI"
