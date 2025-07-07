import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './SalaPage.css';
import logo from '../../assets/Logo.png';
import ModalPlayer from '../organisms/ModalPlayer/ModalPlayer';
import ModalUserSettings from '../organisms/ModalUserSettings/ModalUserSettings';
import GameTable from '../organisms/GameTable/GameTable';
import VotingResults from '../organisms/VotingResults/VotingResults';
import InviteModal from '../organisms/InviteModal/InviteModal';
// Redux: para despachar acciones y leer el estado global (usuario)
import { useDispatch, useSelector } from 'react-redux';
import { selectCard, setUser } from '../../store/userSlice';
import { RootState } from '../../store';
// Hook personalizado para manejar la lista de jugadores
import { usePlayers } from '../../hooks/usePlayers';
// Tipos y utilidades: Role, Player, sesión actual
import type { Role } from '../../store/userSlice';
import type { Player } from '../../hooks/usePlayers';
import { getCurrentSessionPlayer } from '../../utils/session';

const SalaPage = () => {
  // Estados locales que controlan modales y estado de revelado
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [revealed, setRevealed] = useState(localStorage.getItem('revealed') === 'true');
  const [showModal, setShowModal] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  // Obtiene la ruta actual y parámetros (como el nombre de la sala)
  const location = useLocation();
  const { roomName } = useParams<{ roomName: string }>();
  const finalRoomName = (roomName || 'default').toLowerCase();

  // Redux: dispatch para enviar acciones y selector para leer el usuario
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { name, role, selectedCard } = user;

  //Hook customizado que gestiona jugadores en localStorage/sessionStorage
  const { players, addPlayer, playerExists } = usePlayers(finalRoomName);

  //Leer la query string de la URL para saber si el user es invitado o no
  const queryParams = new URLSearchParams(location.search);
  const isInvited = queryParams.get('invited') === 'true';

  // Sincroniza el estado "revealed" (cartas reveladas) entre pestañas y cuando  se dispara el evento personalizado "playersUpdated".
  useEffect(() => {
     // Función que lee localStorage y actualiza el estado local "revealed"
    const syncReveal = () => {
      const isRevealed = localStorage.getItem('revealed') === 'true';
      setRevealed(isRevealed);
    };
    syncReveal();
    // Si otro tab cambia "revealed" o lanza "playersUpdated", volvemos a sincronizar
    window.addEventListener('storage', syncReveal);
    window.addEventListener('playersUpdated', syncReveal);
    return () => {
      window.removeEventListener('storage', syncReveal);
      window.removeEventListener('playersUpdated', syncReveal);
    };
  }, []);

  //si el user viene con la querystring "?invited=true", significa que es invitado y Limpiamos sessionStorage para se vuelva a registrar (modal de usuario).
  useEffect(() => {
    if (isInvited) {
      sessionStorage.clear();
    }
  }, [isInvited]);

  
  //  Inicialización de la sala en localStorage cuando cambia de "roomName":
  useEffect(() => {
    if (roomName) {
      const currentRoom = localStorage.getItem('salaActual')?.toLowerCase();

      if (!currentRoom || currentRoom !== finalRoomName) {  //Si sala guardada = null o != de la que acabo de entrar, entonces estoy por primera vez en esa sala
        localStorage.setItem('salaActual', finalRoomName);
        // Preparo la clave donde se guardará la lista de jugadores
        const playersKey = `room:${finalRoomName}:players`;
        const existingPlayers = localStorage.getItem(playersKey);
        // Si no había ya un array de jugadores, creo uno vacío
        if (!existingPlayers) {
          localStorage.setItem(playersKey, JSON.stringify([]));
        }
        // Marco esta pestaña como “admin” de la sala
        localStorage.setItem('esAdmin', 'true');
      } else {
        //no es admin, porque es invitado. 
        localStorage.setItem('esAdmin', 'false');
      }
    }
  }, [roomName]);

  //Mostrar el modal de registro 
  useEffect(() => {
    const { name, role, id } = getCurrentSessionPlayer();
  // Si no hay datos de sesión o ese nombre no está en la lista, abrimos el modal para que el usuario se registre.
    if (!name || !role || !id || !playerExists(name)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [players, finalRoomName]);

  // Añadir/actualizar jugador en localStorage cada vez que cambia nombre, rol o carta elegida
  useEffect(() => {
    const { name, role, id } = getCurrentSessionPlayer();
    if (name && role) {
      // Recupera si las cartas están reveladas para marcar “isNew”
      const revealed = localStorage.getItem('revealed') === 'true';
      // Añade o actualiza ese jugador en la lista de la sala
      addPlayer({ name, role: role as Role, selectedCard, isNew: revealed });
    }
  }, [name, role, selectedCard]);

  //Se activa cuando el usuario completa el modal de registro y cierra el modal
  const handleModalSubmit = (name: string, role: 'player' | 'spectator') => {
    // Recupera la lista actual de jugadores de esta sala
    const storedPlayers = localStorage.getItem(`room:${finalRoomName}:players`);
    const playersList = storedPlayers ? JSON.parse(storedPlayers) : [];
    // Determina si es el primer jugador en entrar (lista vacía)
    const isFirstPlayer = playersList.length === 0;
    // Si es el primero, se le asigna el rol de admin-player o admin-spectator
    const assignedRole: Role = isFirstPlayer
      ? role === 'player'
        ? 'admin-player'
        : 'admin-spectator'
      : role;
    // Guardas en sessionStorage los datos de sesión:
    sessionStorage.setItem('playerName', name);
    sessionStorage.setItem('playerRole', assignedRole);
    sessionStorage.setItem('playerId', crypto.randomUUID());

    // Actualiza el estado global de Redux con setUser, así el resto de componentes sabe que user es y su rol
    dispatch(setUser({ name, role: assignedRole }));
    //Cierra el modal
    setShowModal(false);
  };

  //Controla lo que ocurre despues de hacer clic en una carta
  const handleSelectCard = (card: number | string) => {
    //Comprueba si ya están reveladas las votaciones, si es así no deja seleccionar
    const revealed = localStorage.getItem('revealed') === 'true';
    if (revealed) return;
    //Verifica que el usuario tenga permiso para votar
    if (role === 'player' || role === 'admin-player') {
      dispatch(selectCard(card));
    }
  };

  //Se ejecuta cuando el usuario pulsa el botón de “Invitar jugadores” y muestra el modal
  const handleInvite = () => {
    setShowInviteModal(true);
  };

  //actualizar el rol del jugador en el almacenamiento de la sesión, en el estado global de Redux y en la lista compartida de jugadores en localStorage.
  const handleRoleChange = (newRole: Role) => {
  //Obtiene nombre, rol y id
  const current = getCurrentSessionPlayer();
  const sessionName = sessionStorage.getItem('playerName');

  if (!current.name || current.name !== sessionName) return; // Evita cambios si no es el usuario actual
  //Actualizar el rol en la sesión y en Redux
  sessionStorage.setItem('playerRole', newRole);
  dispatch(setUser({ name: current.name, role: newRole }));
  //Actualizar la lista global de jugadores en localStorage
  const roomName = (localStorage.getItem('salaActual') || 'default').toLowerCase();
  const raw = localStorage.getItem(`room:${roomName}:players`);
  if (raw) {
    const players = JSON.parse(raw);
    const updated = players.map((p: any) =>
      p.name === current.name ? { ...p, role: newRole } : p
    );
    localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updated));
    // dispara el evento playersUpdated: que todas las pestañas o componentes que escuchen ese evento recarguen su lista de jugadores y muestren el cambio de rol en tiempo real.
    window.dispatchEvent(new Event('playersUpdated'));
  }
};

  const { name: currentName } = getCurrentSessionPlayer();
  const currentPlayer = players.find((p) => p.name === currentName);
  const otherPlayers = players.filter((p) => p.name !== currentName);

  //Sincronizar cambios de rol desde localStorage (cada 0.5 s)
  useEffect(() => {
    const interval = setInterval(() => {
      // Lee la lista completa desde localStorage
      const raw = localStorage.getItem(`room:${finalRoomName}:players`);
      const { name } = getCurrentSessionPlayer();
      if (raw && name) {
        try {
          const parsed = JSON.parse(raw);
          const me = parsed.find((p: Player) => p.name === name);
          // Si el rol en storage ya no coincide con el de Redux
          if (me && me.role !== role) {
            // Actualiza sessionStorage y Redux con el rol nuevo
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

  //Sincronizar la carta elegida desde localStorage (cada 0.5 s)
  useEffect(() => {
  const interval = setInterval(() => {
    const raw = localStorage.getItem(`room:${finalRoomName}:players`);
    const { name } = getCurrentSessionPlayer();
    if (raw && name) {
      const players = JSON.parse(raw);
      const me = players.find((p: Player) => p.name === name);
      // Si mi carta en storage cambió (quizá otro tab la actualizó)
      if (me && me.selectedCard !== selectedCard) {
        // Actualiza Redux con la carta nueva
        dispatch(selectCard(me.selectedCard));
      }
    }
  }, 500); 

  return () => clearInterval(interval);
}, [dispatch, finalRoomName, selectedCard]);

// Escuchar cambios de mazo con storage + evento personalizado
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key?.includes('room:') && e.key?.includes(':cards')) {
      // Si alguien actualizó el mazo, disparamos un evento interno
      window.dispatchEvent(new Event('cardsUpdated'));
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);

  // Estado local donde guardamos el array de cartas
  const [cards, setCards] = useState<(string | number)[]>([]);

  // al montar, cargamos el mazo de la sala o usamos el por defecto
  useEffect(() => {
    const room = (localStorage.getItem("salaActual") || "default").toLowerCase();
    const raw = localStorage.getItem(`room:${room}:cards`);
    setCards(raw ? JSON.parse(raw) : [0, 1, 3, 5, 8, 13, 21, 34, 55, 89, "?", "☕"]);
  }, []);

  // Cuando alguien emite “cardsUpdated”, recargamos el mazo actual
  useEffect(() => {
    const handleCardsUpdated = () => {
      const room = (localStorage.getItem("salaActual") || "default").toLowerCase();
      const raw = localStorage.getItem(`room:${room}:cards`);
      setCards(raw ? JSON.parse(raw) : []);
    };

    window.addEventListener("cardsUpdated", handleCardsUpdated);
    return () => window.removeEventListener("cardsUpdated", handleCardsUpdated);
  }, []);

//Re-sincronizar la selección tras evento playersUpdated
useEffect(() => {
  const syncSelectedCard = () => {
    const raw = localStorage.getItem(`room:${finalRoomName}:players`);
    const { name } = getCurrentSessionPlayer();
    if (raw && name) {
      const players = JSON.parse(raw);
      const me = players.find((p: Player) => p.name === name);
      if (me) {
        dispatch(selectCard(me.selectedCard)); // sincroniza
      }
    }
  };

  window.addEventListener('playersUpdated', syncSelectedCard);
  return () => window.removeEventListener('playersUpdated', syncSelectedCard);
}, [dispatch, finalRoomName]);



//Reasignar admin al cerrar pestaña/browser
useEffect(() => {
  const handleBeforeUnload = () => {
    const room = finalRoomName || 'default'; // usa finalRoomName directo
    const raw = localStorage.getItem(`room:${room}:players`);
    const currentName = sessionStorage.getItem('playerName');

    if (!raw || !currentName) return;

    const players = JSON.parse(raw);
    const current = players.find((p: any) => p.name === currentName);

    const isAdmin = current?.role?.startsWith('admin');
    const remainingPlayers = players.filter((p: any) => p.name !== currentName);

    // Si era admin y hay otros, decimos “pásale el mando” al azar
    if (isAdmin && remainingPlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
      const newAdmin = remainingPlayers[randomIndex];
      const newRole =
        newAdmin.role === 'spectator' ? 'admin-spectator' : 'admin-player';
      newAdmin.role = newRole;
    }
    // Guardamos la lista sin quien se va y disparamos playersUpdated
    localStorage.setItem(`room:${room}:players`, JSON.stringify(remainingPlayers));
    window.dispatchEvent(new Event('playersUpdated'));
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [finalRoomName]); // DEPENDENCIA correcta

//Reiniciar selecciones cuando se ocultan las cartas
useEffect(() => {
  if (!revealed) {
    const room = finalRoomName || 'default';
    const raw = localStorage.getItem(`room:${room}:players`);
    if (raw) {
      const players = JSON.parse(raw);
      const updatedPlayers = players.map((p: Player) => ({
        ...p,
        selectedCard: null,
      }));
      localStorage.setItem(`room:${room}:players`, JSON.stringify(updatedPlayers));
      window.dispatchEvent(new Event('playersUpdated'));
    }
  }
}, [revealed, finalRoomName]);


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
