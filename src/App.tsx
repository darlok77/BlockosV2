// src/App.tsx

import { useSelector } from "react-redux";
import { BaseHP } from "./components/BaseHP";
import { DiceRoller } from "./components/DiceRoller";
import { GameBoard } from "./components/GameBoard";
import { GameMenu } from "./components/GameMenu";
import { useGameLogic } from "./hooks/useGameLogic";
import { selectIsMenuVisible } from "./store/slices/gameSelectors";

function App() {
	const isMenuVisible = useSelector(selectIsMenuVisible);
	useGameLogic(); // Utilise le hook pour gérer la logique de fin de placement

	if (isMenuVisible) {
		return <GameMenu />;
	}

	return (
		<div style={{ display: "flex", padding: 20, gap: 20 }}>
			<GameBoard />
			<div style={{ display: "flex", gap: 16 }}>
				<DiceRoller />
				<BaseHP />
			</div>
		</div>
	);
}

export default App;
