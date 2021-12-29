import Decimal from "decimal.js";
import { Common } from "../core/Common";

/**
 * 2D 向量，代表位置，位移，方向
 */
export default class Vector {
    x: Decimal;
    y: Decimal;

    constructor(x: Decimal, y: Decimal) {
        this.x = x;
        this.y = y;
    }



    public static create(x?: Decimal, y?: Decimal) {
        return new Vector(x || Common.ZERO, y || Common.ZERO);
    }

    public static fromFixXY(x: Decimal, y: Decimal) {
        const vec = this.create();
        vec.x = x;
        vec.y = y;
        return vec;
        
    }

    public static fromXY(x: number, y: number) {
        return new Vector(new Decimal(x), new Decimal(y))
    }

    /**
     * 克隆
     * TODO: 测试 toNumber是否有精度问题
     * @param vector 
     * @returns 
     */
    clone(vector: Vector): Vector {
        const x = new Decimal(vector.x.toNumber());
        const y = new Decimal(vector.y.toNumber());
        return new Vector(x, y);
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
        return output
    }

    /**
     * 位置点旋转
     * @param angle 
     * @param point 旋转点
     * @param output 
     * @returns 
     */
    routeAbout(angle: Decimal, point: Vector, output?: Vector): Vector {
        output = output || Vector.create();
        const cos = angle.cos();
        const sin = angle.sin();
        const deltaX = this.x.sub(point.x);
        const deltaY = this.y.sub(point.y);
        const x = point.x.add(deltaX.mul(cos).sub(deltaY.mul(sin)))
        const y = point.y.add(deltaX.mul(sin).add(deltaY.mul(cos)))
        output.x = x;
        output.y = y;
        return output;
    }

    /**
     * 获取该向量的长度为1的向量
     */
    normalise(): Vector {
        const length = this.magnitude();
        if (length.eq(Common.ZERO)) {
            return Vector.create();
        }
        return Vector.fromFixXY(this.x.div(length), this.y.div(length))
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
        return (this.x.mul(vector.y).sub(this.y.mul(vector.x)))
    }

    /**
     * 
     * @param vector1 
     * @param vector2 
     * @returns 
     */
    cross3(vector1: Vector, vector2: Vector): Decimal {
        return (vector1.x.sub(this.x)).mul(vector2.y.sub(this.y)).sub(vector1.y.sub(this.y).mul(vector2.x.sub(this.x)))
    }

    /**
     * 相加
     * @param vector 
     * @param output 
     * @returns 
     */
    add(vector: Vector, output?: Vector): Vector {
        output = output || Vector.create()
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

}