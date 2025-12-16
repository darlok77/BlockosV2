// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./slices/gameSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

// TypeScript : types pour le store et dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
