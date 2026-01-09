// import { configureStore } from "@reduxjs/toolkit";
// import teamReducer from "./teamSlice";
// import companyReducer from "./companySlice";
// import userReducer from "./userSlice";
// import authReducer from "./authSlice";

// export const store = configureStore({
//   reducer: {
//     team: teamReducer,
//     company: companyReducer,
//     user: userReducer,
//     auth: authReducer,
//   },
// });

import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

import teamReducer from "./teamSlice";
import userReducer from "./userSlice";
import authReducer from "./authSlice";
import companyReducer from "./companySlice";
import settingReducer from "./settingSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user", "company", "team"], // which slices to persist
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  company: companyReducer,
  setting: settingReducer,
  team: teamReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
