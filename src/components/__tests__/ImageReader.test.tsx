import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  ImageReader,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '../ImageReader';

describe('ImageReader', () => {
  it('exports common browser image formats', () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('jpg');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('png');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('gif');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('webp');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('svg');
    expect(SUPPORTED_IMAGE_MIME_TYPES).toContain('image/jpeg');
    expect(SUPPORTED_IMAGE_MIME_TYPES).toContain('image/svg+xml');
  });

  it('renders an image preview and clears the loading state', () => {
    const onLoad = vi.fn();
    render(
      <ImageReader
        src="https://example.com/photo.png"
        alt="产品截图"
        width={1280}
        height={720}
        onLoad={onLoad}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('正在加载图片');
    expect(screen.getByRole('img', { name: '产品截图' })).toHaveAttribute(
      'decoding',
      'async'
    );
    expect(screen.getByRole('img', { name: '产品截图' })).toHaveAttribute(
      'width',
      '1280'
    );
    expect(screen.getByRole('img', { name: '产品截图' })).toHaveAttribute(
      'height',
      '720'
    );

    fireEvent.load(screen.getByRole('img', { name: '产品截图' }));

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('resets the loading state when the image source changes', () => {
    const { rerender } = render(
      <ImageReader src="/assets/before.png" alt="预览图" />
    );

    fireEvent.load(screen.getByRole('img', { name: '预览图' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<ImageReader src="/assets/after.png" alt="预览图" />);

    expect(screen.getByRole('status')).toHaveTextContent('正在加载图片');
    expect(screen.getByRole('img', { name: '预览图' })).toHaveAttribute(
      'src',
      '/assets/after.png'
    );
  });

  it('shows an unsupported state for non-image sources', () => {
    render(<ImageReader src="/docs/report.docx" />);

    expect(screen.getByRole('alert')).toHaveTextContent('暂不支持该图片格式');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('supports zoom and rotation toolbar actions', async () => {
    const user = userEvent.setup();
    const onScaleChange = vi.fn();
    const onRotationChange = vi.fn();

    render(
      <ImageReader
        src="/assets/photo.webp"
        onScaleChange={onScaleChange}
        onRotationChange={onRotationChange}
      />
    );

    await user.click(screen.getByRole('button', { name: '放大' }));
    await user.click(screen.getByRole('button', { name: '向右旋转' }));

    expect(onScaleChange).toHaveBeenCalledWith(1.25);
    expect(onRotationChange).toHaveBeenCalledWith(90);
  });

  it('uses injected card and skeleton components when provided', () => {
    render(
      <ImageReader
        src="/assets/photo.jpg"
        components={{
          Card: ({ children }: any) => (
            <section data-testid="card">{children}</section>
          ),
          CardContent: ({ children }: any) => <div>{children}</div>,
          Skeleton: ({ className }: any) => (
            <div className={className} data-testid="skeleton" />
          ),
        }}
      />
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(2);
  });
});
