import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { SimplePDFReader } from '../SimplePDFReader';

// Mock react-pdf
const mockPDFDocument = {
  numPages: 3,
  getPage: vi.fn(),
};

vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, onLoadError }: any) => {
    // Simulate async loading
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (onLoadSuccess) {
          onLoadSuccess(mockPDFDocument);
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [onLoadSuccess, onLoadError]);

    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: ({ pageNumber, scale }: any) => (
    <div data-testid={`pdf-page-${pageNumber}`} data-scale={scale}>
      Page {pageNumber}
    </div>
  ),
  pdfjs: {
    getDocument: () => ({
      promise: Promise.resolve(mockPDFDocument),
    }),
  },
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  get version() {
    return '4.0.0';
  },
  GlobalWorkerOptions: {
    workerSrc: '',
  },
}));

const createMockComponents = () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className} data-testid="card-footer">
      {children}
    </div>
  ),
  Button: ({ children, className, disabled, onClick }: any) => (
    <button
      className={className}
      data-testid="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  ),
  Label: ({ children, className }: any) => (
    <label className={className} data-testid="label">
      {children}
    </label>
  ),
  Skeleton: ({ className }: any) => (
    <div className={className} data-testid="skeleton" />
  ),
});

describe('SimplePDFReader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该渲染加载状态', () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        loadingText="正在加载..."
      />
    );

    // Use getAllByTestId since we render multiple skeletons
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    expect(screen.getByText('正在加载...')).toBeInTheDocument();
  });

  it('缺少 components 时应该显示错误', () => {
    render(
      // @ts-expect-error - 测试缺少 components 的情况
      <SimplePDFReader url="/test.pdf" />
    );

    expect(
      screen.getByText('错误：请通过 components prop 注入 UI 组件')
    ).toBeInTheDocument();
  });

  it('应该显示工具栏', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        showToolbar={true}
        initialPage={1}
      />
    );

    // Wait for loading to complete
    const zoomText = await screen.findByText('100%');
    expect(zoomText).toBeInTheDocument();
  });

  it('应该隐藏工具栏', () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        showToolbar={false}
      />
    );

    // Toolbar should not be visible
    const zoomText = screen.queryByText('100%');
    expect(zoomText).not.toBeInTheDocument();
  });

  it('应该显示分页控制', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        showPagination={true}
        initialPage={1}
      />
    );

    // Wait for loading to complete
    const pageInfo = await screen.findByText(/\d+ \/ \d+/);
    expect(pageInfo).toBeInTheDocument();

    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('操作组件应在 PDF 上方同一行显示', async () => {
    const mockComponents = createMockComponents();

    render(<SimplePDFReader url="/test.pdf" components={mockComponents} />);

    const card = await screen.findByTestId('card');
    const cardContent = screen.getByTestId('card-content');
    const paginationInfo = screen.getByText(/\d+ \/ \d+/);
    const contentIndex = Array.prototype.indexOf.call(
      card.children,
      cardContent
    );
    const operationsBar = screen.getByTestId('pdf-operations-bar');
    const getChildIndexContaining = (target: HTMLElement) => {
      for (let index = 0; index < card.children.length; index += 1) {
        if (card.children[index]?.contains(target)) {
          return index;
        }
      }
      return -1;
    };
    const paginationIndex = getChildIndexContaining(paginationInfo);

    expect(paginationIndex).toBeLessThan(contentIndex);
    expect(operationsBar).toContainElement(paginationInfo);
    expect(
      screen.queryByText(/第 \d+ 页 \/ 共 \d+ 页/)
    ).not.toBeInTheDocument();
  });

  it('应该隐藏分页控制', () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        showPagination={false}
      />
    );

    // Pagination should not be visible
    const pageInfo = screen.queryByText(/\d+ \/ \d+/);
    expect(pageInfo).not.toBeInTheDocument();
  });

  it('应该调用 onPageChange', async () => {
    const mockComponents = createMockComponents();
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        initialPage={1}
        onPageChange={onPageChange}
      />
    );

    // Wait for component to load
    await screen.findByText(/\d+ \/ \d+/);

    // Find next page button (the button with "下一页" text)
    const buttons = screen.getAllByTestId('button');
    const nextButton = buttons.find((btn) =>
      btn.textContent?.includes('下一页')
    );

    expect(nextButton).toBeInTheDocument();

    if (nextButton) {
      await user.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2);
    }
  });

  it('第一页时上一页按钮应该禁用', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        initialPage={1}
      />
    );

    // Wait for component to load
    await screen.findByText(/\d+ \/ \d+/);

    const buttons = screen.getAllByTestId('button');
    const prevButton = buttons.find((btn) =>
      btn.textContent?.includes('上一页')
    );

    expect(prevButton).toBeDisabled();
  });

  it('应该支持缩放控制', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        initialScale={1.0}
      />
    );

    // Wait for component to load
    const scaleText = await screen.findByText(/100%/);
    expect(scaleText).toBeInTheDocument();
  });

  it('默认 100% 缩放时应不限制页面最大高度', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        initialScale={1.0}
      />
    );

    const page = await screen.findByTestId('pdf-page-1');
    const pageContainer = page.parentElement?.parentElement;

    expect(pageContainer).toBeTruthy();
    expect((pageContainer as HTMLElement).style.maxHeight).toBe('');
  });

  it('应该支持全屏切换', async () => {
    const mockComponents = createMockComponents();
    const requestFullscreenMock = vi.fn();

    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      writable: true,
      value: requestFullscreenMock,
    });

    const user = userEvent.setup();

    render(<SimplePDFReader url="/test.pdf" components={mockComponents} />);

    const fullscreenButton = await screen.findByText('全屏');
    await user.click(fullscreenButton);

    expect(requestFullscreenMock).toHaveBeenCalled();
  });

  it('达到最大缩放时放大按钮应该禁用', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        initialScale={3.0}
        maxScale={3.0}
      />
    );

    // Wait for component to load
    await screen.findByText(/300%/);

    const buttons = screen.getAllByTestId('button');
    // Find zoom in button (it should be disabled)
    const disabledButtons = buttons.filter((btn) => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('应该应用自定义类名', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        className="custom-card-class"
        containerClassName="custom-container-class"
        pageClassName="custom-page-class"
      />
    );

    const card = await screen.findByTestId('card');
    expect(card).toHaveClass('custom-card-class');

    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('custom-container-class');
  });

  it('应该显示自定义加载文本', () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        loadingText="加载 PDF 中..."
      />
    );

    expect(screen.getByText('加载 PDF 中...')).toBeInTheDocument();
  });

  it('应该显示自定义错误文本', async () => {
    const mockComponents = createMockComponents();

    // Mock a failed load
    vi.doMock('react-pdf', () => ({
      Document: ({ onLoadError }: any) => {
        React.useEffect(() => {
          onLoadError?.(new Error('Failed to load'));
        }, [onLoadError]);
        return <div data-testid="pdf-document" />;
      },
      Page: () => <div>Page</div>,
      pdfjs: {
        getDocument: () => ({
          promise: Promise.reject(new Error('Failed to load')),
        }),
      },
    }));

    render(
      <SimplePDFReader
        url="/invalid.pdf"
        components={mockComponents}
        errorText="PDF 加载出错"
      />
    );

    // Error text should appear after loading fails
    await screen.findByText('PDF 加载出错');
  });

  it('应该使用受控模式', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        currentPage={2}
        scale={1.5}
      />
    );

    // Should display the controlled scale
    await screen.findByText(/150%/);
  });

  it('应该加载 PDF 文档', async () => {
    const mockComponents = createMockComponents();

    render(<SimplePDFReader url="/test.pdf" components={mockComponents} />);

    // Wait for page indicator to appear
    await screen.findByText(/\d+\s*\/\s*\d+/);
  });

  it('应该支持非受控模式', async () => {
    const mockComponents = createMockComponents();
    const onPageChange = vi.fn();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        initialPage={1}
        onPageChange={onPageChange}
      />
    );

    // Wait for component to load
    await screen.findByText(/\d+\s*\/\s*\d+/);

    // Verify onPageChange is a function
    expect(typeof onPageChange).toBe('function');
  });
});
