import { PenLine } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { SceneLinkBadgeProps } from '@/types/timeline.types';

export const SCENE_LINK_COLOR = '#0D9488';

/**
 * Pastille indiquant si une scène de rédaction est reliée à un événement — pleine et cliquable si oui
 * (redirige vers la scène), simple contour grisé sinon. Utilisée sur les cartes, la fiche détail et le graphe.
 */
export function SceneLinkBadge({ linkedSceneId, onOpenScene }: SceneLinkBadgeProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => linkedSceneId && onOpenScene(linkedSceneId)}
      disabled={!linkedSceneId}
      hitSlop={8}
      style={[
        styles.badge,
        linkedSceneId
          ? { backgroundColor: SCENE_LINK_COLOR, borderColor: SCENE_LINK_COLOR }
          : { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <PenLine size={12} color={linkedSceneId ? '#ffffff' : theme.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
