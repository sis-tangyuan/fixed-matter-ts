import Decimal from "decimal.js";
import { Common } from "../core/Common";
import MathUtil from "../math/MathUtil";
import Vector from "./Vector";
import Vertex from "./Vertex";

export default class Axes {
  /**
   * 传入顶点列表，获取顶点构成的边的法线列表
   * 如果顶点式顺时针的，那么法线直线多边形内部，反之，指向外部
   * @param vertices
   * @returns
   */
  public static fromVertices(vertices: Vertex[] | Vector[]): Vector[] {
    var axes = new Map();
    for (let i = 0; i < vertices.length; i++) {
      var nextIdx = (i + 1) % vertices.length;
      const curPoint = vertices[i];
      const nextPoint = vertices[nextIdx];

      const normal = new Vector(
        nextPoint.y.sub(curPoint.y),
        curPoint.x.sub(nextPoint.x)
      ).normalise();
      const gradient = normal.y.eq(MathUtil.ZERO)
        ? new Decimal(Infinity)
        : normal.x.div(normal.y);
      const key = gradient.toFixed(3).toString();
      axes.set(key, normal);
    }

    return Common.values<Vector>(axes);
  }

  public static rotate(axes: Vector[], angle: Decimal) {
    if (angle.eq(MathUtil.ZERO)) return;
    for (let i = 0; i < axes.length; i++) {
      axes[i].rotate(angle, axes[i]);
    }
  }
}
