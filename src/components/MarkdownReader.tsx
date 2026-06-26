import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, HTMLAttributes } from 'react';

import { cn } from '../lib/utils';
import type {
  CardComponent,
  SkeletonComponent,
  UIComponent,
} from '../types/component-types';

export interface MarkdownReaderUIComponents {
  Card?: CardComponent;
  CardContent?: UIComponent<HTMLAttributes<HTMLDivElement>>;
  Skeleton?: SkeletonComponent;
}

export interface MarkdownReaderProps {
  content?: string;
  sourceUrl?: string;
  components?: MarkdownReaderUIComponents;
  loading?: boolean;
  error?: Error | string | null;
  className?: string;
  contentClassName?: string;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  allowImages?: boolean;
  openLinksInNewTab?: boolean;
  transformLinkHref?: (href: string) => string | undefined;
  transformImageSrc?: (src: string) => string | undefined;
  onLoadError?: (error: Error) => void;
}

interface MarkdownRuntime {
  ReactMarkdown: ComponentType<any>;
  remarkGfm: unknown;
}

const normalizeError = (error: Error | string | null | undefined) => {
  if (!error) return null;
  return error instanceof Error ? error : new Error(error);
};

const getMarkdownLoadError = (error: unknown) =>
  error instanceof Error ? error : new Error('无法加载 Markdown 渲染依赖');

const defaultContentClassName =
  'markdown-reader-content max-w-none text-sm leading-7 text-slate-800 dark:text-slate-100 ' +
  '[&_h1]:mb-4 [&_h1]:mt-0 [&_h1]:text-3xl [&_h1]:font-semibold ' +
  '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold ' +
  '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold ' +
  '[&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_li]:my-1 [&_ul]:list-disc [&_ol]:list-decimal ' +
  '[&_ul]:pl-6 [&_ol]:pl-6 [&_blockquote]:my-4 [&_blockquote]:border-l-4 ' +
  '[&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600 ' +
  'dark:[&_blockquote]:border-slate-700 dark:[&_blockquote]:text-slate-300 ' +
  '[&_a]:font-medium [&_a]:text-cyan-700 [&_a]:underline-offset-4 hover:[&_a]:underline ' +
  'dark:[&_a]:text-cyan-300 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse ' +
  '[&_th]:border [&_td]:border [&_th]:border-slate-200 [&_td]:border-slate-200 ' +
  '[&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2 ' +
  'dark:[&_th]:border-slate-700 dark:[&_td]:border-slate-700 dark:[&_th]:bg-slate-800 ' +
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-950 ' +
  '[&_pre]:p-4 [&_pre]:text-slate-50 [&_code]:rounded [&_code]:bg-slate-100 ' +
  '[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm dark:[&_code]:bg-slate-800 ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_img]:my-4 [&_img]:max-w-full ' +
  '[&_img]:rounded-lg [&_hr]:my-8 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800';

