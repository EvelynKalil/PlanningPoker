// tests/ModalUserSettings.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalUserSettings from '../../src/components/organisms/ModalUserSettings/ModalUserSettings';
import { vi } from 'vitest';

type Player = {
  name: string;
  role: 'player' | 'spectator' | 'admin-player' | 'admin-spectator';
};

describe('ModalUserSettings', () => {
  const mockOnClose = vi.fn();
  const mockOnRoleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('debe renderizar correctamente el modal', () => {
    render(
      <ModalUserSettings
        currentRole="player"
        onClose={mockOnClose}
        onRoleChange={mockOnRoleChange}
      />
    );
    expect(screen.getByText('Modo de juego')).toBeInTheDocument();
  });

it('debe cambiar el rol a espectador', () => {
  sessionStorage.setItem('playerName', 'Evelyn');
  sessionStorage.setItem('playerRole', 'admin-player');

  const jugadores = [
    { name: 'Evelyn', role: 'admin-player' },
    { name: 'Otro', role: 'player' },
  ];

  localStorage.setItem('salaActual', 'sala-prueba');
  localStorage.setItem('room:sala-prueba:players', JSON.stringify(jugadores));

  render(
    <ModalUserSettings
      currentRole="admin-player"
      onClose={mockOnClose}
      onRoleChange={mockOnRoleChange}
    />
  );

  fireEvent.click(screen.getByLabelText('Espectador'));
  fireEvent.click(screen.getByText('Guardar'));

  expect(mockOnRoleChange).toHaveBeenCalledWith('admin-spectator');
});



  it('debe añadir una nueva tarjeta válida', () => {
    render(
      <ModalUserSettings
        currentRole="admin-player"
        onClose={mockOnClose}
        onRoleChange={mockOnRoleChange}
      />
    );
    const input = screen.getByPlaceholderText('Nueva tarjeta');
    fireEvent.change(input, { target: { value: '42' } });
    const addButton = screen.getByText('Añadir');
    fireEvent.click(addButton);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('debe mostrar error al añadir una tarjeta duplicada', () => {
    render(
  <ModalUserSettings
    currentRole="admin-player" // 👈 clave para que permita cambiar a admin-spectator o spectator
    onClose={mockOnClose}
    onRoleChange={mockOnRoleChange}
  />
);

    const input = screen.getByPlaceholderText('Nueva tarjeta');
    fireEvent.change(input, { target: { value: '5' } });
    const addButton = screen.getByText('Añadir');
    fireEvent.click(addButton);
    expect(screen.getByText('Esa tarjeta ya existe')).toBeInTheDocument();
  });

  it('debe cerrar el modal al hacer clic en "Cancelar"', () => {
    render(
      <ModalUserSettings
        currentRole="player"
        onClose={mockOnClose}
        onRoleChange={mockOnRoleChange}
      />
    );
    const cancelarButton = screen.getByText('Cancelar');
    fireEvent.click(cancelarButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

it('debe transferir el rol de admin al jugador seleccionado', () => {
  sessionStorage.setItem('playerName', 'Admin');
  sessionStorage.setItem('playerRole', 'admin-player');
  localStorage.setItem('salaActual', 'sala-prueba');
  localStorage.setItem('room:sala-prueba:players', JSON.stringify([
    { name: 'Admin', role: 'admin-player' },
    { name: 'Usuario', role: 'player' }
  ]));

  render(
    <ModalUserSettings
      currentRole="admin-player"
      onClose={mockOnClose}
      onRoleChange={mockOnRoleChange}
    />
  );

  fireEvent.change(screen.getByDisplayValue('Selecciona un jugador'), {
    target: { value: 'Usuario' }
  });
  fireEvent.click(screen.getByText('Guardar'));

  const playersUpdated = JSON.parse(localStorage.getItem('room:sala-prueba:players')!);
  const nuevoAdmin = playersUpdated.find((p: Player) => p.name === 'Usuario');
  expect(nuevoAdmin.role).toBe('admin-player');
});

it('debe eliminar una tarjeta al hacer clic en el botón ✖', async () => {
  render(
    <ModalUserSettings
      currentRole="admin-player"
      onClose={vi.fn()}
      onRoleChange={vi.fn()}
    />
  );

  // Asegúrate que la tarjeta "1" existe antes
  const card = screen.queryByTestId('card-1');
  expect(card).toBeInTheDocument();

  // Simula click en el botón ✖ dentro de esa tarjeta
  fireEvent.click(within(card!).getByText('✖'));

  // Espera a que se elimine del DOM
  await waitFor(() => {
    expect(screen.queryByTestId('card-1')).not.toBeInTheDocument();
  });
});



});
