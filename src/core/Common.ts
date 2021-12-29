import Decimal from "decimal.js";

export class Common {
    // 生成的id
    private static _nextId = 0;
    // 随机种子
    private static _seed = 0;
    // 开始时间戳
    private static _nowStartTime = +(new Date())
    
    private static _warnedOnce = {}

    private static _decomp =null;

    public static get ZERO() {return new Decimal(0);}

    /**
     * 将args参数添加到obj中
     * @param obj 被拓展的对象
     * @param args 参数
     */
    public static extend(obj: any, ...args: any[] ): any {
        var argStart,
            deepClone,
            firstArg = args[0];
        if (typeof firstArg == "boolean") {
            argStart = 2;
            deepClone = firstArg;
        } else {
            argStart = 1;
            deepClone = true;
        }

        for (let i = argStart; i < args.length; i++) {
            var source = args[i];
            if (source) {
                for (var prop in source) {
                    if (deepClone && source[prop] && source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], deepClone, source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }
    }

    /**
     * 深度克隆一个对象
     * @param obj 
     * @param deep
     * @returns 克隆结果
     */
    public static clone(obj: any, deep: boolean): any {
        return Common.extend({}, deep, obj);
    }

    /**
     * 返回对象的所有key
     * @param obj 
     * @returns 
     */
    public static keys(obj: any): string[] {
        if (Object.keys) {
            return Object.keys(obj);
        }
        let keys: string[] = [];
        for (let key in obj) {
            keys.push(key);
        }
        return keys;
    }

    /**
     * 返回obj的所有值
     * @param obj 
     * @returns 
     */
    public static values<T>(obj: any): T[] {
        var values: T[] = []

        if (Object.keys) {
            var keys = Object.keys(obj)
            for (var i = 0; i < keys.length; i++) {
                values.push(obj[keys[i]])
            }
            return values;
        }

        for (var key in obj) {
            values.push(obj[key])
        }
        return values;
    }


    public static nextId() {
        return this._nextId++;
    }

}