import React, { useEffect, useState } from 'react';
import './ModalUserSettings.css';
import Button from '../../atoms/Button/Button';
import RadioButton from '../../atoms/RadioButton/RadioButton';
import SelectInput from '../../atoms/SelectInput/SelectInput';
import Input from '../../atoms/InputText/InputText';
import type { Role } from '../../../store/userSlice';
import { getCurrentSessionPlayer } from '../../../utils/session';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core'; //librería para drag and drop
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Player {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
}

//Props del componente
interface ModalUserSettingsProps {
  currentRole: Role;                  // Tu rol actual
  onClose: () => void;                // Cierra el modal
  onRoleChange: (newRole: Role) => void; // Callback tras cambiar rol
}

//Estado interno y detección de admin
const ModalUserSettings: React.FC<ModalUserSettingsProps> = ({
  currentRole, onClose, onRoleChange,
}) => {
  const [cardError, setCardError] = useState('');
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [cards, setCards] = useState<(string | number)[]>([]);
  const [newCard, setNewCard] = useState('');

  const isAdmin = currentRole.startsWith('admin');

  //Cargar jugadores y escuchar cambios
  useEffect(() => {
    //Leer nombre de usuario actual de sessionStorage
    const { name } = getCurrentSessionPlayer();
    setCurrentName(name);

    const roomName = (localStorage.getItem('salaActual') || 'default').toLowerCase();
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      const parsedPlayers: Player[] = JSON.parse(raw);
      setPlayers(parsedPlayers);
    }
    //Volver a cargar al dispararse 'playersUpdated'
    const updatePlayers = () => {
      const raw = localStorage.getItem(`room:${roomName}:players`);
      if (raw) {
        setPlayers(JSON.parse(raw));
      }
    };

    window.addEventListener('playersUpdated', updatePlayers);
    return () => window.removeEventListener('playersUpdated', updatePlayers);
  }, []);

  //Cargar cartas al montar
  useEffect(() => {
    const room = (localStorage.getItem('salaActual') || 'default').toLowerCase();
    const raw = localStorage.getItem(`room:${room}:cards`);
    // Si no existe mazo, usar valores por defecto
    setCards(raw ? JSON.parse(raw) : [0, 1, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕']);
  }, []);

  //Guardar cambios (rol, admin y mazo)
  const handleSave = () => {
    const roomName = (localStorage.getItem('salaActual') || 'default').toLowerCase();
    if (!roomName) return;

    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (!raw) return;

    const parsedPlayers: Player[] = JSON.parse(raw);

    // Actualizar roles en el array
    const updatedPlayers = parsedPlayers.map((player) => {
      if (player.name === currentName) {
        // El user decide si mantiene admin o cambia a player/spectator
        const baseRole = selectedRole.includes('spectator') ? 'spectator' : 'player';

        // Solo si era admin antes y no transfirió admin, puede conservar admin
        const shouldKeepAdmin = currentRole.startsWith('admin') && !selectedAdmin;
        const newRole = shouldKeepAdmin ? `admin-${baseRole}` : baseRole;

        return { ...player, role: newRole };
      }

      // Si se elige transferir admin a otro jugador, se le da.
      if (selectedAdmin && player.name === selectedAdmin) {
        const isSpectator = player.role.includes('spectator');
        return { ...player, role: isSpectator ? 'admin-spectator' : 'admin-player' };
      }
      // En cualquier otro caso, el jugador no cambia
      return player;
    });

    // Guardar la lista de jugadores actualizada en localStorage
    localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updatedPlayers));

    //Encontrar datos del user actual en el array actualizado para sincronizar su sesión
    const self = updatedPlayers.find((p) => p.name === currentName);
    if (self) {
      sessionStorage.setItem('playerRole', self.role);
      sessionStorage.setItem('esAdmin', self.role.startsWith('admin') ? 'true' : 'false');
      // Llama al callback para notificar al padre que el rol cambió
      onRoleChange(self.role as Role);
    }

    // Guardar también el mazo de cartas (posibles valores) actualizado
    localStorage.setItem(`room:${roomName}:cards`, JSON.stringify(cards));

    // Disparar eventos para que otras pestañas/componentes se sincronicen
    window.dispatchEvent(new Event('playersUpdated'));
    window.dispatchEvent(new Event('cardsUpdated'));

    // Cerrar el modal de ajustes
    onClose();
  };

  // Elimina la tarjeta en la posición dada
  const removeCard = (index: number) => {
    const updated = [...cards];
    updated.splice(index, 1);
    setCards(updated);
  };

  // Añade una nueva tarjeta al final del mazo, tras validaciones
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

    // Si pasa todas las validaciones, se añade
    setCards([...cards, value]);
    setNewCard('');
    setCardError(''); // Limpiar errores
  };

  //Configuración de sensores para arrastrar y ordenar con dnd-kit
  const sensors = useSensors(useSensor(PointerSensor));

  // Al terminar un drag, reordenar el array `cards`
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((card) => card.toString() === active.id);
      const newIndex = cards.findIndex((card) => card.toString() === over.id);
      setCards((cards) => arrayMove(cards, oldIndex, newIndex));
    }
  };

  // Componente interno para cada tarjeta en modo “sortable”
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

    // Evitar que el clic en la “X” dispare el drag
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      removeCard(index);
    };
    // Parte de SortableCard: render de cada tarjeta “draggable” con botón de eliminar
    return (
      <div
        data-testid={`card-${id}`}      // para tests: etiqueta única por tarjeta
        ref={setNodeRef}                // referencia de dnd-kit para gestionar el dragging
        style={style}                   // estilos dinámicos (transform, transition)
        {...attributes}                 // atributos necesarios para dnd-kit
        {...listeners}                  // listeners de eventos de arrastre
        className="editable-card"       // clase CSS del contenedor de la tarjeta
      >
        {id}                            
        <span
          className="delete-btn"
          onClick={handleRemove}
          onPointerDown={(e) => {
            e.stopPropagation();        // evita que el gesto de tocar inicie un drag
            e.preventDefault();
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
        {/* Si eres admin, añade la clase "admin" para estilos especiales */}
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

        {isAdmin && (
          <>
            <hr />
            <h3 className="section-title">Tarjetas del juego</h3>
            <div className="cards-editor">
            {/* Contenedor DnD para arrastrar y reordenar cartas */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={cards.map((card) => card.toString())} strategy={verticalListSortingStrategy}>
                  <div className="card-list">
                    {/* Render de cada SortableCard */}
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
              {/* Mensaje de error al añadir tarjeta */}
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
