import { Plus, Search } from 'lucide-react';
import { ReactNode, useId } from 'react';

import type { InputComponent, ButtonComponent } from '../types/component-types';

/**
 * UI 组件适配器接口
 */
export interface HeaderUIComponents {
  Input: InputComponent;
  Button: ButtonComponent;
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
  const searchInputId = useId();

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const { Input, Button } = components;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isComposing =
      e.nativeEvent.isComposing ||
      (e.nativeEvent as KeyboardEvent & { isComposing?: boolean }).isComposing;
    if (isComposing) {
      return;
    }
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 p-1">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 break-words text-lg font-semibold leading-tight text-foreground">
          {title}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action && (
            <div className="flex min-w-0 items-center gap-2">{action}</div>
          )}
          {!action && actionLabel && onActionClick && (
            <Button onClick={onActionClick} disabled={loading} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <label htmlFor={searchInputId} className="sr-only">
              {searchPlaceholder}
            </label>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id={searchInputId}
              name="table-search"
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onSearchChange?.(e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="h-9 pl-8"
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
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
