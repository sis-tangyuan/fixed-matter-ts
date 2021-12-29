import Decimal from "decimal.js"


test("测试Decimal复制问题", () => {
    const a = new Decimal(0);
    let b = a;
    b = b.add(new Decimal(0));
    expect(b != a).toBe(true);
})