import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AuthLoginPanel } from '../AuthLoginPanel';
import { AuthPageShell } from '../AuthPageShell';
import { AuthPanel } from '../AuthPanel';
import { AuthRegisterPanel } from '../AuthRegisterPanel';
import { AuthVisualCarousel } from '../AuthVisualCarousel';

const createAuthComponents = () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Input: (props: any) => <input {...props} />,
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Tabs: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="tabs" data-value={value} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              activeValue: value,
              onValueChange,
            })
          : child
      )}
    </div>
  ),
  TabsList: ({ children, onValueChange }: any) => (
    <div data-testid="tabs-list">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              onValueChange,
            })
          : child
      )}
    </div>
  ),
  TabsTrigger: ({ children, value, onValueChange }: any) => (
    <button type="button" onClick={() => onValueChange?.(value)}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value, activeValue }: any) =>
    value === activeValue ? <div>{children}</div> : null,
});

const carouselItems = [
  {
    image: '/one.png',
    alt: '第一张图',
    eyebrow: 'One',
    title: '第一张',
    description: '第一张描述',
  },
  {
    image: '/two.png',
    alt: '第二张图',
    eyebrow: 'Two',
    title: '第二张',
    description: '第二张描述',
  },
] as const;

describe('AuthLoginPanel', () => {
  it('renders password and SMS tabs', () => {
    render(<AuthLoginPanel components={createAuthComponents()} />);

    expect(screen.getByText('账号密码登录')).toBeInTheDocument();
    expect(screen.getByText('手机号登录')).toBeInTheDocument();
  });

  it('calls onPasswordLogin with username and password', async () => {
    const user = userEvent.setup();
    const onPasswordLogin = vi.fn();

    render(
      <AuthLoginPanel
        components={createAuthComponents()}
        onPasswordLogin={onPasswordLogin}
      />
    );

    await user.type(screen.getByLabelText('用户名'), 'alice');
    await user.type(screen.getByLabelText('密码'), 'secret');
    await user.click(screen.getByRole('button', { name: /^登录$/ }));

    await waitFor(() =>
      expect(onPasswordLogin).toHaveBeenCalledWith({
        username: 'alice',
        password: 'secret',
      })
    );
  });

  it('validates phone before sending code', async () => {
    const user = userEvent.setup();
    const onSendSmsCode = vi.fn();

    render(
      <AuthLoginPanel
        components={createAuthComponents()}
        defaultMethod="sms"
        onSendSmsCode={onSendSmsCode}
      />
    );

    await user.click(screen.getByRole('button', { name: '手机号登录' }));
    await user.type(screen.getByLabelText('手机号'), '123');
    await user.click(screen.getByRole('button', { name: '发送验证码' }));

    expect(onSendSmsCode).not.toHaveBeenCalled();
    expect(screen.getByText('请输入正确的手机号')).toBeInTheDocument();
  });

  it('passes SMS metadata to onSmsLogin', async () => {
    const user = userEvent.setup();
    const onSendSmsCode = vi.fn().mockResolvedValue({
      smsId: 'sms-1',
      smsType: 'login',
    });
    const onSmsLogin = vi.fn();

    render(
      <AuthLoginPanel
        components={createAuthComponents()}
        defaultMethod="sms"
        onSendSmsCode={onSendSmsCode}
        onSmsLogin={onSmsLogin}
      />
    );

    await user.click(screen.getByRole('button', { name: '手机号登录' }));
    await user.type(screen.getByLabelText('手机号'), '13800138000');
    await user.click(screen.getByRole('button', { name: '发送验证码' }));
    await user.type(screen.getByLabelText('验证码'), '123456');
    await user.click(screen.getByRole('button', { name: /验证并登录/ }));

    await waitFor(() =>
      expect(onSmsLogin).toHaveBeenCalledWith({
        phone: '13800138000',
        code: '123456',
        smsId: 'sms-1',
        smsType: 'login',
      })
    );
  });

  it('disables submit while pending and shows injected error', async () => {
    const user = userEvent.setup();
    let resolveLogin: (() => void) | undefined;
    const onPasswordLogin = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(
      <AuthLoginPanel
        components={createAuthComponents()}
        error="外部错误"
        onPasswordLogin={onPasswordLogin}
      />
    );

    await user.type(screen.getByLabelText('用户名'), 'alice');
    await user.type(screen.getByLabelText('密码'), 'secret');
    await user.click(screen.getByRole('button', { name: /^登录$/ }));

    expect(screen.getByRole('button', { name: /登录中/ })).toBeDisabled();
    expect(screen.getByText('外部错误')).toBeInTheDocument();
    await act(async () => {
      resolveLogin?.();
    });
  });
});

