import type { Cell } from "../../data/mapLayout";
import type { BlockToPlace } from "../../utils/gameRules";
import { getPlayablePositions, getAlignedPositions, getNextPositionInDirection, calculateAllTerritoryCapture } from "../../utils/gameRules";

export interface GameState {
	board: Cell[][];
	currentPlayer: number;
	nbPlayers: number;
	diceResult: { die1: number; die2: number } | null;
	diceUsed: number[];
	playablePositions: { x: number; y: number }[];
	sequencesToPlace: BlockToPlace[];
	currentSequenceIndex: number;
	blocksPlacedInSequence: number;
	sequenceStartPosition: { x: number; y: number } | null;
	sequenceDirection: { dx: number; dy: number } | null;
	completedSequences: number[];
	currentBlockType: 'attack' | 'defense' | 'destroy' | null;
	eliminatedPlayers: number[];
	winner: number | null;
	isGameOver: boolean;
	baseHpCache: Record<number, number>; // Cache des HP des bases par joueur
}

export interface UpdateCellPayload {
  x: number;
  y: number;
  hp?: number;
  owner?: number;
  territory?: number;
}

/**
 * Helper pour marquer une séquence comme complétée
 */
export const markSequenceAsCompleted = (state: GameState, sequenceIndex: number) => {
  if (!state.completedSequences.includes(sequenceIndex)) {
    state.completedSequences.push(sequenceIndex);
  }
};

/**
 * Retourne l'état initial d'une séquence (utilisé pour réinitialisation)
 */
export const getInitialSequenceState = () => ({
  sequencesToPlace: [],
  currentSequenceIndex: -1,
  blocksPlacedInSequence: 0,
  sequenceStartPosition: null,
  sequenceDirection: null,
  completedSequences: [],
  currentBlockType: null,
});

/**
 * Calcule le nombre de blocs restants dans la séquence actuelle
 */
export const getRemainingBlocks = (state: GameState): number => {
  if (state.currentSequenceIndex >= 0 && state.currentSequenceIndex < state.sequencesToPlace.length) {
    const currentSeq = state.sequencesToPlace[state.currentSequenceIndex];
    return currentSeq.nbBlocks - state.blocksPlacedInSequence;
  }
  return 0;
};

/**
 * Capture les territoires pour le joueur actuel
 */
export const captureTerritories = (board: Cell[][], currentPlayer: number) => {
  const cellsToUpdate = calculateAllTerritoryCapture(board, currentPlayer);
  cellsToUpdate.forEach(({ x, y, territory }) => {
    const cell = board[x][y];
    if (cell) cell.territory = territory;
  });
  if (cellsToUpdate.length > 0) {
    console.log(`Capturé ${cellsToUpdate.length} territoires`);
  }
};

/**
 * Met à jour une cellule et ses attributs
 */
export const updateCellAttributes = (
  cell: Cell, 
  payload: UpdateCellPayload
) => {
  if (payload.hp !== undefined) cell.hp = payload.hp;
  if (payload.owner !== undefined) cell.owner = payload.owner;
  if (payload.territory !== undefined) cell.territory = payload.territory;
};

/**
 * Renvoie la somme des HP des cellules de type base appartenant au joueur
 */
export const getBaseHpForPlayer = (board: Cell[][], player: number): number => {
  let total = 0;
  for (let x = 0; x < board.length; x++) {
    const row = board[x];
    for (let y = 0; y < row.length; y++) {
      const cell = row[y];
      if (cell.type === 'base' && cell.owner === player) {
        total += cell.hp || 0;
      }
    }
  }
  return total;
};

/**
 * Calcule la liste des joueurs encore en vie (base avec HP > 0)
 */
export const getAlivePlayers = (board: Cell[][], nbPlayers: number): number[] => {
  const alive: number[] = [];
  for (let p = 1; p <= nbPlayers; p++) {
    if (getBaseHpForPlayer(board, p) > 0) alive.push(p);
  }
  return alive;
};

/**
 * Met à jour le cache des HP des bases après modification d'une cellule
 */
export const updateBaseHpCache = (state: GameState, x: number, y: number) => {
  const cell = state.board[x][y];
  if (cell.type !== 'base') return;
  
  // Recalculer les HP pour tous les joueurs (au cas où plusieurs bases seraient affectées)
  for (let player = 1; player <= state.nbPlayers; player++) {
    state.baseHpCache[player] = getBaseHpForPlayer(state.board, player);
  }
};

/**
 * Initialise le cache des HP des bases
 */
export const initializeBaseHpCache = (state: GameState) => {
  state.baseHpCache = {};
  for (let player = 1; player <= state.nbPlayers; player++) {
    state.baseHpCache[player] = getBaseHpForPlayer(state.board, player);
  }
};

/**
 * Met à jour state.eliminatedPlayers, state.winner et state.isGameOver
 * Utilise le cache des HP des bases pour de meilleures performances
 */
export const recomputeEliminationsAndWinner = (state: GameState) => {
  const alivePlayers: number[] = [];
  const eliminated: number[] = [];
  
  for (let p = 1; p <= state.nbPlayers; p++) {
    if (state.baseHpCache[p] > 0) {
      alivePlayers.push(p);
    } else {
      eliminated.push(p);
    }
  }
  
  state.eliminatedPlayers = eliminated;
  if (alivePlayers.length <= 1) {
    state.winner = alivePlayers[0] ?? null;
    state.isGameOver = true;
  } else {
    state.winner = null;
    state.isGameOver = false;
  }
};

/**
 * Calcule les positions jouables selon l'état de la séquence
 */
export const calculatePlayablePositions = (state: GameState) => {
  if (!state.currentBlockType) {
    return [];
  }
  
  const nbBlocksRemaining = getRemainingBlocks(state);
  
  // Si on a une direction, calculer la prochaine position
  if (state.sequenceDirection && state.sequenceStartPosition && state.blocksPlacedInSequence > 0) {
    const lastBlockIndex = state.blocksPlacedInSequence - 1;
    const currentPos = {
      x: state.sequenceStartPosition.x + state.sequenceDirection.dx * lastBlockIndex,
      y: state.sequenceStartPosition.y + state.sequenceDirection.dy * lastBlockIndex
    };
    
    const nextPos = getNextPositionInDirection(
      state.board, 
      currentPos, 
      state.sequenceDirection, 
      state.currentBlockType,
      state.currentPlayer,
      nbBlocksRemaining
    );
    return nextPos ? [nextPos] : [];
  }
  
  // Si on a une position de départ mais pas de direction (2ème bloc)
  if (state.sequenceStartPosition) {
    return getAlignedPositions(
      state.board, 
      state.sequenceStartPosition, 
      state.currentBlockType,
      state.currentPlayer,
      nbBlocksRemaining
    );
  }
  
  // Positions normales pour début de séquence
  return getPlayablePositions(
    state.board, 
    state.currentPlayer, 
    state.currentBlockType,
    nbBlocksRemaining > 0 ? nbBlocksRemaining : undefined
  );
};

