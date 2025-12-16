import { expect } from 'vitest';
import { createGherkinRunner } from '../../../utils/gherkin';
import type { Cell } from '../../../data/mapLayout';
import type { GameState } from '../../../store/slices/gameSliceHelpers';
import gameReducer, {
  setDiceResult,
  setDiceUsedValue,
  selectSequence,
  setSequenceStartPosition,
  setSequenceDirection,
  incrementBlocksPlaced,
  completeSequence,
  updateCell,
  playablePositions,
  initBoard,
  passTurn,
} from '../../../store/slices/gameSlice';
import type { BlockToPlace } from '../../../utils/gameRules';

const createCell = (overrides: Partial<Cell> = {}): Cell => ({
  type: 'land',
  owner: 0,
  territory: 0,
  zone: 0,
  hp: 0,
  ...overrides,
});

const createBoard = (size: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let x = 0; x < size; x++) {
    board[x] = [];
    for (let y = 0; y < size; y++) {
      board[x][y] = createCell();
    }
  }
  return board;
};

export const createGameSliceRunner = () => {
  return createGherkinRunner({
    given: {
      'a game state with board size {number} x {number}': (size: number): GameState => {
        const board = createBoard(size);
        return {
          board,
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
      },
      'dice result is {number} and {number}': (die1: number, die2: number, state: GameState): GameState => {
        return gameReducer(state, setDiceResult({ die1, die2 }));
      },
      'dice used values {array} with sequences': (
        diceValues: number[],
        sequences: BlockToPlace[],
        state: GameState
      ): GameState => {
        return gameReducer(state, setDiceUsedValue({ diceValues, sequences }));
      },
      'sequence {number} is selected': (index: number, state: GameState): GameState => {
        return gameReducer(state, selectSequence(index));
      },
      'sequence start position is ({number}, {number})': (x: number, y: number, state: GameState): GameState => {
        return gameReducer(state, setSequenceStartPosition({ x, y }));
      },
      'sequence direction is ({number}, {number})': (dx: number, dy: number, state: GameState): GameState => {
        return gameReducer(state, setSequenceDirection({ dx, dy }));
      },
      'blocks placed count is {number}': (count: number, state: GameState): GameState => {
        let newState = { ...state };
        for (let i = 0; i < count; i++) {
          newState = gameReducer(newState, incrementBlocksPlaced());
        }
        return newState;
      },
      'a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}': (
        x: number,
        y: number,
        owner: number,
        territory: number,
        zone: number,
        state: GameState
      ): GameState => {
        const newBoard = state.board.map((row, i) => 
          i === x ? row.map((cell, j) => j === y ? createCell({ owner, territory, zone }) : cell) : row
        );
        return { ...state, board: newBoard };
      },
      'a board of {number} x {number}': (size: number): Cell[][] => {
        return createBoard(size);
      },
      'a base of player {number} at position ({number}, {number}) with HP {number}': (
        player: number,
        x: number,
        y: number,
        hp: number,
        state: GameState
      ): GameState => {
        const newBoard = state.board.map((row, i) => 
          i === x ? row.map((cell, j) => j === y ? createCell({ type: 'base', owner: player, hp }) : cell) : row
        );
        return { ...state, board: newBoard };
      },
      'current player is {number}': (player: number, state: GameState): GameState => {
        return { ...state, currentPlayer: player };
      },
      'number of players is {number}': (nbPlayers: number, state: GameState): GameState => {
        return { ...state, nbPlayers };
      },
      'game is over': (state: GameState): GameState => {
        return { ...state, isGameOver: true };
      },
      'base HP cache': (cache: Record<number, number>, state: GameState): GameState => {
        return { ...state, baseHpCache: cache };
      },
    },
    when: {
      'I dispatch setDiceResult with {number} and {number}': (die1: number, die2: number, state: GameState): GameState => {
        return gameReducer(state, setDiceResult({ die1, die2 }));
      },
      'I dispatch setDiceUsedValue with dice {array} and sequences': (
        diceValues: number[],
        sequences: BlockToPlace[],
        state: GameState
      ): GameState => {
        return gameReducer(state, setDiceUsedValue({ diceValues, sequences }));
      },
      'I dispatch selectSequence {number}': (index: number, state: GameState): GameState => {
        return gameReducer(state, selectSequence(index));
      },
      'I dispatch setSequenceStartPosition ({number}, {number})': (x: number, y: number, state: GameState): GameState => {
        return gameReducer(state, setSequenceStartPosition({ x, y }));
      },
      'I dispatch setSequenceDirection ({number}, {number})': (dx: number, dy: number, state: GameState): GameState => {
        return gameReducer(state, setSequenceDirection({ dx, dy }));
      },
      'I dispatch incrementBlocksPlaced': (state: GameState): GameState => {
        return gameReducer(state, incrementBlocksPlaced());
      },
      'I dispatch completeSequence': (state: GameState): GameState => {
        return gameReducer(state, completeSequence());
      },
      'I dispatch updateCell at ({number}, {number}) with': (
        x: number,
        y: number,
        payload: { hp?: number; owner?: number; territory?: number },
        state: GameState
      ): GameState => {
        return gameReducer(state, updateCell({ x, y, ...payload }));
      },
      'I dispatch playablePositions': (state: GameState): GameState => {
        return gameReducer(state, playablePositions());
      },
      'I dispatch initBoard': (board: Cell[][], state: GameState): GameState => {
        return gameReducer(state, initBoard(board));
      },
      'I dispatch passTurn': (state: GameState): GameState => {
        return gameReducer(state, passTurn());
      },
    },
    then: {
      'dice result should be {number} and {number}': (die1: number, die2: number, state: GameState): void => {
        expect(state.diceResult).toEqual({ die1, die2 });
      },
      'dice result should be null': (state: GameState): void => {
        expect(state.diceResult).toBeNull();
      },
      'dice used should be {array}': (expected: number[], state: GameState): void => {
        expect(state.diceUsed).toEqual(expected);
      },
      'sequences to place should be': (expected: BlockToPlace[], state: GameState): void => {
        expect(state.sequencesToPlace).toEqual(expected);
      },
      'current sequence index should be {number}': (expected: number, state: GameState): void => {
        expect(state.currentSequenceIndex).toBe(expected);
      },
      'current block type should be {string}': (expected: string | null, state: GameState): void => {
        expect(state.currentBlockType).toBe(expected);
      },
      'blocks placed in sequence should be {number}': (expected: number, state: GameState): void => {
        expect(state.blocksPlacedInSequence).toBe(expected);
      },
      'sequence start position should be ({number}, {number})': (x: number, y: number, state: GameState): void => {
        expect(state.sequenceStartPosition).toEqual({ x, y });
      },
      'sequence start position should be null': (state: GameState): void => {
        expect(state.sequenceStartPosition).toBeNull();
      },
      'sequence direction should be ({number}, {number})': (dx: number, dy: number, state: GameState): void => {
        expect(state.sequenceDirection).toEqual({ dx, dy });
      },
      'sequence direction should be null': (state: GameState): void => {
        expect(state.sequenceDirection).toBeNull();
      },
      'completed sequences should be {array}': (expected: number[], state: GameState): void => {
        expect(state.completedSequences).toEqual(expected);
      },
      'playable positions should have at least {number} position(s)': (minCount: number, state: GameState): void => {
        expect(state.playablePositions.length).toBeGreaterThanOrEqual(minCount);
      },
      'playable positions should be empty': (state: GameState): void => {
        expect(state.playablePositions).toEqual([]);
      },
      'current player should be {number}': (expected: number, state: GameState): void => {
        expect(state.currentPlayer).toBe(expected);
      },
      'board should be': (expected: Cell[][], state: GameState): void => {
        expect(state.board).toEqual(expected);
      },
      'cell at ({number}, {number}) should have owner {number}': (x: number, y: number, owner: number, state: GameState): void => {
        expect(state.board[x][y].owner).toBe(owner);
      },
      'cell at ({number}, {number}) should have HP {number}': (x: number, y: number, hp: number, state: GameState): void => {
        expect(state.board[x][y].hp).toBe(hp);
      },
      'cell at ({number}, {number}) should have territory {number}': (x: number, y: number, territory: number, state: GameState): void => {
        expect(state.board[x][y].territory).toBe(territory);
      },
      'game should not be over': (state: GameState): void => {
        expect(state.isGameOver).toBe(false);
      },
    },
  });
};

