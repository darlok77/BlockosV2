import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { trainingMapLayout, type Cell } from "../../data/mapLayout";
import type { BlockToPlace } from "../../utils/gameRules";
import { getPlayablePositions } from "../../utils/gameRules";
import { 
  type GameState, 
  type UpdateCellPayload,
  markSequenceAsCompleted,
  getInitialSequenceState,
  captureTerritories,
  updateCellAttributes,
  calculatePlayablePositions,
  recomputeEliminationsAndWinner,
  getAlivePlayers,
  initializeBaseHpCache,
  updateBaseHpCache
} from "./gameSliceHelpers";

const initialState: GameState = {
  board: trainingMapLayout,
  currentPlayer: 1,
	nbPlayers: 2,
  diceResult: null,
  diceUsed: [],
	playablePositions: [],
	sequencesToPlace: [],
	currentSequenceIndex: -1,
	blocksPlacedInSequence: 0,
	sequenceStartPosition: null,
	sequenceDirection: null,
	completedSequences: [],
	currentBlockType: null,
	eliminatedPlayers: [],
	winner: null,
	isGameOver: false,
	baseHpCache: {},
};

// Initialiser le cache des HP des bases
initializeBaseHpCache(initialState);


export interface DiceValue {
  dice1: number;
  dice2: number;
  used: boolean; // pour savoir si ce lancer a été utilisé
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
		initBoard(state, action: PayloadAction<Cell[][]>) {
      state.board = action.payload;
    },
		playablePositions(state) {
			state.playablePositions = calculatePlayablePositions(state);
		},
    setDiceResult: (state, action: PayloadAction<{ die1: number; die2: number }>) => {
      if (state.diceResult !== null || state.diceUsed.length > 0) return;
      Object.assign(state, {
        diceResult: action.payload,
        ...getInitialSequenceState(),
        diceUsed: []
      });
    },
    setDiceUsedValue: (state, action: PayloadAction<{ diceValues: number[], sequences: BlockToPlace[] }>) => {
      if (state.diceUsed.length > 0) return;
      Object.assign(state, {
        diceUsed: action.payload.diceValues,
        sequencesToPlace: action.payload.sequences,
        currentSequenceIndex: -1,
        blocksPlacedInSequence: 0,
        sequenceStartPosition: null,
        sequenceDirection: null,
        completedSequences: [],
        currentBlockType: null
      });
    },
		selectSequence(state, action: PayloadAction<number>) {
			Object.assign(state, {
				currentSequenceIndex: action.payload,
				blocksPlacedInSequence: 0,
				sequenceStartPosition: null,
				sequenceDirection: null,
				currentBlockType: state.sequencesToPlace[action.payload]?.type || null
			});
		},
		setSequenceStartPosition(state, action: PayloadAction<{ x: number; y: number }>) {
			state.sequenceStartPosition = action.payload;
		},
		setSequenceDirection(state, action: PayloadAction<{ dx: number; dy: number }>) {
			state.sequenceDirection = action.payload;
		},
		incrementBlocksPlaced(state) {
			state.blocksPlacedInSequence += 1;
		},
		completeSequence(state) {
			if (state.currentSequenceIndex >= 0) {
				markSequenceAsCompleted(state, state.currentSequenceIndex);
			}
			captureTerritories(state.board, state.currentPlayer);
			
			// Passe à la séquence suivante
			const nextIndex = state.currentSequenceIndex + 1;
			Object.assign(state, {
				currentSequenceIndex: nextIndex,
				blocksPlacedInSequence: 0,
				sequenceStartPosition: null,
				sequenceDirection: null
			});
			
			// Recalculer les positions jouables pour la nouvelle séquence
			if (nextIndex < state.sequencesToPlace.length) {
				const currentSeq = state.sequencesToPlace[nextIndex];
				Object.assign(state, {
					currentBlockType: currentSeq.type,
					playablePositions: getPlayablePositions(state.board, state.currentPlayer, currentSeq.type, currentSeq.nbBlocks)
				});
			} else {
				Object.assign(state, {
					playablePositions: [],
					currentBlockType: null
				});
			}
		},
		updateCell(state, action: PayloadAction<UpdateCellPayload>) {
      const { x, y } = action.payload;
      const cell = state.board[x][y];
      if (!cell) return;

      updateCellAttributes(cell, action.payload);
      
      // Mettre à jour le cache des HP des bases si c'est une base qui a été modifiée
      updateBaseHpCache(state, x, y,);
      recomputeEliminationsAndWinner(state);
    },
    passTurn(state) {
      if (state.isGameOver) return;

      // Reset the turn
      Object.assign(state, {
        diceResult: null,
        diceUsed: [],
        playablePositions: [],
        ...getInitialSequenceState(),
      });

      const alivePlayers = getAlivePlayers(state.board, state.nbPlayers);
      if (alivePlayers.length <= 1) {
        recomputeEliminationsAndWinner(state);
        return;
      }

      let next = state.currentPlayer;
      for (let i = 0; i < state.nbPlayers; i++) {
        next = next === state.nbPlayers ? 1 : next + 1;
        if (alivePlayers.includes(next)) {
          state.currentPlayer = next;
          break;
        }
      }
    },
  },
});

export const { setDiceResult, setDiceUsedValue, updateCell, initBoard, playablePositions, selectSequence, setSequenceStartPosition, setSequenceDirection, incrementBlocksPlaced, completeSequence, passTurn} = gameSlice.actions;
export default gameSlice.reducer;
