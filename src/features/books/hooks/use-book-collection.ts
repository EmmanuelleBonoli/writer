import type { Book } from '@/types/book.types';

import { useBooksStore } from '../books-store';

/** Clés de T dont la valeur est un tableau de chaînes (ex. characterIds, placeIds). */
type StringArrayKeys<T> = { [K in keyof T]: T[K] extends string[] ? K : never }[keyof T];

/**
 * Mutations génériques (édition de champ, ajout/retrait d'un id dans un tableau, ajout, suppression,
 * réordonnancement) sur une collection d'items du livre (personnages, lieux, événements de la
 * timeline, scènes...). Mutualise le pattern répété dans les sections du livre : lire la collection,
 * la transformer, la réécrire via `updateBook`.
 */
export function useBookCollection<T extends { id: string }>(
  book: Book,
  select: (book: Book) => T[],
  update: (book: Book, items: T[]) => Book,
) {
  const updateBook = useBooksStore((state) => state.updateBook);

  const setField = <F extends keyof T>(itemId: string, field: F, value: T[F]) => {
    updateBook(book.id, (current) =>
      update(
        current,
        select(current).map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
      ),
    );
  };

  /** Ajoute `value` au tableau `field` de l'item s'il n'y est pas, le retire sinon (ex. tagguer un personnage). */
  const toggleInField = <F extends StringArrayKeys<T>>(itemId: string, field: F, value: string) => {
    updateBook(book.id, (current) =>
      update(
        current,
        select(current).map((item) => {
          if (item.id !== itemId) return item;
          const ids = item[field] as unknown as string[];
          const nextIds = ids.includes(value) ? ids.filter((id) => id !== value) : [...ids, value];
          return { ...item, [field]: nextIds };
        }),
      ),
    );
  };

  const add = (item: T) => {
    updateBook(book.id, (current) => update(current, [...select(current), item]));
  };

  const remove = (itemId: string) => {
    updateBook(book.id, (current) => update(current, select(current).filter((item) => item.id !== itemId)));
  };

  /**
   * Échange l'item `itemId` avec son voisin dans `sortedItems` (liste déjà triée par ordre d'affichage),
   * puis réindexe via `reindex` (ex. réécrire le champ `order` de chaque item selon sa nouvelle position).
   */
  const move = (sortedItems: T[], itemId: string, direction: -1 | 1, reindex: (item: T, index: number) => T) => {
    const index = sortedItems.findIndex((item) => item.id === itemId);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return;

    const reordered = [...sortedItems];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    updateBook(book.id, (current) => update(current, reordered.map(reindex)));
  };

  return { setField, toggleInField, add, remove, move };
}
