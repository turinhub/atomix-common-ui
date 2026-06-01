# FileUpload

标准文件上传界面组件。组件负责选择文件、拖拽上传、文件校验、上传状态、进度、失败重试和清空；真实上传逻辑由业务侧通过 `onUpload` 注入。

## 设计目标

Tale JS SDK 中上传能力主要有两类：

- 直接上传：使用 `uploadAttachment`、`uploadFileAttachment` 等 multipart 接口。
- 两阶段上传：先获取上传授权或预签名 URL，再上传到对象存储，最后调用 complete 接口。

`FileUpload` 不直接依赖 SDK，而是提供标准 UI 和状态编排，让业务侧可以接入任意上传流程。

## 基础用法

```tsx
import { FileUpload } from '@turinhub/atomix-common-ui/file-upload';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const uploadUI = {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
};

<FileUpload
  components={uploadUI}
  accept=".pdf,image/*"
  maxSize={20 * 1024 * 1024}
  onUpload={async (item, { setProgress }) => {
    setProgress(20);
    // 在这里调用业务上传接口
    setProgress(100);
    return { fileId: 'uploaded-file-id' };
  }}
/>;
```

## 接入 Tale SDK 直接上传

```tsx
import { uploadAttachment } from '@tale/client';

<FileUpload
  components={uploadUI}
  multiple
  accept=".pdf,.doc,.docx,image/*"
  onUpload={async (item, { setProgress }) => {
    setProgress(10);
    const attachment = await uploadAttachment({
      attachmentTypeId: 'attachment-type-id',
      refType: 'task',
      refId: 'task-id',
      file: item.file,
      fileName: item.name,
      fileType: item.type,
    });
    setProgress(100);
    return attachment;
  }}
/>;
```

## 接入 Tale SDK 两阶段上传

```tsx
import { fileUploadComplete, getUploadAuthorization } from '@tale/client';

<FileUpload
  components={uploadUI}
  accept=".pdf,.doc,.docx"
  onUpload={async (item, { setProgress }) => {
    const auth = await getUploadAuthorization({
      folderId: 'folder-id',
      fileName: item.name,
      fileType: 'PDF',
    });
    setProgress(20);

    const response = await fetch(auth.presignedUrl, {
      method: 'PUT',
      body: item.file,
      headers: item.type ? { 'Content-Type': item.type } : undefined,
    });
    const etag = response.headers.get('etag') ?? '';
    setProgress(80);

    await fileUploadComplete(auth.fileId, {
      ossKey: auth.ossKey,
      fileSize: item.size,
      etag,
    });
    setProgress(100);

    return auth;
  }}
/>;
```

## Props

| Prop               | 类型                                     | 默认值     | 说明                     |
| ------------------ | ---------------------------------------- | ---------- | ------------------------ |
| `components`       | `FileUploadUIComponents`                 | -          | UI 组件注入对象          |
| `title`            | `ReactNode`                              | `文件上传` | 标题                     |
| `description`      | `ReactNode`                              | -          | 描述                     |
| `helperText`       | `ReactNode`                              | -          | 辅助说明                 |
| `accept`           | `string`                                 | -          | 文件类型限制             |
| `multiple`         | `boolean`                                | `false`    | 是否允许多文件           |
| `maxFiles`         | `number`                                 | -          | 最大文件数               |
| `maxSize`          | `number`                                 | -          | 单文件最大字节数         |
| `disabled`         | `boolean`                                | `false`    | 禁用状态                 |
| `autoUpload`       | `boolean`                                | `false`    | 选择后自动上传           |
| `showUploadButton` | `boolean`                                | 自动判断   | 是否显示上传按钮         |
| `showResetButton`  | `boolean`                                | `true`     | 是否显示清空按钮         |
| `validateFile`     | `(file, currentItems) => string \| void` | -          | 自定义校验，返回错误文本 |
| `onFilesChange`    | `(items) => void`                        | -          | 文件列表变化回调         |
| `onUpload`         | `(item, helpers) => Promise<TResult>`    | -          | 上传实现                 |
| `onUploadComplete` | `(item) => void`                         | -          | 单文件上传完成回调       |
| `onUploadError`    | `(item, error) => void`                  | -          | 单文件上传失败回调       |

## UI 注入

```tsx
components={{
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
}}
```

`CardHeader`、`CardTitle`、`CardDescription`、`CardFooter` 是可选项；缺少时组件会使用普通布局兜底。
