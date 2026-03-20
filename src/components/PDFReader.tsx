import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FileText as FileTextIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon,
  PanelLeft as PanelLeftIcon,
  RotateCw as RotateCwIcon,
  ScrollText as ScrollTextIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from 'lucide-react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { HTMLAttributes } from 'react';

import type {
  CardComponent,
  ButtonComponent,
  InputComponent,
  SkeletonComponent,
} from '../types/component-types';

import type { PDFDocumentProxy } from './PDFSidebar';
import { PDFSidebar } from './PDFSidebar';

/**
 * PDFReader UI 组件接口
 */
export interface PDFReaderUIComponents {
  /** Card 组件 (必需) */
  Card: CardComponent;
  /** CardContent 组件 (必需) */
  CardContent: React.ComponentType<HTMLAttributes<HTMLDivElement>>;
  /** Button 组件 (必需) */
  Button: ButtonComponent;
  /** Input 组件 (必需) */
  Input: InputComponent;
  /** Skeleton 组件 (必需) */
  Skeleton: SkeletonComponent;
  /** Tabs 组件 (showSidebar=true 时必需) */
  Tabs?: React.ComponentType<{
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
    defaultValue?: string;
  }>;
  /** TabsList 组件 (showSidebar=true 时必需) */
  TabsList?: React.ComponentType<HTMLAttributes<HTMLDivElement>>;
  /** TabsTrigger 组件 (showSidebar=true 时必需) */
  TabsTrigger?: React.ComponentType<{
    value: string;
    children?: React.ReactNode;
  }>;
  /** TabsContent 组件 (showSidebar=true 时必需) */
  TabsContent?: React.ComponentType<{
    value: string;
    children?: React.ReactNode;
  }>;
  /** ScrollArea 组件 (showSidebar=true 时必需) */
  ScrollArea?: React.ComponentType<HTMLAttributes<HTMLDivElement>>;
}

/**
 * PDFReader 组件 Props
 */
export interface PDFReaderProps {
  // ==================== 基础配置 ====================
  /** PDF 文件 URL (必需) */
  url: string;

  // ==================== 初始状态 ====================
  /** 初始页码 (默认 1) */
  initialPage?: number;
  /** 初始缩放比例 (默认 1.0) */
  initialScale?: number;
  /** 初始旋转角度 (默认 0) */
  initialRotation?: number;

  // ==================== 受控模式 ====================
  /** 当前页码 (受控) */
  currentPage?: number;
  /** 页码变化回调 */
  onPageChange?: (page: number) => void;
  /** 缩放比例 (受控) */
  scale?: number;
  /** 缩放变化回调 */
  onScaleChange?: (scale: number) => void;
  /** 旋转角度 (受控) */
  rotation?: number;
  /** 旋转变化回调 */
  onRotationChange?: (rotation: number) => void;

  // ==================== 缩放限制 ====================
  /** 最小缩放比例 (默认 0.5) */
  minScale?: number;
  /** 最大缩放比例 (默认 2.5) */
  maxScale?: number;

  // ==================== 功能开关 ====================
  /** 显示工具栏 (默认 true) */
  showToolbar?: boolean;
  /** 显示侧边栏 (默认 true) */
  showSidebar?: boolean;
  /** 显示旋转按钮 (默认 true) */
  showRotation?: boolean;
  /** 显示模式切换按钮 (默认 true) */
  showModeToggle?: boolean;
  /** 显示全屏按钮 (默认 true) */
  showFullscreen?: boolean;
  /** 启用键盘快捷键 (默认 true) */
  enableHotkeys?: boolean;
  /** 启用移动端导航 (默认 true) */
  enableMobileNav?: boolean;

  // ==================== 显示模式 ====================
  /** 显示模式: 'scroll' 显示所有页面, 'single' 单页模式 (默认 'scroll') */
  displayMode?: 'scroll' | 'single';

  // ==================== 样式定制 ====================
  /** 容器类名 */
  className?: string;
  /** 工具栏类名 */
  toolbarClassName?: string;
  /** 内容区域类名 */
  contentClassName?: string;
  /** 阅读区域高度限制 (默认 '80vh') */
  contentHeight?: string | number;
  /** 页面类名 */
  pageClassName?: string;

  // ==================== Worker 配置 ====================
  /** Worker 文件 URL (可选,默认使用 CDN) */
  workerUrl?: string;
  /** CMap 文件 URL (可选,默认使用 CDN) */
  cMapUrl?: string;
  /** 标准字体数据 URL (可选,默认使用 CDN) */
  standardFontDataUrl?: string;

  // ==================== UI 组件注入 ====================
  /** UI 组件 */
  components: PDFReaderUIComponents;

