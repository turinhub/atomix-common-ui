import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

const createMockComponents = () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid="dialog">
        {children}
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, variant, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
  Label: ({ children }: any) => <label>{children}</label>,
});

describe('DeleteConfirmDialog', () => {
  it('当 open 为 false 时不应该渲染', () => {
    const mockComponents = createMockComponents();

    const { container } = render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={false}
        title="确认删除"
        description="删除后不可恢复"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it('当 open 为 true 时应该渲染对话框', () => {
    const mockComponents = createMockComponents();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        title="确认删除"
        description="删除后不可恢复"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '确认删除' })
    ).toBeInTheDocument();
  });

  it('应该渲染标题和描述', () => {
    const mockComponents = createMockComponents();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        title="确认删除用户"
        description="删除后无法恢复"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('确认删除用户')).toBeInTheDocument();
    expect(screen.getByText('删除后无法恢复')).toBeInTheDocument();
  });

  it('应该要求输入验证文本', () => {
    const mockComponents = createMockComponents();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        title="确认删除"
        description="删除后不可恢复"
        verification={{
          targetValue: 'DELETE',
          label: '请输入 DELETE 以确认',
          placeholder: '请输入 DELETE',
        }}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('请输入 DELETE 以确认')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入 DELETE')).toBeInTheDocument();
  });

  it('应该禁用确认按钮直到输入正确文本', async () => {
    const mockComponents = createMockComponents();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        title="确认删除"
        description="删除后不可恢复"
        verification={{
          targetValue: 'DELETE',
          placeholder: '请输入 DELETE',
        }}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: '确认删除' });
    expect(confirmButton).toBeDisabled();

    const input = screen.getByPlaceholderText('请输入 DELETE');
    await user.type(input, 'abc');
    expect(confirmButton).toBeDisabled();
    await user.clear(input);
    await user.type(input, 'DELETE');

    expect(input).toHaveValue('DELETE');
    expect(confirmButton).not.toBeDisabled();
  });

  it('应该调用 onConfirm 当输入正确文本并点击确认', async () => {
    const mockComponents = createMockComponents();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        title="确认删除"
        description="删除后不可恢复"
        verification={{
          targetValue: 'DELETE',
          placeholder: '请输入 DELETE',
        }}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('请输入 DELETE');
    await user.type(input, 'DELETE');

    const confirmButton = screen.getByRole('button', { name: '确认删除' });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('应该调用 onOpenChange 当点击取消', async () => {
    const mockComponents = createMockComponents();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        title="确认删除"
        description="删除后不可恢复"
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
      />
    );

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
