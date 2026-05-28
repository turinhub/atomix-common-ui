# PDFReader

功能完整的 PDF 阅读器组件，提供专业级的 PDF 阅读功能，包括侧边栏导航、页面旋转、显示模式切换等高级特性。

## 特性

- ✅ **页面导航** - 支持上一页/下一页、页码输入跳转
- ✅ **缩放控制** - 支持 0.5x - 2.5x 缩放范围
- ✅ **页面旋转** - 支持 90° 递增旋转
- ✅ **显示模式** - 支持单页/滚动模式切换
- ✅ **侧边栏导航** - 缩略图和书签导航
- ✅ **全屏模式** - 支持全屏阅读
- ✅ **键盘快捷键** - 左右箭头翻页、Ctrl+/- 缩放
- ✅ **移动端适配** - 响应式布局，底部固定导航
- ✅ **受控/非受控模式** - 灵活的状态管理

## 与 SimplePDFReader 的对比

| 特性         | SimplePDFReader | PDFReader      |
| ------------ | --------------- | -------------- |
| 翻页控制     | ✅              | ✅             |
| 缩放控制     | ✅              | ✅             |
| 全屏模式     | ✅              | ✅             |
| 侧边栏导航   | ❌              | ✅             |
| 页面旋转     | ❌              | ✅             |
| 显示模式切换 | ❌              | ✅             |
| 键盘快捷键   | ❌              | ✅             |
| 移动端导航   | ❌              | ✅             |
| UI 组件数量  | 6 个            | 10+ 个（可选） |

**何时使用 SimplePDFReader**：

- 只需要基础的 PDF 阅读功能
- 追求更小的打包体积
- 不需要高级功能

**何时使用 PDFReader**：

- 需要完整的 PDF 阅读体验
- 需要书签和缩略图导航
- 需要页面旋转和显示模式切换

## 安装依赖

确保项目中已安装以下依赖：

```bash
npm install react-pdf pdfjs-dist
# 或
pnpm add react-pdf pdfjs-dist
```

## 基础用法

```tsx
import { PDFReader } from '@turinhub/atomix-common-ui';
import { Card, Button, Input, Skeleton } from '@/components/ui';
import { Tabs, ScrollArea } from '@/components/ui';

function MyPDFViewer() {
  return (
    <PDFReader
      url="/documents/sample.pdf"
      components={{
        Card,
        CardContent: Card.Content,
        Button,
        Input,
        Skeleton,
        Tabs,
        TabsList: Tabs.List,
        TabsTrigger: Tabs.Trigger,
        TabsContent: Tabs.Content,
        ScrollArea,
      }}
    />
  );
}
```

## 功能配置

### 侧边栏导航

显示缩略图和书签导航：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  showSidebar={true}
  components={components}
/>
```

### 页面旋转

启用页面旋转功能：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  showRotation={true}
  initialRotation={0}
  onRotationChange={(rotation) => console.log('Rotation:', rotation)}
  components={components}
/>
```

### 显示模式切换

支持单页和滚动模式切换：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  showModeToggle={true}
  displayMode="scroll" // 或 "single"
  components={components}
/>
```

### 键盘快捷键

启用键盘快捷键（默认启用）：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  enableHotkeys={true}
  components={components}
/>
```

支持的快捷键：

- `←` / `→` - 上一页/下一页
- `Ctrl` + `+` - 放大
- `Ctrl` + `-` - 缩小

### 移动端导航

启用移动端底部导航（默认启用）：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  enableMobileNav={true}
  components={components}
/>
```

## 受控模式

```tsx
function ControlledPDFViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  return (
    <PDFReader
      url="/documents/sample.pdf"
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      scale={scale}
      onScaleChange={setScale}
      rotation={rotation}
      onRotationChange={setRotation}
      components={components}
    />
  );
}
```

## 自定义配置

### 缩放限制

```tsx
<PDFReader
  url="/documents/sample.pdf"
  initialScale={1.5}
  minScale={0.5}
  maxScale={3.0}
  components={components}
/>
```

### 自定义文本

```tsx
<PDFReader
  url="/documents/sample.pdf"
  loadingText="正在加载 PDF 文档..."
  errorText="无法加载 PDF 文件"
  components={components}
/>
```

### 自定义样式

```tsx
<PDFReader
  url="/documents/sample.pdf"
  className="h-screen w-full"
  toolbarClassName="bg-primary text-primary-foreground"
  contentClassName="p-4"
  pageClassName="shadow-lg"
  components={components}
/>
```

### Worker 文件配置

默认使用 CDN，你可以自定义 Worker 文件位置：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  workerUrl="/pdf.worker.min.mjs"
  cMapUrl="/cmaps/"
  standardFontDataUrl="/standard_fonts/"
  components={components}
/>
```

## 组件注入

PDFReader 需要注入以下 UI 组件：

### 必需组件

```tsx
components={{
  Card,                    // Card 组件
  CardContent,             // Card.Content 组件
  Button,                  // Button 组件
  Input,                   // Input 组件
  Skeleton,                // Skeleton 组件
}}
```

### 可选组件（showSidebar=true 时必需）

```tsx
components={{
  // ... 必需组件
  Tabs,                    // Tabs 组件
  TabsList,                // Tabs.List 组件
  TabsTrigger,             // Tabs.Trigger 组件
  TabsContent,             // Tabs.Content 组件
  ScrollArea,              // ScrollArea 组件
}}
```

