"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
class Common {
    static get ZERO() { return new decimal_js_1.default(0); }
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
    /**
     * 深度克隆一个对象
     * @param obj
     * @param deep
     * @returns 克隆结果
     */
    static clone(obj, deep) {
        return Common.extend({}, deep, obj);
    }
    /**
     * 返回对象的所有key
     * @param obj
     * @returns
     */
    static keys(obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        let keys = [];
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
    static values(obj) {
        var values = [];
        if (Object.keys) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                values.push(obj[keys[i]]);
            }
            return values;
        }
        for (var key in obj) {
            values.push(obj[key]);
        }
        return values;
    }
    static nextId() {
        return this._nextId++;
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
