import React from 'react';
import { expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createGherkinRunner } from '../../../utils/gherkin';
import { useGameLogic } from '../../../hooks/useGameLogic';
import { createTestStore } from '../testUtils';
import { passTurn } from '../../../store/slices/gameSlice';
import type { BlockToPlace } from '../../../utils/gameRules';

interface HookTestContext {
  store: ReturnType<typeof createTestStore>;
  dispatchSpy: ReturnType<typeof vi.spyOn>;
}

export const createUseGameLogicRunner = () => {
  return createGherkinRunner({
    given: {
      'a game state with sequences {array} and completed sequences {array} and dice used {array}': (
        sequences: Array<{ type: string; nbBlocks: number }>,
        completedSequences: number[],
        diceUsed: number[]
      ): HookTestContext => {
        const sequencesToPlace: BlockToPlace[] = sequences.map(seq => ({
          type: seq.type as 'attack' | 'defense' | 'destroy',
          nbBlocks: seq.nbBlocks,
        }));

        const store = createTestStore({
          sequencesToPlace,
          completedSequences,
          diceUsed,
        });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );

        renderHook(() => useGameLogic(), { wrapper });

        return {
          store,
          dispatchSpy,
        };
      },
    },
    when: {
      'I wait for the effect to run': async (context: HookTestContext): Promise<HookTestContext> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return context;
      },
    },
    then: {
      'passTurn should be dispatched': async (context: HookTestContext): Promise<void> => {
        await waitFor(() => {
          expect(context.dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: passTurn.type,
            })
          );
        });
      },
      'passTurn should not be dispatched': async (context: HookTestContext): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(context.dispatchSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({
            type: passTurn.type,
          })
        );
      },
    },
  });
};

