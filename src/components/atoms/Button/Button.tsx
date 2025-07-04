import React from 'react'
import './Button.css'

//Props del componente
type ButtonProps = {
  children: React.ReactNode // Texto o elementos que se muestran dentro del botón
  onClick?: () => void // Función opcional que se ejecuta al hacer clic
  className?: string // Clases CSS adicionales para personalizar estilos
  type?: 'button' | 'submit' | 'reset' // Tipo de botón
  disabled?: boolean // Si es true, deshabilita el botón
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
