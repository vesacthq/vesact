# Relay

消息 API 平台：对海外开发者是产品，对 Studio 是渠道层。所有平台能力由 Relay 自己的应用直连各平台。

## 申请载体

审核看的是 Meta App ID，UI 不限。载体是 Relay 自己的控制台：连主页、看会话、发消息、发帖子、看广告账户，都是它本来要有的诊断页。组件从 Zernio 的开源客户端搬，不运行它们。见 engineering.md 1.4。

## API

六类：posting、comments、messaging、analytics、ads、comment to DM。契约用 oRPC 的 zod schema 定义，生成 OpenAPI。Studio 按同一套接口调用。

## 计费

按接入的账号收。价格在 #26 A6 定。

## 主机名

| 主机                    | 用途       |
| ----------------------- | ---------- |
| `relay.vesact.com`      | 控制台     |
| `api.vesact.com`        | API        |
| `developers.vesact.com` | 开发者文档 |
