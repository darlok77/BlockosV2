import { describe, it, expect } from 'vitest';
import type { Cell } from '../../data/mapLayout';
import {
  calculateBlocksToPlace,
  calculateBlocksToPlaceSequentially,
  canPlaceBlockOnCell,
} from '../../utils/gameRules';
import { 
  createGameRulesRunner,
} from './gameRules.gherkin.setup';

describe('gameRules', () => {
  describe('calculateBlocksToPlace', () => {
    it('should return 1 destroy block for value 1', () => {
      const result = calculateBlocksToPlace([1]);
      expect(result).toEqual([{ type: 'destroy', nbBlocks: 1 }]);
    });

    it('should return 1 defense block for value 2', () => {
      const result = calculateBlocksToPlace([2]);
      expect(result).toEqual([{ type: 'defense', nbBlocks: 1 }]);
    });

    it('should return 2 defense blocks for value 3', () => {
      const result = calculateBlocksToPlace([3]);
      expect(result).toEqual([{ type: 'defense', nbBlocks: 2 }]);
    });

    it('should return 3 defense blocks for value 4', () => {
      const result = calculateBlocksToPlace([4]);
      expect(result).toEqual([{ type: 'defense', nbBlocks: 3 }]);
    });

    it('should return 1 attack block for value 5', () => {
      const result = calculateBlocksToPlace([5]);
      expect(result).toEqual([{ type: 'attack', nbBlocks: 1 }]);
    });

    it('should return 2 attack blocks for value 6', () => {
      const result = calculateBlocksToPlace([6]);
      expect(result).toEqual([{ type: 'attack', nbBlocks: 2 }]);
    });

    it('should return empty array for invalid value', () => {
      const result = calculateBlocksToPlace([0]);
      expect(result).toEqual([]);
    });

    it('should return empty array for value > 6', () => {
      const result = calculateBlocksToPlace([7]);
      expect(result).toEqual([]);
    });

    it('should handle multiple dice', () => {
      const result = calculateBlocksToPlace([3, 4]);
      expect(result).toEqual([
        { type: 'defense', nbBlocks: 2 },
        { type: 'defense', nbBlocks: 3 },
      ]);
    });

    it('should handle multiple dice of different types', () => {
      const result = calculateBlocksToPlace([1, 5, 6]);
      expect(result).toEqual([
        { type: 'destroy', nbBlocks: 1 },
        { type: 'attack', nbBlocks: 1 },
        { type: 'attack', nbBlocks: 2 },
      ]);
    });

    it('should return empty array for empty array', () => {
      const result = calculateBlocksToPlace([]);
      expect(result).toEqual([]);
    });
  });

  describe('calculateBlocksToPlaceSequentially', () => {
    it('should create individual blocks for value 3', () => {
      const result = calculateBlocksToPlaceSequentially([3]);
      expect(result).toEqual([
        { type: 'defense', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 1 },
      ]);
    });

    it('should create individual blocks for multiple dice', () => {
      const result = calculateBlocksToPlaceSequentially([3, 4]);
      expect(result).toEqual([
        { type: 'defense', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 1 },
      ]);
    });

    it('should create individual blocks for value 6', () => {
      const result = calculateBlocksToPlaceSequentially([6]);
      expect(result).toEqual([
        { type: 'attack', nbBlocks: 1 },
        { type: 'attack', nbBlocks: 1 },
      ]);
    });
  });

  describe('canPlaceBlockOnCell', () => {
    const createCell = (overrides: Partial<Cell>): Cell => ({
      type: 'land',
      owner: 0,
      territory: 0,
      zone: 0,
      hp: 0,
      ...overrides,
    });

    describe('defense', () => {
      it('should allow placement on free cell in player territory', () => {
        const cell = createCell({ owner: 0, territory: 1, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'defense', 1)).toBe(true);
      });

      it('should allow placement on free cell in player zone', () => {
        const cell = createCell({ owner: 0, territory: 0, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'defense', 1)).toBe(true);
      });

      it('should not allow placement on occupied cell', () => {
        const cell = createCell({ owner: 1, territory: 1, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'defense', 1)).toBe(false);
      });

      it('should not allow placement on free cell outside territory/zone', () => {
        const cell = createCell({ owner: 0, territory: 0, zone: 0 });
        expect(canPlaceBlockOnCell(cell, 'defense', 1)).toBe(false);
      });

      it('should not allow placement on another player\'s cell', () => {
        const cell = createCell({ owner: 2, territory: 2, zone: 2 });
        expect(canPlaceBlockOnCell(cell, 'defense', 1)).toBe(false);
      });
    });

    describe('attack', () => {
      it('should allow attack on enemy base', () => {
        const cell = createCell({ type: 'base', owner: 2, territory: 2, zone: 2 });
        expect(canPlaceBlockOnCell(cell, 'attack', 1)).toBe(true);
      });

      it('should allow attack on free cell in enemy zone', () => {
        const cell = createCell({ owner: 0, territory: 0, zone: 2 });
        expect(canPlaceBlockOnCell(cell, 'attack', 1)).toBe(true);
      });

      it('should not allow attack on destroyed block', () => {
        const cell = createCell({ owner: -1, territory: 0, zone: 0 });
        expect(canPlaceBlockOnCell(cell, 'attack', 1)).toBe(false);
      });

      it('should not allow attack on free cell in player zone', () => {
        const cell = createCell({ owner: 0, territory: 0, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'attack', 1)).toBe(false);
      });

      it('should not allow attack on own base', () => {
        const cell = createCell({ type: 'base', owner: 1, territory: 1, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'attack', 1)).toBe(false);
      });

      it('should not allow attack on cell occupied by player', () => {
        const cell = createCell({ owner: 1, territory: 1, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'attack', 1)).toBe(false);
      });
    });

    describe('destroy', () => {
      it('should allow destruction on enemy cell in enemy territory', () => {
        const cell = createCell({ owner: 2, territory: 2, zone: 2, type: 'land' });
        expect(canPlaceBlockOnCell(cell, 'destroy', 1)).toBe(true);
      });

      it('should not allow destruction on free cell', () => {
        const cell = createCell({ owner: 0, territory: 0, zone: 0 });
        expect(canPlaceBlockOnCell(cell, 'destroy', 1)).toBe(false);
      });

      it('should not allow destruction on own cell', () => {
        const cell = createCell({ owner: 1, territory: 1, zone: 1 });
        expect(canPlaceBlockOnCell(cell, 'destroy', 1)).toBe(false);
      });

      it('should not allow destruction on cell in own territory', () => {
        const cell = createCell({ owner: 2, territory: 1, zone: 2 });
        expect(canPlaceBlockOnCell(cell, 'destroy', 1)).toBe(false);
      });

      it('should not allow destruction on base', () => {
        const cell = createCell({ type: 'base', owner: 2, territory: 2, zone: 2 });
        expect(canPlaceBlockOnCell(cell, 'destroy', 1)).toBe(false);
      });
    });
  });

  describe('getAlignedPositions', () => {
    const game = createGameRulesRunner();

    it('should return valid adjacent positions for defense', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 1, 1, state);

      const positions = game.when('I search for aligned positions from ({number}, {number})', 2, 2, 'defense', 1, 1, state);

      game.then('I should have at least {number} position(s)', 0, positions);
      game.then('I should find position ({number}, {number})', 2, 1, positions);
    });

    it('should verify that all remaining blocks can be placed', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 1, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 0, 1, state);

      const positions = game.when('I search for aligned positions from ({number}, {number})', 2, 2, 'defense', 1, 2, state);

      game.then('I should find position ({number}, {number})', 2, 1, positions);
    });

    it('should not return positions out of bounds', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 0, state);

      const positions = game.when('I search for aligned positions from ({number}, {number})', 0, 0, 'defense', 1, 1, state);

      game.then('I should have all positions in bounds', positions);
    });

    it('should allow jumping over destroyed block for attack towards base', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a destroyed block at position ({number}, {number})', 2, 1, state);
      game.given('a base of player {number} at position ({number}, {number})', 2, 2, 0, state);

      const positions = game.when('I search for aligned positions from ({number}, {number})', 2, 2, 'attack', 1, 1, state);

      game.then('I should find position ({number}, {number})', 2, 0, positions);
    });
  });

  describe('getNextPositionInDirection', () => {
    const game = createGameRulesRunner();

    it('should return valid next position in right direction', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) in player {number} territory', 2, 2, 1, state);
      game.given('a cell at position ({number}, {number}) in player {number} zone', 2, 2, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 3, 1, state);

      const nextPos = game.when('I search for the next position in direction ({number}, {number})', 2, 2, 0, 1, 'defense', 1, 1, state);

      game.then('I should return position ({number}, {number})', 2, 3, nextPos);
    });

    it('should return null if position out of bounds', () => {
      const state = game.given('a board of {number} x {number}', 5);

      const nextPos = game.when('I search for the next position in direction ({number}, {number})', 0, 0, -1, 0, 'defense', 1, 1, state);

      game.then('I should return null', nextPos);
    });

    it('should verify that all remaining blocks can be placed', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) in player {number} territory', 2, 2, 1, state);
      game.given('a cell at position ({number}, {number}) in player {number} zone', 2, 2, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 3, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 4, 1, state);

      const nextPos = game.when('I search for the next position in direction ({number}, {number})', 2, 2, 0, 1, 'defense', 1, 2, state);

      game.then('I should return position ({number}, {number})', 2, 3, nextPos);
    });

    it('should return null if not enough space for all blocks', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) in player {number} territory', 2, 2, 1, state);
      game.given('a cell at position ({number}, {number}) in player {number} zone', 2, 2, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 3, 1, state);

      const nextPos = game.when('I search for the next position in direction ({number}, {number})', 2, 2, 0, 1, 'defense', 1, 3, state);

      game.then('I should return null', nextPos);
    });
  });

  describe('getPlayablePositions', () => {
    const game = createGameRulesRunner();

    it('should return all valid destroy positions', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 2, 1, 1, state);

      const positions = game.when('I search for playable positions', 'destroy', 1, undefined, state);

      game.then('I should find position ({number}, {number})', 1, 1, positions);
    });

    it('should return adjacent positions for defense', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 1, 1, state);

      const positions = game.when('I search for playable positions', 'defense', 1, undefined, state);

      game.then('I should find position ({number}, {number})', 2, 1, positions);
    });

    it('should return adjacent positions for attack', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a base of player {number} at position ({number}, {number})', 2, 2, 1, state);

      const positions = game.when('I search for playable positions', 'attack', 1, undefined, state);

      game.then('I should find position ({number}, {number})', 2, 1, positions);
    });

    it('should return positions for sequence of multiple blocks', () => {
      const state = game.given('a board of {number} x {number}', 6);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 3, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 4, 1, state);
      game.given('a free cell at position ({number}, {number}) in player {number} territory', 2, 5, 1, state);

      const positions = game.when('I search for playable positions', 'defense', 1, 3, state);

      game.then('I should have at least {number} position(s)', 0, positions);
      game.then('I should find position ({number}, {number})', 2, 3, positions);
    });

    it('should return empty array if no block type specified and no owned cells', () => {
      const state = game.given('a board of {number} x {number}', 5);

      const positions = game.when('I search for playable positions', undefined, 1, undefined, state);

      game.then('I should have exactly {number} position(s)', 0, positions);
    });
  });

  describe('calculateTerritoryCapture', () => {
    const game = createGameRulesRunner();

    it('should capture territory horizontally', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 2, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 0, state);

      const captures = game.when('I calculate territory capture after placement at ({number}, {number})', 2, 2, 1, state);

      game.then('I should have at least {number} capture(s)', 1, captures);
    });

    it('should capture territory vertically', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 0, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 1, state);

      const captures = game.when('I calculate territory capture after placement at ({number}, {number})', 2, 2, 1, state);

      game.then('I should have at least {number} capture(s)', 1, captures);
    });

    it('should capture territory in cross pattern (horizontal + vertical)', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 2, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 0, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 1, state);

      const captures = game.when('I calculate territory capture after placement at ({number}, {number})', 2, 2, 1, state);

      game.then('I should have at least {number} capture(s)', 1, captures);
    });

    it('should not capture cells already in a territory', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 2, state);
      game.given('a cell at position ({number}, {number}) in player {number} territory', 1, 2, 2, state);

      const captures = game.when('I calculate territory capture after placement at ({number}, {number})', 2, 2, 1, state);

      game.then('I should have all captures with territory {number}', 1, captures);
    });

    it('should not capture cells in a zone', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 2, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 2, state);
      game.given('a cell at position ({number}, {number}) in player {number} zone', 1, 2, 2, state);

      const captures = game.when('I calculate territory capture after placement at ({number}, {number})', 2, 2, 1, state);

      game.then('I should have all captures with territory {number}', 1, captures);
    });
  });

  describe('calculateAllTerritoryCapture', () => {
    const game = createGameRulesRunner();

    it('should capture all possible territories', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 1, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 3, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 3, 1, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 3, 3, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 2, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 0, state);

      const captures = game.when('I calculate all territory captures', 1, state);
      game.then('I should have at least {number} capture(s)', 1, captures);
    });

    it('should capture cell at intersection of row and column with blocks', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 1, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 3, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 3, 1, state);

      const captures = game.when('I calculate all territory captures', 1, state);

        game.then('I should find position ({number}, {number}) in captures', 3, 3, captures);
    });

    it('should not capture cells with non-zero zone or territory', () => {
      const state = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 1, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 3, state);
      game.given('a block of player {number} at position ({number}, {number})', 1, 3, 1, state);
      game.given('a cell at position ({number}, {number}) in player {number} territory', 2, 2, 2, state);

      const captures = game.when('I calculate all territory captures', 1, state);

      // All captures should have territory=1 (the assigned territory)
      game.then('I should have all captures with territory {number}', 1, captures);
    });
  });
});

