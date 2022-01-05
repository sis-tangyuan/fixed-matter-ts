import Decimal from "decimal.js";

export class Common {
  // 生成的id
  private static _nextId = 0;
  // 随机种子
  private static _seed = 0;
  // 开始时间戳
  private static _nowStartTime = +new Date();

  private static _warnedOnce: Map<string, any> = new Map();

  private static _decomp = null;

  /**
   * 将args参数添加到obj中
   * @param obj 被拓展的对象
   * @param args 参数
   */
  public static extend(obj: any, ...args: any[]): any {
    var argStart,
      deepClone,
      firstArg = args[0];
    if (typeof firstArg == "boolean") {
      argStart = 1;
      deepClone = firstArg;
    } else {
      argStart = 0;
      deepClone = true;
    }

    for (let i = argStart; i < args.length; i++) {
      var source = args[i];
      if (source) {
        for (var prop in source) {
          if (
            deepClone &&
            source[prop] &&
            source[prop].constructor === Object
          ) {
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
    return obj;
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
    var values: T[] = [];

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

  static get(obj: any, path: string, begin?: number, end?: number): any {
    const paths = path.split('.').slice(begin, end);
    for(let i = 0; i < paths.length; i++) {
      obj = obj[paths[i]]
    }
    return obj;
  }

  static set(obj: any, path: string, val: string, begin?: number, end?: number) {
    let parts = path.split('.').slice(begin, end);
    Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
    return val;
  }
/**
     * Shuffles the given array in-place.
     * The function uses a seeded random generator.
     * @method shuffle
     * @param {array} array
     * @return {array} array shuffled randomly
     */
 static shuffle(array: any[]) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Common.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
};

/**
* Randomly chooses a value from a list with equal probability.
* The function uses a seeded random generator.
* @method choose
* @param {array} choices
* @return {object} A random choice object from the array
*/
static choose(choices: any[]) {
  return choices[Math.floor(Common.random() * choices.length)];
};

/**
* Returns true if the object is a HTMLElement, otherwise false.
* @method isElement
* @param {object} obj
* @return {boolean} True if the object is a HTMLElement, otherwise false
*/
static isElement = function(obj: any): boolean {
  if (typeof HTMLElement !== 'undefined') {
      return obj instanceof HTMLElement;
  }

  return !!(obj && obj.nodeType && obj.nodeName);
};

/**
* Returns true if the object is an array.
* @method isArray
* @param {object} obj
* @return {boolean} True if the object is an array, otherwise false
*/
static isArray = function(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

/**
* Returns true if the object is a function.
* @method isFunction
* @param {object} obj
* @return {boolean} True if the object is a function, otherwise false
*/
static isFunction(obj: any): boolean {
  return typeof obj === "function";
};

/**
* Returns true if the object is a plain object.
* @method isPlainObject
* @param {object} obj
* @return {boolean} True if the object is a plain object, otherwise false
*/
static isPlainObject(obj: any): boolean {
  return typeof obj === 'object' && obj.constructor === Object;
};

/**
* Returns true if the object is a string.
* @method isString
* @param {object} obj
* @return {boolean} True if the object is a string, otherwise false
*/
static isString(obj: any): boolean {
  return toString.call(obj) === '[object String]';
};

/**
* Returns the given value clamped between a minimum and maximum value.
* @method clamp
* @param {number} value
* @param {number} min
* @param {number} max
* @return {number} The value clamped between min and max inclusive
*/
static clamp = function(value: Decimal, min: Decimal, max: Decimal): Decimal {
  if (value.lt(min))
      return min;
  if (value.gt(max))
      return max;
  return value;
};

/**
* Returns the sign of the given value.
* @method sign
* @param {number} value
* @return {number} -1 if negative, +1 if 0 or positive
*/
static sign(value: number): number {
  return value < 0 ? -1 : 1;
};

/**
* Returns the current timestamp since the time origin (e.g. from page load).
* The result is in milliseconds and will use high-resolution timing if available.
* @method now
* @return {number} the current timestamp in milliseconds
*/
static now(): number {
  // if (typeof window !== 'undefined' && window.performance) {
  //     if (window.performance.now) {
  //         return window.performance.now();
  //     } else if (typeof window.performance.webkitNow === 'function' ) {
  //         return window.performance.webkitNow();
  //     }
  // }

  // if (Date.now) {
  //     return Date.now();
  // }

  // const date = new Date();
  // return date.getTime() - Common._nowStartTime;

  this.warn("需要实现Common.now()")
  return Common._nowStartTime;
};

/**
* Returns a random value between a minimum and a maximum value inclusive.
* The function uses a seeded random generator.
* @method random
* @param {number} min
* @param {number} max
* @return {number} A random number between min and max inclusive
*/
static random(min?: number, max?: number) {
  min = (typeof min !== "undefined") ? min : 0;
  max = (typeof max !== "undefined") ? max : 1;
  return min + this._seededRandom() * (max - min);
};

static _seededRandom() {
  // https://en.wikipedia.org/wiki/Linear_congruential_generator
  Common._seed = (Common._seed * 9301 + 49297) % 233280;
  return Common._seed / 233280;
};

/**
* Converts a CSS hex colour string into an integer.
* @method colorToNumber
* @param {string} colorString
* @return {number} An integer representing the CSS hex string
*/
static colorToNumber = function(colorString: string): number {
  colorString = colorString.replace('#','');

  if (colorString.length == 3) {
      colorString = colorString.charAt(0) + colorString.charAt(0)
                  + colorString.charAt(1) + colorString.charAt(1)
                  + colorString.charAt(2) + colorString.charAt(2);
  }

  return parseInt(colorString, 16);
};

/**
* The console logging level to use, where each level includes all levels above and excludes the levels below.
* The default level is 'debug' which shows all console messages.  
*
* Possible level values are:
* - 0 = None
* - 1 = Debug
* - 2 = Info
* - 3 = Warn
* - 4 = Error
* @property Common.logLevel
* @type {Number}
* @default 1
*/
static logLevel = 1;

/**
* Shows a `console.log` message only if the current `Common.logLevel` allows it.
* The message will be prefixed with 'matter-js' to make it easily identifiable.
* @method log
* @param ...objs {} The objects to log.
*/
static log = function() {
  if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
      console.log.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
  }
};

/**
* Shows a `console.info` message only if the current `Common.logLevel` allows it.
* The message will be prefixed with 'matter-js' to make it easily identifiable.
* @method info
* @param ...objs {} The objects to log.
*/
static info = function() {
  if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
      console.info.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));
  }
};

/**
* Shows a `console.warn` message only if the current `Common.logLevel` allows it.
* The message will be prefixed with 'matter-js' to make it easily identifiable.
* @method warn
* @param ...objs {} The objects to log.
*/
static warn = function(...args: any) {
  if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
      console.warn.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(args)));
  }
};

