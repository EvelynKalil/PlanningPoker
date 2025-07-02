import React, { useEffect, useState } from 'react';
import './ModalUserSettings.css';
import Button from '../../atoms/Button/Button';
import SelectInput from '../../atoms/SelectInput/SelectInput';
import type { Role } from '../../../store/userSlice';
import { getCurrentSessionPlayer } from '../../../utils/session';

interface Player {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
}

interface ModalUserSettingsProps {
  currentRole: Role;
  onClose: () => void;
  onRoleChange: (newRole: Role) => void;
}

const ModalUserSettings: React.FC<ModalUserSettingsProps> = ({
  currentRole,
  onClose,
  onRoleChange,
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');

  const isAdmin = currentRole.startsWith('admin');

  useEffect(() => {
    const { name } = getCurrentSessionPlayer();
    setCurrentName(name);

    const roomName = localStorage.getItem('salaActual') || 'default';
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      const parsedPlayers: Player[] = JSON.parse(raw);
      setPlayers(parsedPlayers);
    }

    const updatePlayers = () => {
      const raw = localStorage.getItem(`room:${roomName}:players`);
      if (raw) {
        setPlayers(JSON.parse(raw));
      }
    };

    window.addEventListener('playersUpdated', updatePlayers);
    return () => window.removeEventListener('playersUpdated', updatePlayers);
  }, []);

  const handleSave = () => {
    console.log("roomName actual:", localStorage.getItem("salaActual"));
    console.log("jugadores actuales:", JSON.parse(localStorage.getItem(`room:${localStorage.getItem("salaActual")}:players`) || '[]'));

    const roomName = localStorage.getItem('salaActual');
    if (!roomName) return;

    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (!raw) return;

    const parsedPlayers: Player[] = JSON.parse(raw);

    const updatedPlayers = parsedPlayers.map((player) => {
      if (player.name === currentName) {
        const baseRole = selectedRole.includes('spectator') ? 'spectator' : 'player';
        const shouldKeepAdmin = !selectedAdmin;
        const newRole = shouldKeepAdmin ? `admin-${baseRole}` : baseRole;
        return { ...player, role: newRole };
      }

      if (selectedAdmin && player.name === selectedAdmin) {
        const isSpectator = player.role.includes('spectator');
        return { ...player, role: isSpectator ? 'admin-spectator' : 'admin-player' };
      }

      return player;
    });

    // 💾 Guardar cambios
    localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updatedPlayers));

    const self = updatedPlayers.find(p => p.name === currentName);
    if (self) {
      sessionStorage.setItem('playerRole', self.role);
      sessionStorage.setItem('esAdmin', self.role.startsWith('admin') ? 'true' : 'false');
      onRoleChange(self.role as Role);
    }

    window.dispatchEvent(new Event('playersUpdated'));

    saveCards();
    onClose();
  };

  // Estado adicional
  const [cards, setCards] = useState<(string | number)[]>([]);
  const [newCard, setNewCard] = useState("");

  // Cargar las tarjetas
  useEffect(() => {
    const room = localStorage.getItem("salaActual") || "default";
    const raw = localStorage.getItem(`room:${room}:cards`);
    setCards(raw ? JSON.parse(raw) : [0, 1, 3, 5, 8, 13, 21, 34, 55, 89, "?", "☕"]);
  }, []);

  // 🗑 Eliminar
const removeCard = (index: number) => {
  const updated = [...cards];
  updated.splice(index, 1);
  setCards(updated);
};

// ➕ Añadir
const addCard = () => {
  const trimmed = newCard.trim();
  if (!trimmed) return;
  if (trimmed.length > 15) return;
  if (cards.includes(isNaN(+trimmed) ? trimmed : +trimmed)) return;

  const formatted = isNaN(+trimmed) ? trimmed : +trimmed;
  setCards([...cards, formatted]);
  setNewCard("");
};

// 💾 Guardar tarjetas
const saveCards = () => {
  const room = localStorage.getItem("salaActual") || "default";
  localStorage.setItem(`room:${room}:cards`, JSON.stringify(cards));
  window.dispatchEvent(new Event("cardsUpdated"));
};


  return (
    <div className="modal-backdrop">
      <div className={`modal-user-settings ${isAdmin ? 'admin' : ''}`}>
        <h3 className="section-title">Modo de juego</h3>
        <div className="role-group">
          <label>
            <input
              type="radio"
              name="role"
              value="player"
              checked={selectedRole === 'player' || selectedRole === 'admin-player'}
              onChange={() =>
                setSelectedRole(currentRole.startsWith('admin') ? 'admin-player' : 'player')
              }
            />
            Jugador
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="spectator"
              checked={selectedRole === 'spectator' || selectedRole === 'admin-spectator'}
              onChange={() =>
                setSelectedRole(currentRole.startsWith('admin') ? 'admin-spectator' : 'spectator')
              }
            />
            Espectador
          </label>
        </div>

        {isAdmin && (
          <>
            <hr />
            <h3 className="section-title">Transferir administrador</h3>
            <SelectInput
              value={selectedAdmin}
              onChange={setSelectedAdmin}
              options={players
                .filter((p) => p.name !== currentName && !p.role.startsWith('admin'))
                .map((p) => p.name)}
              placeholder="Selecciona un jugador"
            />
          </>
        )}

        <hr />
<h3 className="section-title">Tarjetas del juego</h3>
<div className="cards-editor">
  <div className="card-list">
    {cards.map((card, index) => (
      <div
        key={index}
        className="editable-card"
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
      >
        {card}
        <span className="delete-btn" onClick={() => removeCard(index)}>✖</span>
      </div>
    ))}
  </div>

  <div className="card-input">
    <input
      value={newCard}
      onChange={(e) => setNewCard(e.target.value)}
      placeholder="Nueva tarjeta"
      maxLength={15}
    />
    <button onClick={addCard}>Añadir</button>
  </div>
</div>


        <div className="button-wrapper">
          <Button className="btn-primary" type="button" onClick={handleSave}>
            Guardar
          </Button>
          <Button className="btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalUserSettings;
