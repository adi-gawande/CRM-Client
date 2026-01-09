import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  setting: null,
};

const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    setSetting: (state, action) => {
      state.setting = action.payload;
    },
    clearSetting: (state) => {
      state.setting = null;
    },
  },
});

export const { setSetting, clearSetting } = settingSlice.actions;
export default settingSlice.reducer;
