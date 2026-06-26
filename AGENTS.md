# AGENTS.md

## 你需要先知道

- 项目：`@turinhub/atomix-common-ui`
- 类型：React 组件库，使用 TypeScript、Vite、Tailwind CSS v3、Radix UI、shadcn/ui 组件注入模式
- 核心目标：沉淀可复用业务组件，同时不把业务项目自己的 shadcn/ui 源码打包进库里
- 默认工作原则：保持公开 API 稳定，沿用现有组件注入、类型导出、测试组织和样式写法
- 本规范优先级：新增或修改 UI 时，先遵守本文件，再参考 `Agent.md` 与 `docs/agent/*`

## 快速工作流

1. 先确认改动范围，优先阅读相关组件、测试和类型导出。
2. 改组件时同步检查 `src/index.ts` 的导出、`src/types/component-types.ts` 的注入类型，以及对应 `src/components/__tests__` 测试。
3. 改公开用法、视觉约定或组件 API 时，同步更新 `README.md`、`USAGE.md` 或 `docs/` 下的用户文档。
4. 提交前按风险选择验证命令，常规改动优先执行：

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

## 主要目录

- `src/components`：业务组件与导出的组件实现
- `src/components/ui`：项目内用于开发和测试的 shadcn/ui 基础组件
- `src/components/__tests__`：组件测试
- `src/types/component-types.ts`：可注入 UI 组件的通用类型
- `src/index.ts`：组件、类型和工具函数的包入口
- `src/styles.css`：Tailwind base 与全局语义 token
- `tailwind.config.js`：Tailwind v3 主题映射、暗色模式和动画配置
- `playground`：本地演示与调试入口
- `docs/components`：面向使用者的组件文档
- `docs/agent`：Agent 按需加载的项目工作文档

## UI 设计原则

- 这是面向业务系统的组件库，视觉应安静、清晰、紧凑、可复用；避免营销页式的大 hero、装饰性渐变、浮夸阴影和过度插画。
- 默认呈现信息密度适中的操作界面：表格、表单、上传、阅读器、认证面板都应优先支持扫描、比较、反复操作和错误恢复。
- 不引入新的 UI 库。基础交互继续使用现有 Radix/shadcn 风格组件、`lucide-react` 图标、`class-variance-authority` 变体和 `cn` 类名合并。
- 业务组件保持组件注入模式，视觉规范应通过 Tailwind 类名、语义 token、默认布局和可覆盖 className 实现，不绑定消费方项目的 shadcn 源码。
- 新增 UI 必须同时设计正常、加载、空、错误、禁用、焦点、悬停、暗色模式和长内容状态。

## Tailwind 与 Token

- 当前项目使用 Tailwind CSS v3，继续通过 `tailwind.config.js` 映射 `hsl(var(--token))`，不要改成 Tailwind v4 `@theme` 写法，除非执行明确的迁移任务。
- 颜色只使用现有语义 token：`background`、`foreground`、`card`、`popover`、`primary`、`secondary`、`muted`、`accent`、`destructive`、`border`、`input`、`ring` 及其 foreground。
- 状态色优先使用语义 token；少量状态提示可沿用已有 `blue-*`、`emerald-*`、`red-*` 模式，但必须同时检查暗色模式对比度。
- 不在组件内硬编码品牌色、大片单一色系或不可主题化的背景。需要强调时用 `bg-primary/10`、`bg-muted/50`、`text-muted-foreground`、`border-border` 这类 token 派生写法。
- 圆角沿用 `--radius: 0.5rem` 与 Tailwind `rounded-md`、`rounded-lg`、`rounded-xl` 体系。工具按钮、输入框和列表项优先 `rounded-md` 或 `rounded-lg`；不要任意放大圆角。
- 阴影保持克制：表面默认 `shadow` 或 `shadow-sm`；登录浮层这类真实覆盖层可使用较强阴影；页面 section 不做悬浮卡片化。
- 间距采用现有节奏：紧凑控件 `gap-2`、表单分组 `gap-4`/`space-y-2`、卡片内边距 `p-6`、移动端外边距 `px-4` 起步。
- 动效只用于反馈和状态过渡，优先 `transition-colors`、`transition-all` 禁用；动画必须可被用户输入打断，并尊重 `prefers-reduced-motion`。

## 组件结构

- 可复用组件遵循“基础样式、变体、尺寸、状态、外部覆盖”的顺序组织。已有 `Button` 使用 `cva`，新增多变体组件优先复用这种模式。
- 所有外部传入的 `className` 必须通过 `cn(...)` 合并，保证 Tailwind 冲突可由 `tailwind-merge` 正确覆盖。
- 公开组件默认导出稳定、Props 命名清晰；可注入 UI 组件类型放在对应组件或 `src/types/component-types.ts`，并保持必需/可选边界明确。
- 缺少必需注入组件时，保持现有错误提示风格：居中、`text-destructive`、明确说明需要通过 `components` prop 注入。
- 图标默认使用 `lucide-react`。图标按钮必须有 `aria-label`；装饰性图标加 `aria-hidden="true"` 或确保不被读屏误读。
- 操作按钮要有具体文案，避免泛化的“继续”。空间受限时可用图标按钮，但要提供可访问名称。
- Destructive action 必须使用确认弹窗、撤销窗口或明确的二次确认；不得点击后立即删除。

## 布局与响应式

