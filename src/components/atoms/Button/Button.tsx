import React from 'react'
import './Button.css'

type ButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  return (
    <button
      className="button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export default Button
