import React, { useState } from 'react';
import { Button, Form, Input, List, Modal, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addModel, updateModel, removeModel, setActiveModel } from '../../store/slices/modelSlice';
import { ModelConfig } from '../../types';
import { StorageService } from '../../services/storageService';

interface ModelFormData {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export const ModelManager: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [form] = Form.useForm<ModelFormData>();
  
  const dispatch = useDispatch();
  const models = useSelector((state: RootState) => state.models.models);
  const activeModelId = useSelector((state: RootState) => state.models.activeModelId);

  const handleAddModel = () => {
    setEditingModel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model);
    form.setFieldsValue(model);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const modelData: ModelConfig = {
        id: editingModel?.id || crypto.randomUUID(),
        ...values,
        isActive: false
      };

      let updatedModels: ModelConfig[];
      if (editingModel) {
        // 更新现有模型
        updatedModels = models.map((m: ModelConfig) => 
          m.id === modelData.id ? { ...modelData, isActive: m.isActive } : m
        );
      } else {
        // 添加新模型
        updatedModels = [...models, modelData];
        // 如果是第一个模型，设置为活动模型
        if (updatedModels.length === 1) {
          updatedModels[0].isActive = true;
        }
      }

      // 先保存到存储
      try {
        console.log('Saving models to storage:', updatedModels);
        await StorageService.saveModels(updatedModels);

        // 更新 Redux store
        if (editingModel) {
          dispatch(updateModel(modelData));
        } else {
          dispatch(addModel(modelData));
        }
        
        setIsModalVisible(false);
        message.success(`${editingModel ? '更新' : '添加'}模型成功`);
      } catch (error) {
        console.error('Failed to save models:', error);
        message.error('保存模型失败，请重试');
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleRemoveModel = async (modelId: string) => {
    try {
      const updatedModels = models.filter((m: ModelConfig) => m.id !== modelId);
      dispatch(removeModel(modelId));
      await StorageService.saveModels(updatedModels);
      message.success('删除模型成功');
    } catch (error) {
      console.error('Failed to remove model:', error);
      message.error('删除模型失败，请重试');
    }
  };

  const handleSetActive = async (modelId: string) => {
    try {
      console.log('Setting active model:', modelId);
      
      // 更新所有模型的 isActive 状态
      const updatedModels = models.map((m: ModelConfig) => ({
        ...m,
        isActive: m.id === modelId
      }));

      // 先保存到存储
      console.log('Saving updated models with new active state:', updatedModels);
      await StorageService.saveModels(updatedModels);

      // 更新 Redux store
      dispatch(setActiveModel(modelId));
      
      message.success('已切换当前使用的模型');
    } catch (error) {
      console.error('Failed to set active model:', error);
      message.error('设置当前模型失败，请重试');
    }
  };

  return (
    <div>
      <Button type="primary" onClick={handleAddModel} style={{ marginBottom: 16 }}>
        添加模型
      </Button>

      <List
        dataSource={models}
        renderItem={(model: ModelConfig) => (
          <List.Item
            actions={[
              <Button
                type={model.id === activeModelId ? 'primary' : 'default'}
                onClick={() => handleSetActive(model.id)}
              >
                {model.id === activeModelId ? '当前使用' : '使用'}
              </Button>,
              <Button onClick={() => handleEditModel(model)}>编辑</Button>,
              <Button danger onClick={() => handleRemoveModel(model.id)}>删除</Button>
            ]}
          >
            <List.Item.Meta
              title={model.model}
              description={model.baseUrl}
            />
          </List.Item>
        )}
      />

      <Modal
        title={`${editingModel ? '编辑' : '添加'}模型`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="model"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：gpt-4" />
          </Form.Item>

          <Form.Item
            name="baseUrl"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="例如：https://api.openai.com/v1" />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="输入API密钥" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}; 