import { useSelector } from "react-redux";
import { selectBoard } from "../store/slices/gameSelectors";
import { Cell } from "./Cell";

export const GameBoard = () => {
	const board = useSelector(selectBoard);

	return (
		<table style={{ borderCollapse: "collapse", display: "inline-block" }}>
			<tbody>
				{board.map((row, x) => (
					<tr key={`row-${x}`}>
						{row.map((cell, y) => (
							<td key={`cell-${x}/${y}`} style={{ padding: 0 }}>
								<Cell
									type={cell.type}
									owner={cell.owner}
									territory={cell.territory}
									zone={cell.zone}
									hp={cell.hp}
									x={x}
									y={y}
								/>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};
