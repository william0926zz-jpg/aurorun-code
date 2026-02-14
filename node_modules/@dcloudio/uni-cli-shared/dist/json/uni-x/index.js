"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniXPagePaths = exports.isUniXPageFile = exports.normalizeUniAppXAppConfig = exports.normalizeUniAppXAppPagesJson = void 0;
const path_1 = __importDefault(require("path"));
const shared_1 = require("@vue/shared");
const json_1 = require("../json");
const pages_1 = require("../pages");
const utils_1 = require("../../utils");
const uniRoutes_1 = require("../app/pages/uniRoutes");
const uniConfig_1 = require("./uniConfig");
const preprocess_1 = require("../../preprocess");
const utils_2 = require("../utils");
__exportStar(require("./manifest"), exports);
function normalizeUniAppXAppPagesJson(jsonStr) {
    // 先条件编译
    jsonStr = (0, preprocess_1.preUVueJson)(jsonStr, 'pages.json');
    (0, utils_2.checkPagesJson)(jsonStr, process.env.UNI_INPUT_DIR);
    const pagesJson = {
        pages: [],
        globalStyle: {},
    };
    let userPagesJson = {
        pages: [],
        globalStyle: {},
    };
    try {
        // 此处不需要条件编译了
        userPagesJson = (0, json_1.parseJson)(jsonStr, false, 'pages.json');
    }
    catch (e) {
        console.error(`[vite] Error: pages.json parse failed.\n`, jsonStr, e);
    }
    // pages
    (0, pages_1.validatePages)(userPagesJson, jsonStr);
    userPagesJson.subPackages =
        userPagesJson.subPackages || userPagesJson.subpackages;
    // subPackages
    if (userPagesJson.subPackages) {
        userPagesJson.pages.push(...normalizeSubPackages(userPagesJson.subPackages));
    }
    pagesJson.pages = userPagesJson.pages;
    // pageStyle
    normalizePages(pagesJson.pages);
    // globalStyle
    pagesJson.globalStyle = normalizePageStyle(userPagesJson.globalStyle);
    // tabBar
    if (userPagesJson.tabBar) {
        pagesJson.tabBar = userPagesJson.tabBar;
    }
    // condition
    if (userPagesJson.condition) {
        pagesJson.condition = userPagesJson.condition;
    }
    // uniIdRouter
    if (userPagesJson.uniIdRouter) {
        pagesJson.uniIdRouter = userPagesJson.uniIdRouter;
    }
    // 是否应该用 process.env.UNI_UTS_PLATFORM
    (0, pages_1.filterPlatformPages)(process.env.UNI_PLATFORM, pagesJson);
    // 缓存页面列表
    pages_1.pagesCacheSet.clear();
    pagesJson.pages.forEach((page) => pages_1.pagesCacheSet.add(page.path));
    return pagesJson;
}
exports.normalizeUniAppXAppPagesJson = normalizeUniAppXAppPagesJson;
function normalizeSubPackages(subPackages) {
    const pages = [];
    if ((0, shared_1.isArray)(subPackages)) {
        subPackages.forEach(({ root, pages: subPages }) => {
            if (root && subPages.length) {
                subPages.forEach((subPage) => {
                    subPage.path = (0, utils_1.normalizePath)(path_1.default.join(root, subPage.path));
                    subPage.style = subPage.style;
                    pages.push(subPage);
                });
            }
        });
    }
    return pages;
}
function normalizePages(pages) {
    pages.forEach((page) => {
        page.style = normalizePageStyle(page.style);
    });
}
function normalizePageStyle(pageStyle) {
    if (pageStyle) {
        (0, shared_1.extend)(pageStyle, pageStyle['app']);
        (0, pages_1.removePlatformStyle)(pageStyle);
        return pageStyle;
    }
    return {};
}
/**
 * TODO 应该闭包，通过globalThis赋值？
 * @param pagesJson
 * @param manifestJson
 * @returns
 */
function normalizeUniAppXAppConfig(pagesJson, manifestJson) {
    const uniConfig = (0, uniConfig_1.normalizeAppXUniConfig)(pagesJson, manifestJson);
    const tabBar = uniConfig.tabBar;
    delete uniConfig.tabBar;
    let appConfigJs = `const __uniConfig = ${JSON.stringify(uniConfig)};
__uniConfig.getTabBarConfig = () =>  {return ${tabBar ? JSON.stringify(tabBar) : 'undefined'}};
__uniConfig.tabBar = __uniConfig.getTabBarConfig();
const __uniRoutes = ${(0, uniRoutes_1.normalizeAppUniRoutes)(pagesJson)}.map(uniRoute=>(uniRoute.meta.route=uniRoute.path,__uniConfig.pages.push(uniRoute.path),uniRoute.path='/'+uniRoute.path,uniRoute)).concat(typeof __uniSystemRoutes !== 'undefined' ? __uniSystemRoutes : []);

`;
    if (process.env.UNI_UTS_PLATFORM === 'app-harmony') {
        appConfigJs += `globalThis.__uniConfig = __uniConfig;
globalThis.__uniRoutes = __uniRoutes;`;
    }
    return appConfigJs;
}
exports.normalizeUniAppXAppConfig = normalizeUniAppXAppConfig;
function isUniXPageFile(source, importer, inputDir = process.env.UNI_INPUT_DIR) {
    if (source.startsWith('@/')) {
        return (0, pages_1.isUniPageFile)(source.slice(2), inputDir);
    }
    if (source.startsWith('.')) {
        return (0, pages_1.isUniPageFile)(path_1.default.resolve(path_1.default.dirname(importer), source), inputDir);
    }
    return false;
}
exports.isUniXPageFile = isUniXPageFile;
function getUniXPagePaths() {
    if (process.env.UNI_COMPILE_EXT_API_PAGE_PATHS) {
        return JSON.parse(process.env.UNI_COMPILE_EXT_API_PAGE_PATHS);
    }
    return Array.from(pages_1.pagesCacheSet);
}
exports.getUniXPagePaths = getUniXPagePaths;
