"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = void 0;
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("@vue/shared");
const uni_cli_shared_1 = require("@dcloudio/uni-cli-shared");
const utils_1 = require("../utils");
const esbuildPrePlugin_1 = require("./esbuild/esbuildPrePlugin");
const ssr_1 = require("./configureServer/ssr");
function createConfig(options) {
    return function config(config, env) {
        const inputDir = process.env.UNI_INPUT_DIR;
        if ((0, uni_cli_shared_1.isInHBuilderX)()) {
            if (!fs_1.default.existsSync(path_1.default.resolve(inputDir, 'index.html'))) {
                console.error(`请确认您的项目模板是否支持vue3：根目录缺少 index.html`);
                process.exit();
            }
        }
        const server = {
            hmr: process.env.UNI_AUTOMATOR_WS_ENDPOINT
                ? false
                : {
                    // mac 内置浏览器版本较低不支持 globalThis，而 overlay 使用了 globalThis
                    overlay: os_1.default.platform() !== 'win32'
                        ? process.env.UNI_H5_BROWSER !== 'builtin'
                        : true,
                },
            fs: { strict: false },
            watch: {
                ignored: [
                    '**/uniCloud-aliyun/**',
                    '**/uniCloud-tcb/**',
                    '**/uniCloud-alipay/**',
                    '**/uniCloud-dcloud/**',
                    '**/uni_modules/uniCloud/**',
                    '**/__snapshots__/**',
                    (0, uni_cli_shared_1.normalizePath)(path_1.default.join(inputDir, 'unpackage/**')),
                    (0, uni_cli_shared_1.normalizePath)(path_1.default.join(inputDir, 'dist/**')),
                ],
            },
            ...(0, uni_cli_shared_1.getDevServerOptions)((0, uni_cli_shared_1.parseManifestJsonOnce)(inputDir)),
        };
        if ((0, uni_cli_shared_1.runByHBuilderX)()) {
            // 仅在 HBuilderX 中运行时，将 host 设置为 true，cli 项目命令行运行需要自行开启 --host 参数
            server.host = true;
        }
        if (server.port === '') {
            delete server.port;
        }
        const { server: userServer } = config;
        if (userServer) {
            if ((0, shared_1.hasOwn)(userServer, 'host')) {
                server.host = userServer.host;
            }
            if ((0, shared_1.hasOwn)(userServer, 'fs')) {
                (0, shared_1.extend)(server.fs, userServer.fs);
            }
            if ((0, shared_1.hasOwn)(userServer, 'watch')) {
                (0, shared_1.extend)(server.watch, userServer.watch);
            }
        }
        let sourcemapPathTransform = undefined;
        if (
        // 仅在 uni-app-x 模式下，且非开发模式，且需要 sourcemap 时，才进行 sourcemap 路径转换
        process.env.UNI_APP_X === 'true' &&
            process.env.NODE_ENV !== 'development' &&
            (0, uni_cli_shared_1.withSourcemap)(config)) {
            sourcemapPathTransform = transformSourcemapPath;
        }
        return {
            legacy: {
                // 目前先使用旧模式
                proxySsrExternalModules: true,
            },
            css: {
                postcss: {
                    plugins: (0, uni_cli_shared_1.initPostcssPlugin)({
                        uniApp: (0, uni_cli_shared_1.parseRpx2UnitOnce)(inputDir, process.env.UNI_PLATFORM),
                    }),
                },
            },
            optimizeDeps: {
                entries: (0, uni_cli_shared_1.resolveMainPathOnce)(inputDir),
                exclude: ssr_1.external,
                esbuildOptions: {
                    plugins: [(0, esbuildPrePlugin_1.esbuildPrePlugin)()],
                },
            },
            define: (0, utils_1.createDefine)(env.command, config),
            server,
            ssr: {
                external: ssr_1.external,
            },
            build: {
                target: process.env.UNI_APP_X === 'true'
                    ? ['es2015', 'edge79', 'firefox62', 'chrome64', 'safari11.1']
                    : undefined,
                rollupOptions: {
                    // resolveSSRExternal 会判定package.json，hbx 工程可能没有，通过 rollup 来配置
                    external: (0, uni_cli_shared_1.isSsr)(env.command, config) ? ssr_1.external : [],
                    output: {
                        sourcemapPathTransform,
                        chunkFileNames(chunkInfo) {
                            const hash = 
                            // 为了测试额外加的逻辑，避免因为环境不一致导致hash有变化
                            process.env.UNI_WEB_DISABLE_CHUNK_HASH === 'true'
                                ? ''
                                : '.[hash]';
                            const { assetsDir } = options.resolvedConfig.build;
                            if (chunkInfo.facadeModuleId) {
                                const dirname = (0, uni_cli_shared_1.normalizePath)(path_1.default.relative(inputDir, path_1.default.dirname(chunkInfo.facadeModuleId)));
                                if (dirname) {
                                    // 保留workers的目录结构，目前不支持不同的workers引入同一个uts文件，因为目前不能很好的分别打包进各自的chunk中
                                    const workersRootDir = (0, uni_cli_shared_1.getWorkersRootDirs)();
                                    if (workersRootDir.length) {
                                        if (workersRootDir.some((workersRootDir) => dirname.startsWith(workersRootDir))) {
                                            return `${dirname}/[name].js`;
                                        }
                                    }
                                    return path_1.default.posix.join(assetsDir, dirname.replace(/\//g, '-') + `-[name]${hash}.js`);
                                }
                            }
                            return path_1.default.posix.join(assetsDir, `[name]${hash}.js`);
                        },
                    },
                },
            },
        };
    };
}
exports.createConfig = createConfig;
function transformSourcemapPath(relativeSourcePath, sourcemapPath) {
    const sourcePath = (0, uni_cli_shared_1.normalizePath)(path_1.default.relative(process.env.UNI_INPUT_DIR, path_1.default.resolve(path_1.default.dirname(sourcemapPath), relativeSourcePath)));
    if (sourcePath.startsWith('..')) {
        return '';
    }
    return sourcePath;
}
