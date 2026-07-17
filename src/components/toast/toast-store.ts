import { create } from 'zustand';

import type { Toast, ToastVariant } from '@/types/toast.types';

interface ToastState {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/**
 * Affiche un toast.
 */
export function showToast(message: string, variant: ToastVariant = 'error'): void {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  useToastStore.setState((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
}

export { useToastStore };
