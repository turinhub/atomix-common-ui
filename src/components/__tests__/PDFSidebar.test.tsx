import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PDFSidebar } from '../PDFSidebar';

// Mock Canvas API for thumbnail generation
const mockCanvasContext = {
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  clearRect: vi.fn(),
};

const mockCanvas = {
  width: 0,
  height: 0,
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  getContext: vi.fn(() => mockCanvasContext),
};

// Mock document.createElement for canvas
const originalCreateElement = document.createElement;
beforeEach(() => {
  document.createElement = vi.fn((tag) => {
    if (tag === 'canvas') {
      return mockCanvas as unknown as HTMLCanvasElement;
    }
    return originalCreateElement.call(document, tag);
  });
});

afterEach(() => {
  document.createElement = originalCreateElement;
  vi.clearAllMocks();
});

// Mock PDF document
const createMockPDFDocument = (numPages = 5, hasBookmarks = true) => ({
  numPages,
  getPage: vi.fn(async (pageNumber: number) => ({
    getViewport: vi.fn(() => ({ width: 192, height: 256 })),
    render: vi.fn(async () => ({ promise: Promise.resolve() })),
  })),
  getOutline: vi.fn(async () =>
    hasBookmarks
      ? [
          {
            title: 'Chapter 1',
            dest: [{}],
            pageNumber: 1,
            items: [
              { title: 'Section 1.1', dest: [{}], pageNumber: 2 },
              { title: 'Section 1.2', dest: [{}], pageNumber: 3 },
            ],
          },
          { title: 'Chapter 2', dest: [{}], pageNumber: 4 },
        ]
      : null
  ),
  getDestination: vi.fn(async () => [{}]),
  getPageIndex: vi.fn(async () => 0),
});

const createMockComponents = () => ({
  Tabs: ({ children, defaultValue, value, onValueChange }: any) => {
    const [activeTab, setActiveTab] = React.useState(
      value || defaultValue || 'thumbnails'
    );

    return (
      <div data-testid="tabs">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              activeTab,
              setActiveTab,
              onValueChange,
            });
          }
          return child;
        })}
      </div>
    );
  },
  TabsList: ({ children, activeTab, setActiveTab, onValueChange }: any) => (
    <div data-testid="tabs-list" data-active-tab={activeTab}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            setActiveTab,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    activeTab,
    setActiveTab,
    onValueChange,
  }: any) => (
    <button
      data-testid={`tabs-trigger-${value}`}
      data-active={activeTab === value}
      onClick={() => {
        setActiveTab?.(value);
        onValueChange?.(value);
      }}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value, activeTab }: any) =>
    activeTab === value ? (
      <div data-testid={`tabs-content-${value}`}>{children}</div>
    ) : null,
  ScrollArea: ({ children, className }: any) => (
    <div className={className} data-testid="scroll-area">
      {children}
    </div>
  ),
  Skeleton: ({ className }: any) => (
    <div className={className} data-testid="skeleton" />
  ),
});

