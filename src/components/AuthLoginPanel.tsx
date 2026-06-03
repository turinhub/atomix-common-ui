import {
  ArrowRight,
  Layers3,
  Loader2,
  LockKeyhole,
  MessageCircle,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { cn } from '../lib/utils';
import type {
  ButtonComponent,
  InputComponent,
  LabelComponent,
  TabsComponent,
  TabsContentComponent,
  TabsListComponent,
  TabsTriggerComponent,
} from '../types/component-types';

export type AuthLoginMethod = 'password' | 'sms';
export type AuthValidationResult = string | undefined | null;

export interface AuthUIComponents {
  Button: ButtonComponent;
  Input: InputComponent;
  Label: LabelComponent;
  Tabs: TabsComponent;
  TabsList: TabsListComponent;
  TabsTrigger: TabsTriggerComponent;
  TabsContent: TabsContentComponent;
}

export interface AuthSocialProvider {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => Promise<void> | void;
}

export interface AuthSmsCodeResult {
  smsId?: string;
  smsType?: string;
}

export interface AuthPasswordLoginPayload {
  username: string;
  password: string;
}

export interface AuthSmsLoginPayload {
  phone: string;
  code: string;
  smsId?: string;
  smsType?: string;
}

export interface AuthLoginPanelProps {
  components?: AuthUIComponents;
  title?: ReactNode;
  description?: ReactNode;
  brandIcon?: ReactNode;
  defaultMethod?: AuthLoginMethod;
  enabledMethods?: AuthLoginMethod[];
  error?: ReactNode;
  extraActions?: ReactNode;
  footer?: ReactNode;
  socialProviders?: AuthSocialProvider[];
  className?: string;
  smsCountdownSeconds?: number;
  validatePhone?: (phone: string) => AuthValidationResult;
  validatePassword?: (payload: AuthPasswordLoginPayload) => AuthValidationResult;
  onPasswordLogin?: (payload: AuthPasswordLoginPayload) => Promise<void> | void;
  onSendSmsCode?: (
    phone: string
  ) => Promise<AuthSmsCodeResult | void> | AuthSmsCodeResult | void;
  onSmsLogin?: (payload: AuthSmsLoginPayload) => Promise<void> | void;
}

const defaultValidatePhone = (phone: string) =>
  /^1[3-9]\d{9}$/.test(phone) ? undefined : '请输入正确的手机号';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
};

const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 11);

const formatPhone = (phone: string) => {
  if (phone.length <= 3) return phone;
  if (phone.length <= 7) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
  return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
};

