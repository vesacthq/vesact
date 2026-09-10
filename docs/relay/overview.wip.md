# Relay

消息 API 平台。对外卖给海外开发者，对内是 Studio 的渠道层，底层在 Zernio 与自有平台应用之间路由。

## 壳

申请阶段把 Zernio 的开源客户端 unified-inbox、ads-dashboard、latewiz、zernflow 拼成一个用到全部平台权限的应用，作为向 Meta、WhatsApp、TikTok 提交审核的载体；之后换成 Relay 自己的实现。清单和用途见 engineering.wip.md 1.4。

## API

按 Zernio 的分类：posting、comments、messaging、analytics、ads、comment to DM。Studio 按同一套接口调用，接哪个地址只是配置。

## 主机名

待定，倾向 `api.vesact.com`、`console.vesact.com`、`developers.vesact.com`。