describe('PDFSidebar', () => {
  it('应该渲染缩略图和书签标签', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-trigger-thumbnails')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-trigger-bookmarks')).toBeInTheDocument();
  });

  it('应该显示缩略图加载骨架屏', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Initially should show skeleton
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);

    // Wait for thumbnails to load
    await screen.findByAltText('Page 1');
  });

  it('应该生成并显示缩略图', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Wait for thumbnails to be generated
    await screen.findByText(/第 1 页/);
    expect(screen.getByText(/第 1 页/)).toBeInTheDocument();
    expect(screen.getByText(/第 2 页/)).toBeInTheDocument();
  });

  it('应该高亮当前页的缩略图', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={2}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Wait for thumbnails to load
    const thumbnail2 = await screen.findByText(/第 2 页/);
    expect(thumbnail2).toBeInTheDocument();

    // Check that the parent has the highlight class
    const thumbnailContainer = thumbnail2.closest('.flex');
    expect(thumbnailContainer).toHaveClass('bg-primary/10');
  });

  it('点击缩略图应该调用 onPageClick', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();
    const onPageClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={onPageClick}
        components={mockComponents as any}
      />
    );

    // Wait for thumbnails to load
    const thumbnail3 = await screen.findByAltText('Page 3');
    await user.click(thumbnail3);

    expect(onPageClick).toHaveBeenCalledWith(3);
  });

  it('应该切换到书签标签', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();
    const user = userEvent.setup();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    const bookmarksTab = screen.getByTestId('tabs-trigger-bookmarks');
    await user.click(bookmarksTab);

    expect(screen.getByTestId('tabs-content-bookmarks')).toBeInTheDocument();
  });

  it('应该显示书签列表', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();
    const user = userEvent.setup();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Switch to bookmarks tab
    const bookmarksTab = screen.getByTestId('tabs-trigger-bookmarks');
    await user.click(bookmarksTab);

    // Check if bookmarks are displayed
    expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2')).toBeInTheDocument();
  });

  it('应该显示嵌套书签', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();
    const user = userEvent.setup();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Switch to bookmarks tab
    const bookmarksTab = screen.getByTestId('tabs-trigger-bookmarks');
    await user.click(bookmarksTab);

    // Check if nested bookmarks are displayed
    expect(screen.getByText('Section 1.1')).toBeInTheDocument();
    expect(screen.getByText('Section 1.2')).toBeInTheDocument();
  });

  it('点击书签应该调用 onPageClick', async () => {
    const mockPDF = createMockPDFDocument();
    const mockComponents = createMockComponents();
    const onPageClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={onPageClick}
        components={mockComponents as any}
      />
    );

    // Switch to bookmarks tab
    const bookmarksTab = screen.getByTestId('tabs-trigger-bookmarks');
    await user.click(bookmarksTab);

    // Click on a bookmark
    const chapter2Button = screen.getByText('Chapter 2');
    await user.click(chapter2Button);

    expect(onPageClick).toHaveBeenCalled();
  });

  it('没有书签时应该显示提示信息', async () => {
    const mockPDF = createMockPDFDocument(5, false); // No bookmarks
    const mockComponents = createMockComponents();
    const user = userEvent.setup();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Switch to bookmarks tab
    const bookmarksTab = screen.getByTestId('tabs-trigger-bookmarks');
    await user.click(bookmarksTab);

    expect(screen.getByText('没有可用的书签')).toBeInTheDocument();
  });

  it('应该正确处理缩略图生成错误', async () => {
    const mockPDF = {
      numPages: 3,
      getPage: vi.fn(async (pageNumber: number) => {
        if (pageNumber === 2) {
          throw new Error('Failed to render page');
        }
        return {
          getViewport: vi.fn(() => ({ width: 192, height: 256 })),
          render: vi.fn(async () => ({ promise: Promise.resolve() })),
        };
      }),
      getOutline: vi.fn(async () => null),
      getDestination: vi.fn(async () => [{}]),
      getPageIndex: vi.fn(async () => 0),
    };

    const mockComponents = createMockComponents();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    // Should still render other thumbnails even if one fails
    await screen.findByText(/第 1 页/);
    expect(screen.getByText(/第 1 页/)).toBeInTheDocument();
  });

  it('应该处理空的 PDF 文档', async () => {
    const mockPDF = {
      numPages: 0,
      getPage: vi.fn(),
      getOutline: vi.fn(async () => null),
      getDestination: vi.fn(async () => null),
      getPageIndex: vi.fn(async () => 0),
    };

    const mockComponents = createMockComponents();

    render(
      <PDFSidebar
        pdfDocument={mockPDF as any}
        currentPage={1}
        onPageClick={vi.fn()}
        components={mockComponents as any}
      />
    );

    const tabsContent = await screen.findByTestId('tabs-content-thumbnails');
    expect(tabsContent).toBeInTheDocument();
  });
});
