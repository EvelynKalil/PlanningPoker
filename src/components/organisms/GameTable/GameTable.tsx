import React from 'react'
import './GameTable.css'

interface Player {
  name: string
  selectedCard: number | string | null
}

interface GameTableProps {
  currentPlayer: Player
  otherPlayers: Player[]
  isAdmin: boolean
  onReveal?: () => void
}

const GameTable: React.FC<GameTableProps> = ({ currentPlayer, otherPlayers, isAdmin, onReveal }) => {
  const maxSpots = 8
  const playerSlots = Array(maxSpots).fill(null)

  // Siempre colocar al currentPlayer en la posición 4 (abajo, centro)
  playerSlots[4] = currentPlayer

  // Asignar los demás jugadores a las demás posiciones (excepto 4)
  let j = 0
  for (let i = 0; i < maxSpots; i++) {
    if (i === 4) continue
    playerSlots[i] = otherPlayers[j] || null
    j++
  }

  return (
    <div className="game-table-wrapper">
      <div className="game-table">
        <div className="table-inner" />

        {playerSlots.map((player, index) => (
          <div key={index} className={`player-slot slot-${index}`}>
            {player && (
              <>
                <div className={`carta-volteada ${player.selectedCard !== null ? 'carta--votada' : ''}`} />
                <p>{player.name}</p>
              </>
            )}
          </div>
        ))}

        {isAdmin && (
          <button className="btn-reveal" onClick={onReveal}>
            Revelar cartas
          </button>
        )}
      </div>
    </div>
  )
}

export default GameTable
