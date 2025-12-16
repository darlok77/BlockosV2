import type { Cell } from "../data/mapLayout";
import exhaustiveCheck from "./exhaustiveGuard";

export interface BlockToPlace {
  type: 'attack' | 'defense' | 'destroy';
  nbBlocks: number;
}

// Fonction pour calculer les blocs à placer selon la valeur du dé
const getBlocksForDiceValue = (value: number): BlockToPlace[] => {
  switch (value) {
    case 1:
      return [{ type: 'destroy', nbBlocks: 1 }];
    case 2:
      return [{ type: 'defense', nbBlocks: 1 }];
    case 3:
      return [{ type: 'defense', nbBlocks: 2 }];
    case 4:
      return [{ type: 'defense', nbBlocks: 3 }];
    case 5:
      return [{ type: 'attack', nbBlocks: 1 }];
    case 6:
      return [{ type: 'attack', nbBlocks: 2 }];
    default:
      return [];
  }
};

/**
 * Crée une liste séquentielle de blocs individuels à placer.
 * Par exemple, si on a un 3 (2 défense) et un 4 (3 défense), 
 * ça retourne une liste de 5 blocs de défense.
 */
export const calculateBlocksToPlaceSequentially = (diceUsed: number[]): BlockToPlace[] => {
  const blocks: BlockToPlace[] = [];
  
  for (const value of diceUsed) {
    const valueBlocks = getBlocksForDiceValue(value);
    // Pour chaque bloc avec nbBlocks, on crée nbBlocks blocs individuels
    for (const block of valueBlocks) {
      for (let i = 0; i < block.nbBlocks; i++) {
        blocks.push({ type: block.type, nbBlocks: 1 });
      }
    }
  }
  
  return blocks;
};

export const calculateBlocksToPlace = (diceUsed: number[]): BlockToPlace[] => {
  const blocks: BlockToPlace[] = [];
  
  for (const value of diceUsed) {
    const valueBlocks = getBlocksForDiceValue(value);
    blocks.push(...valueBlocks);
  }
  
  return blocks;
};

/**
 * Retourne les 4 positions adjacentes à une position donnée (pour l'alignement)
 * Vérifie qu'on peut placer tous les blocs restants de la séquence
 */
export const getAlignedPositions = (
  board: Cell[][], 
  startPosition: { x: number; y: number },
  blockType: 'attack' | 'defense' | 'destroy',
  currentPlayer: number,
  nbBlocksRemaining: number = 1
): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = [];
  const { x, y } = startPosition;
  const cols = board.length;
  const rows = board[0]?.length || 0;
  
  // Vérifier les 4 directions adjacentes
  const directions = [
    { x: x - 1, y, dx: -1, dy: 0 },
    { x: x + 1, y, dx: 1, dy: 0 },
    { x, y: y - 1, dx: 0, dy: -1 },
    { x, y: y + 1, dx: 0, dy: 1 },
  ];
  
  for (const { x: nx, y: ny, dx, dy } of directions) {
    // Vérifier les limites du board
    if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
    
    const cell = board[nx][ny];
    
    // Cas spécial : si c'est un bloc détruit ET qu'il reste au moins 1 bloc ET que la position suivante est une base adverse
    if (cell.owner === -1 && nbBlocksRemaining >= 1 && blockType === 'attack') {
      const beyondX = nx + dx;
      const beyondY = ny + dy;
      
      if (beyondX >= 0 && beyondX < cols && beyondY >= 0 && beyondY < rows) {
        const beyondCell = board[beyondX][beyondY];
        if (beyondCell.type === 'base' && beyondCell.owner > 0 && beyondCell.owner !== currentPlayer) {
          // On peut sauter le bloc détruit et attaquer la base
          if (!positions.some(p => p.x === beyondX && p.y === beyondY)) {
            positions.push({ x: beyondX, y: beyondY });
          }
          continue;
        }
      }
    }
    
    // Vérifier les règles selon le type de bloc
    if (canPlaceBlockOnCell(cell, blockType, currentPlayer, board, nx, ny)) {
      // Cas spécial : pour les attaques sur une base, toujours permettre même sans places consécutives
      if (blockType === 'attack' && cell.type === 'base') {
        positions.push({ x: nx, y: ny });
      }
      // Vérifier qu'on peut placer tous les blocs restants dans cette direction
      else if (nbBlocksRemaining > 1) {
        let canPlaceAll = true;
        for (let i = 1; i < nbBlocksRemaining; i++) {
          const checkX = nx + dx * i;
          const checkY = ny + dy * i;
          
          // Vérifier les limites
          if (checkX < 0 || checkX >= cols || checkY < 0 || checkY >= rows) {
            canPlaceAll = false;
            break;
          }
          
          const checkCell = board[checkX][checkY];
          
          // On peut sauter les blocs détruits si après il y a une base adverse
          if (checkCell.owner === -1 && i === nbBlocksRemaining - 1 && blockType === 'attack') {
            const beyondX = checkX + dx;
            const beyondY = checkY + dy;
            if (beyondX >= 0 && beyondX < cols && beyondY >= 0 && beyondY < rows) {
              const beyondCell = board[beyondX][beyondY];
              if (beyondCell.type === 'base' && beyondCell.owner > 0 && beyondCell.owner !== currentPlayer) {
                // OK, on peut continuer
                break;
              }
            }
            canPlaceAll = false;
            break;
          }
          
          if (!canPlaceBlockOnCell(checkCell, blockType, currentPlayer, board, checkX, checkY)) {
            canPlaceAll = false;
            break;
          }
        }
        
        if (canPlaceAll) {
          positions.push({ x: nx, y: ny });
        }
      } else {
        positions.push({ x: nx, y: ny });
      }
    }
  }
  
  return positions;
};

