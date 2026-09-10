import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
  tenantId: string | null;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Helper to safely parse JSON from localStorage
const loadStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    // Validate it's our app's user object (not stale data from another app on localhost)
    if (user && typeof user.role === 'string' && user.email) {
      return user;
    }
    // If invalid, clear it
    localStorage.removeItem('user');
    return null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: loadStoredUser(),
  isAuthenticated: !!loadStoredUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User }>
    ) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
