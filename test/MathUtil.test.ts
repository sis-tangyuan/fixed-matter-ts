import Decimal from "decimal.js"
import MathUtil from "../src/math/MathUtil"

test("角度转弧度", () => {
    const radian = MathUtil.angleToRadian(new Decimal(180))
    // console.log(`角度180转弧度:${radian.toNumber()}`)
    const radian2 = MathUtil.angleToRadian(new Decimal(360))
    // console.log(`角度360转弧度:${radian2.toNumber()}`)
})

test("弧度转角度", () => {
    const radian = 3.14/2;
    const angle = MathUtil.radianToAngle(new Decimal(radian))
    // console.log(`弧度${radian}转角度:${angle}`)
})