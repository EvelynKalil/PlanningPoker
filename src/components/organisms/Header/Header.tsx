import React from 'react'
import './Header.css'
import logo from '../../../assets/Logo.png' // o logo.png si es PNG

const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="title">Crear partida</h1>
    </header>
  )
}

export default Header
