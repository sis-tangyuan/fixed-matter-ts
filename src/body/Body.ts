import Decimal from "decimal.js";
import { Vector } from "..";
import { Common } from "../core/Common";


// 外部可以设置的参数
export interface BodyOpt {

}

export default class Body {

    id: number;

    // 类型
    type: string;

    // 标签
    label: string;

    // parts: Body[];

    // plugin = {}

    // 角度
    // angle: Decimal;

    // 位置
    // position: Vector;

    constructor(option?: BodyOpt) {
        this.id = Common.nextId();
        this.type = "body"
        this.label = "Body"
    }

}