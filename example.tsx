/**
 * 使用示例：如何在业务项目中使用 @turinhub/atomix-common-ui
 *
 * 前提条件：
 * 1. 已安装 shadcn/ui 组件到 @/components/ui
 * 2. 已安装 @turinhub/atomix-common-ui
 */

import { useState } from 'react';
import {
  DataTable,
  DeleteConfirmDialog,
  TableHeader,
  TablePagination,
} from '@turinhub/atomix-common-ui';

// ===== 步骤 1: 创建 UI 组件适配器 =====
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

import type { UIComponents } from '@turinhub/atomix-common-ui';

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
  TableHeaderComponent: TableHeader,
  TablePaginationComponent: TablePagination,
};

// ===== 步骤 2: 定义数据类型 =====
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Guest';
  status: 'active' | 'inactive';
}

// ===== 步骤 3: 使用组件 =====
export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: 'User', status: 'active' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: 'Guest', status: 'inactive' },
  ]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null as User | null,
  });

  // 列配置
  const columns = [
    {
      key: 'name' as const,
      title: '姓名',
      render: (value: string, record: User) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      key: 'email' as const,
      title: '邮箱',
    },
    {
      key: 'role' as const,
      title: '角色',
      align: 'center' as const,
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          value === 'Admin'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
            : value === 'User'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status' as const,
      title: '状态',
      align: 'center' as const,
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          value === 'active'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
        }`}>
          {value === 'active' ? '活跃' : '禁用'}
        </span>
      ),
    },
  ];

  // 处理删除
  const handleDelete = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = () => {
    if (deleteDialog.user) {
      setUsers(users.filter(u => u.id !== deleteDialog.user!.id));
      setDeleteDialog({ open: false, user: null });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <DataTable
        components={dataTableUI}
        data={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        emptyText="暂无用户"
        searchActiveEmptyText="未找到匹配的用户"
        header={{
          title: '用户管理',
          searchPlaceholder: '搜索用户名或邮箱...',
          searchValue: searchTerm,
          onSearchChange: setSearchTerm,
          components: {
            Input,
            Button,
          },
        }}
        pagination={{
          currentPage,
          pageSize,
          total: users.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
          pageSizeOptions: [10, 20, 50],
          showPageSizeSelector: true,
          showTotal: true,
          components: {
            Button,
            Select,
            SelectTrigger,
            SelectContent,
            SelectItem,
            SelectValue,
          },
        }}
        actions={{
          title: '操作',
          mode: 'collapsed',
          items: [
            {
              label: '编辑',
              onClick: (user) => console.log('编辑用户:', user),
            },
            { separator: true },
            {
              label: '删除',
              onClick: handleDelete,
              className: 'text-destructive focus:text-destructive',
            },
          ],
        }}
      />

      <DeleteConfirmDialog
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
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title="确认删除用户"
        description={`确定要删除用户 "${deleteDialog.user?.name}" 吗？此操作无法撤销。`}
        onConfirm={confirmDelete}
        confirmText="确认删除"
        cancelText="取消"
        verification={
          deleteDialog.user
            ? {
                targetValue: String(deleteDialog.user.id),
                label: `请输入用户 ID (${deleteDialog.user.id}) 以确认`,
                placeholder: '输入用户 ID',
              }
            : undefined
        }
      />
    </div>
  );
}

/**
 * 优势总结：
 *
 * 1. ✅ UI 组件由业务项目提供，可以随时修改
 * 2. ✅ 不会与 shadcn/ui 版本冲突
 * 3. ✅ 完整的 TypeScript 类型支持
 * 4. ✅ 零额外依赖，只打包业务逻辑
 * 5. ✅ 符合 shadcn/ui 的设计理念
 */
