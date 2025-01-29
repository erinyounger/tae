import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ChatWindow } from '../ChatWindow';
import { Settings } from '../Settings';
import { Sidebar } from '../Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Header } = Layout;

const AppLayout: React.FC = () => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const activeSessionId = useSelector((state: RootState) => state.chat.activeSessionId);

  const renderChatContent = () => {
    if (activeSessionId) {
      return <ChatWindow />;
    }
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        color: '#666',
        padding: '0 20px',
        textAlign: 'center',
        gap: '12px'
      }}>
        <img 
          src="/icons/icon128.png" 
          alt="Logo" 
          style={{ width: '48px', height: '48px', marginBottom: '8px' }}
        />
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          BrainyAI
        </div>
        <div style={{ fontSize: '14px' }}>
          How can I assist you now?
        </div>
      </div>
    );
  };

  return (
    <Layout hasSider style={{ height: '100vh' }}>
      <Sidebar />
      <Layout style={{ position: 'relative' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsSettingsVisible(true)}
          >
            设置
          </Button>
        </Header>
        <Layout.Content style={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
          {renderChatContent()}
        </Layout.Content>
      </Layout>

      <Settings
        open={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </Layout>
  );
};

export default AppLayout; 