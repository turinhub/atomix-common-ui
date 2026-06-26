import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MarkdownReader } from '../MarkdownReader';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unmock('react-markdown');
  vi.unmock('remark-gfm');
});

describe('MarkdownReader', () => {
  it('renders common markdown and GFM content', async () => {
    const { container } = render(
      <MarkdownReader
        content={`# 标题

普通段落

- [x] 已完成
- [ ] 未完成

| 字段 | 说明 |
| --- | --- |
| name | 名称 |

\`\`\`ts
const value = 1;
\`\`\``}
      />
    );

    expect(await screen.findByRole('heading', { name: '标题' })).toBeVisible();
    expect(screen.getByText('普通段落')).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
    expect(screen.getByText('name')).toBeVisible();
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(
      2
    );
    expect(container.querySelector('code')?.textContent).toContain(
      'const value = 1'
    );
  });

  it('uses content before sourceUrl', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({} as Response);

    render(<MarkdownReader content="# Local content" sourceUrl="/remote.md" />);

    expect(
      await screen.findByRole('heading', { name: 'Local content' })
    ).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads markdown from sourceUrl', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '# Remote content',
    } as Response);

    render(<MarkdownReader sourceUrl="/remote.md" />);

    expect(
      await screen.findByRole('heading', { name: 'Remote content' })
    ).toBeVisible();
  });

  it('does not reload sourceUrl when only onLoadError changes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => '# Stable remote content',
    } as Response);

    const { rerender } = render(
      <MarkdownReader sourceUrl="/remote.md" onLoadError={vi.fn()} />
    );

    expect(
      await screen.findByRole('heading', { name: 'Stable remote content' })
    ).toBeVisible();

    rerender(<MarkdownReader sourceUrl="/remote.md" onLoadError={vi.fn()} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error when sourceUrl fails', async () => {
    const onLoadError = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    render(
      <MarkdownReader sourceUrl="/missing.md" onLoadError={onLoadError} />
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Markdown 加载失败'
    );
    expect(screen.getByText('请求失败：404')).toBeVisible();
    expect(onLoadError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('renders loading, explicit error, and empty states', async () => {
    const { rerender } = render(
      <MarkdownReader content="# Ignored" loading loadingText="加载中" />
    );

    expect(screen.getByRole('status')).toHaveTextContent('加载中');

    rerender(<MarkdownReader content="# Ignored" error="外部错误" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('外部错误');

    rerender(<MarkdownReader content="" emptyText="空内容" />);
    expect(await screen.findByText('空内容')).toBeVisible();
  });

  it('renders images as links when allowImages is false', async () => {
    render(
      <MarkdownReader
        content="![示例图片](https://example.com/image.png)"
        allowImages={false}
      />
    );

    expect(
      await screen.findByRole('link', { name: '示例图片' })
    ).toHaveAttribute('href', 'https://example.com/image.png');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders markdown images with lazy async decoding', async () => {
    render(
      <MarkdownReader content="![示例图片](https://example.com/image.png)" />
    );

    const image = await screen.findByRole('img', { name: '示例图片' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('opens links in a new tab by default', async () => {
    render(<MarkdownReader content="[官网](https://example.com)" />);

    const link = await screen.findByRole('link', { name: '官网' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('shows an error when markdown dependencies fail to load', async () => {
    const onLoadError = vi.fn();

    vi.doMock('react-markdown', () => {
      throw new Error('missing react-markdown');
    });

    render(<MarkdownReader content="# Broken" onLoadError={onLoadError} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Markdown 加载失败'
    );
    expect(onLoadError).toHaveBeenCalledWith(expect.any(Error));
  });
});
