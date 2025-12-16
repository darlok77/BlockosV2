# Plan de Tests - BlockOS

## 🎯 Priorité 1 : Fonctions Utilitaires Pures (Tests Unitaires)

### `src/utils/gameRules.ts` - **CRITIQUE**
Ces fonctions contiennent la logique métier principale du jeu :

#### Fonctions à tester en priorité :
1. **`calculateBlocksToPlace(diceUsed: number[])`**
   - ✅ Test avec différentes valeurs de dés (1-6)
   - ✅ Test avec plusieurs dés
   - ✅ Test avec valeurs invalides

2. **`getBlocksForDiceValue(value: number)`** (privée mais testable)
   - ✅ Test chaque valeur 1-6
   - ✅ Test valeur invalide

3. **`canPlaceBlockOnCell(cell, blockType, currentPlayer, board?, x?, y?)`**
   - ✅ Test pour chaque type de bloc (attack, defense, destroy)
   - ✅ Test avec différentes configurations de cellules
   - ✅ Test avec cellules de bases adverses
   - ✅ Test avec blocs détruits

4. **`getAlignedPositions(board, startPosition, blockType, currentPlayer, nbBlocksRemaining)`**
   - ✅ Test avec différentes directions
   - ✅ Test avec plusieurs blocs consécutifs
   - ✅ Test limites du plateau
   - ✅ Test avec blocs détruits (saut)

5. **`getNextPositionInDirection(board, currentPosition, direction, blockType, currentPlayer, nbBlocksRemaining)`**
   - ✅ Test dans chaque direction
   - ✅ Test avec blocs restants
   - ✅ Test limites du plateau

6. **`getPlayablePositions(board, currentPlayer, blockType?, nbBlocksRemaining?)`**
   - ✅ Test pour chaque type de bloc
   - ✅ Test avec séquences de plusieurs blocs
   - ✅ Test positions adjacentes
   - ✅ Test blocs détruits et chemins

7. **`calculateTerritoryCapture(board, player, placedX, placedY)`**
   - ✅ Test capture horizontale
   - ✅ Test capture verticale
   - ✅ Test capture multiple
   - ✅ Test limites du plateau

8. **`calculateAllTerritoryCapture(board, player)`**
   - ✅ Test capture optimisée
   - ✅ Test avec plusieurs blocs du joueur

### `src/utils/sequenceHelpers.ts` - **HAUTE PRIORITÉ**
Fonctions de gestion des séquences :

1. **`isSequenceCompleted(index, completedSequences)`** ❌ (trivial - juste `includes()`)
2. **`areAllSequencesCompleted(completedSequences, totalSequences)`** ❌ (trivial - juste `length === n`)
3. **`isSequenceDisabled(index, currentSequenceIndex, completedSequences, blocksPlacedInSequence)`**
   - ✅ Test séquence complétée (désactivée)
   - ✅ Test séquence en cours (activée)
   - ✅ Test changement de séquence impossible
