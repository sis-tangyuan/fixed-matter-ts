import Decimal from "decimal.js";
import { Vector, Vertices } from "..";
import Body from "../body/Body";
import { Common } from "../core/Common";

/**
 * 定点
 */
export default class Vertex {
    x: Decimal;
    y: Decimal;
    index: number; // 整数类型的下标
    isInternal: boolean;
    body?: Body;

    /**
     * 默认构造
     * @param x x坐标
     * @param y y坐标
     * @param body 刚体对象
     * @param index 顶点下标
     * @param isInternal 
     */
    constructor(x: Decimal, y: Decimal, body?: Body, index: number = 0, isInternal: boolean = false) {
        this.x = x;
        this.y = y;
        this.body = body;
        this.index = index;
        this.isInternal = isInternal;
    }

    public static createByXY(x: number, y: number): Vertex {
        return new Vertex(new Decimal(x), new Decimal(y))
    }

    public static create(points: Vector[], body?: Body): Vertex[] {
        const vertices: Vertex[] = [];
        for(let index = 0; index < points.length; index++) {
            const point = points[index];
            vertices.push(new Vertex(point.x, point.y, body, index, false))
        }
        return vertices;
    }

    public static fromPath(path: string, body?: Body): Vertex[] {
        var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig,
            points: Vector[] = [];

        path.replace(pathPattern, (match: any, x: number, y: number) => {
            // points.push({ x: parseFloat(x), y: parseFloat(y) });
            points.push(new Vector(new Decimal(x), new Decimal(y)))
            return ""
        });
        return Vertex.create(points, body);
    }

    /**
     * 多边形面积
     * @param vertices 顶点
     * @param unsigned 是否无符号
     */
    public static area(vertices: Vertex[], unsigned: boolean = false): Decimal {
        var area = Common.ZERO,
        j = vertices.length - 1;
        for (let i = 0; i < vertices.length; i++) {
            const dx = vertices[j].x.sub(vertices[i].x)
            const dy = vertices[j].y.add(vertices[i].y);
            area = area.add(dx.mul(dy))
            j = i;
        }
        if (unsigned) {
            return area.div(new Decimal(2)).abs()
        }
        return area.div(new Decimal(2));
    }
}