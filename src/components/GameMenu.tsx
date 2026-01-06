import { useState } from "react";
import { useDispatch } from "react-redux";
import type { MapId } from "../data/maps";
import { initGame } from "../store/slices/gameSlice";

export const GameMenu = () => {
	const [selectedMap, setSelectedMap] = useState<MapId>("training");
	const [nbPlayers, setNbPlayers] = useState<number>(2);
	const dispatch = useDispatch();

	const handleStartGame = () => {
		dispatch(initGame({ mapId: selectedMap, nbPlayers }));
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				gap: 24,
				padding: 40,
			}}
		>
			<h1 style={{ fontSize: 32, marginBottom: 20 }}>Blockos</h1>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 16,
					backgroundColor: "#f5f5f5",
					padding: 32,
					borderRadius: 8,
					minWidth: 300,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<label htmlFor="map-select" style={{ fontWeight: "bold" }}>
						Sélectionner la carte :
					</label>
					<select
						id="map-select"
						value={selectedMap}
						onChange={(e) => setSelectedMap(e.target.value as MapId)}
						style={{
							padding: 8,
							fontSize: 16,
							borderRadius: 4,
							border: "1px solid #ccc",
						}}
					>
						<option value="training">Carte d'entraînement</option>
						<option value="island">Carte Île</option>
					</select>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<label htmlFor="players-select" style={{ fontWeight: "bold" }}>
						Nombre de joueurs :
					</label>
					<select
						id="players-select"
						value={nbPlayers}
						onChange={(e) => setNbPlayers(Number(e.target.value))}
						style={{
							padding: 8,
							fontSize: 16,
							borderRadius: 4,
							border: "1px solid #ccc",
						}}
					>
						<option value={2}>2 joueurs</option>
						<option value={3}>3 joueurs</option>
						<option value={4}>4 joueurs</option>
					</select>
				</div>

				<button
					onClick={handleStartGame}
					style={{
						padding: 12,
						fontSize: 18,
						fontWeight: "bold",
						backgroundColor: "#2196F3",
						color: "white",
						border: "none",
						borderRadius: 4,
						cursor: "pointer",
						marginTop: 8,
					}}
				>
					Commencer la partie
				</button>
			</div>
		</div>
	);
};
