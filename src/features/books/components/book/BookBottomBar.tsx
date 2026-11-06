import { Search } from 'lucide-react-native';
import { useEffect, useRef, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radii, Spacing } from '@/constants/theme';
import type { BookBottomBarProps, BookBottomBarTabProps } from '@/types/book.types';

import { BOOK_SECTIONS } from '../../book-sections';
import { ICON_ACTIVE, ICON_INACTIVE, RAIL_BACKGROUND, SEARCH_COLOR } from './BookDetailMenu';

const TAB_WIDTH = 80;

function BottomBarTab({ label, icon: Icon, color, active, onPress }: BookBottomBarTabProps): ReactElement {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && { backgroundColor: color }]}>
      <Icon size={20} color={active ? ICON_ACTIVE : ICON_INACTIVE} />
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Équivalent téléphone du rail latéral : les sections du livre dans une barre défilable en bas de l'écran. */
export function BookBottomBar({ activeSection, onSelectSection, onSearch, searchActive }: BookBottomBarProps): ReactElement {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Les liens internes (recherche, timeline...) changent de section sans toucher la barre : on y ramène l'onglet actif.
  useEffect(() => {
    const activeIndex = searchActive ? 0 : BOOK_SECTIONS.findIndex((section) => section.id === activeSection) + 1;
    scrollRef.current?.scrollTo({ x: Math.max(0, (activeIndex - 1) * TAB_WIDTH), animated: true });
  }, [activeSection, searchActive]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={[styles.barContent, { paddingBottom: insets.bottom + Spacing.one }]}
    >
      <BottomBarTab label="Rechercher" icon={Search} color={SEARCH_COLOR} active={searchActive} onPress={onSearch} />
      {BOOK_SECTIONS.map((section) => (
        <BottomBarTab
          key={section.id}
          label={section.label}
          icon={section.icon}
          color={section.color}
          active={section.id === activeSection && !searchActive}
          onPress={() => onSelectSection(section.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexGrow: 0,
    backgroundColor: RAIL_BACKGROUND,
  },
  barContent: {
    paddingTop: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  tab: {
    width: TAB_WIDTH,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.card,
    gap: Spacing.half,
  },
  label: {
    color: ICON_INACTIVE,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: ICON_ACTIVE,
  },
});
