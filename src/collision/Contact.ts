import Decimal from "decimal.js";
import { Vertex } from "..";
import { Common } from "../core/Common";
import MathUtil from "../math/MathUtil";

/**
 * 触摸点
 */
export default class Contact {
    
    readonly vertex: Vertex

    // 法线冲量值
    normalImpulse: Decimal

    // 切线冲量值
    tangentImpulse: Decimal

    constructor(vertex: Vertex) {
        this.vertex = vertex;
        this.normalImpulse = MathUtil.ZERO;
        this.tangentImpulse = MathUtil.ZERO;

    }
}