describe('AuthRegisterPanel', () => {
  it('renders default register fields', () => {
    render(<AuthRegisterPanel components={createAuthComponents()} />);

    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByLabelText('手机号')).toBeInTheDocument();
    expect(screen.getByLabelText('验证码')).toBeInTheDocument();
  });

  it('blocks mismatched passwords before onRegister', async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(
      <AuthRegisterPanel
        components={createAuthComponents()}
        requirePhoneVerification={false}
        onRegister={onRegister}
      />
    );

    await user.type(screen.getByLabelText('用户名'), 'alice');
    await user.type(screen.getByLabelText('密码'), 'secret1');
    await user.type(screen.getByLabelText('确认密码'), 'secret2');
    await user.click(screen.getByRole('button', { name: /创建账号/ }));

    expect(onRegister).not.toHaveBeenCalled();
    expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
  });

  it('passes SMS metadata to onRegister', async () => {
    const user = userEvent.setup();
    const onSendSmsCode = vi.fn().mockResolvedValue({
      smsId: 'sms-2',
      smsType: 'register',
    });
    const onRegister = vi.fn();

    render(
      <AuthRegisterPanel
        components={createAuthComponents()}
        onSendSmsCode={onSendSmsCode}
        onRegister={onRegister}
      />
    );

    await user.type(screen.getByLabelText('用户名'), 'alice');
    await user.type(screen.getByLabelText('密码'), 'secret');
    await user.type(screen.getByLabelText('确认密码'), 'secret');
    await user.type(screen.getByLabelText('手机号'), '13800138000');
    await user.click(screen.getByRole('button', { name: '发送验证码' }));
    await user.type(screen.getByLabelText('验证码'), '123456');
    await user.click(screen.getByRole('button', { name: /创建账号/ }));

    await waitFor(() =>
      expect(onRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'alice',
          phone: '13800138000',
          code: '123456',
          smsId: 'sms-2',
          smsType: 'register',
          termsAccepted: false,
        })
      )
    );
  });

  it('requires terms when enabled', async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();

    render(
      <AuthRegisterPanel
        components={createAuthComponents()}
        requirePhoneVerification={false}
        requireTermsAccepted
        onRegister={onRegister}
      />
    );

    await user.type(screen.getByLabelText('用户名'), 'alice');
    await user.type(screen.getByLabelText('密码'), 'secret');
    await user.type(screen.getByLabelText('确认密码'), 'secret');
    await user.click(screen.getByRole('button', { name: /创建账号/ }));

    expect(onRegister).not.toHaveBeenCalled();
    expect(screen.getByText('请先同意服务条款')).toBeInTheDocument();
  });
});

describe('AuthPanel', () => {
  it('switches between login and register modes', async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();

    render(
      <AuthPanel
        components={createAuthComponents()}
        onModeChange={onModeChange}
      />
    );

    await user.click(screen.getByRole('button', { name: '没有账号？注册' }));

    expect(
      screen.getByRole('heading', { name: '创建账号' })
    ).toBeInTheDocument();
    expect(onModeChange).toHaveBeenCalledWith('register');
  });
});

describe('AuthVisualCarousel', () => {
  it('renders first slide image, text, and indicators', () => {
    render(<AuthVisualCarousel items={[...carouselItems]} />);

    expect(screen.getByAltText('第一张图')).toBeInTheDocument();
    expect(screen.getByText('第一张')).toBeInTheDocument();
    expect(screen.getByText('第一张描述')).toBeInTheDocument();
    expect(screen.getByLabelText('切换到第 1 张轮播图')).toBeInTheDocument();
    expect(screen.getByLabelText('切换到第 2 张轮播图')).toBeInTheDocument();
  });

  it('switches slide by indicator click', async () => {
    const user = userEvent.setup();

    render(<AuthVisualCarousel items={[...carouselItems]} />);

    await user.click(screen.getByLabelText('切换到第 2 张轮播图'));

    expect(screen.getByText('第二张')).toBeInTheDocument();
  });

  it('switches slide by keyboard arrows', () => {
    render(<AuthVisualCarousel items={[...carouselItems]} />);

    const carousel = screen.getByRole('region', { name: '认证页视觉轮播' });
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });

    expect(screen.getByText('第二张')).toBeInTheDocument();

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });

    expect(screen.getByText('第一张')).toBeInTheDocument();
  });

  it('hides indicators when showIndicators is false', () => {
    render(
      <AuthVisualCarousel items={[...carouselItems]} showIndicators={false} />
    );

    expect(
      screen.queryByLabelText('切换到第 1 张轮播图')
    ).not.toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<AuthVisualCarousel items={[...carouselItems]} showText={false} />);

    expect(screen.queryByText('第一张')).not.toBeInTheDocument();
    expect(screen.queryByText('第一张描述')).not.toBeInTheDocument();
  });

  it('renders an empty fallback without throwing', () => {
    render(<AuthVisualCarousel items={[]} />);

    expect(
      screen.getByRole('region', { name: '认证页视觉轮播' })
    ).toBeInTheDocument();
  });
});

describe('AuthPageShell', () => {
  it('renders visual, overlay, and children', () => {
    render(
      <AuthPageShell
        visual={<div data-testid="visual">visual</div>}
        overlay={<div data-testid="overlay">overlay</div>}
      >
        <div data-testid="children">children</div>
      </AuthPageShell>
    );

    expect(screen.getByTestId('visual')).toBeInTheDocument();
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
  });

  it('renders AuthVisualCarousel in the visual slot', () => {
    render(
      <AuthPageShell visual={<AuthVisualCarousel items={[...carouselItems]} />}>
        <div>panel</div>
      </AuthPageShell>
    );

    expect(screen.getByText('第一张')).toBeInTheDocument();
    expect(screen.getByText('panel')).toBeInTheDocument();
  });
});
