import { useEffect, useState } from 'react';

/**
 * Sélection locale d'une fiche (scène, personnage, lieu, note, événement...), pilotable de l'extérieur :
 * quand `focusId` est fourni (ex. depuis un résultat de recherche), il devient la sélection courante puis
 * se "consomme" via `onFocusConsumed` pour ne pas re-déclencher au prochain rendu.
 */
export function useFocusSelection(focusId: string | null, onFocusConsumed: () => void) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (focusId) {
      setSelectedId(focusId);
      onFocusConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  return [selectedId, setSelectedId] as const;
}
