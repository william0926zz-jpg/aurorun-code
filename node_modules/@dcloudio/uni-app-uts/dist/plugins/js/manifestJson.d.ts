import type { Plugin } from 'vite';
export declare function getOutputManifestJson(): Record<string, any> | undefined;
export declare function uniAppManifestPlugin(platform: 'app-ios' | 'app-harmony'): Plugin;
