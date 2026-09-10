# Relay Messaging

A1 的产出：领域模型、状态语义、契约。原则和契约约定见 engineering.md。

## 必须先定的语义

**会话保持渠道内语义。**同一买家在 WhatsApp 和 IG 上联系，不自动合成一个 Relay 会话。跨渠道 CRM 客户合并留给 Studio。

**参与者与渠道地址分开。**内部客户身份、平台用户标识和联系地址不是同一概念。外部标识要保留平台/App/连接作用域，不能假定跨 App 通用。Twilio Conversations Classic 的参与者与 messaging binding 可作为建模参考，而不是全量复制对象。[R5]

**提交与投递分开。**本地已排队、下游接受、接收者送达、已读分别建模。不能把缺少回执表示为 `false` 或伪造成功，也不能让迟到事件机械覆盖更可靠的已知状态。

**渠道状态与业务工作流分开。**平台的已读回执属于 Relay 能力；销售负责人、内部备注、客户阶段，以及某个 Studio 员工是否查看过，属于上层应用。

**回复与主动发起分开考虑。**首轮可只做已有会话回复；契约不能永远假设必须先有会话。未来平台允许的首触达/模板消息单独设计并检查条件，不能默认任意平台可主动发信。

## 领域模型

待写：租户与 API key 的归属链；connection、conversation、message、event 与 Relay 自己的 ID；状态；幂等；webhook 事件。

## 契约

待写：zod schema 位置与生成的 OpenAPI。

[R1]: https://developers.cloudflare.com/queues/reference/delivery-guarantees/ "Cloudflare Queues delivery guarantees"
[R2]: https://developers.cloudflare.com/queues/reference/how-queues-works/ "How Cloudflare Queues works"
[R3]: https://docs.stripe.com/error-low-level "Stripe advanced error handling"
[R4]: https://raw.githubusercontent.com/apideck-libraries/openapi-specs/main/vault.yml "Apideck Vault OpenAPI"
[R5]: https://www.twilio.com/docs/conversations-classic/api/conversation-participant-resource "Twilio Conversations Classic Participant"
[R6]: https://docs.merge.dev/merge-unified/supplemental-data/overview "Merge Supplemental Data"
[R7]: https://docs.svix.com/retries "Svix retry schedule"
