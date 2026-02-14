"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uni_shared_1 = require("@dcloudio/uni-shared");
function polyfill() {
    const shared = require('@vue/shared');
    shared.isGloballyAllowed = uni_shared_1.isGloballyAllowed;
    shared.isGloballyWhitelisted = uni_shared_1.isGloballyAllowed;
}
polyfill();
