import {
  ArrowRight,
  Layers3,
  Loader2,
  LockKeyhole,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import type { FormEvent, MouseEvent, ReactNode } from 'react';

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

import { AuthInputIcon } from './AuthInputIcon';

export type AuthLoginMethod = 'password' | 'sms';
export type AuthValidationResult = string | undefined | null;
type AuthLoginErrorField = 'username' | 'password' | 'phone' | 'code';

const defaultLoginMethods: AuthLoginMethod[] = ['password', 'sms'];

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
  validatePassword?: (
    payload: AuthPasswordLoginPayload
  ) => AuthValidationResult;
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
  enabledMethods = defaultLoginMethods,
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
  const id = useId();
  const [activeMethod, setActiveMethod] = useState<AuthLoginMethod>(
    enabledMethods.includes(defaultMethod)
      ? defaultMethod
      : (enabledMethods[0] ?? 'password')
  );
  const [phone, setPhone] = useState('');
  const [smsId, setSmsId] = useState<string | undefined>();
  const [smsType, setSmsType] = useState<string | undefined>();
  const [localError, setLocalError] = useState<ReactNode>();
  const [localErrorField, setLocalErrorField] = useState<AuthLoginErrorField>();
  const [passwordPending, setPasswordPending] = useState(false);
  const [smsPending, setSmsPending] = useState(false);
  const [codePending, setCodePending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const methods = useMemo<AuthLoginMethod[]>(() => {
    const uniqueMethods = enabledMethods.filter(
      (method, index, array) => array.indexOf(method) === index
    );
    return uniqueMethods.length ? uniqueMethods : ['password'];
  }, [enabledMethods]);
  const shouldShowTabs = methods.length > 1;
  const displayedFormError = localErrorField ? undefined : localError || error;
  const fieldIds = {
    username: `${id}-username`,
    password: `${id}-password`,
    phone: `${id}-phone`,
    code: `${id}-code`,
  } satisfies Record<AuthLoginErrorField, string>;
  const errorIds = {
    username: `${id}-username-error`,
    password: `${id}-password-error`,
    phone: `${id}-phone-error`,
    code: `${id}-code-error`,
  } satisfies Record<AuthLoginErrorField, string>;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!methods.includes(activeMethod)) {
      setActiveMethod(methods[0]);
    }
  }, [activeMethod, methods]);

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const { Button, Input, Label, Tabs, TabsList, TabsTrigger, TabsContent } =
    components;

  const clearLocalError = () => {
    setLocalError(undefined);
    setLocalErrorField(undefined);
  };

  const focusField = (
    form: HTMLFormElement | null,
    field: AuthLoginErrorField
  ) => {
    const element = form?.elements.namedItem(field);
    if (element instanceof HTMLElement) element.focus();
  };

  const showFieldError = (
    message: ReactNode,
    field: AuthLoginErrorField,
    form: HTMLFormElement | null
  ) => {
    setLocalError(message);
    setLocalErrorField(field);
    focusField(form, field);
  };

  const clearFieldError = (field: AuthLoginErrorField) => {
    if (localErrorField === field) clearLocalError();
  };

  const renderFieldError = (field: AuthLoginErrorField) =>
    localErrorField === field && localError ? (
      <p
        id={errorIds[field]}
        className="break-words text-sm text-destructive"
        aria-live="polite"
      >
        {localError}
      </p>
    ) : null;

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get('username') || '').trim(),
      password: String(formData.get('password') || ''),
    };

    if (!payload.username) {
      showFieldError('请输入用户名', 'username', event.currentTarget);
      return;
    }
    if (!payload.password) {
      showFieldError('请输入密码', 'password', event.currentTarget);
      return;
    }
    const validationError = validatePassword?.(payload);
    if (validationError) {
      showFieldError(validationError, 'password', event.currentTarget);
      return;
    }

    try {
      setPasswordPending(true);
      clearLocalError();
      await onPasswordLogin?.(payload);
    } catch (err) {
      setLocalError(getErrorMessage(err, '登录失败，请检查账号和密码后重试'));
      setLocalErrorField(undefined);
    } finally {
      setPasswordPending(false);
    }
  };

  const handleSendCode = async (event: MouseEvent<HTMLButtonElement>) => {
    const validationError = validatePhone(phone);
    if (validationError) {
      showFieldError(validationError, 'phone', event.currentTarget.form);
      return;
    }

    try {
      setCodePending(true);
      clearLocalError();
      const result = await onSendSmsCode?.(phone);
      setSmsId(result?.smsId);
      setSmsType(result?.smsType);
      setCountdown(smsCountdownSeconds);
    } catch (err) {
      setLocalError(getErrorMessage(err, '发送验证码失败，请稍后重试'));
      setLocalErrorField(undefined);
    } finally {
      setCodePending(false);
    }
  };

  const handleSmsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const code = String(formData.get('code') || '').trim();
    const validationError = validatePhone(phone);

    if (validationError) {
      showFieldError(validationError, 'phone', form);
      return;
    }
    if (!code) {
      showFieldError('请输入验证码', 'code', form);
      return;
    }

    try {
      setSmsPending(true);
      clearLocalError();
      await onSmsLogin?.({ phone, code, smsId, smsType });
    } catch (err) {
      showFieldError(
        getErrorMessage(err, '验证码错误或已过期，请重新输入或获取新验证码'),
        'code',
        form
      );
    } finally {
      setSmsPending(false);
    }
  };

  const renderHeader = () => (
    <div className="mb-7">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/10">
        {brandIcon || <Layers3 className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h1 className="text-balance break-words text-2xl font-semibold leading-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
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
            className="h-10 w-full touch-manipulation"
            disabled={provider.disabled}
            onClick={provider.onClick}
          >
            {provider.icon && (
              <span
                className="mr-2 inline-flex h-4 w-4 items-center justify-center"
                aria-hidden="true"
              >
                {provider.icon}
              </span>
            )}
            {provider.label}
          </Button>
        ))}
      </div>
    ) : null;

  const renderPasswordForm = () => (
    <form
      className="flex flex-col"
      onSubmit={handlePasswordSubmit}
      noValidate
      aria-busy={passwordPending}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor={fieldIds.username}>用户名</Label>
          <div className="relative">
            <AuthInputIcon>
              <UserRound className="h-4 w-4" />
            </AuthInputIcon>
            <Input
              id={fieldIds.username}
              name="username"
              className="bg-background/80 pl-9 backdrop-blur"
              placeholder="请输入用户名…"
              autoComplete="username"
              spellCheck={false}
              aria-invalid={localErrorField === 'username'}
              aria-describedby={
                localErrorField === 'username' ? errorIds.username : undefined
              }
              onChange={() => clearFieldError('username')}
              required
            />
          </div>
          {renderFieldError('username')}
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldIds.password}>密码</Label>
          <div className="relative">
            <AuthInputIcon>
              <LockKeyhole className="h-4 w-4" />
            </AuthInputIcon>
            <Input
              id={fieldIds.password}
              name="password"
              className="bg-background/80 pl-9 backdrop-blur"
              type="password"
              placeholder="请输入密码…"
              autoComplete="current-password"
              aria-invalid={localErrorField === 'password'}
              aria-describedby={
                localErrorField === 'password' ? errorIds.password : undefined
              }
              onChange={() => clearFieldError('password')}
              required
            />
          </div>
          {renderFieldError('password')}
        </div>
        <Button
          type="submit"
          className="mt-4 h-11 w-full touch-manipulation"
          disabled={passwordPending}
        >
          {passwordPending ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              登录中…
            </>
          ) : (
            <>
              登录
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );

  const renderSmsForm = () => (
    <form
      className="flex flex-col"
      onSubmit={handleSmsSubmit}
      noValidate
      aria-busy={smsPending || codePending}
    >
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor={fieldIds.phone}>手机号</Label>
          <div className="flex items-start gap-2">
            <div className="relative min-w-0 flex-1">
              <AuthInputIcon>
                <Phone className="h-4 w-4" />
              </AuthInputIcon>
              <Input
                id={fieldIds.phone}
                name="phone"
                className="bg-background/80 pl-9 backdrop-blur"
                type="tel"
                placeholder="例如：138 0013 8000…"
                value={formatPhone(phone)}
                onChange={(event) => {
                  setPhone(normalizePhone(event.target.value));
                  clearFieldError('phone');
                }}
                required
                maxLength={13}
                inputMode="numeric"
                autoComplete="tel"
                spellCheck={false}
                aria-invalid={localErrorField === 'phone'}
                aria-describedby={
                  localErrorField === 'phone' ? errorIds.phone : undefined
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-28 shrink-0 touch-manipulation bg-background/70 px-2 tabular-nums backdrop-blur hover:bg-background/90"
              onClick={handleSendCode}
              disabled={codePending || countdown > 0}
            >
              {codePending ? (
                <>
                  <Loader2
                    className="mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  发送中…
                </>
              ) : countdown > 0 ? (
                `${countdown}秒`
              ) : (
                '发送验证码'
              )}
            </Button>
          </div>
          {renderFieldError('phone')}
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldIds.code}>验证码</Label>
          <div className="relative">
            <AuthInputIcon>
              <ShieldCheck className="h-4 w-4" />
            </AuthInputIcon>
            <Input
              id={fieldIds.code}
              name="code"
              className="bg-background/80 pl-9 backdrop-blur"
              placeholder="例如：123456…"
              inputMode="numeric"
              autoComplete="one-time-code"
              spellCheck={false}
              aria-invalid={localErrorField === 'code'}
              aria-describedby={
                localErrorField === 'code' ? errorIds.code : undefined
              }
              onChange={() => clearFieldError('code')}
              required
            />
          </div>
          {renderFieldError('code')}
        </div>
        <Button
          type="submit"
          className="mt-4 h-11 w-full touch-manipulation"
          disabled={smsPending}
        >
          {smsPending ? (
            <>
              <Loader2
                className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              验证中…
            </>
          ) : (
            <>
              验证并登录
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
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
        onValueChange={(value) => {
          if (value === 'password' || value === 'sms') {
            setActiveMethod(value);
            clearLocalError();
          }
        }}
        className="w-full"
      >
        <TabsList className="mb-6 grid h-11 w-full grid-cols-2 bg-background/60 backdrop-blur">
          {methods.includes('password') && (
            <TabsTrigger value="password" className="touch-manipulation">
              账号密码登录
            </TabsTrigger>
          )}
          {methods.includes('sms') && (
            <TabsTrigger value="sms" className="touch-manipulation">
              手机号登录
            </TabsTrigger>
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
        'w-full max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background/90 p-5 shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:p-8',
        className
      )}
    >
      {renderHeader()}
      {renderSocialProviders()}
      {renderForms()}
      {extraActions && <div className="mt-5">{extraActions}</div>}
      {displayedFormError && (
        <div
          className="mt-4 break-words border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
          aria-live="polite"
        >
          {displayedFormError}
        </div>
      )}
      {footer && (
        <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
      )}
    </div>
  );
}
