import { useEffect, useState } from 'react';

// Definición de la estructura de un jugador en la sala
export interface Player {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
  selectedCard: number | string | null;
  isNew?: boolean; // Opcional: true si llegó después de revelar
}

// Hook personalizado para gestionar la lista de jugadores en una sala
export const usePlayers = (roomName: string) => {
  // Estado local: array de jugadores
  const [players, setPlayers] = useState<Player[]>([]);

  // Función que lee la lista de jugadores desde localStorage
  const readPlayersFromStorage = () => {
    const raw = localStorage.getItem(`room:${roomName}:players`);
    // Clave: room:<roomName>:players
    if (raw) {
      try {
        const parsed = JSON.parse(raw); // Parsear JSON
        if (Array.isArray(parsed)) {
          setPlayers(parsed); // Actualizar estado si es array
        }
      } catch (err) {
        console.error('Error parsing localStorage players:', err);
      }
    }
  };

  // useEffect para sincronizar estado al montar y luego de cambios
  useEffect(() => {
    readPlayersFromStorage(); //lee al montar

    const interval = setInterval(readPlayersFromStorage, 500);

    // Handler para evento personalizado "playersUpdated"
    const syncFromEvent = () => readPlayersFromStorage();

    // Handler para cambios en localStorage (otras pestañas)
    const syncFromOtherTab = (e: StorageEvent) => {
       // Si cambia la clave de jugadores o la de "revealed", releer
      if (e.key?.includes('room:') || e.key === 'revealed') {
        readPlayersFromStorage();
      }
    };

    // Escuchar eventos para sincronizar
    window.addEventListener('playersUpdated', syncFromEvent);
    window.addEventListener('storage', syncFromOtherTab);

    // Cleanup: limpiar intervalos y listeners al desmontar o cambiar sala
    return () => {
      clearInterval(interval);
      window.removeEventListener('playersUpdated', syncFromEvent);
      window.removeEventListener('storage', syncFromOtherTab);
    };
  }, [roomName]); // se vuelve a ejecutar si cambia roomName

  // Función para añadir o actualizar un jugador en la sala
  const addPlayer = (player: Player) => {
    const stored = localStorage.getItem(`room:${roomName}:players`);
    const currentPlayers: Player[] = stored ? JSON.parse(stored) : [];

    // Eliminar cualquier jugador con el mismo nombre
    const updated = currentPlayers.filter(p => p.name !== player.name);
    updated.push(player);

    const updatedString = JSON.stringify(updated);
    localStorage.setItem(`room:${roomName}:players`, updatedString); // Guardar en localStorage
    setPlayers(updated);  // Actualizar estado local
    window.dispatchEvent(new Event('playersUpdated'));
    // Disparar evento para notificar a otras pestañas
  };

  // Función que comprueba si un jugador con un nombre dado ya existe
  const playerExists = (name: string) => {
    return players.some(p => p.name === name);
  };

  // Devolver el estado y las funciones para usar en componentes
  return { players, addPlayer, playerExists };
};
