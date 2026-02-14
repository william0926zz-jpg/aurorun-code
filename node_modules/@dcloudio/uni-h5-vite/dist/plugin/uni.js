"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUni = exports.compilerOptions = void 0;
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const uni_shared_1 = require("@dcloudio/uni-shared");
const transformCustomElement_1 = require("./transforms/transformCustomElement");
function realIsH5CustomElement(tag) {
    // TODO isH5CustomElement目前被多个平台引用，重构比较麻烦
    if (process.env.UNI_APP_X === 'true' &&
        uni_shared_1.UVUE_WEB_BUILT_IN_CUSTOM_ELEMENTS.includes(tag)) {
        return true;
    }
    return (0, uni_shared_1.isH5CustomElement)(tag, process.env.UNI_APP_X === 'true');
}
const nodeTransforms = [
    uni_cli_shared_1.transformRefresherSlot,
    uni_cli_shared_1.transformH5BuiltInComponents,
    uni_cli_shared_1.transformTapToClick,
    uni_cli_shared_1.transformMatchMedia,
    uni_cli_shared_1.transformPageHead,
];
if (process.env.UNI_APP_X === 'true') {
    nodeTransforms.splice(nodeTransforms.indexOf(uni_cli_shared_1.transformMatchMedia), 1);
    nodeTransforms.push(transformCustomElement_1.transformCustomElement);
}
exports.compilerOptions = {
    isNativeTag: uni_shared_1.isH5NativeTag,
    isCustomElement: realIsH5CustomElement,
    nodeTransforms,
};
function createUni() {
    return {
        copyOptions: {
            assets: ['hybrid/html/**/*', 'uni_modules/*/hybrid/html/**/*'],
        },
        compilerOptions: exports.compilerOptions,
        jsxOptions: {
            babelPlugins: [uni_cli_shared_1.transformUniH5Jsx],
        },
    };
}
exports.createUni = createUni;
