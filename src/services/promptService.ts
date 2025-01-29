import { Prompt } from '../types';

const PROMPT_STORAGE_KEY = 'ai_prompts';

export class PromptService {
  static async savePrompts(prompts: Prompt[]): Promise<void> {
    try {
      console.log('Saving prompts:', prompts);
      const jsonValue = JSON.stringify(prompts);
      localStorage.setItem(PROMPT_STORAGE_KEY, jsonValue);
      console.log('Prompts saved successfully');
    } catch (error) {
      console.error('Failed to save prompts:', error);
      throw error;
    }
  }

  static async loadPrompts(): Promise<Prompt[]> {
    try {
      console.log('Loading prompts from storage');
      const jsonValue = localStorage.getItem(PROMPT_STORAGE_KEY);
      
      if (!jsonValue) {
        console.log('No prompts found in storage');
        return [];
      }

      const prompts = JSON.parse(jsonValue) as Prompt[];
      console.log('Loaded prompts:', prompts);
      return prompts;
    } catch (error) {
      console.error('Failed to load prompts:', error);
      return [];
    }
  }

  static async clearPrompts(): Promise<void> {
    try {
      console.log('Clearing all prompts');
      localStorage.removeItem(PROMPT_STORAGE_KEY);
      console.log('Prompts cleared successfully');
    } catch (error) {
      console.error('Failed to clear prompts:', error);
      throw error;
    }
  }

  static async searchPrompts(prompts: Prompt[], query: string): Promise<Prompt[]> {
    if (!query.trim()) {
      return prompts;
    }

    const searchQuery = query.toLowerCase();
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchQuery) ||
      prompt.content.toLowerCase().includes(searchQuery) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  static sortPrompts(prompts: Prompt[], sortBy: 'useCount' | 'createTime' | 'updateTime'): Prompt[] {
    return [...prompts].sort((a, b) => {
      switch (sortBy) {
        case 'useCount':
          return b.useCount - a.useCount;
        case 'createTime':
          return b.createTime - a.createTime;
        case 'updateTime':
          return b.updateTime - a.updateTime;
        default:
          return 0;
      }
    });
  }
} 