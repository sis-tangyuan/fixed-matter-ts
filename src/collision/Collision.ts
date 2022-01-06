import Decimal from "decimal.js";
import Body from "../body/Body";
import { Common } from "../core/Common";
import Axes from "../geometry/Axes";
import Vector from "../geometry/Vector";
import Vertex from "../geometry/Vertex";
import Vertices from "../geometry/Vertices";
import MathUtil from "../math/MathUtil";
import Pair from "./Pair";
import Pairs from "./Pairs";

export class OverlapInfo {
    overlap: Decimal = MathUtil.ZERO;
    axis   : Vector = Vector.create();
}

/**
 * 碰撞信息
 */
export default class Collision {
    /**
     * A reference to the pair using this collision record, if there is one.
     * 
     * @property Pair
     * @type {Pair|null}
     * @default null
     */
    pair?: Pair;

    /**
     * 表示刚体在上一次更新的时候是否处于碰撞状态
     * @property collided
     * @type {boolean}
     * @default false
     */
    collided: boolean = false;

    /**
     * 第一个刚体
     * @property bodyA
     * @type {Body}
     */
    bodyA: Body

    /**
     * 第二个刚体
     * @property bodyB
     * @type {Body}
     */
     bodyB: Body

     /**
      * 第一个刚体的父刚体
      * @property parentA
      * @type {Body}
      */
    parentA: Body

     /**
      * 第二个刚体的父刚体
      * @property parentB
      * @type {Body}
      */
    parentB: Body


    /**
     * A `Number` that represents the minimum separating distance between the bodies along the collision normal.
     *  代表 刚体沿着碰撞法线的最小分离距离
     * @readOnly
     * @property depth
     * @type number
     * @default 0
     */
    depth: Decimal = MathUtil.ZERO;
    /**
     * A normalised `Vector` that represents the direction between the bodies that provides the minimum separating distance.
     * 一个提供给刚体间最小分离距离的单元化向量
     *
     * @property normal
     * @type vector
     * @default { x: 0, y: 0 }
     */
    normal: Vector = Vector.create()
    /**
     * A normalised `Vector` that is the tangent direction to the collision normal.
     * 碰撞法线的切线方向的一个单元化向量
     * @property tangent
     * @type vector
     * @default { x: 0, y: 0 }
     */
    tangent: Vector = Vector.create()

    /**
     * A `Vector` that represents the direction and depth of the collision.
     * 表示碰撞的方向和深度的一个向量（非单元化）
     * @property penetration
     * @type vector
     * @default { x: 0, y: 0 }
     */
    penetration: Vector = Vector.create()
    
     /**
     * An array of body vertices that represent the support points in the collision.
     * These are the deepest vertices (along the collision normal) of each body that are contained by the other body's vertices.
     * 
     * @property supports
     * @type vector[]
     * @default []
     */
    supports: Vertex[] = []

    static _overlapAB: OverlapInfo = new OverlapInfo();
    static _overlapBA: OverlapInfo = new OverlapInfo();

