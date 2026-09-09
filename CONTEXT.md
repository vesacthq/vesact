# Studio

跨境卖家的社媒聊单产品：内容引流，私信聊单，翻译与 AI 辅助成单。

产品架构见 docs/product-architecture.md。

## Language

### 聊天

**联系人**：
和我们发生过消息往来的人。界面上也用这个词。
_Avoid_: 客户、访客、粉丝、customer

**平台身份**：
联系人在某个社媒平台上的身份，由平台和平台用户 ID 唯一确定。一个联系人可以有多个平台身份。
_Avoid_: 账号、粉丝

**渠道**：
我们接入的一个可收发消息的平台账号（WhatsApp 号、Instagram 账号、Facebook 主页等）。
_Avoid_: 账号、inbox

**会话**：
一个渠道和一个平台身份之间的全部消息往来。永续存在，没有状态；帖子下的评论往来也是一种会话。
_Avoid_: 工单、ticket、聊天记录

**消息**：
会话中的一条收或发的内容。出站消息同时保留操作员输入的原文和实际发出的译文。

**接管人**：
会话当前归属的成员，为空表示无人负责。全系统唯一的状态变化就是接管人的有和无。
_Avoid_: 归属客服、所有者、assignee

**接待**：
一名成员处理一条会话的一段时间，有开始和结束时间，结束后不再更改。结束由手动操作、转分配或 7 天无消息自动发生，统计不依赖任何人手动结束。
_Avoid_: 会话记录、session、工单

**未分配池**：
接管人为空且有未回复新消息的会话集合。随消息往来自动进出，不是会话的状态。

**窗口**：
平台允许自由回复客户的时限（如 Messenger 标准 24 小时、human agent 7 天），过期后只能发付费模板消息。

**标签**：
组织自定义的分类，打在联系人上。唯一的分类机制，没有阶段或漏斗字段；口语里的「客户」指打了成交类标签的联系人。

**工作流**：
组织配置的一组自动动作。第一版只有一种：客户静默后按天自动发消息，以客户最后一条消息计时，客户回话或打上成交类标签即停止。
_Avoid_: 序列、旅程、SOP、自动化、跟进

### 团队

**成员**：
组织里使用产品的人，有角色、渠道权限、接待上限。

**接待上限**：
一名成员同时进行中（未结束）的接待数量上限，自动分配据此判断是否可再分。

### 发布

**帖子**：
一次要发布的内容（文案、素材、定时）。

**发布记录**：
帖子在某个渠道的发布结果，含平台帖子 ID；评论会话和联系人来源都通过它关联回帖子。

**来源**：
一条会话开始时可识别的引流入口（广告、帖子、链接、预填关键词），记在会话的第一条入站消息上，可为空，界面对未知来源如实显示。联系人显示其所有会话的来源。

## Reference

截至 2026-09。

### 广告 → 聊天 → 回传

Meta 的 Click-to-WhatsApp / Messenger / Instagram 广告是一条闭环：

1. **广告**：Marketing API 建广告，入口只差 ad set 的 `destination_type` 和创意 CTA，一个 ad set 可同投三入口。计费只按曝光。优化目标二选一：按会话数（CONVERSATIONS），或按购买（OFFSITE_CONVERSIONS，需先回传成交，只对 WhatsApp 和 Messenger 有效）。
2. **聊天**：第一条入站消息带 `referral`。WhatsApp 有 `source_type`（ad / post）、`source_id`、`headline`、点击级 `ctwa_clid`；Messenger 和 Instagram 只有 `ad_id` 加广告素材。欢迎语里被点的 ice breaker 文案随消息进来。WhatsApp 从广告进来的会话，24 小时内回复即开 72 小时免费窗口。
3. **回传**：Conversions API for Business Messaging，`action_source=business_messaging`。标识：WhatsApp 用 `ctwa_clid`，Messenger 用 page_id + PSID，Instagram 用 IG 账号 ID + IGSID。点击后 7 天内有效。回传后 Meta 才能按购买找人。

来源应挂在平台身份或会话首条消息上，并保留 `ctwa_clid` / `ad_id` 原值。

### YCloud 的广告联动

- 广告在 Meta 或 TikTok 的 Ads Manager 里建，YCloud 不建广告。YCloud 做的是：连接广告账户，接住带广告来源的聊天，按规则回传，出报表。Google 标注 coming soon。
- 回传事件的触发方式三种：给联系人打指定标签、聊天里出现指定关键词、业务系统调 YCloud API 发自定义事件。
- Meta 只回传 `Purchase` 一种事件。未配置时默认把「客户发了第二条消息」当 Purchase 回传，用来喂优化。按购买优化要求每周 10 次以上转化。
- TikTok 默认回传 Conversation 事件，下层事件按规则开启。聊天里显示「From TikTok Ad ID: xxx」。
- 报表按广告看花费、曝光、点击、发起会话数、带来的联系人及其触发的事件，可导出。一次只能看一个广告账户。
- 坑：投 PC 端会丢广告参数，Reels / Stories 版位可能归因失败。

### Zernio 能否做整条链路

| 环节                            | WhatsApp                                       | Messenger                      | Instagram                      |
| ------------------------------- | ---------------------------------------------- | ------------------------------ | ------------------------------ |
| 建广告 `POST /v1/ads/messaging` | 是                                             | 是                             | 是                             |
| 聊天带归因（会话 metadata）     | `ctwa_clid`、`ctwa_source_id`、`ctwa_headline` | `meta_ad_id`、`meta_ad_source` | 同 Messenger                   |
| 回传                            | `POST /v1/whatsapp/conversions`                | 无                             | 无，Meta 本身也不按购买优化 IG |

- 建广告默认按会话优化，按购买优化的字段未暴露。
- Messenger / Instagram 回传无公开时间表，联系 support@zernio.com。
- Zernio 是 Meta Tech Provider，用其 Meta 应用授权，Studio 不用自己过 App Review。Meta 消息费直接扣用户 WABA。
- 相关能力 2026-08 上线，多次 breaking change。
