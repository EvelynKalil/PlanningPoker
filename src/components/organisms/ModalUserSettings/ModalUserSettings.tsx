import React, { useEffect, useState } from 'react';
import './ModalUserSettings.css';
import Button from '../../atoms/Button/Button';
import RadioButton from '../../atoms/RadioButton/RadioButton';
import SelectInput from '../../atoms/SelectInput/SelectInput';
import Input from '../../atoms/InputText/InputText';
import type { Role } from '../../../store/userSlice';
import { getCurrentSessionPlayer } from '../../../utils/session';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const [cardError, setCardError] = useState('');
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [cards, setCards] = useState<(string | number)[]>([]);
  const [newCard, setNewCard] = useState('');

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

  useEffect(() => {
    const room = localStorage.getItem('salaActual') || 'default';
    const raw = localStorage.getItem(`room:${room}:cards`);
    setCards(raw ? JSON.parse(raw) : [0, 1, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕']);
  }, []);

  const handleSave = () => {
  const roomName = localStorage.getItem('salaActual');
  if (!roomName) return;

  const raw = localStorage.getItem(`room:${roomName}:players`);
  if (!raw) return;

  const parsedPlayers: Player[] = JSON.parse(raw);

  const updatedPlayers = parsedPlayers.map((player) => {
    if (player.name === currentName) {
      // Si el jugador actual es el que está haciendo cambios
      const baseRole = selectedRole.includes('spectator') ? 'spectator' : 'player';
      const newRole = selectedAdmin && selectedAdmin !== currentName ? baseRole : `admin-${baseRole}`;
      return { ...player, role: newRole };
    }

    if (selectedAdmin && player.name === selectedAdmin) {
      // Si se ha seleccionado otro jugador como nuevo administrador
      const isSpectator = player.role.includes('spectator');
      return { ...player, role: isSpectator ? 'admin-spectator' : 'admin-player' };
    }

    return player;
  });

  localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updatedPlayers));

  const self = updatedPlayers.find((p) => p.name === currentName);
  if (self) {
    sessionStorage.setItem('playerRole', self.role);
    sessionStorage.setItem('esAdmin', self.role.startsWith('admin') ? 'true' : 'false');
    onRoleChange(self.role as Role);
  }

  localStorage.setItem(`room:${roomName}:cards`, JSON.stringify(cards));
  window.dispatchEvent(new Event('playersUpdated'));
  window.dispatchEvent(new Event('cardsUpdated'));
  onClose();
};


  const removeCard = (index: number) => {
    const updated = [...cards];
    updated.splice(index, 1);
    setCards(updated);
  };

const addCard = () => {
  const trimmed = newCard.trim();
  if (!trimmed) {
    setCardError('No puede estar vacío');
    return;
  }

  const numericValue = +trimmed;
  const isNumber = !isNaN(numericValue);
  const value = isNumber ? numericValue : trimmed;

  if (cards.includes(value)) {
    setCardError('Esa tarjeta ya existe');
    return;
  }

  if (isNumber && numericValue > 999) {
    setCardError('El número máximo es 999');
    return;
  }

  if (trimmed.length > 15) {
    setCardError('Máximo 15 caracteres');
    return;
  }

  setCards([...cards, value]);
  setNewCard('');
  setCardError(''); // ✅ Limpiar errores
};



  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((card) => card.toString() === active.id);
      const newIndex = cards.findIndex((card) => card.toString() === over.id);
      setCards((cards) => arrayMove(cards, oldIndex, newIndex));
    }
  };

  const SortableCard = ({ id, index }: { id: string | number; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: id.toString() });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation(); // 🔥 Detiene el arrastre
      removeCard(index);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="editable-card"
      >
        {id}
        <span
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            removeCard(index);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault(); // 🔥 ¡Esto es la clave!
          }}
        >
          ✖
        </span>

      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className={`modal-user-settings ${isAdmin ? 'admin' : ''}`}>
        <h3 className="section-title">Modo de juego</h3>
        <div className="role-group">
          <RadioButton
            label="Jugador"
            name="role"
            value="player"
            checked={selectedRole === 'player' || selectedRole === 'admin-player'}
            onChange={() =>
              setSelectedRole(currentRole.startsWith('admin') ? 'admin-player' : 'player')
            }
          />
          <RadioButton
            label="Espectador"
            name="role"
            value="spectator"
            checked={selectedRole === 'spectator' || selectedRole === 'admin-spectator'}
            onChange={() =>
              setSelectedRole(currentRole.startsWith('admin') ? 'admin-spectator' : 'spectator')
            }
          />
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

        {isAdmin && (
          <>
            <h3 className="section-title">Tarjetas del juego</h3>
            <div className="cards-editor">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={cards.map((card) => card.toString())} strategy={verticalListSortingStrategy}>
                  <div className="card-list">
                    {cards.map((card, index) => (
                      <SortableCard key={card.toString()} id={card} index={index} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="card-input">
                <Input
                  value={newCard}
                  onChange={(e) => setNewCard(e.target.value)}
                  placeholder="Nueva tarjeta"
                />
                <Button type="button" className="btn-add-card" disabled={!newCard.trim()} onClick={addCard}>
                  Añadir
                </Button>
              </div>
              <div className="card-error">{cardError}</div>
            </div>
          </>
        )}
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
