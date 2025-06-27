export const getCurrentSessionPlayer = () => ({
  name: sessionStorage.getItem('playerName') || '',
  role: sessionStorage.getItem('playerRole') || '',
  id: sessionStorage.getItem('playerId') || '',
});
