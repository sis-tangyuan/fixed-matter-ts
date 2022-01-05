import Decimal from "decimal.js";
import { Vector } from "..";
import Body from "../body/Body";
import { Common } from "../core/Common";
import Sleeping from "../core/Sleeping";
import Axes from "../geometry/Axes";
import Vertices from "../geometry/Vertices";
import MathUtil from "../math/MathUtil";

export interface ConstraintOpt {
    bodyA?: Body;
    pointA?: Vector;
    bodyB?: Body;
    pointB?: Vector;
    id?: number;
    length?: Decimal;
    label?: string;
    type?: string;
    stiffness?: Decimal;
    damping?: Decimal;
    angularStiffness?: Decimal;
    angleA?: Decimal;
    angleB?: Decimal;
}

/**
 * 约束
 */
export default class Constraint implements ConstraintOpt {
    bodyA?: Body | undefined;
    pointA: Vector;
    bodyB?: Body | undefined;
    pointB: Vector;
    id: number;
    length: Decimal;
    label: string;
    type: string;
    stiffness: Decimal;
    damping: Decimal;
    angularStiffness: Decimal;
    angleA: Decimal;
    angleB: Decimal;

    plugin: any;

    static readonly _warming = new Decimal(0.4);
    static readonly _torqueDampen = new Decimal(1);
    static readonly _minLength = new Decimal(0.0000001)

    constructor(options: ConstraintOpt) {
        Common.extend(this, options)
        
        this.pointA = options.pointA ||  Vector.create()
        this.pointB = options.pointB || Vector.create()
        if (options.length === null) {
            let initialPointA = this.bodyA != null ? (this.bodyA.position.add(this.pointA)) : this.pointA,
                initialPointB = this.bodyB != null ? (this.bodyB.position.add(this.pointB)) : this.pointB,
                length = initialPointA.sub(initialPointB).magnitude();
    
            this.length = length;
        } else {
            this.length = options.length!;
        }

        this.id = options.id || Common.nextId();
        this.label = options.label || "Constraint"
        this.type = options.type || "constraint";
        this.stiffness = options.stiffness || (options.length && options.length.gt(MathUtil.zero) ? MathUtil.ONE : new Decimal(0.7))
        this.damping = options.damping || MathUtil.ZERO;
        this.angularStiffness = options.angularStiffness || MathUtil.ZERO;
        this.angleA = options.bodyA ? options.bodyA.angle : options.angleA || MathUtil.ZERO;
        this.angleB = options.bodyB ? options.bodyB.angle : options.angleB || MathUtil.ZERO;

        this.plugin = {}
    }

    static create(options: ConstraintOpt): Constraint {
        const constraint = new Constraint(options);
        // Common.extend(constraint, options);
        return constraint;
    }

    static preSolveAll(bodies: Body[]) {
        for(let i = 0; i < bodies.length; i++) {
            let body = bodies[i],
                impluse = body.constraintImpulse;

            if (body.isSleeping || (impluse.x.isZero() && impluse.y.isZero() && impluse.angle.isZero())) {
                continue;
            }

            body.position.x = body.position.x.add(impluse.x)
            body.position.y = body.position.x.add(impluse.y)
            body.angle = body.angle.add(impluse.angle);
        }

        
    }

