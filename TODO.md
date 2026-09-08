# TODO

具体待办在 [Issues](https://github.com/vesacthq/vesact/issues)。

这里只记触发式的事——它们没有开始时间，条件到了才做。做成 issue 会一直挂在列表里，反而看不见真正要做的东西。

| 事项                                                    | 触发点                              |
| ------------------------------------------------------- | ----------------------------------- |
| Durable Objects（WebSocket，`locationHint` 设 `apac`）  | 开写收件箱                          |
| TanStack DB 替换收件箱数据层                            | 开写收件箱                          |
| 拆 `packages/` 边界、独立产品的 api 包                  | 第二个产品                          |
| secrets 管理工具（Infisical / 1Password）               | 第二个人加入                        |
| `apps/saas` 改名、`.claude/` hooks                      | 断开模板上游之后                    |
| 断开模板上游                                            | 为保持可 merge 而不敢重构模板代码时 |
| CI 换 affected filter（`--filter=...[origin/main]`）    | app 数量明显变多                    |
| 量 Hyperdrive 与 neon-http 的差距，决定还要不要 pg 驱动 | 收件箱有真实查询负载后              |
| `db` 改成请求作用域，替掉 `maxUses` 和入口的动态 import | 上一行结论是留 pg，且断开模板上游后 |
