import Decimal from "decimal.js"
import MathUtil from "../src/math/MathUtil";


test("测试赋值", () => {
    const a = new Decimal(10);
    let b = a;
    expect(a === b).toBe(true)

    b = a.add(new Decimal(0))
    expect(a !== b).toBe(true);

    let c = new Decimal(1).div(10);
    for(let i = 0; i < 50; i++) {
        // console.log(`数值: ${i} ${c.div(Math.pow(10, i)).toNumber()}`)
    }

    // let d = new Decimal(5.3);
    let d = new Decimal(4.999999999999999999999999);
    for (let i = 0; i < d.toNumber(); i++) {
        // console.log('for decimal: '+i)
    }

    expect(1.9999999999999999999999 === 2.00).toBe(true)
})

test("排序问题", () => {
    let ary = [
        new Decimal(10.8),
        new Decimal(3.8),
        new Decimal(1.3),
        new Decimal(7.4),
        new Decimal(4.8),
        new Decimal(6.38),
    ]
    ary.sort((a: Decimal, b: Decimal) => {
        if (a.eq(b)) return 0;
        const c = a.sub(b);
        return c.gt(new Decimal(0)) ? 1 : -1;
        // return c.toNumber()
    });
    for(let i =0; i < ary.length; i++) {
        console.log(`排序后${ary[i].toNumber()}`)
    }
    expect(ary[0].lt(new Decimal(3))).toBe(true)
})