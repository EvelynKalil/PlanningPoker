import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import FormCreateGame from '../molecules/FormCreateGame/FormCreateGame'
import SalaPage from './SalaPage'
import Header from '../organisms/Header/Header'
import './App.css'

const App = () => {
  const location = useLocation()
  const showTitle = location.pathname === '/'

  return (
    <>
      <Header showTitle={showTitle} />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<FormCreateGame />} />
          <Route path="/sala" element={<SalaPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
