import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InviteModal from '../../src/components/organisms/InviteModal/InviteModal';
import { vi } from 'vitest'

describe('InviteModal', () => {
  const roomLink = 'https://miapp.com/sala/123';
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el enlace de la sala en el input', () => {
    render(<InviteModal roomLink={roomLink} onClose={onCloseMock} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue(roomLink);
  });

  it('debe copiar el enlace al hacer clic en "Copiar enlace"', async () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<InviteModal roomLink={roomLink} onClose={onCloseMock} />);
    const button = screen.getByRole('button', { name: /copiar enlace/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(roomLink);
    });
    expect(screen.getByRole('button', { name: /¡copiado!/i })).toBeInTheDocument();
  });

  it('debe cerrar el modal al hacer clic en el botón de cierre', () => {
    render(<InviteModal roomLink={roomLink} onClose={onCloseMock} />);
    const closeButton = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });
}); 
