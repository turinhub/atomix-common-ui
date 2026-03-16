import { useState, useEffect } from 'react';

import type {
  ButtonComponent,
  DropdownMenuComponent,
  DropdownMenuTriggerComponent,
  DropdownMenuContentComponent,
  DropdownMenuRadioGroupComponent,
  DropdownMenuRadioItemComponent,
} from '../types/component-types';

/**
 * 主题选项
 */
export interface ThemeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * UI 组件适配器接口
 */
export interface ThemeSwitcherUIComponents {
  DropdownMenu: DropdownMenuComponent;
  DropdownMenuTrigger: DropdownMenuTriggerComponent;
  DropdownMenuContent: DropdownMenuContentComponent;
  DropdownMenuRadioGroup: DropdownMenuRadioGroupComponent;
  DropdownMenuRadioItem: DropdownMenuRadioItemComponent;
  Button: ButtonComponent;
}

export interface ThemeSwitcherProps {
  value: string;
  onValueChange: (value: string) => void;
  themes?: ThemeOption[];
  triggerVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerClassName?: string;
  iconSize?: number;
  showCurrentIcon?: boolean;
  enableSSRHandling?: boolean;
  triggerContent?: React.ReactNode;
  components?: ThemeSwitcherUIComponents;
  // 自定义主题图标（可选）
  themeIcons?: Partial<Record<string, React.ReactNode>>;
}

/**
 * 默认主题配置
 */
const defaultThemes: ThemeOption[] = [
  {
    value: 'light',
    label: '浅色',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="2" />
        <path
          className="opacity-75"
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: '深色',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    label: '跟随系统',
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <rect
          x="2"
          y="3"
          width="20"
          height="14"
          rx="2"
          ry="2"
          strokeWidth="2"
        />
        <path d="M8 21h8m-4-4v4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

/**
 * 主题切换组件
 * 需要通过 components prop 注入 UI 组件
 */
export function ThemeSwitcher({
  value,
  onValueChange,
  themes = defaultThemes,
  triggerVariant = 'ghost',
  triggerSize = 'icon',
  triggerClassName,
  iconSize = 16,
  showCurrentIcon = true,
  enableSSRHandling = true,
  triggerContent,
  components,
  themeIcons,
}: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (enableSSRHandling && !mounted) {
    return null;
  }

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    Button,
  } = components;

  /**
   * 获取主题图标
   * 优先使用 themeIcons 中的自定义图标，如果没有则使用主题配置中的默认图标
   */
  const getThemeIcon = (themeValue: string): React.ReactNode => {
    if (themeIcons && themeIcons[themeValue]) {
      return themeIcons[themeValue];
    }
    const theme = themes.find((t) => t.value === themeValue);
    return theme?.icon;
  };

  const currentIcon = getThemeIcon(value);

  const triggerIcon = showCurrentIcon ? currentIcon : null;
  const iconStyle = iconSize ? { width: iconSize, height: iconSize } : {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          {triggerContent || (
            <span
              style={iconStyle}
              className="inline-flex items-center justify-center"
            >
              {triggerIcon}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {themes.map((theme) => (
            <DropdownMenuRadioItem key={theme.value} value={theme.value}>
              <span className="mr-2 inline-flex items-center">
                {getThemeIcon(theme.value)}
              </span>
              <span>{theme.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
