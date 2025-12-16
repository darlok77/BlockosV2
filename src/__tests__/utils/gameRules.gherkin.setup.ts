import { expect } from 'vitest';
import { createGherkinRunner } from '../../utils/gherkin';
import type { Cell } from '../../data/mapLayout';
import {
  getAlignedPositions,
  getNextPositionInDirection,
  getPlayablePositions,
  calculateTerritoryCapture,
  calculateAllTerritoryCapture,
} from '../../utils/gameRules';

interface GameState {
  board: Cell[][];
}

export const createGameRulesRunner = () => {
  return createGherkinRunner({
    given: {
      'a board of {number} x {number}': (size: number): GameState => {
        const board: Cell[][] = [];
        for (let x = 0; x < size; x++) {
          board[x] = [];
          for (let y = 0; y < size; y++) {
            board[x][y] = {
              type: 'land',
              owner: 0,
              territory: 0,
              zone: 0,
              hp: 0,
            };
          }
        }
        return { board };
      },
      'a block of player {number} at position ({number}, {number})': (
        player: number,
        x: number,
        y: number,
        state: GameState
      ): GameState => {
        state.board[x][y].owner = player;
        state.board[x][y].territory = player;
        state.board[x][y].zone = player;
        return state;
      },
      'a free cell at position ({number}, {number}) in player {number} territory': (
        x: number,
        y: number,
        player: number,
        state: GameState
      ): GameState => {
        state.board[x][y].owner = 0;
        state.board[x][y].territory = player;
        state.board[x][y].zone = player;
        return state;
      },
      'a free cell at position ({number}, {number}) in player {number} zone': (
        x: number,
        y: number,
        player: number,
        state: GameState
      ): GameState => {
        state.board[x][y].owner = 0;
        state.board[x][y].territory = 0;
        state.board[x][y].zone = player;
        return state;
      },
      'a base of player {number} at position ({number}, {number})': (
        owner: number,
        x: number,
        y: number,
        state: GameState
      ): GameState => {
        state.board[x][y].type = 'base';
        state.board[x][y].owner = owner;
        state.board[x][y].territory = owner;
        state.board[x][y].zone = owner;
        return state;
      },
      'a destroyed block at position ({number}, {number})': (
        x: number,
        y: number,
        state: GameState
      ): GameState => {
        state.board[x][y].owner = -1;
        return state;
      },
      'a cell at position ({number}, {number}) in player {number} territory': (
        x: number,
        y: number,
        player: number,
        state: GameState
      ): GameState => {
        state.board[x][y].territory = player;
        return state;
      },
      'a cell at position ({number}, {number}) in player {number} zone': (
        x: number,
        y: number,
        player: number,
        state: GameState
      ): GameState => {
        state.board[x][y].zone = player;
        return state;
      },
    },
    when: {
      'I search for aligned positions from ({number}, {number})': (
        x: number,
        y: number,
        blockType: 'attack' | 'defense' | 'destroy',
        currentPlayer: number,
        nbBlocksRemaining: number,
        state: GameState
      ): { x: number; y: number }[] => {
        return getAlignedPositions(
          state.board,
          { x, y },
          blockType,
          currentPlayer,
          nbBlocksRemaining
        );
      },
      'I search for the next position in direction ({number}, {number})': (
        x: number,
        y: number,
        dx: number,
        dy: number,
        blockType: 'attack' | 'defense' | 'destroy',
        currentPlayer: number,
        nbBlocksRemaining: number,
        state: GameState
      ): { x: number; y: number } | null => {
        return getNextPositionInDirection(
          state.board,
          { x, y },
          { dx, dy },
          blockType,
          currentPlayer,
          nbBlocksRemaining
        );
      },
      'I search for playable positions': (
        blockType: 'attack' | 'defense' | 'destroy' | undefined,
        currentPlayer: number,
        nbBlocksRemaining: number | undefined,
        state: GameState
      ): { x: number; y: number }[] => {
        return getPlayablePositions(
          state.board,
          currentPlayer,
          blockType,
          nbBlocksRemaining
        );
      },
      'I calculate territory capture after placement at ({number}, {number})': (
        x: number,
        y: number,
        player: number,
        state: GameState
      ): Array<{ x: number; y: number; territory: number }> => {
        return calculateTerritoryCapture(state.board, player, x, y);
      },
      'I calculate all territory captures': (
        player: number,
        state: GameState
      ): Array<{ x: number; y: number; territory: number }> => {
        return calculateAllTerritoryCapture(state.board, player);
      },
    },
    then: {
      'I should find position ({number}, {number})': (
        x: number,
        y: number,
        positions: { x: number; y: number }[]
      ): void => {
        expect(positions.some(p => p.x === x && p.y === y)).toBe(true);
      },
      'I should find position ({number}, {number}) in captures': (
        x: number,
        y: number,
        captures: Array<{ x: number; y: number; territory: number }>
      ): void => {
        expect(captures.some(c => c.x === x && c.y === y)).toBe(true);
      },
      'I should have at least {number} position(s)': (
        minCount: number,
        positions: { x: number; y: number }[]
      ): void => {
        expect(positions.length).toBeGreaterThan(minCount);
      },
      'I should have exactly {number} position(s)': (
        count: number,
        positions: { x: number; y: number }[]
      ): void => {
        expect(positions.length).toBe(count);
      },
      'I should have all positions in bounds': (
        positions: { x: number; y: number }[]
      ): void => {
        expect(positions.every(p => p.x >= 0 && p.y >= 0)).toBe(true);
      },
      'I should return null': (
        value: { x: number; y: number } | null
      ): void => {
        expect(value).toBeNull();
      },
      'I should return position ({number}, {number})': (
        x: number,
        y: number,
        position: { x: number; y: number } | null
      ): void => {
        expect(position).toEqual({ x, y });
      },
      'I should have at least {number} capture(s)': (
        minCount: number,
        captures: Array<{ x: number; y: number; territory: number }>
      ): void => {
        expect(captures.length).toBeGreaterThanOrEqual(minCount);
      },
      'I should have all captures with territory {number}': (
        territory: number,
        captures: Array<{ x: number; y: number; territory: number }>
      ): void => {
        expect(captures.every(c => c.territory === territory)).toBe(true);
      },
    },
  });
};
