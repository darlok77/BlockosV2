import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Cell } from "../../data/mapLayout";
import { calculateBlocksToPlace } from "../../utils/gameRules";

// Sélecteurs de base
const selectGameState = (state: RootState) => state.game;

// Sélecteur pour récupérer le plateau complet
export const selectBoard = createSelector(
  [selectGameState],
  state => state.board
);

// Sélecteur pour récupérer le joueur courant
export const selectCurrentPlayer = createSelector(
  [selectGameState],
  state => state.currentPlayer
);

// Sélecteur pour récupérer le résultat du dé
export const selectDiceResult = createSelector(
  [selectGameState],
  state => state.diceResult
);

// Sélecteur pour récupérer les valeurs des dés utilisées
export const selectDiceUsed = createSelector(
  [selectGameState],
  state => state.diceUsed
);

// Sélecteur pour récupérer les positions jouables
export const selectPlayablePositions = createSelector(
  [selectGameState],
  state => state.playablePositions
);

// Sélecteur pour vérifier si une cellule spécifique est jouable
export const selectIsCellPlayable = (x: number, y: number) => createSelector(
  [selectPlayablePositions],
  (playablePositions) => playablePositions.some(pos => pos.x === x && pos.y === y)
);

// Sélecteur pour récupérer toutes les cellules d'un joueur
export const selectPlayerCells = (playerId: number) => createSelector(
  [selectBoard],
  (board) => {
    const cells: { x: number; y: number; cell: Cell }[] = [];
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        if (board[x][y].owner === playerId) {
          cells.push({ x, y, cell: board[x][y] });
        }
      }
    }
    return cells;
  }
);

// Sélecteur pour récupérer la liste des séquences à placer
export const selectSequencesToPlace = createSelector(
  [selectGameState],
  state => state.sequencesToPlace
);

// Sélecteur pour récupérer l'index de la séquence actuelle
export const selectCurrentSequenceIndex = createSelector(
  [selectGameState],
  state => state.currentSequenceIndex
);

// Sélecteur pour récupérer le nombre de blocs placés dans la séquence actuelle
export const selectBlocksPlacedInSequence = createSelector(
  [selectGameState],
  state => state.blocksPlacedInSequence
);

// Sélecteur pour récupérer la séquence actuelle
export const selectCurrentSequence = createSelector(
  [selectGameState],
  state => {
    if (state.currentSequenceIndex < 0 || state.currentSequenceIndex >= state.sequencesToPlace.length) {
      return null;
    }
    return state.sequencesToPlace[state.currentSequenceIndex];
  }
);

// Sélecteur pour calculer le nombre de blocs à placer selon les dés utilisés (pour affichage)
export const selectBlocksToPlace = createSelector(
  [selectDiceUsed],
  (diceUsed) => calculateBlocksToPlace(diceUsed)
);

// Sélecteur pour vérifier si on peut encore placer des blocs dans la séquence actuelle
export const selectCanPlaceBlock = createSelector(
  [selectCurrentSequence, selectBlocksPlacedInSequence],
  (currentSequence, blocksPlaced) => {
    if (!currentSequence) return false;
    return blocksPlaced < currentSequence.nbBlocks;
  }
);

// Sélecteur pour vérifier s'il reste des séquences à placer
export const selectHasUnplacedSequences = createSelector(
  [selectSequencesToPlace, selectCurrentSequenceIndex],
  (sequencesToPlace, currentSequenceIndex) => {
    return currentSequenceIndex < sequencesToPlace.length - 1;
  }
);

// Sélecteur pour récupérer la position de départ de la séquence
export const selectSequenceStartPosition = createSelector(
  [selectGameState],
  state => state.sequenceStartPosition
);

// Sélecteur pour récupérer les séquences complétées
export const selectCompletedSequences = createSelector(
  [selectGameState],
  state => state.completedSequences
);

// Sélecteur pour récupérer le cache des HP des bases
export const selectBaseHpCache = createSelector(
  [selectGameState],
  state => state.baseHpCache
);

// Sélecteur pour récupérer les HP d'une base spécifique
export const selectPlayerBaseHp = (playerId: number) => createSelector(
  [selectBaseHpCache],
  (baseHpCache) => baseHpCache[playerId] || 0
);

// Sélecteur pour récupérer les joueurs éliminés
export const selectEliminatedPlayers = createSelector(
  [selectGameState],
  state => state.eliminatedPlayers
);

// Sélecteur pour récupérer le gagnant
export const selectWinner = createSelector(
  [selectGameState],
  state => state.winner
);

// Sélecteur pour vérifier si la partie est terminée
export const selectIsGameOver = createSelector(
  [selectGameState],
  state => state.isGameOver
);
