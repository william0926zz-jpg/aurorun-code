"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.virtualComponentPath = exports.parseUniModulesArtifacts = exports.getUniModulesEncryptType = exports.checkEncryptUniModules = exports.resolveEncryptUniModule = exports.initCheckEnv = exports.packUploadEncryptUniModules = exports.findUploadEncryptUniModulesFiles = exports.findCloudEncryptUniModules = exports.parseEasyComComponents = exports.parseUniModulesWithComponents = exports.genEncryptUTSModuleCode = exports.genEncryptEasyComModuleCode = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fast_glob_1 = require("fast-glob");
const utils_1 = require("./utils");
const easycom_1 = require("./easycom");
const messages_1 = require("./messages");
const constants_1 = require("./constants");
const url_1 = require("./url");
function genEncryptEasyComModuleIndex(pluginId, platform, components) {
    const isMp = platform.startsWith('mp-');
    const imports = [];
    const code = [];
    const ids = [];
    Object.keys(components).forEach((component) => {
        const id = (0, utils_1.capitalize)((0, utils_1.camelize)(component));
        if (!isMp) {
            ids.push(id);
        }
        let instance = '';
        if (platform === 'app-android') {
            instance = (0, easycom_1.genUTSComponentPublicInstanceIdent)(component);
            // 类型
            ids.push(instance);
        }
        if (isMp) {
            const filename = `uni_modules/${pluginId}/components/${component}/${component}${components[component]}`;
            // 为了触发json、wxss的生成
            imports.push(`import ${id} from '${virtualComponentPath(filename)}'`);
            code.push(`function defineComponent${id}(){
  ${process.env.UNI_MP_GLOBAL || 'uni'}.createComponent(${id})
}`);
            ids.push(`defineComponent${id}`);
        }
        else {
            imports.push(`import ${id}${instance ? `, { ${instance} }` : ''} from './components/${component}/${component}${components[component]}'`);
        }
    });
    return `
${imports.join('\n')}
${code.join('\n')}
export { 
  ${ids.join(',\n  ')} 
}
  `;
}
// easyCom
function genEncryptEasyComModuleCode(pluginId, platform, components) {
    // easyCom
    if (components && Object.keys(components).length) {
        return genEncryptEasyComModuleIndex(pluginId, platform, components);
    }
    return '';
}
exports.genEncryptEasyComModuleCode = genEncryptEasyComModuleCode;
function genEncryptUTSModuleCode(module, inputDir, platform) {
    const utssdkDir = path_1.default.resolve(inputDir, 'uni_modules', module, 'utssdk');
    let indexUTSFile = '';
    const platformIndexUTSFile = path_1.default.resolve(utssdkDir, platform, 'index.uts');
    if (fs_extra_1.default.existsSync(platformIndexUTSFile)) {
        indexUTSFile = `./utssdk/${platform}/index.uts`;
    }
    else {
        const rootIndexUTSFile = path_1.default.resolve(utssdkDir, 'index.uts');
        if (fs_extra_1.default.existsSync(rootIndexUTSFile)) {
            indexUTSFile = `./utssdk/index.uts`;
        }
    }
    if (indexUTSFile) {
        return `export * from '${indexUTSFile}'`;
    }
    return '';
}
exports.genEncryptUTSModuleCode = genEncryptUTSModuleCode;
// 目前该函数仅在云端使用（目前仅限iOS/web），云端编译时，提交上来的uni_modules是过滤好的
function parseUniModulesWithComponents(inputDir, platform) {
    const modulesDir = path_1.default.resolve(inputDir, 'uni_modules');
    const uniModules = {};
    if (fs_extra_1.default.existsSync(modulesDir)) {
        fs_extra_1.default.readdirSync(modulesDir).forEach((uniModuleDir) => {
            if (!fs_extra_1.default.existsSync(path_1.default.resolve(modulesDir, uniModuleDir, 'package.json'))) {
                return;
            }
            let code = genEncryptUTSModuleCode(uniModuleDir, inputDir, platform);
            if (code) {
                // uts插件
                uniModules[uniModuleDir] = code;
            }
            else {
                const codes = [];
                // 前端组件插件
                if (hasIndexFile(path_1.default.resolve(inputDir, 'uni_modules', uniModuleDir))) {
                    codes.push(`export * from './index'`);
                }
                // 解析加密的 easyCom 插件列表
                const components = parseEasyComComponents(uniModuleDir, inputDir, false);
                if (Object.keys(components).length) {
                    codes.push(genEncryptEasyComModuleCode(uniModuleDir, platform, components));
                }
                if (codes.length) {
                    uniModules[uniModuleDir] = codes.join(`\n`);
                }
            }
        });
    }
    return uniModules;
}
exports.parseUniModulesWithComponents = parseUniModulesWithComponents;
const indexFiles = ['index.uts', 'index.ts', 'index.js'];
function hasIndexFile(uniModuleDir) {
    return fs_extra_1.default.readdirSync(uniModuleDir).some((file) => indexFiles.includes(file));
}
/**
 * 解析 easyCom 组件列表
 * @param pluginId
 * @param inputDir
 * @returns
 */
