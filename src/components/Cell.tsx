import React, { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import type { Cell as CellType } from "../data/mapLayout";
import { selectCurrentPlayer, selectDiceUsed, selectIsCellPlayable, selectCanPlaceBlock, selectCurrentSequence, selectBlocksPlacedInSequence, selectSequenceStartPosition } from "../store/slices/gameSelectors";
import { playablePositions, updateCell, incrementBlocksPlaced, completeSequence, setSequenceStartPosition, setSequenceDirection } from "../store/slices/gameSlice";


export interface CellProps extends CellType {
  x: number;
  y: number;
}

export const Cell = React.memo<CellProps>((props: CellProps) => {
  const { type, owner, x, y, hp } = props;
  const dispatch = useDispatch();
  const currentPlayer = useSelector(selectCurrentPlayer);
  const diceUsed = useSelector(selectDiceUsed);
  const isPlayable = useSelector(selectIsCellPlayable(x, y));
  const canPlaceBlock = useSelector(selectCanPlaceBlock);
  const currentSequence = useSelector(selectCurrentSequence);
  const blocksPlacedInSequence = useSelector(selectBlocksPlacedInSequence);
  const sequenceStartPosition = useSelector(selectSequenceStartPosition);

  const handleClick = useCallback(() => {
    console.log('coord', x, y);
    console.log('hp', hp);

    if (!diceUsed || diceUsed.length === 0) return;
    if (!canPlaceBlock) return;
    if (!currentSequence) return;
    if (isPlayable) {
      // Si c'est le premier bloc de la séquence, enregistrer la position de départ
      const isFirstBlock = blocksPlacedInSequence === 0;
      
      // Si c'est un bloc de type "destroy", infliger des dégâts au bloc adverse
      if (currentSequence.type === 'destroy') {
        const newHp = (hp || 1) - 1;
        if (newHp <= 0) {
          // Si les HP atteignent 0, détruire le bloc (owner devient -1)
          dispatch(updateCell({ x, y, owner: -1, hp: 0 }));
        } else {
          // Sinon, juste réduire les HP sans changer le owner
          dispatch(updateCell({ x, y, hp: newHp, owner }));
        }
        //
      } else if (currentSequence.type === 'attack' && type === 'base' && owner > 0 && owner !== currentPlayer) {
        // Cas exceptionnel pour les attaques de base :
        // Tous les blocs de la séquence sont placés en un seul clic
        const damageToInflict = currentSequence.nbBlocks - blocksPlacedInSequence;
        const newHp = hp - damageToInflict;
        
        // Infliger tous les dégâts en une fois
        if (newHp <= 0) {
          dispatch(updateCell({ x, y, owner: -1, hp: 0 }));
        } else {
          dispatch(updateCell({ x, y, hp: newHp }));
        }
        
        // Marquer que tous les blocs de la séquence ont été placés
        const remaining = currentSequence.nbBlocks - blocksPlacedInSequence;
        for (let i = 0; i < remaining; i++) {
          dispatch(incrementBlocksPlaced());
        }
        
        // Passer immédiatement à la séquence suivante
        dispatch(completeSequence());
        return;
      } else {
        // Pour les autres types de blocs, créer un nouveau bloc
        dispatch(updateCell({ x, y, owner: currentPlayer, hp: 1 }));
      }
      
      dispatch(incrementBlocksPlaced());
      
      // Si c'est le premier bloc, enregistrer la position de départ et recalculer les positions
      if (isFirstBlock && currentSequence.nbBlocks > 1) {
        dispatch(setSequenceStartPosition({ x, y }));
      } else if (sequenceStartPosition && blocksPlacedInSequence === 1) {
        // Si c'est le 2ème bloc, calculer la direction
        // Normaliser la direction pour qu'elle reste entre -1 et 1
        const rawDx = x - sequenceStartPosition.x;
        const rawDy = y - sequenceStartPosition.y;
        const dx = rawDx !== 0 ? rawDx / Math.abs(rawDx) : 0;
        const dy = rawDy !== 0 ? rawDy / Math.abs(rawDy) : 0;
        dispatch(setSequenceDirection({ dx, dy }));
      }
      
      // Si on a placé tous les blocs de la séquence, passer à la suivante
      if (blocksPlacedInSequence + 1 >= currentSequence.nbBlocks) {
        dispatch(completeSequence());
      } else {
        // Recalculer les positions jouables après chaque placement (sauf si on a complété la séquence)
        dispatch(playablePositions());
      }
    } 
  }, [x, y, hp, owner, type, diceUsed, canPlaceBlock, currentSequence, isPlayable, blocksPlacedInSequence, dispatch, currentPlayer, sequenceStartPosition]);

  // Couleurs par joueur
  const getPlayerColor = (player: number) => {
    if (player === 0) return '#f0f0f0'; // Gris clair pour les cases libres
    if (player === -1) return '#808080'; // Gris foncé pour les blocs détruits
    if (player === 1) return '#2196F3'; // Bleu pour joueur 1
    if (player === 2) return '#f44336'; // Rouge pour joueur 2
    if (player === 3) return '#FFEB3B'; // Jaune pour joueur 3
    if (player === 4) return '#4CAF50'; // Vert pour joueur 4
    return '#f0f0f0';
  };

  const cellStyle = useMemo(() => ({
    width: 40,
    height: 40,
    border: "1px solid #999",
    outline: isPlayable && canPlaceBlock ? "3px solid orange" : "none",
    backgroundColor: hp >= 0 ? getPlayerColor(owner) : '#ff0000',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: (isPlayable && canPlaceBlock) ? "pointer" : "not-allowed",
    opacity: (isPlayable && !canPlaceBlock) ? 0.5 : 1
  }), [isPlayable, canPlaceBlock, owner, hp]);

  const cellContent = useMemo(() => {
    return type === 'base' ? `B${owner}` : '';
  }, [type, owner]);

  return (
    <div onClick={handleClick} style={cellStyle}>
      {cellContent}
    </div>
  );
});
