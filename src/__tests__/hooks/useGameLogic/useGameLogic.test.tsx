import { describe, it } from 'vitest';
import { createUseGameLogicRunner } from './useGameLogic.gherkin.setup';

describe('useGameLogic', () => {
  const game = createUseGameLogicRunner();

  it('should pass turn when all sequences are completed', async () => {
    const context = game.given('a game state with sequences {array} and completed sequences {array} and dice used {array}', 
      [
        { type: 'attack', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 2 },
      ],
      [0, 1],
      [5, 6]
    );

    await game.when('I wait for the effect to run', context);

    await game.then('passTurn should be dispatched', context);
  });

  it('should not pass turn when sequences are incomplete', async () => {
    const context = game.given('a game state with sequences {array} and completed sequences {array} and dice used {array}', 
      [
        { type: 'attack', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 2 },
      ],
      [0], // Seulement une séquence complétée
      [5, 6]
    );

    await game.when('I wait for the effect to run', context);

    await game.then('passTurn should not be dispatched', context);
  });

  it('should not pass turn when diceUsed is empty', async () => {
    const context = game.given('a game state with sequences {array} and completed sequences {array} and dice used {array}', 
      [
        { type: 'attack', nbBlocks: 1 },
      ],
      [0],
      [] // diceUsed vide
    );

    await game.when('I wait for the effect to run', context);

    await game.then('passTurn should not be dispatched', context);
  });

  it('should pass turn when all sequences completed with multiple sequences', async () => {
    const context = game.given('a game state with sequences {array} and completed sequences {array} and dice used {array}', 
      [
        { type: 'attack', nbBlocks: 1 },
        { type: 'defense', nbBlocks: 2 },
        { type: 'destroy', nbBlocks: 1 },
      ],
      [0, 1, 2],
      [1, 2, 3]
    );

    await game.when('I wait for the effect to run', context);

    await game.then('passTurn should be dispatched', context);
  });
});

