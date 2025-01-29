import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import promptReducer from './slices/promptSlice';
import settingsReducer from './slices/settingsSlice';
import modelReducer from './slices/modelSlice';
import { ChatState, PromptState, SettingsState, ModelState } from './types';

export interface RootState {
  chat: ChatState;
  prompts: PromptState;
  settings: SettingsState;
  models: ModelState;
}

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    prompts: promptReducer,
    settings: settingsReducer,
    models: modelReducer
  },
});

export type AppDispatch = typeof store.dispatch; 