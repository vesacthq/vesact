# vesact

跨境卖家的社媒聊单产品 Studio，以及给它供渠道能力、也对外售卖的消息 API 平台 Relay。

| 目录             | 内容                                                   |
| ---------------- | ------------------------------------------------------ |
| `apps/account`   | 账号中心：登录、资料、组织、计费，`account.vesact.com` |
| `apps/studio`    | Studio，`studio.vesact.com`                            |
| `apps/marketing` | 官网，`www.vesact.com`                                 |
| `apps/docs`      | 开发者文档，留给 Relay                                 |
| `packages/*`     | 共享的 api、auth、database、ui 等                      |

```bash
docker compose up -d postgres
pnpm install
pnpm secrets:pull
pnpm dev
```

约定和环境见 [AGENTS.md](AGENTS.md)，产品文档见 [docs/](docs/)，决策见 [docs/decisions.md](docs/decisions.md)。
