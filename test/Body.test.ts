import Decimal from "decimal.js"
import Bodies from "../src/factory/Bodies"
import MathUtil from "../src/math/MathUtil"


test("创建刚体", () => {
    const body1 = Bodies.reatangle(MathUtil.ZERO, MathUtil.ZERO, new Decimal(100), new Decimal(30), {
        mass: new Decimal(10),
    });

    expect(body1.parent === body1).toBe(true)
    expect(body1.mass.eq(new Decimal(10))).toBe(true)
})