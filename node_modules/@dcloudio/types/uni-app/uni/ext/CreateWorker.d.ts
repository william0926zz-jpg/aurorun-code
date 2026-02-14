declare namespace UniNamespace {
  // 监听消息Callback
  type WorkerOnMessageCallback = (message: any) => void;
  // Worker错误callback
  type WorkerOnErrorCallback = (error: any) => void;

  interface WorkerOptions {
    /**
     * 可转移对象数组，默认值为空数组
     * 仅鸿蒙、web平台支持，参考：https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Transferable_objects
     */
    transfer?: any[];
  }

  // Worker对象
  interface Worker {
    onMessage(listener: WorkerOnMessageCallback): void;
    onError(listener: WorkerOnErrorCallback): void;
    postMessage(message: any, options?: WorkerOptions): void;
    terminate(): void;
  }
}

interface Uni {
  createWorker(url: string): UniNamespace.Worker;
}
