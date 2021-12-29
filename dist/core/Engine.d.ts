export interface EngineOptions {
}
export default class Engine {
    positionIterations: number;
    velocityIterations: number;
    constraintIterations: number;
    enableSleeping: boolean;
    events: any[];
    plugin: {};
    static create(options?: EngineOptions): void;
}
