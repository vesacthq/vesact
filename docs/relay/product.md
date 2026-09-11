---
status: final
reviewed: 2026-09-11
---

# Relay 产品

本文回答 Relay 做什么、给谁。怎么做见 architecture.md。

## 1. 定位与用户

消息 API 平台：对海外开发者是产品，对 Studio 是渠道层。所有平台能力由 Relay 自己的应用直连各平台。

```text
Vesact
├── Relay
│   面向开发者及需要独立使用渠道接入能力的用户
│   提供账号连接、统一 API、执行结果与事件通知
│
└── Studio
    面向普通用户的聚合应用
    使用 Relay 的渠道能力
    最终业务定位继续验证
```

Relay 可以有自己的控制台，用于连接账号、管理密钥、查看用量和诊断操作。它不等于纯后端项目，但也不应该因此长成另一个 Studio。

计费按接入的账号收。价格在 A6（#70）定。

## 2. 产品逻辑

### 2.1 API

六类：posting、comments、messaging、analytics、ads、comment to DM。业务顺序：Messaging → Publishing（含 comments）→ Analytics → Ads，comment to DM 随 Messaging。平台优先：Meta 系 → TikTok → Google。契约用 oRPC 的 zod schema 定义，生成 OpenAPI。Studio 按同一套接口调用。

### 2.2 申请阶段：控制台就是审核载体

申请各平台权限要一个用到全部权限的完整应用。审核看的是 Meta App ID，UI 不限，所以载体是 Relay 自己的控制台——连主页、看会话、发消息、发帖子、看广告账户，这些页面本来就是控制台的诊断页。Relay 的 API 从第一天就是自己的，不做 Zernio 形状的兼容层。

Zernio 的开源客户端（MIT）只搬组件，不运行：

| 仓库                                                         | 搬什么                                           | 栈                                 |
| ------------------------------------------------------------ | ------------------------------------------------ | ---------------------------------- |
| [unified-inbox](https://github.com/zernio-dev/unified-inbox) | 会话列表、消息气泡、模板与按钮消息、发送框       | Next.js 15、shadcn、TanStack Query |
| [latewiz](https://github.com/zernio-dev/latewiz)             | 发帖表单、日历、平台专属选项                     | Next.js 16、shadcn                 |
| [ads-dashboard](https://github.com/zernio-dev/ads-dashboard) | 广告账户与 campaign 表格                         | Next.js                            |
| [zernflow](https://github.com/zernio-dev/zernflow)           | 参考 comment to DM 的规则形态；带 Supabase，不搬 | Next.js 16 + Supabase              |

[openapi-specs](https://github.com/zernio-dev/openapi-specs) 是 13 个平台自己的 API 规范（Facebook、Instagram、TikTok…），写原生实现时用。

### 2.3 三个界面

| 界面       | 主机                    | 内容                                       |
| ---------- | ----------------------- | ------------------------------------------ |
| 控制台     | `relay.vesact.com`      | 连接账号、API key、用量、诊断              |
| API        | `api.vesact.com`        | `/v1`、平台 webhook、OAuth 回调            |
| 开发者文档 | `developers.vesact.com` | A1 阶段文档先挂在 `api.vesact.com/v1/docs` |

## 3. 边界

不接 Zernio 托管：所有平台能力由 Relay 自己的应用直连各平台，Zernio 的开源客户端只搬组件。

不重新选择 SaaS 模板，不迁移 Neon 到 D1，不重做现有认证和组织系统；不先实现完整 CRM、销售流程、AI 员工系统；不先做全部平台、全部权限、全部消息类型；不先建设微服务、插件市场、通用 Saga、事件溯源、动态 schema 引擎或自动供应商故障切换。

这些能力不是永久禁止，而是必须由明确需求和当前瓶颈驱动，不能作为“架构完整”的前置条件。

## 4. 术语

| 概念           | 含义                                                                |
| -------------- | ------------------------------------------------------------------- |
| **客户组织**   | 使用 Relay 的开发者或团队，优先映射到已有组织模型。                 |
| **代管客户**   | 开发者自己的终端企业；需要时增加轻量归属，不新建另一套认证体系。    |
| **Account**    | 可操作的渠道资产，例如 Facebook Page、IG 账号或 WhatsApp 业务号码。 |
| **Connection** | 授权关系、凭据、授予的权限、健康状态。一次授权可能关联多个资产。    |
| **Binding**    | Account 使用的接入实现、Connection 与外部资产引用之间的绑定。       |

直接使用 Relay 的客户可以映射到默认代管分组，不必把多层概念都强加给前端用户。

## 5. 分期

进度在 #26 和它的阶段 issue 里。

| 阶段 | issue | 内容                                                                                         |
| ---- | ----- | -------------------------------------------------------------------------------------------- |
| A0   | #64   | 外部流程：企业验证、Meta App、TikTok、法务页                                                 |
| A1   | #65   | 骨架：应用上线、API key、`/v1` 中间件链、OpenAPI、Meta webhook 落库、控制台、幂等（#34–#39） |
| A2   | #66   | 第一切片设计：Connections、Messaging，用 A1 收到的真实 payload 校验                          |
| A3   | #67   | 第一批权限：Messenger 与 Instagram 私信原生跑通，控制台收件箱，录屏提交                      |
| A4   | #68   | 分批申请：评论与 comment to DM、发布、广告                                                   |
| A5   | #69   | 企业验证通过后：WhatsApp Embedded Signup                                                     |
| A6   | #70   | 权限齐后：计费、租户与 API key 对外开放（#27）、Studio 换地址                                |

领域的第一轮范围：

| 领域           | 核心对象与问题                                          | 第一轮范围                       |
| -------------- | ------------------------------------------------------- | -------------------------------- |
| **Messaging**  | 会话、参与者、渠道身份、消息、附件、发送结果、回执。    | 实际设计并实现文字收发闭环。     |
| **Publishing** | 发布意图、平台目标、媒体、计划时间、各目标结果。        | 仅保留边界；聊天核心稳定后实施。 |
| **Analytics**  | 指标、维度、统计周期、数据新鲜度、来源和口径。          | 不提前建万能指标模型。           |
| **Ads**        | 广告账号、Campaign 与平台各级投放对象、审核和投放状态。 | 不把广告塞进 Post，不提前实现。  |

聊天先一个 Meta 通道，随后按实际需求补附件、回执和其他 Meta 通道；发布先立即发布，再多目标、定时和视频处理；分析先已有账号/内容的数据读取，再历史趋势；广告先只读，再有限可控写入，最后创建复杂投放。

平台优先级不等于每个平台必须实现四个领域。Google 本阶段默认考虑 YouTube 与后续 Google Ads，不自动加入 Gmail/Google Chat。TikTok 聊天要单独核实准入。
