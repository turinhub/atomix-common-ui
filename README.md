# @turinhub/atomix-common-ui

> 基于 shadcn/ui 的业务组件库 - 保持最大灵活性

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

## 🔗 快速链接

- 📖 [完整使用文档](./USAGE.md)
- 🎨 基于 [shadcn/ui](https://ui.shadcn.com/)

## 📋 前置要求

你需要自己在项目中安装 shadcn/ui 的 UI 组件：

```bash
# 如果你还没有 shadcn/ui
npx shadcn-ui@latest init

# 安装需要的 UI 组件
npx shadcn-ui@latest add button card dialog input label select table skeleton dropdown-menu
```

## 🚀 快速开始

### 1. 创建 UI 组件适配器

```typescript
// src/lib/ui-adapter.ts
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// ... 其他 UI 组件

import type { UIComponents } from '@turinhub/atomix-common-ui';

export const dataTableUI: UIComponents = {
  Card,
  CardContent,
  CardFooter,
  Button,
  // ... 其他 UI 组件
};
```

### 2. 使用 DataTable 组件

```typescript
import { DataTable } from '@turinhub/atomix-common-ui';
import { dataTableUI } from '@/lib/ui-adapter';

<DataTable
  components={dataTableUI}
  data={users}
  columns={columns}
  rowKey="id"
/>
```

## 📚 组件列表

- **DataTable** - 功能强大的数据表格组件
- **DeleteConfirmDialog** - 删除确认对话框
- **TableHeader** - 表格头部（支持搜索和操作按钮）
- **TablePagination** - 分页组件

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 监听模式
pnpm dev

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 格式化代码
pnpm format
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
