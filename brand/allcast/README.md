# Allcast 品牌资产

主标名称为 `allcast`，网站域名为 `allcast.cc`。

## Logo

`logos/` 包含 horizontal（横版）、stacked（上下组合）、wordmark（独立字标）、symbol（独立双勾）。每种均有透明 SVG 和 PNG，SVG 字形已转为路径，无字体依赖。

| 版本  | 双勾    | 字标    | 适用背景 |
| ----- | ------- | ------- | -------- |
| color | #3B8FFF | #0E1317 | 浅色     |
| dark  | #3B8FFF | #FFFFFF | 深色     |
| black | #000000 | #000000 | 浅色     |
| white | #FFFFFF | #FFFFFF | 深色     |

明暗模式统一使用蓝色 #3B8FFF（RGB 59, 143, 255）。组合与字标 PNG 宽度为 512、1024、2048 px，双勾为 256、512、1024 px；高度按比例导出。保持宽高比，保留内置对齐，外围建议留出至少一个双勾笔画宽度。白色透明素材在深色背景预览。

## 应用图标

`app-icons/` 提供蓝底白双勾 SVG 和 256、512、1024 px PNG；浅底、深底头像与 Maskable 版本提供 SVG / 512 px PNG。完整方形画布由平台施加圆角或裁切。

## 网站图标

| 文件                              | 规格 / 用途                 |
| --------------------------------- | --------------------------- |
| favicon.svg                       | 方形透明 SVG，统一蓝色      |
| favicon.ico                       | 内含 16、32、48 px          |
| favicon-16x16 / 32x32 / 48x48.png | 固定尺寸透明 PNG            |
| apple-touch-icon.png              | 180 × 180，不透明蓝底白图形 |
| icon-192 / 512.png                | 标准 Web App 图标           |
| icon-maskable-192 / 512.png       | 可裁切 Web App 图标         |
| safari-pinned-tab.svg             | 单色固定标签兼容素材        |
| site.webmanifest                  | Allcast 安装配置示例        |
| head.example.html                 | 页面 head 标签示例          |

将 `web/` 内图标和 Manifest 放入网站公开资源根目录，参考 head 示例接入。Manifest 的启动路径与作用域均为 `/`；子路径部署需调整对应链接。应用安装和离线行为由应用实现。

`preview.png` 展示明暗与组合效果；`icons-preview.png` 展示固定像素图标。
