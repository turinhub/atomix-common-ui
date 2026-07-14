import type { ReactNode } from 'react';

import { cn } from '../lib/utils';

export interface AuthPageShellProps {
  children: ReactNode;
  visual?: ReactNode;
  overlay?: ReactNode;
  className?: string;
  contentClassName?: string;
  panelClassName?: string;
}

export function AuthPageShell({
  children,
  visual,
  overlay,
  className,
  contentClassName,
  panelClassName,
}: AuthPageShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen supports-[height:100dvh]:min-h-[100dvh]',
        className
      )}
    >
      <main className="relative isolate flex min-h-screen w-full overflow-x-hidden supports-[height:100dvh]:min-h-[100dvh]">
        {visual && <div className="absolute inset-0">{visual}</div>}
        {overlay ?? (
          <div
            data-slot="auth-page-default-overlay"
            className="pointer-events-none absolute inset-0 z-10 bg-background/35"
            aria-hidden="true"
          />
        )}
        <div
          className={cn(
            'pointer-events-none relative z-20 flex min-h-screen w-full items-center justify-center px-4 py-6 [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))] [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(1.5rem,env(safe-area-inset-top))] supports-[height:100dvh]:min-h-[100dvh] sm:[padding-left:max(1.5rem,env(safe-area-inset-left))] sm:[padding-right:max(1.5rem,env(safe-area-inset-right))] lg:[padding-bottom:max(3rem,env(safe-area-inset-bottom))] lg:[padding-left:max(3rem,env(safe-area-inset-left))] lg:[padding-right:max(3rem,env(safe-area-inset-right))] lg:[padding-top:max(3rem,env(safe-area-inset-top))] xl:[padding-bottom:max(4rem,env(safe-area-inset-bottom))] xl:[padding-left:max(4rem,env(safe-area-inset-left))] xl:[padding-right:max(4rem,env(safe-area-inset-right))] xl:[padding-top:max(4rem,env(safe-area-inset-top))]',
            contentClassName
          )}
        >
          <div
            className={cn(
              'pointer-events-auto w-full min-w-0 max-w-[420px]',
              panelClassName
            )}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
