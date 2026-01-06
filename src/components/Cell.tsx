import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { Cell as CellType } from "../data";
import {
	selectBoard,
	selectBlocksPlacedInSequence,
	selectCanPlaceBlock,
	selectCurrentPlayer,
	selectCurrentSequence,
	selectDiceUsed,
	selectIsCellPlayable,
	selectSequenceStartPosition,
} from "../store/slices/gameSelectors";
import {
	completeSequence,
	incrementBlocksPlaced,
	playablePositions,
	setSequenceDirection,
	setSequenceStartPosition,
	updateCell,
} from "../store/slices/gameSlice";

export interface CellProps extends CellType {
	x: number;
	y: number;
}

export const Cell = React.memo<CellProps>((props: CellProps) => {
	const { type, owner, x, y, hp } = props;
	const dispatch = useDispatch();
	const board = useSelector(selectBoard);
	const currentPlayer = useSelector(selectCurrentPlayer);
	const diceUsed = useSelector(selectDiceUsed);
	const isPlayable = useSelector(selectIsCellPlayable(x, y));
	const canPlaceBlock = useSelector(selectCanPlaceBlock);
	const currentSequence = useSelector(selectCurrentSequence);
	const blocksPlacedInSequence = useSelector(selectBlocksPlacedInSequence);
	const sequenceStartPosition = useSelector(selectSequenceStartPosition);

	const handleClick = useCallback(() => {
		if (type === "water" && (currentSequence?.type !== "bridge" && currentSequence?.type !== "destroy")) return;
		if (!diceUsed || diceUsed.length === 0) return;
		if (!canPlaceBlock) return;
		if (!currentSequence) return;
		if (isPlayable) {
			// Si c'est le premier bloc de la séquence, enregistrer la position de départ
			const isFirstBlock = blocksPlacedInSequence === 0;
			const isDestroyBlock = currentSequence.type === "destroy";
			const isAttackBlock = currentSequence.type === "attack";
			const isBridgeBlock = currentSequence.type === "bridge";
			const isBaseBlock = type === "base";
			const isOwnerEnemy = owner > 0 && owner !== currentPlayer;

			if (isDestroyBlock) {
				const newHp = (hp || 1) - 1;
				const isDestroyed = newHp <= 0;
				const isBridge = type === "water" && owner > 0;
				
				if (isDestroyed) {
					// Si c'est un pont (water avec owner), il redevient de l'eau libre
					if (isBridge) {
						dispatch(updateCell({ x, y, owner: 0, hp: 0 }));
					} else {
						dispatch(updateCell({ x, y, owner: -1, hp: 0 }));
					}
				} else {
					dispatch(updateCell({ x, y, hp: newHp, owner }));
				}
			} else if (
				isAttackBlock &&
				isBaseBlock &&
				isOwnerEnemy
			) {
				// Cas exceptionnel pour les attaques de base :
				// Tous les blocs de la séquence sont placés en un seul clic
				const damageToInflict =
					currentSequence.nbBlocks - blocksPlacedInSequence;
				const newHp = hp - damageToInflict;
				const isDestroyed = newHp <= 0;

				// Infliger tous les dégâts en une fois
				if (isDestroyed) {
					dispatch(updateCell({ x, y, owner: -1, hp: 0 }));
				} else {
					dispatch(updateCell({ x, y, hp: newHp }));
				}

				// Marquer que tous les blocs de la séquence ont été placés
				const remaining = currentSequence.nbBlocks - blocksPlacedInSequence;
				for (let i = 0; i < remaining; i++) {
					dispatch(incrementBlocksPlaced());
				}

				// Passer immédiatement à la séquence suivante
				dispatch(completeSequence());
				return;
			} else if (isBridgeBlock) {
				// Pour les ponts, placer sur l'eau avec hp = 4
				dispatch(updateCell({ x, y, owner: currentPlayer, hp: 4 }));
		
				const directions = [
					{ x: x - 1, y }, // gauche
					{ x: x + 1, y }, // droite
					{ x, y: y - 1 }, // haut
					{ x, y: y + 1 }, // bas
				];
				
				for (const { x: nx, y: ny } of directions) {
					const isInBoundsX = nx >= 0 && nx < board.length;
					const isInBoundsY = ny >= 0 && ny < (board[0]?.length || 0);
					const isInBounds = isInBoundsX && isInBoundsY;
					if (isInBounds) {
						const adjacentCell = board[nx][ny];
						const isLand = adjacentCell.type === 'land';
						const isNotDestroyed = adjacentCell.owner !== -1;
						if (isLand && isNotDestroyed) {
							dispatch(updateCell({ x: nx, y: ny, hp: 4 }));
						}
					}
				}
			} else {
				// Pour les autres types de blocs, créer un nouveau bloc
				dispatch(updateCell({ x, y, owner: currentPlayer, hp }));
			}

			dispatch(incrementBlocksPlaced());

			// Si c'est le premier bloc, enregistrer la position de départ et recalculer les positions
			if (isFirstBlock && currentSequence.nbBlocks > 1) {
				dispatch(setSequenceStartPosition({ x, y }));
			} else if (sequenceStartPosition && blocksPlacedInSequence === 1) {
				// Si c'est le 2ème bloc, calculer la direction
				// Normaliser la direction pour qu'elle reste entre -1 et 1
				const rawDx = x - sequenceStartPosition.x;
				const rawDy = y - sequenceStartPosition.y;
				const dx = rawDx === 0 ? 0 : rawDx / Math.abs(rawDx);
				const dy = rawDy === 0 ? 0 : rawDy / Math.abs(rawDy);
				dispatch(setSequenceDirection({ dx, dy }));
			}

			// Si on a placé tous les blocs de la séquence, passer à la suivante
			if (blocksPlacedInSequence + 1 >= currentSequence.nbBlocks) {
				dispatch(completeSequence());
			} else {
				// Recalculer les positions jouables après chaque placement (sauf si on a complété la séquence)
				dispatch(playablePositions());
			}
		}
	}, [
		x,
		y,
		hp,
		owner,
		type,
		diceUsed,
		canPlaceBlock,
		currentSequence,
		isPlayable,
		blocksPlacedInSequence,
		dispatch,
		currentPlayer,
		sequenceStartPosition,
		board,
	]);

	// Couleurs par joueur
	const getPlayerColor = useCallback((player: number) => {
		if (player === 0) return "#f0f0f0"; // Gris clair pour les cases libres
		if (player === -1) return "#808080"; // Gris foncé pour les blocs détruits
		if (player === 1) return "#2196F3"; // Bleu pour joueur 1
		if (player === 2) return "#f44336"; // Rouge pour joueur 2
		if (player === 3) return "#FFEB3B"; // Jaune pour joueur 3
		if (player === 4) return "#4CAF50"; // Vert pour joueur 4
		return "#f0f0f0";
	}, []);

	const getCellBackgroundColor = useCallback(() => {
		if (type === "water" && owner === 0) return "#4FC3F7";
		if (hp < 0) return "#ff0000";
		return getPlayerColor(owner);
	}, [type, hp, owner, getPlayerColor]);

	const cellStyle = useMemo(
		() => ({
			width: 30,
			height: 30,
			border: "1px solid #999",
			outline: isPlayable && canPlaceBlock ? "3px solid orange" : "none",
			backgroundColor: getCellBackgroundColor(),
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			cursor: isPlayable && canPlaceBlock ? "pointer" : "not-allowed",
			opacity: isPlayable && !canPlaceBlock ? 0.5 : 1,
			padding: 0,
			margin: 0,
		}),
		[isPlayable, canPlaceBlock, getCellBackgroundColor],
	);

	const cellContent = useMemo(() => {
		if (type === "base") return `B${owner}`;
		if (type === "water" && owner !== 0) return 'P';
		return "";
	}, [type, owner]);

	const isDisabled =
		!isPlayable ||
		!canPlaceBlock ||
		!diceUsed ||
		diceUsed.length === 0 ||
		!currentSequence;
	
	let ariaLabel = "";
	if (type === "base") {
		ariaLabel = `Base du joueur ${owner} à la position (${x}, ${y})`;
	} else if (type === "water") {
		ariaLabel = `Eau à la position (${x}, ${y})`;
	} else {
		ariaLabel = `Cellule à la position (${x}, ${y})`;
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			style={cellStyle}
			disabled={isDisabled}
			aria-label={ariaLabel}
		>
			{cellContent}
		</button>
	);
});
