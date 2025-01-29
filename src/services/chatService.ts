import { ChatMessage, PageContext } from '../types';
import { ErrorType, ErrorInfo } from '../types/error';

export class ChatService {
  async sendMessage(
    _sessionId: string,
    content: string,
    pageContext?: PageContext
  ): Promise<ChatMessage> {
    try {
      // 实现发送消息逻辑
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'sending',
        metadata: {
          pageUrl: pageContext?.url,
          selectedText: pageContext?.selectedText,
        },
      };

      // TODO: 调用AI API
      
      return message;
    } catch (error: any) {
      const errorInfo: ErrorInfo = {
        type: ErrorType.API_ERROR,
        message: error?.message || 'Unknown error',
        timestamp: Date.now(),
      };
      throw errorInfo;
    }
  }

  async getChatHistory(_sessionId: string): Promise<ChatMessage[]> {
    try {
      // 实现获取历史记录逻辑
      return [];
    } catch (error: any) {
      throw new Error(`Failed to get chat history: ${error?.message}`);
    }
  }
} 