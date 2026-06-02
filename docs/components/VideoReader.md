# VideoReader

视频在线预览组件。组件使用浏览器原生 `<video>` 渲染常见视频格式，提供加载态、错误态、格式校验、新窗口打开和字幕轨道能力。

## 支持格式

默认支持这些常见浏览器视频格式：

- `mp4`
- `webm`
- `ogg` / `ogv`
- `mov`
- `m4v`

实际播放能力仍取决于浏览器和编码格式。例如同为 `mp4`，不同视频编码在不同浏览器中的支持情况可能不同。

## 基础用法

```tsx
import { VideoReader } from '@turinhub/atomix-common-ui/video-reader';

<VideoReader
  src="/attachments/demo.mp4"
  title="演示视频"
  fileName="demo.mp4"
  mimeType="video/mp4"
/>;
```

## 字幕轨道

```tsx
<VideoReader
  src="/attachments/demo.webm"
  tracks={[
    {
      src: '/attachments/demo.zh.vtt',
      kind: 'subtitles',
      srcLang: 'zh-CN',
      label: '中文',
      default: true,
    },
  ]}
/>;
```

## Props

| Prop                     | 类型                         | 默认值             | 说明                         |
| ------------------------ | ---------------------------- | ------------------ | ---------------------------- |
| `src`                    | `string`                     | -                  | 视频地址                     |
| `fileName`               | `string`                     | -                  | 文件名，用于格式识别         |
| `mimeType`               | `string`                     | -                  | MIME 类型，用于格式识别      |
| `title`                  | `string`                     | -                  | 标题，也会传给 `<video>`     |
| `components`             | `VideoReaderUIComponents`    | -                  | 可选 UI 组件注入             |
| `tracks`                 | `VideoReaderTrack[]`         | -                  | 字幕、章节等 `<track>` 配置  |
| `loading`                | `boolean`                    | `false`            | 外部加载态                   |
| `error`                  | `Error \| string \| null`    | -                  | 外部错误态                   |
| `showToolbar`            | `boolean`                    | `true`             | 是否显示顶部工具栏           |
| `showOpenInNewTab`       | `boolean`                    | `true`             | 是否显示新窗口打开按钮       |
| `allowUnsupportedFormat` | `boolean`                    | `false`            | 是否跳过格式白名单校验       |
| `supportedExtensions`    | `readonly string[]`          | 常见视频格式       | 自定义扩展名白名单           |
| `supportedMimeTypes`     | `readonly string[]`          | 常见视频 MIME 类型 | 自定义 MIME 白名单           |
| `controls`               | `boolean`                    | `true`             | 是否启用浏览器播放控件       |
| `preload`                | `string`                     | `'metadata'`       | 视频预加载策略               |
| `playsInline`            | `boolean`                    | `true`             | 移动端是否内联播放           |
| `onLoadedData`           | `() => void`                 | -                  | 视频数据加载完成回调         |
| `onError`                | `(error: Error) => void`     | -                  | 视频加载失败回调             |

