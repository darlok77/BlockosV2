import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { selectSequence, playablePositions } from "../store/slices/gameSlice";

type SequenceType = 'attack' | 'defense' | 'destroy';

/**
 * Hook pour gérer les actions liées aux séquences de blocs
 */
export const useSequences = () => {
  const dispatch = useDispatch();

  const handleSelectSequence = useCallback((index: number) => {
    dispatch(selectSequence(index));
    dispatch(playablePositions());
  }, [dispatch]);

  const getSequenceButtonStyle = useCallback((
    isSelected: boolean,
    isCompleted: boolean,
    isDisabled: boolean
  ) => {
    let backgroundColor = "#fff";
    if (isCompleted) {
      backgroundColor = "#c8e6c9";
    } else if (isSelected) {
      backgroundColor = "#fff9c4";
    }

    return {
      width: "100%",
      marginBottom: 5,
      padding: 8,
      border: "1px solid #999",
      borderRadius: 4,
      backgroundColor,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      display: "flex",
      alignItems: "center",
      gap: 5
    };
  }, []);

  const getSequenceIcon = (type: SequenceType) => {
    const iconMap = {
      attack: '⚔️',
      defense: '🛡️',
      destroy: '💥',
    };
    return iconMap[type];
  };

  const getSequenceLabel = (type: SequenceType) => {
    const labelMap = {
      attack: 'd\'attaque',
      defense: 'de défense',
      destroy: 'de destruction',
    };
    return labelMap[type];
  };

  const getSequenceColor = (type: SequenceType) => {
    const colorMap = {
      attack: "#d32f2f",
      defense: "#1976d2",
      destroy: "#9e9e9e",
    };
    return colorMap[type];
  };

  return {
    handleSelectSequence,
    getSequenceButtonStyle,
    getSequenceIcon,
    getSequenceLabel,
    getSequenceColor,
  };
};

