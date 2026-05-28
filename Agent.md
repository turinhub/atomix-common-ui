# Agent Markdown

## 你需要先知道

- 项目：`@turinhub/atomix-common-ui`
- 类型：React 组件库，使用 TypeScript、Vite、Tailwind CSS、Radix UI、shadcn/ui 组件注入模式
- 核心目标：沉淀可复用业务组件，同时不把业务项目自己的 shadcn/ui 源码打包进库里
- 默认工作原则：保持公开 API 稳定，沿用现有组件注入、类型导出、测试组织和样式写法

## 快速工作流

1. 先确认改动范围，优先阅读相关组件、测试和类型导出。
2. 改组件时同步检查 `src/index.ts` 的导出、`src/types/component-types.ts` 的注入类型，以及对应 `src/components/__tests__` 测试。
3. 改公开用法或组件 API 时，同步更新 `README.md`、`USAGE.md` 或 `docs/` 下的用户文档。
4. 提交前按风险选择验证命令，常规改动优先执行：

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

## 主要目录

- `src/components`：业务组件与导出的组件实现
- `src/components/ui`：项目内用于开发和测试的 shadcn/ui 基础组件
- `src/components/__tests__`：组件测试
- `src/types/component-types.ts`：可注入 UI 组件的通用类型
- `src/index.ts`：组件、类型和工具函数的包入口
- `playground`：本地演示与调试入口
- `docs/components`：面向使用者的组件文档
- `docs/agent`：Agent 按需加载的项目工作文档

## 必守约定

- 组件保持组件注入模式，业务组件通过 `components` prop 接收 UI 组件。
- 缺少必需注入组件时要明确报错或保持现有错误提示风格，不做静默失败。
- 样式沿用 Tailwind 和现有 shadcn/ui 组合方式，类名合并使用 `cn`。
- 默认图标使用 `lucide-react`；如已有可覆盖入口，保留自定义优先、默认兜底。
- Radix 相关交互要保留可访问性语义和键盘交互。
- 新增或调整组件能力时补测试；修 bug 时优先补能复现问题的测试。
- 避免把依赖打进库产物；新增运行时依赖时检查 `peerDependencies`、`devDependencies` 和 Vite external 配置。

## 需要时加载

- 项目结构、命令、依赖、构建发布细节：`docs/agent/PROJECT.md`
- 组件注入、组件开发步骤、测试策略：`docs/agent/COMPONENT_GUIDE.md`
- PDF 组件专项说明与常见风险：`docs/agent/PDF_COMPONENTS.md`
- 公开使用文档来源：`README.md`、`USAGE.md`、`docs/components/PDFReader.md`、`docs/components/SimplePDFReader.md`

## 常见任务入口

- 新增组件：先看 `docs/agent/COMPONENT_GUIDE.md`，再参考 `DataTable` 或 `ThemeSwitcherContent` 的导出和测试方式。
- 修改 DataTable、TableHeader、TablePagination、DeleteConfirmDialog、ThemeSwitcher：先看对应组件和测试，再看 `docs/agent/COMPONENT_GUIDE.md`。
- 修改 PDFReader、SimplePDFReader、PDFSidebar：先看 `docs/agent/PDF_COMPONENTS.md`，再看用户文档和测试。
- 修改构建、依赖、发布字段：先看 `docs/agent/PROJECT.md`，再检查 `package.json`、`vite.config.ts`、`tsconfig.json`。
