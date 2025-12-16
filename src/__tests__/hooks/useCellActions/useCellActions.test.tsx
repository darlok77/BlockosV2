import { describe, it } from 'vitest';
import { createUseCellActionsRunner } from './useCellActions.gherkin.setup';

describe('useCellActions', () => {
  describe('handleCellClick', () => {
    const game = createUseCellActionsRunner();

    it('should not do anything if diceUsed is empty', () => {
      const context = game.given('a game state with dice used {array}', []);

      game.when('I call handleCellClick at ({number}, {number})', 0, 0, context);

      game.then('no action should be dispatched', context);
    });

    it('should not do anything if canPlaceBlock is false', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('can place block is {boolean}', false, context);

      game.when('I call handleCellClick at ({number}, {number})', 0, 0, context);

      game.then('no action should be dispatched', context);
    });

    it('should not do anything if currentSequence is null', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('current sequence is null', context);

      game.when('I call handleCellClick at ({number}, {number})', 0, 0, context);

      game.then('no action should be dispatched', context);
    });

    it('should not do anything if isPlayable is false', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('is playable is {boolean}', false, context);

      game.when('I call handleCellClick at ({number}, {number})', 0, 0, context);

      game.then('no action should be dispatched', context);
    });

    it('should place first block and set start position for multi-block sequence', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('current sequence is {string} with {number} blocks', 'attack', 3, context);
      context = game.given('blocks placed in sequence is {number}', 0, context);

      game.when('I call handleCellClick at ({number}, {number})', 2, 3, context);

      game.then('updateCell should be dispatched at ({number}, {number}) with owner {number}', 2, 3, 1, context);
      game.then('incrementBlocksPlaced should be dispatched', context);
      game.then('setSequenceStartPosition should be dispatched at ({number}, {number})', 2, 3, context);
    });

    it('should calculate direction when placing second block', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('current sequence is {string} with {number} blocks', 'attack', 3, context);
      context = game.given('blocks placed in sequence is {number}', 1, context);
      context = game.given('sequence start position is ({number}, {number})', 2, 3, context);

      game.when('I call handleCellClick at ({number}, {number})', 3, 3, context);

      game.then('setSequenceDirection should be dispatched with ({number}, {number})', 1, 0, context);
    });

    it('should complete sequence when all blocks are placed', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('current sequence is {string} with {number} blocks', 'attack', 2, context);
      context = game.given('blocks placed in sequence is {number}', 1, context);
      context = game.given('sequence start position is ({number}, {number})', 2, 2, context);

      game.when('I call handleCellClick at ({number}, {number})', 2, 3, context);

      game.then('completeSequence should be dispatched', context);
      game.then('playablePositions should not be dispatched', context);
    });

    it('should recalculate playable positions after placing block (if not completing)', () => {
      let context = game.given('a game state with dice used {array}', [5, 6]);
      context = game.given('current sequence is {string} with {number} blocks', 'attack', 3, context);
      context = game.given('blocks placed in sequence is {number}', 1, context);
      context = game.given('sequence start position is ({number}, {number})', 2, 2, context);

      game.when('I call handleCellClick at ({number}, {number})', 2, 3, context);

      game.then('playablePositions should be dispatched', context);
    });

    it('should not set start position for single-block sequence', () => {
      let context = game.given('a game state with dice used {array}', [5]);
      context = game.given('current sequence is {string} with {number} blocks', 'attack', 1, context);
      context = game.given('blocks placed in sequence is {number}', 0, context);

      game.when('I call handleCellClick at ({number}, {number})', 2, 3, context);

      game.then('setSequenceStartPosition should not be dispatched', context);
    });
  });
});

