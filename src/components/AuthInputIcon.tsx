import type { ReactNode } from 'react';

interface AuthInputIconProps {
  children: ReactNode;
}

export function AuthInputIcon({ children }: AuthInputIconProps) {
  return (
    <span
      data-slot="auth-input-icon"
      className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center text-muted-foreground"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
