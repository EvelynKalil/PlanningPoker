import React, { useState, ChangeEvent, FormEvent } from 'react';
import InputText from '../../atoms/InputText/InputText';
import RadioButton from '../../atoms/RadioButton/RadioButton';
import Button from '../../atoms/Button/Button';
import './ModalPlayer.css';

type ModalPlayerProps = {
  onSubmit: (name: string, role: 'player' | 'spectator') => void;
};

const ModalPlayer = ({ onSubmit }: ModalPlayerProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'player' | 'spectator' | ''>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const validate = (text: string): string[] => {
    const errs: string[] = [];
    if (text.length < 5 || text.length > 20) {
      errs.push('Debe tener entre 5 y 20 caracteres');
    }
    if (/^\d+$/.test(text)) {
      errs.push('No puede contener solo números');
    }
    if (/[_.\*#\/-]/.test(text)) {
      errs.push('No se permiten caracteres especiales (_,.*#/-)');
    }
    const digits = (text.match(/\d/g) || []).length;
    if (digits > 3) {
      errs.push('Máximo 3 números permitidos');
    }
    return errs;
  };

  const recomputeValidity = (text: string, selectedRole: string) => {
    const valErrors = validate(text);
    setErrors(valErrors);
    const isFormValid = valErrors.length === 0 && (selectedRole === 'player' || selectedRole === 'spectator');
    setIsValid(isFormValid);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    recomputeValidity(newName, role);
  };

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedRole = e.target.value as 'player' | 'spectator';
    setRole(selectedRole);
    recomputeValidity(name, selectedRole);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isValid && (role === 'player' || role === 'spectator')) {
      localStorage.setItem('playerName', name);
      localStorage.setItem('playerRole', role);
      onSubmit(name, role);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-player" onSubmit={handleSubmit}>
        <h2 className="modal-title">Tu nombre</h2>

        <InputText
          value={name}
          onChange={handleNameChange}
          placeholder="Ingresa tu nombre"
          isInvalid={errors.length > 0}
        />
        {errors.length > 0 && (
          <ul className="error-list">
            {errors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        )}

        <div className="role-group">
          <RadioButton
            name="role"
            value="player"
            label="Jugador"
            checked={role === 'player'}
            onChange={handleRoleChange}
          />
          <RadioButton
            name="role"
            value="spectator"
            label="Espectador"
            checked={role === 'spectator'}
            onChange={handleRoleChange}
          />
        </div>

        <div className="button-wrapper">
          <Button
            label="Continuar"
            type="submit"
            onClick={() => {}}
            disabled={!isValid}
          />
        </div>
      </form>
    </div>
  );
};

export default ModalPlayer;
