import { MoreVertical } from 'lucide-react';
import { ReactNode } from 'react';
import type { HTMLAttributes, ButtonHTMLAttributes } from 'react';

import type {
  UIComponent,
  ButtonComponent,
  CardComponent,
  TableComponent,
  TableRowComponent,
  TableCellComponent,
} from '../types/component-types';

import type { TableHeaderProps } from './TableHeader';
import type { TablePaginationProps } from './TablePagination';

type ColumnKey<T> = Extract<keyof T, string>;

type ActionMenuItem<T> = {
  label: ReactNode;
  icon?: ReactNode;
  onClick: (record: T, index: number) => void;
  className?: string;
  separator?: never;
};

type ActionSeparatorItem = {
  separator: true;
  className?: string;
  label?: never;
  icon?: never;
  onClick?: never;
};

type ActionItem<T> = ActionMenuItem<T> | ActionSeparatorItem;

export interface Column<T = unknown> {
  key: ColumnKey<T>;
  title: ReactNode;
  render?: (value: T[ColumnKey<T>], record: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * UI 组件适配器接口
 * 业务项目应该传入自己项目中的 shadcn/ui 组件
 */
export interface UIComponents {
  Card: CardComponent;
  CardContent: UIComponent<HTMLAttributes<HTMLDivElement>>;
  CardFooter: UIComponent<HTMLAttributes<HTMLDivElement>>;
  Table: TableComponent;
  TableBody: UIComponent<HTMLAttributes<HTMLTableSectionElement>>;
  TableCell: TableCellComponent;
  TableHead: TableCellComponent;
  TableHeader: UIComponent<HTMLAttributes<HTMLTableSectionElement>>;
  TableRow: TableRowComponent;
  Button: ButtonComponent;
  DropdownMenu: UIComponent<HTMLAttributes<HTMLDivElement>>;
  DropdownMenuTrigger: ButtonComponent;
  DropdownMenuContent: UIComponent<
    HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' | 'center' }
  >;
  DropdownMenuItem: UIComponent<
    ButtonHTMLAttributes<HTMLDivElement> & {
      onClick?: (e: React.MouseEvent) => void;
    }
  >;
  DropdownMenuSeparator: UIComponent;
  Skeleton: UIComponent<HTMLAttributes<HTMLDivElement>>;
  TableHeaderComponent: React.ComponentType<TableHeaderProps>;
  TablePaginationComponent: React.ComponentType<TablePaginationProps>;
}

export interface DataTableProps<T = unknown> {
  // 数据相关
  data: T[];
  loading?: boolean;
  columns: Column<T>[];
  rowKey: keyof T | ((record: T) => string);

  // 空状态
  emptyText?: string;
  searchActiveEmptyText?: string;

  // 头部配置
  header?: TableHeaderProps;

  // 分页配置
  pagination?: TablePaginationProps & {
    show?: boolean;
  };

  // 表格行样式
  rowClassName?: (record: T, index: number) => string;
  onRow?: (
    record: T,
    index: number
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
  };

  // 操作列
  actions?: {
    title?: string;
    mode?: 'expanded' | 'collapsed';
    render?: (record: T, index: number) => ReactNode;
    items?: ActionItem<T>[];
  };

  // UI 组件注入（可选）
  components?: UIComponents;

  // 自定义渲染函数（更灵活）
  renderCard?: (content: ReactNode) => ReactNode;
  renderTable?: (header: ReactNode, body: ReactNode) => ReactNode;
  renderActions?: (record: T, index: number) => ReactNode;
}

/**
 * 默认的 DataTable 实现
 * 需要通过 components prop 注入 UI 组件
 */
export function DataTable<T extends Record<string, any>>({
  data,
  loading = false,
  columns,
  rowKey,
  emptyText = '暂无数据',
  searchActiveEmptyText = '未找到匹配的记录',
  header,
  pagination,
  rowClassName,
  onRow,
  actions,
  components,
  renderCard,
  renderTable,
  renderActions,
}: DataTableProps<T>) {
  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
        <br />
        <code className="text-sm">
          {'import { Card, Table, Button, ... } from "@/components/ui"'}
        </code>
      </div>
    );
  }

  const {
    Card,
    CardContent,
    CardFooter,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Skeleton,
    TableHeaderComponent,
    TablePaginationComponent,
  } = components;