export function MarkdownReader({
  content,
  sourceUrl,
  components,
  loading = false,
  error,
  className,
  contentClassName,
  loadingText = '正在加载 Markdown 内容...',
  errorText = 'Markdown 加载失败',
  emptyText = '暂无 Markdown 内容',
  allowImages = true,
  openLinksInNewTab = true,
  transformLinkHref,
  transformImageSrc,
  onLoadError,
}: MarkdownReaderProps) {
  const [runtime, setRuntime] = useState<MarkdownRuntime | null>(null);
  const [runtimeLoading, setRuntimeLoading] = useState(true);
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);
  const [remoteContent, setRemoteContent] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<Error | null>(null);
  const onLoadErrorRef = useRef(onLoadError);

  const { Card, CardContent, Skeleton } = components || {};

  useEffect(() => {
    onLoadErrorRef.current = onLoadError;
  }, [onLoadError]);

  useEffect(() => {
    let isMounted = true;

    const loadRuntime = async () => {
      setRuntimeLoading(true);
      setRuntimeError(null);

      try {
        const [markdownModule, gfmModule] = await Promise.all([
          import('react-markdown'),
          import('remark-gfm'),
        ]);

        if (!isMounted) return;

        setRuntime({
          ReactMarkdown: markdownModule.default,
          remarkGfm: gfmModule.default,
        });
      } catch (err) {
        if (!isMounted) return;

        const nextError = getMarkdownLoadError(err);
        setRuntimeError(nextError);
        onLoadErrorRef.current?.(nextError);
      } finally {
        if (isMounted) {
          setRuntimeLoading(false);
        }
      }
    };

    loadRuntime();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (content !== undefined || !sourceUrl) {
      setRemoteContent('');
      setRemoteLoading(false);
      setRemoteError(null);
      return;
    }

    const controller = new AbortController();

    const loadContent = async () => {
      setRemoteLoading(true);
      setRemoteError(null);

      try {
        const response = await fetch(sourceUrl, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`请求失败：${response.status}`);
        }

        const text = await response.text();
        setRemoteContent(text);
      } catch (err) {
        if (controller.signal.aborted) return;

        const nextError =
          err instanceof Error ? err : new Error('无法加载 Markdown 内容');
        setRemoteError(nextError);
        onLoadErrorRef.current?.(nextError);
      } finally {
        if (!controller.signal.aborted) {
          setRemoteLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      controller.abort();
    };
  }, [content, sourceUrl]);

  const markdown = content !== undefined ? content : remoteContent;
  const displayedError = normalizeError(error) || runtimeError || remoteError;
  const isLoading = loading || runtimeLoading || remoteLoading;
  const isEmpty = !isLoading && !displayedError && markdown.trim().length === 0;

  const markdownComponents = useMemo(
    () => ({
      a({ href, children, ...props }: any) {
        const nextHref = href ? (transformLinkHref?.(href) ?? href) : undefined;

        return (
          <a
            {...props}
            href={nextHref}
            target={openLinksInNewTab ? '_blank' : props.target}
            rel={openLinksInNewTab ? 'noreferrer noopener' : props.rel}
          >
            {children}
          </a>
        );
      },
      img({ src, alt, ...props }: any) {
        if (!src) return null;

        const nextSrc = transformImageSrc?.(src) ?? src;

        if (!allowImages) {
          return (
            <a href={nextSrc} target="_blank" rel="noreferrer noopener">
              {alt || nextSrc}
            </a>
          );
        }

        return (
          <span className="block overflow-hidden rounded-lg bg-muted/20">
            <img
              {...props}
              src={nextSrc}
              alt={alt || ''}
              loading="lazy"
              decoding="async"
            />
          </span>
        );
      },
      input({ checked, type, ...props }: any) {
        if (type !== 'checkbox') {
          return <input {...props} type={type} />;
        }

        return (
          <input
            {...props}
            type="checkbox"
            checked={Boolean(checked)}
            readOnly
            disabled
          />
        );
      },
    }),
    [allowImages, openLinksInNewTab, transformImageSrc, transformLinkHref]
  );

  const renderLoading = () => (
    <div className="space-y-3 p-4" role="status" aria-live="polite">
      {Skeleton ? (
        <>
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-28 w-full" />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      )}
    </div>
  );

  const renderError = () => (
    <div className="p-4 text-sm text-destructive" role="alert">
      <p className="font-medium">{errorText}</p>
      {displayedError?.message ? (
        <p className="mt-1 opacity-80">{displayedError.message}</p>
      ) : null}
    </div>
  );

  const renderEmpty = () => (
    <div className="p-4 text-sm text-muted-foreground">{emptyText}</div>
  );

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (displayedError) return renderError();
    if (isEmpty) return renderEmpty();
    if (!runtime) return null;

    const { ReactMarkdown, remarkGfm } = runtime;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    );
  };

  const body = (
    <div className={cn(defaultContentClassName, contentClassName)}>
      {renderContent()}
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
