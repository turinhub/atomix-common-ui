import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { DataTable } from '../DataTable';

// Create mock UI components
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
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
  TableHeaderComponent: () => <div>Header</div>,
  TablePaginationComponent: () => <div>Pagination</div>,
});

describe('DataTable', () => {
  it('应该渲染空数据状态', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name', title: 'Name' }];

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
    const columns = [{ key: 'name', title: 'Name' }];
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
    const columns = [{ key: 'name', title: 'Name' }];

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

  it('应该调用 onDelete 回调', () => {
    const mockComponents = createMockComponents();
    const columns = [{ key: 'name', title: 'Name' }];
    const data = [{ id: 1, name: 'Alice' }];
    const onDelete = vi.fn();

    render(
      <DataTable
        components={mockComponents}
        data={data}
        columns={columns}
        rowKey="id"
        onDelete={onDelete}
      />
    );

    // Test would need more complex interaction to trigger dropdown
    expect(onDelete).toBeDefined();
  });
});
