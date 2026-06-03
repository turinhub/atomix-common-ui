import { useEffect, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '../lib/utils';

export interface AuthVisualCarouselItem {
  image: string;
  alt: string;
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
  const [isPaused, setIsPaused] = useState(false);
  const hasItems = items.length > 0;
  const currentItem = hasItems ? items[currentSlide] : undefined;

  const goToSlide = (index: number) => {
    if (!hasItems) return;
    setCurrentSlide((index + items.length) % items.length);
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const previousSlide = () => goToSlide(currentSlide - 1);

  useEffect(() => {
    if (!hasItems || isPaused || intervalMs <= 0 || items.length < 2) return;
    const timer = setTimeout(() => {
      setCurrentSlide((slide) => (slide + 1) % items.length);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [hasItems, intervalMs, isPaused, items.length, currentSlide]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previousSlide();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }
  };

  if (!hasItems) {
    return (
      <div
        className={cn(
          'relative h-full min-h-[360px] w-full overflow-hidden bg-slate-950',
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
        'relative h-full min-h-[360px] w-full overflow-hidden bg-slate-950 outline-none',
        className
      )}
      tabIndex={0}
      aria-label={ariaLabel}
      role="region"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {items.map((item, index) => (
        <img
          key={`${item.image}-${index}`}
          src={item.image}
          alt={item.alt}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out',
            index === currentSlide ? 'opacity-100' : 'opacity-0',
            imageClassName
          )}
          aria-hidden={index !== currentSlide}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-slate-950/10" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/78 via-slate-950/30 to-transparent pb-16 pt-24" />

      {(showText || showIndicators) && (
        <div
          className={cn(
            'absolute inset-x-5 bottom-6 text-white sm:inset-x-8 sm:bottom-8 lg:inset-x-12 lg:bottom-10',
            contentClassName
          )}
        >
          {showText && currentItem && (
            <div className="max-w-[min(28rem,calc(100vw-2.5rem))]">
              {currentItem.eyebrow && (
                <p className="mb-2 text-[0.68rem] font-medium uppercase tracking-normal text-cyan-100/80 sm:text-xs">
                  {currentItem.eyebrow}
                </p>
              )}
              {currentItem.title && (
                <h2 className="text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">
                  {currentItem.title}
                </h2>
              )}
              {currentItem.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-100/80 sm:text-base">
                  {currentItem.description}
                </p>
              )}
            </div>
          )}

          {showIndicators && items.length > 1 && (
            <div className="mt-5 flex items-center gap-2">
              {items.map((item, index) => (
                <button
                  key={`${item.image}-indicator-${index}`}
                  type="button"
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'w-3 bg-white/40 hover:bg-white/70'
                  )}
                  aria-label={`切换到第 ${index + 1} 张轮播图`}
                  aria-current={index === currentSlide}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
