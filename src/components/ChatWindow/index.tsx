import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, List, Avatar, message as antMessage, Select, Tooltip } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, StarFilled, CopyOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addMessage, updateMessage, appendMessageContent } from '../../store/slices/chatSlice';
import { incrementUseCount } from '../../store/slices/promptSlice';
import { ChatMessage, PageContext, ModelConfig } from '../../types';
import ReactMarkdown, { Components } from 'react-markdown';
import { AIService } from '../../services/aiService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './index.css';

const { TextArea } = Input;
const { Option } = Select;

const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const components: Partial<Components> = {
    p: ({ children }) => (
      <p style={{ 
        margin: '0.5em 0',
        lineHeight: '1.6'
      }}>
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 style={{ 
        margin: '0.8em 0 0.4em',
        fontSize: '1.4em',
        fontWeight: 600
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ 
        margin: '0.8em 0 0.4em',
        fontSize: '1.3em',
        fontWeight: 600
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ 
        margin: '0.8em 0 0.4em',
        fontSize: '1.2em',
        fontWeight: 600
      }}>
        {children}
      </h3>
    ),
    ul: ({ children }) => (
      <ul style={{ 
        margin: '0.4em 0',
        paddingLeft: '2em',
        listStyle: 'disc'
      }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ 
        margin: '0.4em 0',
        paddingLeft: '2em'
      }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ 
        margin: '0.2em 0',
        lineHeight: '1.5'
      }}>
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: 600 }}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em style={{ fontStyle: 'italic' }}>
        {children}
      </em>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: '4px solid #ddd',
        paddingLeft: '1em',
        margin: '0.5em 0',
        color: '#666'
      }}>
        {children}
      </blockquote>
    ),
    code: ({ children }) => {
      return (
        <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
          {String(children)}
        </SyntaxHighlighter>
      );
    }
  };

  return (
    <div className="message-content">
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const activeModelId = useSelector((state: RootState) => state.models.activeModelId);
  const models = useSelector((state: RootState) => state.models.models);
  const activeModel = models.find((m: ModelConfig) => m.id === activeModelId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      antMessage.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      antMessage.error('复制失败');
    }
  };

  return (
    <div
      style={{
        background: message.role === 'user' ? '#e6f4ff' : '#f6ffed',
        color: '#000',
        padding: '8px 12px',
        borderRadius: '12px',
        wordBreak: 'break-word',
        fontSize: '14px',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
        position: 'relative'
      }}
    >
      {message.role === 'assistant' && (
        <>
          <div style={{ 
            fontSize: '12px',
            color: '#666',
            marginBottom: '4px',
            borderBottom: '1px solid #e8e8e8',
            paddingBottom: '4px'
          }}>
            Assistant: {activeModel?.model || '未知模型'}
          </div>
          <Tooltip title="复制内容">
            <div 
              className="copy-button"
              onClick={handleCopy}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'none',
                zIndex: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
            </div>
          </Tooltip>
        </>
      )}
      <MessageContent content={message.content} />
      {message.status === 'streaming' && (
        <span className="typing-indicator">▋</span>
      )}
    </div>
  );
};

