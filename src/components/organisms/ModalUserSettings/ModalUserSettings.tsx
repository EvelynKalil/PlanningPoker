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
    onClose();
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
