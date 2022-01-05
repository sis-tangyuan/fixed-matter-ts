import Decimal from "decimal.js";
import { Vector } from "..";
import Body from "../body/Body";
import { Common } from "../core/Common";

/**
 * 定点
 */
export default class Vertex extends Vector {
    // x: Decimal;
    // y: Decimal;
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
        super(x, y)
        // this.x = x;
        // this.y = y;
        this.body = body;
        this.index = index;
        this.isInternal = isInternal;
    }

    public static createByXY(x: number, y: number): Vertex {
        return new Vertex(new Decimal(x), new Decimal(y))
    }



    get vector(): Vector {
        return new Vector(this.x, this.y);
    }

}