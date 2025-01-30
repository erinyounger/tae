import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadSessions } from '../../store/slices/chatSlice';
import { loadPrompts } from '../../store/slices/promptSlice';
import { SessionService } from '../../services/sessionService';
import { StorageService } from '../../services/storageService';
import { PromptService } from '../../services/promptService';
import { loadModels } from '../../store/slices/modelSlice';
import { message } from 'antd';

export const AppInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 加载保存的会话
        const savedSessions = await SessionService.loadSessions();
        if (savedSessions && savedSessions.length > 0) {
          dispatch(loadSessions(savedSessions));
          console.log('Successfully loaded', savedSessions.length, 'sessions');
        } else {
          console.log('No saved sessions found');
        }

        // 加载保存的模型列表
        const savedModels = await StorageService.loadModels();
        if (savedModels && savedModels.length > 0) {
          console.log('Loading saved models:', savedModels);
          dispatch(loadModels(savedModels));
        } else {
          console.log('No saved models found');
        }

        // 加载保存的提示词
        const savedPrompts = await PromptService.loadPrompts();
        if (savedPrompts && savedPrompts.length > 0) {
          console.log('Loading saved prompts:', savedPrompts);
          dispatch(loadPrompts(savedPrompts));
        } else {
          console.log('No saved prompts found');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        message.error('初始化失败，请刷新页面重试');
      }
    };

    initializeApp();
  }, [dispatch]);

  return null;
}; 