4. **`getSequenceIcon(type)`** ❌ (trivial - switch/case avec constantes, TypeScript garantit l'exhaustivité)
5. **`getSequenceLabel(type)`** ❌ (trivial - switch/case avec constantes, TypeScript garantit l'exhaustivité)
6. **`getSequenceColor(type)`** ❌ (trivial - switch/case avec constantes, TypeScript garantit l'exhaustivité)
7. **`formatSequenceText(sequence)`**
   - ✅ Test singulier/pluriel


## 🎯 Priorité 2 : Helpers Redux (Tests Unitaires)

### `src/store/slices/gameSliceHelpers.ts` - **HAUTE PRIORITÉ**

1. **`markSequenceAsCompleted(state, sequenceIndex)`** ❌ (trivial - juste `includes` + `push` conditionnel)
2. **`getInitialSequenceState()`** ❌ (trivial - retourne un objet avec valeurs par défaut)
3. **`getRemainingBlocks(state)`**
   - ✅ Test calcul correct
   - ✅ Test séquence invalide
4. **`captureTerritories(board, currentPlayer)`**
   - ✅ Test capture simple
   - ✅ Test capture multiple
5. **`updateCellAttributes(cell, payload)`** ❌ (trivial - juste des if/assignations conditionnelles)
6. **`getBaseHpForPlayer(board, player)`**
   - ✅ Test calcul HP total
   - ✅ Test plusieurs bases
   - ✅ Test aucune base
7. **`getAlivePlayers(board, nbPlayers)`**
   - ✅ Test joueurs vivants
   - ✅ Test joueurs éliminés
8. **`updateBaseHpCache(state, x, y)`**
   - ✅ Test mise à jour cache
   - ✅ Test cellule non-base (pas de mise à jour)
9. **`initializeBaseHpCache(state)`**
   - ✅ Test initialisation correcte
10. **`recomputeEliminationsAndWinner(state)`**
    - ✅ Test élimination joueur
    - ✅ Test détermination gagnant
    - ✅ Test partie non terminée
11. **`calculatePlayablePositions(state)`**
    - ✅ Test début de séquence
    - ✅ Test séquence en cours avec direction
    - ✅ Test séquence avec position de départ

## 🎯 Priorité 3 : Redux Reducers (Tests d'Intégration)

### `src/store/slices/gameSlice.ts` - **HAUTE PRIORITÉ**

Tester tous les reducers :

1. **`setDiceResult`**
   - ✅ Test initialisation correcte
   - ✅ Test protection contre double initialisation

2. **`setDiceUsedValue`**
   - ✅ Test initialisation séquences
   - ✅ Test protection contre double initialisation

3. **`selectSequence`**
   - ✅ Test sélection séquence
   - ✅ Test réinitialisation compteurs

4. **`setSequenceStartPosition`**
   - ✅ Test enregistrement position

5. **`setSequenceDirection`**
   - ✅ Test enregistrement direction

6. **`incrementBlocksPlaced`**
   - ✅ Test incrémentation

7. **`completeSequence`**
   - ✅ Test complétion séquence
   - ✅ Test passage séquence suivante
   - ✅ Test capture territoires
   - ✅ Test fin des séquences

8. **`updateCell`**
   - ✅ Test mise à jour cellule
   - ✅ Test mise à jour cache HP
   - ✅ Test recomputation éliminations

9. **`playablePositions`**
   - ✅ Test recalcul positions

10. **`passTurn`**
    - ✅ Test changement joueur
    - ✅ Test réinitialisation état
    - ✅ Test saut joueurs éliminés
    - ✅ Test fin de partie

11. **`initBoard`**
    - ✅ Test initialisation board

## 🎯 Priorité 4 : Selectors (Tests Unitaires)

### `src/store/slices/gameSelectors.ts` - **MOYENNE PRIORITÉ** ✅

Tester les selectors avec logique (les selectors triviaux qui retournent directement une propriété du state n'ont pas besoin de tests) :

1. **`selectBoard`** ❌ (trivial - retourne `state.board`)
2. **`selectCurrentPlayer`** ❌ (trivial - retourne `state.currentPlayer`)
3. **`selectDiceResult`** ❌ (trivial - retourne `state.diceResult`)
4. **`selectDiceUsed`** ❌ (trivial - retourne `state.diceUsed`)
5. **`selectPlayablePositions`** ❌ (trivial - retourne `state.playablePositions`)
6. **`selectIsCellPlayable(x, y)`** ✅ (logique - utilise `.some()` pour vérifier)
7. **`selectPlayerCells(playerId)`** ✅ (logique - boucle et filtre le board)
8. **`selectSequencesToPlace`** ❌ (trivial - retourne `state.sequencesToPlace`)
9. **`selectCurrentSequence`** ✅ (logique - vérifie index et retourne null si invalide)
10. **`selectCanPlaceBlock`** ✅ (logique - comparaison conditionnelle)
11. **`selectCompletedSequences`** ❌ (trivial - retourne `state.completedSequences`)
12. **`selectPlayerBaseHp(playerId)`** ✅ (logique - accès avec valeur par défaut `|| 0`)
13. **`selectEliminatedPlayers`** ❌ (trivial - retourne `state.eliminatedPlayers`)
14. **`selectWinner`** ❌ (trivial - retourne `state.winner`)
15. **`selectIsGameOver`** ❌ (trivial - retourne `state.isGameOver`)

Selectors supplémentaires :
- **`selectCurrentSequenceIndex`** ❌ (trivial - retourne `state.currentSequenceIndex`)
- **`selectBlocksPlacedInSequence`** ❌ (trivial - retourne `state.blocksPlacedInSequence`)
- **`selectBlocksToPlace`** ✅ (logique - appelle `calculateBlocksToPlace`)
- **`selectHasUnplacedSequences`** ✅ (logique - comparaison d'index)
- **`selectSequenceStartPosition`** ❌ (trivial - retourne `state.sequenceStartPosition`)
- **`selectBaseHpCache`** ❌ (trivial - retourne `state.baseHpCache`)

## 🎯 Priorité 5 : Hooks (Tests d'Intégration avec React Testing Library)

### `src/hooks/useDice.ts` - **MOYENNE PRIORITÉ** ✅

1. **`rollDice()`**
   - ✅ Test génération valeurs dés (1-6)
   - ✅ Test dispatch action

2. **`handleChoose(useSum, diceResult)`**
   - ✅ Test choix somme
   - ✅ Test choix valeurs individuelles
   - ✅ Test calcul séquences
   - ✅ Test dispatch actions
   - ✅ Test pas d'action si diceResult est null

### `src/hooks/useCellActions.ts` - **HAUTE PRIORITÉ** ✅

1. **`handleCellClick(...)`**
   - ✅ Test validations (diceUsed, canPlaceBlock, currentSequence, isPlayable)
   - ✅ Test placement premier bloc
   - ✅ Test placement blocs suivants
   - ✅ Test calcul direction
   - ✅ Test complétion séquence
   - ✅ Test recalcul positions jouables
   - ✅ Test position de départ pour séquences multi-blocs

### `src/hooks/useGameLogic.ts` - **MOYENNE PRIORITÉ** ✅

1. **`useEffect` pour passage automatique de tour**
   - ✅ Test passage automatique quand toutes séquences complétées
   - ✅ Test pas de passage si séquences incomplètes
   - ✅ Test pas de passage si diceUsed est vide
   - ✅ Test avec plusieurs séquences

### `src/hooks/useSequences.ts` - **BASSE PRIORITÉ**

Fonctions de style/formatage (déjà testées via `sequenceHelpers.ts`) - ❌ Non testé (basse priorité)

## 📊 Résumé des Priorités

### 🔴 **CRITIQUE** (À tester en premier)
- `gameRules.ts` - ✅ Toutes les fonctions testées
- `gameSliceHelpers.ts` - ✅ Toutes les fonctions testées
- `gameSlice.ts` - ✅ Tous les reducers testés

### 🟠 **HAUTE PRIORITÉ**
- `sequenceHelpers.ts` - ✅ Fonctions avec logique testées
- `useCellActions.ts` - ✅ `handleCellClick` testé

### 🟡 **MOYENNE PRIORITÉ**
- `gameSelectors.ts` - ✅ Selectors avec logique testés
- `useDice.ts` - ✅ Fonctions de dés testées
- `useGameLogic.ts` - ✅ Logique automatique testée

### 🟢 **BASSE PRIORITÉ**
- `useSequences.ts` - Fonctions de style (déjà couvertes)

## 🛠️ Recommandations de Configuration de Tests

### Framework suggéré :
- **Vitest** (déjà configuré avec Vite) pour tests unitaires
- **React Testing Library** pour tests de hooks/composants
- **@reduxjs/toolkit** pour tester les reducers

### Structure de tests suggérée :
```
src/
  __tests__/
    utils/
      gameRules.test.ts
      sequenceHelpers.test.ts
    store/
      slices/
        gameSlice.test.ts
        gameSliceHelpers.test.ts
        gameSelectors.test.ts
    hooks/
      useDice.test.ts
      useCellActions.test.ts
      useGameLogic.test.ts
```


