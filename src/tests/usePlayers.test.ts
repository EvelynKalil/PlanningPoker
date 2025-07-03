import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePlayers, type Player } from '../hooks/usePlayers';

describe('usePlayers', () => {
  const room = 'test-room';
  const storageKey = `room:${room}:players`;

  beforeEach(() => {
    localStorage.clear();
  });

  it('inicializa los jugadores desde localStorage', () => {
    const players: Player[] = [{ name: 'Alice', role: 'player', selectedCard: 1 }];
    localStorage.setItem(storageKey, JSON.stringify(players));

    const { result } = renderHook(() => usePlayers(room));
    expect(result.current.players).toEqual(players);
  });

  it('addPlayer guarda en localStorage y actualiza el estado', () => {
    const newPlayer: Player = { name: 'Bob', role: 'spectator', selectedCard: '?' };

    const { result } = renderHook(() => usePlayers(room));

    act(() => {
      result.current.addPlayer(newPlayer);
    });

    const saved = JSON.parse(localStorage.getItem(storageKey)!);
    expect(saved).toContainEqual(newPlayer);
    expect(result.current.players).toContainEqual(newPlayer);
  });

  it('playerExists retorna true si el jugador está presente', () => {
    const player: Player = { name: 'Carlos', role: 'player', selectedCard: 5 };
    localStorage.setItem(storageKey, JSON.stringify([player]));

    const { result } = renderHook(() => usePlayers(room));

    expect(result.current.playerExists('Carlos')).toBe(true);
    expect(result.current.playerExists('Otro')).toBe(false);
  });

  it('se actualiza cuando se dispara el evento playersUpdated', () => {
    const updated: Player[] = [{ name: 'Dana', role: 'player', selectedCard: 13 }];
    localStorage.setItem(storageKey, JSON.stringify(updated));

    const { result } = renderHook(() => usePlayers(room));

    act(() => {
      window.dispatchEvent(new Event('playersUpdated'));
    });

    expect(result.current.players).toEqual(updated);
  });
});
