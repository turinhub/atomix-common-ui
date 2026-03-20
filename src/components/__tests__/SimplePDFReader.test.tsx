import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { SimplePDFReader } from '../SimplePDFReader';

// Mock react-pdf
const mockPDFDocument = {
  numPages: 3,
  getPage: vi.fn(),
};
let mockPdfLoadDelay = 100;
let mockPdfLoadError: Error | null = null;

vi.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, onLoadError }: any) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (mockPdfLoadError) {
          onLoadError?.(mockPdfLoadError);
        } else if (onLoadSuccess) {
          onLoadSuccess(mockPDFDocument);
        }
      }, mockPdfLoadDelay);
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
      promise: mockPdfLoadError
        ? Promise.reject(mockPdfLoadError)
        : Promise.resolve(mockPDFDocument),
    }),
  },
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  get version() {
    return '5.5.207';
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
  Input: ({ className, value, onChange, min, max }: any) => (
    <input
      className={className}
      data-testid="input"
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
    />
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
    mockPdfLoadDelay = 100;
    mockPdfLoadError = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该渲染加载状态', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        loadingText="正在加载..."
      />
    );

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    expect(screen.getByText('正在加载...')).toBeInTheDocument();
    await screen.findByTestId('pdf-page-1');
  });

  it('缺少 components 时应该显示错误', async () => {
    const { unmount } = render(
      // @ts-expect-error - 测试缺少 components 的情况
      <SimplePDFReader url="/test.pdf" />
    );

    expect(
      screen.getByText('错误：请通过 components prop 注入 UI 组件')
    ).toBeInTheDocument();
    unmount();
    await Promise.resolve();
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

  it('应该隐藏工具栏', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        showToolbar={false}
      />
    );

    const zoomText = screen.queryByText('100%');
    expect(zoomText).not.toBeInTheDocument();
    await screen.findByTestId('pdf-page-1');
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
    const pageInput = await screen.findByTestId('input');
    expect(pageInput).toBeInTheDocument();

    const buttons = screen.getAllByTestId('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('操作组件应在 PDF 上方同一行显示', async () => {
    const mockComponents = createMockComponents();

    render(<SimplePDFReader url="/test.pdf" components={mockComponents} />);

    const card = await screen.findByTestId('card');
    const cardContent = screen.getByTestId('card-content');
    const paginationInput = screen.getByTestId('input');
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
    const paginationIndex = getChildIndexContaining(paginationInput);

    expect(paginationIndex).toBeLessThan(contentIndex);
    expect(operationsBar).toContainElement(paginationInput);
    expect(
      screen.queryByText(/第 \d+ 页 \/ 共 \d+ 页/)
    ).not.toBeInTheDocument();
  });

  it('应该隐藏分页控制', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        showPagination={false}
      />
    );

    const pageInput = screen.queryByTestId('input');
    expect(pageInput).not.toBeInTheDocument();
    await screen.findByTestId('pdf-page-1');
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
    await screen.findByTestId('input');

    const operationsBar = screen.getByTestId('pdf-operations-bar');
    const buttons = within(operationsBar).getAllByTestId('button');
    const nextButton = buttons[buttons.length - 1];

    await user.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
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
    await screen.findByTestId('input');

    const operationsBar = screen.getByTestId('pdf-operations-bar');
    const buttons = within(operationsBar).getAllByTestId('button');
    const prevButton = buttons[buttons.length - 2];

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

    await screen.findByTestId('input');
    const operationsBar = screen.getByTestId('pdf-operations-bar');
    const buttons = within(operationsBar).getAllByTestId('button');
    const fullscreenButton = buttons[2];
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

    const operationsBar = screen.getByTestId('pdf-operations-bar');
    const operationButtons = within(operationsBar).getAllByTestId('button');

    expect(operationButtons[1]).toBeDisabled();
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

    const page = await screen.findByTestId('pdf-page-1');
    expect(page.parentElement).toHaveClass('custom-page-class');
  });

  it('应该显示自定义加载文本', async () => {
    const mockComponents = createMockComponents();

    render(
      <SimplePDFReader
        url="/test.pdf"
        components={mockComponents}
        loadingText="加载 PDF 中..."
      />
    );

    expect(screen.getByText('加载 PDF 中...')).toBeInTheDocument();
    await screen.findByTestId('pdf-page-1');
  });

  it('应该显示自定义错误文本', async () => {
    const mockComponents = createMockComponents();
    mockPdfLoadError = new Error('Failed to load');

    render(
      <SimplePDFReader
        url="/invalid.pdf"
        components={mockComponents}
        errorText="PDF 加载出错"
      />
    );

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
    await screen.findByTestId('input');
  });

  it('应该支持非受控模式', async () => {
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

    await screen.findByDisplayValue('1');

    const operationsBar = screen.getByTestId('pdf-operations-bar');
    const buttons = within(operationsBar).getAllByTestId('button');
    const nextButton = buttons[buttons.length - 1];
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
    await screen.findByDisplayValue('2');
  });

  describe('键盘快捷键', () => {
    it('应该支持 enableHotkeys 属性', async () => {
      const mockComponents = createMockComponents();

      const { rerender } = render(
        <SimplePDFReader
          url="/test.pdf"
          components={mockComponents}
          enableHotkeys={true}
        />
      );

      await screen.findByTestId('input');

      // Re-render with hotkeys disabled
      rerender(
        <SimplePDFReader
          url="/test.pdf"
          components={mockComponents}
          enableHotkeys={false}
        />
      );

      // Component should still render
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });
  });
});
