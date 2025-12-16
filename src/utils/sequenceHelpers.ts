import type { BlockToPlace } from "./gameRules";
import exhaustiveCheck from "./exhaustiveGuard";

/**
 * Vérifie si une séquence est complétée
 */
export const isSequenceCompleted = (
  index: number,
  completedSequences: number[]
): boolean => {
  return completedSequences.includes(index);
};

/**
 * Vérifie si toutes les séquences sont complétées
 */
export const areAllSequencesCompleted = (
  completedSequences: number[],
  totalSequences: number
): boolean => {
  return completedSequences.length === totalSequences && totalSequences > 0;
};

/**
 * Détermine si une séquence doit être désactivée
 */
export const isSequenceDisabled = (
  index: number,
  currentSequenceIndex: number,
  completedSequences: number[],
  blocksPlacedInSequence: number
): boolean => {
  const isCompleted = isSequenceCompleted(index, completedSequences);
  const canChangeSequence = blocksPlacedInSequence === 0;
  // Désactiver si : la séquence est complétée OU (une séquence est sélectionnée ET ce n'est pas la bonne ET on ne peut pas changer)
  return isCompleted || (currentSequenceIndex !== -1 && currentSequenceIndex !== index && !canChangeSequence);
};

/**
 * Calcule le style d'un bouton de séquence
 */
export const getSequenceButtonStyle = (
  isSelected: boolean,
  isCompleted: boolean,
  isDisabled: boolean
): React.CSSProperties => ({
  width: "100%",
  marginBottom: 5,
  padding: 8,
  border: "1px solid #999",
  borderRadius: 4,
  backgroundColor: isCompleted ? "#c8e6c9" : isSelected ? "#fff9c4" : "#fff",
  cursor: isDisabled ? "not-allowed" : "pointer",
  opacity: isDisabled ? 0.5 : 1,
  display: "flex",
  alignItems: "center",
  gap: 5
});

/**
 * Retourne l'icône pour un type de bloc
 */
export const getSequenceIcon = (type: BlockToPlace['type']): string => {
  switch (type) {
    case 'attack':
      return '⚔️';
    case 'defense':
      return '🛡️';
    case 'destroy':
      return '💥';
    default:
      exhaustiveCheck(type);
  }
};

/**
 * Retourne le label pour un type de bloc
 */
export const getSequenceLabel = (type: BlockToPlace['type']): string => {
  switch (type) {
    case 'attack':
      return 'd\'attaque';
    case 'defense':
      return 'de défense';
    case 'destroy':
      return 'de destruction';
    default:
      exhaustiveCheck(type);
  }
};

/**
 * Retourne la couleur pour un type de bloc
 */
export const getSequenceColor = (type: BlockToPlace['type']): string => {
  switch (type) {
    case 'attack':
      return "#d32f2f";
    case 'defense':
      return "#1976d2";
    case 'destroy':
      return "#9e9e9e";
    default:
      exhaustiveCheck(type);
  }
};

/**
 * Formate le texte d'une séquence
 */
export const formatSequenceText = (sequence: BlockToPlace): string => {
  const plural = sequence.nbBlocks > 1 ? 's' : '';
  return `${sequence.nbBlocks} bloc${plural} ${getSequenceLabel(sequence.type)}`;
};