  // ==================== 回调函数 ====================
  /** 加载成功回调 */
  onLoadSuccess?: (pdf: PDFDocumentProxy) => void;
  /** 加载错误回调 */
  onLoadError?: (error: Error) => void;
  /** 页面渲染回调 */
  onPageRender?: (pageIndex: number) => void;

  // ==================== 文本配置 ====================
  /** 加载文本 (默认 '正在加载PDF文档...') */
  loadingText?: string;
  /** 错误文本 (默认 'PDF加载失败') */
  errorText?: string;
}

/**
 * debounce hook (替代 lodash.debounce)
 */
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;
}

/**
 * PDFReader 组件
 *
 * 功能完整的 PDF 阅读器组件，支持侧边栏导航、页面旋转、显示模式切换等高级特性。
 *
 * @example
 * ```tsx
 * import { PDFReader } from '@turinhub/atomix-common-ui';
 * import { Card, Button, Input, Label, Skeleton } from '@/components/ui';
 * import { Tabs, ScrollArea } from '@/components/ui';
 *
 * <PDFReader
 *   url="/documents/sample.pdf"
 *   components={{
 *     Card,
 *     CardContent: Card.Content,
 *     Button,
 *     Input,
 *     Label,
 *     Skeleton,
 *     Tabs,
 *     TabsList: Tabs.List,
 *     TabsTrigger: Tabs.Trigger,
 *     TabsContent: Tabs.Content,
 *     ScrollArea,
 *   }}
 *   initialPage={1}
 *   initialScale={1.0}
 *   showSidebar={true}
 *   showRotation={true}
 *   showModeToggle={true}
 *   enableHotkeys={true}
 * />
 * ```
 */
