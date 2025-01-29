# Testing AI Extension

A Chrome extension for testing AI capabilities, built with React, TypeScript, and Vite.

## Features

1. Model Management:
- Add, edit, and delete model configurations
- Switch between different models
- Local storage for model configurations
- Auto-load saved configurations on page refresh

2. Session Management:
- Create new chat sessions
- Auto-generate session titles from first message
- Delete sessions
- Local storage for chat history
- Auto-load chat history on page refresh

3. Chat Features:
- Chat with selected AI model
- Display sending status
- Error handling and notifications
- Markdown message rendering

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint
```

## Project Structure

```
src/
  ├── components/      # React components
  ├── services/        # Service classes
  ├── store/          # Redux store and slices
  ├── types/          # TypeScript type definitions
  ├── background.ts   # Extension background script
  └── index.tsx       # Main entry point
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## 项目简介
一个Chrome浏览器AI助手插件，支持在浏览器页面中进行AI对话，辅助人类日常工作，使用领域包含：软件测试、软件开发、软件设计场景等。

## 项目目标
1、支持对浏览器当前页面进行对话，如总结、翻译、解释、提问等。
2、支持对提示词的管理，如添加、删除、编辑，对话时，支持选择不同的提示词；
3、模型支持配置OpenAI API兼容的模型，如Chatgpt、DeepSeek、ChatGPT等模型；
4、支持对对话记录的管理，如添加、删除、编辑、导入、导出等；

## 参考项目：
https://github.com/luyu0279/BrainyAI

## 项目架构
使用主流通用的Chrom开发框架，界面美观，设计简洁，符合人类日常工作习惯，界面重点参考BrainyAI开源项目；

## 约束
1、数据全部本地化管理，不使用任何云端服务，不使用任何第三方服务；
2、开源预留数据云端管理扩展接口，方便后续扩展，当前只实现本地化存储；
3、模型信息只需要：模型名称、API地址、API Key，其他信息不需要；
