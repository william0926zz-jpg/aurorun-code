"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceExtApiPagePaths = void 0;
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const path_1 = __importDefault(require("path"));
function replaceExtApiPagePaths() {
    const pagePaths = (0, uni_cli_shared_1.getUniXPagePaths)();
    const systemPagePaths = pagePaths.reduce((acc, pagePath) => {
        acc['/' + pagePath] = `uni:${path_1.default.basename(pagePath)}`;
        return acc;
    }, {});
    return {
        name: 'uni:replace-page-paths',
        generateBundle(_, bundle) {
            if (Object.keys(systemPagePaths).length) {
                Object.keys(bundle).forEach((key) => {
                    if (key.endsWith('.js')) {
                        const chunk = bundle[key];
                        let newCode = chunk.code;
                        Object.keys(systemPagePaths).forEach((path) => {
                            if (newCode.includes(path)) {
                                newCode = newCode.replace(new RegExp(path, 'g'), systemPagePaths[path]);
                            }
                        });
                        chunk.code = newCode;
                    }
                });
            }
        },
    };
}
exports.replaceExtApiPagePaths = replaceExtApiPagePaths;
