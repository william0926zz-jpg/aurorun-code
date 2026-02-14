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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPagesJson = exports.parseUniXAppAndroidPackage = exports.getUniXPagePaths = exports.isUniXPageFile = exports.parseUniXSplashScreen = exports.parseUniXFlexDirection = exports.normalizeUniAppXAppConfig = exports.normalizeUniAppXAppPagesJson = void 0;
__exportStar(require("./mp"), exports);
__exportStar(require("./app"), exports);
__exportStar(require("./json"), exports);
__exportStar(require("./pages"), exports);
__exportStar(require("./manifest"), exports);
__exportStar(require("./theme"), exports);
var uni_x_1 = require("./uni-x");
Object.defineProperty(exports, "normalizeUniAppXAppPagesJson", { enumerable: true, get: function () { return uni_x_1.normalizeUniAppXAppPagesJson; } });
Object.defineProperty(exports, "normalizeUniAppXAppConfig", { enumerable: true, get: function () { return uni_x_1.normalizeUniAppXAppConfig; } });
Object.defineProperty(exports, "parseUniXFlexDirection", { enumerable: true, get: function () { return uni_x_1.parseUniXFlexDirection; } });
Object.defineProperty(exports, "parseUniXSplashScreen", { enumerable: true, get: function () { return uni_x_1.parseUniXSplashScreen; } });
Object.defineProperty(exports, "isUniXPageFile", { enumerable: true, get: function () { return uni_x_1.isUniXPageFile; } });
Object.defineProperty(exports, "getUniXPagePaths", { enumerable: true, get: function () { return uni_x_1.getUniXPagePaths; } });
Object.defineProperty(exports, "parseUniXAppAndroidPackage", { enumerable: true, get: function () { return uni_x_1.parseUniXAppAndroidPackage; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "checkPagesJson", { enumerable: true, get: function () { return utils_1.checkPagesJson; } });
