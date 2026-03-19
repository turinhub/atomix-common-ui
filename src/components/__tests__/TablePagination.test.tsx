import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { TablePagination } from '../TablePagination';

const createMockComponents = () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value, onClick }: any) => (
    <button onClick={onClick} data-value={value} type="button">
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
});

describe('TablePagination', () => {
  it('应该渲染分页信息', () => {
    const mockComponents = createMockComponents();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={1}
        pageSize={10}
        total={100}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText(/共 100 条/)).toBeInTheDocument();
  });

  it('应该显示当前页信息', () => {
    const mockComponents = createMockComponents();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={2}
        pageSize={10}
        total={100}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('第 3 页，共 10 页')).toBeInTheDocument();
  });

  it('应该禁用上一页按钮在第一页', () => {
    const mockComponents = createMockComponents();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={0}
        pageSize={10}
        total={100}
        onPageChange={vi.fn()}
      />
    );

    const prevButton = screen.getByRole('button', { name: '上一页' });
    expect(prevButton).toBeDisabled();
  });

  it('应该触发页码变化', async () => {
    const mockComponents = createMockComponents();
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={1}
        pageSize={10}
        total={100}
        onPageChange={onPageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: '下一页' });
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('应该显示每页条数选择器', () => {
    const mockComponents = createMockComponents();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={1}
        pageSize={10}
        total={100}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        pageSizeOptions={[10, 20, 50]}
      />
    );

    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('应该支持点击数字页码跳转', async () => {
    const mockComponents = createMockComponents();
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={1}
        pageSize={10}
        total={200}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: '3' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('应该支持输入页码后跳转', async () => {
    const mockComponents = createMockComponents();
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={0}
        pageSize={10}
        total={200}
        onPageChange={onPageChange}
      />
    );

    const jumpInput = screen.getByLabelText('跳转页码');
    await user.clear(jumpInput);
    await user.type(jumpInput, '8');
    await user.click(screen.getByRole('button', { name: '跳转' }));

    expect(onPageChange).toHaveBeenCalledWith(7);
  });

  it('应支持隐藏跳转页码区域', () => {
    const mockComponents = createMockComponents();

    render(
      <TablePagination
        components={mockComponents}
        currentPage={0}
        pageSize={10}
        total={200}
        onPageChange={vi.fn()}
        showJumpToPage={false}
      />
    );

    expect(screen.queryByLabelText('跳转页码')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '跳转' })
    ).not.toBeInTheDocument();
  });
});
