import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FocusEvent, KeyboardEvent, ReactNode } from 'react';

import { cn } from '../lib/utils';

export interface AuthVisualCarouselItem {
  image: string;
  alt: string;
  width?: number;
  height?: number;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
}

export interface AuthVisualCarouselProps {
  items: AuthVisualCarouselItem[];
  intervalMs?: number;
  showIndicators?: boolean;
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  ariaLabel?: string;
}

export function AuthVisualCarousel({
  items,
  intervalMs = 5000,
  showIndicators = true,
  showText = true,
  className,
  imageClassName,
  contentClassName,
  ariaLabel = '认证页视觉轮播',
}: AuthVisualCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasItems = items.length > 0;
  const currentItem = hasItems ? items[currentSlide] : undefined;
  const canAutoplay = intervalMs > 0 && items.length > 1;
  const isAutoplayPaused =
    isManuallyPaused || isInteractionPaused || prefersReducedMotion;

  const goToSlide = (index: number) => {
    if (!hasItems) return;
    setCurrentSlide((index + items.length) % items.length);
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const previousSlide = () => goToSlide(currentSlide - 1);

  useEffect(() => {
    if (!hasItems || !canAutoplay || isAutoplayPaused) return;
    const timer = setTimeout(() => {
      setCurrentSlide((slide) => (slide + 1) % items.length);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [
    canAutoplay,
    hasItems,
    intervalMs,
    isAutoplayPaused,
    items.length,
    currentSlide,
  ]);

  useEffect(() => {
    if (currentSlide >= items.length && items.length > 0) {
      setCurrentSlide(items.length - 1);
    }
  }, [currentSlide, items.length]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousSlide();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsInteractionPaused(false);
    }
  };

  if (!hasItems) {
    return (
      <div
        className={cn(
          'relative h-full min-h-[360px] w-full overflow-hidden bg-background',
          className
        )}
        aria-label={ariaLabel}
        role="region"
      />
    );
  }

  return (
    <div
      className={cn(
        'relative h-full min-h-[360px] w-full overflow-hidden bg-background text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      tabIndex={0}
      aria-label={ariaLabel}
      role="region"
      aria-roledescription="轮播"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={handleBlur}
    >
      {items.map((item, index) => (
        <img
          key={`${item.image}-${index}`}
          src={item.image}
          alt={index === currentSlide ? item.alt : ''}
          width={item.width ?? 1600}
          height={item.height ?? 900}
          fetchPriority={index === currentSlide ? 'high' : 'auto'}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none',
            index === currentSlide ? 'opacity-100' : 'opacity-0',
            imageClassName
          )}
          aria-hidden={index !== currentSlide}
        />
      ))}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/95 via-background/55 to-background/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/45 to-transparent pb-16 pt-24"
        aria-hidden="true"
      />

      {(showText ||
        showIndicators ||
        (canAutoplay && !prefersReducedMotion)) && (
        <div
          className={cn(
            'absolute inset-x-5 bottom-6 min-w-0 text-foreground sm:inset-x-8 sm:bottom-8 lg:inset-x-12 lg:bottom-10',
            contentClassName
          )}
        >
          {showText && currentItem && (
            <div
              className="hidden min-w-0 max-w-[min(28rem,calc(100vw-2.5rem))] sm:block"
              aria-live={isAutoplayPaused ? 'polite' : 'off'}
              aria-atomic="true"
            >
              {currentItem.eyebrow && (
                <p className="mb-2 break-words text-xs font-medium text-primary">
                  {currentItem.eyebrow}
                </p>
              )}
              {currentItem.title && (
                <h2 className="text-balance break-words text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
                  {currentItem.title}
                </h2>
              )}
              {currentItem.description && (
                <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-muted-foreground sm:text-base">
                  {currentItem.description}
                </p>
              )}
            </div>
          )}

          {(showIndicators || (canAutoplay && !prefersReducedMotion)) &&
            items.length > 1 && (
              <div
                className="mt-4 flex min-w-0 items-center gap-1"
                role="group"
                aria-label="轮播控制"
              >
                {canAutoplay && !prefersReducedMotion && (
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={
                      isManuallyPaused ? '继续自动播放' : '暂停自动播放'
                    }
                    aria-pressed={isManuallyPaused}
                    onClick={() => setIsManuallyPaused((value) => !value)}
                  >
                    {isManuallyPaused ? (
                      <Play className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Pause className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                )}

                {showIndicators && (
                  <div className="flex min-w-0 items-center gap-1">
                    {items.map((item, index) => (
                      <button
                        key={`${item.image}-indicator-${index}`}
                        type="button"
                        className="group inline-flex h-10 min-w-10 touch-manipulation items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label={`切换到第 ${index + 1} 张轮播图`}
                        aria-current={index === currentSlide}
                        onClick={() => goToSlide(index)}
                      >
                        <span
                          className={cn(
                            'h-1.5 rounded-full transition-[background-color,width] duration-200 motion-reduce:transition-none',
                            index === currentSlide
                              ? 'w-8 bg-foreground'
                              : 'w-3 bg-muted-foreground/45 group-hover:bg-muted-foreground/70'
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
