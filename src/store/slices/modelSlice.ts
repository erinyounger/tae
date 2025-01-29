import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModelConfig, ModelConfigs } from '../../types';

interface ModelState {
  models: ModelConfigs;
  activeModelId: string | null;
}

const initialState: ModelState = {
  models: [],
  activeModelId: null
};

const modelSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    addModel: (state, action: PayloadAction<ModelConfig>) => {
      console.log('Adding model:', action.payload);
      state.models.push(action.payload);
      // 如果是第一个模型，自动设置为活动模型
      if (state.models.length === 1) {
        state.activeModelId = action.payload.id;
      }
    },
    updateModel: (state, action: PayloadAction<ModelConfig>) => {
      console.log('Updating model:', action.payload);
      const index = state.models.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.models[index] = action.payload;
      }
    },
    removeModel: (state, action: PayloadAction<string>) => {
      console.log('Removing model:', action.payload);
      state.models = state.models.filter(m => m.id !== action.payload);
      if (state.activeModelId === action.payload) {
        state.activeModelId = state.models[0]?.id || null;
      }
    },
    setActiveModel: (state, action: PayloadAction<string>) => {
      console.log('Setting active model:', action.payload);
      // 更新 activeModelId
      state.activeModelId = action.payload;
      // 同时更新所有模型的 isActive 状态
      state.models = state.models.map(model => ({
        ...model,
        isActive: model.id === action.payload
      }));
    },
    loadModels: (state, action: PayloadAction<ModelConfigs>) => {
      console.log('Loading models:', action.payload);
      state.models = action.payload;
      
      // 查找已保存的活动模型
      const activeModel = action.payload.find(model => model.isActive);
      
      if (activeModel) {
        // 如果找到已保存的活动模型，使用它的 ID
        state.activeModelId = activeModel.id;
      } else if (action.payload.length > 0) {
        // 如果没有活动模型但有模型列表，设置第一个为活动模型
        state.activeModelId = action.payload[0].id;
        state.models = state.models.map((model, index) => ({
          ...model,
          isActive: index === 0
        }));
      } else {
        state.activeModelId = null;
      }
    }
  }
});

export const { addModel, updateModel, removeModel, setActiveModel, loadModels } = modelSlice.actions;
export default modelSlice.reducer; 