- 优先用 flex/grid 和 CSS 约束解决布局，不在 render 中读 `getBoundingClientRect`、`offsetWidth`、`scrollTop` 等布局值。
- 固定格式 UI 要给稳定尺寸：工具栏按钮、分页控件、上传文件行、PDF 阅读器工具按钮、表格操作列都应避免因 hover、loading 或文案变化产生跳动。
- 长文本必须处理：容器加 `min-w-0`，文本用 `truncate`、`break-words` 或合适的行数限制。用户文件名、表格单元格、错误信息和按钮文案都要考虑超长输入。
- 移动端从可用体验出发，不隐藏关键操作。表单按钮保持足够点击面积，横向内容使用可预期滚动或换行，避免页面出现无意义横向滚动。
- 全屏、阅读器、登录背景等 full-bleed 布局要考虑安全区，必要时使用 `env(safe-area-inset-*)`。
- 不把卡片嵌套在卡片里。重复项、弹窗和真正需要边界的工具面板可以用卡片；普通页面分区应保持无框或使用全宽区域。

## 表单与输入

- 每个表单控件必须有可点击 `Label`、包装 label 或 `aria-label`。`htmlFor` 与 `id` 要对应。
- 输入字段使用正确 `type`、`name`、`autocomplete` 和 `inputMode`。用户名、验证码、邮箱等不应被拼写检查干扰，必要时加 `spellCheck={false}`。
- 提交按钮在请求开始前保持可用；请求中显示 spinner 和明确 loading 文案，loading 文案用中文省略号“…”。
- 错误靠近对应字段或表单区展示，并包含下一步修复建议；异步错误区域需要 `aria-live="polite"`。
- 不阻止粘贴。验证码、手机号、密码等输入也不能通过 `onPaste` + `preventDefault` 禁止用户粘贴。
- 占位符用于示例或格式提示，中文省略号使用“…”；不要把 label 信息只放在 placeholder 中。

## 可访问性与交互

- 交互元素必须用语义 HTML：动作使用 `<button>`，导航使用 `<a>` 或路由 Link，表格使用真实 `<table>` 结构。
- 非原生可点击区域必须有 `role`、`tabIndex`、键盘处理和可见焦点；能用 button 时不要用 div 模拟。
- 所有可交互元素都需要可见 `focus-visible` 状态。允许 `outline-none`，但必须同时提供 `focus-visible:ring-*` 或等价替代。
- 复合控件使用 `focus-within` 增强焦点反馈，例如带图标输入框、拖拽上传区域、组合搜索栏。
- Radix 组件要保留键盘交互、aria 属性和焦点管理；覆盖样式时不得破坏可访问性语义。
- 弹窗、菜单、侧栏和阅读器面板要避免背景滚动干扰，必要时使用 `overscroll-behavior: contain`。
- 触控交互建议设置 `touch-action: manipulation`，并有意处理 `-webkit-tap-highlight-color`。

## 表格与数据界面

- 表格是本库核心业务界面，默认保持紧凑：表头 `h-10`、单元格 `p-2`、正文 `text-sm`，不要随意放大字号和行高。
- 数值、金额、进度、页码等比较型内容使用 `tabular-nums`；数字和日期格式化使用 `Intl.NumberFormat`、`Intl.DateTimeFormat`。
- 表格列对齐必须由 column 配置驱动，操作列右对齐。折叠操作使用 `DropdownMenu`，展开操作保持按钮组间距一致。
- 空状态区分普通空数据和搜索无结果；loading 使用 Skeleton，避免闪烁和布局跳动。
- 大于 50 行的长列表要考虑虚拟化或分页，不直接渲染无界数组。
- 筛选、搜索、分页、tab 等状态应尽量可被 URL 表达；如果组件本身不负责路由，也要通过回调暴露足够状态给消费方同步。

## 媒体、上传与阅读器

- 上传区域必须支持点击、键盘 Enter/Space、拖拽、禁用状态和错误恢复。
- 文件名、文件类型、错误文本要处理超长内容；移除按钮使用图标时必须包含 `aria-label`，并带上文件名上下文。
- 进度条使用 `role="progressbar"`、`aria-valuemin`、`aria-valuemax`、`aria-valuenow`。
- 图片必须有 `alt`；装饰图使用空 alt。直接渲染 `<img>` 时提供宽高，避免 CLS；非首屏图片设置 `loading="lazy"`。
- PDF、Markdown、Video 等阅读器以内容可读性为先：工具栏紧凑、按钮状态明确、错误提示可恢复、键盘快捷键不劫持输入。

## 暗色模式与主题

- 暗色模式通过 `.dark` class 和 CSS 变量切换，组件不要自行维护另一套硬编码调色板。
- 新增 token 或状态色时，必须在 `:root` 与 `.dark` 同步定义，并检查 `background`、`foreground`、`border`、`ring`、`input` 的对比度。
- 暗色模式下原生输入、select、滚动条和弹层应与页面背景协调；必要时在宿主应用层设置 `color-scheme: dark`。
- 主题切换组件要保持 radio/menu 语义，当前项可被读屏识别。

## 内容与文案

- 默认文案使用简洁中文，面向用户说话，避免工程内部术语。
- 加载文案使用“加载中…”、“保存中…”这类中文省略号；不要使用三个点。
- 标题和按钮用具体动作描述，例如“开始上传”“清空”“发送验证码”“打开行操作菜单”。
- 错误提示说明用户下一步能做什么，例如“文件类型不符合要求”优于单纯“错误”。
- 代码 token、品牌名、包名和标识符在文档或界面中需要避免翻译时，可使用 `translate="no"`。

## 验收清单

- 视觉：浅色/暗色、移动端/桌面端、长文本、空状态、加载状态、错误状态都可用。
- 交互：鼠标、键盘、触控路径都有反馈；焦点可见；图标按钮有可访问名称。
- 结构：没有新增 UI 库；没有破坏组件注入模式；`className` 通过 `cn` 合并。
- 性能：没有 render 阶段布局读取；大列表有分页或虚拟化策略；图片有尺寸和懒加载策略。
- 文档：公开 API、默认文案或视觉行为变化后，同步更新用户文档和测试。
