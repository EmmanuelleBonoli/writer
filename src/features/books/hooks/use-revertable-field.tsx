import { RevertFieldButton } from '../components/shared/RevertFieldButton';
import { useFieldHistory } from './use-field-history';

/**
 * Combine `useFieldHistory` et le rendu du bouton "revenir à la version précédente", pour éviter de
 * réécrire cette même mécanique (mémoriser avant réécriture IA, afficher le bouton si une valeur
 * précédente existe, l'appliquer puis l'oublier) dans chaque section de fiches (Personnages, Lieux, Rédaction...).
 */
export function useRevertableField<FieldKey extends string>(
  setField: (entityId: string, fieldKey: FieldKey, value: string) => void,
) {
  const { getPrevious, remember, clear } = useFieldHistory();

  const renderRevertButton = (entityId: string, fieldKey: FieldKey) => {
    const previousValue = getPrevious(entityId, fieldKey);
    if (previousValue === undefined) return null;
    return (
      <RevertFieldButton
        onPress={() => {
          setField(entityId, fieldKey, previousValue);
          clear(entityId, fieldKey);
        }}
      />
    );
  };

  return { remember, renderRevertButton };
}
