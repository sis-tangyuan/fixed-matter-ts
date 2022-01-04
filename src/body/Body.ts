import Decimal from "decimal.js";
import { Vector } from "..";
import { Common } from "../core/Common";
import { IEvent } from "../core/Events";
import Sleeping from "../core/Sleeping";
import Axes from "../geometry/Axes";
import Bounds from "../geometry/Bounds";
import Vertex from "../geometry/Vertex";
import Vertices from "../geometry/Vertices";
import MathUtil from "../math/MathUtil";

// 外部可以设置的参数
export interface BodyOpt {
  parent?: Body;
  axes?: Vector[];
  area?: Decimal;
  mass?: Decimal;
  inertia?: Decimal;
}

/**
 * 一些原始数据缓存
 */
export interface BodyOriginal {
  restitution: Decimal;
  friction: Decimal;
  mass: Decimal;
  inertia: Decimal;
  density: Decimal;
  inverseMass: Decimal;
  inverseInertia: Decimal;
}

interface BodyTotalProperty {
  mass: Decimal;
  area: Decimal;
  inertia: Decimal;
  centre: Vector;
}

export class ConstraintImpulse {
  x: Decimal = MathUtil.ZERO;
  y: Decimal = MathUtil.ZERO;

  angle = MathUtil.ZERO;

}

/**
 * 碰撞过滤
 */
export class CollisionFilter {
  category: number;
  mask: number;
  group: number;

  constructor() {
    this.category = 0x0001;
    this.mask = 0xffffffff;
    this.group = 0;
  }
}

export default class Body implements IEvent {
  // 惯性缩放值
  private static _inertiaScale = new Decimal(4);
  private static _nextCollidingGroupId = 1;
  private static _nextNonCollidingGroupId = -1;
  private static _nextCategory = 0x0001;

  events?: Map<string, Function[]> | undefined;

  id: number;

  // 类型
  type: string;

  // 标签
  label: string;

  parts: Body[];

  // plugin = {}

  // 角度
  angle: Decimal;

  // 顶点列表
  vertices: Vertex[];

  // 位置
  position: Vector;

  // 作用力
  force: Vector;

  // 扭力
  torque: Decimal;

  // 位置冲量
  positionImpulse: Vector;

  // 全部触摸数量
  totalContacts: Decimal;

  // 速率
  speed: Decimal;

  // 角速率
  angularSpeed: Decimal;

  // 速度
  velocity: Vector;

  // 角速度
  angularVelocity: Decimal;

  // 是否是传感器
  isSensor: boolean;

  // 是否静态
  isStatic: boolean;

  // 是否休眠
  isSleeping: boolean;

  // 总动量
  motion: Decimal;

  // 随眠计数
  sleepCounter: Decimal;

  // 睡眠阀值
  sleepThreshold: Decimal;

  // 密度
  density: Decimal;

  // 恢复系数
  restitution: Decimal;

  // 摩擦力
  friction: Decimal;

  // 静摩擦力
  frictionStatic: Decimal;

  // 空气摩擦力
  frictionAir: Decimal;

  // 碰撞过滤器
  collisionFilter: CollisionFilter;

  slop: Decimal;

  timeScale: Decimal;

  circleRadius?: Decimal | null;

  // 上一帧 的位置
  positionPrev: Vector;

  // 上一帧 的角度
  anglePrev: Decimal;

  parent: Body;

  axes: Vector[];

  // 面积
  area: Decimal;

  // 质量
  mass: Decimal;

  // 质量的逆
  inverseMass: Decimal;

  // 惯性
  inertia: Decimal;

  // AABB
  bounds: Bounds;

  _orignal?: BodyOriginal | null;

  inverseInertia: Decimal;

  constraintImpulse: ConstraintImpulse = new ConstraintImpulse();

