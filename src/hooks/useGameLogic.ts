import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectSequencesToPlace, selectDiceUsed, selectCompletedSequences } from "../store/slices/gameSelectors";
import { passTurn } from "../store/slices/gameSlice";
import { areAllSequencesCompleted } from "../utils/sequenceHelpers";

/**
 * Hook qui gère la logique de fin de placement des blocs.
 * Quand toutes les séquences sont placées, passe automatiquement au joueur suivant.
 */
export const useGameLogic = () => {
  const dispatch = useDispatch();
  const sequencesToPlace = useSelector(selectSequencesToPlace);
  const diceUsed = useSelector(selectDiceUsed);
  const completedSequences = useSelector(selectCompletedSequences);

  useEffect(() => {
    // Si on a des dés utilisés et que toutes les séquences sont complétées, passer au joueur suivant
    const allSequencesCompleted = diceUsed.length > 0 && areAllSequencesCompleted(completedSequences, sequencesToPlace.length);
    
    if (allSequencesCompleted) {
      console.log("Toutes les séquences ont été placées, passage au joueur suivant...");
      dispatch(passTurn());
    }
  }, [completedSequences.length, sequencesToPlace.length, diceUsed.length, dispatch, sequencesToPlace, completedSequences]);
};

