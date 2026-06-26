# 变更日志

本项目的所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。

## [Unreleased]

## [0.6.0] - 2026-06-26

### 新增

- playground 新增 URL 查询参数同步、可分享配置状态和对应测试，覆盖页面、主题、表格、媒体、Markdown 与 PDF 阅读器配置。
- playground 新增 Radix Switch 控件和开关交互测试，用于验证表格、媒体与 PDF 功能开关。

### 变更

- 优化 playground 视觉与交互体验，补充暗色模式 meta、主题色同步、响应式配置面板和更多组件状态示例。
- 优化基础 UI 组件的焦点环、触控反馈、紧凑圆角、弹窗滚动和暗色模式背景表现。
- 优化认证、上传、表格、分页、图片、视频、Markdown 与 PDF 阅读组件的长内容、移动端、焦点、加载、错误和辅助技术可读性。
- `TablePagination` 支持可选注入 `SelectGroup`，便于适配 shadcn/Radix Select 分组选项结构。
- `AuthVisualCarousel` 支持为轮播图传入 `width` 和 `height`，并默认提供稳定图片尺寸。

### 修复

- 修复 `TableHeader` 在中文输入法组词期间按 Enter 会提前触发搜索的问题。
- 修复 `SimplePDFReader` 快捷键在 textarea、select、contenteditable、textbox 和 spinbutton 聚焦时仍可能被触发的问题。
- 为 PDF 阅读器、分页缩略图、上传区域和图标按钮补充可访问名称、状态语义与焦点反馈，改善键盘和读屏体验。

## [0.5.0] - 2026-06-03

### 新增

- 新增 `AuthPageShell`、`AuthVisualCarousel`、`AuthPanel`、`AuthLoginPanel` 和 `AuthRegisterPanel` 认证组件套件，支持页面背景插槽、通用视觉轮播、登录/注册切换、账号密码登录、手机号验证码登录与注册。
- 新增 `auth` 子路径导出，支持 `@turinhub/atomix-common-ui/auth` 引入认证组件和类型。
- 新增 `docs/components/Auth.md`，说明 Auth 组件的 UI 注入、登录注册回调、页面壳、视觉轮播组合和 Tale-style 接入边界。
- 在 playground 中新增认证组件测试页和本地认证轮播演示图，用于验证 `AuthPageShell`、`AuthVisualCarousel`、`AuthPanel`、登录、注册和验证码回调链路。
- 新增 Auth 组件测试用例，覆盖登录方式切换、密码登录、手机号校验、验证码元数据传递、注册校验、条款确认、面板切换、页面壳插槽和视觉轮播交互。
- 新增 `ImageReader` 和 `VideoReader` 在线预览组件，支持常见图片、视频格式校验、加载态、错误态和组件级子路径导出。
- 新增 `docs/components/ImageReader.md` 和 `docs/components/VideoReader.md`，说明格式支持、基础用法和 API。
- 在 playground 中新增媒体预览测试页，用于验证图片、视频和不支持格式状态。

### 变更

- 根入口恢复导出业务组件与类型，同时保留组件级子路径导出，便于消费端按需选择集成方式。
- 扩展 Tabs 注入组件类型，支持认证组件向宿主 Tabs 根组件传入布局类名。

### 修复

- 修复 `DataTable` 操作列点击事件冒泡到行点击处理器的问题，便于业务侧同时配置整行跳转和操作列跳转。
- 修复 `ImageReader` 和 `VideoReader` 切换 `src` 后未恢复加载态的问题，并确保视频资源变更时重新加载。

## [0.4.0] - 2026-06-01

### 破坏性变更

- 根入口 `@turinhub/atomix-common-ui` 不再导出业务组件，组件集成方需要改用组件级 kebab-case 子路径导入，例如 `@turinhub/atomix-common-ui/data-table`、`@turinhub/atomix-common-ui/pdf-reader`。

### 新增

- 新增组件级子路径导出，覆盖 `data-table`、`delete-confirm-dialog`、`table-header`、`table-pagination`、`theme-switcher`、`theme-switcher-content`、`file-upload`、`simple-pdf-reader`、`pdf-reader`、`pdf-sidebar`、`utils` 和 `component-types`。
- 新增 `MarkdownReader` 组件，支持本地 Markdown 文本、`sourceUrl` 远程加载、GFM 表格、任务列表、链接、图片、代码块、加载态、错误态和空状态。
- 新增 `MarkdownReader` 子路径导出，支持 `@turinhub/atomix-common-ui/markdown-reader` 和 `@turinhub/atomix-common-ui/components/MarkdownReader`。
- 新增 `MarkdownReader` 测试用例，覆盖 GFM 渲染、远程加载、链接图片策略、状态渲染和依赖加载失败。
- 新增 `docs/components/MarkdownReader.md`，说明组件接入、可选依赖、URL 加载、链接图片处理和 UI 注入。
- 在 playground 中新增 `MarkdownReader` 示例页，用于验证本地内容、远程加载、加载态、错误态和空状态。

