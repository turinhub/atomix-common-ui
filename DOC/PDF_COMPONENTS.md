# PDF Components For Agents

## 组件分工

- `SimplePDFReader`：轻量 PDF 阅读器，提供基础翻页、缩放、加载和错误状态。
- `PDFReader`：完整 PDF 阅读器，提供侧边栏、缩略图/书签、旋转、显示模式、全屏、快捷键、移动端导航等能力。
- `PDFSidebar`：PDFReader 的侧边栏导航，负责缩略图和书签展示。

公开用户文档在：

- `docs/SimplePDFReader.md`
- `docs/PDFReader.md`

## 依赖和外部资源

PDF 能力依赖 `react-pdf` 和 `pdfjs-dist`。Worker、CMap、标准字体数据可能来自 CDN 或用户传入的本地路径。

修改 PDF 组件时要关注：

- Worker URL 是否可覆盖。
- CORS 失败和文件加载失败是否有清晰错误状态。
- `onLoadSuccess`、`onLoadError`、`onPageRender` 是否按预期触发。
- 大文件场景下是否避免不必要的全量渲染。
- 测试环境中 PDF.js 或 DOM API mock 是否仍然有效。

## PDFReader 注意事项

`PDFReader` 的 `components` 中，以下是基础必需项：

- `Card`
- `CardContent`
- `Button`
- `Input`
- `Skeleton`

`showSidebar=true` 时还需要：

- `Tabs`
- `TabsList`
- `TabsTrigger`
- `TabsContent`
- `ScrollArea`

修改侧边栏、书签、缩略图时，要同步检查 `PDFSidebar` 的 props 和 `PDFReaderUIComponents` 的可选注入类型。

## 状态模式

PDF 组件支持受控和非受控状态。修改时要确保：

- `currentPage` 与 `onPageChange` 配套工作。
- `scale` 与 `onScaleChange` 配套工作。
- `rotation` 与 `onRotationChange` 配套工作。
- 初始值只作为非受控默认值，不覆盖受控值。

## 交互风险

- 快捷键要避免在输入框聚焦时误触。
- 缩放和页码输入要限制边界。
- 全屏状态需要处理进入和退出两条路径。
- 移动端导航不应遮挡主要内容。
- 滚动模式和单页模式切换后页码、缩放、旋转应保持一致。

## 测试建议

PDF 相关测试优先覆盖：

- 加载、错误、空状态。
- 页码跳转和边界。
- 缩放上下限。
- 受控/非受控回调。
- 侧边栏开关和缺少侧边栏注入组件的行为。
- 快捷键开关。

如果测试依赖 mock，修改实现后要同步检查 mock 与真实调用是否一致。
