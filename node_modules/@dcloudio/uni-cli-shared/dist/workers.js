"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUniXCompilerRootWorkers = exports.uniJavaScriptWorkersPlugin = exports.resolveWorkersDir = exports.uniWorkersPlugin = exports.initWorkers = exports.getWorkersRootDirs = exports.resolveWorkersRootDir = exports.getWorkers = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const debug_1 = __importDefault(require("debug"));
const fast_glob_1 = require("fast-glob");
const utils_1 = require("./utils");
const json_1 = require("./json");
const uts_1 = require("./uts");
const uni_modules_1 = require("./vite/plugins/uts/uni_modules");
const resolve_1 = require("./resolve");
const debugWorkers = (0, debug_1.default)('uni:workers');
let workersRootDir = null;
let workersRootDirs = [];
let workers = {};
function getWorkers() {
    return workers;
}
exports.getWorkers = getWorkers;
function resolveWorkersRootDir() {
    // 默认是 workers
    return workersRootDir || 'workers';
}
exports.resolveWorkersRootDir = resolveWorkersRootDir;
function getWorkersRootDirs() {
    return workersRootDirs;
}
exports.getWorkersRootDirs = getWorkersRootDirs;
/**
 * 遍历目录下的所有uts文件，读取文件内容，正则匹配出定义的worker，返回文件名和类名的映射关系
 * export class MyWorkerTask extends WorkerTaskImpl {}
 * @param dir
 */
