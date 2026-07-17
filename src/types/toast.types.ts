export type ToastVariant = 'error' | 'success' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}
