/** EasyFlow GP 公用方法 */

var lineBreak = "\n";
var text = { noData: "查無資料", contactAdministrator: "請洽系統管理員", errorLeadMark: "[!]", separator: "\u2063" };

/**
 * 判斷物件是否有值,條件(1)非null(2)非undefined(3)陣列長度非零(4)文字非空字串(5)數字非NaN(6)合法日期
 * @param {Object} obj 欲判斷之物件
 */
function hasValue(obj) {
    if (obj === null) {
        return false;
    }
    if (obj === undefined) {
        return false;
    }
    //Array
    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return false;
        }
        else {
            return true;
        }
    }
    //string
    if (typeof obj === "string") {
        if (obj.trim() === "") {
            return false;
        }
        else {
            return true;
        }
    }
    //number
    if (typeof obj === "number") {
        if (isNaN(obj)) {
            return false;
        }
        else {
            return true;
        }
    }
    //date
    if (obj.constructor === Date) {
        if (isNaN(obj)) {
            return false;
        }
        else {
            return true;
        }
    }

    return true;
}

function noValue(obj) {
    return hasValue(obj) ? false : true;
}

/**
 * 取得現在日期
 * @returns {string} 格式(yyyy/MM/dd)
 */
function getCurrentDate() {
    var current = new Date();

    return current.getFullYear() + '/' + (current.getMonth() + 1).toString().padLeft("00") + '/' + current.getDate().toString().padLeft("00");
}

/**
 * 取得現在時間
 * @returns {string} 格式(hh:mm)
 */
function getCurrentTime() {
    var current = new Date();

    return current.getHours().toString().padLeft("00") + ":" + current.getMinutes().toString().padLeft("00");
}

/**
 * 取得現在日期時間
 * @returns {string} 格式(yyyy/MM/dd hh:mm)
 */
function getCurrentDateTime() {
    return getCurrentDate() + " " + getCurrentTime();
}

/**
 * 將小時換成天數(取到小數點第2位)
 * @param {number} hours 小時數
 * @returns {number} 回傳結果
 */
function getDays(hours) {
    var result = 0;

    if (hours.isNumber()) {
        result = (hours / 8).toFixed(2);
    }

    return result;
}

/**
* String物件補丁(includes方法)
*/
if (!String.prototype.includes) {
    Object.defineProperty(String.prototype, 'includes', {
        value: function (search, start) {
            if (typeof start !== 'number') {
                start = 0
            }

            if (start + search.length > this.length) {
                return false
            } else {
                return this.indexOf(search, start) !== -1
            }
        }
    })
}

/**
* String物件補丁(between方法)
*/
if (!String.prototype.between) {
    Object.defineProperty(String.prototype, 'between', {
        value: function (startText, finishText) {
            return this.substring(
                typeof startText === "string" ? this.indexOf(startText) + startText.length : 0,
                typeof startText === "string" ? this.lastIndexOf(finishText) : this.length);
        }
    })
}

/**
* 顯示例外訊息於視窗及主控台
*/
function showException(ex) {
    console.log(ex.stack);
    alert(ex);
}

/**
* String物件補丁(padLeft方法)
*/
if (!String.prototype.padLeft) {
    Object.defineProperty(String.prototype, 'padLeft', {
        value: function (paddingValue) {
            return String(paddingValue + this).slice(-paddingValue.length);
        }
    })
}

/**
* 取得2個日期相差天數(回傳絕對值,順位先後沒有影響)
* @param {string} dateString1 第1個日期
* @param {string} dateString2 第2個日期
*/
function diffDates(dateString1, dateString2) {
    return Math.abs((Date.parse(dateString2) - Date.parse(dateString1)) / 24 / 60 / 60 / 1000);
}

/**
* Array物件補丁(remove方法,從陣列中移除特定值)
*/
Array.prototype.remove = function (value) {
    var index = this.indexOf(value);
    if (index !== -1) {
        this.splice(index, 1);
    }
};

/**
 * 判斷日期區間1與日期區間2是否重疊
 * @param {string} time1Start 日期區間1起始
 * @param {string} time1Finish 日期區間1結束
 * @param {string} time2Start 日期區間2起始
 * @param {string} time2Finish 日期區間2結束
 */
