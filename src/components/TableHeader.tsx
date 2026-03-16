'use client';

import { ReactNode } from 'react';

/**
 * UI 组件适配器接口
 */
export interface HeaderUIComponents {
  Input: React.ComponentType<any>;
  Button: React.ComponentType<any>;
}

export interface TableHeaderProps {
  title: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  showSearch?: boolean;
  action?: ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  loading?: boolean;

  // UI 组件注入
  components?: HeaderUIComponents;
}

/**
 * 表格头部组件
 * 支持搜索框和操作按钮
 */
export function TableHeader({
  title,
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  onSearch,
  showSearch = true,
  action,
  actionLabel,
  onActionClick,
  loading = false,
  components,
}: TableHeaderProps) {
  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const { Input, Button } = components;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </div>
        <div className="flex items-center gap-2">
          {action && <div className="flex items-center gap-2">{action}</div>}
          {!action && actionLabel && onActionClick && (
            <Button onClick={onActionClick} disabled={loading} size="sm">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <svg
              className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-9 pl-8"
              disabled={loading}
            />
          </div>
          {onSearch && (
            <Button
              onClick={onSearch}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              搜索
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
