import Decimal from "decimal.js";
import Body, { BodyOriginal, CollisionFilter } from "../body/Body";
import { Common } from "../core/Common";
import Vector from "../geometry/Vector";
import Vertex from "../geometry/Vertex";
import Vertices from "../geometry/Vertices";
import MathUtil from "../math/MathUtil";

export interface ChamferOpt {
    radius: Decimal[];
    quality: Decimal;
    qualityMin: Decimal;
    qualityMax: Decimal;
}

export interface BodiesOpt {
    chamfer?: ChamferOpt | null;

  // 类型
  type?: string;

  // 标签
  label?: string;

  parts?: Body[];

  // plugin = {}

  // 角度
  angle?: Decimal;

  // 顶点列表
  vertices?: Vertex[];

  // 位置
  position?: Vector;

  // 作用力
  force?: Vector;

  // 扭力
  torque?: Decimal;

  // 位置冲量
  positionImpulse?: Vector;

  // 全部触摸数量
  totalContacts?: Decimal;

  // 速率
  speed?: Decimal;

  // 角速率
  angularSpeed?: Decimal;

  // 速度
  velocity?: Vector;

  // 角速度
  angularVelocity?: Decimal;

  // 是否是传感器
  isSensor?: boolean;

  // 是否静态
  isStatic?: boolean;

  // 是否休眠
  isSleeping?: boolean;

  // 总动量
  motion?: Decimal;

  // 随眠计数
  sleepCounter?: Decimal;

  // 睡眠阀值
  sleepThreshold?: Decimal;

  // 密度
  density?: Decimal;

  // 恢复系数
  restitution?: Decimal;

  // 摩擦力
  friction?: Decimal;

  // 静摩擦力
  frictionStatic?: Decimal;

  // 空气摩擦力
  frictionAir?: Decimal;

  // 碰撞过滤器
  collisionFilter?: CollisionFilter;

  slop?: Decimal;

  timeScale?: Decimal;

  circleRadius?: Decimal | null;

  // 上一帧 的位置
  positionPrev?: Vector;

  // 上一帧 的角度
  anglePrev?: Decimal;

  parent?: Body;

  // 面积
  area?: Decimal;

  // 质量
  mass?: Decimal;

  // 质量的逆
  inverseMass?: Decimal;

  // 惯性
  inertia?: Decimal;

  inverseInertia?: Decimal;
}

export default class Bodies {
    static reatangle(x: Decimal, y: Decimal, width: Decimal, height: Decimal, options: BodiesOpt = {}): Body {
        let rectangle = {
            label: 'Rectangle Body',
            position: Vector.create(x, y),
            vertices: Vertices.fromPath('L 0 0 L ' + width.toNumber() + ' 0 L ' + width.toNumber() + ' ' + height.toNumber() + ' L 0 ' + height.toNumber())
        }

        if (options.chamfer) {
            let chamfer = options.chamfer;
            rectangle.vertices = Vertices.chamfer(rectangle.vertices, chamfer.radius, chamfer.quality, chamfer.qualityMin, chamfer.qualityMax)
            options.chamfer = null;
        }
        return Body.create(Common.extend({}, rectangle, options))
    }

    static trapezoid = function(x: Decimal, y: Decimal, width: Decimal, height: Decimal, slope: Decimal, options: BodiesOpt = {}): Body {
        options = options || {};

        slope = slope.mul(new Decimal(0.5));
        // var roof = (1 - (slope * 2)) * width;
        let roof = (MathUtil.one.sub(slope.mul(new Decimal(2)))).mul(width);
        
        var x1 = width.mul(slope),
            x2 = x1.add(roof),
            x3 = x2.add(x1),
            verticesPath;

        if (slope.lt(new Decimal(0.5))) {
            verticesPath = 'L 0 0 L ' + x1.toNumber() + ' ' + (-height.toNumber()) + ' L ' + x2.toNumber() + ' ' + (-height.toNumber()) + ' L ' + x3.toNumber() + ' 0';
        } else {
            verticesPath = 'L 0 0 L ' + x2.toNumber() + ' ' + (-height.toNumber()) + ' L ' + x3.toNumber() + ' 0';
        }

        var trapezoid = { 
            label: 'Trapezoid Body',
            position: Vector.create(x, y),
            vertices: Vertices.fromPath(verticesPath)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            trapezoid.vertices = Vertices.chamfer(trapezoid.vertices, chamfer.radius, 
                chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, trapezoid, options));
    }

    static circle(x: Decimal, y: Decimal, radius: Decimal, options: BodiesOpt = {}, maxSides: number = 25): Body {
        options = options || {};

        var circle = {
            label: 'Circle Body',
            circleRadius: radius
        };
        
        // approximate circles with polygons until true circles implemented in SAT
        var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius.toNumber())));

        // optimisation: always use even number of sides (half the number of unique axes)
        if (sides % 2 === 1)
            sides += 1;

        return Bodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
    };

    static polygon(x: Decimal, y: Decimal, sides: number, radius: Decimal, options: BodiesOpt = {}): Body {

        if (sides < 3)
            return Bodies.circle(x, y, radius, options);

        // var theta = 2 * Math.PI / sides,
        //     path = '',
        //     offset = theta * 0.5;
        let theta = new Decimal(2).mul(MathUtil.PI).div(new Decimal(sides)),
            path = '',
            offset = theta.mul(new Decimal(0.5));

        for (var i = 0; i < sides; i += 1) {
            var angle = offset.add(new Decimal(i).mul(theta)),
                xx = angle.cos().mul(radius),
                yy = angle.sin().mul(radius);

            path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
        }

        var polygon = { 
            label: 'Polygon Body',
            position: Vector.create(x, y),
            vertices: Vertices.fromPath(path)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, 
                chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, polygon, options));
    };
}