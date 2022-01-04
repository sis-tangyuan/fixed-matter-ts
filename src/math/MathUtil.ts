import Decimal from "decimal.js";

export default class MathUtil {
  public static readonly zero = new Decimal(0);
  public static readonly one = new Decimal(1);
  public static readonly negOne = new Decimal(-1);
  public static readonly PI = new Decimal(3.14159265358);
  public static readonly HalfCircleAngle = new Decimal(180);

  public static get ZERO() {
    return new Decimal(0);
  }

  public static get ONE() {
    return new Decimal(1);
  }

  public static get Infinity() {
    return new Decimal(Infinity);
  }

  public static get negONE() {
    return new Decimal(-1);
  }

  static angleToRadian(angle: Decimal): Decimal {
    return this.PI.div(this.HalfCircleAngle).mul(angle);
  }

  static radianToAngle(radian: Decimal): Decimal {
    return this.HalfCircleAngle.div(this.PI).mul(radian);
  }
}
