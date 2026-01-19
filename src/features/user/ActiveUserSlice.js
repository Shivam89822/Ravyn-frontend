import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeUsers: {},
};

const ActiveUserSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    userOnline(state, action) {
      state.activeUsers[action.payload] = true;
    },

    userOffline(state, action) {
      delete state.activeUsers[action.payload];
    },

    resetPresenceState() {
      return initialState;
    },
  },
});

export const {
  userOnline,
  userOffline,
  resetPresenceState,
} = ActiveUserSlice.actions;

export default ActiveUserSlice.reducer;
