import { type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../../store/slices/gameSlice';
import type { GameState } from '../../store/slices/gameSliceHelpers';
import type { Cell } from '../../data/mapLayout';

const createCell = (overrides: Partial<Cell> = {}): Cell => ({
  type: 'land',
  owner: 0,
  territory: 0,
  zone: 0,
  hp: 0,
  ...overrides,
});

const createBoard = (size: number = 5): Cell[][] => {
  const board: Cell[][] = [];
  for (let x = 0; x < size; x++) {
    board[x] = [];
    for (let y = 0; y < size; y++) {
      board[x][y] = createCell();
    }
  }
  return board;
};

export const createTestStore = (initialState?: Partial<GameState>) => {
  const defaultState: GameState = {
    board: createBoard(),
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

  return configureStore({
    reducer: {
      game: gameReducer,
    },
    preloadedState: {
      game: { ...defaultState, ...initialState },
    },
  });
};

export const renderWithRedux = (
  component: ReactNode,
  initialState?: Partial<GameState>
) => {
  const store = createTestStore(initialState);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

