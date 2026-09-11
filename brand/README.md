# Vesact 品牌资产

## Logo

`logos/vesact/`、`logos/studio/`、`logos/relay/` 各含 `horizontal/` 横版与 `stacked/` 上下组合。横版产品名使用同行描边标签；上下组合使用居中的下方标签。`logos/symbol/` 为独立双勾，`logos/wordmark/` 为独立字标。

| 版本 | 图形 | 文字 / 边框 | 背景 |
| --- | --- | --- | --- |
| color | #006AFE | #0E1317 | 浅色 |
| dark | #006AFE | #FFFFFF | 深色 |
| black | #000000 | #000000 | 浅色 |
| white | #FFFFFF | #FFFFFF | 深色 |

所有 Logo 均提供透明 SVG 和 PNG。组合与字标 PNG 宽度为 512、1024、2048 px，独立双勾为 512、1024 px；高度按比例导出。字形已转为路径，无字体依赖。使用时锁定宽高比，保留文件内的留白和对齐。外围建议至少留出一个双勾笔画宽度的空白。白色版本需在深色背景查看。

## 应用图标

`app-icons/` 提供统一蓝底白双勾：SVG、256 / 512 / 1024 px PNG；另含浅色与深色背景头像，以及 Maskable SVG 母版。完整方形画布由平台施加圆角或裁切。

## 网站图标

`web/vesact/`、`web/studio/`、`web/relay/` 内图标一致，各自 Manifest 使用对应名称。每个目录包含：

| 文件 | 规格 |
| --- | --- |
| favicon.svg | 方形透明矢量 |
| favicon.ico | 内嵌 16、32、48 px |
| favicon-16x16 / 32x32 / 48x48.png | 固定尺寸透明 PNG |
| apple-touch-icon.png | 180 × 180，蓝底白图形、不透明 PNG |
| icon-192 / 512.png | 标准 Web App 图标 |
| icon-maskable-192 / 512.png | 留足裁切安全区的 Web App 图标 |
| safari-pinned-tab.svg | 单色固定标签图标 |
| site.webmanifest | 对应品牌或产品的安装配置 |
| head.example.html | 网站 head 标签示例 |

将对应 `web/` 子目录的图标与 Manifest 放入网站公开资源根目录，使用 `head.example.html` 的标签。Manifest 默认启动路径与作用域为 `/`；子路径部署时调整相关路径。应用安装与离线行为由应用实现。

`preview.png` 展示组合与明暗版本，`icons-preview.png` 展示小尺寸和应用图标。
