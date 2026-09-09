# 决策记录

倒序。只写结论和理由，过程在对应的 issue 里。

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
- 不用 saas、Ember。

## 2026-09-09 第二个产品的形态

- Relay 是按 Zernio 的 API spec 做的消息 API 底座，同时是三样东西：卖给海外开发者的产品、Studio 的渠道层、Zernio 与自有 Meta 应用之间的路由器。
- 它的主路径是机器身份（API key、服务端调用），不走浏览器会话。原先的多产品共享登录规划（#25）因此关闭；剩余的部分拆到 #26（渠道层按 Zernio 接口抽象）和 #27（Relay 的身份、租户与通道模型）。
- 先用 Zernio 的通道把 Studio 做起来，同时申请自有 Meta 应用的权限。走 Zernio 期间不需要自己过 App Review。
- 平台资质申请与 Studio 的设计、开发并行，互不阻塞。

## 2026-09-09 认证拓扑

- 认证端点集中在 `auth.vesact.com`，会话 cookie 设在 `.vesact.com`，各产品共享同一个 Better Auth 实例和用户库。
- 登录方式：邮箱（magic link、密码）、passkey、Google。不做 GitHub。
