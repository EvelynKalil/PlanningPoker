
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalPlayer from '../../src/components/organisms/ModalPlayer/ModalPlayer';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'

describe('ModalPlayer', () => {
  const onSubmitMock = vi.fn();

  beforeEach(() => {
    onSubmitMock.mockClear();
    sessionStorage.clear();
  });

  it('muestra errores cuando el nombre es inválido', () => {
    render(<ModalPlayer onSubmit={onSubmitMock} />);
    const input = screen.getByPlaceholderText(/ingresa tu nombre/i);
    fireEvent.change(input, { target: { value: '123' } });

    expect(screen.getByText(/debe tener entre 5 y 20 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/no puede contener solo números/i)).toBeInTheDocument();
  });

  it('desactiva el botón "Continuar" si el formulario no es válido', () => {
    render(<ModalPlayer onSubmit={onSubmitMock} />);
    const button = screen.getByRole('button', { name: /continuar/i });
    expect(button).toBeDisabled();
  });

  it('activa el botón "Continuar" cuando el nombre y el rol son válidos', () => {
    render(<ModalPlayer onSubmit={onSubmitMock} />);
    const input = screen.getByPlaceholderText(/ingresa tu nombre/i);
    fireEvent.change(input, { target: { value: 'Juan123' } });

    const radio = screen.getByLabelText(/jugador/i);
    fireEvent.click(radio);

    const button = screen.getByRole('button', { name: /continuar/i });
    expect(button).toBeEnabled();
  });

  it('envía el formulario correctamente cuando los datos son válidos', () => {
    render(<ModalPlayer onSubmit={onSubmitMock} />);
    const input = screen.getByPlaceholderText(/ingresa tu nombre/i);
    fireEvent.change(input, { target: { value: 'Ana45' } });

    const radio = screen.getByLabelText(/espectador/i);
    fireEvent.click(radio);

    const button = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(button);

    expect(onSubmitMock).toHaveBeenCalledWith('Ana45', 'spectator');
    expect(sessionStorage.getItem('playerName')).toBe('Ana45');
    expect(sessionStorage.getItem('playerRole')).toBe('spectator');
  });

  it('no envía el formulario si el rol no está seleccionado', () => {
    render(<ModalPlayer onSubmit={onSubmitMock} />);
    const input = screen.getByPlaceholderText(/ingresa tu nombre/i);
    fireEvent.change(input, { target: { value: 'Carlos' } });

    const button = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(button);

    expect(onSubmitMock).not.toHaveBeenCalled();
  });
});
 