## 回调函数

```tsx
<PDFReader
  url="/documents/sample.pdf"
  onLoadSuccess={(pdf) => {
    console.log('PDF loaded successfully:', pdf.numPages);
  }}
  onLoadError={(error) => {
    console.error('Failed to load PDF:', error);
  }}
  onPageRender={(pageIndex) => {
    console.log('Page rendered:', pageIndex);
  }}
  components={components}
/>
```

## 功能开关

你可以通过以下 prop 控制功能显示：

```tsx
<PDFReader
  url="/documents/sample.pdf"
  showToolbar={true} // 显示工具栏
  showSidebar={true} // 显示侧边栏
  showRotation={true} // 显示旋转按钮
  showModeToggle={true} // 显示模式切换按钮
  showFullscreen={true} // 显示全屏按钮
  enableHotkeys={true} // 启用键盘快捷键
  enableMobileNav={true} // 启用移动端导航
  components={components}
/>
```

## 常见问题

### 1. Worker 文件加载失败

默认使用 CDN 加载 Worker 文件。如果遇到 CORS 问题，可以：

1. 下载 Worker 文件到本地
2. 配置 `workerUrl` prop 指向本地文件

```tsx
<PDFReader
  url="/documents/sample.pdf"
  workerUrl="/pdf.worker.min.mjs"
  components={components}
/>
```

### 2. 侧边栏不显示

确保注入了所有必需的组件：

```tsx
components={{
  // ... 其他必需组件
  Tabs,
  TabsList: Tabs.List,
  TabsTrigger: Tabs.Trigger,
  TabsContent: Tabs.Content,
  ScrollArea,
}}
```

### 3. 性能优化建议

- 对于大型 PDF 文件，考虑使用虚拟滚动
- 限制缩略图生成数量（通过调整组件内部逻辑）
- 使用 `displayMode="single"` 减少初始渲染压力

## API 参考

### PDFReaderProps

| 属性                  | 类型                              | 默认值                 | 描述                 |
| --------------------- | --------------------------------- | ---------------------- | -------------------- |
| `url`                 | `string`                          | -                      | PDF 文件 URL（必需） |
| `initialPage`         | `number`                          | `1`                    | 初始页码             |
| `initialScale`        | `number`                          | `1.0`                  | 初始缩放比例         |
| `initialRotation`     | `number`                          | `0`                    | 初始旋转角度         |
| `currentPage`         | `number`                          | -                      | 当前页码（受控）     |
| `onPageChange`        | `(page: number) => void`          | -                      | 页码变化回调         |
| `scale`               | `number`                          | -                      | 缩放比例（受控）     |
| `onScaleChange`       | `(scale: number) => void`         | -                      | 缩放变化回调         |
| `rotation`            | `number`                          | -                      | 旋转角度（受控）     |
| `onRotationChange`    | `(rotation: number) => void`      | -                      | 旋转变化回调         |
| `minScale`            | `number`                          | `0.5`                  | 最小缩放比例         |
| `maxScale`            | `number`                          | `2.5`                  | 最大缩放比例         |
| `showToolbar`         | `boolean`                         | `true`                 | 显示工具栏           |
| `showSidebar`         | `boolean`                         | `true`                 | 显示侧边栏           |
| `showRotation`        | `boolean`                         | `true`                 | 显示旋转按钮         |
| `showModeToggle`      | `boolean`                         | `true`                 | 显示模式切换按钮     |
| `showFullscreen`      | `boolean`                         | `true`                 | 显示全屏按钮         |
| `enableHotkeys`       | `boolean`                         | `true`                 | 启用键盘快捷键       |
| `enableMobileNav`     | `boolean`                         | `true`                 | 启用移动端导航       |
| `displayMode`         | `'scroll' \| 'single'`            | `'scroll'`             | 显示模式             |
| `className`           | `string`                          | -                      | 容器类名             |
| `toolbarClassName`    | `string`                          | -                      | 工具栏类名           |
| `contentClassName`    | `string`                          | -                      | 内容区域类名         |
| `pageClassName`       | `string`                          | -                      | 页面类名             |
| `workerUrl`           | `string`                          | -                      | Worker 文件 URL      |
| `cMapUrl`             | `string`                          | -                      | CMap 文件 URL        |
| `standardFontDataUrl` | `string`                          | -                      | 标准字体数据 URL     |
| `components`          | `PDFReaderUIComponents`           | -                      | UI 组件（必需）      |
| `onLoadSuccess`       | `(pdf: PDFDocumentProxy) => void` | -                      | 加载成功回调         |
| `onLoadError`         | `(error: Error) => void`          | -                      | 加载错误回调         |
| `onPageRender`        | `(pageIndex: number) => void`     | -                      | 页面渲染回调         |
| `loadingText`         | `string`                          | `'正在加载PDF文档...'` | 加载文本             |
| `errorText`           | `string`                          | `'PDF加载失败'`        | 错误文本             |

## 浏览器支持

- Chrome/Edge（最新版）
- Firefox（最新版）
- Safari（最新版）
- 移动端浏览器（iOS Safari、Chrome Mobile）

## 许可证

MIT
