import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import type {
  ButtonComponent,
  SelectComponent,
  SelectGroupComponent,
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
  SelectGroup?: SelectGroupComponent;
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
    SelectGroup,
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
  const pageSizeItems = availablePageSizeOptions.map((option) => (
    <SelectItem key={option} value={String(option)}>
      {option}
    </SelectItem>
  ));

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
      className={`flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center ${
        showTotal ? 'justify-between' : 'justify-end'
      }`}
    >
      {showTotal && (
        <div className="min-w-0 text-sm text-muted-foreground">
          {searchActive
            ? `找到 ${total} 条匹配记录`
            : total > 0
              ? `显示 ${startItem} - ${endItem} 条，共 ${total} 条记录`
              : '暂无数据'}
        </div>
      )}
      <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto md:justify-end">
        {canChangePageSize && (
          <div className="mr-0 flex items-center gap-2 md:mr-2">
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
                {SelectGroup ? (
                  <SelectGroup>{pageSizeItems}</SelectGroup>
                ) : (
                  pageSizeItems
                )}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">条</span>
          </div>
        )}
        <div className="mr-0 text-sm tabular-nums text-muted-foreground md:mr-4">
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
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={indicator}
                variant={indicator === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(indicator)}
                disabled={indicator === currentPage}
                aria-current={indicator === currentPage ? 'page' : undefined}
                className="min-w-8 tabular-nums"
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
              name="jumpPage"
              min={1}
              max={safeTotalPages}
              value={jumpPageInput}
              disabled={!canSwitchPage}
              onChange={(event) => setJumpPageInput(event.target.value)}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="跳转页码"
              inputMode="numeric"
              autoComplete="off"
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
