# 文档地图

日常推进靠对话和 issue。这里的文件是设计和决策的落点，供查证，不需要通读。

## 只看三处

- 现在在哪：#26 是 Relay A 轨的看板，进行中的子 issue 里有范围和验收。账号中心见 #45。
- 为什么这么定：decisions.md，倒序，每条只有结论和理由，过程在对应的 issue 里。
- 想核对某个设计：按下表找那一份，只读对应章节。

## 每个文件回答什么

| 文件                         | 回答的问题                                                           | 状态               |
| ---------------------------- | -------------------------------------------------------------------- | ------------------ |
| `decisions.md`               | 为什么这么定                                                         | 定稿，随 PR 追加   |
| `relay/overview.md`          | Relay 是什么，三个主机名各做什么                                     | 定稿               |
| `relay/engineering.md`       | Relay 的架构、原则、契约约定、参考资料。§0 是一页摘要                | 定稿               |
| `relay/skeleton.md`          | A1 的范围、验收、顺序                                                | 定稿，对应 #34–#39 |
| `relay/messaging.wip.md`     | 消息领域模型                                                         | 草稿，A2 产出      |
| `account/overview.md`        | 账号中心放什么、路由、每个操作在哪                                   | 定稿，已实现       |
| `studio/overview.wip.md`     | Studio 的定位、用户、分期                                            | 草稿               |
| `studio/vocabulary.wip.md`   | Studio 术语                                                          | 草稿               |
| `studio/architecture.wip.md` | Studio 的模块、导航、联动、数据规则                                  | 草稿               |
| `studio/site-map.wip.md`     | Studio 的页面结构                                                    | 草稿               |
| `design.wip.md`              | 视觉与组件规范                                                       | 草稿               |
| `reference/channels.md`      | 渠道平台的事实：广告到聊天的链路、Zernio 能做什么、App Review 看什么 | 事实，标核对日期   |
| `reference/research.md`      | 访谈和调研的结论                                                     | 事实               |

## 约定

- `.wip.md` 是草稿：用它的词，别从它推 schema 或计划。
- 事实进 `reference/`，决定进 `decisions.md`，范围与验收进 issue。一件事只在一处。
