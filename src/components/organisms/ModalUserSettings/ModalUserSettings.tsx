import React, { useState } from 'react';
import RadioButton from '../../atoms/RadioButton/RadioButton';
import Button from '../../atoms/Button/Button';
import './ModalUserSettings.css';

type Props = {
  currentRole: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
  onClose: () => void;
  onRoleChange: (newRole: 'player' | 'spectator' | 'admin-player' | 'admin-spectator') => void;
};

const ModalUserSettings = ({ currentRole, onClose, onRoleChange }: Props) => {
  const isAdmin = currentRole.includes('admin');
  const baseRole = currentRole.includes('spectator') ? 'spectator' : 'player';
  const [selected, setSelected] = useState<'player' | 'spectator'>(baseRole);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.value as 'player' | 'spectator');
  };

  const handleSubmit = () => {
    const newRole = isAdmin ? (`admin-${selected}` as const) : selected;
    onRoleChange(newRole);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-player">
        <h2 className="modal-title">Modo de juego</h2>

        <div className="role-group">
          <RadioButton
            name="switch-role"
            value="player"
            label="Jugador"
            checked={selected === 'player'}
            onChange={handleChange}
          />
          <RadioButton
            name="switch-role"
            value="spectator"
            label="Espectador"
            checked={selected === 'spectator'}
            onChange={handleChange}
          />
        </div>

        <div className="button-wrapper">
          <Button onClick={handleSubmit}>Cambiar modo</Button>
         <Button onClick={onClose} className="btn-cancelar">
  Cancelar
</Button>

        </div>
      </div>
    </div>
  );
};

export default ModalUserSettings;