export const ChatWindow: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dispatch = useDispatch();
  
  const prompts = useSelector((state: RootState) => state.prompts.prompts);
  const activeSessionId = useSelector((state: RootState) => state.chat.activeSessionId);
  const sessions = useSelector((state: RootState) => state.chat.sessions);
  const activeModelId = useSelector((state: RootState) => state.models.activeModelId);
  const models = useSelector((state: RootState) => state.models.models);
  const activeModel = models.find((m: ModelConfig) => m.id === activeModelId);
  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const messages = currentSession?.messages || [];

  const aiServiceRef = useRef<AIService>();

  useEffect(() => {
    if (activeModel) {
      aiServiceRef.current = new AIService(activeModel);
    }
  }, [activeModel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPageContext = async (): Promise<PageContext | undefined> => {
    if (process.env.NODE_ENV === 'development') {
      return {
        url: 'http://localhost:5173',
        title: 'Development Mode',
        selectedText: '',
        mainContent: '',
        metadata: {
          description: '',
          keywords: '',
          author: ''
        }
      };
    }

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab?.id) return undefined;

      const [{result}] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          // 获取选中的文本
          const selectedText = window.getSelection()?.toString() || '';
          
          // 获取主要内容
          const getMainContent = () => {
            // 尝试获取文章主体内容
            const article = document.querySelector('article');
            if (article) return article.innerText;

            // 尝试获取主要内容区域
            const main = document.querySelector('main');
            if (main) return main.innerText;

            // 获取所有段落文本
            const paragraphs = Array.from(document.getElementsByTagName('p'))
              .map(p => p.innerText)
              .filter(text => text.length > 100) // 过滤掉太短的段落
              .join('\n\n');
            if (paragraphs) return paragraphs;

            // 如果都没有，获取 body 的直接文本内容
            return document.body.innerText;
          };

          // 获取元数据
          const getMetadata = () => {
            const metadata: Record<string, string> = {};
            
            // 获取 meta 标签信息
            const metaTags = document.getElementsByTagName('meta');
            for (const meta of metaTags) {
              const name = meta.getAttribute('name');
              const content = meta.getAttribute('content');
              if (name && content) {
                metadata[name] = content;
              }
            }

            return {
              description: metadata.description || '',
              keywords: metadata.keywords || '',
              author: metadata.author || ''
            };
          };

          return {
            selectedText,
            mainContent: getMainContent(),
            metadata: getMetadata()
          };
        }
      });

      return {
        url: currentTab.url || '',
        title: currentTab.title || '',
        selectedText: result.selectedText,
        mainContent: result.mainContent,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Failed to get page context:', error);
      return undefined;
    }
  };

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      antMessage.success('已复制到剪贴板');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      antMessage.error('复制失败');
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedPromptId) return;
    if (!aiServiceRef.current) return;
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    const messageId = crypto.randomUUID();
    
    try {
      const pageContext = await getPageContext();
      const currentMessages = [...messages];
      
      // 如果选择了提示词，添加提示词系统消息
      let selectedPrompt;
      if (selectedPromptId) {
        selectedPrompt = prompts.find(p => p.id === selectedPromptId);
        if (selectedPrompt) {
          let promptContent = selectedPrompt.content;
          
          // 如果提示词有变量，使用用户输入替换变量
          if (selectedPrompt.variables && selectedPrompt.variables.length > 0) {
            selectedPrompt.variables.forEach(variable => {
              const placeholder = `{${variable.name}}`;
              promptContent = promptContent.replace(placeholder, inputValue.trim() || variable.defaultValue || '');
            });
          }
          
          const promptMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'system',
            content: promptContent,
            timestamp: Date.now(),
            status: 'success'
          };
          currentMessages.push(promptMessage);
        }
      }

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: inputValue.trim() || (selectedPrompt ? `执行提示词：${selectedPrompt.title}` : ''),
        timestamp: Date.now(),
        status: 'success'
      };
      
      dispatch(addMessage({ 
        sessionId: activeSessionId!, 
        message: userMessage 
      }));

      // 将用户消息添加到当前消息列表
      currentMessages.push(userMessage);

      // 如果有页面上下文，添加系统消息
      if (pageContext) {
        const contextMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: `当前页面信息：
URL: ${pageContext.url}
标题: ${pageContext.title}
${pageContext.metadata.description ? `描述: ${pageContext.metadata.description}` : ''}
${pageContext.metadata.keywords ? `关键词: ${pageContext.metadata.keywords}` : ''}
${pageContext.metadata.author ? `作者: ${pageContext.metadata.author}` : ''}
${pageContext.selectedText ? `选中文本: ${pageContext.selectedText}` : ''}

页面主要内容:
${pageContext.mainContent}

请基于以上页面内容回答用户的问题。如果问题与页面内容无关，请忽略页面内容直接回答。`,
          timestamp: Date.now(),
          status: 'success'
        };
        currentMessages.push(contextMessage);
      }
      
      // 创建助手消息
      const assistantMessage: ChatMessage = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'streaming'
      };
      
      dispatch(addMessage({ 
        sessionId: activeSessionId!, 
        message: assistantMessage 
      }));

      // 开始流式接收消息
      await aiServiceRef.current.sendMessage(
        currentMessages,
        (content: string) => {
          dispatch(appendMessageContent({
            sessionId: activeSessionId!,
            messageId: messageId,
            content
          }));
        },
        abortControllerRef.current.signal
      );

      // 更新消息状态为完成
      dispatch(updateMessage({
        sessionId: activeSessionId!,
        messageId: messageId,
        updates: { status: 'success' }
      }));

      // 如果使用了提示词，增加使用次数
      if (selectedPromptId) {
        dispatch(incrementUseCount(selectedPromptId));
      }

      setInputValue('');
      setSelectedPromptId(null);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        dispatch(updateMessage({
          sessionId: activeSessionId!,
          messageId: messageId,
          updates: { 
            status: 'success',
            content: messages.find(m => m.id === messageId)?.content + '\n\n[已终止输出]'
          }
        }));
        antMessage.info('已终止输出');
      } else {
        antMessage.error('发送消息失败');
        console.error('Error sending message:', error);
        dispatch(updateMessage({
          sessionId: activeSessionId!,
          messageId: messageId,
          updates: { status: 'error' }
        }));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedPromptId || inputValue.trim()) {
        handleSend();
      }
    }
  };

  const getSortedPrompts = () => {
    return [...prompts].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return b.isFavorite ? 1 : -1;
      }
      return b.useCount - a.useCount;
    });
  };

  return (
    <Layout className="chat-container">
      <div className="messages-list">
        <List
          dataSource={messages}
          renderItem={(message: ChatMessage) => (
            <List.Item
              style={{
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '4px 0',
                border: 'none',
                display: message.role === 'system' ? 'none' : 'flex'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  gap: '8px'
                }}
              >
                <Avatar
                  icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{ 
                    backgroundColor: message.role === 'user' ? '#1677ff' : '#52c41a',
                    flexShrink: 0
                  }}
                  size="small"
                />
                <div className={`message-bubble ${message.role}`}>
                  {message.role === 'assistant' && (
                    <div className="model-indicator">
                      Assistant: {activeModel?.model || '未知模型'}
                    </div>
                  )}
                  <MessageContent content={message.content} />
                  {message.status === 'streaming' && (
                    <span className="typing-indicator">▋</span>
                  )}
                  {message.role === 'assistant' && (
                    <Tooltip title="复制内容">
                      <div 
                        className="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(message.id, message.content);
                        }}
                      >
                        {copiedMessageId === message.id ? 
                          <CheckOutlined style={{ color: '#52c41a' }} /> : 
                          <CopyOutlined />
                        }
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <div className="prompt-select">
          <Select
            placeholder="选择提示词"
            style={{ width: '100%' }}
            value={selectedPromptId}
            onChange={handlePromptSelect}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {getSortedPrompts().map(prompt => (
              <Option key={prompt.id} value={prompt.id}>
                <div className="prompt-option">
                  <span>{prompt.title}</span>
                  {prompt.isFavorite && <StarFilled style={{ color: '#1890ff' }} />}
                  <span className="prompt-use-count">使用: {prompt.useCount}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>
        
        <div style={{ 
          display: 'flex',
          gap: '8px'
        }}>
          <TextArea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedPromptId ? "已选择提示词，请输入具体内容..." : "输入消息..."}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ 
              resize: 'none',
              fontSize: '14px',
              borderRadius: '8px'
            }}
            disabled={isLoading}
          />
          <Button
            type="primary"
            className="send-button"
            icon={isLoading ? <LoadingOutlined className="loading-icon" spin /> : <SendOutlined />}
            onClick={isLoading ? handleStop : handleSend}
            disabled={(!selectedPromptId && !inputValue.trim()) || (isLoading && !abortControllerRef.current)}
            loading={false}
            size="middle"
            style={{
              borderRadius: '8px',
              height: 'auto'
            }}
          />
        </div>
      </div>
    </Layout>
  );
}; 