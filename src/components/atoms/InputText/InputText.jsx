import React from 'react'
import './InputText.css'

const InputText = ({ value, onChange, placeholder, isInvalid }) => {
  return (
    <input
      className={`input-text ${isInvalid ? 'invalid' : ''}`}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}

export default InputText
