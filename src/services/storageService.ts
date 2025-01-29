import { ModelConfig } from '../types';

const STORAGE_KEY = 'ai_models';
const MODEL_STORAGE_KEY = 'ai_model';

interface StorageInterface {
  set(items: { [key: string]: any }): Promise<void>;
  get(key: string | string[]): Promise<{ [key: string]: any }>;
  remove(key: string): Promise<void>;
}

class DevStorage implements StorageInterface {
  async set(items: { [key: string]: any }): Promise<void> {
    try {
      const entries = Object.entries(items);
      for (const [key, value] of entries) {
        const jsonValue = JSON.stringify(value);
        console.log('DevStorage.set - Saving to localStorage:', { key, value, jsonValue });
        localStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error('DevStorage.set failed:', error);
      throw error;
    }
  }

  async get(key: string): Promise<{ [key: string]: any }> {
    try {
      const value = localStorage.getItem(key);
      console.log('DevStorage.get - Raw value from localStorage:', { key, value });
      
      if (!value) {
        console.log('DevStorage.get - No value found for key:', key);
        return {};
      }

      try {
        const parsedValue = JSON.parse(value);
        console.log('DevStorage.get - Parsed value:', parsedValue);
        return { [key]: parsedValue };
      } catch (error) {
        console.error('DevStorage.get - Failed to parse value:', error);
        return {};
      }
    } catch (error) {
      console.error('DevStorage.get failed:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      console.log('DevStorage.remove - Removing key:', key);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('DevStorage.remove failed:', error);
      throw error;
    }
  }
}

export class StorageService {
  private static storage: StorageInterface = import.meta.env.DEV ? new DevStorage() : chrome.storage.local;

  static async saveModels(models: ModelConfig[]): Promise<void> {
    try {
      console.log('StorageService.saveModels - Saving models:', models);
      await this.storage.set({ [STORAGE_KEY]: models });
      console.log('StorageService.saveModels - Models saved successfully');
    } catch (error) {
      console.error('StorageService.saveModels failed:', error);
      throw error;
    }
  }

  static async loadModels(): Promise<ModelConfig[]> {
    try {
      console.log('StorageService.loadModels - Starting to load models...');
      console.log('StorageService.loadModels - Storage key:', STORAGE_KEY);
      console.log('StorageService.loadModels - Environment:', import.meta.env.DEV ? 'development' : 'production');
      
      const result = await this.storage.get(STORAGE_KEY);
      console.log('StorageService.loadModels - Raw result:', result);
      console.log('StorageService.loadModels - Result type:', typeof result);
      
      // 检查 localStorage 中的原始值
      if (import.meta.env.DEV) {
        const rawValue = localStorage.getItem(STORAGE_KEY);
        console.log('StorageService.loadModels - Raw localStorage value:', rawValue);
      }

      const models = result[STORAGE_KEY];
      console.log('StorageService.loadModels - Extracted models:', models);
      console.log('StorageService.loadModels - Models type:', typeof models);
      
      if (!models) {
        console.log('StorageService.loadModels - No models found');
        return [];
      }
      
      if (!Array.isArray(models)) {
        console.log('StorageService.loadModels - Models is not an array:', models);
        return [];
      }

      console.log('StorageService.loadModels - Final models to return:', models);
      return models;
    } catch (error) {
      console.error('StorageService.loadModels failed:', error);
      return [];
    }
  }

  static async clearModels(): Promise<void> {
    try {
      console.log('StorageService.clearModels - Clearing models...');
      await this.storage.remove(STORAGE_KEY);
      console.log('StorageService.clearModels - Models cleared successfully');
    } catch (error) {
      console.error('StorageService.clearModels failed:', error);
      throw error;
    }
  }

  static async save(key: string, data: any): Promise<void> {
    try {
      await this.storage.set({ [key]: data });
    } catch (error) {
      console.error('StorageService.save failed:', error);
      throw error;
    }
  }

  static async load(key: string): Promise<any> {
    try {
      const result = await this.storage.get(key);
      return result[key];
    } catch (error) {
      console.error('StorageService.load failed:', error);
      throw error;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      console.log('StorageService.remove - Removing key:', key);
      await this.storage.remove(key);
      console.log('StorageService.remove - Key removed successfully');
    } catch (error) {
      console.error('StorageService.remove failed:', error);
      throw error;
    }
  }

  static async saveModel(model: ModelConfig): Promise<void> {
    try {
      console.log('Saving model config:', model);
      const jsonValue = JSON.stringify(model);
      localStorage.setItem(MODEL_STORAGE_KEY, jsonValue);
      console.log('Model config saved successfully');
    } catch (error) {
      console.error('Failed to save model config:', error);
      throw error;
    }
  }

  static async loadModel(): Promise<ModelConfig | null> {
    try {
      console.log('Loading model config from storage');
      const jsonValue = localStorage.getItem(MODEL_STORAGE_KEY);
      
      if (!jsonValue) {
        console.log('No model config found in storage');
        return null;
      }

      const model = JSON.parse(jsonValue) as ModelConfig;
      console.log('Loaded model config:', model);
      return model;
    } catch (error) {
      console.error('Failed to load model config:', error);
      return null;
    }
  }

  static async clearModel(): Promise<void> {
    try {
      console.log('Clearing model config');
      localStorage.removeItem(MODEL_STORAGE_KEY);
      console.log('Model config cleared successfully');
    } catch (error) {
      console.error('Failed to clear model config:', error);
      throw error;
    }
  }
} 