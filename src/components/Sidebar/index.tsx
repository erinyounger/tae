import React, { useState } from 'react';
import { Layout, Button, List, Popconfirm, message, Tabs } from 'antd';
import { MessageOutlined, PlusOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addSession, removeSession, setActiveSession } from '../../store/slices/chatSlice';
import { SessionService } from '../../services/sessionService';
import { ChatSession } from '../../types';
import { PromptManager } from '../PromptManager';
import './index.css';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const dispatch = useDispatch();
  const sessions = useSelector((state: RootState) => state.chat.sessions);
  const activeSessionId = useSelector((state: RootState) => state.chat.activeSessionId);

  const handleNewSession = async () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      dispatch(addSession(newSession));
      const updatedSessions = [...sessions, newSession];
      await SessionService.saveSessions(updatedSessions);
    } catch (error) {
      console.error('Failed to create new session:', error);
      message.error('新建会话失败，请重试');
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    try {
      dispatch(removeSession(sessionId));
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      await SessionService.saveSessions(updatedSessions);
    } catch (error) {
      console.error('Failed to remove session:', error);
      message.error('删除会话失败，请重试');
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      dispatch(setActiveSession(sessionId));
      await SessionService.saveSessions(sessions);
    } catch (error) {
      console.error('Failed to select session:', error);
      message.error('切换会话失败，请重试');
    }
  };

  const getLastMessage = (session: ChatSession) => {
    if (session.messages.length === 0) return '';
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.content.length > 30 
      ? lastMessage.content.slice(0, 30) + '...'
      : lastMessage.content;
  };

  return (
    <Layout.Sider 
      width={320} 
      theme="light"
      style={{ 
        height: '100vh',
        borderRight: '1px solid #e8e8e8',
        backgroundColor: '#ffffff'
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        style={{ height: '100%' }}
        items={[
          {
            key: 'chats',
            label: (
              <span>
                <MessageOutlined />
                会话
              </span>
            ),
            children: (
              <div style={{ 
                height: 'calc(100vh - 56px)',
                display: 'flex',
                flexDirection: 'column',
                padding: '12px'
              }}>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={handleNewSession}
                  style={{ 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    border: '1px dashed #d9d9d9',
                    borderRadius: '6px',
                    color: '#666'
                  }}
                >
                  新建对话
                </Button>

                <div style={{ flex: 1, overflow: 'auto' }}>
                  <List
                    dataSource={sessions}
                    renderItem={session => (
                      <List.Item
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        className="session-item"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: session.id === activeSessionId ? '#f5f5f5' : 'transparent',
                          borderRadius: '6px',
                          padding: '8px',
                          marginBottom: '4px'
                        }}
                        actions={[
                          <Popconfirm
                            key="delete"
                            title="确定要删除这个会话吗？"
                            onConfirm={(e) => {
                              e?.stopPropagation();
                              handleRemoveSession(session.id);
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                          >
                            <DeleteOutlined
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#999' }}
                            />
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<MessageOutlined style={{ color: '#666' }} />}
                          title={session.title || '新对话'}
                          description={getLastMessage(session) || '暂无消息'}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            )
          },
          {
            key: 'prompts',
            label: (
              <span>
                <BookOutlined />
                提示词
              </span>
            ),
            children: <PromptManager />
          }
        ]}
      />
    </Layout.Sider>
  );
} 