  constructor(option?: BodyOpt) {
    this.id = Common.nextId();
    this.type = "body";
    this.label = "Body";
    this.parts = [];
    this.angle = MathUtil.ZERO;
    this.position = Vector.create();
    this.positionPrev = Vector.create();
    this.vertices = Vertices.fromPath("L 0 0 L 40 0 L 40 40 L 0 40");
    this.bounds = Bounds.create(this.vertices);
    this.force = Vector.create();
    this.torque = MathUtil.ZERO;
    this.positionImpulse = Vector.create();
    this.totalContacts = MathUtil.ZERO;
    this.speed = MathUtil.ZERO;
    this.angularSpeed = MathUtil.ZERO;
    this.velocity = Vector.create();
    this.angularVelocity = MathUtil.ZERO;
    this.isSensor = false;
    this.isStatic = false;
    this.isSleeping = false;
    this.motion = MathUtil.ZERO;
    this.sleepCounter = MathUtil.ZERO;
    this.sleepThreshold = new Decimal(60);
    this.density = new Decimal(0.001);
    this.restitution = MathUtil.ZERO;
    this.friction = new Decimal(0.1);
    this.frictionStatic = new Decimal(0.5);
    this.frictionAir = new Decimal(0.01);
    this.collisionFilter = new CollisionFilter();
    this.slop = new Decimal(0.05);
    this.timeScale = new Decimal(1);
    this.circleRadius = MathUtil.ZERO;
    this.anglePrev = MathUtil.ZERO;
    this.axes = [];
    this.area = MathUtil.ZERO;
    this.mass = MathUtil.ZERO;
    this.inverseMass = MathUtil.ZERO;
    this.inertia = MathUtil.ZERO;
    this.inverseInertia = MathUtil.ZERO;
    this.parent = option?.parent || this;

    this._initProperties(option);
  }

  static create(options: BodyOpt): Body {
    const body = new Body(options);
    return body;
  }

  static nextGroup(isNonCollding: boolean): number {
    if (isNonCollding) {
      return Body._nextNonCollidingGroupId--;
    }
    return Body._nextCollidingGroupId++;
  }

  static nextCategory(): number {
    Body._nextCategory = Body._nextCategory << 1;
    return Body._nextCategory;
  }

  private _initProperties(options?: BodyOpt) {
    options = options || {};

    this.set({
      bounds: this.bounds || Bounds.create(this.vertices),
      positionPrev: this.positionPrev || Vector.clone(this.position),
      anglePrev: this.anglePrev || this.angle,
      vertices: this.vertices,
      parts: this.parts || [this],
      isStatic: this.isStatic,
      isSleeping: this.isSleeping,
      parent: this.parent || this
    })

    Vertices.rotate(this.vertices, this.angle, this.position);
    Axes.rotate(this.axes, this.angle);
    this.bounds.update(this.vertices, this.velocity);

    this.set({
      axes: options?.axes || this.axes,
      area: options?.area || this.area,
      mass: options?.mass || this.mass,
      inertia: options?.inertia || this.inertia,
    })
  }

  set(settings: any, value?: any) {
    let property: string;
    if (typeof settings === 'string') {
      this._setProperty(settings, value);
    } else {
      for(property in settings) {
        if (!Object.prototype.hasOwnProperty.call(settings, property))
                continue;

        value = settings[property];
        this._setProperty(property, value);
      }
    }
  }

  _setProperty(key: string, value: any) {
    switch(key) {
      case 'isStatic':
                this.setStatic(value);
                break;
            case 'isSleeping':
                Sleeping.set(this, value);
                break;
            case 'mass':
              this.setMass( value);
                break;
            case 'density':
              this.setDensity(value);
                break;
            case 'inertia':
              this.setInertia(value);
                break;
            case 'vertices':
              this.setVertices(value);
                break;
            case 'position':
              this.setPosition(value);
                break;
            case 'angle':
              this.setAngle(value);
                break;
            case 'velocity':
              this.setVelocity(value);
                break;
            case 'angularVelocity':
              this.setAngularVelocity(value);
                break;
            case 'parts':
              this.setParts( value);
                break;
            case 'centre':
              this.setCentre(value);
                break;
            default:
              const a: any = this;
              a[key] = value;
    }
  }

  /**
   * 设置是否静态，包括设置质量和惯性到无穷大
   * @param isStatic
   */
  setStatic(isStatic: boolean) {
    for (let i = 0; i < this.parts.length; i++) {
      let part = this.parts[i];
      part.isStatic = isStatic;

      if (isStatic) {
        this._orignal = {
          restitution: this.restitution,
          friction: this.friction,
          mass: this.mass,
          inertia: this.inertia,
          density: this.density,
          inverseMass: this.inverseMass,
          inverseInertia: this.inverseInertia,
        };

        this.restitution = MathUtil.ZERO;
        this.friction = MathUtil.ZERO;
        this.mass = MathUtil.Infinity;
        this.inertia = MathUtil.Infinity;
        this.density = MathUtil.Infinity;
        this.inverseInertia = MathUtil.ZERO;
        this.inverseMass = MathUtil.ZERO;
        this.positionPrev = Vector.clone(this.position);

        this.anglePrev = this.angle.add(MathUtil.zero);
        this.angularVelocity = MathUtil.ZERO;
        this.speed = MathUtil.ZERO;
        this.angularSpeed = MathUtil.ZERO;
        this.motion = MathUtil.ZERO;
      } else if (this._orignal != null) {
        this.restitution = this._orignal.restitution;
        this.friction = this._orignal.friction;
        this.mass = this._orignal.mass;
        this.inertia = this._orignal.inertia;
        this.density = this._orignal.density;
        this.inverseMass = this._orignal.inverseMass;
        this.inverseInertia = this._orignal.inverseInertia;

        this._orignal = null;
      }
    }
  }

