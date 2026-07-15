import type { BookBible, BookGenre } from '@/types/book.types';
import type { Arc } from '@/types/timeline.types';

export const ALL_GENRES: BookGenre[] = ['Roman', 'Fantasy', 'Polar', 'Romance', 'Science-fiction', 'Historique'];

export const MAIN_ARC_ID = 'main';

export const ARC_COLORS = ['#12B76A', '#EF4444', '#0D9488', '#F5A524', '#2F9BFF', '#E64980'];

export function createMainArc(): Arc {
  return { id: MAIN_ARC_ID, title: 'Arc principal', color: ARC_COLORS[3], isMain: true, linkedArcId: null, connectsToEventId: null };
}

export const EMPTY_BIBLE: BookBible = {
  tone: '',
  pitch: '',
  synopsis: '',
  themes: '',
  worldRules: '',
};
