import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import type { BookGenre } from '@/types/book.types';

const GENRE_COLORS = {
  light: {
    Roman: '#F5A524',
    Fantasy: '#E64980',
    Polar: '#1A1A2E',
    Romance: '#EF4444',
    'Science-fiction': '#2F9BFF',
    Historique: '#12B76A',
  },
  dark: {
    Roman: '#D98F1F',
    Fantasy: '#C93F73',
    Polar: '#3A3A5C',
    Romance: '#C1352F',
    'Science-fiction': '#2A78C4',
    Historique: '#0E9C5C',
  },
} as const satisfies Record<'light' | 'dark', Record<BookGenre, string>>;

function getGenrePalette(scheme: 'light' | 'dark') {
  return scheme === 'dark' ? GENRE_COLORS.dark : GENRE_COLORS.light;
}

/** Couleur de couverture pour un genre donné, adaptée au thème clair/sombre actif. */
export function useGenreColor(genre: BookGenre): string {
  const scheme = useAppColorScheme();
  return getGenrePalette(scheme)[genre];
}

/** Couleur par genre pour une liste de genres (ex. reliure segmentée d'un livre multi-genres). */
export function useGenreColors(genres: BookGenre[]): string[] {
  const scheme = useAppColorScheme();
  const palette = getGenrePalette(scheme);
  return genres.map((genre) => palette[genre]);
}
