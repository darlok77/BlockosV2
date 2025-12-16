import { useSelector } from "react-redux";
import { selectCurrentPlayer, selectBaseHpCache, selectIsGameOver, selectWinner } from "../store/slices/gameSelectors";

export const BaseHP = () => {
  const currentPlayer = useSelector(selectCurrentPlayer);
  const baseHpCache = useSelector(selectBaseHpCache);
  const isGameOver = useSelector(selectIsGameOver);
  const winner = useSelector(selectWinner);

  // Couleur par joueur
  const getPlayerColor = (player: number) => {
    switch (player) {
      case 1: return '#4A90E2'; // Bleu
      case 2: return '#E24A4A'; // Rouge
      case 3: return '#E2D84A'; // Jaune
      case 4: return '#4AE24A'; // Vert
      default: return '#808080';
    }
  };

  const getPlayerName = (player: number) => `Joueur ${player}`;

  // Couleur des HP selon leur valeur
  const getHPColor = (hp: number): string => {
    if (hp === 0) return '#000000'; // Noir
    if (hp <= 3) return '#E24A4A'; // Rouge (1-3 HP)
    if (hp <= 6) return '#FF9500'; // Orange (4-6 HP)
    return '#4AE24A'; // Vert (7-10 HP)
  };

  const allPlayers = [1, 2, 3, 4]; // Tous les joueurs
  const currentPlayerColor = getPlayerColor(currentPlayer);

  return (
    <div style={{
      padding: '16px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '16px'
    }}>
      {isGameOver && winner ? (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: '#4AE24A',
          borderRadius: '8px',
          marginBottom: '16px',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
            🏆 VICTOIRE !
          </h2>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Le {getPlayerName(winner)} a gagné la partie !
          </p>
        </div>
      ) : null}
      
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        💓 HP des Bases
      </h3>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {allPlayers.map(player => {
          const hp = baseHpCache[player] || 0;
          const isCurrentPlayer = player === currentPlayer;
          const isEliminated = hp === 0;
          
          return (
            <div
              key={player}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                background: isCurrentPlayer ? `${currentPlayerColor}15` : '#f5f5f5',
                border: isCurrentPlayer ? `2px solid ${currentPlayerColor}` : '2px solid transparent',
                opacity: isEliminated ? 0.5 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getPlayerColor(player)
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: isCurrentPlayer ? 'bold' : 'normal',
                  color: isEliminated ? '#888' : '#333'
                }}>
                  {getPlayerName(player)}{isEliminated ? ' (ÉLIMINÉ)' : ''}:
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: 'auto'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: getHPColor(hp)
                }}>
                  {hp}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: 'normal'
                }}>
                  HP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

