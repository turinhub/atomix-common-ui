import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import type {
  ButtonComponent,
  SelectComponent,
  SelectTriggerComponent,
  SelectContentComponent,
  SelectItemComponent,
  SelectValueComponent,
} from '../types/component-types';

/**
 * UI 组件适配器接口
 */
export interface PaginationUIComponents {
  Button: ButtonComponent;
  Select: SelectComponent;
  SelectTrigger: SelectTriggerComponent;
  SelectContent: SelectContentComponent;
  SelectItem: SelectItemComponent;
  SelectValue: SelectValueComponent;
}

export interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showJumpToPage?: boolean;
  showTotal?: boolean;
  searchActive?: boolean;

  // UI 组件注入
  components?: PaginationUIComponents;
}

/**
 * 表格分页组件
 * 支持页码切换和每页条数选择
 */
export function TablePagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showPageSizeSelector = true,
  showJumpToPage = true,
  showTotal = true,
  searchActive = false,
  components,
}: TablePaginationProps) {
  const [jumpPageInput, setJumpPageInput] = useState(String(currentPage + 1));

  useEffect(() => {
    setJumpPageInput(String(currentPage + 1));
  }, [currentPage]);

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const {
    Button,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
  } = components;

  const totalPages = Math.ceil(total / pageSize);
  const safeTotalPages = Math.max(totalPages, 1);
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, total);
  const availablePageSizeOptions = Array.from(
    new Set([...pageSizeOptions, pageSize])
  ).sort((a, b) => a - b);
  const canChangePageSize = showPageSizeSelector && Boolean(onPageSizeChange);
  const canSwitchPage = safeTotalPages > 1;

  const goToPage = (page: number) => {
    const nextPage = Math.max(0, Math.min(page, safeTotalPages - 1));
    if (nextPage === currentPage) {
      return;
    }
    onPageChange(nextPage);
  };

  const pageIndicators = (() => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, index) => index);
    }

    const pages = new Set<number>([
      0,
      1,
      safeTotalPages - 2,
      safeTotalPages - 1,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);

    const visiblePages = Array.from(pages)
      .filter((page) => page >= 0 && page < safeTotalPages)
      .sort((a, b) => a - b);
    const indicators: Array<number | 'ellipsis'> = [];

    for (const page of visiblePages) {
      const previous = indicators[indicators.length - 1];
      if (typeof previous === 'number' && page - previous > 1) {
        indicators.push('ellipsis');
      }
      indicators.push(page);
    }

    return indicators;
  })();

  // 如果没有数据，不显示分页
  if (total === 0) return null;

  return (
    <div
      className={`flex w-full items-center gap-3 ${
        showTotal ? 'justify-between' : 'justify-end'
      }`}
    >
      {showTotal && (
        <div className="text-sm text-muted-foreground">
          {searchActive
            ? `找到 ${total} 条匹配记录`
            : total > 0
              ? `显示 ${startItem} - ${endItem} 条，共 ${total} 条记录`
              : '暂无数据'}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canChangePageSize && (
          <div className="mr-2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">每页</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value: string) => {
                const nextPageSize = Number(value);
                if (
                  Number.isNaN(nextPageSize) ||
                  nextPageSize === pageSize ||
                  !onPageSizeChange
                ) {
                  return;
                }
                onPageSizeChange(nextPageSize);
              }}
            >
              <SelectTrigger className="h-8 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">条</span>
          </div>
        )}
        <div className="mr-4 text-sm text-muted-foreground">
          第 {currentPage + 1} 页，共 {safeTotalPages} 页
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0 || !canSwitchPage}
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {pageIndicators.map((indicator, index) =>
            indicator === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={indicator}
                variant={indicator === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(indicator)}
                disabled={indicator === currentPage}
                aria-current={indicator === currentPage ? 'page' : undefined}
              >
                {indicator + 1}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= safeTotalPages - 1 || !canSwitchPage}
          aria-label="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {showJumpToPage && (
          <form
            className="ml-1 flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const nextPage = Number.parseInt(jumpPageInput, 10);
              if (Number.isNaN(nextPage)) {
                return;
              }
              goToPage(nextPage - 1);
            }}
          >
            <span className="text-sm text-muted-foreground">跳至</span>
            <input
              type="number"
              min={1}
              max={safeTotalPages}
              value={jumpPageInput}
              disabled={!canSwitchPage}
              onChange={(event) => setJumpPageInput(event.target.value)}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
              aria-label="跳转页码"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!canSwitchPage}
            >
              跳转
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
