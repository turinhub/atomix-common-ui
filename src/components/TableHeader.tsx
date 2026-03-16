import { Plus, Search } from 'lucide-react';
import { ReactNode } from 'react';

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
              <Plus className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onSearchChange?.(e.target.value)
              }
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
