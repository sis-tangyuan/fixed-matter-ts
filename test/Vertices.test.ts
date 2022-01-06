import Decimal from "decimal.js"
import { Vector, Vertex } from "../src"
import Vertices from "../src/geometry/Vertices"
import MathUtil from "../src/math/MathUtil"
const vertices = [
    Vertex.createByXY(0, 0),
    Vertex.createByXY(40, 0),
    Vertex.createByXY(40, 40),
    Vertex.createByXY(0, 40),
]

test("创建顶点列表", () => {
    const path = 'L 0 0 L 10 0 L 10 30 L 0 30';
    const vertices = Vertices.fromPath(path);
    expect(vertices.length === 4).toBe(true);
    // for(let i = 0; i < vertices.length; i++) {
    //     console.log(`顶点: ${vertices[i].toString()}`)
    // }
})

test("多边形面积", () => {


    const area = Vertices.area(vertices)
    // console.log("面积: ", area.toString())
    expect(area.eq(new Decimal(1600))).toBe(true)
})

test("多边形面积2", () => {


    const area = Vertices.area2(vertices)
    // console.log("面积: ", area.toString())
    expect(area.eq(new Decimal(1600))).toBe(true)
})

test("多边形质心", () => {
   

    const centre = Vertices.centre(vertices)
    // console.log("质心: ", centre.toString())
    // expect(area.eq(new Decimal(1600))).toBe(true)
})


test("坐标均值", () => {
    

    const mean = Vertices.mean(vertices)
    // console.log("坐标均值: ", mean.toString())
    // expect(area.eq(new Decimal(1600))).toBe(true)
})

test("多边形惯性", () => {
    

    const inertia = Vertices.inertia(vertices, new Decimal(1))
    // console.log("多边形惯性: ", inertia.toString())
    // expect(area.eq(new Decimal(1600))).toBe(true)
})

test("多边形旋转", () => {
    let vertices = [
        Vertex.createByXY(0, 0),
        Vertex.createByXY(30, 0),
        Vertex.createByXY(30, 40),
        Vertex.createByXY(0, 40),
    ]
    const centre = Vertices.centre(vertices)
    // console.log("质心: ", centre.toString())
    vertices = Vertices.rotate(vertices, MathUtil.angleToRadian(new Decimal(90)), centre)
    vertices.forEach((vertex: Vertex, index: number) => {
        const point = vertex.vector;
        // console.log(`点: ${point.toString()}`);
    })
})

test("点是否在多边形内部", () => {
    // ni时钟排序
    const vertices2 = [
        Vertex.createByXY(0, 0),
        Vertex.createByXY(30, 0),
        Vertex.createByXY(30, 30),
        Vertex.createByXY(0, 30),
    ];
    const point1 = Vector.fromXY(15, 15);
    // const point2 = Vector.fromXY(40, 15);
    // const point3 = Vector.fromXY(41, 15);
    expect(Vertices.contain(vertices2, point1)).toBe(true);
    // expect(Vertices.contain(vertices2, point2)).toBe(true)
    // expect(Vertices.contain(vertices2, point3)).toBe(false)
})

test("判断是否凸多边形", () => {
    const shape1 = [
        Vertex.createByXY(0, 0),
        Vertex.createByXY(0, 40),
        Vertex.createByXY(40, 40),
        Vertex.createByXY(40, 0),
    ]
    expect(Vertices.isConvex(shape1)).toBe(true)

    const shape2 = [
        Vertex.createByXY(0, 0),
        Vertex.createByXY(0, 40),
        Vertex.createByXY(40, 40),
        Vertex.createByXY(40, 18),
        Vertex.createByXY(30, 15),
        Vertex.createByXY(40, 0),
    ]
    expect(Vertices.isConvex(shape2)).toBe(false)


})
