import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';

import type {
  CardComponent,
  ButtonComponent,
  InputComponent,
  SkeletonComponent,
} from '../types/component-types';

/**
 * react-pdf 类型定义
 * 这些类型由 @types/react-pdf 提供，这里我们定义必要的接口
 */
export interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<any>;
}

/**
 * SimplePDFReader UI 组件接口
 */
export interface SimplePDFReaderUIComponents {
  Card: CardComponent;
  CardContent: React.ComponentType<HTMLAttributes<HTMLDivElement>>;
  Button: ButtonComponent;
  Input?: InputComponent;
  Skeleton: SkeletonComponent;
}

/**
 * SimplePDFReader 组件 Props
 */
export interface SimplePDFReaderProps {
  // PDF 数据源
  url: string;

  // 初始状态
  initialPage?: number;
  initialScale?: number;

  // 缩放控制
  scale?: number;
  onScaleChange?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;

  // 页面导航
  currentPage?: number;
  onPageChange?: (page: number) => void;

  // 功能开关
  showToolbar?: boolean; // 默认 true
  showPagination?: boolean; // 默认 true
  enableHotkeys?: boolean; // 默认 true

  // 样式定制
  className?: string;
  containerClassName?: string;
  pageClassName?: string;

  // UI 组件注入
  components: SimplePDFReaderUIComponents;

  // 回调函数
  onLoadSuccess?: (pdf: PDFDocumentProxy) => void;
  onLoadError?: (error: Error) => void;

  // 加载状态文本
  loadingText?: string; // 默认 "加载中..."
  errorText?: string; // 默认 "加载失败"
}

/**
 * SimplePDFReader 组件
 *
 * 用于在 React 应用中展示和浏览 PDF 文档。
 * 支持从 URL 加载 PDF，提供基础的浏览功能（翻页、缩放），并包含性能优化。
 *
 * @example
 * ```tsx
 * import { SimplePDFReader } from '@turinhub/atomix-common-ui';
 * import { Card, Button, Skeleton } from '@/components/ui';
 *
 * <SimplePDFReader
 *   url="/documents/sample.pdf"
 *   components={{
 *     Card,
 *     CardContent: Card.Content,
 *     Button,
 *     Skeleton,
 *   }}
 *   initialPage={1}
 *   initialScale={1.0}
 *   showToolbar={true}
 *   showPagination={true}
 *   enableHotkeys={true}
 *   onPageChange={(page) => console.log('Current page:', page)}
 * />
 *
 * Keyboard Shortcuts:
 * - Arrow Left/Right: Navigate pages
 * - Ctrl/Cmd + +/-: Zoom in/out
 * - F: Toggle fullscreen
 * ```
 */
