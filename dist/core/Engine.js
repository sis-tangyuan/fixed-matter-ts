"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Engine {
    constructor() {
        this.positionIterations = 6;
        this.velocityIterations = 4;
        this.constraintIterations = 2;
        this.enableSleeping = false;
        this.events = [];
        this.plugin = {};
    }
    static create(options) {
    }
}
exports.default = Engine;
