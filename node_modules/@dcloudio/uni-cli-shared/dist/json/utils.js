"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPagesJson = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("@vue/shared");
const jsonc_parser_1 = require("jsonc-parser");
const utils_1 = require("../utils");
const utils_2 = require("../vite/plugins/vitejs/utils");
const messages_1 = require("../messages");
function checkPagesJson(jsonStr, inputDir) {
    if (!inputDir) {
        return false;
    }
    const errors = [];
    const root = (0, jsonc_parser_1.parseTree)(jsonStr, errors);
    if (!root) {
        if (errors.length) {
            for (const error of errors) {
                const { line, column } = (0, utils_2.offsetToLineColumn)(jsonStr, error.offset);
                throw {
                    name: 'SyntaxError',
                    code: error.error,
                    message: (0, jsonc_parser_1.printParseErrorCode)(error.error),
                    loc: {
                        start: { line, column },
                    },
                    offsetStart: error.offset,
                    offsetEnd: error.offset + error.length,
                };
            }
        }
        return false;
    }
    const pagePathNodes = walkNodes(findRootNode(root, ['pages']));
    findRootNode(root, ['subPackages', 'subpackages']).forEach((node) => {
        const subPackageRoot = findSubPackageRoot(node);
        if (subPackageRoot) {
            findRootNode(node, ['pages']).forEach((subNode) => {
                walkNodes(subNode.children ?? []).forEach((node) => {
                    pagePathNodes.push({
                        ...node,
                        value: (0, utils_1.normalizePath)(path_1.default.join(subPackageRoot, node.value)),
                    });
                });
            });
        }
    });
    if (pagePathNodes.length) {
        for (const node of pagePathNodes) {
            const pagePath = node.value ?? '';
            if (pageExistsWithCaseSync(path_1.default.join(inputDir, pagePath))) {
                continue;
            }
            const { line, column } = (0, utils_2.offsetToLineColumn)(jsonStr, node.offset);
            throw {
                name: 'CompilerError',
                code: 'CompilerError',
                message: messages_1.M['pages.json.page.notfound'].replace('{pagePath}', pagePath),
                loc: {
                    start: { line, column },
                },
                offsetStart: node.offset,
                offsetEnd: node.offset + node.length,
            };
        }
    }
    return true;
}
exports.checkPagesJson = checkPagesJson;
function pageExistsWithCaseSync(pagePath) {
    try {
        const files = fs_1.default.readdirSync(path_1.default.dirname(pagePath));
        const basename = path_1.default.basename(pagePath);
        const uvuePage = basename + '.uvue';
        const vuePage = basename + '.vue';
        return files.some((file) => file === uvuePage || file === vuePage);
    }
    catch (e) {
        return false;
    }
}
function findSubPackageRoot(node) {
    const child = node.children?.find((child) => child.type === 'property' &&
        child.children &&
        child.children.find((child) => child.type === 'string' && child.value === 'root'));
    if (child && child.children?.length === 2) {
        return child.children[1].value;
    }
    return '';
}
function findRootNode(node, property) {
    const { type, children } = node;
    if (type === 'object' && children) {
        const child = children.find((child) => child.type === 'property' &&
            child.children &&
            child.children.find((child) => child.type === 'string' && property.includes(child.value)));
        if (child) {
            const node = child.children.find((child) => child.type === 'array');
            return node?.children ?? [];
        }
    }
    return [];
}
function walkNodes(node) {
    const pagePathNodes = [];
    node.forEach((node) => walkNode(node, pagePathNodes));
    return pagePathNodes;
}
function walkNode(node, pagePathNodes) {
    const { type, children } = node;
    if (type === 'property' && children && children.length === 2) {
        const maybePagePathNode = children[0];
        const maybePagePathValueNode = children[1];
        if (maybePagePathNode.type === 'string' &&
            maybePagePathNode.value === 'path' &&
            maybePagePathValueNode.type === 'string' &&
            (0, shared_1.isString)(maybePagePathValueNode.value)) {
            pagePathNodes.push(maybePagePathValueNode);
        }
    }
    if (children) {
        children.forEach((node) => walkNode(node, pagePathNodes));
    }
}
