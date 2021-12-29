import Decimal from "decimal.js";
export declare class Common {
    private static _nextId;
    private static _seed;
    private static _nowStartTime;
    private static _warnedOnce;
    private static _decomp;
    static get ZERO(): Decimal;
    /**
     * 将args参数添加到obj中
     * @param obj 被拓展的对象
     * @param args 参数
     */
    static extend(obj: any, ...args: any[]): any;
    /**
     * 深度克隆一个对象
     * @param obj
     * @param deep
     * @returns 克隆结果
     */
    static clone(obj: any, deep: boolean): any;
    /**
     * 返回对象的所有key
     * @param obj
     * @returns
     */
    static keys(obj: any): string[];
    /**
     * 返回obj的所有值
     * @param obj
     * @returns
     */
    static values(obj: any): string[];
    static nextId(): number;
}
