"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = __importDefault(require("decimal.js"));
const __1 = require("..");
/**
 * 定点
 */
class Vertex {
    /**
     * 默认构造
     * @param x x坐标
     * @param y y坐标
     * @param body 刚体对象
     * @param index 顶点下标
     * @param isInternal
     */
    constructor(x, y, body, index = 0, isInternal = false) {
        this.x = x;
        this.y = y;
        this.body = body;
        this.index = index;
        this.isInternal = isInternal;
    }
    static create(points, body) {
        const vertices = [];
        for (let index = 0; index < points.length; index++) {
            const point = points[index];
            vertices.push(new Vertex(point.x, point.y, body, index, false));
        }
        return vertices;
    }
    static fromPath(path, body) {
        var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig, points = [];
        path.replace(pathPattern, (match, x, y) => {
            // points.push({ x: parseFloat(x), y: parseFloat(y) });
            points.push(new __1.Vector(new decimal_js_1.default(x), new decimal_js_1.default(y)));
            return "";
        });
        return Vertex.create(points, body);
    }
}
exports.default = Vertex;
