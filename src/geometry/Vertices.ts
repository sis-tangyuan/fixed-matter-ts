import Decimal from "decimal.js";
import { Vector, Vertices } from "..";
import Body from "../body/Body";

/**
 * 定点
 */
export default class Vertex {
    x: Decimal;
    y: Decimal;
    index: number; // 整数类型的下标
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
    constructor(x: Decimal, y: Decimal, body: Body, index: number = 0, isInternal: boolean = false) {
        this.x = x;
        this.y = y;
        this.body = body;
        this.index = index;
        this.isInternal = isInternal;
    }

    public static create(points: Vector[], body: Body): Vertex[] {
        const vertices: Vertex[] = [];
        for(let index = 0; index < points.length; index++) {
            const point = points[index];
            vertices.push(new Vertex(point.x, point.y, body, index, false))
        }
        return vertices;
    }

    public static fromPath(path: string, body: Body): Vertex[] {
        var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig,
            points: Vector[] = [];

        path.replace(pathPattern, (match: any, x: number, y: number) => {
            // points.push({ x: parseFloat(x), y: parseFloat(y) });
            points.push(new Vector(new Decimal(x), new Decimal(y)))
            return ""
        });
        return Vertex.create(points, body);
    }
}