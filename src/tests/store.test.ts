import { store } from '../store';

describe('Redux store', () => {
  it('debe tener el estado inicial correcto', () => {
    const estado = store.getState();
    expect(estado).toHaveProperty('user');
  });
});
