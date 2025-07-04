import React from 'react';
import './SelectInput.css';

interface SelectInputProps {
  value: string; // Valor actual seleccionado
  onChange: (value: string) => void; // Callback que recibe el nuevo valor
  options: string[]; // Lista de opciones a mostrar
  placeholder?: string; // Texto opcional para la primera opción vacía
}

const SelectInput: React.FC<SelectInputProps> = ({ value, onChange, options, placeholder }) => {
  return (
    <div className="select-wrapper">
      <select
        className="admin-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder || 'Selecciona una opción'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
