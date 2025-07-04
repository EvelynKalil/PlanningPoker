import React from 'react';
import './InputText.css';

// props estándar de un <input> HTML
type InputTextProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isInvalid?: boolean;
};

const InputText: React.FC<InputTextProps> = ({ isInvalid = false, className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`input-text ${isInvalid ? 'invalid' : ''} ${className}`}
    />
  );
};

export default InputText;
