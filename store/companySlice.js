import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  company: null, // logged-in company / active company
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setCompany: (state, action) => {
      state.company = action.payload;
    },
    clearCompany: (state) => {
      state.company = null;
    },
  },
});

export const { setCompany, clearCompany } = companySlice.actions;
export default companySlice.reducer;
