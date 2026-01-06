export interface Cell {
	type: "land" | "base" | "water"; // 'land', 'base', 'tower', 'village', 'zone', 'forbidden', 'riff"
	owner: number; // Joueur qui contrôle réellement la case (0 = libre, -1 = détruit)
	territory: number; // Joueur dont le territoire inclut cette case (0 = neutre)
	zone: number; // Joueur à qui la zone est dédiée (0 = neutre, -1 = détruit)
	hp: number; // Points de vie du block
}