/**
* Uses `Common.warn` to log the given message one time only.
* @method warnOnce
* @param ...objs {} The objects to log.
*/
static warnOnce(...args: any[]) {
  var message = Array.prototype.slice.call(args).join(' ');

  if (!Common._warnedOnce.get(message)) {
      Common.warn(message);
      Common._warnedOnce.set(message, true);
  }
};

/**
* Shows a deprecated console warning when the function on the given object is called.
* The target function will be replaced with a new function that first shows the warning
* and then calls the original function.
* @method deprecated
* @param {object} obj The object or module
* @param {string} name The property name of the function on obj
* @param {string} warning The one-time message to show if the function is called
*/
// static deprecated = function(obj: any, prop: string, warning:string) {
//   obj[prop] = Common.chain(function() {
//       Common.warnOnce('🔅 deprecated 🔅', warning);
//   }, obj[prop]);
// };

/**
* Returns the next unique sequential ID.
* @method nextId
* @return {Number} Unique sequential ID
*/
static nextId = function() {
  return Common._nextId++;
};

/**
* A cross browser compatible indexOf implementation.
* @method indexOf
* @param {array} haystack
* @param {object} needle
* @return {number} The position of needle in haystack, otherwise -1.
*/
static indexOf = function(haystack: any[], needle: any) {
  if (haystack.indexOf)
      return haystack.indexOf(needle);

  for (var i = 0; i < haystack.length; i++) {
      if (haystack[i] === needle)
          return i;
  }

  return -1;
};

/**
* A cross browser compatible array map implementation.
* @method map
* @param {array} list
* @param {function} func
* @return {array} Values from list transformed by func.
*/
static map = function(list: any[], func: any) {
  if (list.map) {
      return list.map(func);
  }

  var mapped: any[] = [];

  for (var i = 0; i < list.length; i += 1) {
      mapped.push(func(list[i]));
  }

  return mapped;
};

