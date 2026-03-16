import { useEffect, useMemo, useState } from 'react';
import { DataTable, type Column } from '../src/components/DataTable';
import { DeleteConfirmDialog } from '../src/components/DeleteConfirmDialog';
import { TableHeader as BusinessTableHeader } from '../src/components/TableHeader';
import { TablePagination as BusinessTablePagination } from '../src/components/TablePagination';
import { Button } from '../src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../src/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../src/components/ui/dropdown-menu';
import { Input } from '../src/components/ui/input';
import { Label } from '../src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';
import { Skeleton } from '../src/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/ui/table';

type Product = {
  id: string;
  name: string;
  owner: string;
  status: 'Ready' | 'Draft';
};

const products: Product[] = [
  { id: '1', name: 'Button', status: 'Ready', owner: 'Design System' },
  { id: '2', name: 'Table', status: 'Ready', owner: 'Data Team' },
  { id: '3', name: 'Dialog', status: 'Ready', owner: 'Platform' },
  { id: '4', name: 'Dropdown', status: 'Draft', owner: 'Frontend Team' },
  { id: '5', name: 'Pagination', status: 'Ready', owner: 'Core UI' },
  { id: '6', name: 'DeleteConfirmDialog', status: 'Draft', owner: 'Ops Team' },
];

const baseSnapshotProducts = [
  { name: 'Button', status: 'Ready', owner: 'Design System' },
  { name: 'Table', status: 'Ready', owner: 'Data Team' },
  { name: 'Dialog', status: 'Ready', owner: 'Platform' },
];

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showBeta, setShowBeta] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const filteredProducts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return products;
    }
    return products.filter((item) => {
      return (
        item.name.toLowerCase().indexOf(keyword) > -1 ||
        item.owner.toLowerCase().indexOf(keyword) > -1 ||
        item.status.toLowerCase().indexOf(keyword) > -1
      );
    });
  }, [searchValue]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchValue, pageSize]);

  const paginatedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredProducts]);

  const columns: Column<Product>[] = [
    {
      key: 'name',
      title: '组件',
      render: (value) => <span className="font-medium">{String(value)}</span>,
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      render: (value) => (
        <span
          className={
            value === 'Ready'
              ? 'text-emerald-600 dark:text-emerald-300'
              : 'text-amber-600 dark:text-amber-300'
          }
        >
          {String(value)}
        </span>
      ),
    },
    {
      key: 'owner',
      title: 'Owner',
      align: 'right',
    },
  ];

  const tableHeaderAdapter = (
    props: React.ComponentProps<typeof BusinessTableHeader>
  ) => <BusinessTableHeader {...props} components={{ Input, Button }} />;

  const tablePaginationAdapter = (
    props: React.ComponentProps<typeof BusinessTablePagination>
  ) => (
    <BusinessTablePagination
      {...props}
      components={{
        Button,
        Select,
        SelectTrigger,
        SelectContent,
        SelectItem,
        SelectValue,
      }}
    />
  );

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Atomix UI Playground</h1>
            <p className="text-sm text-muted-foreground">
              本地样式测试页，用于快速验证组件视觉与交互。
            </p>
          </div>
          <Button
            variant={isDark ? 'secondary' : 'outline'}
            onClick={() => setIsDark((value) => !value)}
          >
            {isDark ? '切换浅色' : '切换深色'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Layer（TurinHub 业务层）</CardTitle>
            <CardDescription>
              验证业务组件注入 shadcn ui 后的真实使用链路
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>TableHeader（独立）</CardTitle>
                <CardDescription>
                  验证搜索与操作按钮组合的可用性
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessTableHeader
                  title="组件库管理"
                  searchPlaceholder="搜索组件名/Owner"
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  onSearch={() => {}}
                  actionLabel="新增组件"
                  onActionClick={() => {}}
                  components={{ Input, Button }}
                />
              </CardContent>
            </Card>

            <DataTable<Product>
              data={paginatedProducts}
              columns={columns}
              rowKey="id"
              header={{
                title: '组件列表',
                searchPlaceholder: '输入关键字过滤',
                searchValue,
                onSearchChange: setSearchValue,
                onSearch: () => {},
                actionLabel: '创建组件',
                onActionClick: () => {},
              }}
              pagination={{
                currentPage,
                pageSize,
                total: filteredProducts.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
                show: true,
              }}
              actions={{
                mode: 'collapsed',
                items: [
                  {
                    label: '编辑',
                    onClick: () => {},
                  },
                  {
                    label: '删除',
                    className: 'text-destructive',
                    onClick: (record) => {
                      setDeletingProduct(record);
                      setDeleteDialogOpen(true);
                    },
                  },
                ],
              }}
              components={{
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
                TableHeaderComponent: tableHeaderAdapter,
                TablePaginationComponent: tablePaginationAdapter,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base Layer（shadcn 基线）</CardTitle>
            <CardDescription>
              用于验证 shadcn 组件在当前主题 token 与依赖版本下的表现
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>主要按钮样式矩阵</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form</CardTitle>
                  <CardDescription>输入、选择与标签样式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="you@turinhub.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select defaultValue="admin">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Overlay</CardTitle>
                  <CardDescription>Dialog 与 Dropdown 状态测试</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>打开 Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete item?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive">Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">打开 Menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={showShortcuts}
                        onCheckedChange={(checked) =>
                          setShowShortcuts(checked === true)
                        }
                      >
                        Keyboard shortcuts
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={showBeta}
                        onCheckedChange={(checked) =>
                          setShowBeta(checked === true)
                        }
                      >
                        Beta features
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Open settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skeleton</CardTitle>
                  <CardDescription>骨架屏基础样式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>列表类组件样式验证</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {baseSnapshotProducts.map((product) => (
                      <TableRow key={product.name}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.status}</TableCell>
                        <TableCell>{product.owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                共 {baseSnapshotProducts.length} 个组件样式快照
              </CardFooter>
            </Card>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="删除组件"
        description={
          deletingProduct ? (
            <span>
              请输入 <strong>{deletingProduct.name}</strong> 以确认删除
            </span>
          ) : (
            '请选择要删除的组件'
          )
        }
        confirmText="确认删除"
        onConfirm={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        verification={
          deletingProduct
            ? {
                targetValue: deletingProduct.name,
                label: `输入 ${deletingProduct.name} 继续`,
                placeholder: '输入组件名',
              }
            : undefined
        }
        components={{
          Dialog,
          DialogContent,
          DialogHeader,
          DialogFooter,
          DialogTitle,
          DialogDescription,
          Button,
          Input,
          Label,
        }}
      />
    </main>
  );
}
