# Auth Components

`AuthPageShell`、`AuthPanel`、`AuthLoginPanel` 和 `AuthRegisterPanel`
提供一套可组合的认证界面。组件只负责 UI、表单状态、轻量校验和验证码倒计时；登录、注册、Token、跳转和提示消息由业务侧回调处理。

认证组件默认使用 `background`、`foreground`、`primary`、`muted`、`border`
等语义 token，不固化业务品牌色。消费方可通过现有 `className`、视觉插槽和
`brandIcon` 建立自己的产品识别。

## UI Adapter

```tsx
import {
  AuthPanel,
  type AuthUIComponents,
} from '@turinhub/atomix-common-ui/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const authUI: AuthUIComponents = {
  Button,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
};
```

## Login Panel

```tsx
import { AuthLoginPanel } from '@turinhub/atomix-common-ui/auth';

<AuthLoginPanel
  components={authUI}
  title="欢迎登录 Tale"
  description="进入资源、任务与权限管理工作台"
  onPasswordLogin={async ({ username, password }) => {
    await loginWithUsernamePassword(username, password);
  }}
  onSendSmsCode={async (phone) => {
    const result = await requestSmsLoginCode(phone);
    return { smsId: result.smsId, smsType: result.type };
  }}
  onSmsLogin={async ({ code, smsId, smsType }) => {
    await verifySmsCode(smsId!, code, smsType);
  }}
/>;
```

登录和注册表单会为每个实例生成独立控件 ID。校验失败时，错误会显示在对应字段附近，
通过 `aria-describedby` 与输入框关联，并把焦点移到第一个需要修正的字段。异步错误仍在
表单级错误区域展示并通过 `aria-live` 播报。用户名、密码、手机号和验证码输入框使用
相同尺寸与占位的 Lucide 前缀图标，切换登录方式时不会改变文本起始位置。

## Register Panel

```tsx
import { AuthRegisterPanel } from '@turinhub/atomix-common-ui/auth';

<AuthRegisterPanel
  components={authUI}
  requireTermsAccepted
  termsLabel={<span>我已阅读并同意服务条款</span>}
  onSendSmsCode={async (phone) => {
    const result = await requestRegisterSmsCode(phone);
    return { smsId: result.smsId, smsType: result.type };
  }}
  onRegister={async ({ username, password, phone, code, smsId, smsType }) => {
    await registerUser({ username, password, phone, code, smsId, smsType });
  }}
/>;
```

## Visual Carousel

`AuthVisualCarousel` 是一个通用认证页背景轮播组件。它使用普通 `img`
渲染图片，不依赖 Next.js，可以直接放进 `AuthPageShell` 的 `visual`
插槽。轮播使用语义 token 生成内容遮罩，自动播放时提供暂停按钮；鼠标悬停、键盘焦点
进入或系统开启 `prefers-reduced-motion` 时会暂停自动切换。窄屏下默认隐藏背景说明文字，
避免与前景认证面板争抢阅读空间，轮播控制仍然保留。

```tsx
import {
  AuthPageShell,
  AuthPanel,
  AuthVisualCarousel,
} from '@turinhub/atomix-common-ui/auth';

const carouselItems = [
  {
    image: '/auth-carousel/assets-workspace.png',
    alt: '内容资产管理工作台界面',
    eyebrow: 'Tale Workspace',
    title: '统一管理内容资产',
    description: '把文档、媒体与业务文件放进清晰的资源空间。',
  },
  {
    image: '/auth-carousel/permissions-workspace.png',
    alt: '权限协作与角色管理界面',
    eyebrow: 'Access Control',
    title: '精细化权限协作',
    description: '用角色、权限和访问策略保护关键数据。',
  },
];

<AuthPageShell
  visual={<AuthVisualCarousel items={carouselItems} intervalMs={5000} />}
>
  <AuthPanel components={authUI} />
</AuthPageShell>;
```

## Page Shell

```tsx
import { AuthPageShell, AuthPanel } from '@turinhub/atomix-common-ui/auth';

<AuthPageShell
  visual={<ProductCarousel />}
  overlay={<div className="absolute inset-0 z-10 bg-background/25" />}
>
  <AuthPanel
    components={authUI}
    loginProps={{
      title: '欢迎登录 Tale',
      onPasswordLogin: handlePasswordLogin,
      onSendSmsCode: handleSendLoginCode,
      onSmsLogin: handleSmsLogin,
    }}
    registerProps={{
      title: '创建 Tale 账号',
      requireTermsAccepted: true,
      onSendSmsCode: handleSendRegisterCode,
      onRegister: handleRegister,
    }}
  />
</AuthPageShell>;
```

`AuthPageShell` 使用动态视口高度并包含安全区 padding，内容高于视口时允许纵向滚动。
未传入 `overlay` 时，组件使用不接收鼠标事件的默认视觉遮罩，因此背景轮播控件仍可操作。
传入 `overlay` 后，节点会保持原有 DOM、鼠标、触控、键盘和辅助技术行为；需要覆盖视觉内容时，
由该节点自行设置 `absolute inset-0 z-10`。纯视觉遮罩应优先使用默认实现。

## Tale-style Boundary

业务项目应在回调中处理认证结果：

```tsx
<AuthLoginPanel
  components={authUI}
  onPasswordLogin={async ({ username, password }) => {
    const response = await loginWithUsernamePassword(username, password);
    setUser(response.user);
    setToken(response.token);
    window.location.href = redirectPath;
  }}
/>
```

组件不会读取路由、写 Cookie、调用 Tale SDK、触发 toast，或假设任何认证存储方案。