### 变更

- 将 Vite library build 改为多入口构建，输出独立的 ESM、CJS 和类型声明文件，以降低消费端引入单个组件时的打包体积。
- 优化 `PDFReader` 默认阅读体验，默认使用单页模式以降低大文件初始渲染压力。
- 优化 `PDFReader` 滚动模式交互，页码仅显示当前滚动位置，隐藏上一页/下一页按钮并禁用页码输入。
- 优化 `PDFSidebar` 缩略图生成策略，支持当前页附近预加载和滚动可见项懒加载。
- 更新 PDF Reader 文档，明确 PDF 专项能力、内网资源配置建议和滚动模式行为。

### 修复

- 修复 `PDFReader` 切换 `url` 后旧文档状态未正确重置的问题。
- 修复 `PDFReader` 快捷键在输入类元素聚焦时仍会触发翻页或缩放的问题。
- 修复 `MarkdownReader` 在父组件传入新的 `onLoadError` 回调引用时重复加载运行时依赖或重新请求 `sourceUrl` 的问题。

## [0.3.0] - 2026-05-28

### 新增

- 新增 `FileUpload` 标准文件上传界面组件，支持拖拽选择、单/多文件、文件类型和大小校验、上传进度、失败重试与清空。
- 新增 `FileUpload` 测试用例，覆盖文件选择、校验、上传成功和失败重试。
- 新增 `docs/components/FileUpload.md`，说明如何接入 Tale JS SDK 的直接上传和两阶段上传流程。
- 在 playground 中新增上传界面示例页，用于验证上传 UI 的交互状态。

### 变更

- 统一文档目录结构，将 Agent 内部文档迁移到 `docs/agent`，将组件公开文档迁移到 `docs/components`。
- 更新 `Agent.md`、`README.md` 和 `USAGE.md`，补充 `FileUpload` 与新的文档路径。

## [0.2.2] - 2026-03-24

### 修复

- 修复 `SimplePDFReader` 组件中 `useEffect` hook 缺少 `controlledPage` 依赖导致的 ESLint 警告。
- 统一项目内代码格式规范。
- 优化 `PDFReader` 组件代码结构和格式。
- 修复 `package.json` 中的依赖问题。

## [0.2.1] - 2026-03-20

### 新增

- 新增 `PDFReader` 组件，提供高级 PDF 阅读能力。
- 新增 `PDFSidebar` 组件，支持缩略图和书签导航。
- 新增 `ScrollArea` 和 `Tabs` UI 组件，用于增强功能表现。
- 支持页面旋转、显示模式切换和键盘快捷键。
- 支持移动端响应式导航控制。
- 为 `PDFReader` 和 `PDFSidebar` 补充完整测试覆盖（37 个测试用例）。
- 新增 `PDFReader` 组件详细 API 文档。

### 变更

- 增强 `SimplePDFReader` 的快捷键支持和错误处理。
- 更新 playground，增加 `PDFReader` 演示。
- 改进 PDF 组件的类型定义。
- 改进 PDF 组件的错误处理和加载状态。

## [0.2.0] - 2026-03-19

### 新增

- 新增 `SimplePDFReader` 组件，提供完整的 PDF 阅读能力。
- 支持 PDF 导航、缩放控制和页码管理。
- 支持全屏模式和可定制的 UI 组件注入。
- 为 `SimplePDFReader` 补充完整测试覆盖（19 个测试用例）。
- 新增 `SimplePDFReader` 组件详细 API 文档。

### 变更

- 增强 `TablePagination` 组件功能。
- 改进 `DataTable` 组件集成。
- 改进所有文件的代码格式和一致性。
- 更新 playground 示例，增加新组件演示。

## [0.1.2] - 2026-03-16

### 新增

- 新增 `ThemeSwitcher` 组件，支持下拉菜单。
- 新增 `ThemeSwitcherContent` 组件，可嵌入现有下拉菜单。
- 支持自定义主题图标和标签。
- 使用单选组模式进行主题选择。
- 为 `ThemeSwitcher` 和 `ThemeSwitcherContent` 补充完整测试覆盖。

### 变更

- 增强 playground，增加主题切换演示。
- 更新 API 文档，补充 `ThemeSwitcher` 相关组件。

## [0.1.0] - 2026-03-16

### 新增

- 初始版本发布。
- 新增 `DataTable` 组件，支持分页和操作列。
- 新增 `TableHeader` 组件，支持搜索功能。
- 新增 `TablePagination` 组件，支持每页条数选择。
- 新增 `DeleteConfirmDialog` 组件，支持验证确认。
- 完整 TypeScript 支持。
- Tailwind CSS 集成。
- 采用组件注入模式，提供最大灵活性。
- 为当前 `actions` API 补充 `DataTable` 操作列测试覆盖。
- 补充 `TableHeaderComponent` 和 `TablePaginationComponent` 注入使用示例。
- 补充与公开 API 对齐的显式类型导出使用示例。
