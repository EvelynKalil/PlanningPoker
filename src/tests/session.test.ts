import { getCurrentSessionPlayer } from '../utils/session';

describe('getCurrentSessionPlayer', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('debe devolver datos vacíos si no hay nada en sessionStorage', () => {
    expect(getCurrentSessionPlayer()).toEqual({
      name: '',
      role: '',
      id: ''
    });
  });

  it('debe devolver los datos guardados en sessionStorage', () => {
    sessionStorage.setItem('playerName', 'Juan');
    sessionStorage.setItem('playerRole', 'player');
    sessionStorage.setItem('playerId', '123abc');

    expect(getCurrentSessionPlayer()).toEqual({
      name: 'Juan',
      role: 'player',
      id: '123abc'
    });
  });
});
