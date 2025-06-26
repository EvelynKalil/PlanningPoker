import { useEffect, useState, useRef } from 'react'

export interface Player {
  id: string; // 👉 identificador único por pestaña
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
  selectedCard: number | string | null;
  isNew?: boolean;
}



export const usePlayers = (roomName: string) => {
  const [players, setPlayers] = useState<Player[]>([])
  const lastHash = useRef<string>('')

 useEffect(() => {
  const sync = () => {
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw && raw !== lastHash.current) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPlayers(parsed);
          lastHash.current = raw;
        }
      } catch (err) {
        console.error('Error parsing players:', err);
      }
    }
  };

  const interval = setInterval(sync, 1000);
  window.addEventListener('playersUpdated', sync);

  return () => {
    clearInterval(interval);
    window.removeEventListener('playersUpdated', sync);
  };
}, [roomName]);


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
