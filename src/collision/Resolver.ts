import Decimal from "decimal.js";
import { Vector } from "..";
import Body from "../body/Body";
import Vertices from "../geometry/Vertices";
import MathUtil from "../math/MathUtil";
import Collision from "./Collision";
import Pair from "./Pair";

export default class Resolver {
    static readonly _restingThresh = new Decimal(4)
    static readonly _restingThreshTangent = new Decimal(6);
    static readonly _positionDampen = new Decimal(0.9);
    static readonly _positionWarming = new Decimal(0.8);
    static readonly _frictionNormalMultiplier = new Decimal(5);

    static preSolverPosition(pairs: Pair[]) {
        let i: number,
            pair: Pair,
            activeCount: number,
            pairLenght = pairs.length;

        for (i = 0; i < pairLenght; i++) {
            pair = pairs[i]

            if (!pair.isActive) {
                continue;
            }

            activeCount = pair.activeContacts.length;
            pair.collision.parentA.totalContacts = pair.collision.parentA.totalContacts.add(activeCount);
            pair.collision.parentB.totalContacts = pair.collision.parentB.totalContacts.add(activeCount);
        }
    }

    static solvePosition(pairs: Pair[], timescale: Decimal) {
        var i: number,
            pair: Pair,
            collision: Collision,
            bodyA: Body,
            bodyB: Body,
            normal: Vector,
            contactShare: Decimal,
            positionImpulse: Decimal,
            positionDampen = Resolver._positionDampen,
            pairsLength = pairs.length;

        // 计算解决渗透所需的冲量
        for (i = 0; i < pairsLength; i++) {
            pair = pairs[i];

            if (!pair.isActive || pair.isSensor) {
                continue;
            }

            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;

            pair.separation = normal.dot(bodyB.positionImpulse.add(collision.penetration).sub(bodyA.positionImpulse))
        }

        for (i = 0; i < pairsLength; i++) {
            pair = pairs[i];

            if (!pair.isActive || pair.isSensor) {
                continue;
            }

            collision = pair.collision;
            bodyA = pair.bodyA;
            bodyB = pair.bodyB;
            normal = collision.normal;
            positionImpulse = (pair.separation.sub(pair.slop)).mul(timescale);

            if (bodyA.isStatic  || bodyB.isStatic) {
                positionImpulse = positionImpulse.mul(new Decimal(2));
            }

            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                contactShare = positionDampen.div(bodyA.totalContacts);
                bodyA.positionImpulse = bodyA.positionImpulse.add(normal.mul(positionImpulse).mul(contactShare))
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                contactShare = positionDampen.div(bodyB.totalContacts);
                bodyB.positionImpulse = bodyB.positionImpulse.add(normal.mul(positionImpulse).mul(contactShare))
            }
        }
    }

    static postSolvePosition(bodies: Body[]) {
        let positionWarming = Resolver._positionWarming,
            bodiesLength = bodies.length;

        for (let i = 0; i < bodiesLength; i++) {
            let body = bodies[i],
                positionImpulse = body.positionImpulse,
                velocity = body.velocity;

            body.totalContacts = MathUtil.ZERO;

            if (!positionImpulse.x.isZero() || !positionImpulse.y.isZero()) {
                // 更新几何
                for (let j = 0; j < body.parts.length; j++) {
                    let part = body.parts[j];
                    Vertices.translate(part.vertices, positionImpulse);
                    part.bounds.update(part.vertices, velocity);
                    part.position = part.position.add(positionImpulse);
                }

                // 移动 避免 速度改变
                body.positionPrev = body.positionPrev.add(positionImpulse);

                // 冲量与刚体速度相反
                if (positionImpulse.dot(velocity).lt(MathUtil.zero)) { 
                    positionImpulse.reset();
                } else {
                    body.positionImpulse = body.positionImpulse.mul(positionWarming);
                }
            }
        }
    }

    static preSolveVelocity(pairs: Pair[]) {
        let pairsLength = pairs.length,
            i: number,
            j: number;
        for (i = 0; i < pairsLength; i++ ){
            let pair = pairs[i];
            if (!pair.isActive || pair.isSensor) {
                continue;
            }

            let contacts = pair.activeContacts,
                contactLength = contacts.length,
                collision = pair.collision,
                bodyA = collision.bodyA,
                bodyB = collision.bodyB,
                normal = collision.normal,
                tangent = collision.tangent;

            for (j = 0; j < contactLength; j++ ){
                let contact = contacts[j],
                    contactVertex = contact.vertex,
                    normalImpulse = contact.normalImpulse,
                    tangentImpulse = contact.tangentImpulse;

                if (!normalImpulse.isZero() || !tangentImpulse.isZero()) {
                    var impluse = normal.mul(normalImpulse).add(tangent.mul(tangentImpulse))

                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        bodyA.positionPrev = bodyA.positionPrev.add(impluse.mul(bodyA.inverseMass))
                        bodyA.anglePrev = bodyA.anglePrev.add(bodyA.inverseInertia.mul((contactVertex.vector.sub(bodyA.positionPrev).cross(impluse))))
                    }
                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        bodyB.positionPrev = bodyB.positionPrev.sub(impluse.mul(bodyB.inverseMass))
                        bodyB.anglePrev = bodyB.anglePrev.sub(bodyB.inverseInertia.mul((contactVertex.vector.sub(bodyB.positionPrev).cross(impluse))))
                    }

                }
            }
        }
    }

    solveVelocity(pairs: Pair[], timeScale: Decimal) {
        let timeScaleSquared = timeScale.mul(timeScale),
            restingThresh = Resolver._restingThresh.mul(timeScaleSquared),
            frictionNormalMultiplier = Resolver._frictionNormalMultiplier,
            restingThreshTangent = Resolver._restingThreshTangent.mul(timeScaleSquared),
            NumberMaxValue = new Decimal(Number.MAX_VALUE),
            pairsLength = pairs.length,
            tangentImpulse: Decimal,
            maxFriction: Decimal,
            i: number,
            j: number;
        
        for (i = 0; i < pairsLength; i++) {
            let pair = pairs[i];

            if (!pair.isActive || pair.isSensor) {
                continue;
            }

            let collision = pair.collision,
                bodyA = collision.bodyA,
                bodyB = collision.bodyB,
                bodyAVelocity = bodyA.velocity,
                bodyBVelocity = bodyB.velocity,
                normal = collision.normal,
                tangent = collision.tangent,
                contacts = pair.contacts,
                contactsLength = contacts.length,
                contactShare = MathUtil.one.div(contactsLength),
                inverseMassTotal = bodyA.inverseMass.add(bodyB.inverseMass),
                friction = pair.friction.mul(pair.frictionStatic).mul(frictionNormalMultiplier).mul(timeScale);
            
            bodyA.position.sub(bodyAVelocity, bodyAVelocity)
            bodyB.position.sub(bodyBVelocity, bodyBVelocity)

            bodyA.angularVelocity = bodyA.angle.sub(bodyA.anglePrev)
            bodyB.angularVelocity = bodyB.angle.sub(bodyB.anglePrev)

            for (j = 0; j < contactsLength; j++) {
                let contact = contacts[j],
                    contactVertx = contact.vertex.vector;
                
                
            }
        }
    }
}