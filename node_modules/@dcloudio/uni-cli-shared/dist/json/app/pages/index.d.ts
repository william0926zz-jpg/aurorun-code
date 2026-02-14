export { staticImportPageCode } from './definePage';
export declare function normalizeAppPagesJson(pagesJson: Record<string, any>, platform?: UniApp.PLATFORM, dynamicImport?: boolean): string;
export declare function normalizeAppNVuePagesJson(pagesJson: Record<string, any>): string;
export declare function normalizeAppConfigService(pagesJson: UniApp.PagesJson, manifestJson: Record<string, any>): string;