/**
 * Retourne la position suivante dans une direction donnée (pour les blocs consécutifs)
 * Vérifie qu'on peut placer tous les blocs restants de la séquence
 */
export const getNextPositionInDirection = (
  board: Cell[][],
  currentPosition: { x: number; y: number },
  direction: { dx: number; dy: number },
  blockType: 'attack' | 'defense' | 'destroy',
  currentPlayer: number,
  nbBlocksRemaining: number = 1
): { x: number; y: number } | null => {
  const cols = board.length;
  const rows = board[0]?.length || 0;
  
  const nextX = currentPosition.x + direction.dx;
  const nextY = currentPosition.y + direction.dy;
  
  // Vérifier les limites du board
  if (nextX < 0 || nextX >= cols || nextY < 0 || nextY >= rows) return null;
  
  const cell = board[nextX][nextY];
  
  // Cas spécial : si c'est un bloc détruit (owner === -1) ET qu'il reste 1 bloc ET que la position suivante est une base adverse
  if (cell.owner === -1 && nbBlocksRemaining === 1) {
    const beyondX = nextX + direction.dx;
    const beyondY = nextY + direction.dy;
    
    if (beyondX >= 0 && beyondX < cols && beyondY >= 0 && beyondY < rows) {
      const beyondCell = board[beyondX][beyondY];
      if (beyondCell.type === 'base' && beyondCell.owner > 0 && beyondCell.owner !== currentPlayer) {
        // On peut sauter le bloc détruit et attaquer la base
        return { x: beyondX, y: beyondY };
      }
    }
  }
  
  // Vérifier les règles selon le type de bloc
  if (canPlaceBlockOnCell(cell, blockType, currentPlayer, board, nextX, nextY)) {
    // Si c'est le dernier bloc, on peut placer ici
    if (nbBlocksRemaining === 1) {
      return { x: nextX, y: nextY };
    }
    
    // Sinon, vérifier qu'on peut placer tous les blocs restants dans la direction
    let canPlaceAll = true;
    for (let i = 1; i < nbBlocksRemaining; i++) {
      const checkX = nextX + direction.dx * i;
      const checkY = nextY + direction.dy * i;
      
      // Vérifier les limites
      if (checkX < 0 || checkX >= cols || checkY < 0 || checkY >= rows) {
        canPlaceAll = false;
        break;
      }
      
      const checkCell = board[checkX][checkY];
      
      // On peut sauter les blocs détruits si après il y a une base adverse
      if (checkCell.owner === -1 && i === nbBlocksRemaining - 1) {
        // C'est le dernier bloc, vérifier si après il y a une base adverse
        const beyondX = checkX + direction.dx;
        const beyondY = checkY + direction.dy;
        if (beyondX >= 0 && beyondX < cols && beyondY >= 0 && beyondY < rows) {
          const beyondCell = board[beyondX][beyondY];
          if (beyondCell.type === 'base' && beyondCell.owner > 0 && beyondCell.owner !== currentPlayer) {
            // OK, on peut continuer
            break;
          }
        }
        canPlaceAll = false;
        break;
      }
      
      if (!canPlaceBlockOnCell(checkCell, blockType, currentPlayer, board, checkX, checkY)) {
        canPlaceAll = false;
        break;
      }
    }
    
    if (canPlaceAll) {
      return { x: nextX, y: nextY };
    }
  }
  
  return null;
};

