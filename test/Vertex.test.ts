import Decimal from "decimal.js"
import Vertex from "../src/geometry/Vertex"


test("顶点编辑", () => {
    const vertices = [
        Vertex.createByXY(0, 0),
        Vertex.createByXY(40, 0),
        Vertex.createByXY(40, 40),
        Vertex.createByXY(0, 40),
    ]

    const area = Vertex.area(vertices)
    // console.log("面积: ", area.toString())
    expect(area.eq(new Decimal(1600))).toBe(true)
})