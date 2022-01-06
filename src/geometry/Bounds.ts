import Decimal from "decimal.js";
import { Common } from "../core/Common";
import Vector from "./Vector";
import Vertex from "./Vertex";

/**
 * AABB 轴对齐边框盒
 */
export default class Bounds {

    min: Vector;

    max: Vector;

    /**
     * 默认够着
     * @param min 左下角
     * @param max 右上角
     */
    constructor(min?: Vector, max?: Vector) {
        this.min = min || Vector.create();
        this.max = max || Vector.create();
    }

    /**
     * 创建AABB
     * @param vertices 顶点列表
     * @returns 一个新的AABB
     */
    public static create(vertices: Vertex[] | Vector[]): Bounds {
        const bounds = new Bounds();
        bounds.update(vertices);
        return bounds;
    }

    /**
     * 通过指定顶点更新aabb，并通过velocity拓展
     * @param vertices 
     * @param velocity 
     */
    update(vertices: Vertex[] | Vector[], velocity?: Vector) {
        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            if (vertex.x.gt(this.max.x)) this.max.x = vertex.x;
            if (vertex.x.lt(this.min.x)) this.min.x = vertex.x;
            if (vertex.y.gt(this.max.y)) this.max.y = vertex.y;
            if (vertex.y.lt(this.min.y)) this.min.y = vertex.y;
        }

        if (velocity != null) {
            if (velocity.x.gt(0)) {
                this.max.xx = this.max.x.add(velocity.x)
            } else {
                this.min.xx = this.min.x.add(velocity.x)
            }

            if (velocity.y.gt(0)) {
                this.max.yy = this.max.y.add(velocity.y)
            } else {
                this.min.yy = this.min.y.add(velocity.y)
            }
        }
    }

    /**
     * 是否包含点
     * @param point 点
     * @returns 
     */
    contains(point: Vector): boolean {
        return point.x.gte(this.min.x) && point.x.lte(this.max.x)
            && point.y.gte(this.min.y) && point.y.lte(this.max.y)
    }

    /**
     * 是否bounds相交
     * @param bounds 
     */
    overlaps(bounds: Bounds): boolean {
        return this.min.x.lte(bounds.max.x) && this.max.x.gte(bounds.min.x)
            && this.min.y.lte(bounds.max.y) && this.max.y.gte(bounds.min.y)
    }

    /**
     * 不相交
     * @param bounds 
     */
    unOverlaps(bounds: Bounds): boolean {
        return this.min.x.gt(bounds.max.x) || this.max.x.lt(bounds.min.x)
            || this.max.y.lt(bounds.min.y) || this.min.y.gt(bounds.max.y)
    }

    /**
     * 位置转换
     * @param vector 
     */
    translate(vector: Vector) {
        this.min.xx = this.min.x.add(vector.x);
        this.min.yy = this.min.y.add(vector.y);
        this.max.xx = this.max.x.add(vector.x);
        this.max.yy = this.max.y.add(vector.y);
    }

    /**
     * 移动到指定位置
     * @param position 
     */
    shift(position: Vector) {
        const deltaX = this.max.x.sub(this.min.x),
              deltaY = this.max.y.sub(this.min.y);
        this.min.x = position.x;
        this.max.xx = position.x.add(deltaX)
        this.min.y = position.y;
        this.max.yy = position.y.add(deltaY)
    }
}