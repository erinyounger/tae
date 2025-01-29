import React, { useState } from 'react';
import { Layout, Button, ConfigProvider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Settings } from './components/Settings';
import { AppInitializer } from './components/AppInitializer';
import { useSelector } from 'react-redux';
import { RootState } from './store';

const App: React.FC = () => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const activeSessionId = useSelector((state: RootState) => state.chat.activeSessionId);

  return (
    <ConfigProvider locale={zhCN}>
      <AppInitializer />
      <Layout style={{ height: '100vh' }}>
        <Layout.Header style={{ 
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
        </Layout.Header>

        <Layout style={{ height: 'calc(100vh - 64px)' }}>
          <Layout.Sider width={250} theme="light" style={{ 
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'auto'
          }}>
            <Sidebar />
          </Layout.Sider>

          <Layout.Content style={{ height: '100%', overflow: 'auto' }}>
            {activeSessionId ? (
              <ChatWindow />
            ) : (
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
                  有什么可以帮你的吗？
                </div>
              </div>
            )}
          </Layout.Content>
        </Layout>

        <Settings
          open={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default App; 