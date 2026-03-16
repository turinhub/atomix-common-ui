import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  showTotal = true,
  searchActive = false,
  components,
}: TablePaginationProps) {
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

  // 如果没有数据，不显示分页
  if (total === 0) return null;

  return (
    <div className="flex w-full items-center justify-between">
      {showTotal && (
        <div className="text-sm text-muted-foreground">
          {searchActive
            ? `找到 ${total} 条匹配记录`
            : total > 0
              ? `显示 ${startItem} - ${endItem} 条，共 ${total} 条记录`
              : '暂无数据'}
        </div>
      )}
      <div className="flex items-center space-x-2">
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
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || safeTotalPages <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages - 1 || safeTotalPages <= 1}
        >
          下一页
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
