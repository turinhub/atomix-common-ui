import { Monitor, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataTable, type Column } from '../src/components/DataTable';
import { DeleteConfirmDialog } from '../src/components/DeleteConfirmDialog';
import { TableHeader as BusinessTableHeader } from '../src/components/TableHeader';
import { TablePagination as BusinessTablePagination } from '../src/components/TablePagination';
import { ThemeSwitcher } from '../src/components/ThemeSwitcher';
import { ThemeSwitcherContent } from '../src/components/ThemeSwitcherContent';
import { SimplePDFReader } from '../src/components/SimplePDFReader';
import { PDFReader } from '../src/components/PDFReader';
import { FileUpload } from '../src/components/FileUpload';
import { ImageReader } from '../src/components/ImageReader';
import { MarkdownReader } from '../src/components/MarkdownReader';
import { VideoReader } from '../src/components/VideoReader';
import { Button } from '../src/components/ui/button';
import { ScrollArea } from '../src/components/ui/scroll-area';
import { TableHeader as UITableHeader } from '../src/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../src/components/ui/tabs';
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
type TableDataVariant = 'all' | 'draft-only' | 'empty';
type TableActionsVariant = 'none' | 'collapsed' | 'expanded';
type TablePageSizePreset = 'compact' | 'default' | 'large';
type PlaygroundPage =
  | 'overview'
  | 'file-upload'
  | 'media-reader'
  | 'markdown-reader'
  | 'pdf-reader';
