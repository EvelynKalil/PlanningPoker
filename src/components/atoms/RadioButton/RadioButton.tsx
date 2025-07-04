import React, { ChangeEvent } from 'react';
import './RadioButton.css';

// Props que acepta este componente
type RadioButtonProps = {
  label: string                         // Texto que se muestra junto al círculo
  name: string                          // Agrupación de radios: todos con el mismo name se comportan como un grupo
  value: string                         // Valor que envía este radio al hacer submit o al cambiar
  checked: boolean                      // Si está seleccionado o no
  onChange: (e: ChangeEvent<HTMLInputElement>) => void // Handler que se dispara al cambiar de estado
}
const RadioButton = ({ label, name, value, checked, onChange }: RadioButtonProps) => {
  return (
    // Etiqueta que envuelve el input para poder hacer clic también en el texto
    <label className="radio-button">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="custom-radio" />
      {label}
    </label>
  );
};

export default RadioButton;
