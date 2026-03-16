# Agent 初始化说明

## 项目概览

- 项目名称：`@turinhub/atomix-common-ui`
- 项目类型：React 组件库（TypeScript + Vite）
- 项目目标：提供可复用的通用 UI 组件

## 技术栈

- React 18/19（Peer 兼容），TypeScript 5、Vite 6
- 本地类型开发默认使用 `@types/react@19` 与 `@types/react-dom@19`
- Tailwind CSS 3、Radix UI、shadcn/ui
- lucide-react、Vitest + Testing Library
- ESLint 9 + Prettier 3

## 目录约定

- `src/components`：业务与通用组件
- `src/components/ui`：基础 UI 原子组件
- `src/components/__tests__`：组件测试
- `src/test`：测试初始化与全局测试配置
- `src/lib`：工具函数
- `src/types`：类型定义
- `playground`：本地演示入口

## 常用命令

- 安装依赖：`pnpm install`
- 构建产物：`pnpm build`
- 类型检查：`pnpm typecheck`
- 代码检查：`pnpm lint`
- 测试（watch）：`pnpm test`
- 单元测试：`pnpm test:run`
- 覆盖率测试：`pnpm test:coverage`
- 启动演示：`pnpm playground:dev`

## 开发规范

- 保持现有组件 API 稳定，避免破坏性变更
- 新增组件需补充测试用例
- 提交前执行：`pnpm lint`、`pnpm typecheck`、`pnpm test:run`
- 样式沿用 Tailwind 与现有 UI 组件模式，统一使用 `cn` 合并类名
- 保持 Radix 相关交互的可访问性语义与键盘交互能力

## 组件与图标约定

- 基础组件统一放在 `src/components/ui`，并通过官方方式引入 shadcn/ui
- 已接入的 UI 原子组件默认不做私有改造，优先通过组合封装扩展
- 业务组件通过 `components` prop 注入 UI 组件，避免库内硬编码
- 注入组件缺失时需明确报错，避免静默失败
- 默认图标使用 `lucide-react`，同时支持按需覆盖，自定义优先、默认兜底
- 图标通过 `className` 控制尺寸和颜色，保证可读性与可点击性
