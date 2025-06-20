import React from 'react'
import './Button.css'

const Button = ({ label, onClick, disabled }) => {
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
