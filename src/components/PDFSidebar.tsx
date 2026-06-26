import { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react';

import type {
  TabsComponent,
  TabsListComponent,
  TabsTriggerComponent,
  TabsContentComponent,
  ScrollAreaComponent,
  SkeletonComponent,
} from '../types/component-types';

/**
 * react-pdf 类型定义
 */
export interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
  getOutline(): Promise<PDFOutline[] | null>;
  getDestination(dest: string): Promise<unknown[] | null>;
  getPageIndex(ref: unknown): Promise<number>;
}

export interface PDFPageProxy {
  getViewport(options: { scale: number }): PDFViewport;
  render(renderContext: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PDFViewport;
    canvas: HTMLCanvasElement;
  }): { promise: Promise<void> };
}

export interface PDFViewport {
  width: number;
  height: number;
}

export interface PDFOutline {
  title: string;
  bold?: boolean;
  italic?: boolean;
  color?: Uint8ClampedArray;
  dest?: string | unknown[] | null;
  url?: string | null;
  unsafeUrl?: string;
  newWindow?: boolean;
  count?: number;
  items?: PDFOutline[];
  pageNumber?: number;
}

/**
 * PDF 缩略图
 */
interface PDFThumbnail {
  pageNumber: number;
  url: string;
}

const THUMBNAIL_PAGE_WINDOW = 2;