/**
* Takes a directed graph and returns the partially ordered set of vertices in topological order.
* Circular dependencies are allowed.
* @method topologicalSort
* @param {object} graph
* @return {array} Partially ordered set of vertices in topological order.
*/
static topologicalSort = function(graph: any): any[] {
  // https://github.com/mgechev/javascript-algorithms
  // Copyright (c) Minko Gechev (MIT license)
  // Modifications: tidy formatting and naming
  var result: any[] = [],
      visited: Map<string, any> = new Map(),
      temp: Map<string, any> = new Map();

  for (let node in graph) {
      if (!visited.get(node) && !temp.get(node)) {
          Common._topologicalSort(node, visited, temp, graph, result);
      }
  }

  return result;
};

static _topologicalSort = function(node: string, visited: any, temp: any, graph: any, result: any) {
  var neighbors = graph[node] || [];
  temp[node] = true;

  for (var i = 0; i < neighbors.length; i += 1) {
      var neighbor = neighbors[i];

      if (temp[neighbor]) {
          // skip circular dependencies
          continue;
      }

      if (!visited[neighbor]) {
          Common._topologicalSort(neighbor, visited, temp, graph, result);
      }
  }

  temp[node] = false;
  visited[node] = true;

  result.push(node);
};

/**
* Takes _n_ functions as arguments and returns a new function that calls them in order.
* The arguments applied when calling the new function will also be applied to every function passed.
* The value of `this` refers to the last value returned in the chain that was not `undefined`.
* Therefore if a passed function does not return a value, the previously returned value is maintained.
* After all passed functions have been called the new function returns the last returned value (if any).
* If any of the passed functions are a chain, then the chain will be flattened.
* @method chain
* @param ...funcs {function} The functions to chain.
* @return {function} A new function that calls the passed functions in order.
*/
// static chain(...arg: any[]) {
//   var funcs: any[] = [];

//   for (var i = 0; i < arg.length; i += 1) {
//       var func = arg[i];

//       if (func._chained) {
//           // flatten already chained functions
//           funcs.push.apply(funcs, func._chained);
//       } else {
//           funcs.push(func);
//       }
//   }

//   var chain = function(): any {
//       // https://github.com/GoogleChrome/devtools-docs/issues/53#issuecomment-51941358
//       var lastResult,
//           args = new Array(arguments.length);

//       for (var i = 0, l = arguments.length; i < l; i++) {
//           args[i] = arguments[i];
//       }

//       for (i = 0; i < funcs.length; i += 1) {
//           var result: any = funcs[i].apply(lastResult, args);

//           if (typeof result !== 'undefined') {
//               lastResult = result;
//           }
//       }

//       return lastResult;
//   };

//   chain._chained = funcs;

//   return chain;
// };

/**
* Chains a function to excute before the original function on the given `path` relative to `base`.
* See also docs for `Common.chain`.
* @method chainPathBefore
* @param {} base The base object
* @param {string} path The path relative to `base`
* @param {function} func The function to chain before the original
* @return {function} The chained function that replaced the original
*/
// static chainPathBefore(base: any, path: string, func: any) {
//   return Common.set(base, path, Common.chain(
//       func,
//       Common.get(base, path)
//   ));
// };

/**
* Chains a function to excute after the original function on the given `path` relative to `base`.
* See also docs for `Common.chain`.
* @method chainPathAfter
* @param {} base The base object
* @param {string} path The path relative to `base`
* @param {function} func The function to chain after the original
* @return {function} The chained function that replaced the original
*/
// static chainPathAfter = function(base: any, path: string, func: any) {
//   return Common.set(base, path, Common.chain(
//       Common.get(base, path),
//       func
//   ));
// };

/**
* Provide the [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module to enable
* concave vertex decomposition support when using `Bodies.fromVertices` e.g. `Common.setDecomp(require('poly-decomp'))`.
* @method setDecomp
* @param {} decomp The [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module.
*/
// static setDecomp = function(decomp: any) {
//   Common._decomp = decomp;
// };

/**
* Returns the [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module provided through `Common.setDecomp`,
* otherwise returns the global `decomp` if set.
* @method getDecomp
* @return {} The [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module if provided.
*/
// static getDecomp(): any {
//   // get user provided decomp if set
//   var decomp = Common._decomp;

//   try {
//       // otherwise from window global
//       if (!decomp && typeof window !== 'undefined') {
//           decomp = window.decomp;
//       }

//       // otherwise from node global
//       if (!decomp && typeof global !== 'undefined') {
//           decomp = global.decomp;
//       }
//   } catch (e) {
//       // decomp not available
//       decomp = null;
//   }

//   return decomp;
// };
}
