import Decimal from "decimal.js";
import Body from "../body/Body";
import Pair from "../collision/Pair";
import Vector from "../geometry/Vector";
import MathUtil from "../math/MathUtil";
import { Common } from "./Common";
import Events from "./Events";


export default class Sleeping {
    // 清醒动量阈值
    private static readonly _motionWakeThreshold = new Decimal(0.18)
    // 随眠阈值
    private static readonly _motionSleepThreshold = new Decimal(0.08)
    private static readonly _minBias = new Decimal(0.9)

    public static update(bodies: Body[], timeScale: Decimal) {
        var timeFactor = timeScale.mul(timeScale).mul(timeScale);
        const zero = MathUtil.ZERO;
        // 更新 刚体 睡眠状态
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i],
                motion = body.speed.mul(body.speed).add(body.angularSpeed.mul(body.angularSpeed));

            // 作用力不为0，不能睡眠
            if (!body.force.x.isZero() && !body.force.y.isZero()) {
                this.set(body, false)
                continue
            }

            var minMotion = Decimal.min(body.motion, motion)
            var maxMotion = Decimal.max(body.motion, motion)

            body.motion = this._minBias.mul(minMotion).add(new Decimal(1).sub(this._minBias).mul(maxMotion))

            if (body.sleepThreshold.gt(zero) && body.motion.lt(this._motionSleepThreshold.mul(timeFactor))) {
                body.sleepCounter.add(new Decimal(1))

                if (body.sleepCounter.gte(body.sleepThreshold)) {
                    this.set(body, true);
                }
            } else if (body.sleepCounter.gt(zero)) {
                body.sleepCounter.sub(new Decimal(1))
            }
            
            
        }
    }

    /**
     * 设置刚体是否处于睡眠状态
     * @param body 
     * @param isSleeping 
     */
    public static set(body: Body, isSleeping: boolean) {
        var wasSleeping = body.isSleeping
        var zero = MathUtil.ZERO;
        if (isSleeping) {
            body.isSleeping = true;
            body.sleepCounter = body.sleepThreshold.add(zero)
            
            body.positionImpulse.reset()

            body.positionPrev = Vector.fromFixXY(body.position.x, body.position.y)
            body.anglePrev = body.angle.add(zero);
            body.speed = MathUtil.ZERO;
            body.angularSpeed = MathUtil.ZERO;
            body.motion = MathUtil.ZERO;

            if (!wasSleeping) {
                Events.trigger(body, "sleepStart")
            }
        } else {
            body.isSleeping = false;
            body.sleepCounter = zero;

            if (wasSleeping) {
                Events.trigger(body, "sleepEnd")
            }
        }
    }

    static afterCollisions(pairs: Pair[], timeScale: Decimal) {
        let timeFactor = timeScale.mul(timeScale).mul(timeScale)

        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];

            if (!pair.isActive) continue;

            let collision = pair.collision,
                bodyA = collision.bodyA.parent,
                bodyB = collision.bodyB.parent;
            
            if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic) {
                continue;
            }

            if (bodyA.isSleeping || bodyB.isSleeping) {
                var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
                    movingBody = sleepingBody === bodyA ? bodyB : bodyA;

                if (!sleepingBody.isStatic && movingBody.motion.gt(Sleeping._motionWakeThreshold.mul(timeFactor))) {
                    Sleeping.set(sleepingBody, false);
                }
            }
        }
    }
}