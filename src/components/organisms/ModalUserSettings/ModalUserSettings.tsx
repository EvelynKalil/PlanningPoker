import React, { useState, useEffect } from 'react';
import './ModalUserSettings.css';
import Button from '../../atoms/Button/Button';
import SelectInput from '../../atoms/SelectInput/SelectInput';


interface Player {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
}

interface ModalUserSettingsProps {
  currentRole: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
  onClose: () => void;
  onRoleChange: (newRole: 'player' | 'spectator' | 'admin-player' | 'admin-spectator') => void;
}

const ModalUserSettings: React.FC<ModalUserSettingsProps> = ({ currentRole, onClose, onRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');

  const isAdmin = currentRole.startsWith('admin');

  useEffect(() => {
    const storedName = localStorage.getItem('playerName') || '';
    setCurrentName(storedName);

    const roomName = localStorage.getItem('salaActual') || 'default';
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      const parsedPlayers: Player[] = JSON.parse(raw);
      setPlayers(parsedPlayers);
    }
  }, []);

  const handleSave = () => {
    onRoleChange(selectedRole);

    if (isAdmin && selectedAdmin) {
      const roomName = localStorage.getItem('salaActual') || 'default';
      const raw = localStorage.getItem(`room:${roomName}:players`);
      if (raw) {
        const parsedPlayers: Player[] = JSON.parse(raw);
        const updatedPlayers = parsedPlayers.map((player) => {
          if (player.name === currentName) {
            return {
              ...player,
              role: player.role.replace('admin-', ''),
            };
          } else if (player.name === selectedAdmin) {
            return {
              ...player,
              role: `admin-${player.role}`,
            };
          }
          return player;
        });
        localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updatedPlayers));
        localStorage.setItem('playerRole', selectedRole);
        localStorage.setItem('esAdmin', 'false');
        window.dispatchEvent(new Event('playersUpdated'));
      }
    }

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
              options={players.filter((p) => p.name !== currentName).map((p) => p.name)}
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
