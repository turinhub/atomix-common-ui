# Component Guide For Agents

## 组件注入模式

本项目的业务组件不直接绑定消费端 UI 源码。组件应通过 `components` prop 接收 shadcn/ui 或兼容组件，库内只负责业务结构、状态、回调和默认展示逻辑。

实现时优先遵循这些规则：

- 必需 UI 组件写入对应组件的 `*UIComponents` 接口。
- 跨组件复用的基础 UI 类型放在 `src/types/component-types.ts`。
- 组件内部解构注入项后再渲染，保持当前代码风格。
- 缺少 `components` 或缺少关键组件时，给出明确错误状态。
- 不要在业务组件里 import `src/components/ui/*` 作为真实运行依赖。

## 新增组件步骤

1. 在 `src/components` 新增组件文件。
2. 定义 `Props` 和 `*UIComponents` 类型；可复用注入类型从 `src/types/component-types.ts` 引入。
3. 通过 `components` prop 接收 UI 原子组件。
4. 新增组件级 kebab-case 入口并在 `package.json` 的 `exports` 中暴露子路径。
5. 在 `src/components/__tests__` 增加测试。
6. 如面向用户公开，更新 `README.md`、`USAGE.md` 或 `docs/`。
7. 如需要 playground 手动验证，更新 `playground/App.tsx`。

## 修改现有组件时关注点

- `DataTable`：关注列渲染、行 key、loading、empty state、header、pagination、actions 展开/折叠两种模式。
- `TableHeader`：关注搜索输入、操作按钮、自定义渲染和注入类型。
- `TablePagination`：关注页码边界、page size、禁用状态、Select 注入。
- `DeleteConfirmDialog`：关注 open 状态、确认回调、验证输入、loading 状态。
- `ThemeSwitcher`：关注 SSR handling、当前主题图标、自定义主题图标、DropdownMenu 注入。
- `ThemeSwitcherContent`：关注轻量嵌入场景，不要引入完整下拉触发逻辑。
- `FileUpload`：关注文件校验、拖拽选择、单/多文件状态、进度回调、失败重试和业务上传函数注入。
- `PDFReader`、`SimplePDFReader`、`PDFSidebar`：见 `docs/agent/PDF_COMPONENTS.md`。

## 类型和导出

公开类型应从实现文件或 `src/types/component-types.ts` 导出。组件专属类型从对应组件子路径转导出；通用注入组件类型从根入口和 `component-types` 子路径导出。新增类型时检查：

- 类型名是否与现有命名风格一致。
- 是否需要作为用户配置的一部分公开。
- 是否会泄漏内部实现细节。
- 是否兼容 React 18/19 的类型约束。

## 样式约定

- 样式使用 Tailwind class。
- 条件类名和类名合并使用 `cn`。
- 注入组件的外观由消费端控制，业务组件只提供必要布局和状态类名。
- 图标默认使用 `lucide-react`，并通过 `className` 控制尺寸、颜色和可点击区域。
- 不随意改变组件 DOM 结构，尤其是测试或消费端可能依赖的结构。

## 测试策略

测试优先验证用户可观察行为：

- 渲染主要内容。
- 回调是否被正确调用。
- loading、empty、disabled、controlled/uncontrolled 状态。
- 注入组件缺失或配置不足时的错误展示。
- 交互组件的键盘/点击行为。

新增测试放在 `src/components/__tests__`。测试工具以 Vitest 和 Testing Library 为主，避免测试实现细节。

## 文档同步

- API 或用法变动：更新 `USAGE.md`。
- README 组件列表、快速开始或设计理念变动：更新 `README.md`。
- PDF 专项用法：更新 `docs/components/PDFReader.md` 或 `docs/components/SimplePDFReader.md`。
- Agent 工作流程变动：更新 `Agent.md` 或 `docs/agent`。

公开文档面向用户，`docs/agent` 面向 Agent。不要把内部工作说明写进 README。
