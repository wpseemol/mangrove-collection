import { configureStore } from "@reduxjs/toolkit";
import homeEditorReducer from "./features/homeEditorSlice";

export const makeStore = () => {
     return configureStore({
          reducer: {
               homeEditor: homeEditorReducer,
          },
     });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
