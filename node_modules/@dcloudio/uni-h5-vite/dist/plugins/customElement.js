"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniCustomElementPlugin = void 0;
const shared_1 = require("@vue/shared");
const uni_shared_1 = require("@dcloudio/uni-shared");
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const H5_COMPONENTS_PATH = '@dcloudio/uni-h5';
function uniCustomElementPlugin() {
    return {
        name: 'uni:h5-custom-element',
        transform(code, id) {
            if (!(0, uni_cli_shared_1.isVueSfcFile)(id)) {
                return;
            }
            if (!code.includes('$UniCustomElement$')) {
                return;
            }
            const importSpecifiers = [];
            code = code.replace(/['|"]\$UniCustomElement\$([\w|-]+)['|"]/g, (_, name) => {
                if (!uni_shared_1.UVUE_WEB_BUILT_IN_CUSTOM_ELEMENTS.includes(name)) {
                    return _;
                }
                const elementName = (0, shared_1.capitalize)((0, shared_1.camelize)(name));
                const localName = '_' + elementName + 'Element';
                importSpecifiers.push(`${elementName} as ${localName}`);
                return localName;
            });
            if (importSpecifiers.length) {
                code =
                    `import {${importSpecifiers.join(',')}} from "${H5_COMPONENTS_PATH}";` + code;
            }
            return {
                code,
                map: null,
            };
        },
    };
}
exports.uniCustomElementPlugin = uniCustomElementPlugin;