  // 获取行的唯一标识
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    const keyVal = record[rowKey];
    return keyVal !== undefined && keyVal !== null
      ? String(keyVal)
      : `row-${index}`;
  };

  // 检查是否有搜索活动
  const isSearchActive = Boolean(
    header?.searchValue && header.searchValue.trim().length > 0
  );
  const hasActions = Boolean(actions?.render || actions?.items?.length);
  const actionMode: 'expanded' | 'collapsed' =
    actions?.mode ?? (actions?.items?.length ? 'collapsed' : 'expanded');
  const isSeparatorItem = (item: ActionItem<T>): item is ActionSeparatorItem =>
    item.separator === true;

  // 渲染操作列
  const defaultRenderActions = (record: T, index: number) => {
    if (!actions || !hasActions) return null;

    // 折叠模式：使用 DropdownMenu
    if (
      actionMode === 'collapsed' &&
      actions.items &&
      actions.items.length > 0
    ) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label="打开行操作菜单"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.items.map((item, itemIndex) =>
              isSeparatorItem(item) ? (
                <DropdownMenuSeparator key={`separator-${itemIndex}`} />
              ) : (
                <DropdownMenuItem
                  key={`action-${itemIndex}`}
                  onClick={() => item.onClick(record, index)}
                  className={item.className}
                >
                  {item.icon && (
                    <span className="mr-2 h-4 w-4">{item.icon}</span>
                  )}
                  {item.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // 展开模式：使用自定义 render
    return actions.render ? actions.render(record, index) : null;
  };

  // 渲染表头
  const renderTableHeader = () => {
    return (
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          {columns.map((column) => (
            <TableHead
              key={String(column.key)}
              className={`font-semibold text-foreground ${
                column.align === 'center'
                  ? 'text-center'
                  : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
              }`}
              style={{ width: column.width }}
            >
              {column.title}
            </TableHead>
          ))}
          {hasActions && (
            <TableHead className="text-right font-semibold text-foreground">
              {actions?.title || '操作'}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
    );
  };

  // 渲染表体
  const renderTableBody = () => {
    // Loading 状态
    if (loading) {
      return (
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : ''
                  }
                >
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
              {hasActions && (
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-8" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      );
    }

    // 空数据状态
    if (data.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={columns.length + (hasActions ? 1 : 0)}
              className="py-8 text-center text-muted-foreground"
            >
              {isSearchActive ? searchActiveEmptyText : emptyText}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    // 数据行
    return (
      <TableBody>
        {data.map((record, index) => {
          const key = getRowKey(record, index);
          const rowProps = onRow?.(record, index);
          const className = rowClassName?.(record, index);

          return (
            <TableRow
              key={key}
              className={`${className || ''} hover:bg-muted/50`}
              {...rowProps}
            >
              {columns.map((column) => {
                const value = record[column.key as keyof T];
                const content = column.render
                  ? column.render(value as T[ColumnKey<T>], record, index)
                  : value;

                return (
                  <TableCell
                    key={String(column.key)}
                    className={
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : ''
                    }
                  >
                    {content}
                  </TableCell>
                );
              })}
              {hasActions && (
                <TableCell className="text-right">
                  {renderActions
                    ? renderActions(record, index)
                    : defaultRenderActions(record, index)}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    );
  };

  // 默认的卡片渲染
  const defaultRenderCard = (content: ReactNode) => (
    <Card>
      {header && (
        <div className="p-6 pb-0">
          <TableHeaderComponent {...header} />
        </div>
      )}
      <CardContent className="p-0">{content}</CardContent>
      {pagination?.show !== false && pagination && (
        <CardFooter className="border-t py-4">
          <TablePaginationComponent
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
            showPageSizeSelector={pagination.showPageSizeSelector}
            showTotal={pagination.showTotal}
            searchActive={isSearchActive}
          />
        </CardFooter>
      )}
    </Card>
  );

  // 默认的表格渲染
  const defaultRenderTable = (tableHeader: ReactNode, tableBody: ReactNode) => (
    <Table>
      {tableHeader}
      {tableBody}
    </Table>
  );

  return renderCard
    ? renderCard(
        renderTable
          ? renderTable(renderTableHeader(), renderTableBody())
          : defaultRenderTable(renderTableHeader(), renderTableBody())
      )
    : defaultRenderCard(
        renderTable
          ? renderTable(renderTableHeader(), renderTableBody())
          : defaultRenderTable(renderTableHeader(), renderTableBody())
      );
}
