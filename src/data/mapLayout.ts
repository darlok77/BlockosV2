// 1 = base bleue, 2 = base jaune, 3 = base rouge, 4 = base verte
// T1 = tour 1, T2 = tour 2, T3 = tour 3, T4 = tour 4
// Z1 = zone de protection tour 1 , Z2 = zone de protection tour 2 , Z3 = zone de protection tour 3 , Z4 = zone de protection tour 4
// V = village
// X = interdit
// W = eau

type blockType = 'land' | 'base';

export interface Cell {
  type: blockType;              // 'land', 'base', 'tower', 'village', 'water', 'zone', 'forbidden'
  owner: number;             // Joueur qui contrôle réellement la case (0 = libre, -1 = détruit)
  territory: number;         // Joueur dont le territoire inclut cette case (0 = neutre)
  zone: number;              // Joueur à qui la zone est dédiée (0 = neutre, -1 = détruit)
  hp: number;                // Points de vie du block
  }
// 10x10
export const trainingMapLayout: Cell[][] = [
	//ligne 1
	[
		{ type: 'base', owner: 1, territory: 1, zone: 1, hp: 10 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 1, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
	],
	//ligne 2
	[
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: -1, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
	],
	//ligne 3
	[
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 1, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: -1, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: -1, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: -1, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
	],
	//ligne 4
	[
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: -1, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
	],
	//ligne 5
	[
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 1, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 1, zone: 1, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
	],
	//ligne 6
	[
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: -1, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: -1, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
	],
	//ligne 7
	[
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
	],
	//ligne 8
	[
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: -1, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: -1, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
	],
	//ligne 9
	[
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: -1, territory: 2, zone: 2, hp: 1 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
	],
	//ligne 10
	[
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 0, zone: 0, hp: 0 },
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: 1, territory: 2, zone: 2, hp: 0 }, 
		{ type: 'land', owner: 0, territory: 2, zone: 2, hp: 0 },
		{ type: 'land', owner: -1, territory: 2, zone: 2, hp: 1 }, 
		{ type: 'base', owner: 2, territory: 2, zone: 2, hp: 10 },
	],
];