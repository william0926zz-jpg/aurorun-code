import type { BindingMetadata, SFCDescriptor } from '@vue/compiler-sfc';
import type { ScriptCompileContext } from './context';
import type { TransformPluginContext } from 'rollup';
export declare function processNormalScript(ctx: ScriptCompileContext, _scopeId: string): import("@vue/compiler-sfc").SFCScriptBlock;
export declare function processTemplate(sfc: SFCDescriptor, { relativeFilename, bindingMetadata, className, rootDir, sourceMap, }: {
    relativeFilename: string;
    bindingMetadata?: BindingMetadata;
    className: string;
    rootDir: string;
    sourceMap?: boolean;
}, pluginContext?: TransformPluginContext): {
    code: string;
    map: import("source-map-js").RawSourceMap | undefined;
    preamble: string | undefined;
    preambleMap: import("source-map-js").RawSourceMap | undefined;
};
