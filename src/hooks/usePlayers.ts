import { useEffect, useState } from 'react';

export interface Player {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
  selectedCard: number | string | null;
  isNew?: boolean;
}

export const usePlayers = (roomName: string) => {
  const [players, setPlayers] = useState<Player[]>([]);

  const readPlayersFromStorage = () => {
    const raw = localStorage.getItem(`room:${roomName}:players`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPlayers(parsed);
        }
      } catch (err) {
        console.error('Error parsing localStorage players:', err);
      }
    }
  };

  useEffect(() => {
    readPlayersFromStorage(); // read initially

    const interval = setInterval(() => {
      readPlayersFromStorage();
    }, 500);

    const syncListener = () => readPlayersFromStorage();
    window.addEventListener('storage', syncListener);
    window.addEventListener('playersUpdated', syncListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncListener);
      window.removeEventListener('playersUpdated', syncListener);
    };
  }, [roomName]);

  const addPlayer = (player: Player) => {
    const stored = localStorage.getItem(`room:${roomName}:players`);
    const currentPlayers: Player[] = stored ? JSON.parse(stored) : [];

    const updated = currentPlayers.filter(p => p.name !== player.name);
    updated.push(player);

    const updatedString = JSON.stringify(updated);
    localStorage.setItem(`room:${roomName}:players`, updatedString);
    setPlayers(updated);
    window.dispatchEvent(new Event('playersUpdated')); // 🚀 Notifica a otros componentes
  };

  const playerExists = (name: string) => {
    return players.some(p => p.name === name);
  };

  return { players, addPlayer, playerExists };
};
