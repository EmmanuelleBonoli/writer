import { Check, RotateCcw, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AiRewritePanelProps } from '@/types/common.types';

import { TagChips } from './TagChips';

const ACCENT_COLOR = '#0D9488';

/** Réécriture assistée par IA (Gemini, via le Worker Cloudflare) : choix du champ (si plusieurs), instruction libre, aperçu à accepter ou ignorer. */
export function AiRewritePanel({ title, fields, rewrite, onApply }: AiRewritePanelProps) {
  const theme = useTheme();
  const [selectedFieldKey, setSelectedFieldKey] = useState(fields[0]?.key ?? '');
  const [instruction, setInstruction] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  /** Affiché dans le panneau plutôt que via `Alert.alert`, qui ne s'affiche pas de façon fiable sur le web. */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedField = fields.find((field) => field.key === selectedFieldKey) ?? fields[0];

  const handleSelectField = (fieldKey: string) => {
    setSelectedFieldKey(fieldKey);
    setSuggestion(null);
    setErrorMessage(null);
  };

  const handleRewrite = async () => {
    setErrorMessage(null);
    if (!selectedField) return;
    if (!selectedField.value.trim() && !instruction.trim()) {
      setErrorMessage('Ajoutez une instruction pour générer ce champ vide (ex. "à partir du reste du profil").');
      return;
    }
    setIsRewriting(true);
    try {
      const text = await rewrite(selectedField.key, selectedField.value, instruction);
      setSuggestion(text);
    } catch (error) {
      console.error('Échec de la réécriture IA :', error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleApply = () => {
    if (!suggestion || !selectedField) return;
    onApply(selectedField.key, suggestion, selectedField.value);
    setSuggestion(null);
  };

  if (!selectedField) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>

      {fields.length > 1 && (
        <View style={styles.fieldPicker}>
          <TagChips
            options={fields.map((field) => ({ id: field.key, label: field.label }))}
            selectedIds={[selectedFieldKey]}
            onToggle={handleSelectField}
          />
        </View>
      )}

      <View style={styles.row}>
        <TextInput
          value={instruction}
          onChangeText={setInstruction}
          placeholder='ex : "plus intense émotionnellement", ou "complète à partir du reste du profil" si le champ est vide…'
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />
        <Pressable
          onPress={handleRewrite}
          disabled={isRewriting}
          style={[styles.rewriteButton, { backgroundColor: ACCENT_COLOR, opacity: isRewriting ? 0.7 : 1 }]}
        >
          {isRewriting ? <ActivityIndicator size="small" color="#ffffff" /> : <Sparkles size={14} color="#ffffff" />}
          <Text style={styles.rewriteButtonLabel}>{selectedField.value.trim() ? 'Réécrire' : 'Générer'}</Text>
        </Pressable>
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {suggestion && (
        <View style={[styles.suggestionBox, { borderColor: theme.border }]}>
          <Text style={[styles.suggestionText, { color: theme.text }]}>{suggestion}</Text>
          <View style={styles.suggestionActions}>
            <Pressable onPress={() => setSuggestion(null)} style={styles.discardButton}>
              <RotateCcw size={13} color={theme.textSecondary} />
              <Text style={[styles.discardButtonLabel, { color: theme.textSecondary }]}>Ignorer</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={[styles.applyButton, { backgroundColor: ACCENT_COLOR }]}>
              <Check size={13} color="#ffffff" />
              <Text style={styles.applyButtonLabel}>Remplacer le texte</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radii.card,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 12,
    marginBottom: Spacing.two,
  },
  fieldPicker: {
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  rewriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rewriteButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: Spacing.two,
  },
  suggestionBox: {
    marginTop: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.card,
    padding: Spacing.three,
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.three,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  discardButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  applyButtonLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
