import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AuthLoginPanel } from '../AuthLoginPanel';
import { AuthPageShell } from '../AuthPageShell';
import { AuthPanel } from '../AuthPanel';
import { AuthRegisterPanel } from '../AuthRegisterPanel';
import { AuthVisualCarousel } from '../AuthVisualCarousel';

const createAuthComponents = () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
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

  it('uses the same prefix icon layout for every login input', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AuthLoginPanel components={createAuthComponents()} />
    );

    expect(
      container.querySelectorAll('[data-slot="auth-input-icon"]')
    ).toHaveLength(2);
    expect(screen.getByLabelText('用户名')).toHaveClass('pl-9');
    expect(screen.getByLabelText('密码')).toHaveClass('pl-9');

    await user.click(screen.getByRole('button', { name: '手机号登录' }));

    expect(
      container.querySelectorAll('[data-slot="auth-input-icon"]')
    ).toHaveLength(2);
    expect(screen.getByLabelText('手机号')).toHaveClass('pl-9');
    expect(screen.getByLabelText('验证码')).toHaveClass('pl-9');
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

  it('focuses and describes the first invalid password field', async () => {
    const user = userEvent.setup();

    render(<AuthLoginPanel components={createAuthComponents()} />);

    await user.click(screen.getByRole('button', { name: /^登录$/ }));

    const username = screen.getByLabelText('用户名');
    expect(username).toHaveFocus();
    expect(username).toHaveAttribute('aria-invalid', 'true');
    expect(username).toHaveAccessibleDescription('请输入用户名');
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
    expect(screen.getByLabelText('手机号')).toHaveFocus();
    expect(screen.getByLabelText('手机号')).toHaveAttribute('type', 'tel');
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

  it('falls back to password login when enabledMethods is empty', () => {
    render(
      <AuthLoginPanel components={createAuthComponents()} enabledMethods={[]} />
    );

    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.queryByText('手机号登录')).not.toBeInTheDocument();
  });
});

describe('AuthRegisterPanel', () => {
  it('renders default register fields', () => {
    const { container } = render(
      <AuthRegisterPanel components={createAuthComponents()} />
    );

    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认密码')).toBeInTheDocument();
    expect(screen.getByLabelText('手机号')).toBeInTheDocument();
    expect(screen.getByLabelText('验证码')).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="auth-input-icon"]')
    ).toHaveLength(5);
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
    expect(screen.getByLabelText('确认密码')).toHaveFocus();
    expect(screen.getByLabelText('确认密码')).toHaveAccessibleDescription(
      '两次输入的密码不一致'
    );
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

  it('renders carousel images with stable dimensions', () => {
    render(<AuthVisualCarousel items={[...carouselItems]} />);

    const image = screen.getByAltText('第一张图');
    expect(image).toHaveAttribute('width', '1600');
    expect(image).toHaveAttribute('height', '900');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('switches slide by indicator click', async () => {
    const user = userEvent.setup();

    render(<AuthVisualCarousel items={[...carouselItems]} />);

    await user.click(screen.getByLabelText('切换到第 2 张轮播图'));

    expect(screen.getByText('第二张')).toBeInTheDocument();
  });

  it('provides an explicit autoplay pause control', async () => {
    const user = userEvent.setup();

    render(<AuthVisualCarousel items={[...carouselItems]} />);

    const pauseButton = screen.getByRole('button', { name: '暂停自动播放' });
    expect(pauseButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(pauseButton);

    expect(
      screen.getByRole('button', { name: '继续自动播放' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables autoplay controls when reduced motion is preferred', async () => {
    vi.mocked(window.matchMedia).mockImplementationOnce(
      (query: string) =>
        ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList
    );

    render(<AuthVisualCarousel items={[...carouselItems]} />);

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: '暂停自动播放' })
      ).not.toBeInTheDocument()
    );
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
  it('preserves interaction and accessibility for a custom overlay', async () => {
    const user = userEvent.setup();
    const onOverlayClick = vi.fn();

    render(
      <AuthPageShell
        visual={<div data-testid="visual">visual</div>}
        overlay={
          <button type="button" onClick={onOverlayClick}>
            overlay action
          </button>
        }
      >
        <div data-testid="children">children</div>
      </AuthPageShell>
    );

    expect(screen.getByTestId('visual')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toBeInTheDocument();
    const overlayAction = screen.getByRole('button', {
      name: 'overlay action',
    });
    expect(overlayAction.closest('[aria-hidden="true"]')).toBeNull();
    expect(overlayAction.parentElement).not.toHaveClass('pointer-events-none');
    await user.click(overlayAction);
    expect(onOverlayClick).toHaveBeenCalledOnce();
    expect(
      screen.getByTestId('children').parentElement?.parentElement
    ).toHaveClass('[padding-top:max(1.5rem,env(safe-area-inset-top))]');
    expect(
      screen.getByTestId('children').parentElement?.parentElement
    ).toHaveClass('pointer-events-none');
    expect(screen.getByTestId('children').parentElement).toHaveClass(
      'pointer-events-auto'
    );
  });

  it('keeps only the default visual overlay non-interactive', () => {
    const { container } = render(
      <AuthPageShell>
        <div>children</div>
      </AuthPageShell>
    );

    const defaultOverlay = container.querySelector(
      '[data-slot="auth-page-default-overlay"]'
    );
    expect(defaultOverlay).toHaveClass('pointer-events-none');
    expect(defaultOverlay).toHaveAttribute('aria-hidden', 'true');
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
