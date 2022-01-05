import Decimal from "decimal.js"
import { Engine } from "../src"
import Bodies from "../src/factory/Bodies"
import MathUtil from "../src/math/MathUtil"

test("创建引擎", () => {
    const engine = Engine.create({
        positionIterations: 3,
        velocityIterations: 3,
        // constraintIterations: 3,
    })

    expect(engine.positionIterations === 3).toBe(true)
    expect(engine.velocityIterations === 3).toBe(true)
    expect(engine.constraintIterations === 2).toBe(true)

    engine.update();

    const body = Bodies.reatangle(MathUtil.ZERO, MathUtil.ZERO, new Decimal(30), new Decimal(30))
    engine.world.add(body)

    engine.update();

})
