import React, { ChangeEvent } from 'react';
import './RadioButton.css';

type RadioButtonProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const RadioButton = ({ label, name, value, checked, onChange }: RadioButtonProps) => {
  return (
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
