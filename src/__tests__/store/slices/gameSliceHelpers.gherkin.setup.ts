import { expect } from 'vitest';
import { createGherkinRunner } from '../../../utils/gherkin';
import type { Cell } from '../../../data/mapLayout';
import type { GameState } from '../../../store/slices/gameSliceHelpers';
import {
  captureTerritories,
  calculatePlayablePositions,
  getRemainingBlocks,
  getBaseHpForPlayer,
  getAlivePlayers,
  updateBaseHpCache,
  initializeBaseHpCache,
  recomputeEliminationsAndWinner,
} from '../../../store/slices/gameSliceHelpers';

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

export const createGameSliceHelpersRunner = () => {
  return createGherkinRunner({
    given: {
      'a board of {number} x {number}': (size: number): Cell[][] => {
        return createBoard(size);
      },
      'a block of player {number} at position ({number}, {number})': (
        player: number,
        x: number,
        y: number,
        board: Cell[][]
      ): Cell[][] => {
        board[x][y] = createCell({ owner: player, territory: 0, zone: 0 });
        return board;
      },
      'a free cell at position ({number}, {number}) with territory {number} and zone {number}': (
        x: number,
        y: number,
        territory: number,
        zone: number,
        board: Cell[][]
      ): Cell[][] => {
        board[x][y] = createCell({ owner: 0, territory, zone });
        return board;
      },
      'a game state with board size {number} x {number}': (size: number): GameState => {
        return {
          board: createBoard(size),
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
      'a sequence of type {string} with {number} blocks': (
        type: string,
        nbBlocks: number,
        state: GameState
      ): GameState => {
        state.sequencesToPlace = [{ type: type as 'attack' | 'defense' | 'destroy', nbBlocks }];
        state.currentSequenceIndex = 0;
        state.currentBlockType = type as 'attack' | 'defense' | 'destroy' | null;
        return state;
      },
      'blocks placed in sequence: {number}': (count: number, state: GameState): GameState => {
        state.blocksPlacedInSequence = count;
        return state;
      },
      'sequence start position ({number}, {number})': (x: number, y: number, state: GameState): GameState => {
        state.sequenceStartPosition = { x, y };
        return state;
      },
      'sequence direction ({number}, {number})': (dx: number, dy: number, state: GameState): GameState => {
        state.sequenceDirection = { dx, dy };
        return state;
      },
      'a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}': (
        x: number,
        y: number,
        owner: number,
        territory: number,
        zone: number,
        state: GameState
      ): GameState => {
        state.board[x][y] = createCell({ owner, territory, zone });
        return state;
      },
      'a base of player {number} at position ({number}, {number}) with HP {number}': (
        player: number,
        x: number,
        y: number,
        hp: number,
        board: Cell[][]
      ): Cell[][] => {
        board[x][y] = createCell({ type: 'base', owner: player, hp });
        return board;
      },
      'a base of player {number} at position ({number}, {number}) with HP {number} in state': (
        player: number,
        x: number,
        y: number,
        hp: number,
        state: GameState
      ): GameState => {
        state.board[x][y] = createCell({ type: 'base', owner: player, hp });
        return state;
      },
      'current sequence index: {number}': (index: number, state: GameState): GameState => {
        state.currentSequenceIndex = index;
        return state;
      },
      'number of players: {number}': (nbPlayers: number, state: GameState): GameState => {
        state.nbPlayers = nbPlayers;
        return state;
      },
      'base HP cache for player {number}: {number}': (player: number, hp: number, state: GameState): GameState => {
        state.baseHpCache[player] = hp;
        return state;
      },
      'base HP cache': (cache: Record<number, number>, state: GameState): GameState => {
        state.baseHpCache = cache;
        return state;
      },
    },
    when: {
      'I capture territories for player {number}': (player: number, board: Cell[][]): void => {
        captureTerritories(board, player);
      },
      'I calculate playable positions': (state: GameState): Array<{ x: number; y: number }> => {
        return calculatePlayablePositions(state);
      },
      'I calculate remaining blocks': (state: GameState): number => {
        return getRemainingBlocks(state);
      },
      'I calculate base HP for player {number}': (player: number, board: Cell[][]): number => {
        return getBaseHpForPlayer(board, player);
      },
      'I get alive players': (board: Cell[][], nbPlayers: number): number[] => {
        return getAlivePlayers(board, nbPlayers);
      },
      'I update base HP cache at position ({number}, {number})': (x: number, y: number, state: GameState): void => {
        updateBaseHpCache(state, x, y);
      },
      'I initialize base HP cache': (state: GameState): void => {
        initializeBaseHpCache(state);
      },
      'I recompute eliminations and winner': (state: GameState): void => {
        recomputeEliminationsAndWinner(state);
      },
    },
    then: {
      'cell at position ({number}, {number}) should have territory {number}': (
        x: number,
        y: number,
        territory: number,
        board: Cell[][]
      ): void => {
        expect(board[x][y].territory).toBe(territory);
      },
      'I should have at least {number} playable position(s)': (
        minCount: number,
        positions: Array<{ x: number; y: number }>
      ): void => {
        expect(positions.length).toBeGreaterThanOrEqual(minCount);
      },
      'I should have exactly {number} playable position(s)': (
        count: number,
        positions: Array<{ x: number; y: number }>
      ): void => {
        expect(positions.length).toBe(count);
      },
      'I should find position ({number}, {number}) in playable positions': (
        x: number,
        y: number,
        positions: Array<{ x: number; y: number }>
      ): void => {
        expect(positions.some(p => p.x === x && p.y === y)).toBe(true);
      },
      'remaining blocks should be {number}': (expected: number, actual: number): void => {
        expect(actual).toBe(expected);
      },
      'base HP for player {number} should be {number}': (player: number, expected: number, actual: number): void => {
        expect(actual).toBe(expected);
      },
      'alive players should be': (expected: number[], actual: number[]): void => {
        expect(actual).toEqual(expected);
      },
      'base HP cache for player {number} should be {number}': (player: number, expected: number, state: GameState): void => {
        expect(state.baseHpCache[player]).toBe(expected);
      },
      'eliminated players should be': (expected: number[], state: GameState): void => {
        expect(state.eliminatedPlayers).toEqual(expected);
      },
      'winner should be {number}': (expected: number | null, state: GameState): void => {
        expect(state.winner).toBe(expected);
      },
      'game should be over': (state: GameState): void => {
        expect(state.isGameOver).toBe(true);
      },
      'game should not be over': (state: GameState): void => {
        expect(state.isGameOver).toBe(false);
      },
      'winner should be null': (state: GameState): void => {
        expect(state.winner).toBeNull();
      },
      'base HP cache should be': (expected: Record<number, number>, state: GameState): void => {
        expect(state.baseHpCache).toEqual(expected);
      },
      'playable positions should be': (expected: Array<{ x: number; y: number }>, state: GameState): void => {
        expect(state.playablePositions).toEqual(expected);
      },
    },
  });
};

