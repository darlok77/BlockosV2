import React from "react";

interface ProgressionDisplayProps {
  currentBlocks: number;
  totalBlocks: number;
}

export const ProgressionDisplay: React.FC<ProgressionDisplayProps> = ({
  currentBlocks,
  totalBlocks
}) => {
  const style: React.CSSProperties = {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #999"
  };

  return (
    <div style={style}>
      <div style={{ fontWeight: "bold" }}>
        Blocs placés : {currentBlocks} / {totalBlocks}
      </div>
    </div>
  );
};

