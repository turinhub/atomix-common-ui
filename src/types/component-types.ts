import type {
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TdHTMLAttributes,
  LabelHTMLAttributes,
} from 'react';

/**
 * 基础组件 Props 接口
 */
export interface UIComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * 通用组件类型
 */
export type UIComponent<TProps extends UIComponentProps = UIComponentProps> =
  React.ComponentType<TProps>;

/**
 * Button 组件类型
 */
export type ButtonComponent = UIComponent<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }
>;

/**
 * Input 组件类型
 */
export type InputComponent = UIComponent<
  InputHTMLAttributes<HTMLInputElement> & {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
>;

/**
 * Card 组件类型
 */
export type CardComponent = UIComponent<HTMLAttributes<HTMLDivElement>>;

/**
 * Table 相关组件类型
 */
export type TableComponent = UIComponent<HTMLAttributes<HTMLTableElement>>;
export type TableRowComponent = UIComponent<
  HTMLAttributes<HTMLTableRowElement>
>;
export type TableCellComponent = UIComponent<
  TdHTMLAttributes<HTMLTableCellElement> & {
    align?: 'left' | 'center' | 'right';
  }
>;

/**
 * Select 组件类型
 */
export interface SelectComponentProps extends UIComponentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export type SelectComponent = UIComponent<SelectComponentProps>;
export type SelectTriggerComponent = UIComponent<
  ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>;
export type SelectContentComponent = UIComponent<
  HTMLAttributes<HTMLDivElement>
>;
export type SelectItemComponent = UIComponent<
  HTMLAttributes<HTMLDivElement> & {
    value: string;
    onSelect?: () => void;
  }
>;
export type SelectValueComponent = UIComponent<HTMLAttributes<HTMLSpanElement>>;

/**
 * Label 组件类型
 */
export type LabelComponent = UIComponent<
  LabelHTMLAttributes<HTMLLabelElement> & { asChild?: boolean }
>;

/**
 * Dialog 组件类型
 */
export type DialogComponent = UIComponent<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}>;

export type DialogContentComponent = UIComponent<
  HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>;
export type DialogHeaderComponent = UIComponent<HTMLAttributes<HTMLDivElement>>;
export type DialogFooterComponent = UIComponent<HTMLAttributes<HTMLDivElement>>;
export type DialogTitleComponent = UIComponent<
  HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean }
>;
export type DialogDescriptionComponent = UIComponent<
  HTMLAttributes<HTMLParagraphElement> & { asChild?: boolean }
>;

/**
 * DropdownMenu 组件类型
 */
export type DropdownMenuComponent = UIComponent<{
  children?: React.ReactNode;
}>;

export type DropdownMenuTriggerComponent = UIComponent<
  ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>;

export type DropdownMenuContentComponent = UIComponent<
  HTMLAttributes<HTMLDivElement>
>;

export type DropdownMenuRadioGroupComponent = UIComponent<{
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}>;

export type DropdownMenuRadioItemComponent = UIComponent<{
  value: string;
  children?: React.ReactNode;
}>;

/**
 * Skeleton 组件类型
 */
export type SkeletonComponent = UIComponent<HTMLAttributes<HTMLDivElement>>;
