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
import { AuthPageShell } from '../src/components/AuthPageShell';
import { AuthPanel } from '../src/components/AuthPanel';
import { AuthVisualCarousel } from '../src/components/AuthVisualCarousel';
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';
import { Skeleton } from '../src/components/ui/skeleton';
import { Switch } from '../src/components/ui/switch';
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
  | 'auth'
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
    value:
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    fileName: 'flower.mp4',
    mimeType: 'video/mp4',
  },
  {
    label: 'WebM 示例',
    value:
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    fileName: 'flower.webm',
    mimeType: 'video/webm',
  },
] as const;
const authCarouselItems = [
  {
    image: '/auth-carousel/assets-workspace.png',
    alt: '内容资产管理工作台界面',
    eyebrow: 'Tale Workspace',
    title: '统一管理内容资产',
    description: '把文档、媒体与业务文件放进清晰的资源空间，快速检索与协作。',
  },
  {
    image: '/auth-carousel/permissions-workspace.png',
    alt: '权限协作与角色管理界面',
    eyebrow: 'Access Control',
    title: '精细化权限协作',
    description: '用角色、权限和访问策略保护关键数据，让团队边界更清楚。',
  },
  {
    image: '/auth-carousel/workflow-workspace.png',
    alt: '任务流程与自动化看板界面',
    eyebrow: 'Workflow Automation',
    title: '持续跟踪任务流程',
    description: '围绕任务、审批和状态流转建立可视化工作台，进展一目了然。',
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

const playgroundPages: PlaygroundPage[] = [
  'overview',
  'file-upload',
  'auth',
  'media-reader',
  'markdown-reader',
  'pdf-reader',
];
const tableDataVariants: TableDataVariant[] = ['all', 'draft-only', 'empty'];
const tableActionsVariants: TableActionsVariant[] = [
  'none',
  'collapsed',
  'expanded',
];
const tablePageSizePresets: TablePageSizePreset[] = [
  'compact',
  'default',
  'large',
];
const pdfDisplayModes: PDFDisplayMode[] = ['scroll', 'single'];
const pdfReaderTabs: PDFReaderTab[] = ['advanced', 'simple'];
const markdownReaderStates: MarkdownReaderState[] = [
  'content',
  'source',
  'loading',
  'error',
  'empty',
];
const mediaPreviewStates: MediaPreviewState[] = [
  'image',
  'video',
  'unsupported',
];

type PlaygroundQueryState = {
  page: PlaygroundPage;
  theme: ThemeMode;
  tableData: TableDataVariant;
  tableActions: TableActionsVariant;
  tablePageSize: TablePageSizePreset;
  tableHeader: boolean;
  tablePagination: boolean;
  tableLoading: boolean;
  tablePageSizeSelector: boolean;
  tableJump: boolean;
  tableTotal: boolean;
  media: MediaPreviewState;
  image: string;
  video: string;
  mediaToolbar: boolean;
  mediaOpen: boolean;
  markdown: MarkdownReaderState;
  pdf: string;
  pdfTab: PDFReaderTab;
  pdfMode: PDFDisplayMode;
  pdfToolbar: boolean;
  pdfRotation: boolean;
  pdfModeToggle: boolean;
  pdfFullscreen: boolean;
  pdfHotkeys: boolean;
  pdfMobile: boolean;
  pdfSidebar: boolean;
};

const defaultPlaygroundQueryState: PlaygroundQueryState = {
  page: 'overview',
  theme: 'system',
  tableData: 'all',
  tableActions: 'collapsed',
  tablePageSize: 'default',
  tableHeader: true,
  tablePagination: true,
  tableLoading: false,
  tablePageSizeSelector: true,
  tableJump: true,
  tableTotal: true,
  media: 'image',
  image: imagePresetUrls[0].value,
  video: videoPresetUrls[0].value,
  mediaToolbar: true,
  mediaOpen: true,
  markdown: 'content',
  pdf: pdfPresetUrls[0].value,
  pdfTab: 'advanced',
  pdfMode: 'scroll',
  pdfToolbar: true,
  pdfRotation: true,
  pdfModeToggle: true,
  pdfFullscreen: true,
  pdfHotkeys: true,
  pdfMobile: true,
  pdfSidebar: true,
};

const parseEnumParam = <T extends string>(
  params: URLSearchParams,
  key: string,
  values: readonly T[],
  fallback: T
) => {
  const value = params.get(key);
  return value && values.includes(value as T) ? (value as T) : fallback;
};

const parseBooleanParam = (
  params: URLSearchParams,
  key: string,
  fallback: boolean
) => {
  const value = params.get(key);
  if (value === '1') return true;
  if (value === '0') return false;
  return fallback;
};

export const getPlaygroundStateFromSearch = (
  search: string
): PlaygroundQueryState => {
  const params = new URLSearchParams(search);
  return {
    page: parseEnumParam(
      params,
      'page',
      playgroundPages,
      defaultPlaygroundQueryState.page
    ),
    theme: parseEnumParam(
      params,
      'theme',
      themeOptions.map((option) => option.value),
      defaultPlaygroundQueryState.theme
    ),
    tableData: parseEnumParam(
      params,
      'tableData',
      tableDataVariants,
      defaultPlaygroundQueryState.tableData
    ),
    tableActions: parseEnumParam(
      params,
      'tableActions',
      tableActionsVariants,
      defaultPlaygroundQueryState.tableActions
    ),
    tablePageSize: parseEnumParam(
      params,
      'tablePageSize',
      tablePageSizePresets,
      defaultPlaygroundQueryState.tablePageSize
    ),
    tableHeader: parseBooleanParam(
      params,
      'tableHeader',
      defaultPlaygroundQueryState.tableHeader
    ),
    tablePagination: parseBooleanParam(
      params,
      'tablePagination',
      defaultPlaygroundQueryState.tablePagination
    ),
    tableLoading: parseBooleanParam(
      params,
      'tableLoading',
      defaultPlaygroundQueryState.tableLoading
    ),
    tablePageSizeSelector: parseBooleanParam(
      params,
      'tablePageSizeSelector',
      defaultPlaygroundQueryState.tablePageSizeSelector
    ),
    tableJump: parseBooleanParam(
      params,
      'tableJump',
      defaultPlaygroundQueryState.tableJump
    ),
    tableTotal: parseBooleanParam(
      params,
      'tableTotal',
      defaultPlaygroundQueryState.tableTotal
    ),
    media: parseEnumParam(
      params,
      'media',
      mediaPreviewStates,
      defaultPlaygroundQueryState.media
    ),
    image: params.get('image') || defaultPlaygroundQueryState.image,
    video: params.get('video') || defaultPlaygroundQueryState.video,
    mediaToolbar: parseBooleanParam(
      params,
      'mediaToolbar',
      defaultPlaygroundQueryState.mediaToolbar
    ),
    mediaOpen: parseBooleanParam(
      params,
      'mediaOpen',
      defaultPlaygroundQueryState.mediaOpen
    ),
    markdown: parseEnumParam(
      params,
      'markdown',
      markdownReaderStates,
      defaultPlaygroundQueryState.markdown
    ),
    pdf: params.get('pdf') || defaultPlaygroundQueryState.pdf,
    pdfTab: parseEnumParam(
      params,
      'pdfTab',
      pdfReaderTabs,
      defaultPlaygroundQueryState.pdfTab
    ),
    pdfMode: parseEnumParam(
      params,
      'pdfMode',
      pdfDisplayModes,
      defaultPlaygroundQueryState.pdfMode
    ),
    pdfToolbar: parseBooleanParam(
      params,
      'pdfToolbar',
      defaultPlaygroundQueryState.pdfToolbar
    ),
    pdfRotation: parseBooleanParam(
      params,
      'pdfRotation',
      defaultPlaygroundQueryState.pdfRotation
    ),
    pdfModeToggle: parseBooleanParam(
      params,
      'pdfModeToggle',
      defaultPlaygroundQueryState.pdfModeToggle
    ),
    pdfFullscreen: parseBooleanParam(
      params,
      'pdfFullscreen',
      defaultPlaygroundQueryState.pdfFullscreen
    ),
    pdfHotkeys: parseBooleanParam(
      params,
      'pdfHotkeys',
      defaultPlaygroundQueryState.pdfHotkeys
    ),
    pdfMobile: parseBooleanParam(
      params,
      'pdfMobile',
      defaultPlaygroundQueryState.pdfMobile
    ),
    pdfSidebar: parseBooleanParam(
      params,
      'pdfSidebar',
      defaultPlaygroundQueryState.pdfSidebar
    ),
  };
};

export const createPlaygroundSearch = (state: PlaygroundQueryState) => {
  const params = new URLSearchParams();
  const setParam = <T extends string | boolean>(
    key: string,
    value: T,
    fallback: T
  ) => {
    if (value === fallback) return;
    params.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
  };

  setParam('page', state.page, defaultPlaygroundQueryState.page);
  setParam('theme', state.theme, defaultPlaygroundQueryState.theme);
  setParam('tableData', state.tableData, defaultPlaygroundQueryState.tableData);
  setParam(
    'tableActions',
    state.tableActions,
    defaultPlaygroundQueryState.tableActions
  );
  setParam(
    'tablePageSize',
    state.tablePageSize,
    defaultPlaygroundQueryState.tablePageSize
  );
  setParam(
    'tableHeader',
    state.tableHeader,
    defaultPlaygroundQueryState.tableHeader
  );
  setParam(
    'tablePagination',
    state.tablePagination,
    defaultPlaygroundQueryState.tablePagination
  );
  setParam(
    'tableLoading',
    state.tableLoading,
    defaultPlaygroundQueryState.tableLoading
  );
  setParam(
    'tablePageSizeSelector',
    state.tablePageSizeSelector,
    defaultPlaygroundQueryState.tablePageSizeSelector
  );
  setParam('tableJump', state.tableJump, defaultPlaygroundQueryState.tableJump);
  setParam(
    'tableTotal',
    state.tableTotal,
    defaultPlaygroundQueryState.tableTotal
  );
  setParam('media', state.media, defaultPlaygroundQueryState.media);
  setParam('image', state.image, defaultPlaygroundQueryState.image);
  setParam('video', state.video, defaultPlaygroundQueryState.video);
  setParam(
    'mediaToolbar',
    state.mediaToolbar,
    defaultPlaygroundQueryState.mediaToolbar
  );
  setParam('mediaOpen', state.mediaOpen, defaultPlaygroundQueryState.mediaOpen);
  setParam('markdown', state.markdown, defaultPlaygroundQueryState.markdown);
  setParam('pdf', state.pdf, defaultPlaygroundQueryState.pdf);
  setParam('pdfTab', state.pdfTab, defaultPlaygroundQueryState.pdfTab);
  setParam('pdfMode', state.pdfMode, defaultPlaygroundQueryState.pdfMode);
  setParam(
    'pdfToolbar',
    state.pdfToolbar,
    defaultPlaygroundQueryState.pdfToolbar
  );
  setParam(
    'pdfRotation',
    state.pdfRotation,
    defaultPlaygroundQueryState.pdfRotation
  );
  setParam(
    'pdfModeToggle',
    state.pdfModeToggle,
    defaultPlaygroundQueryState.pdfModeToggle
  );
  setParam(
    'pdfFullscreen',
    state.pdfFullscreen,
    defaultPlaygroundQueryState.pdfFullscreen
  );
  setParam(
    'pdfHotkeys',
    state.pdfHotkeys,
    defaultPlaygroundQueryState.pdfHotkeys
  );
  setParam('pdfMobile', state.pdfMobile, defaultPlaygroundQueryState.pdfMobile);
  setParam(
    'pdfSidebar',
    state.pdfSidebar,
    defaultPlaygroundQueryState.pdfSidebar
  );

  const query = params.toString();
  return query ? `?${query}` : '';
};

const getPresetIndexForUrl = <T extends readonly { value: string }[]>(
  options: T,
  url: string
) => {
  const index = options.findIndex((option) => option.value === url);
  return index > -1 ? String(index) : '0';
};

export default function App() {
  const initialQueryState =
    typeof window === 'undefined'
      ? defaultPlaygroundQueryState
      : getPlaygroundStateFromSearch(window.location.search);
  const [playgroundPage, setPlaygroundPage] = useState<PlaygroundPage>(
    initialQueryState.page
  );
  const [theme, setTheme] = useState<ThemeMode>(initialQueryState.theme);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showBeta, setShowBeta] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(
    pageSizeOptionsByPreset[initialQueryState.tablePageSize][0]
  );
  const [tableDataVariant, setTableDataVariant] = useState<TableDataVariant>(
    initialQueryState.tableData
  );
  const [tableActionsVariant, setTableActionsVariant] =
    useState<TableActionsVariant>(initialQueryState.tableActions);
  const [tableShowHeader, setTableShowHeader] = useState(
    initialQueryState.tableHeader
  );
  const [tableShowPagination, setTableShowPagination] = useState(
    initialQueryState.tablePagination
  );
  const [tableLoading, setTableLoading] = useState(
    initialQueryState.tableLoading
  );
  const [tableShowPageSizeSelector, setTableShowPageSizeSelector] = useState(
    initialQueryState.tablePageSizeSelector
  );
  const [tableShowJumpToPage, setTableShowJumpToPage] = useState(
    initialQueryState.tableJump
  );
  const [tableShowTotal, setTableShowTotal] = useState(
    initialQueryState.tableTotal
  );
  const [tablePageSizePreset, setTablePageSizePreset] =
    useState<TablePageSizePreset>(initialQueryState.tablePageSize);
  const [pdfUrl, setPdfUrl] = useState<string>(initialQueryState.pdf);
  const [pdfDisplayMode, setPdfDisplayMode] = useState<PDFDisplayMode>(
    initialQueryState.pdfMode
  );
  const [pdfReaderTab, setPdfReaderTab] = useState<PDFReaderTab>(
    initialQueryState.pdfTab
  );
  const [markdownReaderState, setMarkdownReaderState] =
    useState<MarkdownReaderState>(initialQueryState.markdown);
  const [mediaPreviewState, setMediaPreviewState] = useState<MediaPreviewState>(
    initialQueryState.media
  );
  const [imagePresetIndex, setImagePresetIndex] = useState(
    getPresetIndexForUrl(imagePresetUrls, initialQueryState.image)
  );
  const [imageUrl, setImageUrl] = useState<string>(initialQueryState.image);
  const [videoPresetIndex, setVideoPresetIndex] = useState(
    getPresetIndexForUrl(videoPresetUrls, initialQueryState.video)
  );
  const [videoUrl, setVideoUrl] = useState<string>(initialQueryState.video);
  const [mediaShowToolbar, setMediaShowToolbar] = useState(
    initialQueryState.mediaToolbar
  );
  const [mediaShowOpenButton, setMediaShowOpenButton] = useState(
    initialQueryState.mediaOpen
  );
  const [pdfShowToolbar, setPdfShowToolbar] = useState(
    initialQueryState.pdfToolbar
  );
  const [pdfShowRotation, setPdfShowRotation] = useState(
    initialQueryState.pdfRotation
  );
  const [pdfShowModeToggle, setPdfShowModeToggle] = useState(
    initialQueryState.pdfModeToggle
  );
  const [pdfShowFullscreen, setPdfShowFullscreen] = useState(
    initialQueryState.pdfFullscreen
  );
  const [pdfEnableHotkeys, setPdfEnableHotkeys] = useState(
    initialQueryState.pdfHotkeys
  );
  const [pdfEnableMobileNav, setPdfEnableMobileNav] = useState(
    initialQueryState.pdfMobile
  );
  const [pdfShowSidebar, setPdfShowSidebar] = useState(
    initialQueryState.pdfSidebar
  );
  const [uploadLog, setUploadLog] = useState<string[]>([]);
  const [authLog, setAuthLog] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const isApplyingPopstateRef = useRef(false);
  const pageSizeByPresetRef = useRef<Record<TablePageSizePreset, number>>({
    compact: 2,
    default: 5,
    large: 10,
  });

  const applyQueryState = useCallback((state: PlaygroundQueryState) => {
    setPlaygroundPage(state.page);
    setTheme(state.theme);
    setTableDataVariant(state.tableData);
    setTableActionsVariant(state.tableActions);
    setTablePageSizePreset(state.tablePageSize);
    setPageSize(pageSizeOptionsByPreset[state.tablePageSize][0]);
    setTableShowHeader(state.tableHeader);
    setTableShowPagination(state.tablePagination);
    setTableLoading(state.tableLoading);
    setTableShowPageSizeSelector(state.tablePageSizeSelector);
    setTableShowJumpToPage(state.tableJump);
    setTableShowTotal(state.tableTotal);
    setMediaPreviewState(state.media);
    setImageUrl(state.image);
    setImagePresetIndex(getPresetIndexForUrl(imagePresetUrls, state.image));
    setVideoUrl(state.video);
    setVideoPresetIndex(getPresetIndexForUrl(videoPresetUrls, state.video));
    setMediaShowToolbar(state.mediaToolbar);
    setMediaShowOpenButton(state.mediaOpen);
    setMarkdownReaderState(state.markdown);
    setPdfUrl(state.pdf);
    setPdfReaderTab(state.pdfTab);
    setPdfDisplayMode(state.pdfMode);
    setPdfShowToolbar(state.pdfToolbar);
    setPdfShowRotation(state.pdfRotation);
    setPdfShowModeToggle(state.pdfModeToggle);
    setPdfShowFullscreen(state.pdfFullscreen);
    setPdfEnableHotkeys(state.pdfHotkeys);
    setPdfEnableMobileNav(state.pdfMobile);
    setPdfShowSidebar(state.pdfSidebar);
  }, []);

  useEffect(() => {
    const handlePopstate = () => {
      isApplyingPopstateRef.current = true;
      applyQueryState(getPlaygroundStateFromSearch(window.location.search));
      window.setTimeout(() => {
        isApplyingPopstateRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [applyQueryState]);

  useEffect(() => {
    if (isApplyingPopstateRef.current || typeof window === 'undefined') return;

    const nextSearch = createPlaygroundSearch({
      page: playgroundPage,
      theme,
      tableData: tableDataVariant,
      tableActions: tableActionsVariant,
      tablePageSize: tablePageSizePreset,
      tableHeader: tableShowHeader,
      tablePagination: tableShowPagination,
      tableLoading,
      tablePageSizeSelector: tableShowPageSizeSelector,
      tableJump: tableShowJumpToPage,
      tableTotal: tableShowTotal,
      media: mediaPreviewState,
      image: imageUrl,
      video: videoUrl,
      mediaToolbar: mediaShowToolbar,
      mediaOpen: mediaShowOpenButton,
      markdown: markdownReaderState,
      pdf: pdfUrl,
      pdfTab: pdfReaderTab,
      pdfMode: pdfDisplayMode,
      pdfToolbar: pdfShowToolbar,
      pdfRotation: pdfShowRotation,
      pdfModeToggle: pdfShowModeToggle,
      pdfFullscreen: pdfShowFullscreen,
      pdfHotkeys: pdfEnableHotkeys,
      pdfMobile: pdfEnableMobileNav,
      pdfSidebar: pdfShowSidebar,
    });
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;

    if (
      `${window.location.pathname}${window.location.search}${window.location.hash}` !==
      nextUrl
    ) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [
    imageUrl,
    markdownReaderState,
    mediaPreviewState,
    mediaShowOpenButton,
    mediaShowToolbar,
    pdfDisplayMode,
    pdfEnableHotkeys,
    pdfEnableMobileNav,
    pdfReaderTab,
    pdfShowFullscreen,
    pdfShowModeToggle,
    pdfShowRotation,
    pdfShowSidebar,
    pdfShowToolbar,
    pdfUrl,
    playgroundPage,
    tableActionsVariant,
    tableDataVariant,
    tableLoading,
    tablePageSizePreset,
    tableShowHeader,
    tableShowJumpToPage,
    tableShowPageSizeSelector,
    tableShowPagination,
    tableShowTotal,
    theme,
    videoUrl,
  ]);

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
      document.documentElement.style.colorScheme = isDarkMode
        ? 'dark'
        : 'light';
      const themeColor = isDarkMode ? '#020617' : '#f8fafc';
      let themeMeta = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
      );
      if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.name = 'theme-color';
        document.head.appendChild(themeMeta);
      }
      themeMeta.content = themeColor;
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
  const renderSwitchSetting = (
    value: boolean,
    onChange: (value: boolean) => void,
    label: string,
    id: string
  ) => (
    <div className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-background/70 px-3 dark:border-slate-700">
      <Label
        htmlFor={id}
        className="min-w-0 cursor-pointer text-sm font-medium text-foreground"
      >
        {value ? '显示' : '隐藏'}
      </Label>
      <Switch
        id={id}
        checked={value}
        onCheckedChange={onChange}
        aria-label={label}
      />
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
        SelectGroup,
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
  const authUIComponents = {
    Button,
    Input,
    Label,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  };

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

        <Tabs
          value={playgroundPage}
          onValueChange={(value) => setPlaygroundPage(value as PlaygroundPage)}
          className="flex flex-col gap-6"
        >
          <Card className={`rounded-3xl ${glassCard}`}>
            <CardContent className="pt-6">
              <TabsList className="h-auto w-full flex-col gap-1 rounded-2xl border border-cyan-500/15 bg-white/70 p-2 dark:border-cyan-300/20 dark:bg-slate-900/45 md:w-auto md:flex-row">
                <TabsTrigger
                  value="overview"
                  className="w-full justify-start md:min-w-36 md:justify-center"
                >
                  综合测试页
                </TabsTrigger>
                <TabsTrigger
                  value="file-upload"
                  className="w-full justify-start md:min-w-36 md:justify-center"
                >
                  上传界面
                </TabsTrigger>
                <TabsTrigger
                  value="auth"
                  className="w-full justify-start md:min-w-36 md:justify-center"
                >
                  认证组件
                </TabsTrigger>
                <TabsTrigger
                  value="media-reader"
                  className="w-full justify-start md:min-w-36 md:justify-center"
                >
                  媒体预览
                </TabsTrigger>
                <TabsTrigger
                  value="markdown-reader"
                  className="w-full justify-start md:min-w-36 md:justify-center"
                >
                  MarkdownReader
                </TabsTrigger>
                <TabsTrigger
                  value="pdf-reader"
                  className="w-full justify-start md:min-w-36 md:justify-center"
                >
                  PDFReader 测试页
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value={playgroundPage} className="mt-0">
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
                            <Label
                              htmlFor="table-data-variant"
                              className="text-xs font-medium text-slate-600 dark:text-slate-300"
                            >
                              数据状态
                            </Label>
                            <Select
                              value={tableDataVariant}
                              onValueChange={(value) =>
                                setTableDataVariant(value as TableDataVariant)
                              }
                            >
                              <SelectTrigger
                                id="table-data-variant"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="all">全部数据</SelectItem>
                                  <SelectItem value="draft-only">
                                    仅 Draft
                                  </SelectItem>
                                  <SelectItem value="empty">空数据</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label
                              htmlFor="table-actions-variant"
                              className="text-xs font-medium text-slate-600 dark:text-slate-300"
                            >
                              操作列模式
                            </Label>
                            <Select
                              value={tableActionsVariant}
                              onValueChange={(value) =>
                                setTableActionsVariant(
                                  value as TableActionsVariant
                                )
                              }
                            >
                              <SelectTrigger
                                id="table-actions-variant"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="collapsed">
                                    折叠菜单
                                  </SelectItem>
                                  <SelectItem value="expanded">
                                    展开按钮
                                  </SelectItem>
                                  <SelectItem value="none">
                                    不显示操作列
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              头部区域
                            </Label>
                            {renderSwitchSetting(
                              tableShowHeader,
                              setTableShowHeader,
                              '头部区域',
                              'table-show-header'
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label
                              htmlFor="table-loading-state"
                              className="text-xs font-medium text-slate-600 dark:text-slate-300"
                            >
                              加载态
                            </Label>
                            <Select
                              value={tableLoading ? 'loading' : 'ready'}
                              onValueChange={(value) =>
                                setTableLoading(value === 'loading')
                              }
                            >
                              <SelectTrigger
                                id="table-loading-state"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="ready">关闭</SelectItem>
                                  <SelectItem value="loading">开启</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              分页区域
                            </Label>
                            {renderSwitchSetting(
                              tableShowPagination,
                              setTableShowPagination,
                              '分页区域',
                              'table-show-pagination'
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              显示总数
                            </Label>
                            {renderSwitchSetting(
                              tableShowTotal,
                              setTableShowTotal,
                              '显示总数',
                              'table-show-total'
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              每页条数
                            </Label>
                            {renderSwitchSetting(
                              tableShowPageSizeSelector,
                              setTableShowPageSizeSelector,
                              '每页条数',
                              'table-show-page-size-selector'
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              跳页输入
                            </Label>
                            {renderSwitchSetting(
                              tableShowJumpToPage,
                              setTableShowJumpToPage,
                              '跳页输入',
                              'table-show-jump-to-page'
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-2">
                            <Label
                              htmlFor="table-page-size-preset"
                              className="text-xs font-medium text-slate-600 dark:text-slate-300"
                            >
                              每页选项集
                            </Label>
                            <Select
                              value={tablePageSizePreset}
                              onValueChange={handleTablePageSizePresetChange}
                            >
                              <SelectTrigger
                                id="table-page-size-preset"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="compact">紧凑</SelectItem>
                                  <SelectItem value="default">默认</SelectItem>
                                  <SelectItem value="large">大页</SelectItem>
                                </SelectGroup>
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
                          <Button>Default</Button>
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
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="you@turinhub.com"
                              autoComplete="email"
                              spellCheck={false}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select defaultValue="admin">
                              <SelectTrigger id="role">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectGroup>
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
            ) : playgroundPage === 'auth' ? (
              <Card className={`rounded-3xl ${glassCard}`}>
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    Auth 认证组件
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    验证 AuthPageShell、AuthPanel、登录和注册回调的组合方式
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
                    <AuthPageShell
                      visual={
                        <AuthVisualCarousel
                          items={authCarouselItems}
                          intervalMs={5200}
                        />
                      }
                      overlay={
                        <div className="absolute inset-0 z-10 bg-slate-950/35" />
                      }
                      contentClassName="min-h-[680px]"
                    >
                      <AuthPanel
                        components={authUIComponents}
                        loginProps={{
                          title: '欢迎登录 Tale',
                          description: '进入资源、任务与权限管理工作台',
                          onPasswordLogin: async ({ username }) => {
                            setAuthLog((logs) => [
                              `账号密码登录：${username}`,
                              ...logs.slice(0, 5),
                            ]);
                          },
                          onSendSmsCode: async (phone) => {
                            setAuthLog((logs) => [
                              `发送登录验证码：${phone}`,
                              ...logs.slice(0, 5),
                            ]);
                            return { smsId: 'login-sms-id', smsType: 'login' };
                          },
                          onSmsLogin: async ({
                            phone,
                            code,
                            smsId,
                            smsType,
                          }) => {
                            setAuthLog((logs) => [
                              `短信登录：${phone} / ${code} / ${smsId} / ${smsType}`,
                              ...logs.slice(0, 5),
                            ]);
                          },
                        }}
                        registerProps={{
                          title: '创建 Tale 账号',
                          description: '填写账号信息并完成手机号验证',
                          requireTermsAccepted: true,
                          termsLabel: '我已阅读并同意 Tale 服务条款',
                          onSendSmsCode: async (phone) => {
                            setAuthLog((logs) => [
                              `发送注册验证码：${phone}`,
                              ...logs.slice(0, 5),
                            ]);
                            return {
                              smsId: 'register-sms-id',
                              smsType: 'register',
                            };
                          },
                          onRegister: async ({
                            username,
                            phone,
                            smsId,
                            smsType,
                          }) => {
                            setAuthLog((logs) => [
                              `注册：${username} / ${phone} / ${smsId} / ${smsType}`,
                              ...logs.slice(0, 5),
                            ]);
                          },
                        }}
                      />
                    </AuthPageShell>
                  </div>

                  <Card className={`rounded-2xl ${glassCardSub}`}>
                    <CardHeader>
                      <CardTitle className="text-slate-900 dark:text-white">
                        认证事件
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        模拟业务侧登录、注册和验证码回调
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {authLog.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-slate-500 dark:text-slate-400">
                          暂无事件
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {authLog.map((log, index) => (
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
                    验证 ImageReader 与 VideoReader
                    的常见格式、工具栏、加载态和不支持格式兜底
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
                              mediaPreviewState === value
                                ? 'default'
                                : 'outline'
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
                          <Label
                            htmlFor="image-preset"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
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
                            <SelectTrigger id="image-preset">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {imagePresetUrls.map((option, index) => (
                                  <SelectItem
                                    key={option.value}
                                    value={String(index)}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="video-preset"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
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
                            <SelectTrigger id="video-preset">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {videoPresetUrls.map((option, index) => (
                                  <SelectItem
                                    key={option.value}
                                    value={String(index)}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="image-url"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            图片 URL
                          </Label>
                          <Input
                            id="image-url"
                            name="imageUrl"
                            type="url"
                            value={imageUrl}
                            onChange={(event) =>
                              setImageUrl(event.target.value)
                            }
                            placeholder="https://example.com/image.png"
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="video-url"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            视频 URL
                          </Label>
                          <Input
                            id="video-url"
                            name="videoUrl"
                            type="url"
                            value={videoUrl}
                            onChange={(event) =>
                              setVideoUrl(event.target.value)
                            }
                            placeholder="https://example.com/video.mp4"
                            autoComplete="off"
                            spellCheck={false}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            工具栏
                          </Label>
                          {renderSwitchSetting(
                            mediaShowToolbar,
                            setMediaShowToolbar,
                            '媒体工具栏',
                            'media-show-toolbar'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            新窗口按钮
                          </Label>
                          {renderSwitchSetting(
                            mediaShowOpenButton,
                            setMediaShowOpenButton,
                            '新窗口按钮',
                            'media-show-open-button'
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
                              markdownReaderState === value
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setMarkdownReaderState(
                                value as MarkdownReaderState
                              )
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
                          <Label
                            htmlFor="pdf-preset"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            预设 PDF
                          </Label>
                          <Select value={pdfUrl} onValueChange={setPdfUrl}>
                            <SelectTrigger id="pdf-preset">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {pdfPresetUrls.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="pdf-display-mode"
                            className="text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            显示模式
                          </Label>
                          <Select
                            value={pdfDisplayMode}
                            onValueChange={(value) =>
                              setPdfDisplayMode(value as PDFDisplayMode)
                            }
                          >
                            <SelectTrigger id="pdf-display-mode">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="scroll">连续滚动</SelectItem>
                                <SelectItem value="single">单页模式</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="pdf-url"
                          className="text-xs font-medium text-slate-600 dark:text-slate-300"
                        >
                          自定义 PDF URL
                        </Label>
                        <Input
                          id="pdf-url"
                          name="pdfUrl"
                          type="url"
                          value={pdfUrl}
                          onChange={(event) => setPdfUrl(event.target.value)}
                          placeholder="https://example.com/sample.pdf"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            工具栏
                          </Label>
                          {renderSwitchSetting(
                            pdfShowToolbar,
                            setPdfShowToolbar,
                            'PDF 工具栏',
                            'pdf-show-toolbar'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            旋转
                          </Label>
                          {renderSwitchSetting(
                            pdfShowRotation,
                            setPdfShowRotation,
                            '旋转',
                            'pdf-show-rotation'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            模式切换按钮
                          </Label>
                          {renderSwitchSetting(
                            pdfShowModeToggle,
                            setPdfShowModeToggle,
                            '模式切换按钮',
                            'pdf-show-mode-toggle'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            全屏按钮
                          </Label>
                          {renderSwitchSetting(
                            pdfShowFullscreen,
                            setPdfShowFullscreen,
                            '全屏按钮',
                            'pdf-show-fullscreen'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            键盘快捷键
                          </Label>
                          {renderSwitchSetting(
                            pdfEnableHotkeys,
                            setPdfEnableHotkeys,
                            '键盘快捷键',
                            'pdf-enable-hotkeys'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            移动端导航
                          </Label>
                          {renderSwitchSetting(
                            pdfEnableMobileNav,
                            setPdfEnableMobileNav,
                            '移动端导航',
                            'pdf-enable-mobile-nav'
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            侧边栏
                          </Label>
                          {renderSwitchSetting(
                            pdfShowSidebar,
                            setPdfShowSidebar,
                            '侧边栏',
                            'pdf-show-sidebar'
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs
                    value={pdfReaderTab}
                    onValueChange={(value) =>
                      setPdfReaderTab(value as PDFReaderTab)
                    }
                    className="flex flex-col gap-6"
                  >
                    <Card className={`rounded-2xl ${glassCardSub}`}>
                      <CardContent className="pt-6">
                        <TabsList className="h-auto w-full flex-col gap-1 rounded-2xl border border-cyan-500/15 bg-white/70 p-2 dark:border-cyan-300/20 dark:bg-slate-900/45 md:w-auto md:flex-row">
                          <TabsTrigger
                            value="advanced"
                            className="w-full justify-start md:min-w-40 md:justify-center"
                          >
                            PDFReader（高级版）
                          </TabsTrigger>
                          <TabsTrigger
                            value="simple"
                            className="w-full justify-start md:min-w-40 md:justify-center"
                          >
                            SimplePDFReader
                          </TabsTrigger>
                        </TabsList>
                      </CardContent>
                    </Card>

                    <TabsContent value="advanced" className="mt-0">
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
                    </TabsContent>
                    <TabsContent value="simple" className="mt-0">
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
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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
