# @turinhub/atomix-common-ui

基于 shadcn/ui 的业务组件库 - 保持最大灵活性

## 🎯 设计理念

这个包采用 **组件注入** 模式，而不是传统的全打包模式：

- ✅ **保留 shadcn/ui 的灵活性**：UI 组件源码在你的项目中，随时可以修改
- ✅ **避免版本冲突**：不会与你自己安装的 shadcn/ui 冲突
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **零额外依赖**：只打包业务逻辑

## 📦 安装

```bash
pnpm add @turinhub/atomix-common-ui
```

**注意**：你需要自己在项目中安装 shadcn/ui 的 UI 组件：

```bash
# 如果你还没有 shadcn/ui
npx shadcn-ui@latest init

# 安装需要的 UI 组件
npx shadcn-ui@latest add button card dialog input label select table skeleton dropdown-menu
```

## 🚀 快速开始

### 1. 创建 UI 组件适配器

在你的项目中创建一个文件（如 `src/lib/ui-adapter.ts`）：

```typescript
// src/lib/ui-adapter.ts
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  TableHeader as DataTableHeader,
  TablePagination as DataTablePagination,
} from '@turinhub/atomix-common-ui';

import type {
  UIComponents,
  DialogUIComponents,
  HeaderUIComponents,
  PaginationUIComponents,
} from '@turinhub/atomix-common-ui';

// DataTable 的 UI 组件
export const dataTableUI: UIComponents = {
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
  TableHeaderComponent: DataTableHeader,
  TablePaginationComponent: DataTablePagination,
};

// DeleteConfirmDialog 的 UI 组件
export const dialogUI: DialogUIComponents = {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
};

// TableHeader 的 UI 组件
export const headerUI: HeaderUIComponents = {
  Input,
  Button,
};

// TablePagination 的 UI 组件
export const paginationUI: PaginationUIComponents = {
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};
```

### 2. 使用 DataTable 组件

```typescript
import { DataTable } from '@turinhub/atomix-common-ui';
import { dataTableUI } from '@/lib/ui-adapter';
import type { Column } from '@turinhub/atomix-common-ui';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: Column<User>[] = [
  {
    key: 'name',
    title: '姓名',
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: 'email',
    title: '邮箱',
  },
  {
    key: 'role',
    title: '角色',
    align: 'center',
  },
];

function UserList() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <DataTable
      components={dataTableUI}
      data={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      header={{
        title: "用户列表",
        searchValue: search,
        onSearchChange: setSearch,
        components: headerUI, // 传入 TableHeader 的 UI 组件
      }}
      pagination={{
        currentPage: 0,
        pageSize: 10,
        total: 100,
        onPageChange: (page) => console.log('Page:', page),
        components: paginationUI, // 传入 TablePagination 的 UI 组件
      }}
      actions={{
        mode: 'collapsed',
        items: [
          {
            label: '编辑',
            onClick: (record) => console.log('Edit:', record),
          },
          { separator: true },
          {
            label: '删除',
            onClick: (record) => console.log('Delete:', record),
            className: 'text-destructive',
          },
        ],
      }}
    />
  );
}
```

### 3. 使用 DeleteConfirmDialog 组件

```typescript
import { DeleteConfirmDialog } from '@turinhub/atomix-common-ui';
import { dialogUI } from '@/lib/ui-adapter';

function UserList() {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: '',
  });

  return (
    <DeleteConfirmDialog
      components={dialogUI}
      open={deleteDialog.open}
      onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      title="确认删除用户"
      description="删除后无法恢复，请谨慎操作"
      onConfirm={() => {
        // 执行删除逻辑
        console.log('Deleting user:', deleteDialog.userId);
        setDeleteDialog({ open: false, userId: '' });
      }}
      verification={{
        targetValue: deleteDialog.userId,
        label: '请输入用户 ID 以确认',
      }}
    />
  );
}
```

## 🎨 自定义 UI 组件

如果你想自定义某个 UI 组件（比如使用不同样式的 Button），只需修改适配器：

```typescript
import { Button as CustomButton } from '@/components/ui/custom-button';

export const dataTableUI: UIComponents = {
  // ... 其他组件
  Button: CustomButton, // 使用自定义的 Button
};
```

## 📝 API 文档

### DataTable

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `components` | `UIComponents` | ✅ | UI 组件适配器 |
| `data` | `T[]` | ✅ | 表格数据 |
| `columns` | `Column<T>[]` | ✅ | 列配置 |
| `rowKey` | `keyof T \| function` | ✅ | 行的唯一标识 |
| `loading` | `boolean` | ❌ | 加载状态 |
| `header` | `TableHeaderProps` | ❌ | 头部配置 |
| `pagination` | `PaginationProps` | ❌ | 分页配置 |
| `actions` | `ActionsConfig` | ❌ | 操作列配置 |

### DeleteConfirmDialog

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `components` | `DialogUIComponents` | ✅ | UI 组件适配器 |
| `open` | `boolean` | ✅ | 是否打开 |
| `onOpenChange` | `(open: boolean) => void` | ✅ | 打开状态变化 |
| `title` | `ReactNode` | ✅ | 标题 |
| `description` | `ReactNode` | ✅ | 描述 |
| `onConfirm` | `() => void` | ✅ | 确认回调 |
| `verification` | `object` | ❌ | 验证配置 |

## 🛠️ 工具函数

### cn

`cn` 函数是一个用于合并 className 的工具函数，基于 `clsx` 和 `tailwind-merge`。

```typescript
import { cn } from '@turinhub/atomix-common-ui';

// 合并多个 className
cn('px-4 py-2', 'bg-blue-500');

// 条件 className
cn('base-class', isActive && 'active-class', isError && 'error-class');

// 合并 Tailwind 类（自动去重）
cn('px-4 py-2 bg-blue-500', 'px-2 bg-red-500');
// 结果: 'py-2 bg-red-500' (px-2 覆盖 px-4)
```

## 🔧 类型导出

所有 UI 组件的类型都已导出，用于类型约束：

```typescript
import type {
  UIComponent,
  ButtonComponent,
  InputComponent,
  CardComponent,
  TableComponent,
  DialogComponent,
  LabelComponent,
} from '@turinhub/atomix-common-ui';
```

## 🤔 为什么这样设计？

### ❌ 传统方式（全打包）

```typescript
// 问题：UI 组件被打包进 npm 包
import { DataTable, Button, Dialog } from '@some-ui-lib'

// 缺点：
// 1. ❌ 无法修改 Button、Dialog 的源码
// 2. ❌ 与项目自己的 shadcn/ui 冲突
// 3. ❌ shadcn/ui 更新时需要等这个包更新
```

### ✅ 我们的方式（组件注入）

```typescript
// 优势：UI 组件由业务项目提供
import { DataTable } from '@turinhub/atomix-common-ui'
import { Button, Dialog } from '@/components/ui' // 自己的 shadcn/ui

// 优点：
// 1. ✅ 可以随时修改 UI 组件源码
// 2. ✅ 不会有版本冲突
// 3. ✅ 符合 shadcn/ui 的设计理念
```

## 📄 License

MIT
