import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/utils';
import type {
  ButtonComponent,
  CardComponent,
  UIComponent,
} from '../types/component-types';

export type FileUploadStatus = 'ready' | 'uploading' | 'success' | 'error';

export interface FileUploadItem<TResult = unknown> {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  result?: TResult;
}

export interface FileUploadHelpers {
  setProgress: (progress: number) => void;
}

export interface FileUploadUIComponents {
  Card: CardComponent;
  CardHeader?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  CardTitle?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  CardDescription?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  CardContent: UIComponent<HTMLAttributes<HTMLDivElement>>;
  CardFooter?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  Button: ButtonComponent;
}

export interface FileUploadProps<TResult = unknown> {
  components?: FileUploadUIComponents;
  title?: ReactNode;
  description?: ReactNode;
  helperText?: ReactNode;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  autoUpload?: boolean;
  showUploadButton?: boolean;
  showResetButton?: boolean;
  selectLabel?: string;
  uploadLabel?: string;
  retryLabel?: string;
  resetLabel?: string;
  emptyLabel?: ReactNode;
  dropzoneLabel?: ReactNode;
  dropzoneDescription?: ReactNode;
  uploadingText?: string;
  successText?: string;
  errorText?: string;
  className?: string;
  dropzoneClassName?: string;
  listClassName?: string;
  formatFileSize?: (size: number) => string;
  validateFile?: (
    file: File,
    currentItems: FileUploadItem<TResult>[]
  ) => string | undefined;
  onFilesChange?: (items: FileUploadItem<TResult>[]) => void;
  onUpload?: (
    item: FileUploadItem<TResult>,
    helpers: FileUploadHelpers
  ) => Promise<TResult> | TResult;
  onUploadComplete?: (item: FileUploadItem<TResult>) => void;
  onUploadError?: (item: FileUploadItem<TResult>, error: unknown) => void;
}

const defaultFormatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const createFileId = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2)}`;

const getFileExtension = (fileName: string) => {
  const index = fileName.lastIndexOf('.');
  return index > -1 ? fileName.slice(index).toLowerCase() : '';
};

const matchesAccept = (file: File, accept?: string) => {
  if (!accept) return true;

  const fileType = file.type.toLowerCase();
  const fileExtension = getFileExtension(file.name);

  return accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) {
        return fileExtension === rule;
      }
      if (rule.endsWith('/*')) {
        return fileType.startsWith(rule.slice(0, -1));
      }
      return fileType === rule;
    });
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error) {
    return error;
  }
  return fallback;
};

export function FileUpload<TResult = unknown>({
  components,
  title = '文件上传',
  description = '选择文件后开始上传，支持 Tale SDK 的直接上传和预签名上传流程。',
  helperText,
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  disabled = false,
  autoUpload = false,
  showUploadButton,
  showResetButton = true,
  selectLabel = '选择文件',
  uploadLabel = '开始上传',
  retryLabel = '重试',
  resetLabel = '清空',
  emptyLabel = '尚未选择文件',
  dropzoneLabel = '拖拽文件到这里，或点击选择',
  dropzoneDescription = '上传前会先完成文件校验，上传逻辑由业务侧注入。',
  uploadingText = '上传中',
  successText = '上传完成',
  errorText = '上传失败',
  className,
  dropzoneClassName,
  listClassName,
  formatFileSize = defaultFormatFileSize,
  validateFile,
  onFilesChange,
  onUpload,
  onUploadComplete,
  onUploadError,
}: FileUploadProps<TResult>) {
  const [items, setItems] = useState<FileUploadItem<TResult>[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldShowUploadButton = showUploadButton ?? Boolean(onUpload);
  const resolvedMaxFiles = multiple ? maxFiles : 1;
  const hasUploadableItems = items.some((item) => item.status === 'ready');
  const isUploading = items.some((item) => item.status === 'uploading');

  useEffect(() => {
    onFilesChange?.(items);
  }, [items, onFilesChange]);

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Button,
  } = components;

  const updateItems = (
    updater: (
      currentItems: FileUploadItem<TResult>[]
    ) => FileUploadItem<TResult>[]
  ) => {
    setItems((currentItems) => updater(currentItems));
  };

  const getValidationError = (
    file: File,
    currentItems: FileUploadItem<TResult>[]
  ) => {
    if (maxSize && file.size > maxSize) {
      return `文件不能超过 ${formatFileSize(maxSize)}`;
    }
    if (!matchesAccept(file, accept)) {
      return '文件类型不符合要求';
    }
    return validateFile?.(file, currentItems);
  };

  const createItemsFromFiles = (
    files: File[],
    currentItems: FileUploadItem<TResult>[]
  ) => {
    const nextItems = multiple ? [...currentItems] : [];
    const remainingSlots =
      resolvedMaxFiles === undefined
        ? files.length
        : Math.max(resolvedMaxFiles - nextItems.length, 0);

    files.slice(0, remainingSlots).forEach((file) => {
      const error = getValidationError(file, nextItems);
      nextItems.push({
        id: createFileId(file),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: error ? 'error' : 'ready',
        progress: 0,
        error,
      });
    });

    if (resolvedMaxFiles !== undefined && files.length > remainingSlots) {
      files.slice(remainingSlots).forEach((file) => {
        nextItems.push({
          id: createFileId(file),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'error',
          progress: 0,
          error: `最多只能选择 ${resolvedMaxFiles} 个文件`,
        });
      });
    }

    return nextItems;
  };

  const uploadItem = async (targetItem: FileUploadItem<TResult>) => {
    if (!onUpload || targetItem.status === 'uploading') return;

    updateItems((currentItems) =>
      currentItems.map((item) =>
        item.id === targetItem.id
          ? { ...item, status: 'uploading', progress: item.progress || 5 }
          : item
      )
    );

    const setProgress = (progress: number) => {
      updateItems((currentItems) =>
        currentItems.map((item) =>
          item.id === targetItem.id
            ? {
                ...item,
                progress: Math.max(0, Math.min(100, Math.round(progress))),
              }
            : item
        )
      );
    };

    try {
      const result = await onUpload(targetItem, { setProgress });
      const completedItem = {
        ...targetItem,
        status: 'success' as const,
        progress: 100,
        error: undefined,
        result,
      };
      updateItems((currentItems) =>
        currentItems.map((item) =>
          item.id === targetItem.id ? completedItem : item
        )
      );
      onUploadComplete?.(completedItem);
    } catch (error) {
      const failedItem = {
        ...targetItem,
        status: 'error' as const,
        progress: 0,
        error: getErrorMessage(error, errorText),
      };
      updateItems((currentItems) =>
        currentItems.map((item) =>
          item.id === targetItem.id ? failedItem : item
        )
      );
      onUploadError?.(failedItem, error);
    }
  };

  const uploadReadyItems = async () => {
    const readyItems = items.filter((item) => item.status === 'ready');
    for (const item of readyItems) {
      await uploadItem(item);
    }
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return;
    const files = Array.from(fileList);
    updateItems((currentItems) => {
      const nextItems = createItemsFromFiles(files, currentItems);
      if (autoUpload && onUpload) {
        nextItems
          .filter((item) => item.status === 'ready')
          .forEach((item) => {
            window.setTimeout(() => uploadItem(item), 0);
          });
      }
      return nextItems;
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    updateItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const handleRetry = (item: FileUploadItem<TResult>) => {
    const error = getValidationError(
      item.file,
      items.filter((currentItem) => currentItem.id !== item.id)
    );
    if (error) {
      updateItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, error } : currentItem
        )
      );
      return;
    }
    uploadItem({ ...item, status: 'ready', error: undefined, progress: 0 });
  };

  const renderStatus = (item: FileUploadItem<TResult>) => {
    if (item.status === 'uploading') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {uploadingText}
        </span>
      );
    }
    if (item.status === 'success') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {successText}
        </span>
      );
    }
    if (item.status === 'error') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
          <XCircle className="h-3.5 w-3.5" />
          {errorText}
        </span>
      );
    }
    return <span className="text-xs text-muted-foreground">待上传</span>;
  };

  const header = (
    <>
      {title && CardTitle && <CardTitle>{title}</CardTitle>}
      {title && !CardTitle && (
        <div className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </div>
      )}
      {description && CardDescription && (
        <CardDescription>{description}</CardDescription>
      )}
      {description && !CardDescription && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
    </>
  );

  return (
    <Card className={cn('overflow-hidden', className)}>
      {CardHeader && (title || description) ? (
        <CardHeader>{header}</CardHeader>
      ) : (
        (title || description) && (
          <div className="space-y-1.5 p-6">{header}</div>
        )
      )}
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled}
        />
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          className={cn(
            'flex min-h-40 cursor-pointer touch-manipulation flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-6 py-8 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            isDragging && 'border-primary bg-primary/10 shadow-inner',
            disabled && 'cursor-not-allowed opacity-60',
            dropzoneClassName
          )}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) {
              setIsDragging(true);
            }
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-sm font-medium">{dropzoneLabel}</div>
          {dropzoneDescription && (
            <div className="mt-1 max-w-md text-sm text-muted-foreground">
              {dropzoneDescription}
            </div>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-4"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            {selectLabel}
          </Button>
        </div>

        {helperText && (
          <div className="text-sm text-muted-foreground">{helperText}</div>
        )}

        <div className={cn('space-y-3', listClassName)}>
          {items.length === 0 ? (
            <div className="rounded-md border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-background px-4 py-3 shadow-sm"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)}
                          {item.type ? ` · ${item.type}` : ''}
                        </div>
                      </div>
                      {renderStatus(item)}
                    </div>
                    {item.status === 'uploading' && (
                      <div
                        className="h-2 overflow-hidden rounded-full bg-muted"
                        aria-label={`${item.name} 上传进度`}
                        role="progressbar"
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.error && (
                      <div className="break-words text-xs text-destructive">
                        {item.error}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {item.status === 'error' && onUpload && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isUploading}
                        onClick={() => handleRetry(item)}
                      >
                        {retryLabel}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`移除 ${item.name}`}
                      disabled={disabled || item.status === 'uploading'}
                      onClick={() => handleRemove(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      {(shouldShowUploadButton || showResetButton) &&
        (CardFooter ? (
          <CardFooter className="justify-end gap-2">
            {showResetButton && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isUploading || items.length === 0}
                onClick={() => setItems([])}
              >
                {resetLabel}
              </Button>
            )}
            {shouldShowUploadButton && (
              <Button
                type="button"
                disabled={
                  disabled || isUploading || !hasUploadableItems || !onUpload
                }
                onClick={uploadReadyItems}
              >
                {uploadLabel}
              </Button>
            )}
          </CardFooter>
        ) : (
          <div className="flex justify-end gap-2 p-6 pt-0">
            {showResetButton && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isUploading || items.length === 0}
                onClick={() => setItems([])}
              >
                {resetLabel}
              </Button>
            )}
            {shouldShowUploadButton && (
              <Button
                type="button"
                disabled={
                  disabled || isUploading || !hasUploadableItems || !onUpload
                }
                onClick={uploadReadyItems}
              >
                {uploadLabel}
              </Button>
            )}
          </div>
        ))}
    </Card>
  );
}
