import Decimal from "decimal.js";

export default class MathUtil {
    public static readonly PI = new Decimal(3.14159265358)
    public static readonly HalfCircleAngle = new Decimal(180);

    static angleToRadian(angle: Decimal): Decimal {
        return this.PI.div(this.HalfCircleAngle).mul(angle)
    }

    static radianToAngle(radian: Decimal): Decimal {
        return this.HalfCircleAngle.div(this.PI).mul(radian)
    }
}