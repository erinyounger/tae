import { ErrorInfo, ErrorType } from '../types/error';

export class ErrorHandler {
  static handleError(error: ErrorInfo): void {
    console.error(`Error occurred: ${error.type}`, error);
    
    // 根据错误类型处理
    switch (error.type) {
      case ErrorType.API_TIMEOUT:
        // 处理超时
        break;
      case ErrorType.API_RATE_LIMIT:
        // 处理限流
        break;
      default:
        // 默认错误处理
        break;
    }
  }
} 