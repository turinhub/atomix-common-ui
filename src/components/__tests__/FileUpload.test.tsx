import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FileUpload } from '../FileUpload';

const createMockComponents = () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button type={type} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
});

const createFile = (
  name = 'report.pdf',
  content = 'content',
  type = 'application/pdf'
) => new File([content], name, { type });

describe('FileUpload', () => {
  it('缺少 components 时应该渲染错误提示', () => {
    render(<FileUpload />);

    expect(
      screen.getByText(/请通过 components prop 注入 UI 组件/)
    ).toBeInTheDocument();
  });

  it('应该选择并显示文件', async () => {
    const components = createMockComponents();
    const user = userEvent.setup();
    const onFilesChange = vi.fn();

    const { container } = render(
      <FileUpload components={components} onFilesChange={onFilesChange} />
    );

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createFile());

    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('待上传')).toBeInTheDocument();
    expect(onFilesChange).toHaveBeenCalled();
  });

  it('应该校验文件大小', async () => {
    const components = createMockComponents();
    const user = userEvent.setup();

    const { container } = render(
      <FileUpload components={components} maxSize={2} />
    );

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createFile('large.pdf', 'large content'));

    expect(screen.getByText('文件不能超过 2 B')).toBeInTheDocument();
    expect(screen.getByText('上传失败')).toBeInTheDocument();
  });

  it('应该调用 onUpload 并展示成功状态', async () => {
    const components = createMockComponents();
    const user = userEvent.setup();
    const onUpload = vi.fn(async (_item, helpers) => {
      helpers.setProgress(64);
      return { fileId: 'file-1' };
    });
    const onUploadComplete = vi.fn();

    const { container } = render(
      <FileUpload
        components={components}
        onUpload={onUpload}
        onUploadComplete={onUploadComplete}
      />
    );

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createFile());
    await user.click(screen.getByRole('button', { name: '开始上传' }));

    await waitFor(() => {
      expect(screen.getByText('上传完成')).toBeInTheDocument();
    });
    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(onUploadComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'report.pdf',
        status: 'success',
        progress: 100,
        result: { fileId: 'file-1' },
      })
    );
  });

  it('上传失败后应该展示错误并允许重试', async () => {
    const components = createMockComponents();
    const user = userEvent.setup();
    const onUpload = vi
      .fn()
      .mockRejectedValueOnce(new Error('network failed'))
      .mockResolvedValueOnce({ fileId: 'file-1' });

    const { container } = render(
      <FileUpload components={components} onUpload={onUpload} />
    );

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    await user.upload(input, createFile());
    await user.click(screen.getByRole('button', { name: '开始上传' }));

    await waitFor(() => {
      expect(screen.getByText('network failed')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '重试' }));

    await waitFor(() => {
      expect(screen.getByText('上传完成')).toBeInTheDocument();
    });
    expect(onUpload).toHaveBeenCalledTimes(2);
  });
});
