// Lee del sessionStorage los datos del jugador actual
export const getCurrentSessionPlayer = () => ({
  // name: nombre del jugador guardado durante este tab/session
  name: sessionStorage.getItem('playerName') || '',
  // role: rol del jugador (player, spectator, admin-…)
  role: sessionStorage.getItem('playerRole') || '',
  // id: identificador único generado (crypto.randomUUID) al registrarse
  id: sessionStorage.getItem('playerId') || '',
});