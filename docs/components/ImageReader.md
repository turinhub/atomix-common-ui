# ImageReader

图片在线预览组件。组件使用浏览器原生 `<img>` 渲染常见图片格式，提供加载态、错误态、格式校验、缩放、旋转和新窗口打开能力。

## 支持格式

默认支持这些常见浏览器图片格式：

- `jpg` / `jpeg`
- `png`
- `gif`
- `webp`
- `svg`
- `bmp`
- `avif`
- `ico`

也可以通过 `supportedExtensions`、`supportedMimeTypes` 或 `allowUnsupportedFormat` 调整校验策略。

## 基础用法

```tsx
import { ImageReader } from '@turinhub/atomix-common-ui/image-reader';

<ImageReader
  src="/attachments/screenshot.webp"
  alt="页面截图"
  fileName="screenshot.webp"
  mimeType="image/webp"
/>;
```

## UI 注入

```tsx
<ImageReader
  src="/attachments/photo.jpg"
  components={{
    Card,
    CardContent,
    Button,
    Skeleton,
  }}
/>
```

全部 UI 注入项都是可选的。未传 `Button` 时组件会使用原生 `button` 渲染工具栏按钮。

## Props

| Prop                     | 类型                                                       | 默认值             | 说明                    |
| ------------------------ | ---------------------------------------------------------- | ------------------ | ----------------------- |
| `src`                    | `string`                                                   | -                  | 图片地址                |
| `alt`                    | `string`                                                   | `''`               | 图片替代文本            |
| `fileName`               | `string`                                                   | -                  | 文件名，用于格式识别    |
| `mimeType`               | `string`                                                   | -                  | MIME 类型，用于格式识别 |
| `components`             | `ImageReaderUIComponents`                                  | -                  | 可选 UI 组件注入        |
| `loading`                | `boolean`                                                  | `false`            | 外部加载态              |
| `error`                  | `Error \| string \| null`                                  | -                  | 外部错误态              |
| `showToolbar`            | `boolean`                                                  | `true`             | 是否显示工具栏          |
| `showOpenInNewTab`       | `boolean`                                                  | `true`             | 是否显示新窗口打开按钮  |
| `objectFit`              | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'contain'`        | 图片填充方式            |
| `initialScale`           | `number`                                                   | `1`                | 初始缩放                |
| `minScale`               | `number`                                                   | `0.25`             | 最小缩放                |
| `maxScale`               | `number`                                                   | `4`                | 最大缩放                |
| `scaleStep`              | `number`                                                   | `0.25`             | 缩放步进                |
| `scale`                  | `number`                                                   | -                  | 受控缩放值              |
| `onScaleChange`          | `(scale: number) => void`                                  | -                  | 缩放变化回调            |
| `rotation`               | `number`                                                   | -                  | 受控旋转角度            |
| `onRotationChange`       | `(rotation: number) => void`                               | -                  | 旋转变化回调            |
| `allowUnsupportedFormat` | `boolean`                                                  | `false`            | 是否跳过格式白名单校验  |
| `supportedExtensions`    | `readonly string[]`                                        | 常见图片格式       | 自定义扩展名白名单      |
| `supportedMimeTypes`     | `readonly string[]`                                        | 常见图片 MIME 类型 | 自定义 MIME 白名单      |
| `onLoad`                 | `() => void`                                               | -                  | 图片加载成功回调        |
| `onError`                | `(error: Error) => void`                                   | -                  | 图片加载失败回调        |
