import { ChatSession } from '../types';

const STORAGE_KEY = 'ai_sessions';

export class SessionService {
  static async saveSessions(sessions: ChatSession[]): Promise<void> {
    try {
      console.log('Saving sessions:', sessions);
      const jsonValue = JSON.stringify(sessions);
      localStorage.setItem(STORAGE_KEY, jsonValue);
      console.log('Sessions saved successfully');
    } catch (error) {
      console.error('Failed to save sessions:', error);
      throw error;
    }
  }

  static async loadSessions(): Promise<ChatSession[]> {
    try {
      console.log('Loading sessions from storage');
      const jsonValue = localStorage.getItem(STORAGE_KEY);
      
      if (!jsonValue) {
        console.log('No sessions found in storage');
        return [];
      }

      const sessions = JSON.parse(jsonValue) as ChatSession[];
      console.log('Loaded sessions:', sessions);
      return sessions;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  static async clearSessions(): Promise<void> {
    try {
      console.log('Clearing all sessions');
      localStorage.removeItem(STORAGE_KEY);
      console.log('Sessions cleared successfully');
    } catch (error) {
      console.error('Failed to clear sessions:', error);
      throw error;
    }
  }

  static generateSessionTitle(firstMessage: string): string {
    // 从第一条消息生成会话标题
    const maxLength = 20;
    let title = firstMessage.trim();
    
    // 移除多余的空白字符
    title = title.replace(/\s+/g, ' ');
    
    // 如果消息太长，截取前面的部分
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }
    
    return title || '新对话';
  }
} 