const isCellValidForDestroy = (cell: Cell, currentPlayer: number): boolean => {
  return (
    cell.owner > 0 && // cellule possédée par un joueur
    cell.owner !== currentPlayer && // cellule possédée par un autre joueur
    cell.territory !== currentPlayer && // cellule dans le territoire d'un autre joueur
    cell.type === 'land' // cellule dans un terrain
  )
}
const isCellValidForAttack = (
  cell: Cell, 
  currentPlayer: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _board: Cell[][],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _x?: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _y?: number
): boolean => {
  // Si c'est une base, elle doit appartenir à un adversaire
  if (cell.type === 'base') {
    return cell.owner > 0 && cell.owner !== currentPlayer;
  }
  
  // Les blocs détruits ne peuvent PAS recevoir un bloc d'attaque
  if (cell.owner === -1) {
    return false;
  }
  
  // Sinon, cellule libre (owner === 0) dans la zone d'un autre joueur
  return cell.owner === 0 && cell.zone !== currentPlayer;
}
const isCellValidForDefense = (cell: Cell, currentPlayer: number): boolean => {
  return (
    cell.owner === 0 && // cellule libre
    (cell.territory === currentPlayer || cell.zone === currentPlayer) // cellule dans le territoire ou la zone du joueur
  )
}

/**
 * Vérifie si une cellule peut recevoir un bloc selon son type
 */
export const canPlaceBlockOnCell = (
  cell: Cell,
  blockType: 'attack' | 'defense' | 'destroy',
  currentPlayer: number,
  board?: Cell[][],
  x?: number,
  y?: number
): boolean => {
  switch (blockType) {
    case 'defense':
      return isCellValidForDefense(cell, currentPlayer);
    case 'attack':
      return isCellValidForAttack(cell, currentPlayer, board || [], x, y);
    case 'destroy':
      // Blocs de destruction : cellule possédée par un autre joueur ET territory !== currentPlayer
      return isCellValidForDestroy(cell, currentPlayer);
    default:
      exhaustiveCheck(blockType);
  }
};

