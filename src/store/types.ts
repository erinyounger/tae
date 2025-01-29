import { ChatSession, Prompt, ModelConfig } from '../types';

export interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
}

export interface PromptState {
  prompts: Prompt[];
  selectedPromptId: string | null;
  selectedCategory: 'all' | 'development' | 'testing' | 'design' | 'general' | 'custom';
  searchQuery: string;
  sortBy: 'useCount' | 'createTime' | 'updateTime';
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState {
  model: ModelConfig;
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
}

export interface ModelState {
  models: ModelConfig[];
  activeModelId: string | null;
} 