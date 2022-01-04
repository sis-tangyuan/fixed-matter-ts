import Decimal from "decimal.js";
import { Vector } from "..";
import Body from "../body/Body";
import { Common } from "../core/Common";
import MathUtil from "../math/MathUtil";
import Vertex from "./Vertex";

export default class Vertices {
  public static create(points: Vector[] | Vertex[], body?: Body): Vertex[] {
    const vertices: Vertex[] = [];
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      vertices.push(new Vertex(point.x, point.y, body, index, false));
    }
    return vertices;
  }
  public static fromPath(path: string, body?: Body): Vertex[] {
    var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/gi,
      points: Vector[] = [];

    path.replace(pathPattern, (match: any, x: number, y: number) => {
      // points.push({ x: parseFloat(x), y: parseFloat(y) });
      points.push(new Vector(new Decimal(x), new Decimal(y)));
      return "";
    });
    return Vertices.create(points, body);
  }

  /**
   * 多边形面积
   * @param vertices 顶点
   * @param unsigned 是否无符号
   */
  public static area(
    vertices: Vertex[] | Vector[],
    unsigned: boolean = false
  ): Decimal {
    var area = MathUtil.ZERO,
      j = vertices.length - 1;
    for (let i = 0; i < vertices.length; i++) {
      const dx = vertices[j].x.sub(vertices[i].x);
      const dy = vertices[j].y.add(vertices[i].y);
      area = area.add(dx.mul(dy));
      j = i;
    }
    if (unsigned) {
      return area.div(new Decimal(2)).abs();
    }
    return area.div(new Decimal(2));
  }

  /**
   * 使用叉乘的方式 计算面积
   * @param vertices
   * @param unsigned
   * @returns
   */
  public static area2(vertices: Vertex[], unsigned: boolean = false): Decimal {
    var area = MathUtil.ZERO,
      j = vertices.length - 1;
    for (let i = 0; i < vertices.length; i++) {
      const dx = vertices[j].x.mul(vertices[i].y);
      const dy = vertices[j].y.mul(vertices[i].x);
      area = area.add(dx.sub(dy));
      j = i;
    }

    if (unsigned) {
      return area.div(new Decimal(2)).abs();
    }
    return area.div(new Decimal(2));
  }

  /**
   * 多边形质心
   * @param vertices
   * @returns
   */
  public static centre(vertices: Vertex[]): Vector {
    const area = Vertices.area(vertices);
    var centre = Vector.create(),
      cross,
      temp,
      j;
    for (let i = 0; i < vertices.length; i++) {
      j = (i + 1) % vertices.length;
      const curPoint = vertices[i].vector;
      const nextPoint = vertices[j].vector;
      cross = curPoint.cross(nextPoint);
      temp = curPoint.add(nextPoint).mul(cross);
      centre = centre.add(temp);
    }
    return centre.div(area.mul(new Decimal(6)));
  }

  /**
   * 计算坐标均值
   * @param vertices
   */
  public static mean(vertices: Vertex[]): Vector {
    var average = Vector.create();
    for (let i = 0; i < vertices.length; i++) {
      average = average.add(vertices[i].vector);
    }
    return average.div(new Decimal(vertices.length));
  }

  /**
   * 计算惯性
   * @param vertices
   * @param mass
   */
  public static inertia(vertices: Vertex[], mass: Decimal): Decimal {
    var numerator = MathUtil.ZERO,
      denominator = MathUtil.ZERO,
      v = vertices,
      cross,
      j;
    for (let n = 0; n < v.length; n++) {
      j = (n + 1) % v.length;
      const curPoint = v[n].vector;
      const nextPoint = v[j].vector;
      cross = nextPoint.cross(curPoint).abs();
      const nextLengthSqr = nextPoint.magnitudeSquared();
      const curLengthSqr = curPoint.magnitudeSquared();
      const dot = nextPoint.dot(curPoint);
      const add = nextLengthSqr.add(curLengthSqr).add(dot);
      numerator = numerator.add(cross.mul(add));
      denominator = denominator.add(cross);
    }
    return mass.div(new Decimal(5)).mul(numerator.div(denominator));
  }

  /**
   * 移动
   * @param vertices
   * @param vector
   * @param scalar
   */
  public static translate(
    vertices: Vertex[],
    vector: Vector,
    scalar: Decimal = new Decimal(1)
  ): Vertex[] {
    var verticesLength = vertices.length,
      translateX = vector.x.mul(scalar),
      translateY = vector.y.mul(scalar),
      i;
    for (i = 0; i < verticesLength; i++) {
      vertices[i].x = vertices[i].x.add(translateX);
      vertices[i].y = vertices[i].y.add(translateY);
    }
    return vertices;
  }

  /**
   * 旋转
   * @param vertices
   * @param angle
   * @param point
   * @returns
   */
  public static rotate(
    vertices: Vertex[],
    angle: Decimal,
    point: Vector
  ): Vertex[] {
    if (angle.eq(MathUtil.ZERO)) return vertices;

    let cos = angle.cos(),
      sin = angle.sin(),
      pointX = point.x,
      pointY = point.y,
      verticesLength = vertices.length,
      vertex,
      dx,
      dy,
      i;
    for (i = 0; i < verticesLength; i++) {
      vertex = vertices[i];
      dx = vertex.x.sub(pointX);
      dy = vertex.y.sub(pointY);
      vertex.x = pointX.add(dx.mul(cos).sub(dy.mul(sin)));
      vertex.y = pointY.add(dx.mul(sin).add(dy.mul(cos)));
    }
    return vertices;
  }

  /**
   * 通过叉乘的方式判断point是否在多边形内部
   * 顶点按照逆时针排列
   * 向量1: A -> P  =  P - A = AP
   * 向量2: A -> B =   B - A = AB
   * APxAB 都必须<=0,才说明点再多边形里面
   * OPxOB < 0 表示 OB 在 OP 右边
   *       > 0 表示左边
   *       = 0 表示平行
   * 也就是说 所有向量1都是围绕顶点1顺时针旋转的或者不旋转
   * 参考: https://blog.csdn.net/theArcticOcean/article/details/48632391
   * @param vertices
   * @param point
   */
  public static contain(vertices: Vertex[], point: Vector): boolean {
    let pointX = point.x,
      pointY = point.y,
      verticesLength = vertices.length,
      nextVertex;
    let vertex: Vertex = vertices[verticesLength - 1];

    let zero = MathUtil.ZERO;

    for (let i = 0; i < verticesLength; i++) {
      nextVertex = vertices[i];
      const v1 = new Vector(pointX.sub(vertex.x), pointY.sub(vertex.y));
      const v2 = new Vector(
        nextVertex.x.sub(vertex.x),
        nextVertex.y.sub(vertex.y)
      );
      const cross = v1.cross(v2);
      // console.log(`点乘: ${i}, value: ${cross.toString()}`)
      if (v1.cross(v2).gt(zero)) {
        return false;
      }

      vertex = nextVertex;
    }
    return true;
  }

  /**
   * 缩放多边形
   * @param vertices
   * @param scaleX
   * @param scaleY
   * @param point
   * @returns
   */
  public static scale(
    vertices: Vertex[],
    scaleX: Decimal,
    scaleY: Decimal,
    point?: Vector
  ): Vertex[] {
    const one = new Decimal(1);
    if (scaleX.eq(one) && scaleY.eq(one)) return vertices;

    point = point || this.centre(vertices);

    let curVertex, vertex, delta;

    for (let i = 0; i < vertices.length; i++) {
      vertex = vertices[i];
      curVertex = vertex.vector;
      delta = curVertex.sub(point);
      vertex.x = point.x.add(delta.x.mul(scaleX));
      vertex.y = point.y.add(delta.y.mul(scaleY));
    }
    return vertices;
  }

  /**
   * 顺时针排列
   *
   * @param vertices
   */
  public static clockwiseSort(vertices: Vertex[]): Vertex[] {
    const centre = this.centre(vertices);
    vertices.sort((vertexA: Vertex, vertextB: Vertex) => {
      const pointA = vertexA.vector;
      const pointB = vertextB.vector;
      // TODO: 这里可能会有精度问题
      return centre.angle(pointA).sub(centre.angle(pointB)).toNumber();
    });

    return vertices;
  }

  /**
   * 判断是否是凸多边形(顶点必须是顺时钟排序)
   * @param vertices
   */
  public static isConvex(vertices: Vertex[]): boolean {
    var flag = 0,
      n = vertices.length,
      zero = MathUtil.ZERO,
      i,
      j,
      k,
      z;
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      k = (i + 2) % n;
      const a = vertices[i];
      const b = vertices[j];
      const c = vertices[k];
      const v1 = Vector.fromFixXY(b.x.sub(a.x), b.y.sub(a.y));
      const v2 = Vector.fromFixXY(c.x.sub(b.x), c.y.sub(b.y));
      z = v1.cross(v2);

      if (z.lt(zero)) {
        flag |= 1;
      } else if (z.gt(zero)) flag |= 2;
      if (flag === 3) {
        return false;
      }
    }
    return flag !== 0;
  }

  /**
   * 将输入的顶点 生成新的凸多边形顶点数组
   * @param vertices
   */
  public static hull(vertices: Vertex[]): Vertex[] {
    var upper: Vertex[] = [],
      lower: Vertex[] = [],
      zero = MathUtil.ZERO,
      vertex,
      i;
    vertices = vertices.slice(0);
    vertices.sort(function (vertexA: Vertex, vertexB: Vertex) {
      const dx = vertexA.x.sub(vertexB.x);
      // TODO: toNumber 的精度未验证过
      return dx.eq(zero) ? vertexA.y.sub(vertexB.y).toNumber() : dx.toNumber();
    });

    // build lower hull
    for (i = 0; i < vertices.length; i++) {
      vertex = vertices[i];

      while (
        lower.length > 2 &&
        Vector.cross33(
          lower[lower.length - 2].vector,
          lower[lower.length - 1].vector,
          vertex.vector
        ).lte(zero)
      ) {
        lower.pop();
      }

      lower.push(vertex);
    }

    // build upper hull
    for (i = vertices.length - 1; i >= 0; i--) {
      vertex = vertices[i];

      while (
        upper.length > 2 &&
        Vector.cross33(
          upper[upper.length - 2].vector,
          upper[upper.length - 1].vector,
          vertex.vector
        ).lte(zero)
      ) {
        upper.pop();
      }

      upper.push(vertex);
    }

    upper.pop();
    lower.pop();

    return upper.concat(lower);
  }
}