type PDFDisplayMode = 'scroll' | 'single';
type PDFReaderTab = 'advanced' | 'simple';
type MarkdownReaderState = 'content' | 'source' | 'loading' | 'error' | 'empty';
type MediaPreviewState = 'image' | 'video' | 'unsupported';
const pageSizeOptionsByPreset: Record<TablePageSizePreset, number[]> = {
  compact: [2, 4, 8],
  default: [5, 10, 20],
  large: [10, 20, 50],
};
const pdfPresetUrls = [
  {
    label: 'Attention Is All You Need',
    value: 'https://arxiv.org/pdf/1706.03762',
  },
  {
    label: 'Dummy PDF (w3.org)',
    value:
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
] as const;
const markdownSample = `# MarkdownReader

用于在线阅读 Markdown 内容，覆盖文档、公告和任务详情等只读场景。

## GFM 能力

- [x] 表格
- [x] 任务列表
- [x] 代码块
- [x] 图片和链接

| 字段 | 说明 |
| --- | --- |
| content | 本地 Markdown 文本 |
| sourceUrl | 远程 Markdown 地址 |

> 默认不渲染 raw HTML，降低不可信内容直接注入页面的风险。

\`\`\`tsx
import { MarkdownReader } from '@turinhub/atomix-common-ui/components/MarkdownReader';

<MarkdownReader content={markdown} />
\`\`\`

![TurinHub](https://dummyimage.com/960x320/0891b2/ffffff&text=MarkdownReader)

[查看示例链接](https://example.com)
`;
const markdownSourceUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(
  `# Source URL 示例

这段内容通过 \`sourceUrl\` 加载，用于验证远程 Markdown 渲染流程。

- 支持 fetch 文本
- 支持 GFM 表格

| 来源 | 状态 |
| --- | --- |
| data URL | loaded |
`
)}`;
const imagePresetUrls = [
  {
    label: 'PNG 示例',
    value: 'https://dummyimage.com/1280x720/0891b2/ffffff.png&text=ImageReader',
    fileName: 'image-reader.png',
    mimeType: 'image/png',
  },
  {
    label: 'SVG 示例',
    value: 'https://dummyimage.com/960x540/334155/ffffff.svg&text=SVG+Preview',
    fileName: 'svg-preview.svg',
    mimeType: 'image/svg+xml',
  },
] as const;
const videoPresetUrls = [
  {
    label: 'MP4 示例',
    value: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    fileName: 'flower.mp4',
    mimeType: 'video/mp4',
  },
  {
    label: 'WebM 示例',
    value: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    fileName: 'flower.webm',
    mimeType: 'video/webm',
  },
] as const;

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
  const [playgroundPage, setPlaygroundPage] =
    useState<PlaygroundPage>('overview');
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showBeta, setShowBeta] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [tableDataVariant, setTableDataVariant] =
    useState<TableDataVariant>('all');
  const [tableActionsVariant, setTableActionsVariant] =
    useState<TableActionsVariant>('collapsed');
  const [tableShowHeader, setTableShowHeader] = useState(true);
  const [tableShowPagination, setTableShowPagination] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableShowPageSizeSelector, setTableShowPageSizeSelector] =
    useState(true);
  const [tableShowJumpToPage, setTableShowJumpToPage] = useState(true);
  const [tableShowTotal, setTableShowTotal] = useState(true);
  const [tablePageSizePreset, setTablePageSizePreset] =
    useState<TablePageSizePreset>('default');
  const [pdfUrl, setPdfUrl] = useState<string>(pdfPresetUrls[0].value);
  const [pdfDisplayMode, setPdfDisplayMode] =
    useState<PDFDisplayMode>('scroll');
  const [pdfReaderTab, setPdfReaderTab] = useState<PDFReaderTab>('advanced');
  const [markdownReaderState, setMarkdownReaderState] =
    useState<MarkdownReaderState>('content');
  const [mediaPreviewState, setMediaPreviewState] =
    useState<MediaPreviewState>('image');
  const [imagePresetIndex, setImagePresetIndex] = useState('0');
  const [imageUrl, setImageUrl] = useState<string>(imagePresetUrls[0].value);
  const [videoPresetIndex, setVideoPresetIndex] = useState('0');
  const [videoUrl, setVideoUrl] = useState<string>(videoPresetUrls[0].value);
  const [mediaShowToolbar, setMediaShowToolbar] = useState(true);
  const [mediaShowOpenButton, setMediaShowOpenButton] = useState(true);
  const [pdfShowToolbar, setPdfShowToolbar] = useState(true);
  const [pdfShowRotation, setPdfShowRotation] = useState(true);
  const [pdfShowModeToggle, setPdfShowModeToggle] = useState(true);
  const [pdfShowFullscreen, setPdfShowFullscreen] = useState(true);
  const [pdfEnableHotkeys, setPdfEnableHotkeys] = useState(true);
  const [pdfEnableMobileNav, setPdfEnableMobileNav] = useState(true);
  const [pdfShowSidebar, setPdfShowSidebar] = useState(true);
  const [uploadLog, setUploadLog] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const pageSizeByPresetRef = useRef<Record<TablePageSizePreset, number>>({
    compact: 2,
    default: 5,
    large: 10,
  });

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

  const tableSourceProducts = useMemo(() => {
    if (tableDataVariant === 'empty') {
      return [] as Product[];
    }
    if (tableDataVariant === 'draft-only') {
      return products.filter((item) => item.status === 'Draft');
    }
    return products;
  }, [tableDataVariant]);

  const filteredProducts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) {
      return tableSourceProducts;
    }
    return tableSourceProducts.filter((item) => {
      return (
        item.name.toLowerCase().indexOf(keyword) > -1 ||
        item.owner.toLowerCase().indexOf(keyword) > -1 ||
        item.status.toLowerCase().indexOf(keyword) > -1
      );
    });
  }, [searchValue, tableSourceProducts]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchValue, pageSize, tableDataVariant]);

  const paginatedProducts = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredProducts]);

  const tableActions = useMemo(() => {
    if (tableActionsVariant === 'none') {
      return undefined;
    }

    if (tableActionsVariant === 'expanded') {
      return {
        mode: 'expanded' as const,
        render: (record: Product) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDeletingProduct(record);
                setDeleteDialogOpen(true);
              }}
            >
              删除
            </Button>
          </div>
        ),
      };
    }

    return {
      mode: 'collapsed' as const,
      items: [
        {
          label: '编辑',
          onClick: () => {},
        },
        {
          label: '删除',
          className: 'text-destructive',
          onClick: (record: Product) => {
            setDeletingProduct(record);
            setDeleteDialogOpen(true);
          },
        },
      ],
    };
  }, [tableActionsVariant]);

  const tableData = tableShowPagination ? paginatedProducts : filteredProducts;
  const tablePageSizeOptions = pageSizeOptionsByPreset[tablePageSizePreset];
  useEffect(() => {
    if (tablePageSizeOptions.indexOf(pageSize) > -1) {
      pageSizeByPresetRef.current[tablePageSizePreset] = pageSize;
    }
  }, [pageSize, tablePageSizeOptions, tablePageSizePreset]);
  const handleTablePageSizePresetChange = (value: string) => {
    const nextPreset = value as TablePageSizePreset;
    const nextOptions = pageSizeOptionsByPreset[nextPreset];
    const rememberedPageSize = pageSizeByPresetRef.current[nextPreset];
    const nextPageSize =
      nextOptions.indexOf(rememberedPageSize) > -1
        ? rememberedPageSize
        : nextOptions[0];
    setTablePageSizePreset(nextPreset);
    setPageSize(nextPageSize);
  };
  const showHideTabs = (value: boolean, onChange: (value: boolean) => void) => (
    <div className="inline-flex w-full rounded-lg border border-slate-200 p-1 dark:border-slate-700">
      <Button
        type="button"
        size="sm"
        variant={value ? 'default' : 'ghost'}
        className="min-w-0 flex-1"
        onClick={() => onChange(true)}
      >
        显示
      </Button>
      <Button
        type="button"
        size="sm"
        variant={!value ? 'default' : 'ghost'}
        className="min-w-0 flex-1"
        onClick={() => onChange(false)}
      >
        隐藏
      </Button>
    </div>
  );
  const selectedImagePreset =
    imagePresetUrls[Number(imagePresetIndex)] || imagePresetUrls[0];
  const selectedVideoPreset =
    videoPresetUrls[Number(videoPresetIndex)] || videoPresetUrls[0];

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
          <CardContent className="pt-6">
            <div className="inline-flex w-full flex-col gap-2 rounded-2xl border border-cyan-500/15 bg-white/70 p-2 dark:border-cyan-300/20 dark:bg-slate-900/45 md:w-auto md:flex-row">
              <Button
                type="button"
                variant={playgroundPage === 'overview' ? 'default' : 'ghost'}
                className="justify-start md:min-w-36 md:justify-center"
                onClick={() => setPlaygroundPage('overview')}
              >
                综合测试页
              </Button>
              <Button
                type="button"
                variant={playgroundPage === 'file-upload' ? 'default' : 'ghost'}
                className="justify-start md:min-w-36 md:justify-center"
                onClick={() => setPlaygroundPage('file-upload')}
              >
                上传界面
              </Button>
              <Button
                type="button"
                variant={
                  playgroundPage === 'media-reader' ? 'default' : 'ghost'
                }
                className="justify-start md:min-w-36 md:justify-center"
                onClick={() => setPlaygroundPage('media-reader')}
              >
                媒体预览
              </Button>
              <Button
                type="button"
                variant={
                  playgroundPage === 'markdown-reader' ? 'default' : 'ghost'
                }
                className="justify-start md:min-w-36 md:justify-center"
                onClick={() => setPlaygroundPage('markdown-reader')}
              >
                MarkdownReader
              </Button>
              <Button
                type="button"
                variant={playgroundPage === 'pdf-reader' ? 'default' : 'ghost'}
                className="justify-start md:min-w-36 md:justify-center"
                onClick={() => setPlaygroundPage('pdf-reader')}
              >
                PDFReader 测试页
              </Button>
            </div>
          </CardContent>
        </Card>

        {playgroundPage === 'overview' ? (
          <>
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

                <Card className={`rounded-2xl ${glassCardSub}`}>
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                      DataTable 搭配配置
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      用于快速切换头部、分页、操作列、数据状态与加载态组合
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          数据状态
                        </Label>
                        <Select
                          value={tableDataVariant}
                          onValueChange={(value) =>
                            setTableDataVariant(value as TableDataVariant)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部数据</SelectItem>
                            <SelectItem value="draft-only">仅 Draft</SelectItem>
                            <SelectItem value="empty">空数据</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          操作列模式
                        </Label>
                        <Select
                          value={tableActionsVariant}
                          onValueChange={(value) =>
                            setTableActionsVariant(value as TableActionsVariant)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="collapsed">折叠菜单</SelectItem>
                            <SelectItem value="expanded">展开按钮</SelectItem>
                            <SelectItem value="none">不显示操作列</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          头部区域
                        </Label>
                        {showHideTabs(tableShowHeader, setTableShowHeader)}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          加载态
                        </Label>
                        <Select
                          value={tableLoading ? 'loading' : 'ready'}
                          onValueChange={(value) =>
                            setTableLoading(value === 'loading')
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ready">关闭</SelectItem>
                            <SelectItem value="loading">开启</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          分页区域
                        </Label>
                        {showHideTabs(
                          tableShowPagination,
                          setTableShowPagination
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          显示总数
                        </Label>
                        {showHideTabs(tableShowTotal, setTableShowTotal)}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          每页条数
                        </Label>
                        {showHideTabs(
                          tableShowPageSizeSelector,
                          setTableShowPageSizeSelector
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          跳页输入
                        </Label>
                        {showHideTabs(
                          tableShowJumpToPage,
                          setTableShowJumpToPage
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          每页选项集
                        </Label>
                        <Select
                          value={tablePageSizePreset}
                          onValueChange={handleTablePageSizePresetChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">紧凑</SelectItem>
                            <SelectItem value="default">默认</SelectItem>
                            <SelectItem value="large">大页</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <DataTable<Product>
                  data={tableData}
                  loading={tableLoading}
                  columns={columns}
                  rowKey="id"
                  header={
                    tableShowHeader
                      ? {
                          title: '组件列表',
                          searchPlaceholder: '输入关键字过滤',
                          searchValue,
                          onSearchChange: setSearchValue,
                          onSearch: () => {},
                          actionLabel: '创建组件',
                          onActionClick: () => {},
                        }
                      : undefined
                  }
                  pagination={
                    tableShowPagination
                      ? {
                          currentPage,
                          pageSize,
                          total: filteredProducts.length,
                          onPageChange: setCurrentPage,
                          onPageSizeChange: setPageSize,
                          pageSizeOptions: tablePageSizeOptions,
                          showPageSizeSelector: tableShowPageSizeSelector,
                          showJumpToPage: tableShowJumpToPage,
                          showTotal: tableShowTotal,
                          show: true,
                        }
                      : undefined
                  }
                  actions={tableActions}
                  components={{
                    Card,
                    CardContent,
                    CardFooter,
                    Table,
                    TableBody,
                    TableCell,
                    TableHead,
                    TableRow,
                    Button,
                    DropdownMenu: dropdownMenuAdapter,
                    DropdownMenuTrigger,
                    DropdownMenuContent,
                    DropdownMenuItem: dropdownMenuItemAdapter,
                    DropdownMenuSeparator,
                    Skeleton,
                    TableHeader: UITableHeader,
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
                              <span className="text-sm font-medium">
                                切换主题
                              </span>
                            </span>
                          }
                          showCurrentIcon={false}
                        />
                        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200">
                          当前主题：{themeLabels[theme]}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        完整版
                        ThemeSwitcher，采用与项目一致的玻璃态与青色强调风格
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
                        轻量版 ThemeSwitcherContent，可嵌入其他 DropdownMenu
                        中使用
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
                      <UITableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Owner</TableHead>
                        </TableRow>
                      </UITableHeader>
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
          </>
        ) : playgroundPage === 'file-upload' ? (
          <Card className={`rounded-3xl ${glassCard}`}>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                FileUpload 上传界面
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                模拟 Tale SDK
                上传链路，验证文件选择、校验、进度、失败重试与完成状态
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <FileUpload
                components={{
                  Card,
                  CardHeader,
                  CardTitle,
                  CardDescription,
                  CardContent,
                  CardFooter,
                  Button,
                }}
                title="标准上传"
                description="适合接入 uploadAttachment 或 getUploadAuthorization + fileUploadComplete。"
                helperText="限制：最多 3 个文件，单文件不超过 20 MB，允许 PDF、Word 和图片。"
                multiple
                maxFiles={3}
                maxSize={20 * 1024 * 1024}
                accept=".pdf,.doc,.docx,image/*"
                onUpload={async (item, { setProgress }) => {
                  setUploadLog((logs) => [
                    `开始上传 ${item.name}`,
                    ...logs.slice(0, 5),
                  ]);
                  await new Promise((resolve) =>
                    window.setTimeout(resolve, 240)
                  );
                  setProgress(25);
                  await new Promise((resolve) =>
                    window.setTimeout(resolve, 240)
                  );
                  setProgress(70);
                  await new Promise((resolve) =>
                    window.setTimeout(resolve, 240)
                  );
                  setProgress(100);
                  setUploadLog((logs) => [
                    `完成 ${item.name}，模拟 fileId: demo-${Date.now()}`,
                    ...logs.slice(0, 5),
                  ]);
                  return {
                    fileId: `demo-${Date.now()}`,
                    fileName: item.name,
                    fileSize: item.size,
                  };
                }}
              />

              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    上传事件
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    用于观察业务上传回调的触发顺序
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadLog.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500 dark:text-slate-400">
                      暂无事件
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uploadLog.map((log, index) => (
                        <div
                          key={`${log}-${index}`}
                          className="rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-200"
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        ) : playgroundPage === 'media-reader' ? (
          <Card className={`rounded-3xl ${glassCard}`}>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                媒体预览测试页
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                验证 ImageReader 与 VideoReader 的常见格式、工具栏、加载态和不支持格式兜底
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    测试配置
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    切换预览类型、资源地址和工具栏开关，配置会实时作用到下方组件
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      ['image', '图片预览'],
                      ['video', '视频预览'],
                      ['unsupported', '不支持格式'],
                    ].map(([value, label]) => (
                      <Button
                        key={value}
                        type="button"
                        variant={
                          mediaPreviewState === value ? 'default' : 'outline'
                        }
                        onClick={() =>
                          setMediaPreviewState(value as MediaPreviewState)
                        }
                      >
                        {label}
                      </Button>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        图片预设
                      </Label>
                      <Select
                        value={imagePresetIndex}
                        onValueChange={(value) => {
                          setImagePresetIndex(value);
                          setImageUrl(
                            imagePresetUrls[Number(value)]?.value ||
                              imagePresetUrls[0].value
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imagePresetUrls.map((option, index) => (
                            <SelectItem
                              key={option.value}
                              value={String(index)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        视频预设
                      </Label>
                      <Select
                        value={videoPresetIndex}
                        onValueChange={(value) => {
                          setVideoPresetIndex(value);
                          setVideoUrl(
                            videoPresetUrls[Number(value)]?.value ||
                              videoPresetUrls[0].value
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {videoPresetUrls.map((option, index) => (
                            <SelectItem
                              key={option.value}
                              value={String(index)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        图片 URL
                      </Label>
                      <Input
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        placeholder="https://example.com/image.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        视频 URL
                      </Label>
                      <Input
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        工具栏
                      </Label>
                      {showHideTabs(mediaShowToolbar, setMediaShowToolbar)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        新窗口按钮
                      </Label>
                      {showHideTabs(
                        mediaShowOpenButton,
                        setMediaShowOpenButton
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {mediaPreviewState === 'image' ? (
                <Card className={`rounded-2xl ${glassCardSub}`}>
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                      ImageReader
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      支持常见图片格式，使用工具栏验证缩放、旋转和新窗口打开
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageReader
                      src={imageUrl}
                      alt="ImageReader playground preview"
                      fileName={selectedImagePreset.fileName}
                      mimeType={selectedImagePreset.mimeType}
                      components={{
                        Button,
                        Skeleton,
                      }}
                      showToolbar={mediaShowToolbar}
                      showOpenInNewTab={mediaShowOpenButton}
                      className="w-full"
                      containerClassName="min-h-[560px]"
                    />
                  </CardContent>
                </Card>
              ) : mediaPreviewState === 'video' ? (
                <Card className={`rounded-2xl ${glassCardSub}`}>
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                      VideoReader
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      使用浏览器原生播放控件验证视频格式、加载态和字幕轨道配置
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VideoReader
                      src={videoUrl}
                      title="VideoReader playground preview"
                      fileName={selectedVideoPreset.fileName}
                      mimeType={selectedVideoPreset.mimeType}
                      components={{
                        Button,
                        Skeleton,
                      }}
                      tracks={[
                        {
                          src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00:00.000%20--%3E%2000:00:02.000%0AVideoReader%20playground',
                          kind: 'subtitles',
                          srcLang: 'zh-CN',
                          label: '中文',
                        },
                      ]}
                      showToolbar={mediaShowToolbar}
                      showOpenInNewTab={mediaShowOpenButton}
                      className="w-full"
                      containerClassName="min-h-[560px]"
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className={`rounded-2xl ${glassCardSub}`}>
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">
                        ImageReader 不支持格式
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        用 Word 文件扩展名验证图片格式白名单兜底
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImageReader
                        src="/attachments/report.docx"
                        fileName="report.docx"
                        mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        components={{
                          Button,
                          Skeleton,
                        }}
                        showToolbar={mediaShowToolbar}
                        showOpenInNewTab={false}
                        containerClassName="min-h-[360px]"
                      />
                    </CardContent>
                  </Card>
                  <Card className={`rounded-2xl ${glassCardSub}`}>
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">
                        VideoReader 不支持格式
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        用 Excel 文件扩展名验证视频格式白名单兜底
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VideoReader
                        src="/attachments/report.xlsx"
                        fileName="report.xlsx"
                        mimeType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        components={{
                          Button,
                          Skeleton,
                        }}
                        showToolbar={mediaShowToolbar}
                        showOpenInNewTab={false}
                        containerClassName="min-h-[360px]"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        ) : playgroundPage === 'markdown-reader' ? (
          <Card className={`rounded-3xl ${glassCard}`}>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                MarkdownReader 测试页
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                验证本地内容、远程加载、GFM、图片链接和状态渲染
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    渲染状态
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    切换不同输入和状态，便于快速回归 MarkdownReader
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-5">
                    {[
                      ['content', '本地内容'],
                      ['source', 'sourceUrl'],
                      ['loading', '加载态'],
                      ['error', '错误态'],
                      ['empty', '空状态'],
                    ].map(([value, label]) => (
                      <Button
                        key={value}
                        type="button"
                        variant={
                          markdownReaderState === value ? 'default' : 'outline'
                        }
                        onClick={() =>
                          setMarkdownReaderState(value as MarkdownReaderState)
                        }
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <MarkdownReader
                components={{
                  Card,
                  CardContent,
                  Skeleton,
                }}
                content={
                  markdownReaderState === 'content'
                    ? markdownSample
                    : markdownReaderState === 'empty'
                      ? ''
                      : undefined
                }
                sourceUrl={
                  markdownReaderState === 'source'
                    ? markdownSourceUrl
                    : undefined
                }
                loading={markdownReaderState === 'loading'}
                error={
                  markdownReaderState === 'error'
                    ? '这是一个外部注入的 Markdown 错误状态'
                    : null
                }
                className={`rounded-2xl ${glassCardSub}`}
                contentClassName="p-2"
                emptyText="当前没有 Markdown 内容"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className={`rounded-3xl ${glassCard}`}>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                PDFReader 测试页
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                独立验证 PDFReader 与 SimplePDFReader 的加载、交互与开关行为
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    测试配置
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    可切换 PDF 地址、显示模式与功能开关，便于回归测试
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        预设 PDF
                      </Label>
                      <Select value={pdfUrl} onValueChange={setPdfUrl}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pdfPresetUrls.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        显示模式
                      </Label>
                      <Select
                        value={pdfDisplayMode}
                        onValueChange={(value) =>
                          setPdfDisplayMode(value as PDFDisplayMode)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scroll">连续滚动</SelectItem>
                          <SelectItem value="single">单页模式</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      自定义 PDF URL
                    </Label>
                    <Input
                      value={pdfUrl}
                      onChange={(event) => setPdfUrl(event.target.value)}
                      placeholder="https://example.com/sample.pdf"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        工具栏
                      </Label>
                      {showHideTabs(pdfShowToolbar, setPdfShowToolbar)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        旋转
                      </Label>
                      {showHideTabs(pdfShowRotation, setPdfShowRotation)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        模式切换按钮
                      </Label>
                      {showHideTabs(pdfShowModeToggle, setPdfShowModeToggle)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        全屏按钮
                      </Label>
                      {showHideTabs(pdfShowFullscreen, setPdfShowFullscreen)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        键盘快捷键
                      </Label>
                      {showHideTabs(pdfEnableHotkeys, setPdfEnableHotkeys)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        移动端导航
                      </Label>
                      {showHideTabs(pdfEnableMobileNav, setPdfEnableMobileNav)}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        侧边栏
                      </Label>
                      {showHideTabs(pdfShowSidebar, setPdfShowSidebar)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`rounded-2xl ${glassCardSub}`}>
                <CardContent className="pt-6">
                  <div className="inline-flex w-full flex-col gap-2 rounded-2xl border border-cyan-500/15 bg-white/70 p-2 dark:border-cyan-300/20 dark:bg-slate-900/45 md:w-auto md:flex-row">
                    <Button
                      type="button"
                      variant={
                        pdfReaderTab === 'advanced' ? 'default' : 'ghost'
                      }
                      className="justify-start md:min-w-40 md:justify-center"
                      onClick={() => setPdfReaderTab('advanced')}
                    >
                      PDFReader（高级版）
                    </Button>
                    <Button
                      type="button"
                      variant={pdfReaderTab === 'simple' ? 'default' : 'ghost'}
                      className="justify-start md:min-w-40 md:justify-center"
                      onClick={() => setPdfReaderTab('simple')}
                    >
                      SimplePDFReader
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {pdfReaderTab === 'advanced' ? (
                <Card className={`rounded-2xl ${glassCardSub}`}>
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                      PDFReader（高级版）
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      当前配置实时生效，适合验证回归与交互细节
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFReader
                      key={`${pdfUrl}-${pdfDisplayMode}`}
                      url={pdfUrl}
                      components={{
                        Card,
                        CardContent,
                        Button,
                        Input,
                        Skeleton,
                        Tabs,
                        TabsList,
                        TabsTrigger,
                        TabsContent,
                        ScrollArea,
                      }}
                      initialPage={1}
                      initialScale={1.0}
                      showToolbar={pdfShowToolbar}
                      showSidebar={pdfShowSidebar}
                      showRotation={pdfShowRotation}
                      showModeToggle={pdfShowModeToggle}
                      showFullscreen={pdfShowFullscreen}
                      enableHotkeys={pdfEnableHotkeys}
                      enableMobileNav={pdfEnableMobileNav}
                      displayMode={pdfDisplayMode}
                      className="w-full"
                      contentClassName="min-h-[800px]"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className={`rounded-2xl ${glassCardSub}`}>
                  <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                      SimplePDFReader（对照）
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      与高级版共用同一文档，便于快速对比基础功能
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimplePDFReader
                      key={`simple-${pdfUrl}`}
                      url={pdfUrl}
                      components={{
                        Card,
                        CardContent,
                        CardFooter,
                        Button,
                        Input,
                        Label,
                        Skeleton,
                      }}
                      initialPage={1}
                      initialScale={1.0}
                      showToolbar={true}
                      showPagination={true}
                      className="w-full"
                      containerClassName="min-h-[600px]"
                    />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
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
