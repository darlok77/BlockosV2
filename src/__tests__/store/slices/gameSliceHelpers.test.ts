import { describe, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { createGameSliceHelpersRunner } from './gameSliceHelpers.gherkin.setup';

describe('gameSliceHelpers', () => {
  describe('getRemainingBlocks', () => {
    const game = createGameSliceHelpersRunner();

    it('should return correct remaining blocks for valid sequence', () => {
      const nbBlocks = faker.number.int({ min: 2, max: 3 });
      const blocksPlaced = faker.number.int({ min: 1, max: nbBlocks - 1 });
      const expectedRemaining = nbBlocks - blocksPlaced;

      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a sequence of type {string} with {number} blocks', 'attack', nbBlocks, state);
      game.given('current sequence index: {number}', 0, state);
      game.given('blocks placed in sequence: {number}', blocksPlaced, state);

      const remaining = game.when('I calculate remaining blocks', state);

      game.then('remaining blocks should be {number}', expectedRemaining, remaining);
    });

    it('should return 0 when sequence index is invalid', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a sequence of type {string} with {number} blocks', 'attack', 3, state);
      game.given('current sequence index: {number}', -1, state);

      const remaining = game.when('I calculate remaining blocks', state);

      game.then('remaining blocks should be {number}', 0, remaining);
    });

    it('should return 0 when sequence index is out of bounds', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a sequence of type {string} with {number} blocks', 'attack', 3, state);
      game.given('current sequence index: {number}', 5, state);

      const remaining = game.when('I calculate remaining blocks', state);

      game.then('remaining blocks should be {number}', 0, remaining);
    });
  });

  describe('captureTerritories', () => {
    const game = createGameSliceHelpersRunner();

    it('should capture territories and update board', () => {
      const board = game.given('a board of {number} x {number}', 5);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 1, board);
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 2, board);
      game.given('a block of player {number} at position ({number}, {number})', 1, 2, 1, board);
      game.given('a free cell at position ({number}, {number}) with territory {number} and zone {number}', 2, 2, 0, 0, board);

      game.when('I capture territories for player {number}', 1, board);

      game.then('cell at position ({number}, {number}) should have territory {number}', 2, 2, 1, board);
    });

    it('should capture multiple territories', () => {
      const board = game.given('a board of {number} x {number}', 5);
      // Pour capturer (1,1), il faut un bloc du joueur dans la colonne 1 ET la ligne 1
      game.given('a block of player {number} at position ({number}, {number})', 1, 1, 0, board); // bloc dans colonne 1
      game.given('a block of player {number} at position ({number}, {number})', 1, 0, 1, board); // bloc dans ligne 1
      game.given('a free cell at position ({number}, {number}) with territory {number} and zone {number}', 1, 1, 0, 0, board); // cellule à capturer

      game.when('I capture territories for player {number}', 1, board);

      game.then('cell at position ({number}, {number}) should have territory {number}', 1, 1, 1, board);
    });
  });

  describe('getBaseHpForPlayer', () => {
    const game = createGameSliceHelpersRunner();

    it('should calculate total HP for player bases', () => {
      const hp1_1 = faker.number.int({ min: 1, max: 10 });
      const hp1_2 = faker.number.int({ min: 1, max: 10 });
      const hp2_1 = faker.number.int({ min: 1, max: 10 });
      const expectedTotal1 = hp1_1 + hp1_2;
      const expectedTotal2 = hp2_1;

      const board = game.given('a board of {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, hp1_1, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 1, hp1_2, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 1, 0, hp2_1, board);

      const total1 = game.when('I calculate base HP for player {number}', 1, board);
      const total2 = game.when('I calculate base HP for player {number}', 2, board);

      game.then('base HP for player {number} should be {number}', 1, expectedTotal1, total1);
      game.then('base HP for player {number} should be {number}', 2, expectedTotal2, total2);
    });

    it('should return 0 when player has no bases', () => {
      const board = game.given('a board of {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 0, 0, 10, board);

      const total = game.when('I calculate base HP for player {number}', 1, board);

      game.then('base HP for player {number} should be {number}', 1, 0, total);
    });

    it('should handle bases with 0 or undefined HP', () => {
      const board = game.given('a board of {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, 10, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 1, 0, board);

      const total = game.when('I calculate base HP for player {number}', 1, board);

      game.then('base HP for player {number} should be {number}', 1, 10, total);
    });
  });

  describe('getAlivePlayers', () => {
    const game = createGameSliceHelpersRunner();

    it('should return alive players with HP > 0', () => {
      const hp1 = faker.number.int({ min: 1, max: 10 });
      const hp2 = faker.number.int({ min: 1, max: 10 });

      const board = game.given('a board of {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, hp1, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 0, 1, hp2, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 3, 1, 0, 0, board);

      const alive = game.when('I get alive players', board, 3);

      game.then('alive players should be', [1, 2], alive);
    });

    it('should return empty array when all players are eliminated', () => {
      const board = game.given('a board of {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, 0, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 0, 1, 0, board);

      const alive = game.when('I get alive players', board, 2);

      game.then('alive players should be', [], alive);
    });

    it('should return all players when all have HP > 0', () => {
      const hp1 = faker.number.int({ min: 1, max: 10 });
      const hp2 = faker.number.int({ min: 1, max: 10 });
      const hp3 = faker.number.int({ min: 1, max: 10 });

      const board = game.given('a board of {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 1, 0, 0, hp1, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 2, 0, 1, hp2, board);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number}', 3, 1, 0, hp3, board);

      const alive = game.when('I get alive players', board, 3);

      game.then('alive players should be', [1, 2, 3], alive);
    });
  });

  describe('updateBaseHpCache', () => {
    const game = createGameSliceHelpersRunner();

    it('should update cache when cell is a base', () => {
      const hp1 = faker.number.int({ min: 1, max: 10 });
      const hp2 = faker.number.int({ min: 1, max: 10 });

      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number} in state', 1, 0, 0, hp1, state);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number} in state', 2, 0, 1, hp2, state);

      game.when('I update base HP cache at position ({number}, {number})', 0, 0, state);

      game.then('base HP cache for player {number} should be {number}', 1, hp1, state);
      game.then('base HP cache for player {number} should be {number}', 2, hp2, state);
    });

    it('should not update cache when cell is not a base', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 0, 0, 1, 0, 0, state);
      game.given('base HP cache', { 1: 20, 2: 15 }, state);

      const originalCache = { ...state.baseHpCache };
      game.when('I update base HP cache at position ({number}, {number})', 0, 0, state);

      game.then('base HP cache should be', originalCache, state);
    });
  });

  describe('initializeBaseHpCache', () => {
    const game = createGameSliceHelpersRunner();

    it('should initialize cache for all players', () => {
      const hp1 = faker.number.int({ min: 1, max: 10 });
      const hp2 = faker.number.int({ min: 1, max: 10 });
      const hp3 = faker.number.int({ min: 1, max: 10 });

      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('number of players: {number}', 3, state);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number} in state', 1, 0, 0, hp1, state);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number} in state', 2, 0, 1, hp2, state);
      game.given('a base of player {number} at position ({number}, {number}) with HP {number} in state', 3, 1, 0, hp3, state);

      game.when('I initialize base HP cache', state);

      game.then('base HP cache for player {number} should be {number}', 1, hp1, state);
      game.then('base HP cache for player {number} should be {number}', 2, hp2, state);
      game.then('base HP cache for player {number} should be {number}', 3, hp3, state);
    });
  });

  describe('recomputeEliminationsAndWinner', () => {
    const game = createGameSliceHelpersRunner();

    it('should mark players with HP <= 0 as eliminated', () => {
      const hp1 = faker.number.int({ min: 1, max: 10 });
      const hp3 = faker.number.int({ min: 1, max: 10 });

      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('number of players: {number}', 3, state);
      game.given('base HP cache', { 1: hp1, 2: 0, 3: hp3 }, state);

      game.when('I recompute eliminations and winner', state);

      game.then('eliminated players should be', [2], state);
      game.then('winner should be null', state);
      game.then('game should not be over', state);
    });

    it('should determine winner when only one player is alive', () => {
      const winnerHp = faker.number.int({ min: 1, max: 10 });

      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('number of players: {number}', 3, state);
      game.given('base HP cache', { 1: winnerHp, 2: 0, 3: 0 }, state);

      game.when('I recompute eliminations and winner', state);

      game.then('eliminated players should be', [2, 3], state);
      game.then('winner should be {number}', 1, state);
      game.then('game should be over', state);
    });

    it('should set winner to null when game is not over', () => {
      const hp1 = faker.number.int({ min: 1, max: 10 });
      const hp2 = faker.number.int({ min: 1, max: 10 });
      const hp3 = faker.number.int({ min: 1, max: 10 });

      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('number of players: {number}', 3, state);
      game.given('base HP cache', { 1: hp1, 2: hp2, 3: hp3 }, state);

      game.when('I recompute eliminations and winner', state);

      game.then('eliminated players should be', [], state);
      game.then('winner should be null', state);
      game.then('game should not be over', state);
    });

    it('should handle case when all players are eliminated', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('number of players: {number}', 2, state);
      game.given('base HP cache', { 1: 0, 2: 0 }, state);

      game.when('I recompute eliminations and winner', state);

      game.then('eliminated players should be', [1, 2], state);
      game.then('winner should be null', state);
      game.then('game should be over', state);
    });
  });

  describe('calculatePlayablePositions', () => {
    const game = createGameSliceHelpersRunner();

    it('should return empty array when currentBlockType is null', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);

      const positions = game.when('I calculate playable positions', state);

      game.then('I should have exactly {number} playable position(s)', 0, positions);
    });

    it('should return positions for beginning of sequence', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      // Pour avoir des positions jouables, il faut des cellules adjacentes à une cellule du joueur
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 2, 1, 1, 1, state);
      // Position adjacente jouable pour defense (dans territoire/zone du joueur)
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 1, 0, 1, 1, state);
      // Pour nbBlocks = 2, il faut aussi une cellule consécutive valide dans une direction
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 0, 0, 1, 1, state);
      game.given('a sequence of type {string} with {number} blocks', 'defense', 2, state);

      const positions = game.when('I calculate playable positions', state);

      game.then('I should have at least {number} playable position(s)', 1, positions);
    });

    it('should return aligned positions when start position is set but no direction', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 2, 1, 1, 1, state);
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 1, 0, 1, 1, state);
      game.given('a sequence of type {string} with {number} blocks', 'defense', 2, state);
      game.given('blocks placed in sequence: {number}', 1, state);
      game.given('sequence start position ({number}, {number})', 2, 2, state);

      const positions = game.when('I calculate playable positions', state);

      game.then('I should have at least {number} playable position(s)', 1, positions);
    });

    it('should return next position when direction is set', () => {
      const state = game.given('a game state with board size {number} x {number}', 5);
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 2, 1, 1, 1, state);
      game.given('a cell at position ({number}, {number}) owned by player {number} with territory {number} and zone {number}', 2, 3, 0, 1, 1, state);
      game.given('a sequence of type {string} with {number} blocks', 'defense', 2, state);
      game.given('blocks placed in sequence: {number}', 1, state);
      game.given('sequence start position ({number}, {number})', 2, 2, state);
      game.given('sequence direction ({number}, {number})', 0, 1, state);

      const positions = game.when('I calculate playable positions', state);

      game.then('I should have at least {number} playable position(s)', 1, positions);
    });
  });
});

