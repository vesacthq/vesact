# React UI 组件库购买评估

调研日期：2026-09-01。价格、授权、维护数据均取自官网 pricing/docs、GitHub API、npm 一手来源，随文附链接；查不到的标「未查证」。仓库此前没有内部调研文档目录（`apps/docs` 是产品文档站，不混入），故新建 `docs/research/` 存放此类笔记。

## 评估锚点

- 技术底座：TanStack Start（非 Next.js）、React 19、Tailwind CSS 4.3.3、primitives 用 Base UI（`@base-ui/react ^1.7.0`，非 Radix）、shadcn 官方 preset（maia 风格 / zinc 基色 / cyan 主题）。
- 现状：`packages/ui/components.json` 已接入 ReUI registry（`https://reui.io/r/base-nova/{name}.json`）；`apps/saas` 已依赖 `@tanstack/react-table`。
- 用途：SaaS 后台（表格/表单/筛选密集）+ 营销页 blocks。
- 硬约束：Tailwind v4 必须；纯 Next.js 交付出局或降级；shadcn registry 兼容优先，Radix-only 实现标注。

## 1. 结论

**首选（组合，共 $398，均一次性买断）**

- **shadcnblocks Pro（$149）**：唯一同时命中全部锚点的 blocks 库——标准 shadcn registry、官方支持 TanStack 项目、Base UI 底座可选（`base-nova`/`base-maia` style 与本仓库对口）、营销 blocks 之外还有 data table/form/date picker 类后台 blocks，月更 2–3 次。
- **ReUI Pro（$249，按需后买）**：本仓库已在用其免费 registry；Base UI 底座、TanStack Table v9 data grid、布尔查询树 Filters 正中后台需求；Pro 增量是 520 个 pro blocks 与 MCP 不限量。

**备选**

- **Tailark（免费层先用，Essentials $249 观望）**：营销 blocks 质量高、Base UI 默认底座，但源码含 `next/image`/`next/link`，装完要机械替换。
- **coss ui（原 Origin UI，免费）**：Origin UI 已并入 Cal.com 更名 coss ui；纯 Base UI、质量一流，当免费参照与补件，注意只从 MIT 目录取码。
- **Kibo UI（免费）**：Gantt/Kanban/Table 等 shadcn 生态缺件按需抄，但上游近 4 个月停滞，抄走即自管。

**出局**

- **HeroUI Pro**：能力最强（data grid 深度、维护节奏第一），但它是 React Aria 运行时库 + 自有 token 体系，与 shadcn + Base UI 底座是平行的第二套体系，整库引入代价大于收益。
- **Untitled UI React**：硬约束全过但底座是 React Aria、CLI 不走 shadcn registry，同为「第二套体系」问题；免费层可白用。
- **Tailwind Plus**：无 registry/CLI、Headless UI 底座、changelog 2026 年零更新，表格/日历偏静态标记。
- **Magic UI Pro**：Pro 实质是营销 sections + Next.js 模板，Pro 内容更新慢，对 SaaS 后台零贡献；免费动效层可单独取用。
- **Aceternity UI Pro**：炫技动效风与 zinc/cyan 专业风相距最远，模板 Next.js-only，无后台组件。

## 2. 对比总表