export function PDFReader({
  url,
  initialPage = 1,
  initialScale = 1.0,
  initialRotation = 0,
  currentPage: controlledPage,
  onPageChange,
  scale: controlledScale,
  onScaleChange,
  rotation: controlledRotation,
  onRotationChange,
  minScale = 0.5,
  maxScale = 2.5,
  showToolbar = true,
  showSidebar = true,
  showRotation = true,
  showModeToggle = true,
  showFullscreen = true,
  enableHotkeys = true,
  enableMobileNav = true,
  displayMode: initialDisplayMode = 'scroll',
  className,
  toolbarClassName,
  contentClassName,
  contentHeight = '80vh',
  pageClassName,
  workerUrl,
  cMapUrl,
  standardFontDataUrl,
  components,
  onLoadSuccess,
  onLoadError,
  onPageRender,
  loadingText = '正在加载PDF文档...',
  errorText = 'PDF加载失败',
}: PDFReaderProps) {
  // ==================== 状态管理 ====================
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [internalPage, setInternalPage] = useState(initialPage);
  const [internalScale, setInternalScale] = useState(initialScale);
  const [internalRotation, setInternalRotation] = useState(initialRotation);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllPages, setShowAllPages] = useState(
    initialDisplayMode === 'scroll'
  );
  const [showSidebarState, setShowSidebarState] = useState(showSidebar);

  // Sync showSidebarState with prop changes
  useEffect(() => {
    setShowSidebarState(showSidebar);
  }, [showSidebar]);

  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);

  // 动态导入 react-pdf
  const [ReactPDF, setReactPDF] = useState<any>(null);

  const readerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // 使用受控或非受控模式
  const currentPage = controlledPage ?? internalPage;
  const scale = controlledScale ?? internalScale;
  const rotation = controlledRotation ?? internalRotation;

  // ==================== 组件解构 ====================
  const { Card, CardContent, Button, Input, Skeleton } = components || {};

  // ==================== PDF 选项 ====================
  const pdfOptions = useMemo(() => {
    const options: Record<string, unknown> = {
      withCredentials: false,
    };

    if (cMapUrl) {
      options.cMapUrl = cMapUrl;
      options.cMapPacked = true;
    }

    if (standardFontDataUrl) {
      options.standardFontDataUrl = standardFontDataUrl;
    }

    return options;
  }, [cMapUrl, standardFontDataUrl]);

  // ==================== 动态导入 react-pdf ====================
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
            if (workerUrl) {
              pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
            } else {
              // 使用 CDN
              pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`;
            }

            // 如果没有提供自定义 URL，使用 CDN 默认值
            if (!cMapUrl && pdfjs.GlobalWorkerOptions) {
              (pdfjs.GlobalWorkerOptions as any).cMapUrl =
                `https://unpkg.com/pdfjs-dist@${workerVersion}/cmaps/`;
            }
            if (!standardFontDataUrl && pdfjs.GlobalWorkerOptions) {
              (pdfjs.GlobalWorkerOptions as any).standardFontDataUrl =
                `https://unpkg.com/pdfjs-dist@${workerVersion}/standard_fonts/`;
            }
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
  }, [workerUrl, cMapUrl, standardFontDataUrl, onLoadError]);

  // ==================== 加载 PDF 文档 ====================
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
        const loadingTask = (ReactPDF.pdfjs as any).getDocument(url);
        const pdf = await loadingTask.promise;

        if (isMounted) {
          setPdfDocument(pdf as PDFDocumentProxy);
          setTotalPages(pdf.numPages);
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
    };
  }, [ReactPDF, url, onLoadSuccess, onLoadError]);

  // ==================== 处理加载错误 ====================
  const onDocumentLoadError = useCallback(
    (err: Error) => {
      console.error('PDF加载失败:', err);
      console.error('PDF URL:', url);
      setError(
        new Error(`${errorText}: ${err.message || '请检查文件路径或网络连接'}`)
      );
      onLoadError?.(err);
    },
    [url, errorText, onLoadError]
  );

  // ==================== 页面导航 ====================
  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      if (controlledPage === undefined) {
        setInternalPage(newPage);
      }
      onPageChange?.(newPage);
    },
    [totalPages, controlledPage, onPageChange]
  );

  // ==================== 缩放控制 ====================
  const zoom = useCallback(
    (delta: number) => {
      const newScale = Math.max(minScale, Math.min(maxScale, scale + delta));
      if (controlledScale === undefined) {
        setInternalScale(newScale);
      }
      onScaleChange?.(newScale);
    },
    [scale, minScale, maxScale, controlledScale, onScaleChange]
  );

  // ==================== 旋转控制 ====================
  const rotate = useCallback(() => {
    const newRotation = (rotation + 90) % 360;
    if (controlledRotation === undefined) {
      setInternalRotation(newRotation);
    }
    onRotationChange?.(newRotation);
  }, [rotation, controlledRotation, onRotationChange]);

  // ==================== 处理窗口大小变化 ====================
  const debouncedUpdatePageWidth = useDebounce((width: number) => {
    setPageWidth(width);
  }, 100);

  // Use ResizeObserver to track container size changes
  useEffect(() => {
    if (!pdfContainerRef.current) return;

    const container = pdfContainerRef.current;
    const updateWidth = () => {
      debouncedUpdatePageWidth(container.clientWidth);
    };

    // Initial measurement
    updateWidth();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [debouncedUpdatePageWidth]);

  // ==================== 键盘快捷键 ====================
  useEffect(() => {
    if (!enableHotkeys) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + 加号: 放大
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoom(0.1);
      }
      // Ctrl/Cmd + 减号: 缩小
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoom(-0.1);
      }
      // 左箭头: 上一页
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPage(currentPage - 1);
      }
      // 右箭头: 下一页
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToPage(currentPage + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableHotkeys, currentPage, goToPage, zoom]);

  // ==================== 全屏切换 ====================
  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;

    if (!document.fullscreenElement) {
      try {
        await readerRef.current?.requestFullscreen?.();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // ==================== 监听全屏状态变化 ====================
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // ==================== 处理侧边栏页面点击 ====================
  const handleSidebarPageClick = useCallback(
    (pageNumber: number) => {
      goToPage(pageNumber);
      setShowAllPages(false);
    },
    [goToPage]
  );

  // ==================== 渲染工具栏 ====================
  const renderToolbar = () => {
    if (!showToolbar) return null;

    return (
      <div
        className={`flex items-center justify-between gap-4 border-b px-4 py-2 ${toolbarClassName || ''}`}
      >
        <div className="flex items-center gap-2">
          {/* 侧边栏切换 */}
          {showSidebar && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSidebarState(!showSidebarState)}
              title={showSidebarState ? '隐藏侧边栏' : '显示侧边栏'}
            >
              <PanelLeftIcon />
            </Button>
          )}

          {/* 缩放控制 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(-0.1)}
            disabled={scale <= minScale}
          >
            <ZoomOutIcon />
          </Button>
          <span className="min-w-[3rem] text-center text-sm">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(0.1)}
            disabled={scale >= maxScale}
          >
            <ZoomInIcon />
          </Button>

          {/* 旋转控制 */}
          {showRotation && (
            <Button variant="outline" size="icon" onClick={rotate}>
              <RotateCwIcon />
            </Button>
          )}

          {/* 显示模式切换 */}
          {showModeToggle && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAllPages(!showAllPages)}
              title={showAllPages ? '单页模式' : '滚动模式'}
            >
              {showAllPages ? <ScrollTextIcon /> : <FileTextIcon />}
            </Button>
          )}

          {/* 全屏切换 */}
          {showFullscreen && (
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeftIcon />
          </Button>

          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
            className="w-16 text-center"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    );
  };

  // ==================== 渲染加载状态 ====================
  const renderLoading = () => (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground">{loadingText}</p>
    </div>
  );

  // ==================== 渲染错误状态 ====================
  const renderError = () => (
    <div className="flex h-full min-h-[400px] items-center justify-center px-4 text-center text-destructive">
      <div className="max-w-md">
        <p className="mb-2 text-lg font-medium">文件加载失败</p>
        <p className="text-sm opacity-80">{error?.message}</p>
      </div>
    </div>
  );

  // ==================== 渲染 PDF 文档 ====================
  const renderPDFDocument = () => {
    if (!ReactPDF) return null;

    const { Document, Page } = ReactPDF;

    return (
      <div
        ref={pdfContainerRef}
        className={`pdf-container flex-1 overflow-y-auto ${contentClassName || ''}`}
      >
        <div className="flex min-h-full justify-center px-4">
          <Document
            pdf={pdfDocument ?? undefined}
            onLoadError={onDocumentLoadError}
            options={pdfOptions}
            loading={renderLoading()}
            error={renderError()}
          >
            {error ? (
              renderError()
            ) : showAllPages ? (
              // 显示所有页面模式
              Array.from(new Array(totalPages), (_el, index) => (
                <div
                  key={`page_${index + 1}`}
                  className={`mb-4 ${pageClassName || ''}`}
                >
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={pageWidth}
                    scale={scale}
                    rotate={rotation}
                    onRenderSuccess={() => onPageRender?.(index + 1)}
                  />
                </div>
              ))
            ) : (
              // 单页模式
              <div className={pageClassName || ''}>
                <Page
                  pageNumber={currentPage}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={pageWidth}
                  scale={scale}
                  rotate={rotation}
                  onRenderSuccess={() => onPageRender?.(currentPage)}
                />
              </div>
            )}
          </Document>
        </div>
      </div>
    );
  };

  // ==================== 渲染侧边栏 ====================
  const renderSidebar = () => {
    if (!showSidebar || !showSidebarState || !pdfDocument) return null;

    // 使用导入的 PDFSidebar 组件
    const PDFSidebarComponent = PDFSidebar;

    return (
      <PDFSidebarComponent
        pdfDocument={pdfDocument}
        currentPage={currentPage}
        onPageClick={handleSidebarPageClick}
        components={{
          Tabs: components.Tabs!,
          TabsList: components.TabsList!,
          TabsTrigger: components.TabsTrigger!,
          TabsContent: components.TabsContent!,
          ScrollArea: components.ScrollArea!,
          Skeleton,
        }}
      />
    );
  };

  // ==================== 渲染移动端导航 ====================
  const renderMobileNav = () => {
    if (!enableMobileNav) return null;

    return (
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 md:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeftIcon />
          <span className="ml-1">上一页</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="mr-1">下一页</span>
          <ChevronRightIcon />
        </Button>
      </div>
    );
  };

  // ==================== 组件验证 ====================
  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  // 验证侧边栏所需的所有组件
  if (showSidebar) {
    const missingComponents: string[] = [];
    if (!components.Tabs) missingComponents.push('Tabs');
    if (!components.TabsList) missingComponents.push('TabsList');
    if (!components.TabsTrigger) missingComponents.push('TabsTrigger');
    if (!components.TabsContent) missingComponents.push('TabsContent');
    if (!components.ScrollArea) missingComponents.push('ScrollArea');

    if (missingComponents.length > 0) {
      const missingComponentsText =
        missingComponents.length === 1
          ? missingComponents[0]
          : `${missingComponents.slice(0, -1).join('、')} 和 ${missingComponents[missingComponents.length - 1]}`;
      return (
        <div className="p-4 text-center text-destructive">
          错误：侧边栏功能需要注入 {missingComponentsText} 组件
        </div>
      );
    }
  }

  return (
    <div ref={readerRef}>
      <Card className={className}>
        {renderToolbar()}
        <CardContent
          className="p-0"
          style={{ height: isFullscreen ? '100vh' : contentHeight }}
        >
          <div className="flex h-full flex-col">
            {/* PDF 显示区域 */}
            <div className="flex flex-1 overflow-hidden">
              {renderSidebar()}
              {isLoading
                ? renderLoading()
                : error
                  ? renderError()
                  : renderPDFDocument()}
            </div>
          </div>
        </CardContent>
      </Card>
      {renderMobileNav()}
    </div>
  );
}
