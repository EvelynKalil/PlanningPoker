import React from 'react'
import './InputText.css'

type InputTextProps = {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  isInvalid?: boolean
}

const InputText = ({ value, onChange, placeholder, isInvalid = false }: InputTextProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input-text ${isInvalid ? 'invalid' : ''}`}
    />
  )
}

export default InputText
