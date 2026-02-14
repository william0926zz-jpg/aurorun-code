"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUniXAppAndroidPackage = exports.parseUniXSplashScreen = exports.parseUniXFlexDirection = void 0;
const shared_1 = require("@vue/shared");
const flexDirs = ['row', 'row-reverse', 'column', 'column-reverse'];
function parseUniXFlexDirection(manifestJson) {
    const flexDir = manifestJson?.['uni-app-x']?.['flex-direction'];
    if (flexDir && flexDirs.includes(flexDir)) {
        return flexDir;
    }
    return 'column';
}
exports.parseUniXFlexDirection = parseUniXFlexDirection;
function parseUniXSplashScreen(platform, manifestJson) {
    const splashScreen = (manifestJson?.[platform] || manifestJson?.app)?.['splashScreen'];
    if ((0, shared_1.isPlainObject)(splashScreen)) {
        return splashScreen;
    }
    return false;
}
exports.parseUniXSplashScreen = parseUniXSplashScreen;
function parseUniXAppAndroidPackage(appid) {
    return 'uni.' + appid.replace(/_/g, '');
}
exports.parseUniXAppAndroidPackage = parseUniXAppAndroidPackage;
