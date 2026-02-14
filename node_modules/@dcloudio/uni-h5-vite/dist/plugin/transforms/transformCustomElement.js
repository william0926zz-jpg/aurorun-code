"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCustomElement = void 0;
const compiler_core_1 = require("@vue/compiler-core");
const uni_shared_1 = require("@dcloudio/uni-shared");
const transformCustomElement = (node, context) => {
    if (!!node &&
        node.type === compiler_core_1.NodeTypes.ELEMENT &&
        uni_shared_1.UVUE_WEB_BUILT_IN_CUSTOM_ELEMENTS.includes(node.tag)) {
        node.tag = `$UniCustomElement$${node.tag}`;
    }
};
exports.transformCustomElement = transformCustomElement;
