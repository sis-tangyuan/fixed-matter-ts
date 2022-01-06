import Decimal from "decimal.js";
import Body from "../body/Body";
import Composite from "../body/Composite";
import Detector from "../collision/Detector";
import Pair from "../collision/Pair";
import Pairs from "../collision/Pairs";
import Resolver from "../collision/Resolver";
import Constraint from "../constraint/Constraint";
import Bounds from "../geometry/Bounds";
import MathUtil from "../math/MathUtil";
import { Common } from "./Common";
import Events, { IEvent } from "./Events";
import Sleeping from "./Sleeping";


export interface EngineOptions {
    world?: Composite;
    pairs?: Pairs;
    detector?: Detector;
    positionIterations?: number;
    velocityIterations?: number;
    constraintIterations?: number;
    enableSleeping?: boolean;
}

export class Gravity {
    x: Decimal = MathUtil.ZERO;
    y: Decimal = MathUtil.ONE;
    scale: Decimal = new Decimal(0.001)
}

export class Timing {
    timestamp: Decimal = MathUtil.ZERO;
    timeScale: Decimal = MathUtil.ONE;
    lastDelta: Decimal = MathUtil.ZERO;
    lastElapsed: Decimal = MathUtil.ZERO;
}

export default class Engine implements IEvent{
    positionIterations: number = 6;
    velocityIterations: number = 4;
    constraintIterations: number = 2;
    enableSleeping: boolean = false;

    events?: Map<string, Function[]>
    plugin = {}

    gravity: Gravity = new Gravity();
    timing: Timing = new Timing();

    world: Composite
    pairs: Pairs
    detector: Detector

    constructor(options?: EngineOptions) {
        this.world = options?.world || Composite.create({label: "World"})
        this.pairs = options?.pairs || Pairs.create()
        this.detector = options?.detector || Detector.create();
        // this.positionIterations = options?.positionIterations || this.positionIterations;
        // this.velocityIterations = options?this.velocityIterations || this.velocityIterations;
    }

    public static create(options?: EngineOptions): Engine {
        let engine = new Engine(options);

        Common.extend(engine, options);
        return engine;
    }

    update(delta: Decimal = new Decimal(16), correcttion: Decimal = MathUtil.one) {
        const world = this.world,
            detector = this.detector,
            pairs = this.pairs,
            timing = this.timing,
            timestamp = timing.timestamp;
        let i: number;

        timing.timestamp = timing.timestamp.add(delta.mul(timing.timeScale))
        timing.lastDelta = delta.mul(timing.timeScale)

        let event = {
            timestamp: +new Date(),
        }
        Events.trigger(this, 'beforUpdate', event)

        const allBodies = world.allBodies(),
            allConstraints = world.allConstraints();
        
        if (world.isModified) {
            detector.setBodies(allBodies);
        }

        if (world.isModified) {
            world.setModified(false, false, true)
        }

        // 睡眠管理
        if (this.enableSleeping) {
            Sleeping.update(allBodies, timing.timeScale)
        }

        // 所有刚体应用重力
        this._bodiesApplyGravity(allBodies);

        // 通过积分运算 更新刚体的位置和旋转角度
        this._bodiesUpdate(allBodies, delta, timing.timestamp, correcttion, world.bounds())

        // 更新约束
        Constraint.preSolveAll(allBodies);
        for (i = 0; i < this.constraintIterations; i++) {
            Constraint.solveAll(allConstraints, timing.timeScale);
        }
        Constraint.postSolveAll(allBodies)

        // 查找所有碰撞
        detector.pairs = this.pairs;
        let collisions = detector.collissions()

        // 更新碰撞对
        pairs.update(collisions, timestamp)

        // 碰撞唤醒刚体
        if (this.enableSleeping) {
            Sleeping.afterCollisions(pairs.list, timing.timeScale)
        }

        // 触发碰撞时间
        if (pairs.collisionStart.length > 0) {
            Events.trigger(this, 'collisionStart', {pairs: pairs.collisionStart})
        }

        // 迭代求解碰撞间的位置
        Resolver.preSolverPosition(pairs.list)
        for (i = 0; i < this.positionIterations; i++) {
            Resolver.solvePosition(pairs.list, timing.timeScale)
        }
        Resolver.postSolvePosition(allBodies)

        // 约束求解
        Constraint.preSolveAll(allBodies)
        for (i = 0; i < this.constraintIterations; i++ ){
            Constraint.solveAll(allConstraints, timing.timeScale);
        }
        Constraint.postSolveAll(allBodies)

        // 迭代求解碰撞间的速度
        Resolver.preSolveVelocity(pairs.list)
        for (i = 0; i < this.velocityIterations; i++ ) {
            Resolver.solveVelocity(pairs.list, timing.timeScale)
        }

        // 触发碰撞事件
        if (pairs.collisionActive.length > 0) {
            Events.trigger(this, 'collisionActive', {pairs: pairs.collisionActive})
        }

        if (pairs.collisionEnd.length > 0) {
            Events.trigger(this, 'collisionEnd', {pairs: pairs.collisionEnd })
        }

        this._bodiesClearForces(allBodies)

        Events.trigger(this, 'afterUpdate', event);
    }

    merge(engine: Engine) {
        Common.extend(this, engine)

        this.world = engine.world;
        this.clear();

        const bodies = this.world.allBodies();

        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];
            Sleeping.set(body, false);
            body.id = Common.nextId()
        }
    }

    clear() {
        this.pairs.clear();
        this.detector.clear();
    }

    /**
     * 清除刚体上所有力
     * @param bodies 刚体列表
     */
    private _bodiesClearForces(bodies: Body[]) {
        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];
            body.force.reset();
            body.torque = MathUtil.ZERO;
        }
    }

    /**
     * 给所有刚体应用重力
     * @param bodies 刚体列表
     * @param gravity 重力配置
     */
    private _bodiesApplyGravity(bodies: Body[]) {

        for (let i = 0; i < bodies.length; i++ ) {
            let body = bodies[i];
            if (body.isStatic || body.isSleeping) {
                continue;
            }

            body.force.y = body.force.y.add(body.mass.mul(this.gravity.y).mul(this.gravity.scale))
            body.force.x = body.force.x.add(body.mass.mul(this.gravity.x).mul(this.gravity.scale))
        }
    }

    _bodiesUpdate(bodies: Body[], deltaTime: Decimal, timeScale: Decimal, correction: Decimal, worldBounds: Bounds) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            body.update(deltaTime, timeScale, correction);
        }
    };

}

// module.exports = Engine;