function initWorkers(workersDirs, rootDir) {
    workers = {};
    for (const workersDir of workersDirs) {
        const dir = path_1.default.join(rootDir, workersDir);
        if (!fs_extra_1.default.existsSync(dir)) {
            continue;
        }
        (0, fast_glob_1.sync)('**/*.uts', { cwd: dir }).forEach((file) => {
            const content = fs_extra_1.default.readFileSync(path_1.default.join(dir, file), 'utf-8');
            const match = content.match(/class\s+(.*)\s+extends\s+WorkerTaskImpl/);
            if (match && match[1]) {
                const key = (0, utils_1.normalizePath)(path_1.default.join(workersDir, file));
                workers[key] = match[1];
            }
        });
    }
    debugWorkers('workers', workers);
    return workers;
}
exports.initWorkers = initWorkers;
function uniWorkersPlugin() {
    const inputDir = process.env.UNI_INPUT_DIR;
    const platform = process.env.UNI_UTS_PLATFORM;
    const resolveWorkers = () => getWorkers();
    function refreshWorkers() {
        workersRootDirs = resolveWorkersDir(inputDir);
        initWorkers(workersRootDirs, inputDir);
        return Object.keys(getWorkers()).length > 0;
    }
    refreshWorkers();
    const preprocessor = platform === 'app-android'
        ? (0, uni_modules_1.createAppAndroidUniModulesSyncFilePreprocessorOnce)(false)
        : platform === 'app-ios'
            ? (0, uni_modules_1.createAppIosUniModulesSyncFilePreprocessorOnce)(false)
            : platform === 'app-harmony'
                ? (0, uni_modules_1.createAppHarmonyUniModulesSyncFilePreprocessorOnce)(false)
                : null;
    const cache = {};
    const uniXKotlinCompiler = platform === 'app-android'
        ? (0, uts_1.resolveUTSCompiler)().createUniXKotlinCompilerOnce({
            resolveWorkers,
        })
        : null;
    const uniXSwiftCompiler = platform === 'app-ios'
        ? (0, uts_1.resolveUTSCompiler)().createUniXSwiftCompilerOnce({
            resolveWorkers,
        })
        : null;
    const uniXArkTSCompiler = platform === 'app-harmony'
        ? (0, uts_1.resolveUTSCompiler)().createUniXArkTSCompilerOnce({
            resolveWorkers,
        })
        : null;
    return {
        name: 'uni-workers',
        enforce: 'pre',
        async buildStart() {
            if (refreshWorkers()) {
                if (preprocessor) {
                    await syncWorkersFiles(platform, inputDir, preprocessor, cache);
                }
            }
            // 需要等待 workers 文件同步完之后，添加到 rootFiles 中，触发 tsc 的编译
            if (uniXKotlinCompiler) {
                await initUniXCompilerRootWorkers((0, uts_1.tscOutDir)('app-android'), uniXKotlinCompiler);
            }
            if (uniXSwiftCompiler) {
                await initUniXCompilerRootWorkers((0, uts_1.tscOutDir)('app-ios'), uniXSwiftCompiler);
            }
            if (uniXArkTSCompiler) {
                await initUniXCompilerRootWorkers((0, uts_1.tscOutDir)('app-harmony'), uniXArkTSCompiler);
            }
        },
    };
}
exports.uniWorkersPlugin = uniWorkersPlugin;
async function syncWorkersFiles(platform, inputDir, preprocessor, cache) {
    if (platform !== 'app-harmony' &&
        platform !== 'app-android' &&
        platform !== 'app-ios') {
        return;
    }
    const workersDirs = resolveWorkersDir(inputDir);
    if (workersDirs.length) {
        const { syncUTSFiles } = (0, uts_1.resolveUTSCompiler)();
        for (const workersDir of workersDirs) {
            await syncUTSFiles((0, utils_1.normalizePath)(path_1.default.join(workersDir, '**/*.uts')), inputDir, (0, uts_1.tscOutDir)(platform), true, preprocessor, cache);
        }
    }
}
function resolveWorkersDir(inputDir) {
    const workersDirs = [];
    const manifestJson = (0, json_1.parseManifestJsonOnce)(inputDir);
    if (manifestJson.workers) {
        let workersDir = typeof manifestJson.workers === 'string'
            ? manifestJson.workers
            : manifestJson.workers.path;
        if (workersDir) {
            workersDir = (0, utils_1.normalizePath)(workersDir);
            const dir = path_1.default.join(inputDir, workersDir);
            if (fs_extra_1.default.existsSync(dir)) {
                workersRootDir = workersDir;
                workersDirs.push(workersDir);
            }
        }
    }
    // 遍历uni_modules插件目录是否有workers目录
    const uniModulesDir = path_1.default.join(inputDir, 'uni_modules');
    if (fs_extra_1.default.existsSync(uniModulesDir)) {
        fs_extra_1.default.readdirSync(uniModulesDir).forEach((dir) => {
            if (fs_extra_1.default.existsSync(path_1.default.join(uniModulesDir, dir, 'workers'))) {
                workersDirs.push('uni_modules/' + dir + '/workers');
            }
        });
    }
    debugWorkers('workersDirs', workersDirs);
    return workersDirs;
}
exports.resolveWorkersDir = resolveWorkersDir;
function uniJavaScriptWorkersPlugin() {
    // 仅小程序平台外置uni-worker.mp.js
    const external = (process.env.UNI_UTS_PLATFORM || '').startsWith('mp-');
    let workerPolyfillCode = '';
    let isWrite = false;
    const UniAppWorkerJSName = external ? 'uni-worker.mp.js' : 'uni-worker.web.js';
    let viteServer = null;
    const workersRootPaths = [];
    const workerPolyfillPath = `@dcloudio/uni-app/dist-x/${UniAppWorkerJSName}`;
    const workerPolyfillAbsPath = (0, utils_1.normalizePath)((0, resolve_1.resolveBuiltIn)(workerPolyfillPath));
    function isWorkerFile(id) {
        if (workersRootPaths.length) {
            return workersRootPaths.some((dir) => id.startsWith(dir));
        }
        return false;
    }
    function parseWorkerEntryFile(workerJsPath) {
        const workerPath = workerJsPath.slice(1).replace('.js', '.uts');
        if (workerPath in workers) {
            return (0, utils_1.normalizePath)(path_1.default.resolve(process.env.UNI_INPUT_DIR, workerPath));
        }
    }
    function parseWorkerClass(id) {
        const filename = id.split('?')[0];
        if (isWorkerFile(filename)) {
            const workerPath = (0, utils_1.normalizePath)(path_1.default.relative(process.env.UNI_INPUT_DIR, filename));
            return workers[workerPath] || '';
        }
        return false;
    }
    return {
        name: 'uni:javascript-workers',
        configureServer(server) {
            viteServer = server;
        },
        buildStart() {
            if (!workerPolyfillCode && Object.keys(getWorkers()).length) {
                workerPolyfillCode = fs_extra_1.default.readFileSync(workerPolyfillAbsPath, 'utf-8');
            }
            workersRootPaths.length = 0;
            for (const workersRootDir of getWorkersRootDirs()) {
                workersRootPaths.push((0, utils_1.normalizePath)(path_1.default.resolve(process.env.UNI_INPUT_DIR, workersRootDir)));
            }
        },
        resolveId(id) {
            // uni.createWorker('workers/request/index.uts')
            // 编译阶段调整为 uni.createWorker('workers/request/index.js')，确保开发和运行时都是用.js后缀加载
            // 不调整成js后缀或.uts?import这些格式， vite 是不会走transform逻辑的，而是直接读取文件内容
            if (viteServer) {
                const workerEntryFile = parseWorkerEntryFile(id);
                if (workerEntryFile) {
                    return workerEntryFile;
                }
                if (id === workerPolyfillPath) {
                    return workerPolyfillAbsPath;
                }
            }
        },
        load(id) {
            const filename = id.split('?')[0];
            const workerClass = parseWorkerClass(filename);
            if (workerClass === false) {
                return;
            }
            if (fs_extra_1.default.existsSync(filename)) {
                let code = (viteServer ? `import '${workerPolyfillPath}';` : '') +
                    fs_extra_1.default
                        .readFileSync(filename, 'utf-8')
                        // 移除 export
                        .replace(/export\s+class\s+(.*)\s+extends\s+WorkerTaskImpl\s*{/, 'class $1 extends WorkerTaskImpl {');
                // 如果是入口文件，需要追加初始化代码
                if (workerClass) {
                    code += `\n;new ${workerClass}().entry()`;
                }
                return code;
            }
        },
        generateBundle(_, bundle) {
            const workers = getWorkers();
            const workerRootDir = resolveWorkersRootDir();
            const workerPaths = Object.keys(workers).map((key) => {
                if (key.startsWith('uni_modules')) {
                    key = workerRootDir + '/' + key;
                }
                return key.replace('.uts', '.js');
            });
            if (workerPaths.length) {
                Object.keys(bundle).forEach((file) => {
                    if (workerPaths.includes(file)) {
                        const chunk = bundle[file];
                        if (chunk.type === 'chunk') {
                            const workerCode = external
                                ? `require('${(0, utils_1.normalizePath)(path_1.default.relative(path_1.default.dirname(file), path_1.default.join(resolveWorkersRootDir(), 'uni-worker.js')))}')`
                                : workerPolyfillCode;
                            chunk.code = `${workerCode}\n${chunk.code}`;
                        }
                    }
                });
            }
        },
        writeBundle() {
            if (external && Object.keys(getWorkers()).length && !isWrite) {
                isWrite = true;
                // 写入uni-worker.js
                fs_extra_1.default.outputFileSync(path_1.default.resolve(process.env.UNI_OUTPUT_DIR, resolveWorkersRootDir(), 'uni-worker.js'), workerPolyfillCode);
            }
        },
    };
}
exports.uniJavaScriptWorkersPlugin = uniJavaScriptWorkersPlugin;
async function initUniXCompilerRootWorkers(rootDir, compiler) {
    const workers = getWorkers();
    if (Object.keys(workers).length) {
        for (const key in workers) {
            const file = path_1.default.join(rootDir, key + '.ts');
            if (fs_extra_1.default.existsSync(file)) {
                if (!compiler.hasRootFile(file)) {
                    await compiler.addRootFile(file);
                }
            }
        }
    }
}
exports.initUniXCompilerRootWorkers = initUniXCompilerRootWorkers;
