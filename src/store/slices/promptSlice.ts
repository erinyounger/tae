import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Prompt, PromptCategory } from '../../types';
import { PromptService } from '../../services/promptService';

interface PromptState {
  prompts: Prompt[];
  selectedPromptId: string | null;
  selectedCategory: PromptCategory | 'all';
  searchQuery: string;
  sortBy: 'useCount' | 'createTime' | 'updateTime';
  isLoading: boolean;
  error: string | null;
}

const initialState: PromptState = {
  prompts: [],
  selectedPromptId: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'updateTime',
  isLoading: false,
  error: null
};

const promptSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loadPrompts: (state, action: PayloadAction<Prompt[]>) => {
      state.prompts = action.payload;
      state.error = null;
      PromptService.savePrompts(action.payload);
    },
    addPrompt: (state, action: PayloadAction<Prompt>) => {
      state.prompts.unshift(action.payload);
      PromptService.savePrompts(state.prompts);
    },
    updatePrompt: (state, action: PayloadAction<Prompt>) => {
      const index = state.prompts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.prompts[index] = {
          ...action.payload,
          updateTime: Date.now()
        };
        PromptService.savePrompts(state.prompts);
      }
    },
    removePrompt: (state, action: PayloadAction<string>) => {
      state.prompts = state.prompts.filter(p => p.id !== action.payload);
      if (state.selectedPromptId === action.payload) {
        state.selectedPromptId = null;
      }
      PromptService.savePrompts(state.prompts);
    },
    selectPrompt: (state, action: PayloadAction<string | null>) => {
      state.selectedPromptId = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const prompt = state.prompts.find(p => p.id === action.payload);
      if (prompt) {
        prompt.isFavorite = !prompt.isFavorite;
        prompt.updateTime = Date.now();
        PromptService.savePrompts(state.prompts);
      }
    },
    incrementUseCount: (state, action: PayloadAction<string>) => {
      const prompt = state.prompts.find(p => p.id === action.payload);
      if (prompt) {
        prompt.useCount++;
        prompt.updateTime = Date.now();
        PromptService.savePrompts(state.prompts);
      }
    },
    selectCategory: (state, action: PayloadAction<PromptCategory | 'all'>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'useCount' | 'createTime' | 'updateTime'>) => {
      state.sortBy = action.payload;
    },
    clearPrompts: (state) => {
      state.prompts = [];
      state.selectedPromptId = null;
      state.error = null;
      PromptService.clearPrompts();
    }
  }
});

export const {
  setLoading,
  setError,
  loadPrompts,
  addPrompt,
  updatePrompt,
  removePrompt,
  selectPrompt,
  toggleFavorite,
  incrementUseCount,
  selectCategory,
  setSearchQuery,
  setSortBy,
  clearPrompts
} = promptSlice.actions;

export default promptSlice.reducer; 