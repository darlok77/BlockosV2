import React from "react";
import { useSelector } from "react-redux";
import { selectBoard} from "../store/slices/gameSelectors";
import { Cell } from "./Cell";

export const GameBoard: React.FC = () => {
  const board = useSelector(selectBoard);

  return (
    <div style={{ display: "inline-block" }}>
      {board.map((row, x) => (
        <div key={x} style={{ display: "flex" }}>
          {row.map((cell, y) => (
            <Cell key={`${x}/${y}`} type={cell.type} owner={cell.owner} territory={cell.territory} zone={cell.zone} hp={cell.hp} x={x} y={y} />
          ))}
        </div>
      ))}
    </div>
  );
};
