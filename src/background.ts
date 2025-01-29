// 监听扩展安装或更新
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// 监听扩展图标点击
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    // 打开侧边栏
    await chrome.sidePanel.open({ tabId: tab.id });
    
    // 注入内容脚本以获取页面信息
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // 监听选中文本变化
        document.addEventListener('selectionchange', () => {
          const selectedText = window.getSelection()?.toString() || '';
          chrome.runtime.sendMessage({ 
            type: 'TEXT_SELECTED', 
            data: selectedText 
          });
        });
      }
    });
  } catch (error) {
    console.error('Failed to handle click:', error);
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Received message:', request);
  sendResponse({ status: 'ok' });
}); 