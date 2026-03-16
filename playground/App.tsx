import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DataTable, type Column } from '../src/components/DataTable';
import { DeleteConfirmDialog } from '../src/components/DeleteConfirmDialog';
import { TableHeader as BusinessTableHeader } from '../src/components/TableHeader';
import { TablePagination as BusinessTablePagination } from '../src/components/TablePagination';
import { ThemeSwitcher } from '../src/components/ThemeSwitcher';
import { ThemeSwitcherContent } from '../src/components/ThemeSwitcherContent';
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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

const themeOptions = [
  { value: 'light', label: '浅色', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: '深色', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: '跟随系统', icon: <Monitor className="h-4 w-4" /> },
] as const;
type ThemeMode = (typeof themeOptions)[number]['value'];

const themeIcons = themeOptions.reduce(
  (acc, option) => {
    acc[option.value] = option.icon;
    return acc;
  },
  {} as Record<ThemeMode, React.ReactNode>
);
const themeLabels = themeOptions.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<ThemeMode, string>
);
const isThemeMode = (value: string): value is ThemeMode =>
  themeOptions.some((option) => option.value === value);

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showBeta, setShowBeta] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const updateTheme = () => {
      let resolvedTheme = theme;
      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';
      }
      const isDarkMode = resolvedTheme === 'dark';
      document.documentElement.classList.toggle('dark', isDarkMode);
    };

    updateTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => updateTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

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
  const dropdownMenuAdapter: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement>
  > = ({ children }) => <DropdownMenu>{children}</DropdownMenu>;
  const dropdownMenuItemAdapter: React.ComponentType<
    React.ButtonHTMLAttributes<HTMLDivElement> & {
      onClick?: (e: React.MouseEvent) => void;
    }
  > = ({ children, className, onClick }) => (
    <DropdownMenuItem className={className} onClick={onClick}>
      {children}
    </DropdownMenuItem>
  );
  const handleThemeChange = useCallback((value: string) => {
    if (isThemeMode(value)) {
      setTheme(value);
    }
  }, []);

  const glassCard =
    'border border-slate-200/80 bg-white/82 backdrop-blur-xl shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-white/15 dark:bg-slate-900/58 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_22px_70px_rgba(2,8,23,0.62)]';
  const glassCardSub =
    'border border-slate-200/70 bg-white/72 backdrop-blur-lg shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-900/48 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.05),0_14px_42px_rgba(2,8,23,0.5)]';

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-6 py-8 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-cyan-300/16 absolute left-[-12rem] top-[-10rem] h-80 w-80 rounded-full blur-[100px] dark:bg-cyan-400/25" />
        <div className="bg-blue-400/12 absolute right-[-10rem] top-16 h-96 w-96 rounded-full blur-[120px] dark:bg-blue-500/25" />
        <div className="bg-violet-400/12 absolute bottom-[-14rem] left-1/3 h-[30rem] w-[30rem] rounded-full blur-[140px] dark:bg-violet-500/20" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Atomix UI Playground
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              本地样式测试页，用于快速验证组件视觉与交互。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-white/75 px-3 py-2 shadow-[0_8px_30px_rgba(8,145,178,0.16)] backdrop-blur-xl dark:border-cyan-300/25 dark:bg-slate-900/55 dark:shadow-[0_10px_35px_rgba(2,132,199,0.2)]">
            <ThemeSwitcher
              value={theme}
              onValueChange={handleThemeChange}
              components={{
                DropdownMenu,
                DropdownMenuTrigger,
                DropdownMenuContent,
                DropdownMenuRadioGroup,
                DropdownMenuRadioItem,
                Button,
              }}
              themeIcons={themeIcons}
              triggerVariant="outline"
              triggerSize="sm"
              triggerClassName="border-cyan-500/35 bg-white/80 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-200/40 dark:bg-slate-900/35 dark:text-cyan-100 dark:hover:bg-slate-800/70"
              triggerContent={
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="bg-cyan-500/12 rounded-md p-1 text-cyan-700 dark:text-cyan-200">
                    {themeIcons[theme]}
                  </span>
                  <span>主题</span>
                </span>
              }
              showCurrentIcon={false}
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {themeLabels[theme]}
            </span>
          </div>
        </div>

        <Card className={`rounded-3xl ${glassCard}`}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Business Layer（TurinHub 业务层）
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              验证业务组件注入 shadcn ui 后的真实使用链路
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card className={`rounded-2xl ${glassCardSub}`}>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  TableHeader（独立）
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
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
                DropdownMenu: dropdownMenuAdapter,
                DropdownMenuTrigger,
                DropdownMenuContent,
                DropdownMenuItem: dropdownMenuItemAdapter,
                DropdownMenuSeparator,
                Skeleton,
                TableHeaderComponent: tableHeaderAdapter,
                TablePaginationComponent: tablePaginationAdapter,
              }}
            />
          </CardContent>
        </Card>

        <Card className={`rounded-3xl ${glassCard}`}>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Base Layer（shadcn 基线）
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              用于验证 shadcn 组件在当前主题 token 与依赖版本下的表现
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Buttons
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    主要按钮样式矩阵
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                    Default
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Form
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    输入、选择与标签样式
                  </CardDescription>
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
              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    ThemeSwitcher
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    主题切换组件（完整版）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-900/45">
                    <ThemeSwitcher
                      value={theme}
                      onValueChange={handleThemeChange}
                      components={{
                        DropdownMenu,
                        DropdownMenuTrigger,
                        DropdownMenuContent,
                        DropdownMenuRadioGroup,
                        DropdownMenuRadioItem,
                        Button,
                      }}
                      themeIcons={themeIcons}
                      triggerVariant="outline"
                      triggerSize="sm"
                      triggerClassName="border-cyan-500/30 bg-white text-slate-700 hover:bg-cyan-50 dark:border-cyan-300/35 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800"
                      triggerContent={
                        <span className="inline-flex items-center gap-2">
                          <span className="bg-cyan-500/12 rounded-md p-1 text-cyan-700 dark:text-cyan-200">
                            {themeIcons[theme]}
                          </span>
                          <span className="text-sm font-medium">切换主题</span>
                        </span>
                      }
                      showCurrentIcon={false}
                    />
                    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200">
                      当前主题：{themeLabels[theme]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    完整版 ThemeSwitcher，采用与项目一致的玻璃态与青色强调风格
                  </div>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    ThemeSwitcherContent
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    主题切换组件（轻量版 - 嵌入式）
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">设置主题</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuSeparator />
                        <ThemeSwitcherContent
                          value={theme}
                          onValueChange={handleThemeChange}
                          components={{
                            DropdownMenuRadioGroup,
                            DropdownMenuRadioItem,
                          }}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      当前主题：<strong>{theme}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    轻量版 ThemeSwitcherContent，可嵌入其他 DropdownMenu 中使用
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Overlay
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Dialog 与 Dropdown 状态测试
                  </CardDescription>
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

              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Skeleton
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    骨架屏基础样式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700/70" />
                  <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700/70" />
                  <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700/70" />
                  <Skeleton className="h-24 w-full bg-slate-200 dark:bg-slate-700/70" />
                </CardContent>
              </Card>
            </div>

            <Card className={`rounded-2xl ${glassCardSub}`}>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  Table
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  列表类组件样式验证
                </CardDescription>
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
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.status}</TableCell>
                        <TableCell>{product.owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-slate-500 dark:text-slate-400">
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
