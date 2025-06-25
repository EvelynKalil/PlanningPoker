import React, { useEffect, useState } from 'react'
import './GameTable.css'
import Button from '../../atoms/Button/Button'

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

const GameTable: React.FC<GameTableProps> = ({
  currentPlayer,
  otherPlayers,
  isAdmin,
  onReveal,
}) => {
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const maxSpots = 8
  const playerSlots = Array(maxSpots).fill(null)
  playerSlots[4] = currentPlayer
  let j = 0
  for (let i = 0; i < maxSpots; i++) {
    if (i === 4) continue
    playerSlots[i] = otherPlayers[j] || null
    j++
  }

  const allPlayers = [...otherPlayers, currentPlayer];
  const allVoted = allPlayers.every((player) => player.selectedCard !== null);


  useEffect(() => {
    const syncReveal = () => {
      const isRevealed = localStorage.getItem('revealed') === 'true'
      setRevealed(isRevealed)
    }
    syncReveal()
    window.addEventListener('storage', syncReveal)
    return () => window.removeEventListener('storage', syncReveal)
  }, [])

  const handleReveal = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setRevealed(true)
      localStorage.setItem('revealed', 'true')
      onReveal?.()
    }, 2000)
  }

  const handleNewVote = () => {
    setRevealed(false);
    localStorage.setItem('revealed', 'false');

    const roomName = localStorage.getItem('salaActual') || 'default';
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      const players = JSON.parse(raw);
      const updated = players.map((p: Player) => ({
        ...p,
        selectedCard: null,
      }));
      localStorage.setItem(`room:${roomName}:players`, JSON.stringify(updated));
    }

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('playersUpdated'));

    onReveal?.();
  };


  return (
    <div className="game-table-wrapper">
      <div className="game-table">
        <div className="table-middle" />
        <div className="table-inner" />

        {playerSlots.map((player, index) => (
          <div key={index} className={`player-slot slot-${index}`}>
            {player && (
              <>
                <div
                  className={`carta-volteada ${!revealed && player.selectedCard !== null ? 'carta--votada' : ''
                    }`}
                >
                  {revealed && player.selectedCard !== null && (
                    <span>{player.selectedCard}</span>
                  )}
                </div>

                <p>{player.name}</p>
              </>
            )}
          </div>
        ))}

        {isAdmin && (
          <Button
            onClick={revealed ? handleNewVote : handleReveal}
            disabled={revealed ? false : !allVoted || loading}
            className="btn-reveal"
          >
            {loading ? <Spinner /> : revealed ? 'Nueva votación' : 'Revelar cartas'}
          </Button>
        )}
      </div>
    </div>
  )
}

const Spinner = () => <div className="spinner" />

export default GameTable
