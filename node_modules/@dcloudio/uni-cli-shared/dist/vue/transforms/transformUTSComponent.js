"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUTSComponent = void 0;
const ast_1 = require("../../vite/utils/ast");
const utsUtils_1 = require("../../utsUtils");
const uts_1 = require("../../uts");
/**
 * 将uts组件保存到自定义组件列表中
 * @param node
 * @param context
 * @returns
 */
const transformUTSComponent = (node, context) => {
    if (!(0, ast_1.isElementNode)(node)) {
        return;
    }
    // @ts-expect-error 同时兼容 vapor 编译器
    const components = context.component || context.components;
    if (!components) {
        return;
    }
    // 1. 增加components，让sfc生成resolveComponent代码
    // 2. easycom插件会根据resolveComponent生成import插件代码触发编译
    const utsCustomElement = (0, uts_1.getUTSCustomElement)(node.tag);
    if (utsCustomElement) {
        components.add(node.tag);
    }
    else if ((0, utsUtils_1.matchUTSComponent)(node.tag)) {
        if (!components.has(node.tag)) {
            components.add(node.tag);
        }
    }
};
exports.transformUTSComponent = transformUTSComponent;
