import { describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import {
  isSequenceDisabled,
  formatSequenceText,
} from '../../utils/sequenceHelpers';
import type { BlockToPlace } from '../../utils/gameRules';

describe('sequenceHelpers', () => {

  describe('isSequenceDisabled', () => {
    it('should return true when sequence is completed', () => {
      const completedSequences = [0];
      const currentSequenceIndex = -1;
      const blocksPlacedInSequence = 0;
      expect(isSequenceDisabled(0, currentSequenceIndex, completedSequences, blocksPlacedInSequence)).toBe(true);
    });

    it('should return false when sequence is in progress (selected and no blocks placed)', () => {
      const completedSequences: number[] = [];
      const currentSequenceIndex = 0;
      const blocksPlacedInSequence = 0;
      expect(isSequenceDisabled(0, currentSequenceIndex, completedSequences, blocksPlacedInSequence)).toBe(false);
    });

    it('should return true when another sequence is selected and blocks are placed', () => {
      const completedSequences: number[] = [];
      const currentSequenceIndex = 0;
      const blocksPlacedInSequence = 2;
      expect(isSequenceDisabled(1, currentSequenceIndex, completedSequences, blocksPlacedInSequence)).toBe(true);
    });

    it('should return false when another sequence is selected but no blocks are placed', () => {
      const completedSequences: number[] = [];
      const currentSequenceIndex = 0;
      const blocksPlacedInSequence = 0;
      expect(isSequenceDisabled(1, currentSequenceIndex, completedSequences, blocksPlacedInSequence)).toBe(false);
    });

    it('should return false when no sequence is selected', () => {
      const completedSequences: number[] = [];
      const currentSequenceIndex = -1;
      const blocksPlacedInSequence = 0;
      expect(isSequenceDisabled(0, currentSequenceIndex, completedSequences, blocksPlacedInSequence)).toBe(false);
    });
  });

  describe('formatSequenceText', () => {
    it('should format singular text correctly', () => {
      const sequence: BlockToPlace = { type: 'attack', nbBlocks: 1 };
      expect(formatSequenceText(sequence)).toBe('1 bloc d\'attaque');
    });

    it('should format plural text correctly', () => {
      const nbBlocks = faker.number.int({ min: 2, max: 3 });
      const sequence: BlockToPlace = { type: 'attack', nbBlocks };
      expect(formatSequenceText(sequence)).toBe(`${nbBlocks} blocs d'attaque`);
    });
  });
});

