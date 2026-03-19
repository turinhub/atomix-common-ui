# SimplePDFReader 组件使用示例

## 概述

`SimplePDFReader` 是一个用于在 React 应用中展示和浏览 PDF 文档的组件。它基于 `react-pdf` 库，提供基础的浏览功能（翻页、缩放），并包含性能优化以处理大文件。操作区固定在 PDF 内容上方，并在同一行展示页码/缩放与翻页按钮。

## 安装依赖

在使用 `SimplePDFReader` 组件之前，确保已安装以下依赖：

```bash
pnpm install react-pdf pdfjs-dist
```

## 基本用法

```tsx
import { SimplePDFReader } from '@turinhub/atomix-common-ui';
import { Card, Button, Label, Skeleton } from '@/components/ui';

function MyComponent() {
  return (
    <SimplePDFReader
      url="/documents/sample.pdf"
      components={{
        Card,
        CardContent: Card.Content,
        CardFooter: Card.Footer,
        Button,
        Label,
        Skeleton,
      }}
    />
  );
}
```

## 完整示例

```tsx
import { SimplePDFReader } from '@turinhub/atomix-common-ui';
import { Card, Button, Label, Skeleton } from '@/components/ui';

function PDFViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);

  return (
    <div className="container mx-auto py-8">
      <SimplePDFReader
        url="/documents/sample.pdf"
        components={{
          Card,
          CardContent: Card.Content,
          CardFooter: Card.Footer,
          Button,
          Label,
          Skeleton,
        }}
        initialPage={1}
        initialScale={1.0}
        scale={scale}
        onScaleChange={setScale}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        showToolbar={true}
        showPagination={true}
        minScale={0.5}
        maxScale={3.0}
        onLoadSuccess={(pdf) => {
          console.log(`PDF 加载成功，共 ${pdf.numPages} 页`);
        }}
        onLoadError={(error) => {
          console.error('PDF 加载失败:', error);
        }}
        loadingText="正在加载 PDF..."
        errorText="PDF 加载失败"
        className="shadow-lg"
        containerClassName="min-h-[600px]"
      />
    </div>
  );
}
```

## Props 说明

### 必需的 Props

| Prop         | 类型                          | 说明            |
| ------------ | ----------------------------- | --------------- |
| `url`        | `string`                      | PDF 文件的 URL  |
| `components` | `SimplePDFReaderUIComponents` | UI 组件注入对象 |

### 可选的 Props

#### 初始状态

| Prop           | 类型     | 默认值 | 说明         |
| -------------- | -------- | ------ | ------------ |
| `initialPage`  | `number` | `1`    | 初始页码     |
| `initialScale` | `number` | `1.0`  | 初始缩放比例 |

#### 缩放控制

| Prop            | 类型                      | 默认值 | 说明               |
| --------------- | ------------------------- | ------ | ------------------ |
| `scale`         | `number`                  | -      | 受控模式的缩放比例 |
| `onScaleChange` | `(scale: number) => void` | -      | 缩放变化回调       |
| `minScale`      | `number`                  | `0.5`  | 最小缩放比例       |
| `maxScale`      | `number`                  | `3.0`  | 最大缩放比例       |

#### 页面导航

| Prop           | 类型                     | 默认值 | 说明               |
| -------------- | ------------------------ | ------ | ------------------ |
| `currentPage`  | `number`                 | -      | 受控模式的当前页码 |
| `onPageChange` | `(page: number) => void` | -      | 页面变化回调       |

#### 功能开关

| Prop             | 类型      | 默认值 | 说明                                 |
| ---------------- | --------- | ------ | ------------------------------------ |
| `showToolbar`    | `boolean` | `true` | 是否显示顶部操作行中的页码与缩放区域 |
| `showPagination` | `boolean` | `true` | 是否显示顶部操作行中的翻页控制区域   |

#### 样式定制

| Prop                 | 类型     | 默认值 | 说明            |
| -------------------- | -------- | ------ | --------------- |
| `className`          | `string` | -      | Card 组件的类名 |
| `containerClassName` | `string` | -      | 内容容器的类名  |
| `pageClassName`      | `string` | -      | PDF 页面的类名  |

#### 回调函数

| Prop            | 类型                              | 说明             |
| --------------- | --------------------------------- | ---------------- |
| `onLoadSuccess` | `(pdf: PDFDocumentProxy) => void` | PDF 加载成功回调 |
| `onLoadError`   | `(error: Error) => void`          | PDF 加载失败回调 |

#### 加载状态文本

| Prop          | 类型     | 默认值        | 说明             |
| ------------- | -------- | ------------- | ---------------- |
| `loadingText` | `string` | `"加载中..."` | 加载状态提示文本 |
| `errorText`   | `string` | `"加载失败"`  | 错误状态提示文本 |

## 性能优化

`SimplePDFReader` 组件内置了以下性能优化：

1. **懒加载**：仅渲染当前页面
2. **预加载**：自动预渲染相邻页面（上一页和下一页）以实现平滑翻页
3. **虚拟化**：避免同时渲染过多页面
4. **缓存**：已加载的页面会被缓存

## 受控与非受控模式

### 非受控模式（默认）

```tsx
<SimplePDFReader
  url="/documents/sample.pdf"
  components={...}
  initialPage={1}
  initialScale={1.0}
  onPageChange={(page) => console.log('当前页:', page)}
  onScaleChange={(scale) => console.log('当前缩放:', scale)}
/>
```

### 受控模式

```tsx
function ControlledSimplePDFReader() {
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);

  return (
    <>
      <SimplePDFReader
        url="/documents/sample.pdf"
        components={...}
        currentPage={page}
        scale={scale}
        onPageChange={setPage}
        onScaleChange={setScale}
      />
      <div className="mt-4">
        <p>当前页: {page}</p>
        <p>当前缩放: {Math.round(scale * 100)}%</p>
      </div>
    </>
  );
}
```

## 错误处理

```tsx
<SimplePDFReader
  url="/documents/invalid.pdf"
  components={...}
  onLoadError={(error) => {
    console.error('PDF 加载失败:', error.message);
    // 可以在这里添加自定义错误处理逻辑
    toast.error('PDF 加载失败，请检查文件路径');
  }}
  errorText="无法加载 PDF 文件"
/>
```

## 自定义样式

```tsx
<SimplePDFReader
  url="/documents/sample.pdf"
  components={...}
  className="w-full max-w-4xl mx-auto shadow-2xl rounded-lg"
  containerClassName="bg-gray-50 dark:bg-gray-900"
  pageClassName="my-4"
/>
```

## 注意事项

1. **CORS 问题**：确保 PDF 文件服务器正确配置了 CORS 头
2. **文件大小**：对于大文件，建议使用分片加载或服务端渲染
3. **Worker 配置**：组件会自动配置 PDF.js worker，使用 CDN 加载
4. **浏览器兼容性**：需要支持现代浏览器（Chrome、Firefox、Safari、Edge）

## TypeScript 类型

```typescript
import type {
  SimplePDFReaderProps,
  SimplePDFReaderUIComponents,
  PDFDocumentProxy,
} from '@turinhub/atomix-common-ui';
```

## 完整的 UI 组件示例

```tsx
import { Card, Button, Label, Skeleton } from '@/components/ui/card';

// 使用 shadcn/ui 组件
const components = {
  Card,
  CardContent: Card.Content,
  CardFooter: Card.Footer,
  Button,
  Label,
  Skeleton,
};

<SimplePDFReader url="/documents/sample.pdf" components={components} />;
```
