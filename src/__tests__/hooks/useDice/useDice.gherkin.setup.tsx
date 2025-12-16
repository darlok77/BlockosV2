import React from 'react';
import { expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createGherkinRunner } from '../../../utils/gherkin';
import { useDice } from '../../../hooks/useDice';
import { createTestStore } from '../testUtils';
import { setDiceResult, setDiceUsedValue, playablePositions } from '../../../store/slices/gameSlice';
import type { GameState } from '../../../store/slices/gameSliceHelpers';

interface HookTestContext {
  store: ReturnType<typeof createTestStore>;
  hookResult: ReturnType<typeof useDice>;
  dispatchSpy: ReturnType<typeof vi.spyOn>;
}

export const createUseDiceRunner = () => {
  return createGherkinRunner({
    given: {
      'a game state with dice result {number} and {number}': (
        die1: number,
        die2: number
      ): HookTestContext => {
        const store = createTestStore({
          diceResult: { die1, die2 },
        });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );

        const { result } = renderHook(() => useDice(), { wrapper });

        return {
          store,
          hookResult: result.current,
          dispatchSpy,
        };
      },
      'a game state with no dice result': (): HookTestContext => {
        const store = createTestStore({
          diceResult: null,
        });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );

        const { result } = renderHook(() => useDice(), { wrapper });

        return {
          store,
          hookResult: result.current,
          dispatchSpy,
        };
      },
      'Math.random is mocked to return {number} then {number}': (
        value1: number,
        value2: number
      ): HookTestContext => {
        const mockMathRandom = vi.spyOn(Math, 'random');
        mockMathRandom.mockReturnValueOnce(value1).mockReturnValueOnce(value2);

        const store = createTestStore();
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );

        const { result } = renderHook(() => useDice(), { wrapper });

        return {
          store,
          hookResult: result.current,
          dispatchSpy,
        };
      },
    },
    when: {
      'I call rollDice': (context: HookTestContext): HookTestContext => {
        context.hookResult.rollDice();
        return context;
      },
      'I call handleChoose with useSum {boolean} and dice result {number} and {number}': (
        useSum: boolean,
        die1: number,
        die2: number,
        context: HookTestContext
      ): HookTestContext => {
        context.hookResult.handleChoose(useSum, { die1, die2 });
        return context;
      },
      'I call handleChoose with useSum {boolean} and null dice result': (
        useSum: boolean,
        context: HookTestContext
      ): HookTestContext => {
        context.hookResult.handleChoose(useSum, null);
        return context;
      },
    },
    then: {
      'dice result should be dispatched with values between 1 and 6': (context: HookTestContext): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: setDiceResult.type,
            payload: expect.objectContaining({
              die1: expect.any(Number),
              die2: expect.any(Number),
            }),
          })
        );

        const lastCall = context.dispatchSpy.mock.calls[context.dispatchSpy.mock.calls.length - 1][0];
        expect(lastCall.payload.die1).toBeGreaterThanOrEqual(1);
        expect(lastCall.payload.die1).toBeLessThanOrEqual(6);
        expect(lastCall.payload.die2).toBeGreaterThanOrEqual(1);
        expect(lastCall.payload.die2).toBeLessThanOrEqual(6);
      },
      'setDiceResult should be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: setDiceResult.type,
          })
        );
      },
      'setDiceUsedValue should be dispatched with dice values {array}': (
        expectedDiceValues: number[],
        context: HookTestContext
      ): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: setDiceUsedValue.type,
            payload: expect.objectContaining({
              diceValues: expectedDiceValues,
            }),
          })
        );
      },
      'setDiceUsedValue should be dispatched with sequences': (
        expectedSequences: Array<{ type: string; nbBlocks: number }>,
        context: HookTestContext
      ): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: setDiceUsedValue.type,
            payload: expect.objectContaining({
              sequences: expect.arrayContaining(
                expectedSequences.map(seq =>
                  expect.objectContaining({ type: seq.type, nbBlocks: seq.nbBlocks })
                )
              ),
            }),
          })
        );
      },
      'playablePositions should be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: playablePositions.type,
          })
        );
      },
      'setDiceUsedValue should not be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({
            type: setDiceUsedValue.type,
          })
        );
      },
    },
  });
};

