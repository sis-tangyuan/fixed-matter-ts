import Decimal from "decimal.js";
import { Vector } from "..";
import Body from "../body/Body";
/**
 * 定点
 */
export default class Vertex {
    x: Decimal;
    y: Decimal;
    index: number;
    isInternal: boolean;
    body: Body;
    /**
     * 默认构造
     * @param x x坐标
     * @param y y坐标
     * @param body 刚体对象
     * @param index 顶点下标
     * @param isInternal
     */
    constructor(x: Decimal, y: Decimal, body: Body, index?: number, isInternal?: boolean);
    static create(points: Vector[], body: Body): Vertex[];
    static fromPath(path: string, body: Body): Vertex[];
}
