import React from 'react'
import './Header.css'
import logo from '../../../assets/logo.png'

type HeaderProps = {
  showTitle?: boolean
}

const Header = ({ showTitle = true }: HeaderProps) => {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="logo" />
      {showTitle && <h1 className="title">Crear partida</h1>}
    </header>
  )
}

export default Header