export function SimplePDFReader({
  url,
  initialPage = 1,
  initialScale = 1.0,
  scale: controlledScale,
  onScaleChange,
  minScale = 0.5,
  maxScale = 3.0,
  currentPage: controlledPage,
  onPageChange,
  showToolbar = true,
  showPagination = true,
  enableHotkeys = true,
  className,
  containerClassName,
  pageClassName,
  components,
  onLoadSuccess,
  onLoadError,
  loadingText = '加载中...',
  errorText = '加载失败',
}: SimplePDFReaderProps) {
  // ==================== React Hooks (必须在最顶部) ====================

  // 状态管理
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [internalPage, setInternalPage] = useState(initialPage);
  const [internalScale, setInternalScale] = useState(initialScale);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const loadingTaskRef = useRef<any>(null);

  // 动态导入 react-pdf
  const [ReactPDF, setReactPDF] = useState<any>(null);

  // 使用受控或非受控模式
  const currentPage = controlledPage ?? internalPage;
  const scale = controlledScale ?? internalScale;

  // 预渲染相邻页面以提升翻页体验
  const pagesToPreload = useMemo(() => {
    const pages = [currentPage];
    if (currentPage > 1) pages.push(currentPage - 1);
    if (currentPage < totalPages) pages.push(currentPage + 1);
    return pages;
  }, [currentPage, totalPages]);

  // 页面导航处理
  const goToPage = useCallback(
    (page: number) => {
      const maxPage = Math.max(totalPages, 1);
      const targetPage = Math.min(Math.max(page, 1), maxPage);
      if (controlledPage === undefined) {
        setInternalPage(targetPage);
      }
      onPageChange?.(targetPage);
    },
    [totalPages, controlledPage, onPageChange]
  );

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  // 缩放控制处理
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale + 0.25, maxScale);
    if (controlledScale === undefined) {
      setInternalScale(newScale);
    }
    onScaleChange?.(newScale);
  }, [scale, maxScale, controlledScale, onScaleChange]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.25, minScale);
    if (controlledScale === undefined) {
      setInternalScale(newScale);
    }
    onScaleChange?.(newScale);
  }, [scale, minScale, controlledScale, onScaleChange]);

  const handleToggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;

    if (!document.fullscreenElement) {
      await readerRef.current?.requestFullscreen?.();
      return;
    }

    await document.exitFullscreen?.();
  }, []);

  // 动态导入 react-pdf 和设置 worker
  useEffect(() => {
    let isMounted = true;

    const loadReactPDF = async () => {
      try {
        // 动态导入 react-pdf
        const pdfModule = await import('react-pdf');
        // 设置 worker
        if (typeof window !== 'undefined') {
          const pdfjs = (pdfModule as any).pdfjs;
          const workerVersion = pdfjs?.version;
          if (pdfjs?.GlobalWorkerOptions && workerVersion) {
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`;
          }
        }
        if (isMounted) {
          setReactPDF(pdfModule);
        }
      } catch (err) {
        if (isMounted) {
          const loadError =
            err instanceof Error ? err : new Error('无法加载 react-pdf 库');
          setError(loadError);
          setIsLoading(false);
          onLoadError?.(loadError);
        }
      }
    };

    loadReactPDF();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 加载 PDF 文档
  useEffect(() => {
    if (!ReactPDF || !url) return;

    let isMounted = true;

    const loadPDF = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { Document } = ReactPDF;
        if (!Document) {
          throw new Error('react-pdf Document 组件不可用');
        }

        // 使用 react-pdf 的 Document 组件内部加载逻辑
        // 我们创建一个加载器来获取 PDF 文档信息
        const loadingTask = (ReactPDF.pdfjs as any).getDocument(url);
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;

        if (isMounted) {
          setPdfDocument(pdf as PDFDocumentProxy);
          setTotalPages(pdf.numPages);
          if (controlledPage === undefined) {
            setInternalPage((prev) =>
              Math.max(1, Math.min(prev, pdf.numPages))
            );
          }
          setIsLoading(false);
          onLoadSuccess?.(pdf as PDFDocumentProxy);
        }
      } catch (err) {
        if (isMounted) {
          const loadError =
            err instanceof Error ? err : new Error('PDF 加载失败');
          setError(loadError);
          setIsLoading(false);
          onLoadError?.(loadError);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      if (
        loadingTaskRef.current &&
        typeof loadingTaskRef.current.destroy === 'function'
      ) {
        loadingTaskRef.current.destroy();
        loadingTaskRef.current = null;
      }
    };
  }, [ReactPDF, url, controlledPage, onLoadSuccess, onLoadError]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === readerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ==================== 键盘快捷键 ====================
  useEffect(() => {
    if (!enableHotkeys) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle hotkeys if input is focused
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.getAttribute('role') === 'input')
      ) {
        return;
      }

      // Ctrl/Cmd + 加号: 放大
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }
      // Ctrl/Cmd + 减号: 缩小
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      // 左箭头: 上一页
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousPage();
      }
      // 右箭头: 下一页
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      }
      // F 键: 全屏切换
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        void handleToggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enableHotkeys,
    handleZoomIn,
    handleZoomOut,
    handlePreviousPage,
    handleNextPage,
    handleToggleFullscreen,
  ]);

  // ==================== 组件验证和渲染 ====================

  // 验证 components
  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const {
    Card,
    CardContent,
    Button,
    Input: InputComponentInjected,
    Skeleton,
  } = components;

  // 渲染工具栏
  const renderToolbar = () => {
    if (!showToolbar) return null;

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={scale <= minScale}
        >
          <ZoomOutIcon />
        </Button>
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
        >
          <ZoomInIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            void handleToggleFullscreen();
          }}
        >
          {isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
        </Button>
      </div>
    );
  };

  // 渲染分页控制
  const renderPagination = () => {
    if (!showPagination) return null;

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon />
        </Button>
        {InputComponentInjected ? (
          <InputComponentInjected
            type="number"
            min={1}
            max={Math.max(totalPages, 1)}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            className="w-16 text-center"
          />
        ) : (
          <input
            type="number"
            min={1}
            max={Math.max(totalPages, 1)}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            className="w-16 rounded-md border border-input bg-background px-2 text-center text-sm"
          />
        )}
        <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    );
  };

  const renderOperations = () => {
    if (!showToolbar && !showPagination) return null;

    return (
      <div
        data-testid="pdf-operations-bar"
        className="flex items-center justify-between gap-4 border-b px-4 py-2"
      >
        {renderToolbar()}
        {renderPagination()}
      </div>
    );
  };

  // 渲染加载状态
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full max-w-2xl" />
      <p className="text-sm text-muted-foreground">{loadingText}</p>
    </div>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="text-center text-destructive">
        <p className="font-medium">{errorText}</p>
        {error && (
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        )}
      </div>
    </div>
  );

  // 渲染 PDF 文档
  const renderPDFDocument = () => {
    if (!ReactPDF || !pdfDocument) return null;

    const { Page } = ReactPDF;

    return (
      <div
        className={`flex flex-col items-center justify-center ${
          isFullscreen
            ? 'h-[calc(100vh-56px)] overflow-auto'
            : 'overflow-visible'
        }`}
      >
        {pagesToPreload.map((pageNum) => (
          <div
            key={pageNum}
            className={pageClassName}
            style={{
              display: pageNum === currentPage ? 'block' : 'none',
            }}
          >
            <Page
              pdf={pdfDocument}
              pageNumber={pageNum}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-md"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={readerRef}>
      <Card className={className}>
        {renderOperations()}
        <CardContent className={containerClassName}>
          {isLoading
            ? renderLoading()
            : error
              ? renderError()
              : renderPDFDocument()}
        </CardContent>
      </Card>
    </div>
  );
}
