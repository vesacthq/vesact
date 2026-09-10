# 渠道平台参考

截至 2026-09。

## 广告 → 聊天 → 回传

Meta 的 Click-to-WhatsApp / Messenger / Instagram 广告是一条闭环：

1. **广告**：Marketing API 建广告，入口只差 ad set 的 `destination_type` 和创意 CTA，一个 ad set 可同投三入口。计费只按曝光。优化目标二选一：按会话数（CONVERSATIONS），或按购买（OFFSITE_CONVERSIONS，需先回传成交，只对 WhatsApp 和 Messenger 有效）。
2. **聊天**：第一条入站消息带 `referral`。WhatsApp 有 `source_type`（ad / post）、`source_id`、`headline`、点击级 `ctwa_clid`；Messenger 和 Instagram 只有 `ad_id` 加广告素材。欢迎语里被点的 ice breaker 文案随消息进来。WhatsApp 从广告进来的会话，24 小时内回复即开 72 小时免费窗口。
3. **回传**：Conversions API for Business Messaging，`action_source=business_messaging`。标识：WhatsApp 用 `ctwa_clid`，Messenger 用 page_id + PSID，Instagram 用 IG 账号 ID + IGSID。点击后 7 天内有效。回传后 Meta 才能按购买找人。

来源应挂在平台身份或会话首条消息上，并保留 `ctwa_clid` / `ad_id` 原值。

## YCloud 的广告联动

- 广告在 Meta 或 TikTok 的 Ads Manager 里建，YCloud 不建广告。YCloud 做的是：连接广告账户，接住带广告来源的聊天，按规则回传，出报表。Google 标注 coming soon。
- 回传事件的触发方式三种：给联系人打指定标签、聊天里出现指定关键词、业务系统调 YCloud API 发自定义事件。
- Meta 只回传 `Purchase` 一种事件。未配置时默认把「客户发了第二条消息」当 Purchase 回传，用来喂优化。按购买优化要求每周 10 次以上转化。
- TikTok 默认回传 Conversation 事件，下层事件按规则开启。聊天里显示「From TikTok Ad ID: xxx」。
- 报表按广告看花费、曝光、点击、发起会话数、带来的联系人及其触发的事件，可导出。一次只能看一个广告账户。
- 坑：投 PC 端会丢广告参数，Reels / Stories 版位可能归因失败。

## Zernio 能否做整条链路

| 环节                            | WhatsApp                                       | Messenger                      | Instagram                      |
| ------------------------------- | ---------------------------------------------- | ------------------------------ | ------------------------------ |
| 建广告 `POST /v1/ads/messaging` | 是                                             | 是                             | 是                             |
| 聊天带归因（会话 metadata）     | `ctwa_clid`、`ctwa_source_id`、`ctwa_headline` | `meta_ad_id`、`meta_ad_source` | 同 Messenger                   |
| 回传                            | `POST /v1/whatsapp/conversions`                | 无                             | 无，Meta 本身也不按购买优化 IG |

- 建广告默认按会话优化，按购买优化的字段未暴露。
- Messenger / Instagram 回传无公开时间表，联系 support@zernio.com。
- Zernio 是 Meta Tech Provider，用其 Meta 应用授权，Studio 不用自己过 App Review。Meta 消息费直接扣用户 WABA。
- 相关能力 2026-08 上线，多次 breaking change。

## Meta App Review 看什么

审的是提交的 App ID 在用权限：录屏里的调用要出自自己的应用（开发模式下 Standard Access 即可跑通）。经第三方 Tech Provider 的应用发出的调用不算数。