| 候选                    | 交付形态                       | 底座                                    | TW v4                               | Next.js 耦合                            | SaaS 后台重件                                                 | 价格（USD，一次性除注明外）                    | 近 6 个月维护                           | AI 配套                          | 风格契合                         |
| ----------------------- | ------------------------------ | --------------------------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------- | -------------------------------- | -------------------------------- |
| ReUI                    | shadcn registry                | **Base UI + Radix 双套**                | ✅                                  | 无（有 TanStack Start 模板规划）        | data grid（TanStack Table v9）、filter builder、表单、日历    | Pro $249 / Ultimate $499（1 seat）             | 周更节奏，issue 响应不稳                | MCP + skills + llms.txt          | 高（本仓库在用）                 |
| shadcnblocks            | shadcn registry + API key      | shadcn，**base-\* style 可选**          | Admin Kit 声明 TW4，registry 随宿主 | 无（TanStack 官方在列）                 | data table 32、form 85、Admin Kit                             | Pro $149 / Premium $299 / Elite $399           | 月更 2–3 次大更新                       | 官方 shadcn MCP；无 llms.txt     | 高（shadcn 语义 token）          |
| Tailark                 | shadcn registry                | **Base UI 默认** + Radix                | ✅                                  | 源码含 next/image、next/link（需替换）  | 无（纯营销）                                                  | Free / $249 / $299 / Team $499                 | commits ≥100，最后 push 2026-07         | 无 llms.txt、无 MCP              | 高（zinc 色阶）                  |
| coss ui（原 Origin UI） | shadcn registry（@coss）       | **纯 Base UI**（1.6.0）                 | ✅                                  | 组件无耦合，文档偏 Next 语境            | 表单/日期/combobox 有，无 data grid、filter builder           | 免费                                           | 96 commits，open issue 清零             | llms.txt + agent skills；无 MCP  | 高（Cal.com 中性风）             |
| Kibo UI                 | shadcn 式 registry（MIT）      | shadcn/Radix + headless 库              | 组件随宿主                          | 无                                      | Gantt、Kanban、Table（TanStack）等                            | 免费                                           | **仅 5 commits，近 4 个月停滞**         | 官方 MCP；无 llms.txt            | 高（shadcn token）               |
| Untitled UI React       | 自有 CLI（非 shadcn registry） | **React Aria** v1.20                    | ✅ 4.3                              | CLI 只有 nextjs/vite 模板，组件无耦合   | table、date/range picker、filter bars、charts                 | Solo $349 / Studio $999 / Business $2,499      | 月更 + npm 持续发版                     | 官方 MCP（7 工具）；无 llms.txt  | 中（同路但另一套体系）           |
| Tailwind Plus           | 网页复制 + zip，无 CLI         | **Headless UI** v2.1                    | ✅ 4.3                              | 模板全 Next.js；blocks React 代码无耦合 | 表格/日历为静态标记，无交互重件                               | Personal $299 / Teams $979；Catalyst 单卖 $149 | **changelog 2026 年零条目**             | 无 llms.txt、无 MCP              | 高（中性灰）                     |
| HeroUI Pro              | **npm 运行时库**（授权 CLI）   | **React Aria Components**（v3）         | ✅（必须）                          | 不锁框架（文档明示 TanStack Start）     | Pro data-grid（可编辑单元格、虚拟化、列 pin）、kanban、charts | Web $299 / Super $399 永久 + 可选年费续更      | v3 GA 后 10 个版本，节奏最强            | OSS+Pro 双 MCP、llms.txt、skills | 低（自有 token，非 shadcn 变量） |
| Magic UI Pro            | shadcn registry + token        | 动效件无 primitives 依赖（motion）      | ✅ 4.1                              | **模板全 Next.js**                      | 无                                                            | $199（仅个人档）                               | 主仓 87 commits；Pro sitemap 多为旧内容 | MCP + llms.txt                   | 中（动效层随宿主主题）           |
| Aceternity UI Pro       | 网页复制 + zip 模板            | motion，部分含 Radix（shadcn label 等） | v3/v4 双文档                        | **模板 Next.js-only**                   | 无                                                            | $169/年、$199 终身、Team $1,590                | changelog 周更级                        | llms.txt；MCP 配置未查证         | 低（炫技深色渐变）               |

## 3. 各候选详评

### 3.1 ReUI（reui.io）

