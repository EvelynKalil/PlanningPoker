import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define el tipo de rol posible en la aplicación
export type Role = 'player' | 'spectator' | 'admin-player' | 'admin-spectator';

// Interfaz que describe la forma del estado de usuario
interface UserState {
  name: string | null;
  role: Role | null;
  selectedCard: string | number | null;
}


// Estado inicial: lee nombre y rol desde localStorage, carta en null
const initialState: UserState = {
  name: localStorage.getItem('playerName'),
  role: localStorage.getItem('playerRole') as Role,
  selectedCard: null,
};

// Crea el slice "user" con su estado y reducers (acciones)
const userSlice = createSlice({
  name: 'user', // Nombre único del slice
  initialState, // Estado de partida
  reducers: {
    // Acción para establecer/actualizar nombre y rol
    setUser: (
      state,
      action: PayloadAction<{
        name: string;
        role: Role;
      }>
    ) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
     // Acción para seleccionar o cambiar la carta elegida
    selectCard: (state, action: PayloadAction<string | number | null>) => {
      state.selectedCard = action.payload;
    },
  },
});

//Exporta las action creators para dispatcharlos en componentes
export const { setUser, selectCard } = userSlice.actions;
// Exporta el reducer para integrarlo en el store
export default userSlice.reducer;
