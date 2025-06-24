import { useEffect, useState, useRef } from 'react'

export interface Player {
  name: string
  role: string
  selectedCard: number | string | null
}

export const usePlayers = (roomName: string) => {
  const [players, setPlayers] = useState<Player[]>([])
  const lastHash = useRef<string>('')

  useEffect(() => {
    const interval = setInterval(() => {
      const raw = localStorage.getItem(`room:${roomName}:players`)
      if (raw && raw !== lastHash.current) {
        try {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setPlayers(parsed)
            lastHash.current = raw
          }
        } catch (err) {
          console.error('Error parsing localStorage players:', err)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [roomName])

  const addPlayer = (player: Player) => {
    const stored = localStorage.getItem(`room:${roomName}:players`)
    const currentPlayers: Player[] = stored ? JSON.parse(stored) : []

    const updated = currentPlayers.filter(p => p.name !== player.name)
    updated.push(player)

    const updatedString = JSON.stringify(updated)
    localStorage.setItem(`room:${roomName}:players`, updatedString)
    lastHash.current = updatedString
    setPlayers(updated)
  }

  const playerExists = (name: string) => {
    return players.some(p => p.name === name)
  }

  return { players, addPlayer, playerExists }
}
