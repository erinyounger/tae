import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, List, Menu, message, Modal, Input, Select, Spin } from 'antd';
import { StarOutlined, StarFilled, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { Prompt, PromptCategory } from '../../types';
import { 
  toggleFavorite, 
  removePrompt, 
  selectCategory, 
  updatePrompt, 
  addPrompt,
  setSearchQuery,
  setSortBy,
  loadPrompts,
  setLoading,
  setError
} from '../../store/slices/promptSlice';
import { PromptForm } from '../PromptForm';
import { PromptService } from '../../services/promptService';
import './PromptManager.css';

const { Search } = Input;
const { Option } = Select;

// 简化分类，与设计稿保持一致
const categories: { key: PromptCategory; label: string }[] = [
  { key: 'testing', label: '测试' },
  { key: 'development', label: '开发' },
  { key: 'design', label: '设计' },
];

export const PromptManager: React.FC = () => {
  const dispatch = useDispatch();
  const {
    prompts,
    selectedCategory,
    searchQuery,
    sortBy,
    isLoading,
    error
  } = useSelector((state: RootState) => state.prompts);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);

  // 初始化加载提示词
  useEffect(() => {
    const initializePrompts = async () => {
      try {
        dispatch(setLoading(true));
        const savedPrompts = await PromptService.loadPrompts();
        dispatch(loadPrompts(savedPrompts));
      } catch (err) {
        dispatch(setError((err as Error).message));
        message.error('加载提示词失败');
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializePrompts();
  }, [dispatch]);

  // 过滤和排序提示词
  const getFilteredAndSortedPrompts = () => {
    let filtered = selectedCategory === 'all' 
      ? prompts 
      : prompts.filter(p => p.category === selectedCategory);

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return PromptService.sortPrompts(filtered, sortBy);
  };

  const handleCategoryChange = (key: string) => {
    dispatch(selectCategory(key as PromptCategory | 'all'));
  };

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleSortChange = (value: 'useCount' | 'createTime' | 'updateTime') => {
    dispatch(setSortBy(value));
  };

  const handleToggleFavorite = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavorite(promptId));
    message.success('已更新收藏状态');
  };

  const handleDelete = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个提示词吗？',
      onOk: () => {
        dispatch(removePrompt(promptId));
        message.success('删除成功');
      },
    });
  };

  const filteredPrompts = getFilteredAndSortedPrompts();

  return (
    <div className="prompt-manager">
      <div className="prompt-header">
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPrompt(undefined);
            setIsModalVisible(true);
          }}
          className="create-button"
        >
          创建
        </Button>
        <div className="prompt-tools">
          <Search
            placeholder="搜索提示词..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Select
            defaultValue="updateTime"
            style={{ width: 120 }}
            onChange={handleSortChange}
          >
            <Option value="updateTime">最近更新</Option>
            <Option value="createTime">创建时间</Option>
            <Option value="useCount">使用次数</Option>
          </Select>
        </div>
      </div>

      <div className="content-wrapper">
        <Menu
          selectedKeys={[selectedCategory]}
          mode="inline"
          className="category-menu"
          items={[
            { key: 'all', label: '全部' },
            ...categories.map(category => ({
              key: category.key,
              label: category.label
            }))
          ]}
          onClick={({ key }) => handleCategoryChange(key)}
        />

        <div className="prompt-list">
          {isLoading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          ) : (
            <List
              dataSource={filteredPrompts}
              locale={{ emptyText: '暂无提示词' }}
              renderItem={(prompt) => (
                <div
                  key={prompt.id}
                  className="prompt-card"
                  onClick={() => {
                    setEditingPrompt(prompt);
                    setIsModalVisible(true);
                  }}
                >
                  <div className="prompt-title">
                    {prompt.title}
                  </div>
                  <div className="prompt-content">
                    {prompt.content}
                  </div>
                  <div className="prompt-meta">
                    <div className="prompt-tags">
                      {prompt.tags.map(tag => (
                        <span key={tag} className="prompt-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="prompt-info">
                      <span>使用次数: {prompt.useCount}</span>
                    </div>
                  </div>
                  <div className="prompt-actions">
                    <Button
                      type="text"
                      size="small"
                      icon={prompt.isFavorite ? <StarFilled style={{ color: '#1890ff' }} /> : <StarOutlined />}
                      onClick={(e) => handleToggleFavorite(prompt.id, e)}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPrompt(prompt);
                        setIsModalVisible(true);
                      }}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleDelete(prompt.id, e)}
                    />
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      <Modal
        title={editingPrompt ? "编辑提示词" : "新建提示词"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPrompt(undefined);
        }}
        footer={null}
        width={800}
      >
        <PromptForm
          initialValues={editingPrompt}
          onSubmit={async (values) => {
            try {
              if (editingPrompt) {
                dispatch(updatePrompt({
                  ...values,
                  updateTime: Date.now()
                }));
                message.success('提示词更新成功');
              } else {
                dispatch(addPrompt({
                  ...values,
                  id: crypto.randomUUID(),
                  createTime: Date.now(),
                  updateTime: Date.now(),
                  useCount: 0,
                  isFavorite: false
                }));
                message.success('提示词创建成功');
              }
              setIsModalVisible(false);
              setEditingPrompt(undefined);
            } catch (error) {
              console.error('Failed to save prompt:', error);
              message.error('保存失败，请重试');
            }
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingPrompt(undefined);
          }}
        />
      </Modal>
    </div>
  );
}; 