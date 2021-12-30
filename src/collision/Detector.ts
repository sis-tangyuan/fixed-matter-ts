import Body from "../body/Body";
import { Common } from "../core/Common";

export default class Detector {
    bodies: Body[]

    constructor() {
        this.bodies = [];
        
    }

    static create(option: any): Detector {
        let detector = new Detector();
        detector = Common.extend(detector, option)
        return detector;
    }
}