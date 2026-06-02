import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { DataTable } from '../DataTable';

const createMockComponents = () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
  TableBody: ({ children, ...props }: any) => (
    <tbody {...props}>{children}</tbody>
  ),
  TableCell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  TableHead: ({ children, ...props }: any) => <th {...props}>{children}</th>,
  TableHeader: ({ children, ...props }: any) => (
    <thead {...props}>{children}</thead>
  ),
  TableRow: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  DropdownMenu: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild: _asChild, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} type="button" {...props}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />,
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
  TableHeaderComponent: () => <div>Header</div>,
  TablePaginationComponent: () => <div>Pagination</div>,
});

describe('DataTable', () => {
  it('应该渲染空数据状态', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name' as const, title: 'Name' }];

    render(
      <DataTable
        components={mockComponents}
        data={[]}
        columns={columns}
        rowKey="id"
      />
    );

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('应该渲染数据行', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name' as const, title: 'Name' }];
    const data = [{ id: 1, name: 'Alice' }];

    render(
      <DataTable
        components={mockComponents}
        data={data}
        columns={columns}
        rowKey="id"
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('应该显示 loading 状态', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name' as const, title: 'Name' }];

    render(
      <DataTable
        components={mockComponents}
        data={[]}
        columns={columns}
        rowKey="id"
        loading={true}
      />
    );

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('应该渲染操作列', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name' as const, title: 'Name' }];
    const data = [{ id: 1, name: 'Alice' }];

    render(
      <DataTable
        components={mockComponents}
        data={data}
        columns={columns}
        rowKey="id"
        actions={{
          title: '操作列',
          render: () => <span>删除</span>,
        }}
      />
    );

    expect(screen.getByText('操作列')).toBeInTheDocument();
    expect(screen.getByText('删除')).toBeInTheDocument();
  });

  it('点击折叠操作项不应触发行点击', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name' as const, title: 'Name' }];
    const data = [{ id: 1, name: 'Alice' }];
    const onRowClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <DataTable
        components={mockComponents}
        data={data}
        columns={columns}
        rowKey="id"
        onRow={() => ({
          onClick: onRowClick,
        })}
        actions={{
          mode: 'collapsed',
          items: [
            {
              label: '查看详情',
              onClick: onActionClick,
            },
          ],
        }}
      />
    );

    fireEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '打开行操作菜单' }));
    fireEvent.click(screen.getByRole('button', { name: '查看详情' }));

    expect(onActionClick).toHaveBeenCalledWith(data[0], 0);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});
