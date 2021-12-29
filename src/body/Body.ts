import Decimal from "decimal.js";
import { Vector } from "..";
import { Common } from "../core/Common";
import Vertex from "../geometry/Vertex";


// 外部可以设置的参数
export interface BodyOpt {

}

export class CollisionFilter {
    category: Decimal;
    mask: Decimal;
    group: Decimal;

    constructor() {
        this.category = new Decimal(0x0001)
        this.mask = new Decimal(0xffffffff)
        this.group = Common.ZERO;
    }
}

export default class Body {

    // 惯性缩放值
    private static _inertiaScale = new Decimal(4)
    private static _nextCollidingGroupId = 1
    private static _nextNonCollidingGroupId = -1;
    private static _nextCategory = 0x0001;


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
    angularVelocity: Vector

    // 是否是传感器
    isSensor: boolean

    // 是否静态
    isStatic: boolean

    // 是否休眠
    isSleeping: boolean

    // 总动量
    motion: Decimal;

    // 睡眠阀值
    sleepThreshold: Decimal;

    // 密度
    density: Decimal;

    // 恢复系数
    restitution: Decimal

    // 摩擦力
    friction: Decimal

    // 静摩擦力
    frictionStatic: Decimal

    // 空气摩擦力
    frictionAir: Decimal

    // 碰撞过滤器
    collisionFilter: CollisionFilter;

    slop: Decimal

    timeScale: Decimal

    circleRadius: Decimal
    
    // 上一帧 的位置
    positionPrev?: Vector

    // 上一帧 的角度
    anglePrev: Decimal

    parent?: Body

    axes: Vector[]

    // 面积
    area: Decimal

    // 质量
    mass: Decimal

    // 惯性
    inertia: Decimal

    constructor(option?: BodyOpt) {
        this.id = Common.nextId();
        this.type = "body"
        this.label = "Body"
        this.parts = [];
        this.angle = Common.ZERO;
        this.position = Vector.create();
        this.vertices = Vertex.fromPath('L 0 0 L 40 0 L 40 40 L 0 40')
        this.force = Vector.create();
        this.torque = Common.ZERO;
        this.positionImpulse = Vector.create();
        this.totalContacts = Common.ZERO;
        this.speed = Common.ZERO;
        this.angularSpeed = Common.ZERO;
        this.velocity = Vector.create();
        this.angularVelocity = Vector.create();
        this.isSensor = false;
        this.isStatic = false;
        this.isSleeping = false;
        this.motion = Common.ZERO;
        this.sleepThreshold = new Decimal(60);
        this.density = new Decimal(0.001)
        this.restitution = Common.ZERO;
        this.friction = new Decimal(0.1)
        this.frictionStatic = new Decimal(0.5)
        this.frictionAir = new Decimal(0.01)
        this.collisionFilter = new CollisionFilter()
        this.slop = new Decimal(0.05)
        this.timeScale = new Decimal(1)
        this.circleRadius = Common.ZERO;
        this.anglePrev = Common.ZERO;
        this.axes = [];
        this.area = Common.ZERO;
        this.mass = Common.ZERO;
        this.inertia = Common.ZERO;
    }

    static nextGroup(isNonCollding: boolean): number {
        if (isNonCollding) {
            return Body._nextNonCollidingGroupId--
        }
        return Body._nextCollidingGroupId++
    }

    static nextCategory(): number {
        Body._nextCategory = Body._nextCategory << 1;
        return Body._nextCategory;
    }

}