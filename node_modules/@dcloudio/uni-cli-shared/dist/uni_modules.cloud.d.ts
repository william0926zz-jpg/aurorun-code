export declare function genEncryptEasyComModuleCode(pluginId: string, platform: typeof process.env.UNI_UTS_PLATFORM, components: Record<string, '.vue' | '.uvue'>): string;
export declare function genEncryptUTSModuleCode(module: string, inputDir: string, platform: typeof process.env.UNI_UTS_PLATFORM): string;
export declare function parseUniModulesWithComponents(inputDir: string, platform: typeof process.env.UNI_UTS_PLATFORM): Record<string, string>;
/**
 * 解析 easyCom 组件列表
 * @param pluginId
 * @param inputDir
 * @returns
 */
export declare function parseEasyComComponents(pluginId: string, inputDir: string, detectBinary?: boolean): Record<string, ".vue" | ".uvue">;
/**
 * 查找所有需要云编译的加密插件 uni_modules
 * 支持云编译的插件类型
 * 1. 前端加密组件components
 * 2. 非 app-android/app-ios 平台的 utssdk 插件(app-android/app-ios 平台需要自定义基座，不支持云编译)
 * 目前 utssdk 插件 和 前端加密组件是互斥的
 * @param platform
 * @param inputDir
 * @param cacheDir
 * @returns
 */
export declare function findCloudEncryptUniModules(platform: typeof process.env.UNI_UTS_PLATFORM, inputDir: string, cacheDir?: string, sdkType?: CloudCompileSdkType): Record<string, EncryptPackageJson | undefined>;
export declare function findUploadEncryptUniModulesFiles(uniModules: Record<string, EncryptPackageJson | undefined>, platform: typeof process.env.UNI_UTS_PLATFORM, inputDir: string): Record<string, string[]>;
export declare function packUploadEncryptUniModules(uniModules: Record<string, EncryptPackageJson | undefined>, platform: typeof process.env.UNI_UTS_PLATFORM, inputDir: string, cacheDir: string): {
    zipFile: string;
    modules: string[];
};
export interface EncryptPackageJson {
    id: string;
    version: string;
    uni_modules: {
        dependencies: string[];
        artifacts: {
            env: {
                compilerVersion: string;
            } & Record<string, any>;
            apis: string[];
            components: string[];
            scopedSlots: string[];
            customElements: {
                name: string;
                class: string;
            }[];
            declaration: string;
        };
    };
}
export declare function initCheckEnv(): Record<string, string>;
export declare function resolveEncryptUniModule(id: string, platform: typeof process.env.UNI_UTS_PLATFORM, isX?: boolean): string | undefined;
type CloudCompileSdkType = 'utssdk' | 'easycom' | 'all';
export interface CloudCompileParams {
    mode: 'development' | 'production';
    packType: 'debug' | 'release';
    compilerVersion: string;
    appid: string;
    appname: string;
    platform: typeof process.env.UNI_UTS_PLATFORM;
    'uni-app-x': boolean;
    env: Record<string, string>;
}
export declare function checkEncryptUniModules(inputDir: string, params: CloudCompileParams, sdkType?: CloudCompileSdkType): Promise<{} | undefined>;
export declare function getUniModulesEncryptType(pluginId: string): "" | "utssdk" | "easycom" | undefined;
export declare function parseUniModulesArtifacts(): {
    name: string;
    package: string;
    scopedSlots: string[];
    declaration: string;
}[];
export declare function virtualComponentPath(filepath: string): string;
export {};
