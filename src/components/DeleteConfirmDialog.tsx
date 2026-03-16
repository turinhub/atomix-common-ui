'use client';

import { useState, useEffect } from 'react';

/**
 * UI 组件适配器接口
 */
export interface DialogUIComponents {
  Dialog: React.ComponentType<any>;
  DialogContent: React.ComponentType<any>;
  DialogHeader: React.ComponentType<any>;
  DialogFooter: React.ComponentType<any>;
  DialogTitle: React.ComponentType<any>;
  DialogDescription: React.ComponentType<any>;
  Button: React.ComponentType<any>;
  Input: React.ComponentType<any>;
  Label: React.ComponentType<any>;
}

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  onConfirm: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  verification?: {
    targetValue: string;
    label?: string;
    placeholder?: string;
  };

  // UI 组件注入
  components?: DialogUIComponents;
}

/**
 * 删除确认对话框
 * 需要通过 components prop 注入 UI 组件
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
  confirmText = '确认删除',
  cancelText = '取消',
  confirmButtonVariant = 'destructive',
  verification,
  components,
}: DeleteConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');

  if (!components) {
    return (
      <div className="p-4 text-center text-destructive">
        错误：请通过 components prop 注入 UI 组件
      </div>
    );
  }

  const {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    Button,
    Input,
    Label,
  } = components;

  // Reset input when dialog opens/closes or target value changes
  useEffect(() => {
    if (open) {
      setInputValue('');
    }
  }, [open, verification?.targetValue]);

  const isConfirmDisabled = verification
    ? inputValue !== verification.targetValue
    : false;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-2">{title}</div>
          </DialogTitle>
          <DialogDescription asChild>
            <div>{description}</div>
          </DialogDescription>
        </DialogHeader>

        {verification && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="confirm-input">
                {verification.label || '请输入以确认'}
              </Label>
              <Input
                id="confirm-input"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                placeholder={verification.placeholder}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isConfirmDisabled || loading}
          >
            {loading && (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
