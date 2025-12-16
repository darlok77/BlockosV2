import { describe, it } from 'vitest';
import { createGameSliceRunner } from './gameSlice.gherkin.setup';
import type { BlockToPlace } from '../../../utils/gameRules';
import { initializeBaseHpCache } from '../../../store/slices/gameSliceHelpers';

describe('gameSlice', () => {
  describe('setDiceResult', () => {
    const game = createGameSliceRunner();

    it('should initialize dice result correctly', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);

      const newState = game.when('I dispatch setDiceResult with {number} and {number}', 3, 4, state);

      game.then('dice result should be {number} and {number}', 3, 4, newState);
      game.then('dice used should be {array}', [], newState);
      game.then('current sequence index should be {number}', -1, newState);
      game.then('blocks placed in sequence should be {number}', 0, newState);
    });

    it('should not set dice result if already set', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const stateWithDice = game.given('dice result is {number} and {number}', 1, 2, state);

      const newState = game.when('I dispatch setDiceResult with {number} and {number}', 5, 6, stateWithDice);

      game.then('dice result should be {number} and {number}', 1, 2, newState);
    });

    it('should not set dice result if dice used already set', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const stateWithDiceUsed = game.given('dice used values {array} with sequences', [1, 2], [{ type: 'attack', nbBlocks: 1 }], state);

      const newState = game.when('I dispatch setDiceResult with {number} and {number}', 5, 6, stateWithDiceUsed);

      game.then('dice result should be null', newState);
    });
  });

  describe('setDiceUsedValue', () => {
    const game = createGameSliceRunner();

    it('should set dice used and sequences correctly', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const sequences: BlockToPlace[] = [
        { type: 'attack', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 2 },
      ];

      const newState = game.when('I dispatch setDiceUsedValue with dice {array} and sequences', [5, 6], sequences, state);

      game.then('dice used should be {array}', [5, 6], newState);
      game.then('sequences to place should be', sequences, newState);
      game.then('current sequence index should be {number}', -1, newState);
      game.then('blocks placed in sequence should be {number}', 0, newState);
    });

    it('should not set dice used if already set', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const stateWithDiceUsed = game.given('dice used values {array} with sequences', [1, 2], [{ type: 'attack', nbBlocks: 1 }], state);

      const newState = game.when('I dispatch setDiceUsedValue with dice {array} and sequences', [5, 6], [{ type: 'defense', nbBlocks: 1 }], stateWithDiceUsed);

      game.then('dice used should be {array}', [1, 2], newState);
    });
  });

  describe('selectSequence', () => {
    const game = createGameSliceRunner();

    it('should select sequence and reset counters', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const sequences: BlockToPlace[] = [
        { type: 'attack', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 2 },
      ];
      const stateWithSequences = game.given('dice used values {array} with sequences', [1, 2], sequences, state);
      const stateWithBlocks = game.given('blocks placed count is {number}', 2, stateWithSequences);
      const stateWithPosition = game.given('sequence start position is ({number}, {number})', 1, 1, stateWithBlocks);

      const newState = game.when('I dispatch selectSequence {number}', 0, stateWithPosition);

      game.then('current sequence index should be {number}', 0, newState);
      game.then('current block type should be {string}', 'attack', newState);
      game.then('blocks placed in sequence should be {number}', 0, newState);
      game.then('sequence start position should be null', newState);
      game.then('sequence direction should be null', newState);
    });
  });

  describe('setSequenceStartPosition', () => {
    const game = createGameSliceRunner();

    it('should set sequence start position', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);

      const newState = game.when('I dispatch setSequenceStartPosition ({number}, {number})', 2, 3, state);

      game.then('sequence start position should be ({number}, {number})', 2, 3, newState);
    });
  });

  describe('setSequenceDirection', () => {
    const game = createGameSliceRunner();

    it('should set sequence direction', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);

      const newState = game.when('I dispatch setSequenceDirection ({number}, {number})', 0, 1, state);

      game.then('sequence direction should be ({number}, {number})', 0, 1, newState);
    });
  });

  describe('incrementBlocksPlaced', () => {
    const game = createGameSliceRunner();

    it('should increment blocks placed count', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.then('blocks placed in sequence should be {number}', 0, state);

      const newState = game.when('I dispatch incrementBlocksPlaced', state);

      game.then('blocks placed in sequence should be {number}', 1, newState);
    });
  });

  describe('completeSequence', () => {
    const game = createGameSliceRunner();

    it('should complete sequence and move to next', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const sequences: BlockToPlace[] = [
        { type: 'attack', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 2 },
      ];
      const stateWithSequences = game.given('dice used values {array} with sequences', [1, 2], sequences, state);
      const stateWithSelected = game.given('sequence {number} is selected', 0, stateWithSequences);

      const newState = game.when('I dispatch completeSequence', stateWithSelected);

      game.then('completed sequences should be {array}', [0], newState);
      game.then('current sequence index should be {number}', 1, newState);
      game.then('current block type should be {string}', 'defense', newState);
      game.then('blocks placed in sequence should be {number}', 0, newState);
      game.then('sequence start position should be null', newState);
      game.then('sequence direction should be null', newState);
    });

    it('should clear playable positions when all sequences completed', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const sequences: BlockToPlace[] = [
        { type: 'attack', nbBlocks: 1 },
      ];
      const stateWithSequences = game.given('dice used values {array} with sequences', [1], sequences, state);
      const stateWithSelected = game.given('sequence {number} is selected', 0, stateWithSequences);

      const newState = game.when('I dispatch completeSequence', stateWithSelected);

      game.then('current sequence index should be {number}', 1, newState);
      game.then('current block type should be {string}', null, newState);
      game.then('playable positions should be empty', newState);
    });
  });

  describe('updateCell', () => {
    const game = createGameSliceRunner();

    it('should update cell attributes', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 2, 0, 0, 0, state);

      const newState = game.when('I dispatch updateCell at ({number}, {number}) with', 2, 2, { owner: 1, hp: 10, territory: 1 }, state);

      game.then('cell at ({number}, {number}) should have owner {number}', 2, 2, 1, newState);
      game.then('cell at ({number}, {number}) should have HP {number}', 2, 2, 10, newState);
      game.then('cell at ({number}, {number}) should have territory {number}', 2, 2, 1, newState);
    });
  });

  describe('playablePositions', () => {
    const game = createGameSliceRunner();

    it('should recalculate playable positions', () => {
      let state = game.given('a game state with board size {number} x {number}', 5);
      const sequences: BlockToPlace[] = [
        { type: 'defense', nbBlocks: 1 },
      ];
      state = game.given('dice used values {array} with sequences', [2], sequences, state);
      state = game.given('sequence {number} is selected', 0, state);
      state = game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 2, 1, 1, 1, state);

      const newState = game.when('I dispatch playablePositions', state);

      game.then('playable positions should have at least {number} position(s)', 0, newState);
    });
  });

  describe('initBoard', () => {
    const game = createGameSliceRunner();

    it('should initialize board', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      const newBoard = game.given('a board of {number} x {number}', 3);

      const newState = game.when('I dispatch initBoard', newBoard, state);

      game.then('board should be', newBoard, newState);
    });
  });

  describe('passTurn', () => {
    const game = createGameSliceRunner();

    it('should change to next player and reset state', () => {
      let state = game.given('a game state with board size {number} x {number}', 5);
      state = game.given('current player is {number}', 1, state);
      state = game.given('number of players is {number}', 3, state);
      // Create bases for all players so they are alive
      state = game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, 10, state);
      state = game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 0, 1, 10, state);
      state = game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 3, 1, 0, 10, state);
      // Initialize base HP cache for all players
      initializeBaseHpCache(state);

      const newState = game.when('I dispatch passTurn', state);

      game.then('current player should be {number}', 2, newState);
      game.then('dice result should be null', newState);
      game.then('dice used should be {array}', [], newState);
      game.then('playable positions should be empty', newState);
    });

    it('should not change player if game is over', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('current player is {number}', 1, state);
      game.given('game is over', state);

      const newState = game.when('I dispatch passTurn', state);

      game.then('current player should be {number}', 1, newState);
    });

    it('should skip eliminated players', () => {
      let state = game.given('a game state with board size {number} x {number}', 5);
      state = game.given('current player is {number}', 1, state);
      state = game.given('number of players is {number}', 3, state);
      // Create bases: player 1 and 3 are alive, player 2 is eliminated (HP = 0)
      state = game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, 10, state);
      state = game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 0, 1, 0, state);
      state = game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 3, 1, 0, 5, state);
      // Initialize base HP cache for all players
      initializeBaseHpCache(state);

      const newState = game.when('I dispatch passTurn', state);

      game.then('current player should be {number}', 3, newState);
    });
  });
});

