import { useState, useEffect, memo } from 'react';

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
      <img
        src={thumbnail.url}
        alt={`Page ${thumbnail.pageNumber}`}
        className="w-48 cursor-pointer border transition-opacity hover:opacity-80"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      />
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
 * import { PDFSidebar } from '@turinhub/atomix-common-ui';
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
  const [loading, setLoading] = useState(true);

  const { Tabs, TabsList, TabsTrigger, TabsContent, ScrollArea, Skeleton } =
    components;

  // 加载缩略图
  useEffect(() => {
    const loadThumbnails = async () => {
      if (!pdfDocument) return;

      setLoading(true);
      const thumbs: PDFThumbnail[] = [];

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        try {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;

          thumbs.push({
            pageNumber: i,
            url: canvas.toDataURL(),
          });
        } catch (error) {
          console.error(`Error loading thumbnail for page ${i}:`, error);
        }
      }

      setThumbnails(thumbs);
      setLoading(false);
    };

    loadThumbnails();
  }, [pdfDocument]);

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

  // 渲染缩略图骨架屏
  const renderThumbnailSkeleton = () => (
    <div className="space-y-2 p-4">
      {Array.from({ length: pdfDocument?.numPages || 5 }, (_, i) => (
        <div key={i} className="flex flex-col items-center p-1">
          <Skeleton className="h-32 w-48" />
          <Skeleton className="mt-1 h-4 w-16" />
        </div>
      ))}
    </div>
  );

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
            {loading ? (
              renderThumbnailSkeleton()
            ) : (
              <div className="space-y-2 p-4">
                {thumbnails.map((thumb) => (
                  <PDFThumbnail
                    key={thumb.pageNumber}
                    thumbnail={thumb}
                    isCurrentPage={currentPage === thumb.pageNumber}
                    onClick={() => onPageClick(thumb.pageNumber)}
                  />
                ))}
              </div>
            )}
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
