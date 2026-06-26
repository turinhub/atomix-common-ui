# Auth Components

`AuthPageShell`、`AuthPanel`、`AuthLoginPanel` 和 `AuthRegisterPanel`
提供一套可组合的认证界面。组件只负责 UI、表单状态、轻量校验和验证码倒计时；登录、注册、Token、跳转和提示消息由业务侧回调处理。

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
插槽。

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
  overlay={<div className="absolute inset-0 z-10 bg-black/35" />}
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
