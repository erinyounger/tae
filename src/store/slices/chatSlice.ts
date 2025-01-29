import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatSession, ChatMessage } from '../../types';
import { SessionService } from '../../services/sessionService';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
}

const generateSessionTitle = (content: string): string => {
  // 从内容中提取前20个字符作为标题
  const title = content.trim().slice(0, 20);
  return title + (content.length > 20 ? '...' : '');
};

const initialState: ChatState = {
  sessions: [],
  activeSessionId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addSession: (state, action: PayloadAction<ChatSession>) => {
      state.sessions.unshift(action.payload);
      state.activeSessionId = action.payload.id;
      SessionService.saveSessions(state.sessions);
    },
    updateSession: (state, action: PayloadAction<{ id: string; updates: Partial<ChatSession> }>) => {
      const session = state.sessions.find(s => s.id === action.payload.id);
      if (session) {
        Object.assign(session, action.payload.updates);
        SessionService.saveSessions(state.sessions);
      }
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions[0]?.id || null;
      }
      SessionService.saveSessions(state.sessions);
    },
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
      SessionService.saveSessions(state.sessions);
    },
    addMessage: (state, action: PayloadAction<{ sessionId: string; message: ChatMessage }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.messages.push(action.payload.message);
        // 如果是会话的第一条消息，且是用户发送的，则更新会话标题
        if (session.messages.length === 1 && action.payload.message.role === 'user') {
          session.title = generateSessionTitle(action.payload.message.content);
        }
        session.updatedAt = Date.now();
        SessionService.saveSessions(state.sessions);
      }
    },
    updateMessage: (state, action: PayloadAction<{
      sessionId: string;
      messageId: string;
      updates: Partial<ChatMessage>;
    }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        const message = session.messages.find(m => m.id === action.payload.messageId);
        if (message) {
          Object.assign(message, action.payload.updates);
          session.updatedAt = Date.now();
          SessionService.saveSessions(state.sessions);
        }
      }
    },
    appendMessageContent: (state, action: PayloadAction<{
      sessionId: string;
      messageId: string;
      content: string;
    }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        const message = session.messages.find(m => m.id === action.payload.messageId);
        if (message) {
          message.content += action.payload.content;
          session.updatedAt = Date.now();
          SessionService.saveSessions(state.sessions);
        }
      }
    },
    loadSessions: (state, action: PayloadAction<ChatSession[]>) => {
      state.sessions = action.payload;
      if (!state.activeSessionId && action.payload.length > 0) {
        state.activeSessionId = action.payload[0].id;
      }
    },
  },
});

export const {
  addSession,
  updateSession,
  removeSession,
  setActiveSession,
  addMessage,
  updateMessage,
  appendMessageContent,
  loadSessions,
} = chatSlice.actions;

export default chatSlice.reducer; 