import Body, { CollisionFilter } from "../body/Body";
import { Common } from "../core/Common";
import Collision from "./Collision";
import Pairs from "./Pairs";

export default class Detector {
    /**
     * The array of `Matter.Body` between which the detector finds collisions.
     * 
     * _Note:_ The order of bodies in this array _is not fixed_ and will be continually managed by the detector.
     * 
     * 探测器查找碰撞信息的刚体数组
     * 
     * 注意：刚体的排序不是固定的，将由探测器持续管理
     * @property bodies
     * @type body[]
     * @default []
     */
    bodies: Body[] = []

    /**
     * Optional. A `Matter.Pairs` object from which previous collision objects may be reused. Intended for internal `Matter.Engine` usage.
     * 可选的。Pairs可能重新使用之前的碰撞对象。替代内部使用的Engine
     * @property pairs
     * @type {pairs|null}
     * @default null
     */
    pairs?: Pairs

    /**
     * 创建探测器
     * @param option 
     * @returns 
     */
    static create(option: any): Detector {
        let detector = new Detector();
        detector = Common.extend(detector, option)
        return detector;
    }

    /**
     * 设置刚体数组
     * @param bodies 
     */
    setBodies(bodies: Body[]) {
        this.bodies = bodies.slice(0)
    }

    /**
     * 清理刚体数组
     */
    clear() {
        this.bodies = []
    }

    /**
     * 是否能碰撞
     * @param filterA 过滤器1
     * @param filterB 过滤器2
     * @returns true表示能碰撞
     */
    canCollide(filterA: CollisionFilter, filterB: CollisionFilter): boolean {
        if (filterA.group == filterB.group && filterA.group !== 0) {
            return filterA.group > 0
        }
        return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
    }

    _compareBoundsX(bodyA: Body, bodyB: Body): number {
        return bodyA.bounds.min.x.sub(bodyB.bounds.min.x).toNumber()
    }

        /**
     * Efficiently finds all collisions among all the bodies in `detector.bodies` using a broadphase algorithm.
     * 
     * _Note:_ The specific ordering of collisions returned is not guaranteed between releases and may change for performance reasons.
     * If a specific ordering is required then apply a sort to the resulting array.
     * 使用宽阶算法在所有刚体中高效的找出所有碰撞
     * 注意：不同版本之间无法保证返回的冲突的特定顺序，并且可能会因性能原因而更改。
     * @method collisions
     * @return {Collision[]} collisions
     */
    collissions(): Collision[] {
        var collisions: Collision[] = [],
            bodiesLength = this.bodies.length,
            i,
            j;
        this.bodies.sort(this._compareBoundsX)

        for (i = 0; i < bodiesLength; i++) {
            let bodyA = this.bodies[i],
                boundsA = bodyA.bounds,
                boundsXMax = bodyA.bounds.max.x,
                boundsYMax = bodyA.bounds.max.y,
                boundsYMin = bodyA.bounds.min.y,
                bodyAStatic = bodyA.isStatic || bodyA.isSleeping,
                partsALength = bodyA.parts.length,
                partsASingle = partsALength === 1;

            for (j = i+i; j < bodiesLength; j++) {
                var bodyB = this.bodies[j],
                    boundsB = bodyB.bounds;
                
                    // > bodyA 最大的max，说明接下来所有body都不需要检测了
                if (boundsB.min.x.gt(boundsXMax)) {
                    break;
                }

                if (boundsYMax.lt(boundsB.min.y) || boundsYMin.gt(boundsB.max.y)) {
                    continue;
                }

                if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {
                    continue;
                }

                if (!this.canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
                    continue;
                }

                let partsBLength = bodyB.parts.length;

                if (partsASingle && partsBLength === 1) {
                    let collision = Collision.collides(bodyA, bodyB, this.pairs)
                    if (collision) {
                        collisions.push(collision)
                    }
                } else {
                    let partsAStart = partsALength > 1 ? 1 : 0,
                        partsBStart = partsBLength > 1 ? 1 : 0;
                    for (let k = partsALength; k < partsALength; k++) {
                        let partA = bodyA.parts[k],
                            boundsA = partA.bounds;
                        for (let z = partsBLength; z < partsBLength; z++) {
                            let partB = bodyB.parts[z],
                                boundsB = partB.bounds;
                            
                            if (boundsA.unOverlaps(boundsB)) {
                                continue
                            }

                            var collision = Collision.collides(partA, partB, this.pairs)

                            if (collision) {
                                collisions.push(collision)
                            }
                        }
                    }
                }
            }

        }

        return collisions;
    }
}