import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTeam:
    typeof window !== "undefined"
      ? localStorage.getItem("active-team") || "OPD"
      : "OPD",
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setActiveTeam: (state, action) => {
      state.activeTeam = action.payload;
      localStorage.setItem("active-team", action.payload);
    },
  },
});

export const { setActiveTeam } = teamSlice.actions;
export default teamSlice.reducer;
