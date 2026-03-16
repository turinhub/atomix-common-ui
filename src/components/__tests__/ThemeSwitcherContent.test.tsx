import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { ThemeSwitcherContent } from '../ThemeSwitcherContent';

const createMockComponents = () => ({
  DropdownMenuRadioGroup: ({ children, value, onValueChange }: any) => (
    <div data-testid="radio-group" data-value={value}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onValueChange })
      )}
    </div>
  ),
  DropdownMenuRadioItem: ({ children, value, onValueChange }: any) => (
    <button
      data-testid={`item-${value}`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  ),
});

describe('ThemeSwitcherContent', () => {
  it('应该渲染主题选项', () => {
    const mockComponents = createMockComponents();

    render(
      <ThemeSwitcherContent
        components={mockComponents}
        value="light"
        onValueChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    expect(screen.getByTestId('item-light')).toBeInTheDocument();
    expect(screen.getByTestId('item-dark')).toBeInTheDocument();
    expect(screen.getByTestId('item-system')).toBeInTheDocument();
  });

  it('应该调用 onValueChange 切换主题', async () => {
    const mockComponents = createMockComponents();
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ThemeSwitcherContent
        components={mockComponents}
        value="light"
        onValueChange={onValueChange}
      />
    );

    const darkItem = screen.getByTestId('item-dark');
    await user.click(darkItem);

    expect(onValueChange).toHaveBeenCalledWith('dark');
  });

  it('应该支持自定义主题选项', () => {
    const mockComponents = createMockComponents();
    const customThemes = [
      {
        value: 'blue',
        label: '蓝色主题',
        icon: <span data-testid="blue-icon">Blue</span>,
      },
      {
        value: 'green',
        label: '绿色主题',
        icon: <span data-testid="green-icon">Green</span>,
      },
    ];

    render(
      <ThemeSwitcherContent
        components={mockComponents}
        value="blue"
        onValueChange={vi.fn()}
        themes={customThemes}
      />
    );

    expect(screen.getByTestId('item-blue')).toBeInTheDocument();
    expect(screen.getByTestId('item-green')).toBeInTheDocument();
    expect(screen.getByTestId('blue-icon')).toBeInTheDocument();
    expect(screen.getByTestId('green-icon')).toBeInTheDocument();
  });

  it('缺少 components 时应该显示错误', () => {
    render(<ThemeSwitcherContent value="light" onValueChange={vi.fn()} />);

    expect(
      screen.getByText('错误：请通过 components prop 注入 UI 组件')
    ).toBeInTheDocument();
  });

  it('应该正确设置当前主题值', () => {
    const mockComponents = createMockComponents();

    render(
      <ThemeSwitcherContent
        components={mockComponents}
        value="dark"
        onValueChange={vi.fn()}
      />
    );

    const radioGroup = screen.getByTestId('radio-group');
    expect(radioGroup).toHaveAttribute('data-value', 'dark');
  });

  it('应该支持自定义图标大小', () => {
    const mockComponents = createMockComponents();

    render(
      <ThemeSwitcherContent
        components={mockComponents}
        value="light"
        onValueChange={vi.fn()}
        iconSize={20}
      />
    );

    const lightItem = screen.getByTestId('item-light');
    expect(lightItem).toBeInTheDocument();
  });

  it('应该支持 themeIcons 覆盖默认图标', () => {
    const mockComponents = createMockComponents();
    const customIcons = {
      light: <span data-testid="custom-light-icon">CustomLight</span>,
      dark: <span data-testid="custom-dark-icon">CustomDark</span>,
    };

    render(
      <ThemeSwitcherContent
        components={mockComponents}
        value="light"
        onValueChange={vi.fn()}
        themeIcons={customIcons}
      />
    );

    expect(screen.getByTestId('custom-light-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-dark-icon')).toBeInTheDocument();
  });
});
