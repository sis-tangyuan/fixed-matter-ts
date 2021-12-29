"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Common_1 = require("../core/Common");
class Body {
    // parts: Body[];
    // plugin = {}
    // 角度
    // angle: Decimal;
    // 位置
    // position: Vector;
    constructor(option) {
        this.id = Common_1.Common.nextId();
        this.type = "body";
        this.label = "Body";
    }
}
exports.default = Body;
