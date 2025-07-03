import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SalaPage from '../../src/components/pages/SalaPage';
import { vi } from 'vitest';

const mocked = vi.hoisted(() => ({
  ModalPlayer: vi.fn(() => <div>ModalPlayer</div>),
  ModalUserSettings: vi.fn(() => <div>ModalUserSettings</div>),
  GameTable: vi.fn(() => <div>GameTable</div>),
  VotingResults: vi.fn(() => <div>VotingResults</div>),
  InviteModal: vi.fn(() => <div>InviteModal</div>),
  usePlayers: vi.fn(() => ({
    players: [],
    addPlayer: vi.fn(),
    playerExists: vi.fn().mockReturnValue(false)
  })),
  getCurrentSessionPlayer: vi.fn(() => ({
    name: 'test-user',
    role: 'player',
    id: 'abc123'
  })),
  useDispatch: vi.fn(() => vi.fn()),
  useSelector: vi.fn(() => ({
    name: 'test-user',
    role: 'player',
    selectedCard: null
  }))
}));

vi.mock('../../src/components/organisms/ModalPlayer/ModalPlayer', () => ({
  default: mocked.ModalPlayer
}));
vi.mock('../../src/components/organisms/ModalUserSettings/ModalUserSettings', () => ({
  default: mocked.ModalUserSettings
}));
vi.mock('../../src/components/organisms/GameTable/GameTable', () => ({
  default: mocked.GameTable
}));
vi.mock('../../src/components/organisms/VotingResults/VotingResults', () => ({
  default: mocked.VotingResults
}));
vi.mock('../../src/components/organisms/InviteModal/InviteModal', () => ({
  default: mocked.InviteModal
}));
vi.mock('../../src/hooks/usePlayers', () => ({
  usePlayers: mocked.usePlayers
}));
vi.mock('../../src/utils/session', () => ({
  getCurrentSessionPlayer: mocked.getCurrentSessionPlayer
}));
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: mocked.useDispatch,
    useSelector: mocked.useSelector
  };
});

describe('SalaPage', () => {
  it('renderiza correctamente el topbar con el nombre de la sala', () => {
    localStorage.setItem('salaActual', 'equipo-x');
    render(
      <MemoryRouter initialEntries={['/sala/equipo-x']}>
        <Routes>
          <Route path="/sala/:roomName" element={<SalaPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/equipo-x/i)).toBeInTheDocument();
    expect(screen.getByText('ModalPlayer')).toBeInTheDocument();
  });

  it('muestra el avatar con las iniciales del usuario', () => {
    render(
      <MemoryRouter initialEntries={['/sala/test-room']}>
        <Routes>
          <Route path="/sala/:roomName" element={<SalaPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('TE')).toBeInTheDocument(); // Iniciales de "test-user"
  });

  it('renderiza las cartas disponibles para seleccionar', () => {
    render(
      <MemoryRouter initialEntries={['/sala/test-room']}>
        <Routes>
          <Route path="/sala/:roomName" element={<SalaPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('☕')).toBeInTheDocument();
  });

  it('muestra el modal de invitación al hacer clic en el botón', async () => {
    render(
      <MemoryRouter initialEntries={['/sala/test-room']}>
        <Routes>
          <Route path="/sala/:roomName" element={<SalaPage />} />
        </Routes>
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /invitar jugadores/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/invitar/i)).toBeInTheDocument();
    });
  });
});
