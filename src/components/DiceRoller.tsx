import { useDispatch, useSelector } from "react-redux";
import {
	selectBlocksPlacedInSequence,
	selectCompletedSequences,
	selectCurrentPlayer,
	selectCurrentSequence,
	selectCurrentSequenceIndex,
	selectDiceResult,
	selectSequencesToPlace,
} from "../store/slices/gameSelectors";
import {
	passTurn,
	playablePositions,
	selectSequence,
	setDiceResult,
	setDiceUsedValue,
} from "../store/slices/gameSlice";
import { type BlockType, calculateBlocksToPlace } from "../utils/gameRules";
import {
	isSequenceCompleted,
	isSequenceDisabled,
} from "../utils/sequenceHelpers";

export const DiceRoller = () => {
	const dispatch = useDispatch();
	const diceResult = useSelector(selectDiceResult);
	const sequencesToPlace = useSelector(selectSequencesToPlace);
	const currentSequenceIndex = useSelector(selectCurrentSequenceIndex);
	const blocksPlacedInSequence = useSelector(selectBlocksPlacedInSequence);
	const currentSequence = useSelector(selectCurrentSequence);
	const completedSequences = useSelector(selectCompletedSequences);
	const currentPlayer = useSelector(selectCurrentPlayer);
	const MAX_SUM = 6;
	const DICE_FACES = 6;

	const rollDice = () => {
		// if (diceResult || sequencesToPlace.length > 0) return;
		const die1 = Math.floor(Math.random() * DICE_FACES) + 1;
		const die2 = Math.floor(Math.random() * DICE_FACES) + 1;
		dispatch(setDiceResult({ die1, die2 }));
	};

	const handleChoose = (useSum: boolean) => {
		if (!diceResult) return;

		let diceValues: number[];
		if (useSum) {
			const sum = diceResult.die1 + diceResult.die2;
			diceValues = [sum];
		} else {
			diceValues = [diceResult.die1, diceResult.die2];
		}

		const sequences = calculateBlocksToPlace(diceValues);
		
		// Si la somme des dés est 10, 11 ou 12, ajouter une séquence de pont
		const sum = diceResult.die1 + diceResult.die2;
		if (sum === 10 || sum === 11 || sum === 12) {
			// Ajouter la séquence de pont à la fin de la liste
			sequences.push({ type: "bridge", nbBlocks: 1 }); // Séquence de pont (1 bloc)
		}

		dispatch(setDiceUsedValue({ diceValues, sequences }));
		dispatch(playablePositions());
	};

	const handleSelectSequence = (index: number) => {
		dispatch(selectSequence(index));
		dispatch(playablePositions());
	};

	const getPlayerColor = (player: number) => {
		if (player === 1) return "#2196F3"; // Bleu
		if (player === 2) return "#f44336"; // Rouge
		if (player === 3) return "#FFEB3B"; // Jaune
		if (player === 4) return "#4CAF50"; // Vert
		return "#999";
	};

	const getSequenceTextColor = (type: BlockType) => {
		if (type === "attack") return "#d32f2f";
		if (type === "defense") return "#1976d2";
		if (type === "bridge") return "#0288d1";
		return "#9e9e9e";
	};

	const getSequenceBackgroundColor = (
		isCompleted: boolean,
		isSelected: boolean,
	) => {
		if (isCompleted) return "#c8e6c9";
		if (isSelected) return "#fff9c4";
		return "#fff";
	};

	return (
		<div
			style={{
				padding: 20,
				border: "1px solid #999",
				borderRadius: 8,
				backgroundColor: "#f8f8f8",
				width: 220,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					marginBottom: 15,
				}}
			>
				<h3 style={{ margin: 0 }}>🎲 Double Dé</h3>
				<div
					style={{
						padding: "5px 10px",
						borderRadius: 5,
						backgroundColor: getPlayerColor(currentPlayer),
						color: "#000",
						fontWeight: "bold",
					}}
				>
					Joueur {currentPlayer}
				</div>
			</div>
			<button
				onClick={rollDice}
				// disabled={!!diceResult || sequencesToPlace.length > 0}
				style={{
					width: "100%",
					padding: 10,
					//opacity: !!diceResult || sequencesToPlace.length > 0 ? 0.6 : 1,
				}}
			>
				Lancer les dés
			</button>

			{diceResult && (
				<div style={{ marginTop: 20, color: "black" }}>
					<div>Dé 1 : {diceResult.die1}</div>
					<div>Dé 2 : {diceResult.die2}</div>
					{diceResult.die1 + diceResult.die2 <= MAX_SUM && (
						<div>Somme : {diceResult.die1 + diceResult.die2}</div>
					)}
					<div style={{ marginTop: 10 }}>
						<button
							onClick={() => handleChoose(false)}
							disabled={sequencesToPlace.length > 0}
							style={{
								marginRight: 5,
								opacity: sequencesToPlace.length > 0 ? 0.6 : 1,
							}}
						>
							Utiliser les deux dés séparément
						</button>
						{diceResult.die1 + diceResult.die2 <= MAX_SUM && (
							<button
								onClick={() => handleChoose(true)}
								disabled={sequencesToPlace.length > 0}
								style={{ opacity: sequencesToPlace.length > 0 ? 0.6 : 1 }}
							>
								Utiliser la somme {diceResult.die1 + diceResult.die2}
							</button>
						)}
						{(diceResult.die1 + diceResult.die2 === 10 || 
						  diceResult.die1 + diceResult.die2 === 11 || 
						  diceResult.die1 + diceResult.die2 === 12) && (
							<button
								onClick={() => handleChoose(true)}
								disabled={sequencesToPlace.length > 0}
								style={{
									marginLeft: 5,
									opacity: sequencesToPlace.length > 0 ? 0.6 : 1,
									backgroundColor: sequencesToPlace.length > 0 ? undefined : "#e3f2fd",
								}}
							>
								🌉 Construire un pont
							</button>
						)}
					</div>
				</div>
			)}

			{sequencesToPlace.length > 0 && (
				<div
					style={{
						marginTop: 20,
						padding: 10,
						backgroundColor: "#e8f5e9",
						borderRadius: 8,
						color: "black",
					}}
				>
					<div style={{ fontWeight: "bold", marginBottom: 5 }}>
						Choisissez une séquence :
					</div>
					{sequencesToPlace.map((sequence, index) => {
						const isSelected = currentSequenceIndex === index;
						const isCompleted = isSequenceCompleted(index, completedSequences);
						const isDisabled = isSequenceDisabled(
							index,
							currentSequenceIndex,
							completedSequences,
							blocksPlacedInSequence,
						);

						return (
							<button
								key={`sequence-${index}`}
								onClick={() => handleSelectSequence(index)}
								disabled={isDisabled}
								style={{
									width: "100%",
									marginBottom: 5,
									padding: 8,
									border: "1px solid #999",
									borderRadius: 4,
									backgroundColor: getSequenceBackgroundColor(
										isCompleted,
										isSelected,
									),
									cursor: isDisabled ? "not-allowed" : "pointer",
									opacity: isDisabled ? 0.5 : 1,
									display: "flex",
									alignItems: "center",
									gap: 5,
								}}
							>
								<span style={{ fontSize: 20 }}>
									{sequence.type === "attack" && "⚔️"}
									{sequence.type === "defense" && "🛡️"}
									{sequence.type === "destroy" && "💥"}
									{sequence.type === "bridge" && "🌉"}
								</span>
								<span
									style={{
										flex: 1,
										textAlign: "left",
										color: getSequenceTextColor(sequence.type),
									}}
								>
									{sequence.nbBlocks} bloc{sequence.nbBlocks > 1 ? "s" : ""}{" "}
									{sequence.type === "attack" && "d'attaque"}
									{sequence.type === "defense" && "de défense"}
									{sequence.type === "destroy" && "de destruction"}
									{sequence.type === "bridge" && "de pont"}
								</span>
							</button>
						);
					})}

					{currentSequence && (
						<div
							style={{
								marginTop: 10,
								paddingTop: 10,
								borderTop: "1px solid #999",
							}}
						>
							<div style={{ fontWeight: "bold" }}>
								Blocs placés : {blocksPlacedInSequence} /{" "}
								{currentSequence.nbBlocks}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Bouton Passer */}
			<div style={{ marginTop: 20 }}>
				<button
					onClick={() => dispatch(passTurn())}
					disabled={blocksPlacedInSequence > 0}
					style={{
						width: "100%",
						padding: 10,
						backgroundColor: blocksPlacedInSequence > 0 ? "#ccc" : "#ff9800",
						color: "white",
						border: "none",
						borderRadius: 4,
						cursor: blocksPlacedInSequence > 0 ? "not-allowed" : "pointer",
						opacity: blocksPlacedInSequence > 0 ? 0.5 : 1,
					}}
				>
					Passer
				</button>
			</div>
		</div>
	);
};
