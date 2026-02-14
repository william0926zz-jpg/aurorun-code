import type { Plugin } from 'vite';
import type { UniXCompiler } from '@dcloudio/uni-uts-v1';
export declare function getWorkers(): Record<string, string>;
export declare function resolveWorkersRootDir(): string;
export declare function getWorkersRootDirs(): string[];
/**
 * 遍历目录下的所有uts文件，读取文件内容，正则匹配出定义的worker，返回文件名和类名的映射关系
 * export class MyWorkerTask extends WorkerTaskImpl {}
 * @param dir
 */
export declare function initWorkers(workersDirs: string[], rootDir: string): Record<string, string>;
export declare function uniWorkersPlugin(): Plugin;
export declare function resolveWorkersDir(inputDir: string): Array<string>;
export declare function uniJavaScriptWorkersPlugin(): Plugin;
export declare function initUniXCompilerRootWorkers(rootDir: string, compiler: UniXCompiler): Promise<void>;
