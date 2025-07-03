import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameTable, { Player } from '../components/organisms/GameTable/GameTable';
import { vi } from 'vitest';
import type { GameTableProps } from '../components/organisms/GameTable/GameTable';

const mocked = vi.hoisted(() => ({
  useDispatch: vi.fn(),
  selectCard: vi.fn()
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mocked.useDispatch()
}));

vi.mock('../../../store/userSlice', () => ({
  selectCard: mocked.selectCard
}));

describe('GameTable Component', () => {
  const baseProps: GameTableProps = {
    currentPlayer: { name: 'You', role: 'player', selectedCard: null },
    otherPlayers: [
      { name: 'Alice', role: 'player', selectedCard: 5 },
      { name: 'Bob', role: 'spectator', selectedCard: null }
    ],
    isAdmin: true,
    onReveal: vi.fn()
  };

  let dispatchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatchMock = vi.fn();
    mocked.useDispatch.mockReturnValue(dispatchMock);
    mocked.selectCard.mockImplementation((value) => ({
      type: 'user/selectCard',
      payload: value
    }));
    localStorage.clear();
  });

  it('renderiza correctamente los jugadores y sus roles', () => {
    render(<GameTable {...baseProps} />);
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob (Espectador)')).toBeInTheDocument();
  });

  it('muestra el ícono 👀 para espectadores', () => {
    render(<GameTable {...baseProps} />);
    expect(screen.getByText('👀')).toBeInTheDocument();
  });

  it('deshabilita el botón "Revelar cartas" si no todos los jugadores votaron', () => {
    render(<GameTable {...baseProps} />);
    const button = screen.getByRole('button', { name: /revelar cartas/i });
    expect(button).toBeDisabled();
  });

  it('habilita el botón "Revelar cartas" si todos los jugadores han votado', () => {
    const props: GameTableProps = {
      ...baseProps,
      currentPlayer: { ...baseProps.currentPlayer, selectedCard: 3 }
    };
    render(<GameTable {...props} />);
    const button = screen.getByRole('button', { name: /revelar cartas/i });
    expect(button).toBeEnabled();
  });

  it('muestra las cartas después de hacer clic en "Revelar cartas"', async () => {
    const props: GameTableProps = {
      ...baseProps,
      currentPlayer: { ...baseProps.currentPlayer, selectedCard: 3 }
    };

    render(<GameTable {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /revelar cartas/i }));

    await waitFor(() => {
      expect(localStorage.getItem('revealed')).toBe('true');
    }, { timeout: 3000 });

    expect(props.onReveal).toHaveBeenCalled();
  }, 4000); // test timeout extendido

  it('reinicia la votación al hacer clic en "Nueva votación"', () => {
    localStorage.setItem('revealed', 'true');

    const props: GameTableProps = {
      ...baseProps,
      currentPlayer: { ...baseProps.currentPlayer, selectedCard: 5 }
    };

    render(<GameTable {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /nueva votación/i }));

    expect(localStorage.getItem('revealed')).toBe('false');
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'user/selectCard',
      payload: null
    });
    expect(props.onReveal).toHaveBeenCalled();
  });

  it('no habilita "Revelar cartas" si al menos un jugador activo no ha votado', () => {
  const props: GameTableProps = {
    currentPlayer: { name: 'You', role: 'admin-player', selectedCard: null },
    otherPlayers: [
      { name: 'Alice', role: 'player', selectedCard: 5 },
      { name: 'Bob', role: 'player', selectedCard: null }
    ],
    isAdmin: true,
    onReveal: vi.fn()
  };

  render(<GameTable {...props} />);
  const button = screen.getByRole('button', { name: /revelar cartas/i });
  expect(button).toBeDisabled(); // 🔴 falta Bob
});

it('admin-spectator no bloquea el botón "Revelar cartas" si los demás votaron', () => {
  const props: GameTableProps = {
    currentPlayer: { name: 'You', role: 'admin-spectator', selectedCard: null },
    otherPlayers: [
      { name: 'Alice', role: 'player', selectedCard: 3 },
      { name: 'Bob', role: 'player', selectedCard: 1 }
    ],
    isAdmin: true,
    onReveal: vi.fn()
  };

  render(<GameTable {...props} />);
  const button = screen.getByRole('button', { name: /revelar cartas/i });
  expect(button).toBeEnabled(); // 🟢 los 2 jugadores activos votaron
});


});