  /**
   * 设置质量
   * @param mass
   */
  setMass(mass: Decimal) {
    let six = new Decimal(6);
    var moment = this.inertia.div(this.mass.div(six));
    this.inertia = moment.mul(mass.div(six));
    this.inverseInertia = MathUtil.one.div(this.inertia);

    this.mass = mass;
    this.inverseMass = MathUtil.one.div(this.mass);
    this.density = this.mass.div(this.area);
  }

  /**
   * 设置密度
   * @param density 密度
   */
  setDensity(density: Decimal) {
    this.setMass(density.mul(this.area));
    this.density = density;
  }

  /**
   * 设置惯性
   * @param inertia 惯性
   */
  setInertia(inertia: Decimal) {
    this.inertia = inertia;
    this.inverseInertia = MathUtil.one.div(inertia);
  }

  /**
   * 设置顶点
   * @param vertices
   */
  setVertices(vertices: Vector[] | Vertex[]) {
    this.vertices = Vertices.create(vertices, this);

    this.axes = Axes.fromVertices(vertices);
    this.area = Vertices.area(vertices);
    this.setMass(this.density.mul(this.area));

    let centre = Vertices.centre(this.vertices);
    Vertices.translate(this.vertices, centre, MathUtil.negOne);

    this.setInertia(
      Body._inertiaScale.mul(Vertices.inertia(this.vertices, this.mass))
    );

    Vertices.translate(this.vertices, this.position);

    this.bounds.update(this.vertices, this.velocity);
  }

  setParts(parts: Body[], autoHull: boolean = true) {
    let i;

    parts = parts.slice(0);
    this.parts.length = 0;
    this.parts.push(this);
    this.parent = this;

    for (i = 0; i < parts.length; i++) {
      let part = this.parts[i];
      if (part != this) {
        part.parent = this;
        this.parts.push(part);
      }
    }

    if (this.parts.length === 1) {
      return;
    }

    if (autoHull) {
      let vertices: Vertex[] = [];
      for (i = 0; i < parts.length; i++) {
        vertices = vertices.concat(parts[i].vertices);
      }

      Vertices.clockwiseSort(vertices);

      let hull = Vertices.hull(vertices),
        hullCentre = Vertices.centre(hull);

      this.setVertices(hull);
    }

    let total = this._totalProperties();
    this.area = total.area;
    this.parent = this;
    this.position = total.centre;
    this.positionPrev = total.centre;
  }

  setCentre(centre: Vector, relative: boolean = false) {
    if (!relative) {
      this.positionPrev = centre.sub(
        this.position.sub(this.positionPrev || this.position)
      );
      this.position = centre;
    } else {
      this.positionPrev = this.positionPrev?.add(centre);
      this.position = this.position.add(centre);
    }
  }

  setPosition(position: Vector) {
    let delta = position.sub(this.position);
    this.positionPrev = this.positionPrev?.add(delta);

    for (let i = 0; i < this.parts.length; i++) {
      let part = this.parts[i];
      part.position = part.position.add(delta);
      Vertices.translate(part.vertices, delta);
      part.bounds.update(part.vertices, this.velocity);
    }
  }

  setAngle(angle: Decimal) {
    var delta = angle.sub(this.angle);
    this.anglePrev = this.anglePrev.add(delta);

    for (let i = 0; i < this.parts.length; i++) {
      let part = this.parts[i];
      part.angle = part.angle.add(delta);
      Vertices.rotate(part.vertices, delta, this.position);
      Axes.rotate(part.axes, delta);
      part.bounds.update(part.vertices, this.velocity);
      if (i > 0) {
        part.position = part.position.rotateAbout(delta, this.position, part.position);
      }
    }
  }

  setVelocity(velocity: Vector) {
    this.positionPrev = this.position.sub(velocity);
    this.velocity = velocity;
    this.speed = this.velocity.magnitude();
  }

  setAngularVelocity(velocity: Decimal) {
    this.anglePrev = this.angle.sub(velocity);
    this.angularVelocity = velocity;
    this.angularSpeed = velocity.abs();
  }

  setTranslate(translation: Vector) {
    this.setPosition(this.position.add(translation));
  }

