# 品牌资产

两个产品，两套资产，各自目录下的 README 讲文件和用法。

| 目录       | 产品                                   | 主色      | 站点                                             |
| ---------- | -------------------------------------- | --------- | ------------------------------------------------ |
| `vesact/`  | Vesact，API 产品：官网、控制台、文档   | `#006AFE` | `www.vesact.com`、`console.vesact.com`           |
| `allcast/` | Allcast，原 Studio：产品、账号中心、官网 | `#3B8FFF` | `app.allcast.cc`、`www.allcast.cc`、`www.allcast.ai` |

两套共用同一个双勾图形，字标和颜色不同。`vesact/logos/studio/`、`vesact/logos/relay/` 和 `vesact/web/studio/` 是改名前按产品打标签的版本，不再使用；`vesact/web/relay/` 的图标与 `web/vesact/` 相同，`apps/relay/public/` 用的是它。

应用只保留自己要服务的拷贝：`apps/<app>/public/` 放对应 `web/` 目录的图标和 manifest，
`packages/ui/components/logo.tsx` 内嵌两套字标的路径数据，`apps/marketing/public/brand/`
放邮件模板引用的横版 PNG。改素材先改这里，再同步过去。
