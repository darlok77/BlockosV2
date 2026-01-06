// src/App.tsx

import { BaseHP } from "./components/BaseHP";
import { DiceRoller } from "./components/DiceRoller";
import { GameBoard } from "./components/GameBoard";
import { useGameLogic } from "./hooks/useGameLogic";

function App() {
	useGameLogic(); // Utilise le hook pour gérer la logique de fin de placement

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
