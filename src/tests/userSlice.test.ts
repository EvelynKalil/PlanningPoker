import userReducer, { setUser, selectCard, type Role } from '../store/userSlice';

describe('userSlice', () => {
  const estadoInicial = {
    name: null,
    role: null,
    selectedCard: null
  };

  it('debe devolver el estado inicial por defecto', () => {
    const estado = userReducer(undefined, { type: '@@INIT' });

    expect(estado).toMatchObject({
      name: localStorage.getItem('playerName'),
      role: localStorage.getItem('playerRole') as Role,
      selectedCard: null
    });
  });

  it('setUser debe actualizar el nombre y el rol', () => {
    const estado = userReducer(estadoInicial, setUser({ name: 'Alice', role: 'player' }));

    expect(estado.name).toBe('Alice');
    expect(estado.role).toBe('player');
  });

  it('selectCard debe actualizar selectedCard', () => {
    const estado = userReducer(estadoInicial, selectCard(13));
    expect(estado.selectedCard).toBe(13);

    const limpio = userReducer(estado, selectCard(null));
    expect(limpio.selectedCard).toBe(null);
  });
});
