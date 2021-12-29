export declare class Common {
    private static _nextId;
    private static _seed;
    private static _nowStartTime;
    private static _warnedOnce;
    private static _decomp;
    /**
     * 将args参数添加到obj中
     * @param obj 被拓展的对象
     * @param args 参数
     */
    static extend(obj: any, ...args: any[]): any;
}
