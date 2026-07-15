import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CheckableDropdownProps } from '@/types/common.types';

/** Bouton résumant une sélection, qui ouvre une liste à cocher au tap (personnages, lieux, événement lié...). */
export function CheckableDropdown({ label, options, selectedIds, onToggle, placeholder = 'Aucun' }: CheckableDropdownProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const summary =
    selectedIds.length === 0
      ? placeholder
      : options
          .filter((option) => selectedIds.includes(option.id))
          .map((option) => option.label)
          .join(', ');

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={[styles.trigger, { borderColor: theme.border }]}>
        <Text
          style={[styles.triggerText, { color: selectedIds.length ? theme.text : theme.textSecondary }]}
          numberOfLines={1}
        >
          {summary}
        </Text>
        <ChevronDown size={16} color={theme.textSecondary} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.panel, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.panelTitle, { color: theme.text }]}>{label}</Text>
            {options.length === 0 ? (
              <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>Aucune option disponible.</Text>
            ) : (
              <ScrollView style={styles.optionsList}>
                {options.map((option) => {
                  const selected = selectedIds.includes(option.id);
                  return (
                    <Pressable key={option.id} onPress={() => onToggle(option.id)} style={styles.option}>
                      <View
                        style={[
                          styles.checkbox,
                          { borderColor: theme.border },
                          selected && { backgroundColor: theme.text, borderColor: theme.text },
                        ]}
                      >
                        {selected && <Check size={12} color={theme.background} />}
                      </View>
                      <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            <Pressable onPress={() => setOpen(false)} style={[styles.closeButton, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.closeLabel, { color: theme.text }]}>Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    marginRight: Spacing.two,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    borderRadius: Radii.card,
    padding: Spacing.four,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  optionsList: {
    maxHeight: 320,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
    flex: 1,
  },
  emptyHint: {
    fontSize: 12,
  },
  closeButton: {
    marginTop: Spacing.three,
    borderRadius: Radii.card,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  closeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
