# 变更日志

本项目的所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。

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
