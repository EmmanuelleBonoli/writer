import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface LabeledFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

/** Champ de formulaire label + saisie, réutilisé par les sections d'un livre (Bible, Personnages...). */
export function LabeledField({ label, value, onChangeText, placeholder, multiline, numberOfLines = 4 }: LabeledFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && { minHeight: numberOfLines * 20 },
          { color: theme.text, borderColor: theme.border },
        ]}
      />
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
  input: {
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
