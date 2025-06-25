import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import FormCreateGame from '../molecules/FormCreateGame/FormCreateGame'
import SalaPage from './SalaPage'
import './App.css'
import logo from '../../assets/Logo.png'

const App = () => {
  const location = useLocation()
  const isInSala = location.pathname.startsWith('/sala')

  return (
    <main className="app-container">
      {!isInSala && (
        <div className="topbar">
          <div className="topbar-left">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="topbar-center">
            <h2 className="title">Crear partida</h2>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<FormCreateGame />} />
        <Route path="/sala/:roomName" element={<SalaPage />} />
        <Route
          path="*"
          element={<p style={{ color: 'white', textAlign: 'center' }}>404 - Página no encontrada</p>}
        />
      </Routes>
    </main>
  )
}

export default App
