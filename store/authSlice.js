import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  auth: null, // stores ANY auth object you give it
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.auth = action.payload;
    },
    clearAuth: (state) => {
      state.auth = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
