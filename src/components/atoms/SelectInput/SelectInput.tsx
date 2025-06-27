import React from 'react';
import './SelectInput.css';

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
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
