import Decimal from "decimal.js";
import Vector from "../src/geometry/Vector";


test("测试Vector向量", () => {
    const vec = Vector.fromXY(0, 10);
    expect(vec.y.eq(new Decimal(10))).toBe(true)
})