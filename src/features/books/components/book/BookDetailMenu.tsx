import { ArrowLeft, Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import type { BookDetailMenuProps } from '@/types/book.types';

import { BOOK_SECTIONS } from '../../book-sections';

// Même identité de marque fixe que AppLogo : le rail est un élément de "chrome", pas une surface themée.
export const RAIL_BACKGROUND = '#2B2440';
const ICON_INACTIVE = 'rgba(255,255,255,0.7)';
const ICON_ACTIVE = '#ffffff';
const SEARCH_COLOR = '#22D3EE';

/** Rail vertical d'icônes : les sections du livre (Bible, Personnages, Lieux, Timeline, Rédaction), retour à l'étagère en bas. */
export function BookDetailMenu({ activeSection, onSelectSection, onBack, onSearch, searchActive }: BookDetailMenuProps) {
  return (
    <View style={[styles.rail, { backgroundColor: RAIL_BACKGROUND }]}>
      <Pressable onPress={onSearch} style={[styles.tab, searchActive && { backgroundColor: SEARCH_COLOR }]}>
        <Search size={18} color={searchActive ? ICON_ACTIVE : ICON_INACTIVE} />
        <Text style={[styles.label, searchActive && styles.labelActive]} numberOfLines={1}>
          Rechercher
        </Text>
      </Pressable>

      {BOOK_SECTIONS.map((section) => {
        const active = section.id === activeSection && !searchActive;
        const Icon = section.icon;
        return (
          <Pressable
            key={section.id}
            onPress={() => onSelectSection(section.id)}
            style={[styles.tab, active && { backgroundColor: section.color }]}
          >
            <Icon size={18} color={active ? ICON_ACTIVE : ICON_INACTIVE} />
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {section.label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
        <ArrowLeft size={20} color={ICON_INACTIVE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 72,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  backButton: {
    marginTop: 'auto',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  tab: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderTopLeftRadius: Radii.card,
    borderBottomLeftRadius: Radii.card,
    gap: Spacing.half,
  },
  label: {
    color: ICON_INACTIVE,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: ICON_ACTIVE,
  },
});
