import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModelConfig } from '../../types';
import { SettingsState } from '../types';

const initialState: SettingsState = {
  model: {
    id: crypto.randomUUID(),
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    isActive: true
  },
  theme: 'light',
  language: 'zh-CN'
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateModelConfig: (state, action: PayloadAction<ModelConfig>) => {
      state.model = action.payload;
    },
    updateTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    updateLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.language = action.payload;
    }
  }
});

export const { updateModelConfig, updateTheme, updateLanguage } = settingsSlice.actions;
export default settingsSlice.reducer; 