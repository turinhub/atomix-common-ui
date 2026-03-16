import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DataTable } from '../DataTable';

const createMockComponents = () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  Button: ({ children }: any) => <button>{children}</button>,
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick} type="button">
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
});
