import axios from 'axios';
import { ModelConfig, ChatMessage, Message } from '../types';
import { store } from '../store';

const isDevelopment = import.meta.env.DEV;

export class AIService {
  constructor(private modelConfig: ModelConfig) {}

  private getEndpoint() {
    const { baseUrl } = this.modelConfig;
    if (isDevelopment) {
      // 开发环境下统一使用 /api 前缀
      return '/api/chat/completions';
    }
    return `${baseUrl}/chat/completions`;
  }

  private async makeStreamRequest(
    messages: ChatMessage[],
    onMessage: (content: string) => void,
    signal?: AbortSignal
  ) {
    const { apiKey, model } = this.modelConfig;
    const endpoint = this.getEndpoint();

    // 确保系统消息在开头
    const sortedMessages = [...messages].sort((a, b) => {
      if (a.role === 'system') return -1;
      if (b.role === 'system') return 1;
      return 0;
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          model: model.trim(),
          messages: sortedMessages.map(msg => ({
            role: msg.role,
            content: msg.content.trim()
          })),
          temperature: 0.7,
          max_tokens: 2000,
          stream: true
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
        console.error('API Error:', {
          status: response.status,
          endpoint,
          model,
          error: errorData
        });
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let contentBuffer = '';
      let isFirstChunk = true;
      let lastLineWasEmpty = false;

      if (!reader) {
        throw new Error('Response body is null');
      }

      const flushBuffer = () => {
        if (contentBuffer) {
          onMessage(contentBuffer);
          contentBuffer = '';
        }
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            flushBuffer();
            break;
          }

          const chunk = decoder.decode(value);
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                
                if (content) {
                  // 处理第一个块
                  if (isFirstChunk) {
                    contentBuffer = content.trimStart();
                    isFirstChunk = false;
                    continue;
                  }

                  // 处理段落间距
                  if (content.includes('\n')) {
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                      const line = lines[i];
                      const isEmptyLine = !line.trim();

                      if (isEmptyLine) {
                        if (!lastLineWasEmpty) {
                          contentBuffer += '\n';
                          lastLineWasEmpty = true;
                        }
                      } else {
                        if (lastLineWasEmpty) {
                          contentBuffer += line;
                          lastLineWasEmpty = false;
                        } else {
                          contentBuffer += (i > 0 ? '\n' : '') + line;
                        }
                      }
                    }
                  } else {
                    contentBuffer += content;
                  }

                  // 检查是否需要刷新缓冲区
                  if (
                    content.includes('：') ||   // 遇到中文冒号
                    content.includes(':') ||    // 遇到英文冒号
                    content.match(/^\d+\.|^[-*]|^#/) // 遇到列表项或标题
                  ) {
                    flushBuffer();
                  }
                }
              } catch (e) {
                console.error('Failed to parse SSE message:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      console.error('Request Error:', {
        endpoint,
        model,
        error: error.message
      });
      if (error.name === 'AbortError') {
        throw error;
      }
      if (error.response?.status === 400) {
        throw new Error('请求参数错误，请检查模型配置');
      }
      if (error.response?.status === 401) {
        throw new Error('API密钥无效或已过期');
      }
      if (error.response?.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      throw error;
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    onUpdate: (content: string) => void,
    signal?: AbortSignal
  ) {
    try {
      await this.makeStreamRequest(messages, onUpdate, signal);
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  updateConfig(config: Partial<ModelConfig>) {
    this.modelConfig = { ...this.modelConfig, ...config };
  }

  static async sendMessage(messages: Message[]): Promise<string> {
    try {
      // 从 Redux store 获取当前激活的模型配置
      const state = store.getState();
      const activeModelId = state.models.activeModelId;
      const activeModel = state.models.models.find(m => m.id === activeModelId);

      if (!activeModel) {
        throw new Error('No active model configuration found');
      }

      console.log('Using model configuration:', activeModel);

      const endpoint = import.meta.env.DEV ? '/api/chat/completions' : activeModel.baseUrl;
      
      console.log('Making request to:', endpoint);

      const requestData = {
        model: activeModel.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000
      };

      console.log('Request data:', requestData);

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeModel.apiKey}`
        }
      });

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response from API');
      }

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('AI service error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(error.message || 'Failed to get AI response');
    }
  }
} 