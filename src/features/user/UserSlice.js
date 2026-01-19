import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle", // profile fetch status
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.status = "succeeded";
    },
    clearUser(state) {
      state.user = null;
      state.status = "idle";
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
