import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Tag, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Prompt, PromptCategory, PromptVariable } from '../../types';
import MarkdownEditor from '../MarkdownEditor';

interface PromptFormProps {
  initialValues?: Prompt;
  onSubmit: (values: Prompt) => void;
  onCancel: () => void;
}

const { Option } = Select;

const categories: { key: PromptCategory; label: string }[] = [
  { key: 'development', label: '开发' },
  { key: 'testing', label: '测试' },
  { key: 'design', label: '设计' },
  { key: 'general', label: '通用' },
  { key: 'custom', label: '自定义' },
];

export const PromptForm: React.FC<PromptFormProps> = ({
  initialValues,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>(initialValues?.tags || []);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [variables, setVariables] = useState<PromptVariable[]>(
    initialValues?.variables || []
  );

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        content: initialValues.content,
        category: initialValues.category
      });
    } else {
      form.resetFields();
      setTags([]);
      setVariables([]);
    }
  }, [form, initialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      const promptData: Prompt = {
        id: initialValues?.id || crypto.randomUUID(),
        ...values,
        tags,
        variables,
        createTime: initialValues?.createTime || Date.now(),
        updateTime: Date.now(),
        useCount: initialValues?.useCount || 0,
        isFavorite: initialValues?.isFavorite || false,
        isActive: initialValues?.isActive || true,
      };
      console.log('Submitting prompt data:', promptData);
      onSubmit(promptData);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
      setInputValue('');
    }
    setInputVisible(false);
  };

  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleRemoveVariable = (name: string) => {
    setVariables(variables.filter(v => v.name !== name));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
      onValuesChange={(changedValues, allValues) => {
        console.log('Form values changed:', changedValues, allValues);
      }}
    >
      <Form.Item
        name="title"
        label="标题"
        rules={[{ required: true, message: '请输入提示词标题' }]}
      >
        <Input placeholder="输入提示词标题" />
      </Form.Item>

      <Form.Item
        name="content"
        label="内容"
        rules={[{ required: true, message: '请输入提示词内容' }]}
      >
        <MarkdownEditor />
      </Form.Item>

      <Form.Item
        name="category"
        label="分类"
        rules={[{ required: true, message: '请选择分类' }]}
      >
        <Select placeholder="选择分类">
          {categories.map(category => (
            <Option key={category.key} value={category.key}>
              {category.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="标签">
        <Space wrap>
          {tags.map(tag => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
            >
              {tag}
            </Tag>
          ))}
          {inputVisible ? (
            <Input
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleAddTag}
              onPressEnter={handleAddTag}
              autoFocus
            />
          ) : (
            <Tag onClick={() => setInputVisible(true)} style={{ cursor: 'pointer' }}>
              <PlusOutlined /> 新建标签
            </Tag>
          )}
        </Space>
      </Form.Item>

      <Form.Item label="变量">
        <Space direction="vertical" style={{ width: '100%' }}>
          {variables.map(variable => (
            <Tag
              key={variable.name}
              closable
              onClose={() => handleRemoveVariable(variable.name)}
              color={variable.required ? 'blue' : undefined}
            >
              <Tooltip title={variable.description}>
                {variable.name}
                {variable.required && ' *'}
              </Tooltip>
            </Tag>
          ))}
        </Space>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            {initialValues ? '更新' : '创建'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}; 