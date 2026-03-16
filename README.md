# @turinhub/atomix-common-ui

[![npm version](https://badge.fury.io/js/%40turinhub%2Fatomix-common-ui.svg)](https://www.npmjs.com/package/@turinhub/atomix-common-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 基于 shadcn/ui 的业务组件库 - 保持最大灵活性

## 🎯 设计理念

这个包采用 **组件注入** 模式，而不是传统的全打包模式：

- ✅ **保留 shadcn/ui 的灵活性**：UI 组件源码在你的项目中，随时可以修改
- ✅ **避免版本冲突**：不会与你自己安装的 shadcn/ui 冲突
- ✅ **类型安全**：完整的 TypeScript 类型支持
- ✅ **零额外依赖**：只打包业务逻辑

## ✨ 特性

- 📦 **开箱即用** - 提供常用的业务组件，无需从零开始
- 🎨 **美观设计** - 基于 shadcn/ui，遵循现代设计规范
- 🔧 **完全可定制** - UI 组件注入模式，保持最大灵活性
- 📝 **类型安全** - 完整的 TypeScript 类型定义
- 🧪 **测试覆盖** - 使用 Vitest + Testing Library，确保代码质量
- 📚 **详细文档** - 完整的使用文档和示例
- 🔌 **零额外依赖** - 只打包业务逻辑，UI 组件由项目提供

## 📦 安装

**环境要求：**
- Node.js >= 18
- React >= 18.0.0 || >= 19.0.0
- pnpm (推荐) 或 npm/yarn

```bash
pnpm add @turinhub/atomix-common-ui
```

## 🔗 快速链接

- 📖 [完整使用文档](./USAGE.md)
- 📦 [npm 包](https://www.npmjs.com/package/@turinhub/atomix-common-ui)
- 🎨 基于 [shadcn/ui](https://ui.shadcn.com/)
- 🐛 [问题反馈](https://github.com/turinhub/atomix-common-ui/issues)

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
import {
  TableHeader as DataTableHeader,
  TablePagination as DataTablePagination,
} from '@turinhub/atomix-common-ui';
// ... 其他 UI 组件

import type { UIComponents } from '@turinhub/atomix-common-ui';

export const dataTableUI: UIComponents = {
  Card,
  CardContent,
  CardFooter,
  Button,
  TableHeaderComponent: DataTableHeader,
  TablePaginationComponent: DataTablePagination,
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

## 📁 项目结构

```
atomix-common-ui/
├── src/
│   ├── components/          # 业务组件
│   │   ├── DataTable.tsx           # 数据表格组件
│   │   ├── DeleteConfirmDialog.tsx # 删除确认对话框
│   │   ├── TableHeader.tsx         # 表格头部
│   │   ├── TablePagination.tsx     # 分页组件
│   │   ├── ui/                     # shadcn/ui 组件类型定义
│   │   └── __tests__/              # 组件测试
│   ├── types/              # TypeScript 类型定义
│   │   └── component-types.ts      # UI 组件类型
│   ├── lib/                # 工具函数
│   │   └── utils.ts                # cn 工具函数
│   ├── index.ts            # 主入口文件
│   └── test/               # 测试配置
│       └── setup.ts                # 测试环境设置
├── playground/             # 开发调试环境
├── dist/                   # 构建输出
├── README.md               # 项目说明
└── USAGE.md                # 使用文档
```

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

## 🔷 TypeScript 支持

本项目完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type {
  Column,
  DataTableProps,
  UIComponents,
  DeleteConfirmDialogProps,
  DialogUIComponents,
  TableHeaderProps,
  HeaderUIComponents,
  TablePaginationProps,
  PaginationUIComponents,
} from '@turinhub/atomix-common-ui';
```

所有组件都有严格的类型检查，确保使用时的类型安全。

## 🧪 测试

本项目使用 Vitest 和 Testing Library 进行单元测试和集成测试。

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 以 UI 模式运行测试
pnpm test:ui

# 运行测试（不监听文件变化）
pnpm test:run
```

测试文件位于 `src/components/__tests__/` 目录下。

## 🎮 Playground

Playground 是一个本地开发环境，用于调试和预览组件。

```bash
# 启动开发服务器
pnpm playground:dev

# 构建 playground
pnpm playground:build

# 预览构建后的 playground
pnpm playground:preview
```

Playground 源码位于 `playground/` 目录，你可以随意修改来测试组件。

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 监听模式构建
pnpm dev

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 格式化代码
pnpm format

# 检查代码格式
pnpm format:check
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

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置的代码风格
- 为新功能添加测试
- 更新相关文档

## 🌐 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

由于使用 React 18+，不支持 Internet Explorer。

## 🐛 问题反馈

如果你发现 bug 或有功能建议，请：

1. 查看现有的 [Issues](https://github.com/turinhub/atomix-common-ui/issues)
2. 如果问题不存在，创建新的 Issue
3. 提供详细的复现步骤和环境信息

## 📮 联系方式

- 作者: TurinHub
- Email: support@turinhub.com

## 📄 License

MIT
