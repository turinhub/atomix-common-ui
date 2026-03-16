import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { TableHeader } from '../TableHeader';

const createMockComponents = () => ({
  Input: ({ value, onChange, placeholder }: any) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
});

describe('TableHeader', () => {
  it('应该渲染标题', () => {
    const mockComponents = createMockComponents();

    render(
      <TableHeader
        components={mockComponents}
        title="测试标题"
      />
    );

    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });

  it('应该渲染搜索框', () => {
    const mockComponents = createMockComponents();

    render(
      <TableHeader
        components={mockComponents}
        title="测试标题"
        showSearch={true}
        searchPlaceholder="搜索..."
      />
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
  });

  it('应该触发搜索回调', async () => {
    const mockComponents = createMockComponents();
    const onSearchChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TableHeader
        components={mockComponents}
        title="测试标题"
        showSearch={true}
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByTestId('search-input');
    await user.type(input, 'test');

    expect(onSearchChange).toHaveBeenCalled();
  });

  it('应该渲染操作按钮', () => {
    const mockComponents = createMockComponents();

    render(
      <TableHeader
        components={mockComponents}
        title="测试标题"
        action={<button>添加</button>}
      />
    );

    expect(screen.getByText('添加')).toBeInTheDocument();
  });
});
