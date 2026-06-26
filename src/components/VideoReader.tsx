import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
  HTMLAttributes,
  ReactNode,
  TrackHTMLAttributes,
  VideoHTMLAttributes,
} from 'react';

import { cn } from '../lib/utils';
import type {
  ButtonComponent,
  CardComponent,
  SkeletonComponent,
  UIComponent,
} from '../types/component-types';

import { getMediaExtension, isSupportedMediaSource } from './media-utils';

export const SUPPORTED_VIDEO_EXTENSIONS = [
  'mp4',
  'webm',
  'ogg',
  'ogv',
  'mov',
  'm4v',
] as const;

export const SUPPORTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
] as const;

export interface VideoReaderUIComponents {
  Card?: CardComponent;
  CardContent?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  Button?: ButtonComponent;
  Skeleton?: SkeletonComponent;
}

export interface VideoReaderTrack extends Omit<
  TrackHTMLAttributes<HTMLTrackElement>,
  'children'
> {
  src: string;
}

export interface VideoReaderProps extends Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  'children' | 'className' | 'onError' | 'onLoadedData' | 'src'
> {
  src: string;
  fileName?: string;
  mimeType?: string;
  title?: string;
  components?: VideoReaderUIComponents;
  tracks?: VideoReaderTrack[];
  loading?: boolean;
  error?: Error | string | null;
  className?: string;
  containerClassName?: string;
  videoClassName?: string;
  toolbarClassName?: string;
  loadingText?: string;
  errorText?: string;
  unsupportedText?: string;
  showToolbar?: boolean;
  showOpenInNewTab?: boolean;
  allowUnsupportedFormat?: boolean;
  supportedExtensions?: readonly string[];
  supportedMimeTypes?: readonly string[];
  onLoadedData?: () => void;
  onError?: (error: Error) => void;
}

const normalizeError = (error: Error | string | null | undefined) => {
  if (!error) return null;
  return error instanceof Error ? error : new Error(error);
};

export function VideoReader({
  src,
  fileName,
  mimeType,
  title,
  components,
  tracks,
  loading = false,
  error,
  className,
  containerClassName,
  videoClassName,
  toolbarClassName,
  loadingText = '正在加载视频...',
  errorText = '视频加载失败',
  unsupportedText = '暂不支持该视频格式',
  showToolbar = true,
  showOpenInNewTab = true,
  allowUnsupportedFormat = false,
  supportedExtensions = SUPPORTED_VIDEO_EXTENSIONS,
  supportedMimeTypes = SUPPORTED_VIDEO_MIME_TYPES,
  controls = true,
  preload = 'metadata',
  playsInline = true,
  onLoadedData,
  onError,
  ...videoProps
}: VideoReaderProps) {
  const { Card, CardContent, Button, Skeleton } = components || {};
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<Error | null>(null);

  const displayedError = normalizeError(error) || videoError;
  const isSupported =
    allowUnsupportedFormat ||
    isSupportedMediaSource({
      src,
      fileName,
      mimeType,
      supportedExtensions,
      supportedMimeTypes,
    });
  const isLoading = loading || (isVideoLoading && !displayedError);

  const formatLabel = useMemo(() => {
    const extension = getMediaExtension(src, fileName);
    return extension ? extension.toUpperCase() : mimeType || '视频';
  }, [fileName, mimeType, src]);

  useEffect(() => {
    setIsVideoLoading(true);
    setVideoError(null);
  }, [src]);

  const renderButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void
  ) => {
    const buttonClassName =
      'inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground';

    if (Button) {
      return (
        <Button
          aria-label={label}
          className="h-8 w-8"
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
          <Skeleton className="aspect-video w-full" />
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
            {title || formatLabel}
          </span>
          {showOpenInNewTab
            ? renderButton(
                '新窗口打开',
                <ExternalLinkIcon className="h-4 w-4" />,
                () => window.open(src, '_blank', 'noreferrer')
              )
            : null}
        </div>
      ) : null}
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-muted/20 p-4">
        {!isSupported
          ? renderError(unsupportedText)
          : displayedError
            ? renderError()
            : null}
        {isSupported && !displayedError ? (
          <>
            {isLoading ? renderLoading() : null}
            <video
              {...videoProps}
              key={src}
              className={cn(
                'max-h-full w-full max-w-full bg-black',
                isLoading ? 'invisible absolute' : 'visible',
                videoClassName
              )}
              controls={controls}
              onError={() => {
                const nextError = new Error(errorText);
                setIsVideoLoading(false);
                setVideoError(nextError);
                onError?.(nextError);
              }}
              onLoadedData={() => {
                setIsVideoLoading(false);
                setVideoError(null);
                onLoadedData?.();
              }}
              playsInline={playsInline}
              preload={preload}
              title={title}
            >
              <source src={src} type={mimeType} />
              {tracks?.map((track) => (
                <track key={`${track.src}-${track.kind || ''}`} {...track} />
              ))}
            </video>
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
