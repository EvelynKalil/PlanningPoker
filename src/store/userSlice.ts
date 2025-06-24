import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Role = 'admin-player' | 'admin-spectator' | 'player' | 'spectator'

interface UserState {
  name: string | null
  role: Role | null
  selectedCard: string | number | null
}

const initialState: UserState = {
  name: localStorage.getItem('playerName'),
  role: localStorage.getItem('playerRole') as Role,
  selectedCard: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ name: string; role: Role }>) {
      state.name = action.payload.name
      state.role = action.payload.role
    },
    selectCard(state, action: PayloadAction<string | number>) {
      state.selectedCard = action.payload
    }
  }
})

export const { setUser, selectCard } = userSlice.actions
export default userSlice.reducer
