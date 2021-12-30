import Decimal from "decimal.js";
import { Vector, Vertex } from "..";
import Body from "../body/Body";
import { Common } from "../core/Common";
import Axes from "../geometry/Axes";
import Pair from "./Pair";

export class OverlapInfo {
    overlap: number = 0;
    axis   : Axes[] = [];
}

/**
 * 碰撞信息
 */
export default class Collision {
    pair?: Pair;
    collided: boolean;
    bodyA: Body
    bodyB: Body
    parentA?: Body
    parentB?: Body
    // 碰撞深度
    depth: Decimal
    // 法线
    normal: Vector
    // 切线
    tangent: Vector

    // 渗透
    // A `Vector` that represents the direction and depth of the collision.
    penetration: Vector
    
    /**
     * An array of body vertices that represent the support points in the collision.
     * These are the deepest vertices (along the collision normal) of each body that are contained by the other body's vertices.
     */
    support: Vertex[]

    _overlapAB: OverlapInfo = new OverlapInfo();
    _overlapBA: OverlapInfo = new OverlapInfo();

    constructor(bodyA: Body, bodyB: Body) {
        this.collided = false;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.parentA = bodyA.parent
        this.parentB = bodyB.parent;
        this.depth = Common.ZERO;
        this.normal = Vector.create();
        this.tangent = Vector.create();
        this.penetration = Vector.create();
        this.support = [];
    }

    private static _overlapAxes(result: OverlapInfo, verticesA: Vector[], verticesB: Vector[], axes: Axes[]) {
        
    }
}