export const getPlayablePositions = (
  board: Cell[][], 
  currentPlayer: number,
  blockType?: 'attack' | 'defense' | 'destroy',
  nbBlocksRemaining?: number
) => {
  const positions: { x: number; y: number }[] = [];
  const cols = board.length;        // nombre de colonnes
  const rows = board[0]?.length || 0;  // nombre de lignes par colonne
  
  // Pour les blocs de type "destroy", on peut cibler n'importe quel bloc adverse
  // pas besoin qu'il soit adjacent aux cellules du joueur
  if (blockType === 'destroy') {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = board[x][y];
        if (canPlaceBlockOnCell(cell, blockType, currentPlayer, board, x, y)) {
          positions.push({ x, y });
        }
      }
    }
    return positions;
  }
  
  // Pour les autres types de blocs, on cherche seulement les positions adjacentes
  // Optimisation : parcourir seulement les cellules adjacentes aux cellules possédées
  const ownedCells: { x: number; y: number }[] = [];
  
  // D'abord, collecter toutes les cellules possédées par le joueur
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (board[x][y].owner === currentPlayer) {
        ownedCells.push({ x, y });
      }
    }
  }
  
  // Ensuite, vérifier seulement les cellules adjacentes aux cellules possédées
  const checkedPositions = new Set<string>();
  
  for (const { x, y } of ownedCells) {
    // Vérifier les 4 directions adjacentes
    const directions = [
      { x: x - 1, y },     // gauche
      { x: x + 1, y },     // droite
      { x, y: y - 1 },     // haut
      { x, y: y + 1 },     // bas
    ];
    
    for (const { x: nx, y: ny } of directions) {
      // Vérifier les limites du board
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      
      const positionKey = `${nx}-${ny}`;
      if (checkedPositions.has(positionKey)) continue;
      
      checkedPositions.add(positionKey);
      
      const cell = board[nx][ny];
      
      // Si on a un type de bloc spécifique, vérifier les règles spéciales
      if (blockType) {
        if (canPlaceBlockOnCell(cell, blockType, currentPlayer, board, nx, ny)) {
          // Cas spécial : pour les attaques sur une base, toujours permettre
          if (blockType === 'attack' && cell.type === 'base') {
            positions.push({ x: nx, y: ny });
          }
          // Si on a un nombre de blocs restants, vérifier qu'on peut tous les placer
          else if (nbBlocksRemaining && nbBlocksRemaining > 1) {
            if (canPlaceAllBlocksInSequence(board, nx, ny, blockType, currentPlayer, nbBlocksRemaining)) {
              positions.push({ x: nx, y: ny });
            }
          } else {
            // Sinon, ajouter normalement
            positions.push({ x: nx, y: ny });
          }
        }
      } else {
        // Sinon, vérifier seulement si la cellule est libre
        if (cell.owner === 0) {
        positions.push({ x: nx, y: ny });
        }
      }
    }
  }
  
  // Pour les attaques, chercher aussi les positions adjacentes aux blocs détruits alignés
  // Le 1er bloc d'attaque doit être COLLÉ au bloc détruit, à l'opposé du bloc du joueur
  if (blockType === 'attack') {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = board[x][y];
        // Si c'est un bloc détruit (owner === -1) avec territory différent du joueur
        if (cell.owner === -1 && cell.territory !== currentPlayer) {
          // Chercher si un bloc du joueur est aligné avec ce bloc détruit
          // et déterminer la direction du joueur par rapport au bloc détruit
          const directions = [
            { dx: -1, dy: 0, opp: { dx: 1, dy: 0 } },   // joueur à gauche -> attaque à droite
            { dx: 1, dy: 0, opp: { dx: -1, dy: 0 } },   // joueur à droite -> attaque à gauche
            { dx: 0, dy: -1, opp: { dx: 0, dy: 1 } },   // joueur en haut -> attaque en bas
            { dx: 0, dy: 1, opp: { dx: 0, dy: -1 } },  // joueur en bas -> attaque en haut
          ];
          
          for (const { dx, dy, opp } of directions) {
            const playerX = x + dx;
            const playerY = y + dy;
            
            // Vérifier si un bloc du joueur est adjacent dans cette direction
            if (playerX >= 0 && playerX < cols && playerY >= 0 && playerY < rows) {
              const playerCell = board[playerX][playerY];
              if (playerCell.owner === currentPlayer && playerCell.owner > 0) {
                // Trouvé ! Le joueur a un bloc de ce côté
                // On peut maintenant placer un bloc d'attaque de l'autre côté (à l'opposé)
                const attackX = x + opp.dx;
                const attackY = y + opp.dy;
                
                if (attackX >= 0 && attackX < cols && attackY >= 0 && attackY < rows) {
                  const positionKey = `${attackX}-${attackY}`;
                  if (!checkedPositions.has(positionKey)) {
                    checkedPositions.add(positionKey);
                    const attackCell = board[attackX][attackY];
                    
                    // Si c'est une base adverse, on peut toujours l'attaquer
                    if (attackCell.type === 'base' && attackCell.owner > 0 && attackCell.owner !== currentPlayer) {
                      positions.push({ x: attackX, y: attackY });
                    }
                    // Sinon, vérifier que c'est une cellule LIBRE
                    else if (attackCell.owner === 0 && canPlaceBlockOnCell(attackCell, blockType, currentPlayer, board, attackX, attackY)) {
                      positions.push({ x: attackX, y: attackY });
                    }
                  }
                }
                break; // On ne cherche qu'une seule direction alignée
              }
            }
          }
        }
      }
    }
  }
  
  // Pour les attaques, chercher les chemins de blocs détruits
  if (blockType === 'attack') {
    // Trouver les groupes de blocs détruits connectés aux blocs du joueur
    const destroyedGroups: Array<Set<string>> = [];
    const visited = new Set<string>();
    
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = board[x][y];
        if (cell.owner === -1 && !visited.has(`${x}-${y}`)) {
          // Nouveau groupe de blocs détruits
          const group = new Set<string>();
          const toVisit: Array<{ x: number; y: number }> = [{ x, y }];
          
          while (toVisit.length > 0) {
            const { x: cx, y: cy } = toVisit.pop()!;
            const key = `${cx}-${cy}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            const cCell = board[cx][cy];
            if (cCell.owner !== -1) continue;
            
            group.add(key);
            
            // Ajouter les voisins à visiter
            const neighbors = [
              { x: cx - 1, y: cy },
              { x: cx + 1, y: cy },
              { x: cx, y: cy - 1 },
              { x: cx, y: cy + 1 },
            ];
            
            for (const { x: nx, y: ny } of neighbors) {
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                if (!visited.has(`${nx}-${ny}`)) {
                  const nCell = board[nx][ny];
                  // Si c'est un bloc détruit OU un bloc du joueur actuel
                  if (nCell.owner === -1 || nCell.owner === currentPlayer) {
                    toVisit.push({ x: nx, y: ny });
                  }
                }
              }
            }
          }
          
          // Vérifier si ce groupe touche un bloc du joueur
          let touchesPlayer = false;
          for (const key of group) {
            const [gx, gy] = key.split('-').map(Number);
            const neighbors = [
              { x: gx - 1, y: gy },
              { x: gx + 1, y: gy },
              { x: gx, y: gy - 1 },
              { x: gx, y: gy + 1 },
            ];
            
            for (const { x: nx, y: ny } of neighbors) {
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                const nCell = board[nx][ny];
                if (nCell.owner === currentPlayer && nCell.owner > 0) {
                  touchesPlayer = true;
                  break;
                }
              }
            }
            
            if (touchesPlayer) break;
          }
          
          if (touchesPlayer) {
            destroyedGroups.push(group);
          }
        }
      }
    }
    
    // Pour chaque groupe de blocs détruits, trouver les positions adjacentes libres
    for (const group of destroyedGroups) {
      // Déterminer la direction principale du groupe (où est le joueur par rapport au groupe)
      const playerDirections = new Set<string>();
      
      for (const key of group) {
        const [gx, gy] = key.split('-').map(Number);
        const neighbors = [
          { x: gx - 1, y: gy, dir: 'left' },
          { x: gx + 1, y: gy, dir: 'right' },
          { x: gx, y: gy - 1, dir: 'top' },
          { x: gx, y: gy + 1, dir: 'bottom' },
        ];
        
        for (const { x: nx, y: ny, dir } of neighbors) {
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const nCell = board[nx][ny];
            if (nCell.owner === currentPlayer && nCell.owner > 0) {
              playerDirections.add(dir);
            }
          }
        }
      }
      
      // Directions opposées au joueur
      const oppositeDirs = new Set<string>();
      for (const dir of playerDirections) {
        if (dir === 'top') oppositeDirs.add('bottom');
        else if (dir === 'bottom') oppositeDirs.add('top');
        else if (dir === 'left') oppositeDirs.add('right');
        else if (dir === 'right') oppositeDirs.add('left');
      }
      
      // Trouver les cellules adjacentes libres uniquement dans les directions opposées
      const adjacentFreeCells = new Set<string>();
      
      for (const key of group) {
        const [gx, gy] = key.split('-').map(Number);
        const neighbors = [
          { x: gx - 1, y: gy, dir: 'left' },
          { x: gx + 1, y: gy, dir: 'right' },
          { x: gx, y: gy - 1, dir: 'top' },
          { x: gx, y: gy + 1, dir: 'bottom' },
        ];
        
        for (const { x: nx, y: ny, dir } of neighbors) {
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const nCell = board[nx][ny];
            // Si c'est libre ET pas dans le groupe ET dans une direction opposée au joueur
            if (nCell.owner === 0 && !group.has(`${nx}-${ny}`) && oppositeDirs.has(dir)) {
              adjacentFreeCells.add(`${nx}-${ny}`);
            }
          }
        }
      }
      
      // Ajouter les cellules adjacentes libres aux positions jouables
      for (const key of adjacentFreeCells) {
        const [ax, ay] = key.split('-').map(Number);
        const positionKey = `${ax}-${ay}`;
        
        if (!checkedPositions.has(positionKey)) {
          checkedPositions.add(positionKey);
          const cell = board[ax][ay];
          
          if (canPlaceBlockOnCell(cell, blockType, currentPlayer, board, ax, ay)) {
            positions.push({ x: ax, y: ay });
          }
        }
      }
    }
  }
  
  return positions;
};

/**
 * Vérifie si on peut placer tous les blocs restants d'une séquence depuis une position de départ.
 * Vérifie qu'il y a assez de cases adjacentes libres dans au moins une direction.
 */
const canPlaceAllBlocksInSequence = (
  board: Cell[][],
  startX: number,
  startY: number,
  blockType: 'attack' | 'defense' | 'destroy',
  currentPlayer: number,
  nbBlocksRemaining: number
): boolean => {
  const cols = board.length;
  const rows = board[0]?.length || 0;
  const directions = [
    { dx: 1, dy: 0 },   // droite
    { dx: -1, dy: 0 },  // gauche
    { dx: 0, dy: 1 },   // bas
    { dx: 0, dy: -1 }   // haut
  ];
  
  // Vérifier si au moins une direction permet de placer tous les blocs
  for (const dir of directions) {
    let canPlace = true;
    
    for (let i = 1; i < nbBlocksRemaining; i++) {
      const x = startX + dir.dx * i;
      const y = startY + dir.dy * i;
      
      // Vérifier si la position est valide
      if (x < 0 || x >= cols || y < 0 || y >= rows) {
        canPlace = false;
        break;
      }
      
      const cell = board[x][y];
      // Vérifier si on peut placer le bloc à cette position
      if (!canPlaceBlockOnCell(cell, blockType, currentPlayer, board, x, y)) {
        canPlace = false;
        break;
      }
    }
    
    if (canPlace) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calcule toutes les cellules capturables pour un joueur dans une seule passe.
 * Optimisé pour calculer tous les territoires en O(n²) au lieu de O(n³) ou O(n⁴).
 */
export const calculateAllTerritoryCapture = (
  board: Cell[][],
  player: number
): Array<{ x: number; y: number; territory: number }> => {
  const cols = board.length;
  const rows = board[0]?.length || 0;
  const cellsToUpdate: Array<{ x: number; y: number; territory: number }> = [];
  
  // Première passe : identifier quelles colonnes et lignes ont des blocs du joueur
  const hasPlayerBlockInCol = new Array(cols).fill(false);
  const hasPlayerBlockInRow = new Array(rows).fill(false);
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (board[x][y].owner === player) {
        hasPlayerBlockInCol[x] = true;
        hasPlayerBlockInRow[y] = true;
      }
    }
  }
  
  // Deuxième passe : marquer les cellules capturables
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const cell = board[x][y];
      
      // Une cellule est capturable si :
      // 1. territory === 0 ET zone === 0
      // 2. Il y a un bloc du joueur dans SA colonne ET SA ligne
      if (cell.territory === 0 && cell.zone === 0) {
        if (hasPlayerBlockInCol[x] && hasPlayerBlockInRow[y]) {
          cellsToUpdate.push({ x, y, territory: player });
        }
      }
    }
  }
  
  return cellsToUpdate;
};

/**
 * Calcule quelles cellules doivent être capturées après qu'un joueur place un bloc.
 * Retourne un array de positions avec leur nouveau territoire.
 * 
 * Logique :
 * 1. La cellule où le bloc est placé prend automatiquement territory = player
 * 2. Toutes les cellules de la même ligne ET de la même colonne sont vérifiées
 * 3. Une cellule est capturée si :
 *    - territory === 0 ET zone === 0
 *    - Il existe un bloc avec owner === player dans sa colonne (même x)
 *    - Il existe un bloc avec owner === player dans sa ligne (même y)
 */
export const calculateTerritoryCapture = (
  board: Cell[][],
  player: number,
  placedX: number,
  placedY: number
): Array<{ x: number; y: number; territory: number }> => {
  const cellsToUpdate: Array<{ x: number; y: number; territory: number }> = [];
  const cols = board.length;
  const rows = board[0]?.length || 0;
  
  // TODO  utile ?
  // 1. La cellule où le bloc est placé prend automatiquement le territoire
  const placedCell = board[placedX][placedY];
  if (placedCell && placedCell.territory === 0 && placedCell.zone === 0) {
    cellsToUpdate.push({ x: placedX, y: placedY, territory: player });
  }
  
  // 2. Vérifier toutes les cellules de la même ligne (col)
  for (let col = 0; col < cols; col++) {
    if (col === placedX) continue; // Sauter la cellule déjà traitée
    
    const cell = board[col][placedY];
    
    // Vérifier si cette cellule peut être capturée
    if (cell.territory === 0 && cell.zone === 0) {
      // Vérifier s'il existe un bloc dans SA colonne (même x) avec owner === player
      let hasPlayerBlockInColumn = false;
      for (let row = 0; row < rows; row++) {
        if (board[col][row].owner === player) {
          hasPlayerBlockInColumn = true;
          break;
        }
      }
      
      // Vérifier s'il existe un bloc dans SA ligne (même y) avec owner === player
      let hasPlayerBlockInRow = false;
      for (let c = 0; c < cols; c++) {
        if (board[c][placedY].owner === player) {
          hasPlayerBlockInRow = true;
          break;
        }
      }
      
      // Si les deux conditions sont remplies, capturer le territoire
      if (hasPlayerBlockInColumn && hasPlayerBlockInRow) {
        cellsToUpdate.push({ x: col, y: placedY, territory: player });
      }
    }
  }
  
  // 3. Vérifier toutes les cellules de la même colonne (row)
  for (let row = 0; row < rows; row++) {
    if (row === placedY) continue; // Sauter la cellule déjà traitée
    
    const cell = board[placedX][row];
    
    // Vérifier si cette cellule peut être capturée
    if (cell.territory === 0 && cell.zone === 0) {
      // Vérifier s'il existe un bloc dans SA colonne (même x) avec owner === player
      let hasPlayerBlockInColumn = false;
      for (let r = 0; r < rows; r++) {
        if (board[placedX][r].owner === player) {
          hasPlayerBlockInColumn = true;
          break;
        }
      }
      
      // Vérifier s'il existe un bloc dans SA ligne (même y) avec owner === player
      let hasPlayerBlockInRow = false;
      for (let c = 0; c < cols; c++) {
        if (board[c][row].owner === player) {
          hasPlayerBlockInRow = true;
          break;
        }
      }
      
      // Si les deux conditions sont remplies, capturer le territoire
      if (hasPlayerBlockInColumn && hasPlayerBlockInRow) {
        cellsToUpdate.push({ x: placedX, y: row, territory: player });
      }
    }
  }
  return cellsToUpdate;
};

