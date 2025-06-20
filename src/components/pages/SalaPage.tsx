import React, { useEffect, useState } from 'react'
import Header from '../organisms/Header/Header'
import './SalaPage.css'
import ModalPlayer from '../organisms/ModalPlayer/ModalPlayer'

const SalaPage = () => {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('playerName')
    const role = localStorage.getItem('playerRole')
    if (!name || !role) {
      setShowModal(true)
    }
  }, [])

  const handleModalSubmit = (name: string, role: 'player' | 'spectator') => {
    localStorage.setItem('playerName', name)
    localStorage.setItem('playerRole', role)
    setShowModal(false)
  }

  const playerName = localStorage.getItem('playerName') || ''

  return (
    <>
      {showModal && <ModalPlayer onSubmit={handleModalSubmit} />}

      <main className="sala-page">
        <div className="mesa-ovalada" />
        <div className="footer">
          <p>{playerName ? `${playerName}, elige una carta 👇` : 'Elige una carta 👇'}</p>
          <div className="cartas">
            {[0, 1, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'].map((carta, i) => (
              <div className="carta" key={i}>{carta}</div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export default SalaPage
