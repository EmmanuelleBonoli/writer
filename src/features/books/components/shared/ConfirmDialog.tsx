import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MinTouchTarget, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ConfirmDialogProps } from '@/types/common.types';

/** Demande de confirmation avant une suppression, plutôt qu'`Alert.alert` qui ne s'affiche pas de façon fiable sur le web. */
export function ConfirmDialog({ visible, title, message, onCancel, onConfirm }: ConfirmDialogProps): ReactElement {
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={[styles.card, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <Text style={[styles.cancelLabel, { color: theme.text }]}>Annuler</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmLabel}>Supprimer</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radii.card,
    padding: Spacing.four,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    minHeight: MinTouchTarget,
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: Spacing.three,
    minHeight: MinTouchTarget,
    justifyContent: 'center',
    borderRadius: Radii.card,
    backgroundColor: '#EF4444',
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
