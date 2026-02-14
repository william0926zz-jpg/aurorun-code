"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInHBuilderX = void 0;
const path_1 = __importDefault(require("path"));
const uni_shared_1 = require("@dcloudio/uni-shared");
exports.isInHBuilderX = (0, uni_shared_1.once)(() => {
    // 自动化测试传入了 HX_APP_ROOT(其实就是UNI_HBUILDERX_PLUGINS)
    if (process.env.HX_APP_ROOT) {
        process.env.UNI_HBUILDERX_PLUGINS = process.env.HX_APP_ROOT + '/plugins';
        return true;
    }
    try {
        const { name } = require(path_1.default.resolve(process.cwd(), '../about/package.json'));
        if (name === 'about') {
            process.env.UNI_HBUILDERX_PLUGINS = path_1.default.resolve(process.cwd(), '..');
            return true;
        }
    }
    catch (e) {
        // console.error(e)
    }
    return false;
});