const getThumbnailPages = (numPages: number, currentPage: number) => {
  if (numPages <= 0) return [];

  const safeCurrentPage = Math.max(1, Math.min(currentPage, numPages));
  const start = Math.max(1, safeCurrentPage - THUMBNAIL_PAGE_WINDOW);
  const end = Math.min(numPages, safeCurrentPage + THUMBNAIL_PAGE_WINDOW);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

/**
 * PDFSidebar 组件 Props
 */
export interface PDFSidebarProps {
  /** PDF 文档对象 */
  pdfDocument: PDFDocumentProxy | null;
  /** 当前页码 */
  currentPage: number;
  /** 页面点击回调 */
  onPageClick: (pageNumber: number) => void;
  /** UI 组件注入 */
  components: {
    Tabs: TabsComponent;
    TabsList: TabsListComponent;
    TabsTrigger: TabsTriggerComponent;
    TabsContent: TabsContentComponent;
    ScrollArea: ScrollAreaComponent;
    Skeleton: SkeletonComponent;
  };
}

/**
 * PDF 缩略图组件 (使用 React.memo 优化性能)
 */
const PDFThumbnail = memo(
  ({
    thumbnail,
    isCurrentPage,
    onClick,
  }: {
    thumbnail: PDFThumbnail;
    isCurrentPage: boolean;
    onClick: () => void;
  }) => (
    <div
      className={`flex w-full flex-col items-center rounded p-1 ${
        isCurrentPage ? 'bg-primary/10' : ''
      }`}
    >
      <button
        type="button"
        className="rounded border bg-background p-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={onClick}
        aria-label={`跳转到第 ${thumbnail.pageNumber} 页`}
      >
        <img
          src={thumbnail.url}
          alt={`Page ${thumbnail.pageNumber}`}
          className="w-48"
          width={192}
          height={272}
          loading="lazy"
          decoding="async"
        />
      </button>
      <span className="mt-1 text-sm">第 {thumbnail.pageNumber} 页</span>
    </div>
  )
);
PDFThumbnail.displayName = 'PDFThumbnail';

/**
 * PDF 书签组件
 */
const PDFBookmark = ({
  bookmark,
  depth,
  onClick,
}: {
  bookmark: PDFOutline;
  depth: number;
  onClick: (bookmark: PDFOutline) => void;
}) => (
  <div style={{ paddingLeft: `${depth * 16}px` }}>
    <button
      onClick={() => onClick(bookmark)}
      className="w-full rounded px-2 py-1 text-left text-sm hover:bg-primary/10 hover:text-primary"
    >
      {bookmark.title}
    </button>
    {bookmark.items &&
      bookmark.items.map((item, index) => (
        <PDFBookmark
          key={`${bookmark.title}-${index}`}
          bookmark={item}
          depth={depth + 1}
          onClick={onClick}
        />
      ))}
  </div>
);

/**
 * PDFSidebar 组件
 *
 * 提供缩略图和书签导航功能。
 *
 * @example
 * ```tsx
 * import { PDFSidebar } from '@turinhub/atomix-common-ui/pdf-sidebar';
 * import { Tabs, ScrollArea, Skeleton } from '@/components/ui';
 *
 * <PDFSidebar
 *   pdfDocument={pdfDocument}
 *   currentPage={currentPage}
 *   onPageClick={handlePageClick}
 *   components={{
 *     Tabs,
 *     TabsList: Tabs.List,
 *     TabsTrigger: Tabs.Trigger,
 *     TabsContent: Tabs.Content,
 *     ScrollArea,
 *     Skeleton,
 *   }}
 * />
 * ```
 */
export function PDFSidebar({
  pdfDocument,
  currentPage,
  onPageClick,
  components,
}: PDFSidebarProps) {
  const [thumbnails, setThumbnails] = useState<PDFThumbnail[]>([]);
  const [bookmarks, setBookmarks] = useState<PDFOutline[]>([]);
  const [visibleThumbnailPages, setVisibleThumbnailPages] = useState<number[]>(
    []
  );
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const placeholderElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  const { Tabs, TabsList, TabsTrigger, TabsContent, ScrollArea, Skeleton } =
    components;

  const thumbnailMap = useMemo(
    () =>
      thumbnails.reduce<Record<number, PDFThumbnail>>((map, thumbnail) => {
        map[thumbnail.pageNumber] = thumbnail;
        return map;
      }, {}),
    [thumbnails]
  );

  const pagesToLoad = useMemo(() => {
    if (!pdfDocument) return [];

    const pageNumbers = new Set([
      ...getThumbnailPages(pdfDocument.numPages, currentPage),
      ...visibleThumbnailPages,
    ]);

    return Array.from(pageNumbers)
      .filter(
        (pageNumber) =>
          pageNumber >= 1 &&
          pageNumber <= pdfDocument.numPages &&
          !thumbnailMap[pageNumber]
      )
      .sort((a, b) => a - b);
  }, [pdfDocument, currentPage, thumbnailMap, visibleThumbnailPages]);

  useEffect(() => {
    setThumbnails([]);
    setVisibleThumbnailPages([]);
  }, [pdfDocument]);

  const trackVisibleThumbnailPage = useCallback((pageNumber: number) => {
    setVisibleThumbnailPages((pages) =>
      pages.includes(pageNumber) ? pages : [...pages, pageNumber]
    );
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      if (pdfDocument) {
        setVisibleThumbnailPages(
          Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1)
        );
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const pageNumber = Number(
            (entry.target as HTMLElement).dataset.pageNumber
          );

          if (Number.isFinite(pageNumber)) {
            trackVisibleThumbnailPage(pageNumber);
          }
        });
      },
      { rootMargin: '600px 0px' }
    );

    intersectionObserverRef.current = observer;
    placeholderElementsRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      intersectionObserverRef.current = null;
    };
  }, [pdfDocument, trackVisibleThumbnailPage]);

  const setThumbnailPlaceholderRef = useCallback(
    (pageNumber: number, element: HTMLDivElement | null) => {
      const previousElement = placeholderElementsRef.current.get(pageNumber);

      if (previousElement) {
        intersectionObserverRef.current?.unobserve(previousElement);
        placeholderElementsRef.current.delete(pageNumber);
      }

      if (!element) return;

      placeholderElementsRef.current.set(pageNumber, element);
      intersectionObserverRef.current?.observe(element);
    },
    []
  );

  // 按当前页附近的窗口懒加载缩略图，避免大 PDF 一次性生成全部页面。
  useEffect(() => {
    if (!pdfDocument || pagesToLoad.length === 0) return;

    let cancelled = false;

    const loadThumbnails = async () => {
      for (const pageNumber of pagesToLoad) {
        if (cancelled) return;

        try {
          const page = await pdfDocument.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderTask = page.render({
            canvasContext: context,
            viewport,
            canvas,
          });

          await renderTask.promise;

          if (cancelled) return;

          setThumbnails((currentThumbnails) => {
            if (
              currentThumbnails.some(
                (thumbnail) => thumbnail.pageNumber === pageNumber
              )
            ) {
              return currentThumbnails;
            }

            return [
              ...currentThumbnails,
              {
                pageNumber,
                url: canvas.toDataURL(),
              },
            ].sort((a, b) => a.pageNumber - b.pageNumber);
          });
        } catch (error) {
          console.error(
            `Error loading thumbnail for page ${pageNumber}:`,
            error
          );
        }
      }
    };

    loadThumbnails();

    return () => {
      cancelled = true;
    };
  }, [pdfDocument, pagesToLoad]);

  // 加载书签
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!pdfDocument) return;
      try {
        const outline = await pdfDocument.getOutline();
        setBookmarks((outline as PDFOutline[]) || []);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks([]);
      }
    };

    loadBookmarks();
  }, [pdfDocument]);

  // 处理书签点击
  const handleBookmarkClick = async (bookmark: PDFOutline) => {
    if (!pdfDocument) return;

    try {
      let pageIndex: number | undefined;

      // 处理不同类型的书签目标
      if (bookmark.dest) {
        if (typeof bookmark.dest === 'string') {
          // 命名目标
          const destination = await pdfDocument.getDestination(bookmark.dest);
          if (destination && destination[0]) {
            pageIndex = await pdfDocument.getPageIndex(destination[0]);
          }
        } else if (Array.isArray(bookmark.dest) && bookmark.dest[0]) {
          // 显式目标
          pageIndex = await pdfDocument.getPageIndex(bookmark.dest[0]);
        }
      } else if (bookmark.pageNumber) {
        // 直接页码
        pageIndex = bookmark.pageNumber - 1;
      }

      if (typeof pageIndex === 'number') {
        onPageClick(pageIndex + 1);
      }
    } catch (error) {
      console.error('Error navigating to bookmark:', error);
    }
  };

  const renderThumbnailPlaceholder = (pageNumber: number) => (
    <div
      ref={(element) => setThumbnailPlaceholderRef(pageNumber, element)}
      key={pageNumber}
      data-page-number={pageNumber}
      className={`flex w-full flex-col items-center rounded p-1 ${
        currentPage === pageNumber ? 'bg-primary/10' : ''
      }`}
    >
      <Skeleton className="h-32 w-48" />
      <span className="mt-1 text-sm">第 {pageNumber} 页</span>
    </div>
  );

  const renderThumbnailList = () => {
    if (!pdfDocument || pdfDocument.numPages <= 0) return null;

    return Array.from({ length: pdfDocument.numPages }, (_, index) => {
      const pageNumber = index + 1;
      const thumbnail = thumbnailMap[pageNumber];

      return thumbnail ? (
        <PDFThumbnail
          key={pageNumber}
          thumbnail={thumbnail}
          isCurrentPage={currentPage === pageNumber}
          onClick={() => onPageClick(pageNumber)}
        />
      ) : (
        renderThumbnailPlaceholder(pageNumber)
      );
    });
  };

  return (
    <div className="w-64 border-r bg-muted">
      <Tabs defaultValue="thumbnails">
        <TabsList className="w-full p-2">
          <TabsTrigger value="thumbnails" className="flex-1 bg-transparent">
            缩略图
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex-1 bg-transparent">
            书签
          </TabsTrigger>
        </TabsList>

        <TabsContent value="thumbnails">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2 p-4">{renderThumbnailList()}</div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="bookmarks">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4">
              {bookmarks.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  没有可用的书签
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark, index) => (
                    <PDFBookmark
                      key={`${bookmark.title}-${index}`}
                      bookmark={bookmark}
                      depth={0}
                      onClick={handleBookmarkClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
