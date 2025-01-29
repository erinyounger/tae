export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PageContext {
  url: string;
  title: string;
  selectedText?: string;
  mainContent: string;
  metadata: {
    description: string;
    keywords: string;
    author: string;
  };
}

export type PromptCategory = 'development' | 'testing' | 'design' | 'general' | 'custom';

export interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export type MessageStatus = 'sending' | 'streaming' | 'success' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: MessageStatus;
  metadata?: {
    pageUrl?: string;
    selectedText?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type ChatSessions = ChatSession[];

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  variables?: PromptVariable[];
  createTime: number;
  updateTime: number;
  useCount: number;
  isFavorite: boolean;
  isActive: boolean;
}

export interface ModelConfig {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive: boolean;
}

export type ModelConfigs = ModelConfig[]; 