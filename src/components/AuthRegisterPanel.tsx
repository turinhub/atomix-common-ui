import {
  ArrowRight,
  Layers3,
  Loader2,
  LockKeyhole,
  MessageCircle,
  UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { cn } from '../lib/utils';

import type {
  AuthSmsCodeResult,
  AuthSocialProvider,
  AuthUIComponents,
  AuthValidationResult,
} from './AuthLoginPanel';

export interface AuthRegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  code: string;
  smsId?: string;
  smsType?: string;
  termsAccepted: boolean;
}

export interface AuthRegisterPanelProps {
  components?: AuthUIComponents;
  title?: ReactNode;
  description?: ReactNode;
  brandIcon?: ReactNode;
  requirePhoneVerification?: boolean;
  requireTermsAccepted?: boolean;
  termsLabel?: ReactNode;
  error?: ReactNode;
  extraActions?: ReactNode;
  footer?: ReactNode;
  socialProviders?: AuthSocialProvider[];
  className?: string;
  smsCountdownSeconds?: number;
  validatePhone?: (phone: string) => AuthValidationResult;
  validatePassword?: (payload: AuthRegisterPayload) => AuthValidationResult;
  validateRegister?: (payload: AuthRegisterPayload) => AuthValidationResult;
  onSendSmsCode?: (
    phone: string
  ) => Promise<AuthSmsCodeResult | void> | AuthSmsCodeResult | void;
  onRegister?: (payload: AuthRegisterPayload) => Promise<void> | void;
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

export function AuthRegisterPanel({
  components,
  title = '创建账号',
  description = '填写账号信息并完成手机号验证',
  brandIcon,
  requirePhoneVerification = true,
  requireTermsAccepted = false,
  termsLabel = '我已阅读并同意服务条款',
  error,
  extraActions,
  footer,
  socialProviders,
  className,
  smsCountdownSeconds = 60,
  validatePhone = defaultValidatePhone,
  validatePassword,
  validateRegister,
  onSendSmsCode,
  onRegister,
}: AuthRegisterPanelProps) {
  const [phone, setPhone] = useState('');
  const [smsId, setSmsId] = useState<string | undefined>();
  const [smsType, setSmsType] = useState<string | undefined>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState<ReactNode>();
  const [registerPending, setRegisterPending] = useState(false);
  const [codePending, setCodePending] = useState(false);
  const [countdown, setCountdown] = useState(0);
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

  const { Button, Input, Label } = components;

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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: AuthRegisterPayload = {
      username: String(formData.get('username') || '').trim(),
      password: String(formData.get('password') || ''),
      confirmPassword: String(formData.get('confirmPassword') || ''),
      phone,
      code: String(formData.get('code') || '').trim(),
      smsId,
      smsType,
      termsAccepted,
    };

    const validationError =
      (!payload.username && '请输入用户名') ||
      (!payload.password && '请输入密码') ||
      (payload.password !== payload.confirmPassword && '两次输入的密码不一致') ||
      (requirePhoneVerification && validatePhone(phone)) ||
      (requirePhoneVerification && !payload.code && '请输入验证码') ||
      (requireTermsAccepted && !termsAccepted && '请先同意服务条款') ||
      validatePassword?.(payload) ||
      validateRegister?.(payload);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      setRegisterPending(true);
      setLocalError(undefined);
      await onRegister?.(payload);
    } catch (err) {
      setLocalError(getErrorMessage(err, '注册失败，请稍后重试'));
    } finally {
      setRegisterPending(false);
    }
  };

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

  return (
    <div
      className={cn(
        'w-full max-w-[calc(100vw-2rem)] rounded-lg border border-white/45 bg-background/60 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 md:p-8',
        className
      )}
    >
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

      {renderSocialProviders()}

      <form className="flex flex-col" onSubmit={handleRegister}>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="auth-register-username">用户名</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-register-username"
                name="username"
                className="bg-background/80 pl-9 backdrop-blur"
                placeholder="请输入用户名"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-register-password">密码</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-register-password"
                name="password"
                className="bg-background/80 pl-9 backdrop-blur"
                type="password"
                placeholder="请输入密码"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-register-confirm-password">确认密码</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-register-confirm-password"
                name="confirmPassword"
                className="bg-background/80 pl-9 backdrop-blur"
                type="password"
                placeholder="请再次输入密码"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {requirePhoneVerification && (
            <>
              <div className="space-y-2">
                <Label htmlFor="auth-register-phone">手机号</Label>
                <div className="flex gap-2">
                  <div className="relative w-full">
                    <MessageCircle className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="auth-register-phone"
                      name="phone"
                      className="bg-background/80 pl-9 backdrop-blur"
                      placeholder="请输入手机号"
                      value={formatPhone(phone)}
                      onChange={(event) =>
                        setPhone(normalizePhone(event.target.value))
                      }
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
                <Label htmlFor="auth-register-code">验证码</Label>
                <Input
                  id="auth-register-code"
                  name="code"
                  className="bg-background/80 backdrop-blur"
                  placeholder="请输入验证码"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            </>
          )}

          {requireTermsAccepted && (
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
              <span>{termsLabel}</span>
            </label>
          )}

          <Button
            type="submit"
            className="mt-4 h-11 w-full"
            disabled={registerPending}
          >
            {registerPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </>
            ) : (
              <>
                创建账号
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

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
