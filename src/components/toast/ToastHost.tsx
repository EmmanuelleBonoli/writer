import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Toast } from '@/types/toast.types';

import { useToastStore } from './toast-store';

const AUTO_DISMISS_MS = 4000;
const VARIANT_COLORS: Record<Toast['variant'], string> = {
  error: '#EF4444',
  success: '#12B76A',
  info: '#2F9BFF',
};

function ToastItem({ id, message, variant }: Toast) {
  const theme = useTheme();
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timeout = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [id, dismiss]);

  return (
    <Pressable
      onPress={() => dismiss(id)}
      style={[styles.toast, { backgroundColor: theme.backgroundElement, borderLeftColor: VARIANT_COLORS[variant] }]}
    >
      <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
    </Pressable>
  );
}

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.four,
    right: Spacing.four,
    gap: Spacing.two,
    zIndex: 999,
  },
  toast: {
    borderRadius: Radii.card,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
