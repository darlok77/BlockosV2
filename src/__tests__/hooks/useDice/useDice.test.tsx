import { describe, it, beforeEach, vi } from 'vitest';
import { createUseDiceRunner } from './useDice.gherkin.setup';

// Mock Math.random pour contrôler les valeurs des dés
const mockMathRandom = vi.spyOn(Math, 'random');

describe('useDice', () => {
  beforeEach(() => {
    mockMathRandom.mockRestore();
  });

  describe('rollDice', () => {
    const game = createUseDiceRunner();

    it('should generate dice values between 1 and 6', () => {
      const context = game.given('Math.random is mocked to return {number} then {number}', 0, 0.5);

      game.when('I call rollDice', context);

      game.then('dice result should be dispatched with values between 1 and 6', context);
    });

    it('should dispatch setDiceResult action', () => {
      const context = game.given('Math.random is mocked to return {number} then {number}', 0, 0.5);

      game.when('I call rollDice', context);

      game.then('setDiceResult should be dispatched', context);
    });
  });

  describe('handleChoose', () => {
    const game = createUseDiceRunner();

    it('should use sum when useSum is true', () => {
      const context = game.given('a game state with dice result {number} and {number}', 3, 4);

      game.when('I call handleChoose with useSum {boolean} and dice result {number} and {number}', true, 3, 4, context);

      game.then('setDiceUsedValue should be dispatched with dice values {array}', [7], context);
    });

    it('should use individual values when useSum is false', () => {
      const context = game.given('a game state with dice result {number} and {number}', 3, 4);

      game.when('I call handleChoose with useSum {boolean} and dice result {number} and {number}', false, 3, 4, context);

      game.then('setDiceUsedValue should be dispatched with dice values {array}', [3, 4], context);
    });

    it('should calculate sequences from dice values', () => {
      const context = game.given('a game state with dice result {number} and {number}', 5, 6);

      game.when('I call handleChoose with useSum {boolean} and dice result {number} and {number}', false, 5, 6, context);

      game.then('setDiceUsedValue should be dispatched with sequences', [
        { type: 'attack', nbBlocks: 1 },
        { type: 'attack', nbBlocks: 2 },
      ], context);
    });

    it('should dispatch playablePositions after setting dice used', () => {
      const context = game.given('a game state with dice result {number} and {number}', 3, 4);

      game.when('I call handleChoose with useSum {boolean} and dice result {number} and {number}', false, 3, 4, context);

      game.then('playablePositions should be dispatched', context);
    });

    it('should not do anything if diceResult is null', () => {
      const context = game.given('a game state with no dice result');

      game.when('I call handleChoose with useSum {boolean} and null dice result', false, context);

      game.then('setDiceUsedValue should not be dispatched', context);
    });
  });
});

