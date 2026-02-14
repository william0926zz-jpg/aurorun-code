"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniResolveIdPlugin = void 0;
const path_1 = __importDefault(require("path"));
// import debug from 'debug'
const fs_extra_1 = __importDefault(require("fs-extra"));
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
// const debugResolve = debug('uni:resolve-id')
let isPiniaVersion3 = false;
try {
    isPiniaVersion3 =
        Number(fs_extra_1.default
            .readJSONSync(path_1.default.join((0, uni_cli_shared_1.resolveBuiltIn)('pinia/package.json')))
            .version.split('.')[0]) >= 3;
}
catch (error) { }
const BUILT_IN_MODULES = {
    'vue-router': 'dist/vue-router.esm-bundler.js',
    vuex: 'dist/vuex.esm-bundler.js',
    'vue-i18n': 'dist/vue-i18n.esm-bundler.js',
    '@dcloudio/uni-app': 'dist/uni-app.es.js',
    '@dcloudio/uni-cloud': 'dist/uni-cloud.es.js',
    '@dcloudio/uni-i18n': 'dist/uni-i18n.es.js',
    '@dcloudio/uni-shared': 'dist/uni-shared.es.js',
    '@dcloudio/uni-stacktracey': 'dist/uni-stacktracey.es.js',
    '@vue/shared': 'dist/shared.esm-bundler.js',
    pinia: isPiniaVersion3 ? '' : 'dist/pinia.mjs',
};
function uniResolveIdPlugin(options) {
    const resolveCache = {};
    if (process.env.UNI_APP_X === 'true') {
        BUILT_IN_MODULES['@dcloudio/uni-app'] = 'dist-x/uni-app.es.js';
        BUILT_IN_MODULES['@dcloudio/uni-cloud'] = 'dist/uni-cloud-x.es.js';
    }
    return {
        name: 'uni:resolve-id',
        resolveId(id, importer) {
            const cache = resolveCache[id];
            if (cache) {
                // debugResolve('cache', id, cache)
                return cache;
            }
            if (BUILT_IN_MODULES[id]) {
                return (resolveCache[id] = (0, uni_cli_shared_1.resolveBuiltIn)(path_1.default.join(id, BUILT_IN_MODULES[id])));
            }
            if (process.env.UNI_PLATFORM !== 'app') {
                return (0, uni_cli_shared_1.resolveUTSModule)(id, importer ? path_1.default.dirname(importer) : process.env.UNI_INPUT_DIR);
            }
        },
    };
}
exports.uniResolveIdPlugin = uniResolveIdPlugin;
