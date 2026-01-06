import exhaustiveCheck from "../../utils/exhaustiveGuard";
import { islandMapLayout } from "./islandMap";
import { trainingMapLayout } from "./trainingMap";

// Export toutes les cartes disponibles
export { islandMapLayout } from "./islandMap";
export { trainingMapLayout } from "./trainingMap";

export type MapId = "training" | "island";

export const getMapById = (mapId: MapId) => {
	switch (mapId) {
		case "training":
			return trainingMapLayout;
		case "island":
			return islandMapLayout;
		default:
			exhaustiveCheck(mapId);
	}
};
