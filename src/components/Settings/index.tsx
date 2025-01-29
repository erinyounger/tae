import React from 'react';
import { Modal } from 'antd';
import { ModelManager } from '../ModelManager';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ open, onClose }) => {
  return (
    <Modal
      title="设置"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <ModelManager />
    </Modal>
  );
}; 