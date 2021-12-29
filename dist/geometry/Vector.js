"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = __importDefault(require("decimal.js"));
const Common_1 = require("../core/Common");
/**
 * 2D 向量，代表位置，位移，方向
 */
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static create(x, y) {
        return new Vector(x || Common_1.Common.ZERO, y || Common_1.Common.ZERO);
    }
    static fromFixXY(x, y) {
        const vec = this.create();
        vec.x = x;
        vec.y = y;
        return vec;
    }
    /**
     * 克隆
     * TODO: 测试 toNumber是否有精度问题
     * @param vector
     * @returns
     */
    clone(vector) {
        const x = new decimal_js_1.default(vector.x.toNumber());
        const y = new decimal_js_1.default(vector.y.toNumber());
        return new Vector(x, y);
    }
    /**
     * 向量的长度
     * @returns
     */
    magnitude() {
        const xx = this.x.mul(this.x);
        const yy = this.y.mul(this.y);
        const addXY = xx.add(yy);
        const sqrXY = addXY.sqrt();
        return sqrXY;
    }
    /**
     * 长度的平方
     * @returns
     */
    magnitudeSquared() {
        const xx = this.x.mul(this.x);
        const yy = this.y.mul(this.y);
        const addXY = xx.add(yy);
        return addXY;
    }
    /**
     * 旋转
     * @param angle 角度
     * @param output 输出，可选
     * @returns
     */
    rotate(angle, output) {
        output = output || Vector.create();
        const cos = angle.cos();
        const sin = angle.sin();
        const x = this.x.mul(cos).sub(this.y.mul(sin));
        const y = this.x.mul(sin).add(this.y.mul(cos));
        output.x = x;
        output.y = y;
        return output;
    }
    /**
     * 位置点旋转
     * @param angle
     * @param point 旋转点
     * @param output
     * @returns
     */
    routeAbout(angle, point, output) {
        output = output || Vector.create();
        const cos = angle.cos();
        const sin = angle.sin();
        const deltaX = this.x.sub(point.x);
        const deltaY = this.y.sub(point.y);
        const x = point.x.add(deltaX.mul(cos).sub(deltaY.mul(sin)));
        const y = point.y.add(deltaX.mul(sin).add(deltaY.mul(cos)));
        output.x = x;
        output.y = y;
        return output;
    }
    /**
     * 获取该向量的长度为1的向量
     */
    normalise() {
        const length = this.magnitude();
        if (length.eq(Common_1.Common.ZERO)) {
            return Vector.create();
        }
        return Vector.fromFixXY(this.x.div(length), this.y.div(length));
    }
    /**
     * 获取点乘结果
     * ab 点乘，a未单元向量的情况下，点乘结果是b在a上的投影
     * @param vector
     */
    dot(vector) {
        return this.x.mul(vector.x).add(this.y.mul(vector.y));
    }
    /**
     * 叉乘
     * axb是两个向量构成的四边形的面积
     * axb = |a||b|sin(∂)
     * @param vector
     */
    cross(vector) {
        return (this.x.mul(vector.y).sub(this.y.mul(vector.x)));
    }
    /**
     *
     * @param vector1
     * @param vector2
     * @returns
     */
    cross3(vector1, vector2) {
        return (vector1.x.sub(this.x)).mul(vector2.y.sub(this.y)).sub(vector1.y.sub(this.y).mul(vector2.x.sub(this.x)));
    }
    /**
     * 相加
     * @param vector
     * @param output
     * @returns
     */
    add(vector, output) {
        output = output || Vector.create();
        output.x = this.x.add(vector.x);
        output.y = this.y.add(vector.y);
        return output;
    }
    /**
     * 相减
     * @param vector
     * @param output
     * @returns
     */
    sub(vector, output) {
        output = output || Vector.create();
        output.x = this.x.sub(vector.x);
        output.y = this.y.sub(vector.y);
        return output;
    }
    /**
     * 乘与标量
     * @param scalar
     * @returns
     */
    mul(scalar) {
        return Vector.fromFixXY(this.x.mul(scalar), this.y.mul(scalar));
    }
    /**
     * 除与标量
     * @param scalar
     * @returns
     */
    div(scalar) {
        return Vector.fromFixXY(this.x.div(scalar), this.y.div(scalar));
    }
    /**
     * 获取垂直线，也就是向量的法线
     * @param nagate 是否取反
     */
    prep(nagate) {
        if (!nagate) {
            return Vector.fromFixXY(this.y.neg(), this.x);
        }
        else {
            return Vector.fromFixXY(this.y, this.x.neg());
        }
    }
    /**
     * 取反
     * @returns
     */
    neg() {
        return Vector.fromFixXY(this.x.neg(), this.y.neg());
    }
    /**
     * 本顶点 到 vec 顶点 的向量 在x轴上的旋转角度
     * @param vec
     * @returns
     */
    angle(vec) {
        const deltaX = vec.x.sub(this.x);
        const deltaY = vec.y.sub(this.y);
        return decimal_js_1.default.atan2(deltaY, deltaX);
    }
}
exports.default = Vector;
