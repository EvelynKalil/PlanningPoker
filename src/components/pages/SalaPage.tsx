import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './SalaPage.css'
import ModalPlayer from '../organisms/ModalPlayer/ModalPlayer'
import { useDispatch, useSelector } from 'react-redux'
import { selectCard, setUser } from '../../store/userSlice'
import { RootState } from '../../store'
import { usePlayers } from '../../hooks/usePlayers'
import { useLocation } from 'react-router-dom';

const SalaPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isInvited = queryParams.get('invited') === 'true';
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)

  const user = useSelector((state: RootState) => state.user)
  const { name, role, selectedCard } = user

  const { roomName } = useParams<{ roomName: string }>()
  const finalRoomName = roomName || 'default'

  const { players, addPlayer, playerExists } = usePlayers(finalRoomName)

  useEffect(() => {
    if (isInvited) {
      localStorage.removeItem('playerName');
      localStorage.removeItem('playerRole');
      localStorage.removeItem('playerId');
      localStorage.removeItem('esAdmin');
    }
  }, [isInvited]);


  // ✅ Identificar si esta es la PRIMERA VEZ en la sala (para definir si es admin)
  useEffect(() => {
    const previousRoom = localStorage.getItem('salaActual')

    if (previousRoom !== finalRoomName) {
      localStorage.removeItem('playerName')
      localStorage.removeItem('playerRole')
      localStorage.removeItem('playerId')
      localStorage.removeItem('esAdmin')
      localStorage.setItem('salaActual', finalRoomName)

      const storedPlayers = localStorage.getItem(`room:${finalRoomName}:players`)
      const playersList = storedPlayers ? JSON.parse(storedPlayers) : []
      if (playersList.length === 0) {
        localStorage.setItem('esAdmin', 'true')
      } else {
        localStorage.setItem('esAdmin', 'false')
      }
    }
  }, [finalRoomName])

  // ✅ Mostrar el modal si el jugador aún no está registrado o no existe en la lista
  useEffect(() => {
    const storedName = localStorage.getItem('playerName')
    const storedRole = localStorage.getItem('playerRole')
    const playerId = localStorage.getItem('playerId')

    if (!storedName || !storedRole || !playerId || !playerExists(storedName)) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [players, finalRoomName])

  // ✅ Agregar jugador al hook cuando está logueado
  useEffect(() => {
    const playerId = localStorage.getItem('playerId') || crypto.randomUUID()
    if (name && role) {
      localStorage.setItem('playerId', playerId)
      addPlayer({ name, role, selectedCard })
    }
  }, [name, role, selectedCard])

  // ✅ Envío del modal
  const handleModalSubmit = (name: string, role: 'player' | 'spectator') => {
    const esAdmin = localStorage.getItem('esAdmin') === 'true'
    const assignedRole = esAdmin ? 'admin-player' : role

    localStorage.setItem('playerName', name)
    localStorage.setItem('playerRole', assignedRole)
    localStorage.setItem('playerId', crypto.randomUUID())

    dispatch(setUser({ name, role: assignedRole }))
    setShowModal(false)
  }

  // ✅ Elección de carta
  const handleSelectCard = (card: number | string) => {
    if (role === 'player' || role === 'admin-player') {
      dispatch(selectCard(card))
    }
  }

  // ✅ Copiar link de invitación
  const handleInvite = () => {
    const url = `${window.location.origin}/sala/${finalRoomName}?invited=true`;
    navigator.clipboard.writeText(url)
      .then(() => alert('¡Link copiado al portapapeles!'))
      .catch(() => alert('Error al copiar el link'));
  };


  const currentPlayer = players.find((p) => p.name === name)
  const otherPlayers = players.filter((p) => p.name !== name)

  return (
    <>
      {showModal && <ModalPlayer onSubmit={handleModalSubmit} />}

      <main className="sala-page">
        <div className="topbar">
          <div className="avatar">{name?.slice(0, 2).toUpperCase()}</div>
          {(role === 'admin-player' || role === 'admin-spectator') && (
            <button className="invite-button" onClick={handleInvite}>
              Invitar jugadores
            </button>
          )}
        </div>

        <div className="jugadores-superiores">
          {otherPlayers.slice(0, 4).map((p) => (
            <div key={p.name} className="jugador">
              <div
                className={`carta-volteada ${p.selectedCard !== null ? 'carta--votada' : ''}`}
              />
              <p>{p.name}</p>
            </div>
          ))}
        </div>

        <div className="mesa-ovalada" />

        <div className="jugador-actual">
          <div
            className={`carta-volteada ${selectedCard !== null ? 'carta--votada' : ''}`}
          />
          <p>{name}</p>
        </div>

        <div className="footer">
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
        </div>
      </main>
    </>
  )
}

export default SalaPage