function isOverlap(time1Start, time1Finish, time2Start, time2Finish) {
    var range1Start = Date.parse(formatDateTimeString(time1Start));
    var range1Finish = Date.parse(formatDateTimeString(time1Finish));
    var range2Start = Date.parse(formatDateTimeString(time2Start));
    var range2Finish = Date.parse(formatDateTimeString(time2Finish));

    if (!range1Start) throw new Error("time1Start必須是合法日期yyyy/MM/dd HH:mi:ss");
    if (!range1Finish) throw new Error("time1Finish必須是合法日期yyyy/MM/dd HH:mi:ss");
    if (!range2Start) throw new Error("time2Start必須是合法日期yyyy/MM/dd HH:mi:ss");
    if (!range2Finish) throw new Error("time2Finish必須是合法日期yyyy/MM/dd HH:mi:ss");

    if (range1Finish > range2Start && range1Start < range2Finish) return true; //時間區段1與時間區段2交集

    return false;
}

/**
* 取得格式化後日期字串
* @param {string} dateString 日期字串
* @returns {string} 回傳結果(只取日期部分並將[-]置換成[/])
*/
function formatDateString(dateString) {
    return dateString.split(" ")[0].replace(/-/g, "/");
}

/**
* 取得格式化後日期時間字串
* @param {string} dateTimeString 日期時間字串
* @returns {string} 回傳結果(將[-]置換成[/]並移除.000)
*/
function formatDateTimeString(dateTimeString) {
    return dateTimeString.replace(/-/g, "/").replace(".000", "");
}

/**
* String物件補丁(format方法,類似C# String.Format格式化文字)
*/
if (!String.prototype.format) {
    Object.defineProperty(String.prototype, 'format', {
        value: function () {
            var originalText = this.toString();
            for (var index = 0; index < arguments.length; index++) {
                var text = arguments[index];

                originalText = originalText.replace("{" + index.toString() + "}", text);
            }

            return originalText;
        }
    })
}

/**
* String物件補丁(toJson方法)
*/
if (!String.prototype.toJson) {
    Object.defineProperty(String.prototype, 'toJson', {
        value: function () {
            return JSON.parse(this.toString());
        }
    })
}

/**
* String物件補丁(toFloat方法)
*/
if (!String.prototype.toFloat) {
    Object.defineProperty(String.prototype, 'toFloat', {
        value: function () {
            if (isNaN(parseFloat(this.toString()))) throw new Error("字串格式錯誤無法轉換");

            return parseFloat(this.toString());
        }
    })
}

/**
* String物件補丁(toInt方法)
*/
if (!String.prototype.toInt) {
    Object.defineProperty(String.prototype, 'toInt', {
        value: function () {
            if (isNaN(parseInt(this.toString(), 10))) throw new Error("字串格式錯誤無法轉換");

            return parseInt(this.toString(), 10);
        }
    })
}

/**
* String物件補丁(toBool方法)
*/
if (!String.prototype.toBool) {
    Object.defineProperty(String.prototype, 'toBool', {
        value: function () {
            if (this.toString().toLowerCase() === "true" || this.toString() === "1") {
                return true;
            }
            else if (this.toString().toLowerCase() === "false" || this.toString() === "0") {
                return false;
            }
            else {
                throw new Error("字串格式錯誤無法轉換");
            }
        }
    })
}

/**
* String物件補丁(toDate方法)
*/
if (!String.prototype.toDate) {
    Object.defineProperty(String.prototype, 'toDate', {
        value: function () {
            if (isNaN(Date.parse(this.toString()))) throw new Error("字串格式錯誤無法轉換");

            return Date.parse(this.toString());
        }
    })
}

/**
* String物件補丁(isNumber方法)
*/
if (!String.prototype.isNumber) {
    Object.defineProperty(String.prototype, 'isNumber', {
        value: function () {
            return isNaN(parseFloat(this.toString())) === false;
        }
    })
}

/**
* String物件補丁(isJson方法)
*/
if (!String.prototype.isJson) {
    Object.defineProperty(String.prototype, 'isJson', {
        value: function () {
            try {
                JSON.parse(this.toString());

                return true;
            } catch (e) {
                return false;
            }
        }
    })
}

/**
* String物件補丁(in方法,類似SQL的In運算子)
*/
if (!String.prototype.in) {
    Object.defineProperty(String.prototype, 'in', {
        value: function (strAry) {
            if (Array.isArray(strAry) === false) throw new Error("strAry型態必須是陣列");

            var thisStr = this.toString();
            return strAry.some(function (item, index, array) {
                return item.toString() === thisStr;
            });
        }
    })
}

/**
* Array物件補丁(add方法,當陣列已有特定值則不新增)
*/
Array.prototype.add = function (value) {
    var index = this.indexOf(value);
    if (index === -1) {
        this.push(value);
    }
};

/**
* Array物件補丁(from方法,從類陣列（array-like）或是可迭代（iterable）物件建立一個新的 Array 實體)
*/
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}