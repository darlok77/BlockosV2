import { useCallback } from "react";
import { useDispatch } from "react-redux";
import type { BlockToPlace } from "../utils/gameRules";
import { updateCell, incrementBlocksPlaced, completeSequence, setSequenceStartPosition, setSequenceDirection, playablePositions } from "../store/slices/gameSlice";

/**
 * Hook pour gérer les actions de placement de blocs dans une cellule
 */
export const useCellActions = () => {
  const dispatch = useDispatch();

  const handleCellClick = useCallback((
    x: number,
    y: number,
    currentPlayer: number,
    currentSequence: BlockToPlace | null,
    blocksPlacedInSequence: number,
    sequenceStartPosition: { x: number; y: number } | null,
    diceUsed: number[],
    canPlaceBlock: boolean,
    isPlayable: boolean
  ) => {
    if (!diceUsed || diceUsed.length === 0) return;
    if (!canPlaceBlock) return;
    if (!currentSequence) return;
    if (!isPlayable) return;

    // Si c'est le premier bloc de la séquence, enregistrer la position de départ
    const isFirstBlock = blocksPlacedInSequence === 0;
    
    dispatch(updateCell({ x, y, owner: currentPlayer, hp: 1 }));
    dispatch(incrementBlocksPlaced());
    
    // Si c'est le premier bloc, enregistrer la position de départ
    if (isFirstBlock && currentSequence.nbBlocks > 1) {
      dispatch(setSequenceStartPosition({ x, y }));
    } else if (sequenceStartPosition && blocksPlacedInSequence === 1) {
      // Si c'est le 2ème bloc, calculer la direction
      const dx = x - sequenceStartPosition.x;
      const dy = y - sequenceStartPosition.y;
      dispatch(setSequenceDirection({ dx, dy }));
    }
    
    // Si on a placé tous les blocs de la séquence, passer à la suivante
    if (blocksPlacedInSequence + 1 >= currentSequence.nbBlocks) {
      dispatch(completeSequence());
    } else {
      // Recalculer les positions jouables après chaque placement (sauf si on a complété la séquence)
      dispatch(playablePositions());
    }
  }, [dispatch]);

  return { handleCellClick };
};

