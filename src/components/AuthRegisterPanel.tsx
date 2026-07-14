import {
  ArrowRight,
  Layers3,
  Loader2,
  LockKeyhole,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import type { FormEvent, MouseEvent, ReactNode } from 'react';

import { cn } from '../lib/utils';

import { AuthInputIcon } from './AuthInputIcon';
import type {
  AuthSmsCodeResult,
  AuthSocialProvider,
  AuthUIComponents,
  AuthValidationResult,
} from './AuthLoginPanel';

type AuthRegisterErrorField =
  | 'username'
  | 'password'
  | 'confirmPassword'
  | 'phone'
  | 'code'
  | 'termsAccepted';

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
  const id = useId();
  const [phone, setPhone] = useState('');
  const [smsId, setSmsId] = useState<string | undefined>();
  const [smsType, setSmsType] = useState<string | undefined>();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState<ReactNode>();
  const [localErrorField, setLocalErrorField] =
    useState<AuthRegisterErrorField>();
  const [registerPending, setRegisterPending] = useState(false);
  const [codePending, setCodePending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const displayedFormError = localErrorField ? undefined : localError || error;
  const fieldIds = {
    username: `${id}-username`,
    password: `${id}-password`,
    confirmPassword: `${id}-confirm-password`,
    phone: `${id}-phone`,
    code: `${id}-code`,
    termsAccepted: `${id}-terms`,
  } satisfies Record<AuthRegisterErrorField, string>;
  const errorIds = {
    username: `${id}-username-error`,
    password: `${id}-password-error`,
    confirmPassword: `${id}-confirm-password-error`,
    phone: `${id}-phone-error`,
    code: `${id}-code-error`,
    termsAccepted: `${id}-terms-error`,
  } satisfies Record<AuthRegisterErrorField, string>;

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

  const clearLocalError = () => {
    setLocalError(undefined);
    setLocalErrorField(undefined);
  };

  const focusField = (
    form: HTMLFormElement | null,
    field: AuthRegisterErrorField
  ) => {
    const element = form?.elements.namedItem(field);
    if (element instanceof HTMLElement) element.focus();
  };

  const showFieldError = (
    message: ReactNode,
    field: AuthRegisterErrorField,
    form: HTMLFormElement | null
  ) => {
    setLocalError(message);
    setLocalErrorField(field);
    focusField(form, field);
  };

  const clearFieldError = (field: AuthRegisterErrorField) => {
    if (localErrorField === field) clearLocalError();
  };

  const renderFieldError = (field: AuthRegisterErrorField) =>
    localErrorField === field && localError ? (
      <p
        id={errorIds[field]}
        className="break-words text-sm text-destructive"
        aria-live="polite"
      >
        {localError}
      </p>
    ) : null;

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

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
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

    if (!payload.username) {
      showFieldError('请输入用户名', 'username', form);
      return;
    }
    if (!payload.password) {
      showFieldError('请输入密码', 'password', form);
      return;
    }
    if (payload.password !== payload.confirmPassword) {
      showFieldError('两次输入的密码不一致', 'confirmPassword', form);
      return;
    }
    const phoneValidationError = requirePhoneVerification
      ? validatePhone(phone)
      : undefined;
    if (phoneValidationError) {
      showFieldError(phoneValidationError, 'phone', form);
      return;
    }
    if (requirePhoneVerification && !payload.code) {
      showFieldError('请输入验证码', 'code', form);
      return;
    }
    if (requireTermsAccepted && !termsAccepted) {
      showFieldError('请先同意服务条款', 'termsAccepted', form);
      return;
    }
    const passwordValidationError = validatePassword?.(payload);
    if (passwordValidationError) {
      showFieldError(passwordValidationError, 'password', form);
      return;
    }
    const registerValidationError = validateRegister?.(payload);
    if (registerValidationError) {
      setLocalError(registerValidationError);
      setLocalErrorField(undefined);
      focusField(form, 'username');
      return;
    }

    try {
      setRegisterPending(true);
      clearLocalError();
      await onRegister?.(payload);
    } catch (err) {
      setLocalError(getErrorMessage(err, '注册失败，请检查填写内容后重试'));
      setLocalErrorField(undefined);
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

  return (
    <div
      className={cn(
        'w-full max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background/90 p-5 shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:p-8',
        className
      )}
    >
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

      {renderSocialProviders()}

      <form
        className="flex flex-col"
        onSubmit={handleRegister}
        noValidate
        aria-busy={registerPending || codePending}
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
                autoComplete="new-password"
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

          <div className="space-y-2">
            <Label htmlFor={fieldIds.confirmPassword}>确认密码</Label>
            <div className="relative">
              <AuthInputIcon>
                <LockKeyhole className="h-4 w-4" />
              </AuthInputIcon>
              <Input
                id={fieldIds.confirmPassword}
                name="confirmPassword"
                className="bg-background/80 pl-9 backdrop-blur"
                type="password"
                placeholder="请再次输入密码…"
                autoComplete="new-password"
                aria-invalid={localErrorField === 'confirmPassword'}
                aria-describedby={
                  localErrorField === 'confirmPassword'
                    ? errorIds.confirmPassword
                    : undefined
                }
                onChange={() => clearFieldError('confirmPassword')}
                required
              />
            </div>
            {renderFieldError('confirmPassword')}
          </div>

          {requirePhoneVerification && (
            <>
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
            </>
          )}

          {requireTermsAccepted && (
            <div className="space-y-2">
              <label
                className="flex min-h-10 touch-manipulation items-start gap-2 rounded-md py-2 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
                htmlFor={fieldIds.termsAccepted}
              >
                <input
                  id={fieldIds.termsAccepted}
                  name="termsAccepted"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input focus-visible:outline-none"
                  checked={termsAccepted}
                  aria-invalid={localErrorField === 'termsAccepted'}
                  aria-describedby={
                    localErrorField === 'termsAccepted'
                      ? errorIds.termsAccepted
                      : undefined
                  }
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    clearFieldError('termsAccepted');
                  }}
                />
                <span className="min-w-0 break-words">{termsLabel}</span>
              </label>
              {renderFieldError('termsAccepted')}
            </div>
          )}

          <Button
            type="submit"
            className="mt-4 h-11 w-full touch-manipulation"
            disabled={registerPending}
          >
            {registerPending ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                注册中…
              </>
            ) : (
              <>
                创建账号
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>

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
