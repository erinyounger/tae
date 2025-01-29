/// <reference types="chrome"/>

declare namespace chrome {
  export const runtime: typeof chrome.runtime;
  export const tabs: typeof chrome.tabs;
  export const scripting: typeof chrome.scripting;
  export const storage: typeof chrome.storage;
  export const action: typeof chrome.action;
  export const sidePanel: {
    open: (options: { tabId?: number }) => Promise<void>;
  };
} 