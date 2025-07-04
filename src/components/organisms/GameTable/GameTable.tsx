import React, { useEffect, useState } from 'react';
import './GameTable.css';
import Button from '../../atoms/Button/Button';
import { useDispatch } from 'react-redux';
import { selectCard } from '../../../store/userSlice';
import SpinnerCounting from '../../atoms/SpinnerCounting/SpinnerCounting';

// Definición del tipo Player (el shape de cada jugador en la sala)
export interface Player {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
  selectedCard: number | string | null;
  isNew?: boolean;
}
// Props que recibe GameTable
export interface GameTableProps {
  currentPlayer: Player        // tus propios datos
  otherPlayers: Player[]       // el resto de jugadores
  isAdmin: boolean             // si tú eres admin
  onReveal?: () => void        // callback al revelar/limpiar votos
}

const GameTable: React.FC<GameTableProps> = ({
  currentPlayer,
  otherPlayers,
  isAdmin,
  onReveal,
}) => {
  // Estado local
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const dispatch = useDispatch();
  // Calcula un array de “plazas” (max 8) y centramos el asiento del user actual en la posición 4
  const maxSpots = 8;
  const playerSlots = Array(maxSpots).fill(null);
  playerSlots[4] = currentPlayer;
  let j = 0;
  for (let i = 0; i < maxSpots; i++) {
    if (i === 4) continue;
    playerSlots[i] = otherPlayers[j] || null;
    j++;
  }
 // ¿Todos los jugadores activos (role="player" o "admin-player") ya votaron?
  const allPlayers = [...otherPlayers, currentPlayer];
  const activePlayers = allPlayers.filter(
    (p) => p.role === 'player' || p.role === 'admin-player'
  );
  const allVoted = activePlayers.every((player) => player.selectedCard !== null);

  // Hook que sincroniza la bandera “revealed” con localStorage en todas las pestañas
  useEffect(() => {
    const syncReveal = () => {
      const isRevealed = localStorage.getItem('revealed') === 'true';
      setRevealed(isRevealed);
    };
    syncReveal();
    window.addEventListener('storage', syncReveal);
    return () => window.removeEventListener('storage', syncReveal);
  }, []);

  // Al pulsar “Revelar cartas” (solo admin y tras votación completa)
  const handleReveal = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('revealed', 'true');
      setRevealed(true);
      window.dispatchEvent(new Event('playersUpdated'));
      onReveal?.();
    }, 2000); // simulación de contar votos 
  };

  // Al pulsar “Nueva votación”: oculta cartas y resetea selecciones
  const handleNewVote = () => {
    setRevealed(false);
    localStorage.setItem('revealed', 'false');

    const roomName = (localStorage.getItem('salaActual') || 'default').toLowerCase();
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      const players = JSON.parse(raw);
      const updated = players.map((p: Player) => ({
        ...p,
        selectedCard: null,
        isNew: false,
      }));
      localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updated));
    }

    window.dispatchEvent(new Event('playersUpdated'));
    dispatch(selectCard(null)); // Limpia la carta seleccionada del jugador actual
    onReveal?.();
  };

  // Render: primero los asientos de jugador …
  return (
    <div className="game-table-wrapper">
      <div className="game-table">
        <div className="table-middle" />
        <div className="table-inner" />

        {playerSlots.map((player, index) => (
          <div key={index} className={`player-slot slot-${index}`}>
            {player && (
              <>
              {/* Solo si está revelado y no es espectador, mostramos el valor */}
                <div
                  className={`carta-volteada 
                    ${player.role.includes('spectator') ? 'carta--espectador' : ''}
                    ${!revealed && player.selectedCard !== null && !player.role.includes('spectator') ? 'carta--votada' : ''}`}
                >
                  {revealed && player.selectedCard !== null && !player.role.includes('spectator') && (
                    <span>{player.selectedCard}</span>
                  )}
                  {player.role.includes('spectator') && <span>👀</span>}
                </div>
                <p>
                  {player.name}
                  {player.role.includes('spectator') && ' (Espectador)'}
                </p>
              </>
            )}
          </div>
        ))}
        {/* … y, si es admin, el botón de revelar / nueva votación */}
        {isAdmin && (
          loading ? (
            <div className="btn-reveal loading-wrapper">
              <SpinnerCounting />
            </div>
          ) : (
            <Button
              onClick={revealed ? handleNewVote : handleReveal}
              disabled={revealed ? false : !allVoted}
              className="btn-reveal"
            >
              {revealed ? 'Nueva votación' : 'Revelar cartas'}
            </Button>
          )
        )}

      </div>
    </div>
  );
};

const Spinner = () => <div className="spinner" />;

export default GameTable;
