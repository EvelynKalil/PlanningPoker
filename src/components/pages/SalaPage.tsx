import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './SalaPage.css';
import ModalPlayer from '../organisms/ModalPlayer/ModalPlayer';
import GameTable from '../organisms/GameTable/GameTable';
import { useDispatch, useSelector } from 'react-redux';
import { selectCard, setUser } from '../../store/userSlice';
import { RootState } from '../../store';
import { usePlayers } from '../../hooks/usePlayers';
import logo from '../../assets/Logo.png';
import VotingResults from '../organisms/VotingResults/VotingResults';
import type { Role } from '../../store/userSlice';
import type { Player } from '../../hooks/usePlayers';

const SalaPage = () => {
  const [revealed, setRevealed] = useState(localStorage.getItem('revealed') === 'true');
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const queryParams = new URLSearchParams(location.search);
  const isInvited = queryParams.get('invited') === 'true';

  const user = useSelector((state: RootState) => state.user);
  const { name, role, selectedCard } = user;

  const { roomName } = useParams<{ roomName: string }>();
  const finalRoomName = roomName || 'default';

  const { players, addPlayer, playerExists } = usePlayers(finalRoomName);

  // 🔁 Sincroniza estado de "revelado" con el localStorage compartido
  useEffect(() => {
    const syncReveal = () => {
      const isRevealed = localStorage.getItem('revealed') === 'true';
      setRevealed(isRevealed);
    };

    syncReveal();
    window.addEventListener('storage', syncReveal);
    window.addEventListener('playersUpdated', syncReveal);

    return () => {
      window.removeEventListener('storage', syncReveal);
      window.removeEventListener('playersUpdated', syncReveal);
    };
  }, []);

  // 🧼 Si el usuario viene por link de invitación, limpiamos cualquier posible sesión previa
  useEffect(() => {
    if (isInvited) {
      localStorage.removeItem('playerName');
      localStorage.removeItem('playerRole');
      localStorage.removeItem('playerId');
      localStorage.removeItem('esAdmin');
      sessionStorage.removeItem('playerId');
    }
  }, [isInvited]);

  // 🧼 Al cambiar de sala, se limpia y se determina si será admin
  useEffect(() => {
    const previousRoom = localStorage.getItem('salaActual');
    if (previousRoom !== finalRoomName) {
      localStorage.removeItem('playerName');
      localStorage.removeItem('playerRole');
      localStorage.removeItem('playerId');
      localStorage.removeItem('esAdmin');
      sessionStorage.removeItem('playerId');
      localStorage.setItem('salaActual', finalRoomName);

      const storedPlayers = localStorage.getItem(`room:${finalRoomName}:players`);
      const playersList = storedPlayers ? JSON.parse(storedPlayers) : [];
      localStorage.setItem('esAdmin', playersList.length === 0 ? 'true' : 'false');
    }
  }, [finalRoomName]);

  // 🧩 Mostrar el modal solo si no hay una sesión válida en esta pestaña
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    const storedRole = localStorage.getItem('playerRole');
    const localPlayerId = localStorage.getItem('playerId');
    const sessionPlayerId = sessionStorage.getItem('playerId');

    const isValidSession = localPlayerId && sessionPlayerId && localPlayerId === sessionPlayerId;

    if (!storedName || !storedRole || !localPlayerId || !isValidSession) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [finalRoomName]);

  // 🔁 Restaurar el usuario en Redux solo si esta pestaña es la dueña de la sesión
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    const storedRole = localStorage.getItem('playerRole');
    const localPlayerId = localStorage.getItem('playerId');
    const sessionPlayerId = sessionStorage.getItem('playerId');

    const isValidSession = localPlayerId && sessionPlayerId && localPlayerId === sessionPlayerId;

    if (storedName && storedRole && isValidSession) {
      dispatch(setUser({ name: storedName, role: storedRole as Role }));
    }

    // 🔁 Si el admin se fue y quedan jugadores, reasignamos admin automáticamente
    const room = localStorage.getItem('salaActual');
    if (room) {
      const stored = localStorage.getItem(`room:${room}:players`);
      if (stored) {
        const players = JSON.parse(stored);
        const hasAdmin = players.some((p: Player) => p.role === 'admin-player');
        if (!hasAdmin && players.length > 0) {
          players[0].role = 'admin-player';
          localStorage.setItem(`room:${room}:players`, JSON.stringify(players));
          window.dispatchEvent(new Event('playersUpdated'));
        }
      }
    }
  }, [players]);

  // 👤 Agregar el jugador al array cuando esté listo
  useEffect(() => {
    const playerId = localStorage.getItem('playerId') || crypto.randomUUID();
    if (name && role) {
      localStorage.setItem('playerId', playerId);
      const revealed = localStorage.getItem('revealed') === 'true';
      addPlayer({ name, role, selectedCard, isNew: revealed, id: playerId });
      window.dispatchEvent(new Event('playersUpdated')); // 👈 forza sync
    }
  }, [name, role, selectedCard]);

  // 📤 Eliminar jugador al cerrar pestaña usando beforeunload + sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      const room = localStorage.getItem('salaActual');
      const name = localStorage.getItem('playerName');
      const localPlayerId = localStorage.getItem('playerId');
      const sessionPlayerId = sessionStorage.getItem('playerId');

      if (!room || !name || !localPlayerId || localPlayerId !== sessionPlayerId) return;

      const stored = localStorage.getItem(`room:${room}:players`);
      if (stored) {
        let players: Player[] = JSON.parse(stored).filter((p: Player) => p.name !== name);

        const wasAdmin = user.role === 'admin-player' || user.role === 'admin-spectator';
        if (wasAdmin && players.length > 0) {
          players[0].role = 'admin-player';
        }

        localStorage.setItem(`room:${room}:players`, JSON.stringify(players));
        window.dispatchEvent(new Event('playersUpdated'));
      }

      localStorage.removeItem('playerName');
      localStorage.removeItem('playerRole');
      localStorage.removeItem('playerId');
      localStorage.removeItem('esAdmin');
      sessionStorage.removeItem('playerId');

      // 📌 Forzar que el navegador mantenga el hilo abierto lo justo
      navigator.sendBeacon('/', '');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // 🎯 Modal de ingreso: crea identidad local única y define rol
  const handleModalSubmit = (name: string, role: 'player' | 'spectator') => {
    const esAdmin = localStorage.getItem('esAdmin') === 'true';
    const assignedRole: Role = esAdmin ? 'admin-player' : role;

    const playerId = crypto.randomUUID();
    sessionStorage.setItem('playerId', playerId);
    localStorage.setItem('playerId', playerId);
    localStorage.setItem('playerName', name);
    localStorage.setItem('playerRole', assignedRole);

    dispatch(setUser({ name, role: assignedRole }));
    setShowModal(false);
  };

  // 🃏 Selección de carta
  const handleSelectCard = (card: number | string) => {
    if (revealed) return;
    if (role === 'player' || role === 'admin-player') {
      dispatch(selectCard(card));
    }
  };

  // 🔗 Copiar link para invitar jugadores
  const handleInvite = () => {
    const url = `${window.location.origin}/sala/${finalRoomName}?invited=true`;
    navigator.clipboard.writeText(url)
      .then(() => alert('¡Link copiado al portapapeles!'))
      .catch(() => alert('Error al copiar el link'));
  };

  const currentPlayer = players.find((p) => p.name === name);
  const otherPlayers = players.filter((p) => p.name !== name);

  return (
    <>
      {showModal && <ModalPlayer onSubmit={handleModalSubmit} />}

      <main className="sala-page">
        <div className="topbar">
          <div className="topbar-left">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="topbar-center">
            <h2 className="room-name">{finalRoomName}</h2>
          </div>
          <div className="topbar-right">
            <div className="avatar">{name?.slice(0, 2).toUpperCase()}</div>
            <button className="invite-button" onClick={handleInvite}>
              Invitar jugadores
            </button>
          </div>
        </div>

        {currentPlayer && (
          <GameTable
            currentPlayer={currentPlayer}
            otherPlayers={otherPlayers}
            isAdmin={role === 'admin-player' || role === 'admin-spectator'}
            onReveal={() => console.log('Revelar cartas')}
          />
        )}

        <div className="footer">
          {revealed ? (
            <VotingResults players={players} />
          ) : (
            (role === 'player' || role === 'admin-player') && (
              <>
                <p>
                  {name
                    ? `${name}, ${selectedCard ? 'ya elegiste' : 'elige una carta 👇'}`
                    : 'Elige una carta 👇'}
                </p>
                <div className="cartas">
                  {[0, 1, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'].map((carta, i) => (
                    <div
                      className={`carta ${selectedCard === carta ? 'carta--seleccionada' : ''}`}
                      key={i}
                      onClick={() => handleSelectCard(carta)}
                    >
                      {carta}
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </main>
    </>
  );
};

export default SalaPage;
