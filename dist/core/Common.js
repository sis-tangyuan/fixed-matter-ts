"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = void 0;
class Common {
    /**
     * 将args参数添加到obj中
     * @param obj 被拓展的对象
     * @param args 参数
     */
    static extend(obj, ...args) {
        var argStart, deepClone, firstArg = args[0];
        if (typeof firstArg == "boolean") {
            argStart = 2;
            deepClone = firstArg;
        }
        else {
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
                        }
                        else {
                            obj[prop] = source[prop];
                        }
                    }
                    else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }
    }
}
exports.Common = Common;
// 生成的id
Common._nextId = 0;
// 随机种子
Common._seed = 0;
// 开始时间戳
Common._nowStartTime = +(new Date());
Common._warnedOnce = {};
Common._decomp = null;