  rotate(rotation: Decimal, point?: Vector) {
    if (!point) {
      this.setAngle(this.angle.add(rotation));
    } else {
      this.position = this.position.rotateAbout(rotation, point);
      this.setAngle(this.angle.add(rotation));
    }
  }

  scale(scaleX: Decimal, scaleY: Decimal, point?: Vector) {
    let totalArea = MathUtil.ZERO,
      totalInertia = MathUtil.ZERO;

    point = point || this.position;

    for (let i = 0; i < this.parts.length; i++) {
      let part = this.parts[i];
      // 顶点缩放
      Vertices.scale(part.vertices, scaleX, scaleY, point);

      // 更新属性
      part.axes = Axes.fromVertices(part.vertices);
      part.area = Vertices.area(part.vertices);
      part.setMass(this.density.mul(part.area));

      // 更新惯性
      Vertices.translate(part.vertices, part.position.neg());
      part.setInertia(
        Body._inertiaScale.mul(Vertices.inertia(part.vertices, part.mass))
      );
      Vertices.translate(part.vertices, part.position);

      if (i > 0) {
        totalArea = totalArea.add(part.area);
        totalInertia = totalInertia.add(part.inertia);
      }

      // 位置缩放
      part.position.x = point.x.add(part.position.x.sub(point.x).mul(scaleX));
      part.position.y = point.y.add(part.position.y.sub(point.y).mul(scaleY));

      // 更新碰撞边框
      part.bounds.update(part.vertices, this.velocity);
    }

    if (this.parts.length > 1) {
      this.area = totalArea;

      if (!this.isStatic) {
        this.setMass(this.density.mul(totalArea));
        this.setInertia(totalArea);
      }
    }

    if (this.circleRadius != null && this.circleRadius.gt(MathUtil.zero)) {
      if (scaleX.eq(scaleY)) {
        this.circleRadius = this.circleRadius.mul(scaleX);
      } else {
        this.circleRadius = null;
      }
    }
  }

  applyForce(position: Vector, force: Vector) {
    this.force = this.force.add(force);
    const offset = position.sub(this.position);
    this.torque = this.torque.add(offset.cross(force));
  }

  update(deltaTime: Decimal, timeScale: Decimal, correction: Decimal) {
    const deltaTimeSquared = deltaTime
      .mul(timeScale)
      .mul(this.timeScale)
      .pow(new Decimal(2));

    let frictionAir = MathUtil.one.sub(this.friction.mul(timeScale).mul(this.timeScale)),
        velocityPrev = this.position.sub(this.positionPrev);
    
    this.velocity.x = (velocityPrev.x.mul(frictionAir).mul(correction)).add(this.force.x.div(this.mass).mul(deltaTimeSquared))
    this.velocity.y = (velocityPrev.y.mul(frictionAir).mul(correction)).add(this.force.y.div(this.mass).mul(deltaTimeSquared))

    this.positionPrev = this.position;
    this.position = this.position.add(this.velocity);

    // 更新角速度
    this.angularVelocity = (this.angle.sub(this.anglePrev).mul(frictionAir).mul(correction)).add(this.torque.div(this.inertia).mul(deltaTimeSquared));
    this.anglePrev = this.angle;
    this.angle = this.angle.add(this.angularVelocity)

    // 速度和加速度
    this.speed = this.velocity.magnitude();
    this.angularSpeed = this.angularSpeed.abs();

    // 几何变换
    for (let i = 0; i < this.parts.length; i++) {
      let part = this.parts[i];

      Vertices.translate(part.vertices, this.velocity);
      if (i > 0) {
        part.position = part.position.add(this.velocity);
      }

      if (!this.angularVelocity.eq(MathUtil.zero)) {
        Vertices.rotate(part.vertices, this.angularVelocity, this.position);
        Axes.rotate(part.axes, this.angularVelocity)
        if (i > 0) {
          part.position = part.position.rotateAbout(this.angularVelocity, this.position)
        }
      }
    }
  }

  _totalProperties(): BodyTotalProperty {
    let mass: Decimal = MathUtil.ZERO,
      area: Decimal = MathUtil.ZERO,
      inertia: Decimal = MathUtil.ZERO,
      centre: Vector = Vector.create();

    for (let i = this.parts.length === 1 ? 0 : 1; i < this.parts.length; i++) {
      let part = this.parts[i],
        m = this.mass.isFinite() ? part.mass : MathUtil.one;

      mass = mass.add(m);
      area = area.add(part.area);
      inertia = inertia.add(part.inertia);
      centre = centre.add(part.position.mul(m));
    }
    return {
      mass: mass,
      area: area,
      inertia: inertia,
      centre: centre,
    };
  }
}
