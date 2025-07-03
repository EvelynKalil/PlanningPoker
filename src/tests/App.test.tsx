import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from '../../src/components/pages/App';
import { store } from '../../src/store';
import { vi } from 'vitest';

// ✅ Corrige las rutas de los mocks:
vi.mock('../../src/components/molecules/FormCreateGame/FormCreateGame', () => ({
  default: () => <div>Formulario de partida</div>
}));

vi.mock('../../src/components/pages/SalaPage', () => ({
  default: () => <div>Página de sala</div>
}));

describe('App', () => {
  const renderWithRouterAndStore = (route: string) =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

  it('renderiza FormCreateGame en la ruta raíz y muestra topbar', () => {
    renderWithRouterAndStore('/');
    expect(screen.getByText('Formulario de partida')).toBeInTheDocument();
    expect(screen.getByText('Crear partida')).toBeInTheDocument();
  });

  it('renderiza SalaPage en /sala/:roomName y oculta topbar', () => {
    renderWithRouterAndStore('/sala/equipo-x');
    expect(screen.getByText('Página de sala')).toBeInTheDocument();
    expect(screen.queryByText('Crear partida')).not.toBeInTheDocument();
  });

  it('renderiza 404 en rutas desconocidas', () => {
    renderWithRouterAndStore('/no-existe');
    expect(screen.getByText('404 - Página no encontrada')).toBeInTheDocument();
  });
});
