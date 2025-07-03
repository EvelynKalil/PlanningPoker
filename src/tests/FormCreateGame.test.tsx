// src/setupTest/FormCreateGame.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import FormCreateGame from '../components/molecules/FormCreateGame/FormCreateGame';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('FormCreateGame', () => {
  const mockedUseNavigate = useNavigate as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockedUseNavigate.mockReset();
  });

  it('renderiza el formulario con label, input y botón', () => {
    render(
      <MemoryRouter>
        <FormCreateGame />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/nombra la partida/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear partida/i })).toBeInTheDocument();
  });

  it('muestra errores cuando el nombre es inválido', () => {
    render(
      <MemoryRouter>
        <FormCreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123' } });

    expect(screen.getByText(/debe tener entre 5 y 20 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/no puede contener solo números/i)).toBeInTheDocument();
  });

  it('habilita el botón cuando el nombre es válido', () => {
    render(
      <MemoryRouter>
        <FormCreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /crear partida/i });

    fireEvent.change(input, { target: { value: 'Partida123' } });

    expect(button).not.toBeDisabled();
  });

  it('navega a la ruta correcta al enviar el formulario con nombre válido', () => {
    const navigateMock = vi.fn();
    mockedUseNavigate.mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <FormCreateGame />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /crear partida/i });

    fireEvent.change(input, { target: { value: 'Partida123' } });
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith('/sala/Partida123');
  });
});
