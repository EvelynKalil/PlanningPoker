import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import FormCreateGame from '../molecules/FormCreateGame/FormCreateGame'
import SalaPage from './SalaPage'
import './App.css'
import logo from '../../assets/Logo.png'

const App = () => {
  // Captura la ubicación actual ("/sala/mi-sala" o "/").
  const location = useLocation()

  //   Comprueba si la URL empieza con "/sala".
  //    Esto sirve para saber si estamos dentro de una sala de juego.
  const isInSala = location.pathname.startsWith('/sala')

  return (
    <main className="app-container">

      {/*
        Si NO estamos dentro de una sala (isInSala === false),
        mostramos la “topbar” con el logo y el título “Crear partida”.
      */}
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
        {/* Ruta raíz: "/" → muestra el formulario de crear partida */}
        <Route path="/" element={<FormCreateGame />} />
        {/* Ruta de sala: "/sala/:roomName" → muestra la página de la sala */}
        <Route path="/sala/:roomName" element={<SalaPage />} />
        {/* Cualquier otra ruta → mensaje de “404 no encontrada” */}
        <Route
          path="*"
          element={<p style={{ color: 'white', textAlign: 'center' }}>404 - Página no encontrada</p>}
        />
      </Routes>
    </main>
  )
}

export default App
