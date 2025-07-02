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
import type { Player } from '../../hooks/usePlayers';
import { getCurrentSessionPlayer } from '../../utils/session';
import InviteModal from '../organisms/InviteModal/InviteModal';


const SalaPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
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
  const finalRoomName = (roomName || 'default').toLowerCase();
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
      sessionStorage.clear();
    }
  }, [isInvited]);

  useEffect(() => {
    if (roomName) {
      const currentRoom = localStorage.getItem('salaActual');

      if (!currentRoom || currentRoom !== roomName) {
        localStorage.setItem('salaActual', roomName);

        const playersKey = `room:${roomName}:players`;
        const existingPlayers = localStorage.getItem(playersKey);

        if (!existingPlayers) {
          localStorage.setItem(playersKey, JSON.stringify([]));
        }

        localStorage.setItem('esAdmin', 'true');
      } else {
        localStorage.setItem('esAdmin', 'false');
      }
    }
  }, [roomName]);




  useEffect(() => {
    const { name, role, id } = getCurrentSessionPlayer();

    if (!name || !role || !id || !playerExists(name)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [players, finalRoomName]);

  useEffect(() => {
    const { name, role, id } = getCurrentSessionPlayer();
    if (name && role) {
      const revealed = localStorage.getItem('revealed') === 'true';
      addPlayer({ name, role: role as Role, selectedCard, isNew: revealed });
    }
  }, [name, role, selectedCard]);

  const handleModalSubmit = (name: string, role: 'player' | 'spectator') => {
    const storedPlayers = localStorage.getItem(`room:${finalRoomName}:players`);
    const playersList = storedPlayers ? JSON.parse(storedPlayers) : [];
    const isFirstPlayer = playersList.length === 0;
    const assignedRole: Role = isFirstPlayer
      ? role === 'player'
        ? 'admin-player'
        : 'admin-spectator'
      : role;

    sessionStorage.setItem('playerName', name);
    sessionStorage.setItem('playerRole', assignedRole);
    sessionStorage.setItem('playerId', crypto.randomUUID());

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
    setShowInviteModal(true);
  };

  const handleRoleChange = (newRole: Role) => {
  const current = getCurrentSessionPlayer();
  const sessionName = sessionStorage.getItem('playerName');

  if (!current.name || current.name !== sessionName) return; // 👈 Evita cambios si no es el usuario actual

  sessionStorage.setItem('playerRole', newRole);
  dispatch(setUser({ name: current.name, role: newRole }));

  const roomName = (localStorage.getItem('salaActual') || 'default').toLowerCase();
  const raw = localStorage.getItem(`room:${roomName}:players`);
  if (raw) {
    const players = JSON.parse(raw);
    const updated = players.map((p: any) =>
      p.name === current.name ? { ...p, role: newRole } : p
    );
    localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updated));
    window.dispatchEvent(new Event('playersUpdated'));
  }
};



  const { name: currentName } = getCurrentSessionPlayer();
  const currentPlayer = players.find((p) => p.name === currentName);
  const otherPlayers = players.filter((p) => p.name !== currentName);

  useEffect(() => {
    const interval = setInterval(() => {
      const raw = localStorage.getItem(`room:${finalRoomName}:players`);
      const { name } = getCurrentSessionPlayer();
      if (raw && name) {
        try {
          const parsed = JSON.parse(raw);
          const me = parsed.find((p: Player) => p.name === name);
          if (me && me.role !== role) {
            sessionStorage.setItem('playerRole', me.role);
            dispatch(setUser({ name, role: me.role }));
          }
        } catch (e) {
          console.error('error in role sync', e);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [dispatch, finalRoomName]);


  useEffect(() => {
  const interval = setInterval(() => {
    const raw = localStorage.getItem(`room:${finalRoomName}:players`);
    const { name } = getCurrentSessionPlayer();
    if (raw && name) {
      const players = JSON.parse(raw);
      const me = players.find((p: Player) => p.name === name);
      if (me && me.selectedCard !== selectedCard) {
        dispatch(selectCard(me.selectedCard));
      }
    }
  }, 500); // Revisa cada medio segundo

  return () => clearInterval(interval);
}, [dispatch, finalRoomName, selectedCard]);


  const [cards, setCards] = useState<(string | number)[]>([]);

  useEffect(() => {
    const room = localStorage.getItem("salaActual") || "default";
    const raw = localStorage.getItem(`room:${room}:cards`);
    setCards(raw ? JSON.parse(raw) : [0, 1, 3, 5, 8, 13, 21, 34, 55, 89, "?", "☕"]);
  }, []);

  useEffect(() => {
    const handleCardsUpdated = () => {
      const room = localStorage.getItem("salaActual") || "default";
      const raw = localStorage.getItem(`room:${room}:cards`);
      setCards(raw ? JSON.parse(raw) : []);
    };

    window.addEventListener("cardsUpdated", handleCardsUpdated);
    return () => window.removeEventListener("cardsUpdated", handleCardsUpdated);
  }, []);

useEffect(() => {
  const syncSelectedCard = () => {
    const raw = localStorage.getItem(`room:${finalRoomName}:players`);
    const { name } = getCurrentSessionPlayer();
    if (raw && name) {
      const players = JSON.parse(raw);
      const me = players.find((p: Player) => p.name === name);
      if (me) {
        dispatch(selectCard(me.selectedCard)); // ✅ SOLO actualizar carta
      }
    }
  };

  window.addEventListener('playersUpdated', syncSelectedCard);
  return () => window.removeEventListener('playersUpdated', syncSelectedCard);
}, [dispatch, finalRoomName]);




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

        {showInviteModal && (
          <InviteModal
            roomLink={`${window.location.origin}/sala/${finalRoomName}?invited=true`}
            onClose={() => setShowInviteModal(false)}
          />
        )}


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
                  {cards.map((carta, i) => (
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
