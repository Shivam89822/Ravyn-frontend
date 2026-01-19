import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  isAuthChecked: false, // VERY IMPORTANT
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state) {
      state.isAuthenticated = true;
      state.isAuthChecked = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.isAuthChecked = true;
    },
    authChecked(state) {
      state.isAuthChecked = true;
    },
  },
});

export const { loginSuccess, logout, authChecked } = authSlice.actions;
export default authSlice.reducer;
