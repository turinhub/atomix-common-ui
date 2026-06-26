import {
  ExternalLink as ExternalLinkIcon,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/utils';
import type {
  ButtonComponent,
  CardComponent,
  SkeletonComponent,
  UIComponent,
} from '../types/component-types';

import { getMediaExtension, isSupportedMediaSource } from './media-utils';

export const SUPPORTED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'avif',
  'ico',
] as const;

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
] as const;

export interface ImageReaderUIComponents {
  Card?: CardComponent;
  CardContent?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  Button?: ButtonComponent;
  Skeleton?: SkeletonComponent;
}

export interface ImageReaderProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'children' | 'className' | 'loading' | 'onError' | 'onLoad' | 'src'
> {
  src: string;
  alt?: string;
  fileName?: string;
  mimeType?: string;
  components?: ImageReaderUIComponents;
  loading?: boolean;
  error?: Error | string | null;
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
  toolbarClassName?: string;
  loadingText?: string;
  errorText?: string;
  unsupportedText?: string;
  showToolbar?: boolean;
  showOpenInNewTab?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  rotation?: number;
  onRotationChange?: (rotation: number) => void;
  allowUnsupportedFormat?: boolean;
  supportedExtensions?: readonly string[];
  supportedMimeTypes?: readonly string[];
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const normalizeError = (error: Error | string | null | undefined) => {
  if (!error) return null;
  return error instanceof Error ? error : new Error(error);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function ImageReader({
  src,
  alt = '',
  fileName,
  mimeType,
  components,
  loading = false,
  error,
  className,
  containerClassName,
  imageClassName,
  toolbarClassName,
  loadingText = '正在加载图片...',
  errorText = '图片加载失败',
  unsupportedText = '暂不支持该图片格式',
  showToolbar = true,
  showOpenInNewTab = true,
  objectFit = 'contain',
  initialScale = 1,
  minScale = 0.25,
  maxScale = 4,
  scaleStep = 0.25,
  scale: controlledScale,
  onScaleChange,
  rotation: controlledRotation,
  onRotationChange,
  allowUnsupportedFormat = false,
  supportedExtensions = SUPPORTED_IMAGE_EXTENSIONS,
  supportedMimeTypes = SUPPORTED_IMAGE_MIME_TYPES,
  onLoad,
  onError,
  style,
  ...imageProps
}: ImageReaderProps) {
  const { Card, CardContent, Button, Skeleton } = components || {};
  const [internalScale, setInternalScale] = useState(initialScale);
  const [internalRotation, setInternalRotation] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<Error | null>(null);

  const scale = controlledScale ?? internalScale;
  const rotation = controlledRotation ?? internalRotation;
  const displayedError = normalizeError(error) || imageError;
  const isSupported =
    allowUnsupportedFormat ||
    isSupportedMediaSource({
      src,
      fileName,
      mimeType,
      supportedExtensions,
      supportedMimeTypes,
    });
  const isLoading = loading || (isImageLoading && !displayedError);

  const setNextScale = useCallback(
    (nextScale: number) => {
      const clampedScale = clamp(nextScale, minScale, maxScale);
      if (controlledScale === undefined) {
        setInternalScale(clampedScale);
      }
      onScaleChange?.(clampedScale);
    },
    [controlledScale, maxScale, minScale, onScaleChange]
  );

  const setNextRotation = useCallback(
    (nextRotation: number) => {
      const normalizedRotation = ((nextRotation % 360) + 360) % 360;
      if (controlledRotation === undefined) {
        setInternalRotation(normalizedRotation);
      }
      onRotationChange?.(normalizedRotation);
    },
    [controlledRotation, onRotationChange]
  );

  const formatLabel = useMemo(() => {
    const extension = getMediaExtension(src, fileName);
    return extension ? extension.toUpperCase() : mimeType || '图片';
  }, [fileName, mimeType, src]);

  useEffect(() => {
    setIsImageLoading(true);
    setImageError(null);
  }, [src]);

  const renderButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
    disabled?: boolean
  ) => {
    const buttonClassName =
      'inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50';

    if (Button) {
      return (
        <Button
          aria-label={label}
          className="h-8 w-8"
          disabled={disabled}
          onClick={onClick}
          size="icon"
          title={label}
          type="button"
          variant="outline"
        >
          {icon}
        </Button>
      );
    }

    return (
      <button
        aria-label={label}
        className={buttonClassName}
        disabled={disabled}
        onClick={onClick}
        title={label}
        type="button"
      >
        {icon}
      </button>
    );
  };

  const renderLoading = () => (
    <div className="w-full space-y-3 p-4" role="status" aria-live="polite">
      {Skeleton ? (
        <>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-80 w-full" />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      )}
    </div>
  );

  const renderError = (message?: string) => (
    <div className="p-4 text-center text-sm text-destructive" role="alert">
      <p className="font-medium">{message || errorText}</p>
      {displayedError?.message ? (
        <p className="mt-1 opacity-80">{displayedError.message}</p>
      ) : null}
    </div>
  );

  const body = (
    <div
      className={cn(
        'flex h-full min-h-[360px] flex-col overflow-hidden rounded-md border bg-background',
        containerClassName
      )}
    >
      {showToolbar ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2',
            toolbarClassName
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {formatLabel}
          </span>
          <div className="flex items-center gap-1">
            {renderButton(
              '缩小',
              <ZoomOutIcon className="h-4 w-4" />,
              () => setNextScale(scale - scaleStep),
              scale <= minScale
            )}
            <span className="min-w-14 text-center text-xs text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            {renderButton(
              '放大',
              <ZoomInIcon className="h-4 w-4" />,
              () => setNextScale(scale + scaleStep),
              scale >= maxScale
            )}
            {renderButton(
              '向左旋转',
              <RotateCcwIcon className="h-4 w-4" />,
              () => setNextRotation(rotation - 90)
            )}
            {renderButton(
              '向右旋转',
              <RotateCwIcon className="h-4 w-4" />,
              () => setNextRotation(rotation + 90)
            )}
            {showOpenInNewTab
              ? renderButton(
                  '新窗口打开',
                  <ExternalLinkIcon className="h-4 w-4" />,
                  () => window.open(src, '_blank', 'noreferrer')
                )
              : null}
          </div>
        </div>
      ) : null}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/20 p-4">
        {!isSupported
          ? renderError(unsupportedText)
          : displayedError
            ? renderError()
            : null}
        {isSupported && !displayedError ? (
          <>
            {isLoading ? renderLoading() : null}
            <img
              {...imageProps}
              alt={alt}
              className={cn(
                'max-h-full max-w-full transition-transform',
                isLoading ? 'invisible absolute' : 'visible',
                imageClassName
              )}
              onError={() => {
                const nextError = new Error(errorText);
                setIsImageLoading(false);
                setImageError(nextError);
                onError?.(nextError);
              }}
              onLoad={() => {
                setIsImageLoading(false);
                setImageError(null);
                onLoad?.();
              }}
              src={src}
              decoding="async"
              style={{
                objectFit,
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                ...style,
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );

  if (Card) {
    return (
      <Card className={className}>
        {CardContent ? <CardContent>{body}</CardContent> : body}
      </Card>
    );
  }

  return <div className={className}>{body}</div>;
}
