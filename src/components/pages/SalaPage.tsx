import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './SalaPage.css';
import ModalPlayer from '../organisms/ModalPlayer/ModalPlayer';
import ModalUserSettings from '../organisms/ModalUserSettings/ModalUserSettings';
import GameTable from '../organisms/GameTable/GameTable';
import VotingResults from '../organisms/VotingResults/VotingResults';
import { useDispatch, useSelector } from 'react-redux';
import { selectCard, setUser } from '../../store/userSlice';
import { RootState } from '../../store';
import { usePlayers } from '../../hooks/usePlayers';
import logo from '../../assets/Logo.png';
import type { Role } from '../../store/userSlice';

const SalaPage = () => {
  const [revealed, setRevealed] = useState(localStorage.getItem('revealed') === 'true');
  const [showModal, setShowModal] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isInvited = queryParams.get('invited') === 'true';

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { name, role, selectedCard } = user;

  const { roomName } = useParams<{ roomName: string }>();
  const finalRoomName = roomName || 'default';
  const { players, addPlayer, playerExists } = usePlayers(finalRoomName);

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

  useEffect(() => {
    if (isInvited) {
      localStorage.removeItem('playerName');
      localStorage.removeItem('playerRole');
      localStorage.removeItem('playerId');
      localStorage.removeItem('esAdmin');
    }
  }, [isInvited]);

  useEffect(() => {
    const previousRoom = localStorage.getItem('salaActual');
    if (previousRoom !== finalRoomName) {
      localStorage.removeItem('playerName');
      localStorage.removeItem('playerRole');
      localStorage.removeItem('playerId');
      localStorage.removeItem('esAdmin');
      localStorage.setItem('salaActual', finalRoomName);

      const storedPlayers = localStorage.getItem(`room:${finalRoomName}:players`);
      const playersList = storedPlayers ? JSON.parse(storedPlayers) : [];
      localStorage.setItem('esAdmin', playersList.length === 0 ? 'true' : 'false');
    }
  }, [finalRoomName]);

  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    const storedRole = localStorage.getItem('playerRole');
    const playerId = localStorage.getItem('playerId');

    if (!storedName || !storedRole || !playerId || !playerExists(storedName)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [players, finalRoomName]);

  useEffect(() => {
    const playerId = localStorage.getItem('playerId') || crypto.randomUUID();
    if (name && role) {
      localStorage.setItem('playerId', playerId);
      const revealed = localStorage.getItem('revealed') === 'true';
      addPlayer({ name, role, selectedCard, isNew: revealed });
    }
  }, [name, role, selectedCard]);

  const handleModalSubmit = (name: string, role: 'player' | 'spectator') => {
    const esAdmin = localStorage.getItem('esAdmin') === 'true';
    const assignedRole: Role = esAdmin ? (role === 'player' ? 'admin-player' : 'admin-spectator') : role;

    localStorage.setItem('playerName', name);
    localStorage.setItem('playerRole', assignedRole);
    localStorage.setItem('playerId', crypto.randomUUID());

    dispatch(setUser({ name, role: assignedRole }));
    setShowModal(false);
  };

  const handleSelectCard = (card: number | string) => {
    const revealed = localStorage.getItem('revealed') === 'true';
    if (revealed) return;
    if (role === 'player' || role === 'admin-player') {
      dispatch(selectCard(card));
    }
  };

  const handleInvite = () => {
    const url = `${window.location.origin}/sala/${finalRoomName}?invited=true`;
    navigator.clipboard.writeText(url)
      .then(() => alert('¡Link copiado al portapapeles!'))
      .catch(() => alert('Error al copiar el link'));
  };

  const handleRoleChange = (newRole: Role) => {
    localStorage.setItem('playerRole', newRole);
    if (!name) return;
dispatch(setUser({ name, role: newRole }));


    const roomName = localStorage.getItem('salaActual') || 'default';
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      const players = JSON.parse(raw);
      const updated = players.map((p: any) =>
        p.name === name ? { ...p, role: newRole } : p
      );
      localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updated));
      window.dispatchEvent(new Event('playersUpdated'));
    }
  };

  const currentPlayer = players.find((p) => p.name === name);
  const otherPlayers = players.filter((p) => p.name !== name);

  return (
    <>
      {showModal && <ModalPlayer onSubmit={handleModalSubmit} />}
      {showUserSettings && role && (
  <ModalUserSettings
    currentRole={role as Role}
    onClose={() => setShowUserSettings(false)}
    onRoleChange={handleRoleChange}
  />
)}


      <main className="sala-page">
        <div className="topbar">
          <div className="topbar-left">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="topbar-center">
            <h2 className="room-name">{finalRoomName}</h2>
          </div>
          <div className="topbar-right">
            <div className="avatar" onClick={() => setShowUserSettings(true)}>
              {name?.slice(0, 2).toUpperCase()}
            </div>
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
