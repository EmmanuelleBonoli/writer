import { BookOpen, Clock, MapPin, PenLine, Users } from 'lucide-react-native';

import type { BookSectionConfig } from '@/types/book.types';

/** Les sections du menu de détail d'un livre. */
export const BOOK_SECTIONS: BookSectionConfig[] = [
  {
    id: 'bible',
    label: 'Bible',
    icon: BookOpen,
    color: '#E64980',
    placeholder: 'Pitch, synopsis, thèmes et règles du monde de votre roman.',
  },
  {
    id: 'characters',
    label: 'Personnages',
    icon: Users,
    color: '#12B76A',
    placeholder: 'Les fiches de vos personnages : apparence, psychologie, arc narratif, relations.',
  },
  {
    id: 'places',
    label: 'Lieux',
    icon: MapPin,
    color: '#2F9BFF',
    placeholder: 'Les lieux de votre univers et leur fonction narrative.',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: Clock,
    color: '#F5A524',
    placeholder: "Les événements clés de l'intrigue et leurs arcs narratifs.",
  },
  {
    id: 'writing',
    label: 'Rédaction',
    icon: PenLine,
    color: '#0D9488',
    placeholder: 'Les scènes et chapitres de votre manuscrit.',
  },
];
