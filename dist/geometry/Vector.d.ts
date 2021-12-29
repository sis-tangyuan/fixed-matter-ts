import Decimal from "decimal.js";
/**
 * 2D 向量，代表位置，位移，方向
 */
export default class Vector {
    x: Decimal;
    y: Decimal;
    constructor(x: Decimal, y: Decimal);
    static create(x?: Decimal, y?: Decimal): Vector;
    static fromFixXY(x: Decimal, y: Decimal): Vector;
    /**
     * 克隆
     * TODO: 测试 toNumber是否有精度问题
     * @param vector
     * @returns
     */
    clone(vector: Vector): Vector;
    /**
     * 向量的长度
     * @returns
     */
    magnitude(): Decimal;
    /**
     * 长度的平方
     * @returns
     */
    magnitudeSquared(): Decimal;
    /**
     * 旋转
     * @param angle 角度
     * @param output 输出，可选
     * @returns
     */
    rotate(angle: Decimal, output?: Vector): Vector;
    /**
     * 位置点旋转
     * @param angle
     * @param point 旋转点
     * @param output
     * @returns
     */
    routeAbout(angle: Decimal, point: Vector, output?: Vector): Vector;
    /**
     * 获取该向量的长度为1的向量
     */
    normalise(): Vector;
    /**
     * 获取点乘结果
     * ab 点乘，a未单元向量的情况下，点乘结果是b在a上的投影
     * @param vector
     */
    dot(vector: Vector): Decimal;
    /**
     * 叉乘
     * axb是两个向量构成的四边形的面积
     * axb = |a||b|sin(∂)
     * @param vector
     */
    cross(vector: Vector): Decimal;
    /**
     *
     * @param vector1
     * @param vector2
     * @returns
     */
    cross3(vector1: Vector, vector2: Vector): Decimal;
    /**
     * 相加
     * @param vector
     * @param output
     * @returns
     */
    add(vector: Vector, output?: Vector): Vector;
    /**
     * 相减
     * @param vector
     * @param output
     * @returns
     */
    sub(vector: Vector, output?: Vector): Vector;
    /**
     * 乘与标量
     * @param scalar
     * @returns
     */
    mul(scalar: Decimal): Vector;
    /**
     * 除与标量
     * @param scalar
     * @returns
     */
    div(scalar: Decimal): Vector;
    /**
     * 获取垂直线，也就是向量的法线
     * @param nagate 是否取反
     */
    prep(nagate?: boolean): Vector;
    /**
     * 取反
     * @returns
     */
    neg(): Vector;
    /**
     * 本顶点 到 vec 顶点 的向量 在x轴上的旋转角度
     * @param vec
     * @returns
     */
    angle(vec: Vector): Decimal;
}
