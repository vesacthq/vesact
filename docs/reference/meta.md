---
status: final
reviewed: 2026-09-11
---

# Meta

本文回答 Meta 这边我们有什么、缺什么、什么时候到期。凭据在 `secrets/meta.env`（键的含义见 §8），盘点原件整体加密在 `secrets/files/meta-inventory-2026-09-11.md.json`。来源：开发者后台、Business Suite、liaodan 生产库，2026-09-11 核对。

## 1. 主体与验证

| 项目                                 | 值                                                        |
| ------------------------------------ | --------------------------------------------------------- |
| 企业主体                             | 西安速准科技有限公司，Business Portfolio 2271258286970993 |
| 企业验证                             | 通过，首次 2026-07-16                                     |
| Tech Provider（Access verification） | 通过                                                      |
| 企业管理员                           | 一人                                                      |

## 2. 应用

一个应用，之前给 liaodan 用，现在给 Relay 用。App Review 的批准跟着 App ID 走，改名、改域名、改回调都不影响已批的权限。

| 项目             | 值                                                                              |
| ---------------- | ------------------------------------------------------------------------------- |
| 名称             | Vesact（旧称 聊单 AI）                                                          |
| App ID           | 2027645691445350                                                                |
| Instagram App ID | 1647747982987325，Instagram API with Instagram Login 用，有单独的 secret        |
| 状态             | 已上线（Live），Data Use Checkup 完成，无 required actions，速率限制用量 0%     |
| 用例             | WhatsApp、Instagram、Messenger、Facebook Login for Business；Marketing API 未加 |
| Embedded Signup  | 配置 ID 在 `secrets/meta.env`                                                   |
| Graph API 版本   | v25.0                                                                           |

账号下另有 7 个应用（Mutual AI agent、CEO Assistant、AI-CRM、Trenz、Mutual Fulfillment、Muutal dropshipping、Trenz - WABA 测试应用），与 Vesact 无关，未盘点。

## 3. 权限

Instagram 用的是 `instagram_business_*` 这一族（Instagram API with Instagram Login）。`instagram_*` 是经 Facebook Login 的另一族，两族名字不能互推。

| 权限                                       | 用途                                     | 状态                                                  | Relay 哪一步用 |
| ------------------------------------------ | ---------------------------------------- | ----------------------------------------------------- | -------------- |
| pages_show_list                            | 列出用户管理的 Page                      | 已批，2026-09-05 续期                                 | A3 连主页      |
| pages_manage_metadata                      | 订阅 Page 的 webhook，改 Page 设置       | 已批，续期                                            | A3             |
| pages_messaging                            | Messenger 收发                           | 已批，续期                                            | A3             |
| public_profile                             | 基本资料                                 | 已批，续期                                            | 登录           |
| instagram_business_basic                   | IG 专业账号资料与媒体                    | 已批，2026-09-05                                      | A3             |
| instagram_business_manage_messages         | IG 私信                                  | 已批，2026-09-05                                      | A3             |
| whatsapp_business_messaging                | WhatsApp 发消息                          | 已批，续期                                            | A5             |
| whatsapp_business_management               | WABA 资产管理                            | 已批，续期                                            | A5             |
| Human Agent（功能）                        | 24 小时窗口外的人工回复                  | 两次未批，第三次审核中（submission 2072236193652966） | A3             |
| business_management、pages_read_engagement | 现有 token 的 scope 里有，审核记录里没有 | 访问级别待核对                                        | —              |
| pages_manage_engagement                    | Page 评论                                | 未申请                                                | A4             |
| pages_manage_posts                         | Page 发帖                                | 未申请                                                | A4             |
| instagram_business_manage_comments         | IG 评论                                  | 未申请                                                | A4             |
| instagram_business_content_publish         | IG 发帖                                  | 未申请                                                | A4             |
| ads_read                                   | 广告报表                                 | 未申请，Marketing API 用例未加                        | A4             |

A3（#67）要的五个权限已经全部批了，A3 不用再提交审核。A4 的五个要申请。

审核历史：

| 提交       | 内容                               | 结果                                |
| ---------- | ---------------------------------- | ----------------------------------- |
| 2026-08-07 | Messenger、WhatsApp 六项 + IG 两项 | 六项批，IG 两项拒                   |
| 2026-08-24 | IG 两项 + Human Agent              | 全拒                                |
| 2026-09-05 | 同上 + 六项续期                    | IG 两项批，六项续期，Human Agent 拒 |
| 进行中     | Human Agent + 八项续期             | 审核中                              |

被拒原因没读出来，详情页超时。

## 4. 资产与 token

