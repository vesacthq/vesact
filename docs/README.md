# 文档

日常推进靠对话和 GitHub。这个目录放设计和决策，供查证，不需要通读。公司和产品的上下文分三层：`docs/` 公开；`secrets/` 加密，因为仓库公开，需要时 `sops -d` 读；活数据（客户、会话、账目）在各自的系统里，仓库只记事实和指针。

## 现在在哪

- 看板：[github.com/orgs/vesacthq/projects/1](https://github.com/orgs/vesacthq/projects/1)。Board 视图四列 Backlog / Next / Now / Done，Now 全仓库只有一个。
- 命令行：`pnpm status`，从 issue 生成同一份状态：各轨道各阶段的进度、Now 的验收勾选、接下来的 issue、最近合并的 PR。
- 轨道 issue：#26 Relay A 轨（阶段 #64–#70），#118 架构切分，#45 账号中心（已完成）。交付项 issue 正文固定三节：范围、验收、依赖；验收是复选框，合并 PR 时勾。

## 四种文档

每个文件只回答一个问题，章节固定，同名章节在各产品里含义相同。

| 类型                    | 回答的问题   | 固定章节                                                                                                             |
| ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `<app>/product.md`      | 做什么、给谁 | 1 定位与用户 / 2 产品逻辑 / 3 边界 / 4 术语 / 5 分期                                                                 |
| `<app>/architecture.md` | 怎么做       | 1 目标与约束 / 2 上下文与主机名 / 3 原则 / 4 构件与目录 / 5 运行时与契约 / 6 部署 / 7 横切 / 8 风险 / 附录：参考资料 |
| `decisions.md`          | 为什么       | 倒序；每条是日期、结论、理由，取代了哪条                                                                             |
| `reference/<主题>.md`   | 外部事实     | 每条标核对日期                                                                                                       |

每个应用目录最多两份；定位一段话讲得完的只留 architecture.md。共享的视觉规范在 `shared/design-system.md`。AGENTS.md 是给 agent 的操作手册，不在这个体系里。

## 地图

| 文件                      | 状态                                                                             |
| ------------------------- | -------------------------------------------------------------------------------- |
| `decisions.md`            | 定稿                                                                             |
| `relay/product.md`        | 定稿                                                                             |
| `relay/architecture.md`   | 定稿；§5.5 Messaging 领域是草稿，A2 产出                                         |
| `account/architecture.md` | 定稿，已实现；prod 切到 `/account` 路径挂载在 #121                               |
| `studio/product.md`       | 草稿                                                                             |
| `studio/architecture.md`  | 草稿                                                                             |
| `shared/design-system.md` | 草稿                                                                             |
| `reference/channels.md`   | 事实：广告到聊天的链路、Zernio 能做什么、App Review 看什么                       |
| `reference/research.md`   | 事实：访谈结论                                                                   |
| `reference/meta.md`       | 事实：Meta 主体、应用、权限、资产、liaodan 残留、到期；凭据在 `secrets/meta.env` |

## 规则

1. 文件头是 frontmatter：`status: draft | final`、`reviewed: <日期>`。草稿的意思是：用它的词，别从它推 schema 或计划。草稿章节在文内标"（草稿）"，不单开文件。
2. 范围、验收、顺序只在 issue 里。文档不带任务清单。
3. 改行为的 PR 同时改文档。改了"为什么"就追加 decisions.md 一条。`reference/` 里超过核对日期的内容，用之前重新核对。
4. 单文件到 500 行为止，超了按它自己的章节号拆成同名目录，章节号不变。
5. 引用只用路径、章节号、issue 号。