- **交付**：shadcn registry，`npx shadcn@latest add @reui/<name>`，源码归项目所有（[get-started](https://reui.io/docs/get-started)）。核心 `registry/` 内 `next/image`/`next/link` 零命中（GitHub code search），仅 2 个演示示例例外；[roadmap](https://reui.io/roadmap) 列有 TanStack Start 模板（Surge、Tempo）。npm 上的 `reui` 包是无关旧项目，勿混淆。
- **底座**：每个组件都有 **Base UI 与 Radix 两套孪生实现**（[llms.txt](https://reui.io/llms.txt)：「every component available in both Base UI and Radix UI」），8 风格 × 2 底座共 16 套 style；本仓库用的 base-nova 即 Base UI + nova。Tailwind `^4.3.1`、React 19。**风险**：组件包硬锁 `@base-ui/react` **1.5.0**，本仓库为 ^1.7.0，跨版本兼容性官方未说明（未查证）。
- **价格**（[pricing](https://reui.io/pricing)，一次性）：Free $0（1,101 组件 + 21 primitives + Figma + MCP 100 次/天）；Pro $249（1 seat，+520 pro blocks，MCP 不限量）；Ultimate $499（+2,552 图标 + 14 模板）。Team/Growth/Enterprise 档价格页面未渲染出来，**未查证**。
- **维护**：无 GitHub Releases，走 commit + roadmap；2026-03 以来 main 45 commits，v2.0.0（2026-08-05）→ v2.3.0（2026-08-20），约每周一批。Issues open 34 / closed 27，响应两极：[#115](https://github.com/keenthemes/reui/issues/115)（registry 装完编译失败）15 分钟关闭，但 8 月下旬多个 issue 零回复。
- **后台重件**：[Data Grid](https://reui.io/docs/components/base/data-grid) 基于 TanStack Table v9（排序/筛选/分页/虚拟滚动/行固定/树形行），另有 36 个付费 data grid blocks；[Filters](https://reui.io/docs/components/base/filters) 是布尔查询树构建器；Calendar 基于 react-day-picker v9；表单走 Field + react-hook-form + zod v4。**注意：这些核心组件全部在免费层，Pro 买的是预组装 blocks。**
- **AI**：托管 MCP（mcp.reui.io，18 工具，[docs](https://reui.io/docs/mcp)）、[agent skills](https://reui.io/docs/agent-skills)、llms.txt 齐全。
- **代码抽样**：`registry/bases/base/ui/combobox.tsx` 对 Base UI 各 part 薄封装，类型复用 `ComboboxPrimitive.X.Props`，零 any，a11y 委托 Base UI；`calendar.tsx` 同样干净。瑕疵：图标走构建期 `IconPlaceholder` 替换机制（曾致 #115 安装即坏，当天修复）。

### 3.2 shadcnblocks（shadcnblocks.com）

- **交付**：标准 shadcn 命名空间 registry，`npx shadcn add @shadcnblocks/hero-1`，Pro 用 `SHADCNBLOCKS_API_KEY` Bearer token（[docs](https://www.shadcnblocks.com/docs/shadcn-cli/overview)）。公开 registry 实测 **4,161 items**（4,122 blocks + 39 components）。官方支持「Next.js, Astro, Vite, or **TanStack** project」（[getting-started](https://www.shadcnblocks.com/docs/blocks/getting-started)）；免费 block `hero1` 源码实测纯 `<a>`/`<img>`，零 next/* 依赖。
- **底座**：**Base UI 与 Radix 双支持**，style 取值 `base-vega / base-nova / base-maia`（[base-ui 专页](https://www.shadcnblocks.com/base-ui)）——与本仓库的 Base UI + maia/nova 直接对口。`data-table1` 依赖 `@tanstack/react-table` + zod（免费可拉，[registry 端点](https://www.shadcnblocks.com/r/data-table1.json)）。Tailwind v4 官网未明说（Admin Kit v2.2.0 changelog 提到 TW4，registry 组件实际随宿主项目），React 19 未查证。
- **价格**（[pricing](https://www.shadcnblocks.com/pricing)，一次性）：Pro $149（2,104+ pro components + 1,858+ pro blocks）；Premium $299（+20 模板 + Figma Kit + Admin Kit）；Elite $399（+49 预构建页 + Page Builder）。License：Standard 1 人 / Team 至 10 人，无限终端产品（[license](https://www.shadcnblocks.com/license)）。免费 block 确切数量未查证。
- **维护**：[changelog](https://www.shadcnblocks.com/changelog) 月更 2–3 次大更新，2026-03 以来每月都有新增（+64、+113、+73、+95、+193 blocks 及 Admin Kit v2.2/v2.3、Page Builder、Vue 站）。主产品闭源，GitHub 免费仓非主渠道。
- **后台重件**：官网明列 Data Table 32 blocks、Form 85、Dashboard 18、Admin Kit（139 页 admin dashboard）；registry 实测 table 相关 90 条、form 101 条、date-picker 9 条、chart 112 条。
- **AI**：MCP = 官方 shadcn MCP 接其 registry（[shadcn-mcp](https://www.shadcnblocks.com/shadcn-mcp)）；llms.txt 404。
- **代码抽样**：`hero1.tsx` props 全接口化、内容可参数化、语义标签齐；`data-table1.tsx` TanStack Table + zod，列排序/格式化齐全，a11y 中规中矩，顶部残留 `"use client"`（非 RSC 项目无害）。

### 3.3 Tailark（tailark.com）

- **交付**：shadcn registry，免费走 `@tailark-oss`、付费走 `@tailark` + API key（[docs](https://tailark.com/docs)、[GitHub](https://github.com/tailark/blocks)）。**硬伤**：block 源码直接 import `next/image`/`next/link`（实测 hero-section 首行即 `import Image from 'next/image'`，全仓 203 处 next/link）——装进 TanStack Start 需批量替换。
- **底座**：**Base UI 默认**（`/r` 即 Base UI，Radix 在 `/r/radix/`），仓库依赖 `@base-ui/react ^1.5.0`、`tailwindcss ^4.3.0`、React 19。
- **价格**（[pricing](https://tailark.com/pricing)，一次性）：Free $0；Essentials $249（全部 premium blocks）；Complete $299（+整页 templates）；Team $499（10 席）。Figma 未提及（未查证）。
- **维护**：2026-03 以来 commits ≥100，最后 push 2026-07-29；付费部分 changelog 未查证。
- **后台重件**：无，定位纯营销站（12 类营销 block）。
- **AI**：llms.txt 404，无官方 MCP（标准 registry 可被 shadcn 官方 MCP 消费，属推断）。
- **风格/代码**：三套免费 kit（Mist/Dusk/Veil）全走 shadcn CSS 变量、大量 zinc 色阶；抽样组件类型显式、装饰元素标 `aria-hidden`。

### 3.4 coss ui，原 Origin UI（coss.com/ui）

- **变动**：`origin-space/originui` 已 301 到 [cosscom/coss](https://github.com/cosscom/coss)，originui.com 跳转 coss.com/ui——Origin UI 并入 Cal.com，后继品牌 coss ui；旧代码以 legacy 保留在 `apps/origin/`。
- **交付**：shadcn registry（`@coss` 命名空间，[get-started](https://coss.com/ui/docs/get-started.md)）。**许可注意**：仓库默认 AGPL-3.0，但 LICENSING.md 明确 `apps/ui/` 与 `apps/origin/` 为 MIT——只从这两个目录取码，避开 `packages/ui/`。
- **底座**：**纯 Base UI**（1.6.0）+ Tailwind v4，附官方 [Radix/shadcn 迁移指南](https://coss.com/ui/docs/radix-shadcn-migration.md)。
- **价格**：完全免费，无付费层。
- **维护**：2026-03 以来 96 commits，最新 2026-08-31；issues **open 0 / closed 175**，响应 5–11 天且实修。
- **后台重件**：约 54 组件，表单/日期/combobox/Number Field/OTP 齐，但**无 TanStack Table data grid、无 filter builder**（Table 仅结构化标签封装）；508 个 particles 示例中是否含表格模式未查证。
- **AI**：[llms.txt](https://coss.com/ui/llms.txt) + 仓库内置 agent skills（`apps/ui/skills/`）；无 MCP。
- **代码抽样**：`combobox.tsx` 显式泛型透传、零 any、装饰件 `aria-hidden`、逻辑属性天然 RTL、触屏 44px 命中区——TS 与 a11y 细致度是全部候选中最高的。

### 3.5 Kibo UI（kibo-ui.com）

- **交付**：shadcn 式 registry（`npx kibo-ui add`），MIT 免费（[GitHub](https://github.com/shadcnblocks/kibo)，已归入 shadcnblocks org）；组件不 import next/*。
- **底座**：构建在 shadcn/ui（**Radix 系**）之上，重组件叠加 headless 库：Table 用 TanStack Table，Gantt/Kanban 用 dnd-kit + jotai。**Base UI 底座下未获官方声明支持**——它引用的 `@/components/ui/*` 在本仓库是 Base UI 版实现，需逐个验证（未查证）。
- **价格**：本体免费；官网列的 28 blocks / 1,100+ patterns 归属 shadcnblocks，是否需付费计划未查证。
- **维护**：**2026-03 以来仅 5 commits**，最后实质更新 2026-05-04，最后 release 2025-10-29——近 4 个月停滞。
- **重件**：Gantt、Kanban、Table、Calendar、Editor、Dropzone、Dialog Stack、Tree 等 41 个 shadcn 生态缺件。
- **AI**：公开免认证 MCP（[docs/mcp](https://www.kibo-ui.com/docs/mcp)）；llms.txt 404。
- **代码抽样**：`packages/table/index.tsx` 有实质缺陷——排序状态存**模块级 jotai atom**，同页多个 TableProvider 会共享排序状态；Gantt 拖拽无键盘等价操作，aria 覆盖稀疏。抄走要自己修。

### 3.6 Untitled UI React（untitledui.com）

- **交付**：源码归你，但走**自有 CLI**（`npx untitledui add`，含 AI 语义搜索），文档完全未提 shadcn registry 兼容（[cli docs](https://www.untitledui.com/react/docs/cli)）；CLI init 仅 `--nextjs`/`--vite`，组件本体纯 React 无 Next 耦合。免费层开源（[GitHub](https://github.com/untitleduico/react)，MIT）。
- **底座**：**React Aria** v1.20 + Tailwind v4.3 + React 19.2 + TS 5.9（[introduction](https://www.untitledui.com/react/docs/introduction)）。
- **价格**（[pricing](https://www.untitledui.com/pricing)，一次性）：Free $0 / PRO SOLO $349 / STUDIO $999（8 人）/ BUSINESS $2,499（20 人）；Figma 是独立产品分开买（$129 起）；不退款。
- **维护**：[changelog](https://www.untitledui.com/changelog) 每月有更新（2026-03 v8.0 → 08-03 Context menus）；CLI npm 半年 9 个版本。
- **后台重件**：table（React Aria Table，非 data grid）、date/range picker、filter bars 8 种、charts（Recharts）——table/date picker/charts 在**免费开源层**即有，filter bars 疑为 PRO（未在开源仓库）。
- **AI**：官方 MCP（2026-01 上线，7 工具，语义搜索，[docs](https://www.untitledui.com/react/integrations/mcp)）；llms.txt 404。
- **代码抽样**：`table.tsx`、`date-picker.tsx` 泛型严谨、未见 any，a11y 由 React Aria 兜底，质量扎实。npm 的 `untitledui-js` 是第三方图标包，官方是 `@untitledui/icons`。

### 3.7 Tailwind Plus / Catalyst（tailwindcss.com/plus）

- **交付**：UI Blocks 网页复制（付费墙后），Catalyst ZIP 下载；**无 registry、无 CLI**。Catalyst 框架无关（Link 组件可适配任意 router，[docs](https://catalyst.tailwindui.com/docs)）；UI Blocks React 代码不依赖 Next.js（[using-react](https://tailwindcss.com/plus/ui-blocks/documentation/using-react)）；13 个模板全 Next.js。
- **底座**：**Headless UI v2.1** + Tailwind v4.3（[plus 首页](https://tailwindcss.com/plus)）——与 Base UI 并存即第二套 primitives。
- **价格**：Personal $299 / Teams $979（25 人），一次性终身更新；Catalyst 单卖 $149；**不含 Figma**；30 天退款。
- **维护**：**changelog 最新条目 2025-12-18，2026 年全年零更新**（[changelog](https://tailwindcss.com/plus/changelog)）；Catalyst 上次专项更新 2025-04。
- **后台重件**：Tables 19、Calendars 8 等均为静态标记块；Catalyst Table 纯展示、无 date picker。
- **AI**：llms.txt 404，无 MCP。

### 3.8 HeroUI / HeroUI Pro（heroui.com / heroui.pro）

- **交付**：OSS 是 npm 运行时库 `@heroui/react`（v3.2.4，peer 要求 react>=19、tailwindcss>=4）；Pro 是私有 npm 包 `@heroui-pro/react`（1.0.0-beta.8），授权 CLI 安装（[installation](https://heroui.pro/docs/react/getting-started/installation)）。不锁框架（文档明示支持 TanStack Start）；4 个官方模板的脚手架框架未标注（未查证）。
- **底座**：v3 基于 **React Aria Components** 全新重写，自有 token 系统（`@heroui/styles` + tailwind-variants），**不用 shadcn CSS 变量**，交互走 `onPress`。
- **价格**（[pricing](https://heroui.pro/pricing)，2026-09-01 浏览器实测）：个人 Web Hero $299 / Mobile $299 / Super Hero $399，永久授权 + 可选年费续更（$99–$129/年）；团队每席 $199–$299（最少 2 席）。含 65 个 Pro 组件、templates、Pro AI（Skills + MCP）+ AI credits。Figma 未查证。
- **维护**：三强中最猛——v3 GA（2026-03-21）后半年 10 个版本，最后 push 2026-09-01；Pro 包持续 beta 发版。
- **后台重件**：深度最强——Pro data-grid 有可编辑单元格、虚拟化、列 pin、服务端排序、bulk actions；另有 kanban、8 种 charts、rich-text-editor。
- **AI**：配套最完善——OSS 公开 MCP + Pro 授权 MCP（mcp.heroui.pro）+ llms.txt + AI Skills。
- **代码抽样**：v3 `select.tsx`/`table.tsx` 泛型严谨、a11y 由 React Aria Components 保证（上限最高）；瑕疵为个别 `as any` 强转。

### 3.9 Magic UI Pro（pro.magicui.design）

- **交付**：免费与 Pro 均走 shadcn registry（Pro 用 Bearer token，[installation](https://pro.magicui.design/docs/installation)）；**模板全 Next.js**。
- **底座**：动效件只依赖 `motion`，不依赖 Radix；Tailwind v4（仓库 4.1.13）。
- **价格**：Individual $199 一次性（50+ sections、9+ 模板、终身），无团队档、无 Figma（[pro 首页](https://pro.magicui.design/)）。
- **维护**：主仓 2026-03 以来 87 commits，但 **Pro 侧 sitemap 显示 sections 多为 2024 年内容，changelog 页 404**——付费内容更新明显偏慢。
- **后台重件**：无（77 个免费件全为动效/装饰）。
- **AI**：[llms.txt](https://magicui.design/llms.txt) + [MCP](https://magicui.design/docs/mcp)（是否覆盖 Pro 未说明）。
- **代码抽样**：TS 好（typed MotionProps、JSDoc）；a11y 偏弱（marquee 重复内容无 `aria-hidden`、无 prefers-reduced-motion）。

### 3.10 Aceternity UI Pro（ui.aceternity.com）

- **交付**：免费件走 shadcn 命名空间 CLI；Pro blocks 网页复制、模板 **zip 且 Next.js 16-only**（[changelog](https://ui.aceternity.com/changelog)）。
- **底座**：Motion；部分组件经 shadcn 间接依赖 Radix（label 等）；TW v3/v4 双配置文档。
- **价格**（[pricing](https://ui.aceternity.com/pricing)）：$169/年、$199 终身、Team $1,590（10 人）；blocks 数量口径不一（pricing 页 200+，llms-full.txt 167）；不退款；Figma 未提及。
- **维护**：changelog 周更级，很活跃。
- **后台重件**：无（components 目录逐项确认无 table/form/date picker/filter）。
- **AI**：[llms-full.txt](https://ui.aceternity.com/llms-full.txt) 完备；MCP 有宣传但公开配置文档 404（未查证）。

## 4. ReUI 的真实优劣（对最强竞品）

**独有优势**

- 全场唯一「Base UI 底座 + 后台交互重件」双命中：TanStack Table v9 data grid、布尔查询树 Filters、react-hook-form + zod 表单体系，且这些核心组件全在免费层。shadcnblocks 的后台内容是 blocks（预组装页面片段），不是带完整交互逻辑的组件体系；coss ui 没有 data grid 和 filter builder；HeroUI Pro 有更深的 data grid 但要整套换体系。
- 迁移成本为零：本仓库 components.json 已接 base-nova registry，付费只是解锁同一体系的更多内容。
- AI 配套完整（托管 MCP 18 工具 + agent skills + llms.txt），付费后 MCP 不限量。

**真实短板**

- 对 shadcnblocks：blocks 体量差一个数量级（520 vs 4,161 items/1,858+ pro blocks），营销 blocks 覆盖面窄，价格还贵 $100；维护是 Keenthemes 单厂商，issue 响应两极（有 15 分钟关闭的，也有零回复的），而 shadcnblocks 月更节奏更稳。
- 对 HeroUI Pro：data grid 功能深度不及（无可编辑单元格、bulk actions）；发版工程化不及（无 GitHub Releases，靠 commit + roadmap）。
- 版本漂移：组件包硬锁 `@base-ui/react` 1.5.0，本仓库 ^1.7.0，装入后跑在 1.7 上的兼容性无官方承诺——这是当前最实际的技术风险，好在源码归自己，可自行修补。

## 5. 购买建议

1. **现在买 shadcnblocks Pro（$149）**：营销页开工即可用（TanStack 官方支持、base-maia/base-nova style 对口、零 next/* 依赖），后台的 form/data table blocks 是白送的加分。Premium（$299）的增量是模板 + Figma + Admin Kit——模板与 Admin Kit 和 ReUI/自建后台重叠，Figma 有需要再补差价档，先不上。
2. **ReUI 免费层先用足，后台 blocks 需求成片时再买 Pro（$249）**：data grid、Filters、表单、日历这些核心组件现在就是免费的；Pro 的 520 blocks 与 MCP 不限量在后台页面进入批量生产期时才值回票价。Ultimate（$499）的增量（图标 + 14 模板）中对本项目有意义的是 roadmap 上的 TanStack Start 模板（Surge/Tempo），等它们实际发布再评估。
3. **不买**：HeroUI Pro、Untitled UI（第二套体系，共存成本大于收益）、Tailwind Plus（2026 年零更新 + 无 registry）、Magic UI Pro、Aceternity（用途与风格不符）。若未来后台出现「可编辑表格/超大数据量」这类 ReUI 覆盖不了的刚需，再单独评估把 HeroUI Pro 隔离在数据密集模块内使用。
4. **免费补充**：coss ui（原 Origin UI）当 Base UI 组件的质量参照与补件来源（认准 MIT 目录）；Kibo UI 按需抄 Gantt/Kanban（抄走自管，先修排序共享 atom 的问题）；Tailark 免费层与 Magic UI 免费动效按需取用。

合计建议支出：现在 $149，后台批量期 +$249，上限 $398，全部一次性买断。
