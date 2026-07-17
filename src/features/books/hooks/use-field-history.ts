import { useState } from 'react';

function historyKey(entityId: string, fieldKey: string): string {
  return `${entityId}:${fieldKey}`;
}

/**
 * Mémorise, par champ d'une fiche (personnage, lieu, scène...), la valeur juste avant sa dernière
 * écrasement (ex. réécriture IA appliquée) pour permettre un retour en arrière — perdu en quittant
 * l'écran (pas persisté dans le livre). Clé composite entité+champ pour ne pas mélanger deux fiches
 * qui partagent les mêmes noms de champs (ex. "psychology" pour deux personnages différents).
 */
export function useFieldHistory() {
  const [previousValues, setPreviousValues] = useState<Record<string, string>>({});

  const getPrevious = (entityId: string, fieldKey: string): string | undefined =>
    previousValues[historyKey(entityId, fieldKey)];

  const remember = (entityId: string, fieldKey: string, value: string) => {
    setPreviousValues((values) => ({ ...values, [historyKey(entityId, fieldKey)]: value }));
  };

  const clear = (entityId: string, fieldKey: string) => {
    setPreviousValues((values) => {
      const key = historyKey(entityId, fieldKey);
      if (!(key in values)) return values;
      const next = { ...values };
      delete next[key];
      return next;
    });
  };

  return { getPrevious, remember, clear };
}
