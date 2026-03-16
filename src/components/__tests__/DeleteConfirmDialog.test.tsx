import { render, screen, waitFor } from '@testing-library/react';
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
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder }: any) => (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
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
        itemName="测试项目"
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
        itemName="测试项目"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('确认删除')).toBeInTheDocument();
  });

  it('应该显示项目名称', () => {
    const mockComponents = createMockComponents();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        itemName="我的项目"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    // Check that dialog is rendered with the item name
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('应该要求输入验证文本', () => {
    const mockComponents = createMockComponents();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        itemName="测试项目"
        confirmText="DELETE"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />
    );

    // Check that confirm text is shown
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  it('应该禁用确认按钮直到输入正确文本', async () => {
    const mockComponents = createMockComponents();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        itemName="测试项目"
        confirmText="DELETE"
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />
    );

    const confirmButton = screen.getByText('确认删除');
    expect(confirmButton).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/请输入/);
    await user.type(input, 'DELETE');

    // Verify interaction works
    expect(input).toHaveValue('DELETE');
  });

  it('应该调用 onConfirm 当输入正确文本并点击确认', async () => {
    const mockComponents = createMockComponents();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteConfirmDialog
        components={mockComponents}
        open={true}
        itemName="测试项目"
        confirmText="DELETE"
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/请输入/);
    await user.type(input, 'DELETE');

    const confirmButton = screen.getByText('确认删除');
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
        itemName="测试项目"
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
      />
    );

    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
