import { useState } from 'react';
import type { ReactNode } from 'react';

import type { AuthLoginPanelProps, AuthUIComponents } from './AuthLoginPanel';
import { AuthLoginPanel } from './AuthLoginPanel';
import type { AuthRegisterPanelProps } from './AuthRegisterPanel';
import { AuthRegisterPanel } from './AuthRegisterPanel';

export type AuthPanelMode = 'login' | 'register';

export interface AuthPanelProps {
  components?: AuthUIComponents;
  mode?: AuthPanelMode;
  defaultMode?: AuthPanelMode;
  onModeChange?: (mode: AuthPanelMode) => void;
  loginProps?: Omit<AuthLoginPanelProps, 'components' | 'footer'> & {
    footer?: ReactNode;
  };
  registerProps?: Omit<AuthRegisterPanelProps, 'components' | 'footer'> & {
    footer?: ReactNode;
  };
  loginLabel?: ReactNode;
  registerLabel?: ReactNode;
}

export function AuthPanel({
  components,
  mode,
  defaultMode = 'login',
  onModeChange,
  loginProps,
  registerProps,
  loginLabel = '已有账号？登录',
  registerLabel = '没有账号？注册',
}: AuthPanelProps) {
  const [internalMode, setInternalMode] = useState<AuthPanelMode>(defaultMode);
  const currentMode = mode ?? internalMode;

  const setMode = (nextMode: AuthPanelMode) => {
    if (!mode) {
      setInternalMode(nextMode);
    }
    onModeChange?.(nextMode);
  };

  if (currentMode === 'register') {
    return (
      <AuthRegisterPanel
        {...registerProps}
        components={components}
        footer={
          registerProps?.footer ?? (
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => setMode('login')}
            >
              {loginLabel}
            </button>
          )
        }
      />
    );
  }

  return (
    <AuthLoginPanel
      {...loginProps}
      components={components}
      footer={
        loginProps?.footer ?? (
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => setMode('register')}
          >
            {registerLabel}
          </button>
        )
      }
    />
  );
}