function parseEasyComComponents(pluginId, inputDir, detectBinary = true) {
    const componentsDir = path_1.default.resolve(inputDir, 'uni_modules', pluginId, 'components');
    const components = {};
    if (fs_extra_1.default.existsSync(componentsDir)) {
        fs_extra_1.default.readdirSync(componentsDir).forEach((componentDir) => {
            const componentFile = path_1.default.resolve(componentsDir, componentDir, componentDir);
            const extname = ['.vue', '.uvue'].find((extname) => {
                const filename = componentFile + extname;
                // 探测 filename 是否是二进制文件
                if (fs_extra_1.default.existsSync(filename)) {
                    if (detectBinary) {
                        // 延迟require，这个是新增的依赖，无法及时同步到内部测试版本HBuilderX中，导致报错，所以延迟require吧
                        if (require('isbinaryfile').isBinaryFileSync(filename)) {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
            });
            if (extname) {
                components[componentDir] = extname;
            }
        });
    }
    return components;
}
exports.parseEasyComComponents = parseEasyComComponents;
const uniModulesEncryptTypes = new Map();
/**
 * 查找所有需要云编译的加密插件 uni_modules
 * 支持云编译的插件类型
 * 1. 前端加密组件components
 * 2. 非 app-android/app-ios 平台的 utssdk 插件(app-android/app-ios 平台需要自定义基座，不支持云编译)
 * 目前 utssdk 插件 和 前端加密组件是互斥的
 * @param platform
 * @param inputDir
 * @param cacheDir
 * @returns
 */
function findCloudEncryptUniModules(platform, inputDir, cacheDir = '', sdkType = 'all') {
    uniModulesEncryptTypes.clear();
    const uniModules = {};
    const modulesDir = path_1.default.resolve(inputDir, 'uni_modules');
    if (fs_extra_1.default.existsSync(modulesDir)) {
        fs_extra_1.default.readdirSync(modulesDir).forEach((uniModuleDir) => {
            const uniModuleRootDir = path_1.default.resolve(modulesDir, uniModuleDir);
            if (!fs_extra_1.default.existsSync(path_1.default.resolve(uniModuleRootDir, 'encrypt'))) {
                return;
            }
            const utssdkDir = path_1.default.resolve(uniModuleRootDir, 'utssdk');
            let type = '';
            if (fs_extra_1.default.existsSync(utssdkDir)) {
                // app-android 和 app-ios 不能云编译 utssdk 插件，而是需要自定义基座
                if (platform === 'app-android' || platform === 'app-ios') {
                    return;
                }
                // 其他平台必须有平台index.uts或根目录index.uts
                const hasIndexUTSFile = fs_extra_1.default.existsSync(path_1.default.resolve(utssdkDir, platform, 'index.uts')) ||
                    fs_extra_1.default.existsSync(path_1.default.resolve(utssdkDir, 'index.uts'));
                if (!hasIndexUTSFile) {
                    return;
                }
                type = 'utssdk';
            }
            else {
                // 前端加密组件components
                const componentsDir = path_1.default.resolve(uniModuleRootDir, 'components');
                if (!fs_extra_1.default.existsSync(componentsDir)) {
                    return;
                }
                type = 'easycom';
            }
            if (sdkType === 'utssdk' && type === 'easycom') {
                return;
            }
            if (sdkType === 'easycom' && type === 'utssdk') {
                return;
            }
            const pkg = require(path_1.default.resolve(uniModuleRootDir, 'package.json'));
            uniModules[uniModuleDir] = findEncryptUniModuleCache(uniModuleDir, cacheDir, {
                version: pkg.version,
                env: initCheckEnv(),
            });
            uniModulesEncryptTypes.set(uniModuleDir, type);
        });
    }
    return uniModules;
}
exports.findCloudEncryptUniModules = findCloudEncryptUniModules;
function findUploadEncryptUniModulesFiles(uniModules, platform, inputDir) {
    const modules = {};
    Object.keys(uniModules).forEach((uniModuleId) => {
        if (!uniModules[uniModuleId]) {
            modules[uniModuleId] = findUniModuleFiles(platform, uniModuleId, inputDir);
        }
    });
    return modules;
}
exports.findUploadEncryptUniModulesFiles = findUploadEncryptUniModulesFiles;
function packUploadEncryptUniModules(uniModules, platform, inputDir, cacheDir) {
    const modules = findUploadEncryptUniModulesFiles(uniModules, platform, inputDir);
    const uploadModuleIds = Object.keys(modules);
    if (uploadModuleIds.length) {
        // 延迟 require，避免 vue2 编译器需要安装此依赖，目前该方法仅在 vite 编译器中使用
        const AdmZip = require('adm-zip');
        const zip = new AdmZip();
        uploadModuleIds.forEach((moduleId) => {
            modules[moduleId].forEach((file) => {
                zip.addLocalFile(file, path_1.default.dirname(path_1.default.relative(inputDir, file)));
            });
        });
        const zipFile = path_1.default.resolve(cacheDir, 'cloud-compile-plugins.zip');
        zip.writeZip(zipFile);
        return {
            zipFile,
            modules: uploadModuleIds,
        };
    }
    return {
        zipFile: '',
        modules: [],
    };
}
exports.packUploadEncryptUniModules = packUploadEncryptUniModules;
function isEnvExpired(value, other) {
    const valueKeys = Object.keys(value);
    const otherKeys = Object.keys(other);
    if (valueKeys.length !== otherKeys.length) {
        return true;
    }
    if (valueKeys.find((name) => value[name] !== other[name])) {
        return true;
    }
    return false;
}
function findEncryptUniModuleCache(uniModuleId, cacheDir, options) {
    if (!cacheDir) {
        return;
    }
    const uniModuleCacheDir = path_1.default.resolve(cacheDir, 'uni_modules', uniModuleId);
    if (fs_extra_1.default.existsSync(uniModuleCacheDir)) {
        const pkg = require(path_1.default.resolve(uniModuleCacheDir, 'package.json'));
        // 插件版本以及各种环境一致
        if (pkg.version === options.version &&
            (options.env.compilerVersion === '4.17-test' ||
                !isEnvExpired(pkg.uni_modules?.artifacts?.env || {}, options.env))) {
            const declaration = path_1.default.resolve(uniModuleCacheDir, 'utssdk/app-android/index.d.uts');
            pkg.uni_modules.artifacts.declaration = fs_extra_1.default.existsSync(declaration)
                ? declaration
                : '';
            return pkg;
        }
        console.log(`插件${uniModuleId} 缓存已过期，需要重新云编译。`);
        // 已过期的插件，删除缓存
        fs_extra_1.default.rmSync(uniModuleCacheDir, { recursive: true });
    }
}
const KNOWN_ASSET_TYPES = [
    // images
    'png',
    'jpe?g',
    'gif',
    'svg',
    'ico',
    'webp',
    'avif',
    // media
    'mp4',
    'webm',
    'ogg',
    'mp3',
    'wav',
    'flac',
    'aac',
    // fonts
    'woff2?',
    'eot',
    'ttf',
    'otf',
    // other
    'pdf',
    'txt',
];
function findUniModuleFiles(platform, id, inputDir) {
    return (0, fast_glob_1.sync)(`uni_modules/${id}/**/*`, {
        cwd: inputDir,
        absolute: true,
        ignore: [
            '**/*.md',
            ...(platform !== 'app-android' // 非 android 平台不需要扫描 assets
                ? [`**/*.{${KNOWN_ASSET_TYPES.join(',')}}`]
                : []),
        ],
    });
}
function initCheckEnv() {
    return {
        // 云端编译的版本号不带日期及小版本
        compilerVersion: process.env.UNI_COMPILER_VERSION,
    };
}
exports.initCheckEnv = initCheckEnv;
function findLastIndex(array, predicate) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}
let encryptUniModules = {};
function resolveEncryptUniModule(id, platform, isX = true) {
    id = id.split('?', 2)[0];
    const parts = id.split('/');
    const index = findLastIndex(parts, (part) => part === 'uni_modules');
    if (index !== -1) {
        const uniModuleId = parts[index + 1];
        if (uniModuleId in encryptUniModules) {
            if (parts[index + 2] &&
                (platform === 'app-android' || platform === 'app-ios')) {
                console.warn(messages_1.M['uni_modules.import']
                    .replace('{0}', uniModuleId)
                    .replace('{1}', uniModuleId)
                    .replace('{2}', parts.slice(index + 2).join('/')));
            }
            // 为了避免兼容性问题，
            // 目前排除 app-android 和 app-ios 平台，其他平台需要判断是否uvue文件，比如web端。加密utssdk插件，但同时easycom使用了非加密组件
            if (platform !== 'app-android' && platform !== 'app-ios') {
                const encryptType = getUniModulesEncryptType(uniModuleId);
                if (encryptType === 'utssdk') {
                    // 如果是utssdk加密插件，且是vue文件，则不走uts-proxy
                    if (constants_1.EXTNAME_VUE_RE.test(id)) {
                        return;
                    }
                }
                // 小程序平台不使用uni_helpers来处理easycom组件，而是用uniEntryPlugin处理
                if (platform.startsWith('mp-')) {
                    if (encryptType === 'easycom') {
                        if (constants_1.EXTNAME_VUE_RE.test(id)) {
                            return;
                        }
                    }
                }
            }
            // 原生平台走旧的uts-proxy
            return (0, utils_1.normalizePath)(path_1.default.join(process.env.UNI_INPUT_DIR, `uni_modules/${uniModuleId}?${isX && platform === 'app-android' ? 'uts-proxy' : 'uni_helpers'}`));
        }
    }
}
exports.resolveEncryptUniModule = resolveEncryptUniModule;
async function checkEncryptUniModules(inputDir, params, sdkType = 'all') {
    // 初始化指定 sdk 类型的加密插件
    const curEncryptUniModules = findCloudEncryptUniModules(params.platform, inputDir, process.env.UNI_MODULES_ENCRYPT_CACHE_DIR, sdkType);
    if (!Object.keys(curEncryptUniModules).length) {
        return {};
    }
    if (!process.env.UNI_HBUILDERX_PLUGINS) {
        return {};
    }
    const cacheDir = process.env.UNI_MODULES_ENCRYPT_CACHE_DIR;
    const { zipFile, modules } = packUploadEncryptUniModules(curEncryptUniModules, process.env.UNI_UTS_PLATFORM, inputDir, cacheDir);
    if (zipFile) {
        const downloadFile = path_1.default.resolve(cacheDir, 'uni_modules.download.zip');
        const { C, D, R, U } = (0, utils_1.requireUniHelpers)();
        try {
            const isLogin = await C();
            const tips = process.env.UNI_UTS_PLATFORM !== 'app-android'
                ? '（此过程耗时较长）'
                : '';
            console.log(`正在云编译插件${isLogin ? '' : '（请先登录）'}${tips}：${modules.join(',')}...`);
            let downloadUrl = '';
            try {
                downloadUrl = await U({
                    params,
                    attachment: zipFile,
                });
            }
            catch (e) {
                if (e.message && e.message === '{"error":"UserNotLogin"}') {
                    console.log('当前项目包含需要云编译的付费插件，需要您先登录HBuilderX账号。');
                }
                else {
                    console.error(e);
                }
                process.exit(0);
            }
            await D(downloadUrl, downloadFile);
            // unzip
            const AdmZip = require('adm-zip');
            const zip = new AdmZip(downloadFile);
            zip.extractAllTo(cacheDir, true);
            fs_extra_1.default.unlinkSync(zipFile);
            fs_extra_1.default.unlinkSync(downloadFile);
            R({
                dir: process.env.UNI_INPUT_DIR,
                cacheDir: process.env.UNI_MODULES_ENCRYPT_CACHE_DIR,
            });
            console.log(`云编译已完成`);
            console.log(`正在编译中...`);
        }
        catch (e) {
            fs_extra_1.default.existsSync(zipFile) && fs_extra_1.default.unlinkSync(zipFile);
            fs_extra_1.default.existsSync(downloadFile) && fs_extra_1.default.unlinkSync(downloadFile);
            console.error(e);
            process.exit(0);
        }
    }
    else {
        // android 平台需要在这里初始化
        if (params.platform === 'app-android') {
            const { R } = (0, utils_1.requireUniHelpers)();
            R({
                dir: process.env.UNI_INPUT_DIR,
                cacheDir: process.env.UNI_MODULES_ENCRYPT_CACHE_DIR,
            });
        }
    }
    // 初始化所有
    encryptUniModules = findCloudEncryptUniModules(params.platform, inputDir, process.env.UNI_MODULES_ENCRYPT_CACHE_DIR, 'all');
}
exports.checkEncryptUniModules = checkEncryptUniModules;
function getUniModulesEncryptType(pluginId) {
    return uniModulesEncryptTypes.get(pluginId);
}
exports.getUniModulesEncryptType = getUniModulesEncryptType;
function parseUniModulesArtifacts() {
    const res = [];
    Object.keys(encryptUniModules).forEach((uniModuleId) => {
        const pkg = encryptUniModules[uniModuleId];
        if (pkg?.uni_modules?.artifacts) {
            res.push({
                name: uniModuleId,
                package: `uts.sdk.modules.${(0, utils_1.camelize)(uniModuleId)}`,
                scopedSlots: pkg.uni_modules.artifacts.scopedSlots || [],
                declaration: pkg.uni_modules.artifacts.declaration,
            });
        }
    });
    return res;
}
exports.parseUniModulesArtifacts = parseUniModulesArtifacts;
const uniComponentPrefix = 'uniComponent://';
function virtualComponentPath(filepath) {
    return uniComponentPrefix + (0, url_1.encodeBase64Url)(filepath);
}
exports.virtualComponentPath = virtualComponentPath;
