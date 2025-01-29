import { useState, forwardRef } from 'react';
import { Tabs, Input } from 'antd';
import ReactMarkdown from 'react-markdown';
import './index.css';

const { TextArea } = Input;

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  ({ value = '', onChange }, ref) => {
    const [activeTab, setActiveTab] = useState('edit');

    const handleChange = (newValue: string) => {
      onChange?.(newValue);
    };

    return (
      <div className="markdown-editor">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'edit',
              label: '编辑',
              children: (
                <TextArea
                  ref={ref}
                  value={value}
                  onChange={e => handleChange(e.target.value)}
                  placeholder="支持 Markdown 格式"
                  autoSize={{ minRows: 10, maxRows: 20 }}
                />
              ),
            },
            {
              key: 'preview',
              label: '预览',
              children: (
                <div className="markdown-preview">
                  <ReactMarkdown>{value || ''}</ReactMarkdown>
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor; 