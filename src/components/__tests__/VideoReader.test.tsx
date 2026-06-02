import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  SUPPORTED_VIDEO_EXTENSIONS,
  SUPPORTED_VIDEO_MIME_TYPES,
  VideoReader,
} from '../VideoReader';

describe('VideoReader', () => {
  it('exports common browser video formats', () => {
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('mp4');
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('webm');
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('ogg');
    expect(SUPPORTED_VIDEO_EXTENSIONS).toContain('mov');
    expect(SUPPORTED_VIDEO_MIME_TYPES).toContain('video/mp4');
    expect(SUPPORTED_VIDEO_MIME_TYPES).toContain('video/webm');
  });

  it('renders a video preview and clears the loading state', () => {
    const onLoadedData = vi.fn();
    const { container } = render(
      <VideoReader
        src="https://example.com/demo.mp4"
        mimeType="video/mp4"
        title="演示视频"
        onLoadedData={onLoadedData}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('正在加载视频');

    const video = container.querySelector('video') as HTMLVideoElement;
    const source = container.querySelector('source') as HTMLSourceElement;

    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('title', '演示视频');
    expect(source).toHaveAttribute('src', 'https://example.com/demo.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');

    fireEvent.loadedData(video);

    expect(onLoadedData).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('resets the loading state and source when the video source changes', () => {
    const { container, rerender } = render(
      <VideoReader src="/videos/before.mp4" mimeType="video/mp4" />
    );
    const video = container.querySelector('video') as HTMLVideoElement;

    fireEvent.loadedData(video);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<VideoReader src="/videos/after.mp4" mimeType="video/mp4" />);

    expect(screen.getByRole('status')).toHaveTextContent('正在加载视频');
    expect(container.querySelector('source')).toHaveAttribute(
      'src',
      '/videos/after.mp4'
    );
  });

  it('shows an unsupported state for non-video sources', () => {
    const { container } = render(<VideoReader src="/docs/report.xlsx" />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '暂不支持该视频格式'
    );
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('renders caption tracks', () => {
    const { container } = render(
      <VideoReader
        src="/videos/demo.webm"
        tracks={[
          {
            src: '/videos/demo.zh.vtt',
            kind: 'subtitles',
            srcLang: 'zh-CN',
            label: '中文',
            default: true,
          },
        ]}
      />
    );

    const track = container.querySelector('track') as HTMLTrackElement;
    expect(track).toHaveAttribute('src', '/videos/demo.zh.vtt');
    expect(track).toHaveAttribute('kind', 'subtitles');
    expect(track).toHaveAttribute('srclang', 'zh-CN');
    expect(track).toHaveAttribute('label', '中文');
  });

  it('reports native video load errors', () => {
    const onError = vi.fn();
    const { container } = render(
      <VideoReader src="/videos/broken.mp4" onError={onError} />
    );

    const video = container.querySelector('video') as HTMLVideoElement;
    fireEvent.error(video);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(screen.getByRole('alert')).toHaveTextContent('视频加载失败');
  });
});