    static solveAll(constraints: Constraint[], timeScale: Decimal) {
        for(let i = 0; i < constraints.length; i++) {
            let constraint = constraints[i],
            fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic),
            fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);
            if (fixedA || fixedB) {
                this.solve(constraints[i], timeScale);
            }
        }

        for(let i = 0; i < constraints.length; i++) {
            let constraint = constraints[i],
            fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic),
            fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);
            if (!fixedA && !fixedB) {
                this.solve(constraints[i], timeScale);
            }
        }
    }

    static solve(constraint: Constraint, timeScale: Decimal) {
        let bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointA = constraint.pointA,
            pointB = constraint.pointB;

        if (!bodyA && !bodyB) {
            return;
        }

        // 更新相关角度
        if (bodyA && !bodyA.isStatic) {
            pointA.rotate(bodyA.angle.sub(constraint.angleA), pointA);
            constraint.angleA = bodyA.angle;
        }

        if (bodyB && !bodyB.isStatic) {
            pointA.rotate(bodyB.angle.sub(constraint.angleB), pointA);
            constraint.angleB = bodyB.angle;
        }

        let pointAWorld = pointA,
            pointBWorld = pointB;
        if (bodyA) pointAWorld = bodyA.position.add(pointA);
        if (bodyB) pointBWorld = bodyB.position.add(pointB);

        if (!pointAWorld && !pointBWorld) {
            return;
        }

        let delta = pointAWorld.sub(pointBWorld),
            currentLength = delta.magnitude();
        
        // 防止奇点
        if (currentLength.lt(Constraint._minLength)) {
            currentLength = Constraint._minLength;
        }

        // 使用 Gauss-Siedel 方法求解距离约束
        // solve distance constraint with Gauss-Siedel method
        let difference = (currentLength.sub(constraint.length)).div(currentLength),
            stiffness = constraint.stiffness.lt(MathUtil.one) ? constraint.stiffness.mul(timeScale) : constraint.stiffness,
            force = delta.mul(difference.mul(stiffness)),
            massTotal = (bodyA ? bodyA.inverseMass : MathUtil.zero).add(bodyB ? bodyB.inverseMass : MathUtil.zero),
            invertiaTotal = (bodyA ? bodyA.inverseInertia : MathUtil.zero).add(bodyB ? bodyB.inverseInertia : MathUtil.zero),
            resistanceTotal = massTotal.add(invertiaTotal),
            torque: Decimal,
            share: Decimal,
            normal: Vector = Vector.create(),
            normalVelocity: Decimal = MathUtil.ZERO,
            relativeVelocity: Vector;
        
        if (constraint.damping.gt(MathUtil.zero)) {
            let zero = Vector.create();
            normal = delta.div(currentLength)

            let velocityA = bodyA && bodyA.position.sub(bodyA.positionPrev) || Vector.create();
            let velocityB = bodyB && bodyB.position.sub(bodyB.positionPrev) || Vector.create();
            // B 相对 A的速度
            relativeVelocity = velocityB.sub(velocityA)

            normalVelocity = normal.dot(relativeVelocity);
        }

        if (bodyA && !bodyA.isStatic) {
            // 质量是总质量的比重
            share = bodyA.inverseMass.div(massTotal);

            const shareForce = force.mul(share);

            bodyA.constraintImpulse.x = bodyA.constraintImpulse.x.sub(shareForce.x);
            bodyA.constraintImpulse.y = bodyA.constraintImpulse.x.sub(shareForce.y);

            bodyA.position = bodyA.position.sub(shareForce);

            if (constraint.damping.gt(MathUtil.zero)) {
                bodyA.positionPrev = bodyA.positionPrev.sub(normal.mul(constraint.damping.mul(normalVelocity).mul(share)))
            }
            
            // 应用扭力
            torque = ((pointA.cross(force)).div(resistanceTotal)).mul(Constraint._torqueDampen.mul(bodyA.inverseInertia).mul(MathUtil.one.sub(constraint.angularStiffness)))
            bodyA.constraintImpulse.angle = bodyA.constraintImpulse.angle.sub(torque);
            bodyA.angle = bodyA.angle.sub(torque)
        }

        if (bodyB && !bodyB.isStatic) {
            share = bodyB.inverseMass.div(massTotal)

            const shareForce = force.mul(share);

            bodyB.constraintImpulse.x = bodyB.constraintImpulse.x.add(shareForce.x);
            bodyB.constraintImpulse.y = bodyB.constraintImpulse.y.add(shareForce.y);

            bodyB.position = bodyB.position.add(shareForce);

            if (constraint.damping.gt(MathUtil.zero)) {
                bodyB.positionPrev = bodyB.positionPrev.add(normal.mul(constraint.damping.mul(normalVelocity).mul(share)))
            }

            torque = (pointB.cross(force).div(resistanceTotal)).mul(Constraint._torqueDampen.mul(bodyB.inverseInertia.mul(MathUtil.one.sub(constraint.angularStiffness))))
            bodyB.constraintImpulse.angle = bodyB.constraintImpulse.angle.add(torque)
            bodyB.angle = bodyB.angle.add(torque);
        }
    }

    static postSolveAll(bodies: Body[]) {
        for(let i = 0; i < bodies.length; i++) {
            let body = bodies[i],
                impluse = body.constraintImpulse;

            if (body.isStatic || (impluse.x.isZero() || impluse.y.isZero() && impluse.angle.isZero())) {
                continue;
            }

            Sleeping.set(body, false);

            for (let j = 0; j < body.parts.length; j++) {
                var part = body.parts[j];

                const tp = Vector.create(impluse.x, impluse.y);
                Vertices.translate(part.vertices, tp);

                if (j > 0) {
                    part.position = part.position.add(tp);
                }

                if (!impluse.angle.isZero()) {
                    Vertices.rotate(part.vertices, impluse.angle, body.position);
                    Axes.rotate(part.axes, impluse.angle);
                    if (j > 0) {
                        part.position.rotateAbout(impluse.angle, body.position, part.position);
                    }

                    part.bounds.update(part.vertices, body.velocity);
                }
            }

            impluse.angle = impluse.angle.mul(Constraint._warming)
            impluse.x = impluse.x.mul(Constraint._warming)
            impluse.y = impluse.y.mul(Constraint._warming)

        }
    }

    pointAWorld(): Vector {
        const x = (this.bodyA ? this.bodyA.position.x : MathUtil.zero).add(this.pointA.x)
        const y = (this.bodyA ? this.bodyA.position.y : MathUtil.zero).add(this.pointA.y);
        return Vector.create(x, y);
    }

    pointBWorld(): Vector {
        const x = (this.bodyB ? this.bodyB.position.x : MathUtil.zero).add(this.pointB.x)
        const y = (this.bodyB ? this.bodyB.position.y : MathUtil.zero).add(this.pointB.y);
        return Vector.create(x, y);        
    }
}
