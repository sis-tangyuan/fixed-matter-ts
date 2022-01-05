import Decimal from "decimal.js";
import { Common } from "../core/Common";
import MathUtil from "../math/MathUtil";

/**
 * 2D 向量，代表位置，位移，方向
 */
export default class Vector {
  private _x: Decimal;
  public get x() {
    return this._x;
  }
  public set x(_x: Decimal) {
    // add 另类的深度copy
    this._x = _x.add(MathUtil.ZERO);
  }

  private _y: Decimal;
  public get y() {
    return this._y;
  }
  public set y(_y: Decimal) {
    this._y = _y.add(MathUtil.ZERO);
  }

  /**
   * 不需要深度复制
   */
  public set xx(_x: Decimal) {
    this._x = _x;
  }

  /**
   * 不需要深度复制
   */
  public set yy(_y: Decimal) {
    this._y = _y;
  }

  constructor(x: Decimal, y: Decimal) {
    this.x = x;
    this.y = y;
    this._x = this.x;
    this._y = this.y;
  }

  public static create(x?: Decimal, y?: Decimal) {
    return new Vector(x || MathUtil.ZERO, y || MathUtil.ZERO);
  }

  public static fromFixXY(x: Decimal, y: Decimal) {
    const vec = new Vector(x, y);
    return vec;
  }

  public static fromXY(x: number, y: number) {
    return new Vector(new Decimal(x), new Decimal(y));
  }

  /**
   * 克隆
   * @param vector
   * @returns
   */
  static clone(vector: Vector): Vector {
    return Vector.create(vector.x, vector.y);
  }

  copy(vector: Vector) {
    this.x = vector.x;
    this.y = vector.y;
  }

  /**
   * 向量的长度
   * @returns
   */
  magnitude(): Decimal {
    const xx = this.x.mul(this.x);
    const yy = this.y.mul(this.y);
    const addXY = xx.add(yy);
    const sqrXY = addXY.sqrt();
    return sqrXY;
  }

  /**
   * 长度的平方
   * @returns
   */
  magnitudeSquared(): Decimal {
    const xx = this.x.mul(this.x);
    const yy = this.y.mul(this.y);
    const addXY = xx.add(yy);
    return addXY;
  }

  /**
   * 旋转
   * @param angle 角度
   * @param output 输出，可选
   * @returns
   */
  rotate(angle: Decimal, output?: Vector): Vector {
    output = output || Vector.create();
    const cos = angle.cos();
    const sin = angle.sin();
    const x = this.x.mul(cos).sub(this.y.mul(sin));
    const y = this.x.mul(sin).add(this.y.mul(cos));
    output.x = x;
    output.y = y;
    return output;
  }

  /**
   * 位置点旋转
   * @param angle
   * @param point 旋转点
   * @param output
   * @returns
   */
  rotateAbout(angle: Decimal, point: Vector, output?: Vector): Vector {
    output = output || Vector.create();
    const cos = angle.cos();
    const sin = angle.sin();
    const deltaX = this.x.sub(point.x);
    const deltaY = this.y.sub(point.y);
    const x = point.x.add(deltaX.mul(cos).sub(deltaY.mul(sin)));
    const y = point.y.add(deltaX.mul(sin).add(deltaY.mul(cos)));
    output.x = x;
    output.y = y;
    return output;
  }

  /**
   * 获取该向量的长度为1的向量
   */
  normalise(): Vector {
    const length = this.magnitude();
    if (length.eq(MathUtil.ZERO)) {
      return Vector.create();
    }
    return Vector.fromFixXY(this.x.div(length), this.y.div(length));
  }

  /**
   * 获取点乘结果
   * ab 点乘，a未单元向量的情况下，点乘结果是b在a上的投影
   * @param vector
   */
  dot(vector: Vector): Decimal {
    return this.x.mul(vector.x).add(this.y.mul(vector.y));
  }

  /**
   * 叉乘
   * axb是两个向量构成的四边形的面积
   * axb = |a||b|sin(∂)
   * @param vector
   */
  cross(vector: Vector): Decimal {
    return this.x.mul(vector.y).sub(this.y.mul(vector.x));
  }

  /**
   *
   * @param vector1
   * @param vector2
   * @returns
   */
  cross3(vector1: Vector, vector2: Vector): Decimal {
    // return (vector1.x.sub(this.x)).mul(vector2.y.sub(this.y)).sub(vector1.y.sub(this.y).mul(vector2.x.sub(this.x)))
    const ab = Vector.fromFixXY(vector1.x.sub(this.x), vector1.y.sub(this.y));
    const ac = Vector.fromFixXY(vector2.x.sub(this.x), vector2.y.sub(this.y));
    return ab.cross(ac);
  }

  static cross33(vector: Vector, vector1: Vector, vector2: Vector): Decimal {
    const ab = Vector.fromFixXY(
      vector1.x.sub(vector.x),
      vector1.y.sub(vector.y)
    );
    const ac = Vector.fromFixXY(
      vector2.x.sub(vector.x),
      vector2.y.sub(vector.y)
    );
    return ab.cross(ac);
  }

  /**
   * 相加
   * @param vector
   * @param output
   * @returns
   */
  add(vector: Vector, output?: Vector): Vector {
    output = output || Vector.create();
    output.x = this.x.add(vector.x);
    output.y = this.y.add(vector.y);
    return output;
  }

  /**
   * 相减
   * @param vector
   * @param output
   * @returns
   */
  sub(vector: Vector, output?: Vector): Vector {
    output = output || Vector.create();
    output.x = this.x.sub(vector.x);
    output.y = this.y.sub(vector.y);
    return output;
  }

  /**
   * 乘与标量
   * @param scalar
   * @returns
   */
  mul(scalar: Decimal): Vector {
    return Vector.fromFixXY(this.x.mul(scalar), this.y.mul(scalar));
  }

  selfMul(scalar: Decimal): this {
    this.x = this.x.mul(scalar);
    this.y = this.y.mul(scalar)
    return this;
  }

  /**
   * 除与标量
   * @param scalar
   * @returns
   */
  div(scalar: Decimal): Vector {
    return Vector.fromFixXY(this.x.div(scalar), this.y.div(scalar));
  }

  /**
   * 获取垂直线，也就是向量的法线
   * @param nagate 是否取反
   */
  prep(nagate?: boolean): Vector {
    if (!nagate) {
      return Vector.fromFixXY(this.y.neg(), this.x);
    } else {
      return Vector.fromFixXY(this.y, this.x.neg());
    }
  }

  /**
   * 取反
   * @returns
   */
  neg(): Vector {
    return Vector.fromFixXY(this.x.neg(), this.y.neg());
  }

  /**
   * 本顶点 到 vec 顶点 的向量 在x轴上的旋转角度
   * @param vec
   * @returns
   */
  angle(vec: Vector): Decimal {
    const deltaX = vec.x.sub(this.x);
    const deltaY = vec.y.sub(this.y);
    return Decimal.atan2(deltaY, deltaX);
  }

  toString(): string {
    return `x: ${this.x.toNumber()}, y: ${this.y.toNumber()}`;
  }

  reset() {
    this.x = MathUtil.ZERO;
    this.y = MathUtil.ZERO;
  }
}