    constructor(bodyA: Body, bodyB: Body) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.parentA = bodyA.parent
        this.parentB = bodyB.parent;
    }

    /**
     * 碰撞检测
     * @param bodyA 
     * @param bodyB 
     * @param pairs 
     */
     public static collides(bodyA: Body, bodyB: Body, pairs?: Pairs): Collision|undefined|null {
        this._overlapAxes(this._overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes)
        if (this._overlapAB.overlap.lte(MathUtil.zero)) {
            return null;
        }

        this._overlapAxes(this._overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);
        if (this._overlapBA.overlap.lte(MathUtil.zero)) {
            return null;
        }
        
        // 重复利用缓存
        var pair = pairs && pairs.table.get(Pair.genID(bodyA, bodyB)),
            collision: Collision;
        if (!pair) {
            collision = new Collision(bodyA, bodyB);
            collision.collided = true;
            collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
            collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
            collision.parentA = collision.bodyA.parent;
            collision.parentB = collision.bodyB.parent;
        } else {
            collision = pair.collision
        }

        bodyA = collision.bodyA
        bodyB = collision.bodyB

        const minOverlap = this._overlapAB.overlap.lt(this._overlapBA.overlap) ? this._overlapAB : this._overlapBA;

        let normal = collision.normal,
            supports = collision.supports,
            minAxis = minOverlap.axis;
        
        // 保证normal永远背离bodyA
        if (minAxis.dot(bodyB.position.sub(bodyA.position)).lt(MathUtil.zero)) {
            normal.copy(minAxis)
        } else {
            normal.copy(minAxis.mul(new Decimal(-1)))
        }

        collision.tangent = normal.prep();

        collision.depth = minOverlap.overlap

        collision.penetration = normal.mul(collision.depth)

        // 找出支持碰撞的点，永远有1~2个
        let supportB = this._findSupports(bodyA, bodyB, normal, new Decimal(1)),
            supportCount = 0;
        
        if (Vertices.contain(bodyA.vertices, supportB[0].vector)) {
            supports[supportCount++] = supportB[0]
        }

        if (Vertices.contain(bodyA.vertices, supportB[1].vector)) {
            supports[supportCount++] = supportB[1]
        }

        if (supportCount < 2) {
            let supportA = this._findSupports(bodyB, bodyA, normal, new Decimal(-1));
            
            if (Vertices.contain(bodyB.vertices, supportA[0].vector)) {
                supports[supportCount++] = supportA[0]
            }

            if (supportCount < 2 && Vertices.contain(bodyB.vertices, supportA[1].vector)) {
                supports[supportCount++] = supportA[1]
            } 
        }

        if (supportCount === 0) {
            supports[supportCount++] = supportB[0];
        }

        supports.length = supportCount;

        collision.supports = supports;

        return collision;
    }

    /**
     * 通过分离轴定理 计算出 相交的轴和相交深度
     * @param result 
     * @param verticesA 
     * @param verticesB 
     * @param axes verticesA的边框法线列表
     */
    private static _overlapAxes(result: OverlapInfo, verticesA: Vertex[], verticesB: Vertex[], axes: Vector[]) {
        var verticesALength = verticesA.length,
            verticesBLength = verticesB.length,
            axesLength = axes.length,
            overlapMin = new Decimal(Number.MAX_VALUE),
            overlapAxisNumber = 0,
            overlap: Decimal,
            overlapAB: Decimal,
            overlapBA: Decimal,
            dot,
            i,
            j,
            zero = MathUtil.ZERO;

        for (i = 0; i < axesLength; i++) {
            let axis = axes[i],
                minA = verticesA[0].vector.dot(axis),
                minB = verticesB[0].vector.dot(axis),
                maxA = minA.add(zero),
                maxB = minB.add(zero);
            
            for (j = 0; j < verticesALength; j++) {
                dot = verticesA[j].vector.dot(axis)
                if (dot.gt(maxA)) {
                    maxA = dot;
                } else if (dot.lt(minA)) {
                    minA = dot;
                }
            }

            for (j = 0; j < verticesBLength; j++) {
                dot = verticesB[j].vector.dot(axis)
                if (dot.gt(maxA)) {
                    maxA = dot;
                } else if (dot.lt(minA)) {
                    minA = dot;
                }
            }

            overlapAB = maxA.sub(minB);
            overlapBA = maxB.sub(minA);
            overlap = overlapAB.lt(overlapBA) ? overlapAB : overlapBA;
            if (overlap.lt(overlapMin)) {
                overlapMin = overlap;
                overlapAxisNumber = i;

                if (overlap.lt(zero)) {
                    break;
                }
            }
        }
        result.axis = axes[overlapAxisNumber]
        result.overlap = overlapMin
    }

    /**
     * 找出bodyB所有顶点距离normal最近的点，以及相邻两个顶点中最近的一个点
     * 爬山算法
     * bodyB顶点指向bodyA位置的向量在normal上投影最短的也就是离bodyA近的点
     * @param bodyA 
     * @param bodyB 
     * @param normal 背离bodyA的发现
     * @param direction 
     */
    private static _findSupports(bodyA: Body, bodyB: Body, normal: Vector, direction: Decimal): Vertex[] {
        var vertices = bodyB.vertices,
            verticesLength = vertices.length,
            bodyAPosition = bodyA.position,
            nearestDistance = new Decimal(Number.MAX_VALUE),
            // 最近点
            vertexA: Vertex,
            // 上一个点
            vertexB: Vertex,
            // 下一个点
            vertexC: Vertex,
            // 距离
            distance: Decimal,
            j;

        normal = normal.mul(direction);

        for (j = 0; j < verticesLength; j++) {
            vertexB = vertices[j];
            distance = normal.dot(bodyAPosition.sub(vertexB.vector))

            if (distance.lt(nearestDistance)) {
                nearestDistance = distance.add(MathUtil.zero)
                vertexA = vertexB
            }
        }

        vertexC = vertices[(verticesLength + vertexA!.index - 1) % verticesLength]
        nearestDistance = normal.dot(vertexC.vector)
        
        vertexB = vertices[(vertexA!.index + 1) % verticesLength]
        const support: Vertex[] = [];
        if (normal.dot(vertexB.vector).lt(nearestDistance)) {
            support.push(vertexA!);
            support.push(vertexB)
            return support;
        }

        support.push(vertexA!)
        support.push(vertexC)
        return support

    }
}