// src/components/atoms/Button.tsx
import React from 'react'
import './Button.css'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const Button = ({ children, onClick, className = '', type = 'button', disabled }: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    className={`button ${className}`}
    disabled={disabled}
  >
    {children}
  </button>
)

export default Button
