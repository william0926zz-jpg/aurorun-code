"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppStyleIsolation = exports.getAppCodeSplitting = exports.getAppRenderer = void 0;
function getAppRenderer(manifestJson) {
    const platformOptions = manifestJson['app-plus'];
    if (platformOptions && platformOptions.renderer === 'native') {
        return 'native';
    }
    return '';
}
exports.getAppRenderer = getAppRenderer;
function getAppCodeSplitting(manifestJson) {
    if (manifestJson['app-plus']?.optimization?.codeSplitting === true) {
        return true;
    }
    return false;
}
exports.getAppCodeSplitting = getAppCodeSplitting;
function getAppStyleIsolation(manifestJson) {
    return (manifestJson['app-plus']?.optimization?.styleIsolation ?? 'apply-shared');
}
exports.getAppStyleIsolation = getAppStyleIsolation;
