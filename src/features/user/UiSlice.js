import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    showBottomNav: true,
  },
  reducers: {
    hideBottomNav: (state) => {
      state.showBottomNav = false;
    },
    showBottomNav: (state) => {
      state.showBottomNav = true;
    },
  },
});

export const { hideBottomNav, showBottomNav } = uiSlice.actions;
export default uiSlice.reducer;
