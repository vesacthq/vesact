# vesact

两个产品：**Allcast**，跨境卖家的社媒聊单产品，`allcast.cc`（国内）与 `allcast.ai`（海外）；
**Vesact**，给它供渠道能力、也对外售卖的消息 API 平台，`vesact.com`。目录和包名还叫
`studio`、`relay`，改名在 #161、#162。

| 目录              | 内容                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `apps/studio`     | Allcast 产品，`app.allcast.cc`                                       |
| `apps/account`    | Allcast 账号中心：登录、资料、组织、计费，`app.allcast.cc/account`   |
| `apps/marketing`  | Allcast 官网，`www.allcast.cc`、`www.allcast.ai`                     |
| `apps/relay`      | Vesact 控制台与 API，`console.vesact.com`、`api.vesact.com`          |
| `apps/vesact-www` | Vesact 官网与法务页，`www.vesact.com`                                |
| `apps/docs`       | 开发者文档，留给 Vesact                                              |
| `packages/*`      | 共享的 api、auth、database、ui 等；`packages/relay` 是 Vesact 自己的 |

```bash
docker compose up -d postgres
pnpm install
pnpm secrets:pull
pnpm dev
```

约定和环境见 [AGENTS.md](AGENTS.md)，产品文档见 [docs/](docs/)，决策见 [docs/decisions.md](docs/decisions.md)。
