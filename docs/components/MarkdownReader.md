# MarkdownReader

轻量 Markdown 在线阅读组件。组件负责只读渲染 Markdown 文本，支持 GFM 表格、任务列表、链接、图片、代码块、加载态、错误态和空状态。

## 设计目标

`MarkdownReader` 面向文档、公告、说明、任务详情等只读内容预览场景。Markdown 解析依赖采用可选 peer dependency，只有实际使用该组件的业务项目需要安装相关包。

v1 不支持编辑、原始 HTML、数学公式、Mermaid 和代码语法高亮。

## 安装可选依赖

```bash
pnpm add react-markdown remark-gfm
```

## 基础用法

推荐使用子路径入口，避免未使用该组件时触发 Markdown 相关依赖解析。

```tsx
import { MarkdownReader } from '@turinhub/atomix-common-ui/components/MarkdownReader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

<MarkdownReader
  content="# MarkdownReader\n\n- [x] 支持 GFM\n- [ ] 只读渲染"
  components={{
    Card,
    CardContent,
    Skeleton,
  }}
/>;
```

## 从 URL 加载

```tsx
<MarkdownReader
  sourceUrl="/docs/intro.md"
  components={{
    Card,
    CardContent,
    Skeleton,
  }}
  onLoadError={(error) => {
    console.error(error);
  }}
/>
```

如果同时传入 `content` 和 `sourceUrl`，组件会优先渲染 `content`，不会请求 `sourceUrl`。

## 链接和图片

```tsx
<MarkdownReader
  content={markdown}
  allowImages={false}
  openLinksInNewTab
  transformLinkHref={(href) => href}
  transformImageSrc={(src) => `/proxy-image?url=${encodeURIComponent(src)}`}
/>
```

- `allowImages` 默认为 `true`；设为 `false` 时图片会渲染为普通链接。
- `openLinksInNewTab` 默认为 `true`；链接会带上 `target="_blank"` 和 `rel="noreferrer noopener"`。
- 默认不启用 raw HTML 渲染，避免把不可信 Markdown 中的 HTML 直接注入页面。

## Props

| Prop                | 类型                                    | 默认值                      | 说明                         |
| ------------------- | --------------------------------------- | --------------------------- | ---------------------------- |
| `content`           | `string`                                | -                           | Markdown 文本                |
| `sourceUrl`         | `string`                                | -                           | Markdown 文本 URL            |
| `components`        | `MarkdownReaderUIComponents`            | -                           | 可选 UI 组件注入             |
| `loading`           | `boolean`                               | `false`                     | 外部加载态                   |
| `error`             | `Error \| string \| null`               | -                           | 外部错误态                   |
| `className`         | `string`                                | -                           | 外层容器类名                 |
| `contentClassName`  | `string`                                | -                           | 内容区域类名                 |
| `loadingText`       | `string`                                | `正在加载 Markdown 内容...` | 加载文案                     |
| `errorText`         | `string`                                | `Markdown 加载失败`         | 错误标题                     |
| `emptyText`         | `string`                                | `暂无 Markdown 内容`        | 空状态文案                   |
| `allowImages`       | `boolean`                               | `true`                      | 是否渲染图片                 |
| `openLinksInNewTab` | `boolean`                               | `true`                      | 是否新窗口打开链接           |
| `transformLinkHref` | `(href: string) => string \| undefined` | -                           | 链接地址转换                 |
| `transformImageSrc` | `(src: string) => string \| undefined`  | -                           | 图片地址转换                 |
| `onLoadError`       | `(error: Error) => void`                | -                           | 依赖加载或远程内容加载失败时 |

## UI 注入

```tsx
components={{
  Card,
  CardContent,
  Skeleton,
}}
```

全部 UI 注入项都是可选的。未传 `Card` 时，组件使用普通 `div` 渲染。
