import React from 'react';
import { expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createGherkinRunner } from '../../../utils/gherkin';
import { useCellActions } from '../../../hooks/useCellActions';
import { createTestStore } from '../testUtils';
import {
  updateCell,
  incrementBlocksPlaced,
  completeSequence,
  setSequenceStartPosition,
  setSequenceDirection,
  playablePositions,
} from '../../../store/slices/gameSlice';
import type { BlockToPlace } from '../../../utils/gameRules';

interface HookTestContext {
  store: ReturnType<typeof createTestStore>;
  hookResult: ReturnType<typeof useCellActions>;
  dispatchSpy: ReturnType<typeof vi.spyOn>;
  currentPlayer: number;
  currentSequence: BlockToPlace | null;
  blocksPlacedInSequence: number;
  sequenceStartPosition: { x: number; y: number } | null;
  canPlaceBlock: boolean;
  isPlayable: boolean;
}

export const createUseCellActionsRunner = () => {
  return createGherkinRunner({
    given: {
      'a game state with dice used {array}': (diceUsed: number[]): HookTestContext => {
        const store = createTestStore({
          diceUsed,
        });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <Provider store={store}>{children}</Provider>
        );

        const { result } = renderHook(() => useCellActions(), { wrapper });

        return {
          store,
          hookResult: result.current,
          dispatchSpy,
          currentPlayer: 1,
          currentSequence: { type: 'attack', nbBlocks: 1 },
          blocksPlacedInSequence: 0,
          sequenceStartPosition: null,
          canPlaceBlock: true,
          isPlayable: true,
        };
      },
      'current player is {number}': (player: number, context: HookTestContext): HookTestContext => {
        return { ...context, currentPlayer: player };
      },
      'current sequence is {string} with {number} blocks': (
        type: 'attack' | 'defense' | 'destroy',
        nbBlocks: number,
        context: HookTestContext
      ): HookTestContext => {
        return { ...context, currentSequence: { type, nbBlocks } };
      },
      'current sequence is null': (context: HookTestContext): HookTestContext => {
        return { ...context, currentSequence: null };
      },
      'blocks placed in sequence is {number}': (count: number, context: HookTestContext): HookTestContext => {
        return { ...context, blocksPlacedInSequence: count };
      },
      'sequence start position is ({number}, {number})': (
        x: number,
        y: number,
        context: HookTestContext
      ): HookTestContext => {
        return { ...context, sequenceStartPosition: { x, y } };
      },
      'can place block is {boolean}': (canPlace: boolean, context: HookTestContext): HookTestContext => {
        return { ...context, canPlaceBlock: canPlace };
      },
      'is playable is {boolean}': (playable: boolean, context: HookTestContext): HookTestContext => {
        return { ...context, isPlayable: playable };
      },
    },
    when: {
      'I call handleCellClick at ({number}, {number})': (
        x: number,
        y: number,
        context: HookTestContext
      ): HookTestContext => {
        const diceUsed = context.store.getState().game.diceUsed;

        context.hookResult.handleCellClick(
          x,
          y,
          context.currentPlayer,
          context.currentSequence,
          context.blocksPlacedInSequence,
          context.sequenceStartPosition,
          diceUsed,
          context.canPlaceBlock,
          context.isPlayable
        );

        return context;
      },
    },
    then: {
      'no action should be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).not.toHaveBeenCalled();
      },
      'updateCell should be dispatched at ({number}, {number}) with owner {number}': (
        x: number,
        y: number,
        owner: number,
        context: HookTestContext
      ): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: updateCell.type,
            payload: { x, y, owner, hp: 1 },
          })
        );
      },
      'incrementBlocksPlaced should be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: incrementBlocksPlaced.type,
          })
        );
      },
      'setSequenceStartPosition should be dispatched at ({number}, {number})': (
        x: number,
        y: number,
        context: HookTestContext
      ): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: setSequenceStartPosition.type,
            payload: { x, y },
          })
        );
      },
      'setSequenceStartPosition should not be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({
            type: setSequenceStartPosition.type,
          })
        );
      },
      'setSequenceDirection should be dispatched with ({number}, {number})': (
        dx: number,
        dy: number,
        context: HookTestContext
      ): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: setSequenceDirection.type,
            payload: { dx, dy },
          })
        );
      },
      'completeSequence should be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: completeSequence.type,
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
      'playablePositions should not be dispatched': (context: HookTestContext): void => {
        expect(context.dispatchSpy).not.toHaveBeenCalledWith(
          expect.objectContaining({
            type: playablePositions.type,
          })
        );
      },
    },
  });
};

