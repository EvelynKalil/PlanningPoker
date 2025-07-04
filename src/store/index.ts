// Función para crear el store desde Redux Toolkit
import { configureStore } from '@reduxjs/toolkit'
// Importa el reducer que maneja el slice "user" (lógica de estado de usuario)
import userReducer from './userSlice'

// Crea y exporta el store de Redux
export const store = configureStore({
  reducer: {
    // Asocia el slice "user" al key "user" en el state global
    user: userReducer,
  },
})

// Tipo TypeScript del state completo de la aplicación,
// útil al usar useSelector<RootState, ...>
export type RootState = ReturnType<typeof store.getState>

// Tipo de la función dispatch, para usar con useDispatch<AppDispatch>
export type AppDispatch = typeof store.dispatch