export function AuthLoginPanel({
  components,
  title = '欢迎登录',
  description = '使用账号密码或手机号验证码进入系统',
  brandIcon,
  defaultMethod = 'password',
  enabledMethods = ['password', 'sms'],
  error,
  extraActions,
  footer,
  socialProviders,
  className,
  smsCountdownSeconds = 60,
  validatePhone = defaultValidatePhone,
  validatePassword,
  onPasswordLogin,
  onSendSmsCode,
  onSmsLogin,
}: AuthLoginPanelProps) {
  const [activeMethod, setActiveMethod] = useState<AuthLoginMethod>(
    enabledMethods.includes(defaultMethod) ? defaultMethod : enabledMethods[0]
  );
  const [phone, setPhone] = useState('');
  const [smsId, setSmsId] = useState<string | undefined>();
  const [smsType, setSmsType] = useState<string | undefined>();
  const [localError, setLocalError] = useState<ReactNode>();
  const [passwordPending, setPasswordPending] = useState(false);
  const [smsPending, setSmsPending] = useState(false);
  const [codePending, setCodePending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const methods = useMemo(
    () =>
      enabledMethods.filter(
        (method, index, array) => array.indexOf(method) === index
      ),
    [enabledMethods]
  );
  const shouldShowTabs = methods.length > 1;
  const displayedError = localError || error;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const { Button, Input, Label, Tabs, TabsList, TabsTrigger, TabsContent } =
    components;

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get('username') || '').trim(),
      password: String(formData.get('password') || ''),
    };

    const validationError =
      !payload.username || !payload.password
        ? '请输入账号和密码'
        : validatePassword?.(payload);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      setPasswordPending(true);
      setLocalError(undefined);
      await onPasswordLogin?.(payload);
    } catch (err) {
      setLocalError(getErrorMessage(err, '登录失败，请稍后重试'));
    } finally {
      setPasswordPending(false);
    }
  };

  const handleSendCode = async () => {
    const validationError = validatePhone(phone);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      setCodePending(true);
      setLocalError(undefined);
      const result = await onSendSmsCode?.(phone);
      setSmsId(result?.smsId);
      setSmsType(result?.smsType);
      setCountdown(smsCountdownSeconds);
    } catch (err) {
      setLocalError(getErrorMessage(err, '发送验证码失败，请稍后重试'));
    } finally {
      setCodePending(false);
    }
  };

  const handleSmsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') || '').trim();
    const validationError = validatePhone(phone);

    if (validationError) {
      setLocalError(validationError);
      return;
    }
    if (!code) {
      setLocalError('请输入验证码');
      return;
    }

    try {
      setSmsPending(true);
      setLocalError(undefined);
      await onSmsLogin?.({ phone, code, smsId, smsType });
    } catch (err) {
      setLocalError(getErrorMessage(err, '验证码错误或已过期'));
    } finally {
      setSmsPending(false);
    }
  };

  const renderHeader = () => (
    <div className="mb-7">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        {brandIcon || <Layers3 className="h-5 w-5" />}
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );

  const renderSocialProviders = () =>
    socialProviders?.length ? (
      <div className="mb-6 grid gap-2">
        {socialProviders.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            className="h-10 w-full"
            disabled={provider.disabled}
            onClick={provider.onClick}
          >
            {provider.icon && (
              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                {provider.icon}
              </span>
            )}
            {provider.label}
          </Button>
        ))}
      </div>
    ) : null;

  const renderPasswordForm = () => (
    <form className="flex flex-col" onSubmit={handlePasswordSubmit}>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="auth-username">用户名</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="auth-username"
              name="username"
              className="bg-background/80 pl-9 backdrop-blur"
              placeholder="请输入用户名"
              autoComplete="username"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-password">密码</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="auth-password"
              name="password"
              className="bg-background/80 pl-9 backdrop-blur"
              type="password"
              placeholder="请输入密码"
              autoComplete="current-password"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="mt-4 h-11 w-full"
          disabled={passwordPending}
        >
          {passwordPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              登录中...
            </>
          ) : (
            <>
              登录
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderSmsForm = () => (
    <form className="flex flex-col" onSubmit={handleSmsSubmit}>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="auth-phone">手机号</Label>
          <div className="flex gap-2">
            <div className="relative w-full">
              <MessageCircle className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-phone"
                name="phone"
                className="bg-background/80 pl-9 backdrop-blur"
                placeholder="请输入手机号"
                value={formatPhone(phone)}
                onChange={(event) => setPhone(normalizePhone(event.target.value))}
                required
                maxLength={13}
                inputMode="numeric"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-28 shrink-0 bg-background/70 backdrop-blur hover:bg-background/90"
              onClick={handleSendCode}
              disabled={!phone || codePending || countdown > 0}
            >
              {codePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : countdown > 0 ? (
                `${countdown}秒`
              ) : (
                '发送验证码'
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-code">验证码</Label>
          <Input
            id="auth-code"
            name="code"
            className="bg-background/80 backdrop-blur"
            placeholder="请输入验证码"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
        </div>
        <Button type="submit" className="mt-4 h-11 w-full" disabled={smsPending}>
          {smsPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              验证中...
            </>
          ) : (
            <>
              验证并登录
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderForms = () => {
    if (!shouldShowTabs) {
      return methods[0] === 'sms' ? renderSmsForm() : renderPasswordForm();
    }

    return (
      <Tabs
        value={activeMethod}
        onValueChange={(value) => setActiveMethod(value as AuthLoginMethod)}
        className="w-full"
      >
        <TabsList className="mb-6 grid h-11 w-full grid-cols-2 bg-background/60 backdrop-blur">
          {methods.includes('password') && (
            <TabsTrigger value="password">账号密码登录</TabsTrigger>
          )}
          {methods.includes('sms') && (
            <TabsTrigger value="sms">手机号登录</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="password">{renderPasswordForm()}</TabsContent>
        <TabsContent value="sms">{renderSmsForm()}</TabsContent>
      </Tabs>
    );
  };

  return (
    <div
      className={cn(
        'w-full max-w-[calc(100vw-2rem)] rounded-lg border border-white/45 bg-background/60 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 md:p-8',
        className
      )}
    >
      {renderHeader()}
      {renderSocialProviders()}
      {renderForms()}
      {extraActions && <div className="mt-5">{extraActions}</div>}
      {displayedError && (
        <div className="mt-4 border-l-2 border-red-600 px-4 text-sm text-red-600 dark:border-red-400 dark:text-red-400">
          {displayedError}
        </div>
      )}
      {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
