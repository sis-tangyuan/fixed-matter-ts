

export interface EngineOptions {

}

export default class Engine {
    positionIterations: number = 6;
    velocityIterations: number = 4;
    constraintIterations: number = 2;
    enableSleeping: boolean = false;

    events:any[] = []
    plugin = {}

    public static create(options?: EngineOptions) {

    }
}