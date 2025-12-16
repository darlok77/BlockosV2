import { describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import type { RootState } from '../../../store/index';
import type { GameState } from '../../../store/slices/gameSliceHelpers';
import type { Cell } from '../../../data/mapLayout';
import {
  selectIsCellPlayable,
  selectPlayerCells,
  selectCurrentSequence,
  selectBlocksToPlace,
  selectCanPlaceBlock,
  selectHasUnplacedSequences,
  selectPlayerBaseHp,
} from '../../../store/slices/gameSelectors';

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

const createMockState = (overrides: Partial<GameState> = {}): RootState => {
  const defaultState: GameState = {
    board: createBoard(5),
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

  return {
    game: { ...defaultState, ...overrides },
  } as RootState;
};

describe('gameSelectors', () => {
  describe('selectIsCellPlayable', () => {
    it('should return true when cell is playable', () => {
      const playablePositions = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
      const state = createMockState({ playablePositions });

      const selector = selectIsCellPlayable(1, 2);
      expect(selector(state)).toBe(true);
    });

    it('should return false when cell is not playable', () => {
      const playablePositions = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
      const state = createMockState({ playablePositions });

      const selector = selectIsCellPlayable(5, 5);
      expect(selector(state)).toBe(false);
    });
  });

  describe('selectPlayerCells', () => {
    it('should return all cells owned by a player', () => {
      const board = createBoard(3);
      board[0][0] = createCell({ owner: 1 });
      board[1][1] = createCell({ owner: 1 });
      board[2][2] = createCell({ owner: 2 });
      const state = createMockState({ board });

      const selector = selectPlayerCells(1);
      const cells = selector(state);

      expect(cells).toHaveLength(2);
      expect(cells[0]).toEqual({ x: 0, y: 0, cell: board[0][0] });
      expect(cells[1]).toEqual({ x: 1, y: 1, cell: board[1][1] });
    });

    it('should return empty array when player has no cells', () => {
      const board = createBoard(3);
      const state = createMockState({ board });

      const selector = selectPlayerCells(1);
      const cells = selector(state);

      expect(cells).toEqual([]);
    });
  });

  describe('selectCurrentSequence', () => {
    it('should return the current sequence when index is valid', () => {
      const sequencesToPlace = [
        { type: 'attack' as const, nbBlocks: 1 },
        { type: 'defense' as const, nbBlocks: 2 },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: 1,
      });

      expect(selectCurrentSequence(state)).toEqual(sequencesToPlace[1]);
    });

    it('should return null when index is negative', () => {
      const sequencesToPlace = [
        { type: 'attack' as const, nbBlocks: 1 },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: -1,
      });

      expect(selectCurrentSequence(state)).toBeNull();
    });

    it('should return null when index is out of bounds', () => {
      const sequencesToPlace = [
        { type: 'attack' as const, nbBlocks: 1 },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: 5,
      });

      expect(selectCurrentSequence(state)).toBeNull();
    });
  });

  describe('selectBlocksToPlace', () => {
    it('should calculate blocks to place from dice used', () => {
      const state = createMockState({ diceUsed: [5, 6] });

      const result = selectBlocksToPlace(state);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ type: 'attack', nbBlocks: 1 });
      expect(result[1]).toEqual({ type: 'attack', nbBlocks: 2 });
    });
  });

  describe('selectCanPlaceBlock', () => {
    it('should return true when blocks can still be placed', () => {
      const nbBlocks = faker.number.int({ min: 2, max: 5 });
      const blocksPlaced = faker.number.int({ min: 0, max: nbBlocks - 1 });
      const sequencesToPlace = [
        { 
          type: faker.helpers.arrayElement(['attack', 'defense', 'destroy'] as const), 
          nbBlocks 
        },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: 0,
        blocksPlacedInSequence: blocksPlaced,
      });

      expect(selectCanPlaceBlock(state)).toBe(true);
    });

    it('should return false when all blocks are placed', () => {
      const nbBlocks = faker.number.int({ min: 1, max: 5 });
      const sequencesToPlace = [
        { 
          type: faker.helpers.arrayElement(['attack', 'defense', 'destroy'] as const), 
          nbBlocks 
        },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: 0,
        blocksPlacedInSequence: nbBlocks,
      });

      expect(selectCanPlaceBlock(state)).toBe(false);
    });

    it('should return false when no current sequence', () => {
      const state = createMockState({
        currentSequenceIndex: -1,
        blocksPlacedInSequence: 0,
      });

      expect(selectCanPlaceBlock(state)).toBe(false);
    });
  });

  describe('selectHasUnplacedSequences', () => {
    it('should return true when there are unplaced sequences', () => {
      const sequencesToPlace = [
        { type: 'attack' as const, nbBlocks: 1 },
        { type: 'defense' as const, nbBlocks: 2 },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: 0,
      });

      expect(selectHasUnplacedSequences(state)).toBe(true);
    });

    it('should return false when all sequences are placed', () => {
      const sequencesToPlace = [
        { type: 'attack' as const, nbBlocks: 1 },
        { type: 'defense' as const, nbBlocks: 2 },
      ];
      const state = createMockState({
        sequencesToPlace,
        currentSequenceIndex: 1,
      });

      expect(selectHasUnplacedSequences(state)).toBe(false);
    });
  });

  describe('selectPlayerBaseHp', () => {
    it('should return the base HP for a player', () => {
      const baseHpCache = { 1: 10, 2: 5 };
      const state = createMockState({ baseHpCache });

      const selector = selectPlayerBaseHp(1);
      expect(selector(state)).toBe(10);
    });

    it('should return 0 when player has no base HP', () => {
      const baseHpCache = { 1: 10 };
      const state = createMockState({ baseHpCache });

      const selector = selectPlayerBaseHp(2);
      expect(selector(state)).toBe(0);
    });
  });

});

