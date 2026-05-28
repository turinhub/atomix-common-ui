# Project Notes For Agents

## 项目定位

`@turinhub/atomix-common-ui` 是面向 TurinHub 项目的 React 业务组件库。库本身提供业务逻辑、类型和少量通用工具，不直接拥有消费端的 shadcn/ui 源码。消费端通过 `components` prop 注入自己的 UI 原子组件。

## 技术栈

- React 18/19 peer 兼容
- TypeScript 5
- Vite 6 library mode
- Tailwind CSS 3
- Radix UI 与 shadcn/ui 风格组件
- lucide-react 图标
- Vitest、Testing Library、jsdom
- ESLint 9、Prettier 3、prettier-plugin-tailwindcss

本地类型开发默认使用 `@types/react@19` 和 `@types/react-dom@19`，但包的 peer 依赖兼容 React 18 与 19。

## 目录说明

- `src/index.ts`：包入口，所有公开组件、类型和工具都需要从这里导出。
- `src/components`：业务组件实现。
- `src/components/ui`：开发和测试用基础 UI 组件，不代表消费端必须复用这些源码。
- `src/components/__tests__`：组件测试，优先在这里补充行为覆盖。
- `src/types/component-types.ts`：可注入 UI 组件的基础类型集合。
- `src/lib/utils.ts`：通用工具，当前主要是 `cn`。
- `src/styles.css`：库样式入口。
- `playground`：本地调试和手动验证入口。
- `docs/components`：面向使用者的组件级文档。
- `docs/agent`：Agent 工作说明，按需加载。

## 常用命令

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm test
pnpm test:run
pnpm test:coverage
pnpm playground:dev
pnpm playground:build
pnpm playground:preview
```

常规代码改动建议执行 `pnpm lint`、`pnpm typecheck`、`pnpm test:run`。涉及包产物、导出、依赖或样式入口时再执行 `pnpm build`。

## 构建和导出

Vite 使用 library mode，以 `src/index.ts` 为入口，输出 ES module 和 CommonJS：

- ES module：`dist/index.js`
- CommonJS：`dist/index.c.js`
- 类型声明：`dist/index.d.ts`

`package.json` 的 `exports` 只暴露包根入口。新增公开能力时要确保：

1. 源码组件或类型已经实现。
2. `src/index.ts` 导出了组件和类型。
3. 需要用户知道的 API 已写入公开文档。
4. 构建产物不依赖未声明的外部包。

## 依赖策略

- React、Radix UI、lucide-react、react-pdf、pdfjs-dist、Tailwind 相关基础能力主要通过 peer dependency 表达。
- 如果新增运行时 import，检查它是否应该是 peer dependency，并同步检查 `vite.config.ts` 的 `rollupOptions.external`。
- 如果只用于测试、构建或 playground，优先放在 `devDependencies`。
- 不要为了单个组件引入重量级工具库，除非能明显降低复杂度并符合组件库定位。

## 文档分层

- `Agent.md`：Agent 每次进入项目时的高信号入口。
- `docs/agent/*.md`：Agent 按需加载的工作细节。
- `README.md`：包介绍、安装、快速开始和面向用户的概览。
- `USAGE.md`：面向使用者的完整用法。
- `docs/components/*.md`：具体组件的公开文档。

Agent 文档更新时，优先把稳定且每日需要的内容留在 `Agent.md`；把命令细节、组件开发步骤、历史背景、专项风险放入 `docs/agent`。

## 变更检查清单

- API 是否保持兼容，必要的破坏性变化是否有文档说明。
- 新组件或新 prop 是否有类型导出。
- 注入组件缺失时的行为是否清晰。
- 可访问性和键盘交互是否保留。
- 测试是否覆盖关键行为和边界。
- 用户文档是否与实现一致。
