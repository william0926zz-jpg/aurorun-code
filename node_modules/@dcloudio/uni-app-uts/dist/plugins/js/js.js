"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniAppJsPlugin = void 0;
const estree_walker_1 = require("estree-walker");
const parser_1 = require("@babel/parser");
function uniAppJsPlugin(resolvedConfig) {
    return {
        name: 'uni:app-js',
        async transform(source, filename) {
            if (!filename.endsWith('.js')) {
                return;
            }
            const parseResult = (0, parser_1.parse)(source, {
                sourceType: 'module',
            });
            const program = parseResult.program;
            const uniExtApis = new Set();
            (0, estree_walker_1.walk)(program, {
                enter(node) {
                    if (node.type === 'CallExpression' &&
                        node.callee.type === 'MemberExpression') {
                        const callee = node.callee;
                        if (callee.object.type === 'Identifier' &&
                            (callee.object.name === 'uni' ||
                                callee.object.name === 'uniCloud') &&
                            callee.property.type === 'Identifier') {
                            uniExtApis.add(callee.object.name + '.' + callee.property.name);
                        }
                    }
                },
            });
            // 强行解除uniCloud对uni-push的依赖关系
            if (filename.endsWith('uni-cloud-x.es.js')) {
                uniExtApis.delete('uni.getPushClientId');
                uniExtApis.delete('uni.onPushMessage');
                uniExtApis.delete('uni.offPushMessage');
            }
            return {
                code: source,
                map: { mappings: '' },
                meta: { uniExtApis: Array.from(uniExtApis) },
            };
        },
    };
}
exports.uniAppJsPlugin = uniAppJsPlugin;
