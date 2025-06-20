import React from 'react'
import './Button.css'

type ButtonProps = {
  label: string
  onClick?: () => void 
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

const Button = ({ label, onClick, disabled = false, type = "button" }: ButtonProps) => {
  return (
    <button
      className="button"
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {label}
    </button>
  )
}

export default Button