| 资产                            | ID                                                         | 用途             | token                                                 |
| ------------------------------- | ---------------------------------------------------------- | ---------------- | ----------------------------------------------------- |
| Facebook Page「Test-for-jl」    | 1251730184686445                                           | 测试主页         | page 与 user token，无固定过期，数据访问到 2026-11-24 |
| Facebook Page「Alexis B Dream」 | 107009547442726                                            | 旧项目的客户主页 | 同上，到 2026-12-04                                   |
| Instagram「jinl0ng」            | 17841405431079020，BUSINESS                                | 测试 IG 账号     | 2026-10-24 到期，过期要重新授权                       |
| WhatsApp 测试号 +1 555-180-1326 | phone 1128133840393568，WABA 4456826761304981（测试 WABA） | 测试             | system user token，无过期；quality GREEN，TIER_250    |

两个 Page 当前订阅的字段：messages、message_deliveries、message_echoes、message_reads、standby、messaging_handovers、messaging_referrals、messaging_postbacks。IG 订阅 messages、messaging_seen。

这些 token 在 A3 的 OAuth 做出来之前用来手工测试。

## 5. 旧项目残留（liaodan）

liaodan 是上一个产品，要关掉；应用保留。下面这些从 liaodan 改成 Relay：

| 项目                                  | 现在                                                    | 改成                          | 什么时候                             |
| ------------------------------------- | ------------------------------------------------------- | ----------------------------- | ------------------------------------ |
| 隐私政策、服务条款、数据删除 URL      | liaodan.ai/privacy、/terms、/data-deletion              | vesact.com 的三页             | A0 法务页做好后；关 liaodan 前必须改 |
| Site URL、联系邮箱                    | liaodan.ai、work@liaodan.ai                             | www.vesact.com、vesact 的邮箱 | 同上                                 |
| Messenger、IG、WhatsApp 的 webhook    | liaodan.ai/bot、/webhooks/instagram、/webhooks/whatsapp | api.vesact.com/webhooks/meta  | #37                                  |
| Facebook Login 与 IG OAuth 回调       | liaodan.ai/instagram/callback 等                        | api.vesact.com/oauth/…        | A2、A3                               |
| 两个 Page、IG 账号、WhatsApp 号的订阅 | 指向 liaodan                                            | Relay 接手后重新订阅          | A3                                   |
| liaodan 生产服务器与数据库            | 存着上面的 token                                        | 已抄到 `secrets/meta.env`     | 关机时不用再取                       |

顺序：vesact.com 法务三页 → 改应用的 URL 与邮箱 → Human Agent 审核结束 → Relay 的 webhook 上线 → 关 liaodan。审核进行中改 URL 没有问题，但审核员会打开网站，liaodan.ai 至少活到这次审核结束。

## 6. 到期与提醒

| 日期       | 事项                                                         |
| ---------- | ------------------------------------------------------------ |
| 待定       | Human Agent 审核结果                                         |
| 2026-10-24 | IG token 到期；A3 的 OAuth 没好就要在 liaodan 上重新授权一次 |
| 2026-11-24 | Test-for-jl 的数据访问到期，用户重新登录即续                 |
| 2026-12-04 | Alexis B Dream 同上                                          |
| 每年       | 已批权限要续期，续期跟着 Data Use Checkup                    |

## 7. 未核对

Facebook Login 的回调白名单、后台各 webhook 配置页、App roles 名单、Alert Inbox 的 5 条、三次被拒的原因。用到时再查。

## 8. `secrets/meta.env` 的键

| 键                                                     | 是什么                                                    |
| ------------------------------------------------------ | --------------------------------------------------------- |
| `META_APP_ID`、`META_APP_SECRET`                       | 主应用。Messenger、WhatsApp 共用                          |
| `META_INSTAGRAM_APP_ID`、`META_INSTAGRAM_APP_SECRET`   | Instagram Login 用的应用                                  |
| `META_WHATSAPP_CONFIGURATION_ID`                       | Embedded Signup 配置                                      |
| `META_GRAPH_API_VERSION`                               | 当前 v25.0                                                |
| `LIAODAN_*_VERIFY_TOKEN`                               | liaodan 各 webhook 的握手 token；Relay 上线时自己生成新的 |
| `META_PAGE_TOKEN_<pageId>`、`META_USER_TOKEN_<pageId>` | §4 两个 Page                                              |
| `META_INSTAGRAM_TOKEN_<igId>`                          | §4 的 IG 账号                                             |
| `META_WHATSAPP_SYSTEM_USER_TOKEN`                      | §4 的测试号                                               |

Relay 部署时（#34）把 `META_APP_ID`、`META_APP_SECRET` 抄进 `secrets/relay.<target>.env`，`META_WEBHOOK_VERIFY_TOKEN` 新生成。
