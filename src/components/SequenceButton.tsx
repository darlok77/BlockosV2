import React from "react";
import type { BlockToPlace } from "../utils/gameRules";
import { getSequenceButtonStyle, getSequenceIcon, formatSequenceText, getSequenceColor } from "../utils/sequenceHelpers";

interface SequenceButtonProps {
  sequence: BlockToPlace;
  index: number;
  isSelected: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export const SequenceButton: React.FC<SequenceButtonProps> = ({
  sequence,
  isSelected,
  isCompleted,
  isDisabled,
  onClick
}) => {
  const buttonStyle = getSequenceButtonStyle(isSelected, isCompleted, isDisabled);
  const icon = getSequenceIcon(sequence.type);
  const text = formatSequenceText(sequence);
  const color = getSequenceColor(sequence.type);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={buttonStyle}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ flex: 1, textAlign: "left", color }}>
        {text}
      </span>
    </button>
  );
};

