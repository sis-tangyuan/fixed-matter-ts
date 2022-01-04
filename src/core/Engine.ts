import Decimal from "decimal.js";
import MathUtil from "../math/MathUtil";
import { Common } from "./Common";


export interface EngineOptions {

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

export default class Engine {
    positionIterations: number = 6;
    velocityIterations: number = 4;
    constraintIterations: number = 2;
    enableSleeping: boolean = false;

    events:any[] = []
    plugin = {}

    gravity: Gravity = new Gravity();
    timing: Timing = new Timing();

    public static create(options?: EngineOptions) {
        let engine = new Engine();

        Common.extend(engine, options);
    }
}