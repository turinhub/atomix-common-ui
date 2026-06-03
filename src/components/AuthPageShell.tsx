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
    <div className={cn('min-h-screen', className)}>
      <main className="relative flex min-h-screen w-full overflow-hidden">
        {visual && <div className="absolute inset-0">{visual}</div>}
        {overlay ?? <div className="absolute inset-0 z-10 bg-black/35" />}
        <div
          className={cn(
            'relative z-20 flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:p-12 xl:p-16',
            contentClassName
          )}
        >
          <div className={cn('w-full min-w-0 max-w-[420px]', panelClassName)}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
