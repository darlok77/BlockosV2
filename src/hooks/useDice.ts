import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { setDiceResult, setDiceUsedValue, playablePositions } from "../store/slices/gameSlice";
import { calculateBlocksToPlace } from "../utils/gameRules";

const MAX_SUM = 6;
const DICE_FACES = 6;

/**
 * Hook pour gérer les actions liées aux dés
 */
export const useDice = () => {
  const dispatch = useDispatch();

  const rollDice = useCallback(() => {
    const die1 = Math.floor(Math.random() * DICE_FACES) + 1;
    const die2 = Math.floor(Math.random() * DICE_FACES) + 1;
    dispatch(setDiceResult({ die1, die2 }));
  }, [dispatch]);

  const handleChoose = useCallback((useSum: boolean, diceResult: { die1: number; die2: number } | null) => {
    if (!diceResult) return;

    let diceValues: number[];
    if (useSum) {
      const sum = diceResult.die1 + diceResult.die2;
      diceValues = [sum];
    } else {
      diceValues = [diceResult.die1, diceResult.die2];
    }
    
    const sequences = calculateBlocksToPlace(diceValues);
    
    dispatch(setDiceUsedValue({ diceValues, sequences }));
    dispatch(playablePositions());
  }, [dispatch]);

  return {
    rollDice,
    handleChoose,
    MAX_SUM,
    DICE_FACES,
  };
};

