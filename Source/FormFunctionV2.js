/** EasyFlow GP 表單方法(新版:合併Hotfix.js,寫法與舊版不相容) */

document.write('<script src="../../CustomJsLib/CommonFunction.js"></script>');
document.write('<script src="../../CustomJsLib/jquery-ui.js"></script>');
document.write('<script src="../../CustomJsLib/jquery.sortElements.js"></script>');
document.write('<script type="text/javascript" src="../../dwrDefault/engine.js"></script>');
document.write('<script type="text/javascript" src="../../dwrDefault/util.js"></script>');
document.write('<script type="text/javascript" src="../../dwrDefault/interface/ajax_ProcessAccessor.js"></script>');

var color = { required: "#FFFF99", disabled: "#F0F0F0", optional: "#FFFFFF", none: "" };
var isChrome = (navigator.userAgent.indexOf("Chrome") != -1) ? true : false;
var isIE11 = (navigator.userAgent.indexOf("Trident/7.0") != -1) ? true : false;
var range = { isGreaterZero: "> 0", isGreaterEqualZero: ">= 0", isLessZero: "< 0", isLessEqualZero: "<= 0", unlimited: "" };

/**
* 下拉選單自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} dropdownList 與下拉選單代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function DropdownList(dropdownList) {
    if (!dropdownList) throw new Error("DropDownList控制項不存在," + text.contactAdministrator);
    if (dropdownList.controlType) return dropdownList; //避免重覆宣告

    dropdownList.controlType = "DropdownList";
    dropdownList.titleControl = document.getElementById("lbl_" + dropdownList.id) ? Label(document.getElementById("lbl_" + dropdownList.id)) : undefined;
    dropdownList.hiddenControl = document.getElementById(dropdownList.id + "_hdn") ? HiddenTextBox(document.getElementById(dropdownList.id + "_hdn")) : undefined;
    dropdownList.previousBackgroundColor = color.none;
    dropdownList.tabIndex = -1;
    dropdownList.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(dropdownList, "title", {
        get: function () {
            if (dropdownList.titleControl) {
                return dropdownList.titleControl.innerText;
            }
            else if (dropdownList.getAttribute("title")) {
                return dropdownList.getAttribute("title");
            }
            else {
                return dropdownList.id;
            }
        },
        set: function (text) {
            if (dropdownList.titleControl) {
                dropdownList.titleControl.innerText = text;
            }
            else if (dropdownList.getAttribute("title")) {
                dropdownList.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(dropdownList, "text", {
        get: function () { return (dropdownList.selectedIndex !== -1) ? dropdownList.options[dropdownList.selectedIndex].text : ""; },
        set: function (text) {
            Array.apply(null, dropdownList.options).forEach(function (option) {
                if (option.text === text) dropdownList.selectedIndex = option.index;
            });
        }
    });
    Object.defineProperty(dropdownList, "backgroundColor", {
        get: function () { return dropdownList.style.backgroundColor; },
        set: function (color) {
            dropdownList.style.backgroundColor = color;
            dropdownList.previousBackgroundColor = color;
        }
    });
    Object.defineProperty(dropdownList, "noDataMessage", {
        get: function () { return (dropdownList.value === "$$$$$$" || !dropdownList.value) ? "[" + dropdownList.title + "]" + "必選" : ""; }
    });
    Object.defineProperty(dropdownList, "enabled", {
        get: function () { return !dropdownList.disabled; },
        set: function (value) {
            dropdownList.disabled = !value;
            dropdownList.style.backgroundColor = (value) ? dropdownList.previousBackgroundColor : color.disabled;
        }
    });
    Object.defineProperty(dropdownList, "visible", {
        get: function () { return (dropdownList.style.display !== "none") ? true : false; },
        set: function (value) {
            dropdownList.style.display = (value) ? "inline-block" : "none";

            if (dropdownList.titleControl) dropdownList.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(dropdownList, "toolTip", {
        get: function () { return (dropdownList.getAttribute("title")) ? dropdownList.getAttribute("title") : ""; },
        set: function (text) {
            dropdownList.setAttribute("title", text);
            if (dropdownList.titleControl) dropdownList.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(dropdownList, "top", {
        get: function () { return parseInt(dropdownList.style.top, 10); },
        set: function (value) {
            dropdownList.style.top = value;
            if (dropdownList.titleControl) dropdownList.titleControl.top = (dropdownList.top + dropdownList.titleGapTop);
        }
    });
    Object.defineProperty(dropdownList, "left", {
        get: function () { return parseInt(dropdownList.style.left, 10); },
        set: function (value) {
            dropdownList.style.left = value;
            if (dropdownList.titleControl) dropdownList.titleControl.left = (dropdownList.left + dropdownList.titleGapLeft);
        }
    });
    Object.defineProperty(dropdownList, "width", {
        get: function () { return parseInt(dropdownList.style.width, 10); },
    });
    Object.defineProperty(dropdownList, "height", {
        get: function () { return parseInt(dropdownList.style.height, 10); },
    });
    dropdownList.titleGapTop = (dropdownList.titleControl) ? dropdownList.titleControl.top - dropdownList.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    dropdownList.titleGapLeft = (dropdownList.titleControl) ? dropdownList.titleControl.left - dropdownList.left : 0;
    dropdownList.previousValue = dropdownList.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    dropdownList.loadOptions = function (records, textTagName, valueTagName, allowDuplicateValue) {
        function getTagText(record, tagNames) {
            var result = tagNames;
            var tagGroup = tagNames.match(/\<\w+\>/g);

            for (var index = 0; index < tagGroup.length; index++) {
                var item = tagGroup[index].replace(/\</g, "").replace(/\>/g, "");
                var value = record[item];

                result = result.replace(item, value).replace(/\</g, "").replace(/\>/g, "");
            }

            return result;
        }

        var selectTag = jBPM("<select>");
        jBPM(records).each(function (key, val) {
            var text = getTagText(this, textTagName);
            var value = getTagText(this, valueTagName);

            //選項的值有重覆則不加入
            if (!allowDuplicateValue) {
                if (selectTag.find("option[value='" + value + "']").length === 0) selectTag.append(jBPM('<option></option>').val(value).html(text));
            }
            else {
                selectTag.append(jBPM('<option></option>').val(value).html(text));
            }
        });

        jBPM(dropdownList).html(selectTag.html());

        //還原更新畫面前的已選值
        if (dropdownList.hiddenControl) {
            dropdownList.value = eval(dropdownList.hiddenControl.value);
            dropdownList.selectedIndex = (dropdownList.selectedIndex === -1) ? 0 : dropdownList.selectedIndex;
        }
        else {
            dropdownList.selectedIndex = 0;
        }
    }
    dropdownList.addOption = function (text, value, addAtFirst) {
        var option = document.createElement("option");

        option.text = text;
        option.value = value;

        if (addAtFirst) {
            dropdownList.add(option, 0);
        } else {
            dropdownList.add(option);
        }

        //還原更新畫面前的已選值
        if (dropdownList.hiddenControl) {
            dropdownList.value = eval(dropdownList.hiddenControl.value);
            dropdownList.selectedIndex = (dropdownList.selectedIndex === -1) ? 0 : dropdownList.selectedIndex;
        }
        else {
            if (addAtFirst) {
                dropdownList.selectedIndex = 0;
            } else {
                dropdownList.selectedIndex = dropdownList.options.length - 1;
            }
        }
    }
    dropdownList.clear = function () {
        Array.apply(null, dropdownList.options).forEach(function (option) {
            if (option.value === "$$$$$$" || !option.value) dropdownList.value = option.value;
        });

        if (!dropdownList.noDataMessage) dropdownList.addOption("", "", true);
    }
    dropdownList.clearOptions = function () {
        dropdownList.options.length = 0;
    }

    dropdownList.style.border = "#ccc 1px solid"
    //依狀態更新顯示外觀
    dropdownList.enabled = dropdownList.enabled;

    //事件綁定
    if (typeof window[dropdownList.id + "_onload"] === "function") window[dropdownList.id + "_onload"]();

    return dropdownList;
}

/**
* 表格自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} hiddenField 與表格代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Grid(hiddenField) {
    var grid = window[hiddenField.id + "Obj"];

    if (!grid) throw new Error("Grid控制項不存在," + text.contactAdministrator);
    if (grid.controlType) return grid; //避免重覆宣告

    grid.controlType = "Grid";
    grid.titleControl = document.getElementById("lbl_" + hiddenField.id) ? Label(document.getElementById("lbl_" + hiddenField.id)) : undefined;
    grid.columnWidth = 60;
    grid.hasChanged = false; //是否要執行onchange事件
    grid.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(grid, "id", {
        get: function () { return hiddenField.id; }
    });
    Object.defineProperty(grid, "value", {
        get: function () { return (hiddenField.value === "[]") ? "" : hiddenField.value; },
        set: function (value) { hiddenField.value = value; }
    });
    Object.defineProperty(grid, "title", {
        get: function () {
            if (grid.titleControl) {
                return grid.titleControl.innerText;
            }
            else if (grid.getAttribute("title")) {
                return grid.getAttribute("title");
            }
            else {
                return hiddenField.id;
            }
        },
        set: function (text) {
            if (grid.titleControl) {
                grid.titleControl.innerText = text;
            }
            else if (grid.getAttribute("title")) {
                grid.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(grid, "noDataMessage", {
        get: function () { return (!grid.value) ? "[" + grid.title + "]" + "資料筆數為0" : ""; }
    });
    Object.defineProperty(grid, "style", {
        get: function () { return document.getElementById(grid.getId()).style; }
    });
    Object.defineProperty(grid, "visible", {
        get: function () { return (grid.style.display !== "none") ? true : false; },
        set: function (value) {
            grid.style.display = (value) ? "inline-block" : "none";

            if (grid.titleControl) grid.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(grid, "data", {
        get: function () { return grid.getData(); }
    });
    Object.defineProperty(grid, "hasRows", {
        get: function () { return (grid.getData().length > 0) ? true : false; }
    });
    Object.defineProperty(grid, "columnIds", {
        get: function () { return window[hiddenField.id + "ColumnIds"]; }
    });
    Object.defineProperty(grid, "rowIndex", {
        get: function () { return parseInt(grid.getRowIndex(), 10); }
    });
    Object.defineProperty(grid, "isSelected", {
        get: function () { return (grid.rowIndex !== -1) ? true : false; }
    });
    Object.defineProperty(grid, "top", {
        get: function () { return parseInt(grid.style.top, 10); },
        set: function (value) {
            grid.style.top = value;
            grid.beforeReloadTop = value;
            if (grid.titleControl) grid.titleControl.top = (grid.top + grid.titleGapTop);
        }
    });
    Object.defineProperty(grid, "left", {
        get: function () { return parseInt(grid.style.left, 10); },
        set: function (value) {
            grid.style.left = value;
            grid.beforeReloadLeft = value;
            if (grid.titleControl) grid.titleControl.left = (grid.left + grid.titleGapLeft);
        }
    });
    Object.defineProperty(grid, "width", {
        get: function () { return parseInt(grid.style.width, 10); },
    });
    Object.defineProperty(grid, "height", {
        get: function () { return parseInt(grid.style.height, 10); },
    });
    grid.beforeReloadTop = grid.top; //調用reload方法會導致控制項位置回復到調整前,所以先暫存在此,等reload後再回復調整後位置
    grid.beforeReloadLeft = grid.left;
    grid.titleGapTop = (grid.titleControl) ? grid.titleControl.top - grid.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    grid.titleGapLeft = (grid.titleControl) ? grid.titleControl.left - grid.left : 0;
    grid.previousValue = grid.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    grid.load = function (data) {
        if (data) {
            hiddenField.value = JSON.stringify(data).replace(/"/g, "'");
        }

        if (hiddenField.value) {
            grid.reload(eval(hiddenField.value));
            grid.reposition();
        }
    }
    grid.save = function () {
        hiddenField.value = grid.toArrayString();
    }
    grid.onChange = function (func) {
        var timer = setInterval(function () {
            if (grid.hasChanged) {
                try {
                    func();
                    grid.hasChanged = false;
                }
                catch (ex) {
                    clearInterval(timer);

                    showException(ex);
                }
            }
        }, 100);
    }
    grid.clear = function () {
        grid.load([]);
    }
    grid.getColumnIndex = function (columnId) {
        if (grid.columnIds.indexOf(columnId) !== -1) {
            return grid.columnIds.indexOf(columnId);
        }
        else {
            var txtColumnIndex = grid.columnIds.indexOf(columnId + "_txt");
            if (txtColumnIndex !== -1) {
                return txtColumnIndex;
            }
            else {
                throw new Error("找不到控制項[" + columnId + "]");
            }
        }
    }
    grid.setColumnWidthByIds = function (width, columnIds) {
        if (columnIds) {
            for (var index = 0; index < columnIds.length; index++) {
                var colIndex = grid.getColumnIndex(columnIds[index]);
                grid.setColumnWidth(width, colIndex);
            }
        }
        else {
            for (var colIndex = 0; colIndex < grid.columnIds.length; colIndex++) {
                grid.setColumnWidth(width, colIndex);
            }
        }
    }
    grid.sortById = function (columnId, direction) {
        var colIndex = grid.getColumnIndex(columnId);
        switch (direction) {
            case "desc":
                grid.sort(colIndex, "descending")
                break;

            case "asc":
                grid.sort(colIndex, "ascending")
                break;

            default:
                throw new Error("direction值必須是(asc/desc)其中之一");
        }
    }
    grid.getJson = function (names) {
        var dataObjects = new Array();
        var rows = grid.getData();

        for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            var dataObject = new Object();
            var row = rows[rowIndex];

            if (names) {
                for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
                    var columnName = (typeof names[nameIndex] === "string") ? names[nameIndex] : names[nameIndex].id;

                    var mappingColIndex = grid.getColumnIndex(columnName);
                    dataObject[columnName] = row[mappingColIndex];
                }
            }
            else {
                for (var colIndex = 0; colIndex < grid.columnIds.length; colIndex++) {
                    var columnName = grid.columnIds[colIndex];
                    dataObject[columnName] = row[colIndex];
                }
            }

            dataObjects.push(dataObject);
        }

        return dataObjects;
    }
    grid.toJsonString = function (names) {
        return JSON.stringify(grid.getJson(names));
    }
    grid.onSelect = function (func) {
        rowClickFunc = func;
    }
    /** 開啟上下方向鍵選擇功能 */
    grid.setSelectByUpDownKeys = function () {
        grid.onKeyUp = function (event) {
            if ((grid.rowIndex - 1) >= 0) {
                grid.onRowClicked(event, (grid.rowIndex - 1));
            }
        }
        grid.onKeyDown = function (event) {
            if ((grid.rowIndex + 1) < grid.getData().length) {
                grid.onRowClicked(event, grid.rowIndex + 1);
            }
        }
    }
    grid.hideColumnByIds = function (columnIds) {
        //產生欄位位置陣列
        var showingColIndexes = new Array();
        for (var index = 0; index < grid.columnIds.length; index++) {
            showingColIndexes.push(index);
        }

        for (var index = 0; index < columnIds.length; index++) {
            var hidingColIndex = grid.getColumnIndex(columnIds[index]);

            showingColIndexes.remove(hidingColIndex);
        }

        grid.setColumnIndices(showingColIndexes);
    }
    grid.getCellById = function (columnId, rowIndex) {
        var colIndex = grid.getColumnIndex(columnId);
        if (!rowIndex && rowIndex !== 0) {
            if (!grid.isSelected) throw new Error("未選擇表格任一列資料");

            rowIndex = grid.rowIndex;
        }

        if (rowIndex >= grid._rowCount) throw new Error("表格無第[{0}]列".format((rowIndex + 1).toString()));

        return grid.getCellData(colIndex, rowIndex);
    }
    grid.setRowBackgroundColor = function (color, rowIndex) {
        if (rowIndex >= grid._rowCount) throw new Error("表格無第[{0}]列".format((rowIndex + 1).toString()));

        grid.getRowTemplate(rowIndex).setStyle("background-color", color);
    }
    grid.add = function () {
        grid.addRow();
        grid.reposition();
        grid.save();
        grid.hasChanged = true;
    }
    grid.update = function () {
        grid.editRow();
        grid.reposition();
        grid.save();
        if (grid.previousValue !== grid.value) grid.hasChanged = true;
    }
    grid.delete = function () {
        grid.deleteRow();
        grid.reposition();
        grid.save();
        grid.hasChanged = true;
    }
    grid.saveTemp = function () {
        grid.previousValue = JSON.stringify(grid.getData());
    }
    grid.restore = function () {
        grid.reload(grid.previousValue);
        grid.reposition();
    }
    /** 只顯示(避免寫入XML造成資料異動,開啟時顯示單身筆數錯誤異常) */
    grid.display = function (data) {
        if (data) {
            grid.reload(eval(data));
            grid.reposition();
        }
    }
    grid.getDuplicateRowIndex = function (excludeSelectedRow, columnIds) {
        var duplicateRowIndex = -1;

        if (!grid.hasRows) {
            return duplicateRowIndex;
        }

        var bindingControlValues = new Array();

        if (columnIds) {
            for (var currentColumnIndex = 0; currentColumnIndex < columnIds.length; currentColumnIndex++) {
                var columnId = columnIds[currentColumnIndex];

                bindingControlValues.push(document.getElementById(columnId).value.toString());
            }

            var bindingControlJoinValue = bindingControlValues.join();

            var gridRowValues = grid.getData();

            for (var currentRowIndex = 0; currentRowIndex < gridRowValues.length; currentRowIndex++) {
                //跳過被選取的列(用於Update)
                if (excludeSelectedRow && grid.rowIndex === currentRowIndex) {
                    continue;
                }

                var currentRowValues = new Array();

                for (var currentColumnIndex = 0; currentColumnIndex < columnIds.length; currentColumnIndex++) {
                    var columnId = columnIds[currentColumnIndex];

                    var cell = grid.getCellById(columnId, currentRowIndex);

                    currentRowValues.push(cell);
                }

                var currentRowJoinValue = currentRowValues.join();

                if (currentRowJoinValue === bindingControlJoinValue) {
                    duplicateRowIndex = currentRowIndex;

                    break;
                }
            }
        }
        else {
            for (var currentBindingIndex = 0; currentBindingIndex < window[grid.id + "Binding"].length; currentBindingIndex++) {
                var bindingId = window[grid.id + "Binding"][currentBindingIndex];

                bindingControlValues.push(document.getElementById(bindingId).value.toString());
            }

            var bindingControlJoinValue = bindingControlValues.join();

            var gridRowValues = grid.getData();

            for (var currentRowIndex = 0; currentRowIndex < gridRowValues.length; currentRowIndex++) {
                //跳過被選取的列(用於Update)
                if (excludeSelectedRow && grid.rowIndex === currentRowIndex) {
                    continue;
                }

                var currentRowValues = gridRowValues[currentRowIndex];

                var currentRowJoinValue = currentRowValues.join();

                if (currentRowJoinValue === bindingControlJoinValue) {
                    duplicateRowIndex = currentRowIndex;

                    break;
                }
            }
        }

        return duplicateRowIndex;
    }
    grid.reposition = function () {
        if (grid.beforeReloadTop) grid.top = grid.beforeReloadTop;
        if (grid.beforeReloadLeft) grid.left = grid.beforeReloadLeft;
    }
    grid.previousValue = grid.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    grid.load();
    grid.setSelectByUpDownKeys();
    grid.setColumnWidthByIds(grid.columnWidth);

    //已選取列CSS加上!important以避免被之前設定列背景色(setRowBackgroundColor)蓋掉
    if (document.getElementsByTagName("aw-css-overwrite").length === 0) {
        var overwriteAwCssTag = document.createElement("aw-css-overwrite");
        var styleTag = document.createElement("style");
        styleTag.type = "text/css";
        styleTag.appendChild(document.createTextNode(".aw-rows-selected{ background-color:rgb(51, 153, 255) !important; }"));
        overwriteAwCssTag.appendChild(styleTag);
        document.body.appendChild(overwriteAwCssTag);
    }

    //事件綁定
    if (typeof window[grid.id + "_onselect"] === "function") grid.onSelect(window[grid.id + "_onselect"]);
    if (typeof window[grid.id + "_onchange"] === "function") grid.onChange(window[grid.id + "_onchange"]);

    return grid;
}
var rowClickFunc;
/**onRowClicked事件(寫這裡就不用寫在頁面Js)*/
function gridRowClick(pGridId) {
    try {
        if (typeof rowClickFunc === "function") {
            for (var index = 0; index < Object.keys(window).length; index++) {
                var variable = window[Object.keys(window)[index]];
                if (typeof variable === "object" && variable) {
                    if (variable.hasOwnProperty("controlType")) {
                        if (variable.controlType === "Grid" && variable.getId() === pGridId) {
                            var rows = variable.getJson();
                            var index = variable.rowIndex;
                            var row = rows[index];
                            rowClickFunc(row, index, rows);
                            break;
                        }
                    }
                }
            }
        }
    }
    catch (ex) {
        showException(ex);
    }
}

/**
* 按鈕自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} button 與按鈕代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Button(button) {
    if (!button) throw new Error("Button控制項不存在," + text.contactAdministrator);
    if (button.controlType) return button; //避免重覆宣告

    button.controlType = "Button";
    button.previousBackgroundColor = color.none;
    Object.defineProperty(button, "backgroundColor", {
        get: function () { return button.style.backgroundColor; },
        set: function (color) {
            button.style.backgroundColor = color;
            button.previousBackgroundColor = color;
        }
    });
    Object.defineProperty(button, "enabled", {
        get: function () { return !button.disabled; },
        set: function (value) {
            button.disabled = !value;
            button.style.color = (value) ? "black" : "gray";
            button.style.backgroundColor = (value) ? button.previousBackgroundColor : color.none;
        }
    });
    Object.defineProperty(button, "visible", {
        get: function () { return (button.style.display !== "none") ? true : false; },
        set: function (value) { button.style.display = (value) ? "inline-block" : "none"; }
    });
    Object.defineProperty(button, "toolTip", {
        get: function () { return (button.getAttribute("title")) ? button.getAttribute("title") : ""; },
        set: function (text) { button.setAttribute("title", text); }
    });
    Object.defineProperty(button, "top", {
        get: function () { return parseInt(button.style.top, 10); },
        set: function (value) { button.style.top = value; }
    });
    Object.defineProperty(button, "left", {
        get: function () { return parseInt(button.style.left, 10); },
        set: function (value) { button.style.left = value; }
    });
    Object.defineProperty(button, "width", {
        get: function () { return parseInt(button.style.width, 10); },
    });
    Object.defineProperty(button, "height", {
        get: function () { return parseInt(button.style.height, 10); },
    });

    button.openSearchWindow = function (dataArray, columnNames, returnIdMappings, clickFunc, cancelFunc, isTiptopMode) {
        //分頁筆數,現在頁數,總頁數,資料起始index,資料結束index
        var page = { pagingCount: 10, currentCount: 1, totalCount: dataArray.length, dataStartIndex: 0, dataFinishIndex: 9 };

        //關閉其他已開啟的開窗
        button.searchWindow = undefined;
        var otherSearchContainer = document.getElementById("ffCustomSearchContainer");
        if (otherSearchContainer) otherSearchContainer.childNodes[0].childNodes[1].childNodes[0].childNodes[4].click();

        var searchContainer = document.createElement("DIV");
        searchContainer.id = "ffCustomSearchContainer";
        searchContainer.style.position = "fixed";
        searchContainer.style.display = "inline-block";
        searchContainer.style.left = (button.getBoundingClientRect().left - 150);
        searchContainer.style.top = button.getBoundingClientRect().bottom;

        var layoutTable = document.createElement("TABLE");
        layoutTable.id = "ffCustomSearchLayout";
        layoutTable.style.backgroundColor = "#FFFFFF";
        layoutTable.style.borderColor = "#B7C7E3";
        layoutTable.style.borderWidth = "1px";
        layoutTable.style.borderStyle = "solid";

        //標題列
        var layoutRow0 = document.createElement("TR");
        var layoutCell0 = document.createElement("TD");
        layoutCell0.innerText = "資料查詢視窗";
        layoutCell0.style.backgroundColor = "#D0D0D0";
        layoutRow0.appendChild(layoutCell0);
        layoutTable.appendChild(layoutRow0);

        //分頁操作按鈕/關閉按鈕列
        var layoutRow1 = document.createElement("TR");
        var layoutCell1 = document.createElement("TD");

        var firstPageButton = document.createElement("INPUT");
        firstPageButton.type = "BUTTON";
        firstPageButton.value = "最前一頁";
        firstPageButton.onclick = function () {
            page.currentCount = 1;
            page.dataStartIndex = getDataStartIndex(page);
            page.dataFinishIndex = getDataFinishIndex(page);

            showTable(page);
        }
        layoutCell1.appendChild(firstPageButton);

        var previousPageButton = document.createElement("INPUT");
        previousPageButton.type = "BUTTON";
        previousPageButton.value = "上一頁";
        previousPageButton.onclick = function () {
            page.currentCount -= 1;
            page.dataStartIndex = getDataStartIndex(page);
            page.dataFinishIndex = getDataFinishIndex(page);

            showTable(page);
        }
        layoutCell1.appendChild(previousPageButton);

        var nextPageButton = document.createElement("INPUT");
        nextPageButton.type = "BUTTON";
        nextPageButton.value = "下一頁";
        nextPageButton.onclick = function () {
            page.currentCount += 1;
            page.dataStartIndex = getDataStartIndex(page);
            page.dataFinishIndex = getDataFinishIndex(page);

            showTable(page);
        }
        layoutCell1.appendChild(nextPageButton);

        var lastPageButton = document.createElement("INPUT");
        lastPageButton.type = "BUTTON";
        lastPageButton.value = "最後一頁";
        lastPageButton.onclick = function () {
            page.currentCount = page.totalCount;
            page.dataStartIndex = getDataStartIndex(page);
            page.dataFinishIndex = getDataFinishIndex(page);

            showTable(page);
        }
        layoutCell1.appendChild(lastPageButton);
        layoutRow1.appendChild(layoutCell1);

        var closeButton = document.createElement("INPUT");
        closeButton.type = "BUTTON";
        closeButton.value = "x";
        closeButton.style.cssFloat = "right";
        closeButton.onclick = function () {
            document.getElementById(formId + "_shell").removeChild(searchContainer);

            button.disabled = false;
        }
        layoutCell1.appendChild(closeButton);

        layoutRow1.appendChild(layoutCell1);
        layoutTable.appendChild(layoutRow1);

        //搜尋欄名/文字框/搜尋按鈕/片語按鈕列
        var layoutRow2 = document.createElement("TR");
        var layoutCell2 = document.createElement("TD");

        var filterTextbox = document.createElement("INPUT");
        filterTextbox.type = "TEXT";
        filterTextbox.id = "ffCustomSearchFilterText";
        filterTextbox.onkeyup = function (event) {
                /** 資料列最後一列的位置 */var lastRowIndex = button.searchWindow.tableRows.length - 1;
                /** 表格是否有資料列 */var hasTableContent = lastRowIndex > -1;
                /** 游標不在表格內 */ var isCursorNotInRows = button.searchWindow.currentRowIndex === -1;
                /** 游標在最前一列 */ var isCursorInFistRow = button.searchWindow.currentRowIndex === 0;
                /** 游標在最後一列 */ var isCursorInLastRow = button.searchWindow.currentRowIndex === lastRowIndex;
                /** 可接受的按鍵 */ var canInputKeys =
                event.keyCode === 46 || //Delete鍵
                event.keyCode === 8 || //Backspace鍵
                event.keyCode === 27 || //Esc鍵
                (event.keyCode > 47 && event.keyCode < 58) ||//數字鍵
                event.keyCode === 32 ||//空白鍵
                (event.keyCode > 64 && event.keyCode < 91) || //英文字母鍵
                (event.keyCode > 95 && event.keyCode < 112) || //右邊的數字鋌
                (event.keyCode > 185 && event.keyCode < 193) ||//特殊符號(;=,-./`)
                (event.keyCode > 218 && event.keyCode < 223); //特殊符號([\]')
            var prevRowIndex = -1;

            if (event.key.in(["ArrowDown", "Down", "ArrowUp", "Up", "Enter", "PageDown", "PageUp", "End", "Home", "Escape", "Esc"])) {
                event.preventDefault();

                if (event.key.in(["Escape", "Esc"])) {
                    closeButton.click();

                    if (typeof cancelFunc === "function") {
                        try {
                            cancelFunc();
                        }
                        catch (ex) {
                            showException(ex);
                        }
                    }

                    return;
                }

                if (!hasTableContent) {
                    return;
                }

                if (event.key === "Enter") {
                    if (!isCursorNotInRows) button.searchWindow.tableRows[button.searchWindow.currentRowIndex].click();
                }
                else if (event.key.in(["ArrowDown", "Down", "ArrowUp", "Up"])) {
                    if (event.key.in(["ArrowDown", "Down"])) {
                        if (isCursorInLastRow) {
                            button.searchWindow.currentRowIndex = 0;
                            prevRowIndex = lastRowIndex;
                        }
                        else {
                            button.searchWindow.currentRowIndex += 1;
                            prevRowIndex = button.searchWindow.currentRowIndex - 1;
                        }
                    }
                    else if (event.key.in(["ArrowUp", "Up"])) {
                        if (isCursorInFistRow || isCursorNotInRows) {
                            button.searchWindow.currentRowIndex = lastRowIndex;
                            prevRowIndex = 0;
                        }
                        else {
                            button.searchWindow.currentRowIndex -= 1;
                            prevRowIndex = button.searchWindow.currentRowIndex + 1;
                        }
                    }

                    button.searchWindow.tableRows[button.searchWindow.currentRowIndex].style.backgroundColor = "rgb(255,255,0)";
                    if (button.searchWindow.currentRowIndex !== prevRowIndex) {
                        if (button.searchWindow.tableRows[prevRowIndex]) {
                            button.searchWindow.tableRows[prevRowIndex].style.backgroundColor = button.searchWindow.tableRows[prevRowIndex].getAttribute("original-background-color");
                        }
                    }
                }
                else if (event.key.in(["PageDown", "PageUp", "End", "Home"])) {
                    switch (event.key) {
                        case "PageDown":
                            nextPageButton.click();
                            break;

                        case "PageUp":
                            previousPageButton.click();
                            break;

                        case "End":
                            lastPageButton.click();
                            break;

                        case "Home":
                            firstPageButton.click();
                            break;
                    }
                }
            }
            else {
                if (canInputKeys) {
                    button.searchWindow.currentRowIndex = -1;
                    filterButton.click();
                }
            }
        }
        filterTextbox.ondblclick = function (event) {
            event.preventDefault();

            filterTextbox.value = "";

            button.searchWindow.currentRowIndex = -1;
            filterButton.click();
        }
        filterTextbox.onwheel = function (event) {
            if (event.deltaY > 0) {
                event.preventDefault();

                nextPageButton.click();
            }
            else if (event.deltaY < 0) {
                event.preventDefault();

                previousPageButton.click();
            }
        }
        layoutCell2.appendChild(filterTextbox);

        var filterButton = document.createElement("INPUT");
        filterButton.type = "BUTTON";
        filterButton.value = "查詢";
        filterButton.onclick = function () {
            page.currentCount = 1;
            page.dataStartIndex = 0;
            page.dataFinishIndex = 9;

            showTable(page);
        };
        layoutCell2.appendChild(filterButton);

        var phraseButton = document.createElement("INPUT");
        phraseButton.type = "BUTTON";
        phraseButton.value = "片語";
        phraseButton.onclick = function () {
            var windowWidth = 500;
            var windowHeight = 300;
            var windowLeft = (screen.width / 2) - (windowWidth / 2);
            var windowTop = (screen.height / 2) - (windowHeight / 2);

            window.open("/NaNaWeb/GP/WMS/ManagePhrase/QuotePhrase?hdnMethod=quotePhrase&hdnHtmlElementId=" + filterTextbox.id, "片語視窗", "width=" + windowWidth.toString() + ",height=" + windowHeight.toString() + ",left=" + windowLeft.toString() + ",top=" + windowTop.toString() + ",resizable=yes,scrollbars=yes");
        };
        layoutCell2.appendChild(phraseButton);

        layoutRow2.appendChild(layoutCell2);
        layoutTable.appendChild(layoutRow2);

        //搜尋結果列
        var layoutRow3 = document.createElement("TR");
        var layoutCell3 = document.createElement("TD");
        layoutRow3.appendChild(layoutCell3);
        layoutTable.appendChild(layoutRow3);

        //分頁筆數顯示列
        var layoutRow4 = document.createElement("TR");
        var layoutCell4 = document.createElement("TD");
        layoutCell4.style.color = "#FFFFFF";
        layoutCell4.style.backgroundColor = "#666666";
        layoutRow4.appendChild(layoutCell4);
        layoutTable.appendChild(layoutRow4);

        //顯示搜尋結果於搜尋結果列
        showTable(page);

        searchContainer.appendChild(layoutTable);
        jBPM(searchContainer).draggable();
        document.getElementById(formId + "_shell").appendChild(searchContainer);
        button.searchWindow = searchContainer;
        button.searchWindow.submitButton = filterButton;
        button.searchWindow.searchTextBox = filterTextbox;
        button.searchWindow.closeButton = closeButton;
        button.searchWindow.tableRows = button.searchWindow.getElementsByClassName("dataRow");
        button.searchWindow.currentRowIndex = -1;

        filterTextbox.focus();

        button.disabled = true;

        //#region 如果太靠近表單底端造成內容被遮蓋則向上移動到能呈現全部內容的位置
        var currentForm = document.forms[0];
        if (searchContainer.getBoundingClientRect().bottom >= currentForm.getBoundingClientRect().bottom) {
            var offSet = searchContainer.getBoundingClientRect().bottom - currentForm.getBoundingClientRect().bottom;
            searchContainer.style.top = (parseInt(searchContainer.style.top, 10) - offSet - 10);
        }
        //#endregion

        //#region 修正搜尋視窗大小
        if (searchContainer.getBoundingClientRect().width > 700) {
            searchContainer.style.width = '700px';
        }

        if (searchContainer.getBoundingClientRect().height > 400) {
            searchContainer.style.height = '400px';
            searchContainer.style.overflow = 'auto';
            searchContainer.style.top = '300px';
        }
        //#endregion

        function getTotalPageCount(dataArray, page) {
            return Math.ceil(dataArray.length / parseInt(page.pagingCount, 10));
        }

        function getDataStartIndex(page) {
            return (parseInt(page.currentCount, 10) - 1) * parseInt(page.pagingCount, 10);
        }

        function getDataFinishIndex(page) {
            return parseInt(page.dataStartIndex, 10) + (parseInt(page.pagingCount, 10) - 1, 10);
        }

        function showTable(page) {
            var filteredDataArray = new Array();

            if (filterTextbox.value) {
                for (var dataIndex = 0; dataIndex < dataArray.length; dataIndex++) {
                    var data = dataArray[dataIndex];

                    for (var columnName in columnNames) {
                        var columnValue = data[columnName];
                        if (!columnValue) {
                            columnValue = "";
                        }

                        if (typeof columnValue !== "string") {
                            columnValue = columnValue + "";
                        }

                        if (columnValue) {
                            //仿Tiptop搜尋方式(用*作為萬用字元)
                            if (isTiptopMode) {
                                //把*改成正規表達式的.*?(=任何字元出現0次到無限次)
                                var rule = '^' + filterTextbox.value.split('').map(function (char) { return char.replace('*', '.*?'); }).join('') + '$';
                                var filter = new RegExp(rule, 'gi'); //忽略大小寫

                                if (filter.test(columnValue)) {
                                    filteredDataArray.push(data);

                                    break;
                                }
                            }
                            else if (columnValue.toUpperCase().includes(filterTextbox.value.toUpperCase())) {
                                filteredDataArray.push(data);

                                break;
                            }
                        }
                    }
                }
            }
            else {
                filteredDataArray = JSON.parse(JSON.stringify(dataArray)); //複製陣列
            }

            var pagedDataArray = new Array();
            for (var dataIndex = 0; dataIndex < filteredDataArray.length; dataIndex++) {
                if (page.dataStartIndex <= dataIndex && dataIndex <= page.dataFinishIndex) {
                    pagedDataArray.push(filteredDataArray[dataIndex]);
                }
            }

            firstPageButton.disabled = false;
            previousPageButton.disabled = false;
            nextPageButton.disabled = false;
            lastPageButton.disabled = false;

            page.totalCount = getTotalPageCount(filteredDataArray, page);
            if (page.currentCount === 1) {
                firstPageButton.disabled = true;
                previousPageButton.disabled = true;
            }
            if (page.currentCount === page.totalCount) {
                nextPageButton.disabled = true;
                lastPageButton.disabled = true;
            }
            if (page.totalCount === 1) {
                firstPageButton.disabled = true;
                previousPageButton.disabled = true;
                nextPageButton.disabled = true;
                lastPageButton.disabled = true;
            }

            renderTable(pagedDataArray);
            layoutCell4.innerText = "目前頁數： " + page.currentCount.toString() + "   總頁數： " + page.totalCount.toString() + "   每頁筆數： " + page.pagingCount.toString() + "   資料總筆數： " + filteredDataArray.length.toString();


            function renderTable(dataArray) {
                var dataTableId = "ffCustomSearchDataList";
                var oddLineColor = "#F3EDDE";
                var evenLineColor = "#E3E7F3";

                var oldDataTable = document.getElementById(dataTableId);
                if (oldDataTable) {
                    oldDataTable.parentNode.removeChild(oldDataTable);
                }

                var dataTable = document.createElement("TABLE");
                dataTable.id = dataTableId;
                dataTable.style.tableLayout = "fixed";
                dataTable.style.minWidth = "400PX";
                dataTable.style.cursor = "pointer";

                var dataRow = document.createElement("TR");
                dataRow.style.backgroundColor = "#00a6ba";
                dataRow.style.color = "#FFFFFF";
                dataRow.style.fontSize = "11px";
                dataRow.style.textAlign = "left";

                for (var index = 0; index < Object.keys(columnNames).length; index++) {
                    var dataCell = document.createElement("TH");
                    dataCell.innerText = columnNames[Object.keys(columnNames)[index]];

                    dataRow.appendChild(dataCell);
                }
                dataTable.appendChild(dataRow);

                for (var dataIndex = 0; dataIndex < dataArray.length; dataIndex++) {
                    var dataObject = dataArray[dataIndex];
                    var dataRow = document.createElement("TR");

                    dataRow.setAttribute("class", "dataRow");
                    dataRow.style.backgroundColor = (dataIndex % 2 === 0) ? oddLineColor : evenLineColor;
                    dataRow.setAttribute("original-background-color", dataRow.style.backgroundColor);
                    dataRow.onclick = function () {
                        var recordIndex = this.rowIndex - 1;
                        var record = dataArray[recordIndex];

                        mappingKeys = Object.keys(returnIdMappings);

                        for (var mappingIndex = 0; mappingIndex < mappingKeys.length; mappingIndex++) {
                            var mappingKey = mappingKeys[mappingIndex];
                            var mappingValue = (record[mappingKey] === 0) ? record[mappingKey] : record[mappingKey] || "";
                            var mappingControlId = returnIdMappings[mappingKey];
                            var mappingControl = document.getElementById(mappingControlId);
                            var mappingControls = document.getElementsByName(mappingControlId);

                            if (mappingControl.tagName.in(["INPUT", "SELECT"])) {
                                mappingControl.value = mappingValue;
                            }
                            else {
                                //RadioButton
                                if (mappingControls[0].type === "radio") {
                                    Array.apply(null, mappingControls).forEach(function (button) {
                                        if (button.value === mappingValue) button.checked = true;
                                    });
                                }
                                else {
                                    mappingControl.innerText = mappingValue;
                                }
                            }
                        }

                        closeButton.onclick();

                        if (typeof clickFunc === "function") {
                            try {
                                clickFunc(record, recordIndex, dataArray);
                            }
                            catch (ex) {
                                showException(ex);
                            }
                        }
                    }
                    dataRow.onmouseover = function () {
                        this.orginalColor = this.style.backgroundColor;
                        this.style.backgroundColor = "#FFCBA4";
                    }
                    dataRow.onmouseout = function () {
                        this.style.backgroundColor = this.orginalColor;
                    }

                    for (var keyIndex = 0; keyIndex < Object.keys(columnNames).length; keyIndex++) {
                        var key = Object.keys(columnNames)[keyIndex];
                        var value = dataObject[key];

                        var dataCell = document.createElement("TD");
                        dataCell.innerText = (value === 0) ? value : value || "";

                        dataRow.appendChild(dataCell);
                    }
                    dataTable.appendChild(dataRow);
                }

                layoutCell3.appendChild(dataTable);
                if (button.searchWindow) button.searchWindow.tableRows = dataTable.getElementsByClassName("dataRow");

                var sortableTable = jBPM(dataTable);
                var sortableHeaders = sortableTable.find("th");
                sortableHeaders.wrapInner('<span title="點擊欄名可排序"/>')
                    .each(function () {
                        var th = jBPM(this),
                            thIndex = th.index(),
                            inverse = false;

                        th.click(function () {
                            sortableTable.find("td").filter(function () {
                                return jBPM(this).index() === thIndex;
                            }).sortElements(function (a, b) {
                                return (jBPM.text([a]) > jBPM.text([b])) ?
                                    (inverse) ? -1 : 1
                                    : (inverse) ? 1 : -1;
                            }, function () {
                                return this.parentNode;
                            });

                            inverse = !inverse;
                        });
                    });
            }
        }
    }
    button.openPhraseWindow = function (textBox) {
        var windowWidth = 500;
        var windowHeight = 300;
        var windowLeft = (screen.width / 2) - (windowWidth / 2);
        var windowTop = (screen.height / 2) - (windowHeight / 2);
        window.open("/NaNaWeb/GP/WMS/ManagePhrase/QuotePhrase?hdnMethod=quotePhrase&hdnHtmlElementId=" + textBox.id, "片語視窗", "width=" + windowWidth.toString() + ",height=" + windowHeight.toString() + ",left=" + windowLeft.toString() + ",top=" + windowTop.toString() + ",resizable=yes,scrollbars=yes");
    }

    if (button.style.backgroundColor === "white") button.style.backgroundColor = color.none;
    //依狀態更新顯示外觀
    button.enabled = button.enabled;

    return button;
}

/**
* 文字框自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} textBox 與文字框代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function TextBox(textBox) {
    if (!textBox) throw new Error("TextBox控制項不存在," + text.contactAdministrator);
    if (textBox.controlType) return textBox; //避免重覆宣告

    textBox.controlType = "TextBox";
    textBox.explicitControl = document.getElementById("explicit_" + textBox.id) ? TextBox(document.getElementById("explicit_" + textBox.id)) : undefined;
    textBox.titleControl = document.getElementById("lbl_" + textBox.id) ? Label(document.getElementById("lbl_" + textBox.id)) : undefined;
    textBox.previousBackgroundColor = color.none;
    textBox.formatChecker = undefined;
    textBox.range = range.unlimited;
    textBox.decimalPlaces = (textBox.getAttribute("decimalplaces")) ? parseInt(textBox.getAttribute("decimalplaces")) : Number.MAX_VALUE;
    textBox.txtDatatype = textBox.getAttribute("txtdatatype");
    textBox.currentMousePosition = -1;
    textBox.decimalPointPosition = -1;
    textBox.noticeMessage = "";
    textBox.tabIndex = -1;
    textBox.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(textBox, "title", {
        get: function () {
            if (textBox.titleControl) {
                return textBox.titleControl.innerText;
            }
            else if (textBox.getAttribute("title")) {
                return textBox.getAttribute("title");
            }
            else {
                return textBox.id;
            }
        },
        set: function (text) {
            if (textBox.titleControl) {
                textBox.titleControl.innerText = text;
            }
            else if (textBox.getAttribute("title")) {
                textBox.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(textBox, "maxlength", {
        get: function () { return (textBox.getAttribute("maxlength")) ? parseInt(textBox.getAttribute("maxlength"), 10) : 0; },
        set: function (length) { textBox.setAttribute("maxlength", length); }
    });
    Object.defineProperty(textBox, "enableIME", {
        get: function () { return (textBox.style.imeMode !== "disabled") ? true : false },
        set: function (value) { textBox.style.imeMode = (value) ? "auto" : "disabled"; }
    });
    Object.defineProperty(textBox, "backgroundColor", {
        get: function () { return textBox.style.backgroundColor; },
        set: function (color) {
            textBox.style.backgroundColor = color;
            textBox.previousBackgroundColor = color;

            if (textBox.explicitControl) textBox.explicitControl.style.backgroundColor = color;
        }
    });
    Object.defineProperty(textBox, "noDataMessage", {
        get: function () {
            if (!textBox.value) {
                return "[" + textBox.title + "]" + "必填";
            }

            switch (textBox.range) {
                case range.isGreaterEqualZero:
                    if (!(parseFloat(textBox.value) >= 0)) {
                        return "[" + textBox.title + "]" + "必須大於或等於0";
                    }
                    break;

                case range.isGreaterZero:
                    if (!(parseFloat(textBox.value) > 0)) {
                        return "[" + textBox.title + "]" + "必須大於0";
                    }
                    break;

                case range.isLessEqualZero:
                    if (!(parseFloat(textBox.value) <= 0)) {
                        return "[" + textBox.title + "]" + "必須小於或等於0";
                    }
                    break;

                case range.isLessZero:
                    if (!(parseFloat(textBox.value) < 0)) {
                        return "[" + textBox.title + "]" + "必須小於0";
                    }
                    break;

                default:
                    break;
            }

            if (textBox.formatChecker) {
                if (textBox.formatChecker.test(textBox.value) === false) {
                    return "[" + textBox.title + "]" + "格式不符" + textBox.noticeMessage;
                }
            }

            return "";
        }
    });
    Object.defineProperty(textBox, "enabled", {
        get: function () { return !textBox.readOnly; },
        set: function (value) {
            textBox.readOnly = !value;
            textBox.style.backgroundColor = (value) ? textBox.previousBackgroundColor : color.disabled;

            if (textBox.explicitControl) textBox.explicitControl.style.backgroundColor = (value) ? textBox.previousBackgroundColor : color.disabled;
        }
    });
    Object.defineProperty(textBox, "visible", {
        get: function () { return (textBox.style.display !== "none") ? true : false; },
        set: function (value) {
            textBox.style.display = (value) ? "inline-block" : "none";

            if (textBox.titleControl) textBox.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(textBox, "toolTip", {
        get: function () { return (textBox.getAttribute("title")) ? textBox.getAttribute("title") : ""; },
        set: function (text) {
            textBox.setAttribute("title", text);

            if (textBox.titleControl) textBox.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(textBox, "top", {
        get: function () { return parseInt(textBox.style.top, 10); },
        set: function (value) {
            textBox.style.top = value;

            if (textBox.titleControl) textBox.titleControl.top = (textBox.top + textBox.titleGapTop);
        }
    });
    Object.defineProperty(textBox, "left", {
        get: function () { return parseInt(textBox.style.left, 10); },
        set: function (value) {
            textBox.style.left = value;

            if (textBox.titleControl) textBox.titleControl.left = (textBox.left + textBox.titleGapLeft);
        }
    });
    Object.defineProperty(textBox, "width", {
        get: function () { return parseInt(textBox.style.width, 10); },
    });
    Object.defineProperty(textBox, "height", {
        get: function () { return parseInt(textBox.style.height, 10); },
    });
    textBox.titleGapTop = (textBox.titleControl) ? textBox.titleControl.top - textBox.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    textBox.titleGapLeft = (textBox.titleControl) ? textBox.titleControl.left - textBox.left : 0;

    textBox.setUpperCase = function () {
        textBox.style.textTransform = "uppercase";
        textBox.addEventListener("blur", function () { textBox.value = textBox.value.toUpperCase(); }, false);
    }
    textBox.setLowerCase = function () {
        textBox.style.textTransform = "lowercase";
        textBox.addEventListener("blur", function () { textBox.value = textBox.value.toLowerCase(); }, false);
    }
    textBox.setFormatChecker = function (pattern, flag, noticeMessage) {
        textBox.formatChecker = new RegExp(pattern, flag);
        textBox.noticeMessage = noticeMessage;
    }
    textBox.clear = function () {
        textBox.value = "";
    }
    textBox.previousValue = textBox.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    textBox.style.border = "#ccc 1px solid";

    if (textBox.txtDatatype) {
        if (textBox.txtDatatype.in(["1", "2"])) {
            textBox.addEventListener('click', function () {
                if (textBox.enabled) {
                    textBox.currentMousePosition = textBox.selectionStart;
                    textBox.decimalPointPosition = textBox.value.indexOf(".");
                    textBox.previousValue = textBox.value;
                }
            }, false);
            textBox.addEventListener('keydown', function (event) {
                if (textBox.enabled) {
                    //#region 上下鍵加減數值
                    if (event.key.in(["ArrowDown", "Down", "ArrowUp", "Up", "PageDown", "PageUp"])) {
                        event.preventDefault();

                        var total = 0;
                        var step = 1;
                        var fix = 0;

                        if (textBox.value) {
                            total = parseFloat(textBox.value);

                            if (isNaN(total)) {
                                total = 0;
                            }

                            var numbers = textBox.value.split(".");

                            if (numbers.length === 2) {
                                var temp = "0.";

                                fix = numbers[1].length;
                                totalZeroes = numbers[1].length - 1;

                                for (var currentZero = 0; currentZero < totalZeroes; currentZero++) {
                                    temp += "0";
                                }

                                temp += "1";

                                step = parseFloat(temp);
                            }
                        }

                        var result = 0;

                        switch (event.key) {
                            case "ArrowDown":
                            case "Down":
                                result = (total - step).toFixed(fix);
                                break;

                            case "PageDown":
                                result = (total - (step * 10)).toFixed(fix);
                                break;

                            case "ArrowUp":
                            case "Up":
                                result = (total + step).toFixed(fix);
                                break;

                            case "PageUp":
                                result = (total + (step * 10)).toFixed(fix);
                                break;
                        }

                        textBox.value = result;
                        textBox.setSelectionRange(textBox.currentMousePosition, textBox.currentMousePosition);
                    }
                    //#endregion

                    if (event.key.in(["-", "Subtract", ".", "Decimal", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "ArrowRight", "Right", "ArrowLeft", "Left", "Del", "Delete", "Backspace", "Home", "End", "Insert", "NumLock"])) {
                        //負號只能在開頭
                        if (event.key.in(["-", "Subtract"]) && textBox.currentMousePosition !== 0) {
                            event.preventDefault();
                        }

                        //小數點只能有1個
                        if (event.key.in([".", "Decimal"])) {
                            var decimalSeperatorCount = (textBox.value.match(/\./g) || []).length;

                            if (decimalSeperatorCount > 0) {
                                event.preventDefault();
                            }
                        }

                        if (event.key.in(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])) {
                            //限定小數位數
                            if (textBox.currentMousePosition > textBox.decimalPointPosition) {
                                var scaleNumbers = textBox.value.substring(textBox.decimalPointPosition + 1);

                                if (scaleNumbers.length === textBox.decimalPlaces) {
                                    event.preventDefault();
                                }
                            }
                        }
                    }
                    else {
                        event.preventDefault();
                    }
                }
            }, false);
            textBox.addEventListener('keyup', function () {
                if (textBox.enabled) {
                    textBox.currentMousePosition = textBox.selectionStart;
                    textBox.decimalPointPosition = textBox.value.indexOf(".");
                    textBox.previousValue = textBox.value;
                }
            }, false);
            textBox.addEventListener('blur', function () {
                if (textBox.enabled) {
                    var parsedValue = parseFloat(textBox.value);

                    if (parsedValue === -0) {
                        textBox.value = "0";
                    }
                    else if (isNaN(parsedValue)) {
                        textBox.value = "";
                    }
                    else {
                        textBox.value = parsedValue.toString();
                    }

                    textBox.currentMousePosition = textBox.selectionStart;
                    textBox.decimalPointPosition = textBox.value.indexOf(".");
                    textBox.previousValue = textBox.value;
                }
            }, false);
        }
    }

    if (textBox.explicitControl) {
        setInterval(function () {
            textBox.explicitControl.value = textBox.value;
        }, 100);
    }

    //依狀態更新顯示外觀
    textBox.enabled = textBox.enabled;

    //唯讀時取消點擊事件綁定
    if (textBox.enabled === false) {
        textBox.onclick = null;
    }

    return textBox;
}

/**
* 單選按鈕自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} radioButton 與單選按鈕代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function RadioButton(radioButton) {
    if (!radioButton) throw new Error("RadioButton控制項不存在," + text.contactAdministrator);
    if (radioButton.controlType) return radioButton; //避免重覆宣告

    radioButton.controlType = "RadioButton";
    radioButton.titleControl = document.getElementById("lbl_" + radioButton.id) ? Label(document.getElementById("lbl_" + radioButton.id)) : undefined;
    radioButton.buttonControls = document.getElementsByName(radioButton.id);
    radioButton.previousBackgroundColor = color.none;
    radioButton.tabIndex = -1;
    radioButton.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(radioButton, "value", {
        get: function () {
            var checkedButtons = Array.apply(null, radioButton.buttonControls).filter(function (button) {
                return button.checked === true;
            });

            return (checkedButtons.length) ? checkedButtons[0].value : "";
        },
        set: function (value) {
            Array.apply(null, radioButton.buttonControls).forEach(function (button) {
                if (button.value === value) button.checked = true;
            });
        }
    });
    Object.defineProperty(radioButton, "text", {
        get: function () {
            var checkedButtons = Array.apply(null, radioButton.buttonControls).filter(function (button) {
                return button.checked === true;
            });

            return (checkedButtons.length) ? checkedButtons[0].attributes["text"].value : "";
        },
        set: function (text) {
            Array.apply(null, radioButton.buttonControls).forEach(function (button) {
                if (button.attributes["text"].value === text) button.checked = true;
            });
        }
    });
    Object.defineProperty(radioButton, "title", {
        get: function () {
            if (radioButton.titleControl) {
                return radioButton.titleControl.innerText;
            }
            else if (radioButton.getAttribute("title")) {
                return radioButton.getAttribute("title");
            }
            else {
                return radioButton.id;
            }
        },
        set: function (text) {
            if (radioButton.titleControl) {
                radioButton.titleControl.innerText = text;
            }
            else if (radioButton.getAttribute("title")) {
                radioButton.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(radioButton, "backgroundColor", {
        get: function () { return radioButton.style.backgroundColor; },
        set: function (color) {
            radioButton.style.backgroundColor = color;
            radioButton.previousBackgroundColor = color;
        }
    });
    Object.defineProperty(radioButton, "noDataMessage", {
        get: function () { return (!radioButton.value) ? "[" + radioButton.title + "]" + "必選" : ""; }
    });
    Object.defineProperty(radioButton, "enabled", {
        get: function () {
            return !radioButton.buttonControls[0].disabled;
        },
        set: function (value) {
            Array.apply(null, radioButton.buttonControls).forEach(function (buttonControl) {
                buttonControl.disabled = !value;
            });
            radioButton.style.backgroundColor = (value) ? radioButton.previousBackgroundColor : color.none;
        }
    });
    Object.defineProperty(radioButton, "visible", {
        get: function () { return (radioButton.style.display !== "none") ? true : false; },
        set: function (value) {
            radioButton.style.display = (value) ? "inline-block" : "none";

            if (radioButton.titleControl) radioButton.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(radioButton, "toolTip", {
        get: function () { return (radioButton.getAttribute("title")) ? radioButton.getAttribute("title") : ""; },
        set: function (text) {
            radioButton.setAttribute("title", text);
            if (radioButton.titleControl) radioButton.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(radioButton, "top", {
        get: function () { return parseInt(radioButton.style.top, 10); },
        set: function (value) {
            radioButton.style.top = value;
            if (radioButton.titleControl) radioButton.titleControl.top = (radioButton.top + radioButton.titleGapTop);
        }
    });
    Object.defineProperty(radioButton, "left", {
        get: function () { return parseInt(radioButton.style.left, 10); },
        set: function (value) {
            radioButton.style.left = value;
            if (radioButton.titleControl) radioButton.titleControl.left = (radioButton.left + radioButton.titleGapLeft);
        }
    });
    Object.defineProperty(radioButton, "width", {
        get: function () { return parseInt(radioButton.style.width, 10); },
    });
    Object.defineProperty(radioButton, "height", {
        get: function () { return parseInt(radioButton.style.height, 10); },
    });
    radioButton.titleGapTop = (radioButton.titleControl) ? radioButton.titleControl.top - radioButton.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤)
    radioButton.titleGapLeft = (radioButton.titleControl) ? radioButton.titleControl.left - radioButton.left : 0;
    radioButton.previousValue = radioButton.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    radioButton.clear = function () {
        Array.apply(null, radioButton.buttonControls).forEach(function (button) {
            button.checked = false;
        });
    }
    radioButton.removeButton = function (text, value) {
        Array.apply(null, radioButton.buttonControls).forEach(function (button) {
            if (button.value === value || button.getAttribute("text") === text) {
                var tdNode = button.parentElement.parentElement;
                tdNode.parentNode.removeChild(tdNode);
            }
        });
    }
    radioButton.hideButton = function (text, value) {
        Array.apply(null, radioButton.buttonControls).forEach(function (button) {
            if (button.value === value || button.getAttribute("text") === text) {
                button.style.display = 'none';
            }
        });
    }

    //依狀態更新顯示外觀
    radioButton.enabled = radioButton.enabled;

    return radioButton;
}

/**
* 複選按鈕自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} checkBox 與複選按鈕代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function CheckBox(checkBox) {
    if (!checkBox) throw new Error("CheckBox控制項不存在," + text.contactAdministrator);
    if (checkBox.controlType) return checkBox; //避免重覆宣告

    checkBox.controlType = "CheckBox";
    checkBox.titleControl = document.getElementById("lbl_" + checkBox.id) ? Label(document.getElementById("lbl_" + checkBox.id)) : undefined;
    checkBox.buttonControls = document.getElementsByName(checkBox.id);
    checkBox.previousBackgroundColor = color.none;
    checkBox.tabIndex = -1;
    checkBox.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(checkBox, "title", {
        get: function () {
            if (checkBox.titleControl) {
                return checkBox.titleControl.innerText;
            }
            else if (checkBox.getAttribute("title")) {
                return checkBox.getAttribute("title");
            }
            else {
                return checkBox.id;
            }
        },
        set: function (text) {
            if (checkBox.titleControl) {
                checkBox.titleControl.innerText = text;
            }
            else if (checkBox.getAttribute("title")) {
                checkBox.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(checkBox, "value", {
        get: function () {
            var checkedButtons = Array.apply(null, checkBox.buttonControls).filter(function (button) {
                return button.checked === true;
            });

            return (checkedButtons.length) ? checkedButtons.map(function (option) { return option.value; }).join() : "";
        },
        set: function (value) {
            checkBox.clear();

            value.split(",").forEach(function (value) {
                Array.apply(null, checkBox.buttonControls).forEach(function (button) {
                    if (button.value === value) button.checked = true;
                });
            });
        }
    });
    Object.defineProperty(checkBox, "text", {
        get: function () {
            var checkedButtons = Array.apply(null, checkBox.buttonControls).filter(function (button) {
                return button.checked === true;
            });

            return (checkedButtons.length) ? checkedButtons.map(function (option) { return option.attributes["text"].value; }).join() : "";
        },
        set: function (text) {
            checkBox.clear();

            text.split(",").forEach(function (text) {
                Array.apply(null, checkBox.buttonControls).forEach(function (button) {
                    if (button.attributes["text"].value === text) button.checked = true;
                });
            });
        }
    });
    Object.defineProperty(checkBox, "backgroundColor", {
        get: function () { return checkBox.style.backgroundColor; },
        set: function (color) {
            checkBox.style.backgroundColor = color;
            checkBox.previousBackgroundColor = color;
        }
    });
    Object.defineProperty(checkBox, "noDataMessage", {
        get: function () { return (!checkBox.value) ? "[" + checkBox.title + "]" + "必選" : ""; }
    });
    Object.defineProperty(checkBox, "enabled", {
        get: function () {
            return !checkBox.buttonControls[0].disabled;
        },
        set: function (value) {
            Array.apply(null, checkBox.buttonControls).forEach(function (button) {
                button.disabled = !value;
            });
            checkBox.style.backgroundColor = (value) ? checkBox.previousBackgroundColor : color.none;
        }
    });
    Object.defineProperty(checkBox, "visible", {
        get: function () { return (checkBox.style.display !== "none") ? true : false; },
        set: function (value) {
            checkBox.style.display = (value) ? "inline-block" : "none";

            if (checkBox.titleControl) checkBox.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(checkBox, "toolTip", {
        get: function () { return (checkBox.getAttribute("title")) ? checkBox.getAttribute("title") : ""; },
        set: function (text) {
            checkBox.setAttribute("title", text);
            if (checkBox.titleControl) checkBox.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(checkBox, "top", {
        get: function () { return parseInt(checkBox.style.top, 10); },
        set: function (value) {
            checkBox.style.top = value;
            if (checkBox.titleControl) checkBox.titleControl.top = (checkBox.top + checkBox.titleGapTop);
        }
    });
    Object.defineProperty(checkBox, "left", {
        get: function () { return parseInt(checkBox.style.left, 10); },
        set: function (value) {
            checkBox.style.left = value;
            if (checkBox.titleControl) checkBox.titleControl.left = (checkBox.left + checkBox.titleGapLeft);
        }
    });
    Object.defineProperty(checkBox, "width", {
        get: function () { return parseInt(checkBox.style.width, 10); },
    });
    Object.defineProperty(checkBox, "height", {
        get: function () { return parseInt(checkBox.style.height, 10); },
    });
    checkBox.titleGapTop = (checkBox.titleControl) ? checkBox.titleControl.top - checkBox.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    checkBox.titleGapLeft = (checkBox.titleControl) ? checkBox.titleControl.left - checkBox.left : 0;
    checkBox.previousValue = checkBox.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    checkBox.clear = function () {
        Array.apply(null, checkBox.buttonControls).forEach(function (button) {
            button.checked = false;
        });
    }

    //依狀態更新顯示外觀
    checkBox.enabled = checkBox.enabled;

    return checkBox;
}

/**
* 超連結自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} link 與超連結代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Link(link) {
    if (!link) throw new Error("Link控制項不存在," + text.contactAdministrator);
    if (link.controlType) return link; //避免重覆宣告

    link.controlType = "Link";
    link.titleControl = document.getElementById("lbl_" + link.id) ? Label(document.getElementById("lbl_" + link.id)) : undefined;
    link.target = "_blank";
    link.style.color = "blue";
    link.style.textDecoration = "underline";
    link.removeAttribute("href");
    Object.defineProperty(link, "text", {
        get: function () { return link.innerText; },
        set: function (text) { link.innerText = text; }
    });
    Object.defineProperty(link, "title", {
        get: function () {
            if (link.titleControl) {
                return link.titleControl.innerText;
            }
            else if (link.getAttribute("title")) {
                return link.getAttribute("title");
            }
            else {
                return link.id;
            }
        },
        set: function (text) {
            if (link.titleControl) {
                link.titleControl.innerText = text;
            }
            else if (link.getAttribute("title")) {
                link.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(link, "visible", {
        get: function () { return (link.style.display !== "none") ? true : false; },
        set: function (value) {
            link.style.display = (value) ? "inline-block" : "none";

            if (link.titleControl) link.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(link, "toolTip", {
        get: function () { return (link.getAttribute("title")) ? link.getAttribute("title") : ""; },
        set: function (text) {
            link.setAttribute("title", text);
            if (link.titleControl) link.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(link, "top", {
        get: function () { return parseInt(link.style.top, 10); },
        set: function (value) {
            link.style.top = value;
            if (link.titleControl) link.titleControl.top = (link.top + link.titleGapTop);
        }
    });
    Object.defineProperty(link, "left", {
        get: function () { return parseInt(link.style.left, 10); },
        set: function (value) {
            link.style.left = value;
            if (link.titleControl) link.titleControl.left = (link.left + link.titleGapLeft);
        }
    });
    Object.defineProperty(link, "width", {
        get: function () { return parseInt(link.style.width, 10); },
    });
    Object.defineProperty(link, "height", {
        get: function () { return parseInt(link.style.height, 10); },
    });
    link.titleGapTop = (link.titleControl) ? link.titleControl.top - link.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    link.titleGapLeft = (link.titleControl) ? link.titleControl.left - link.left : 0;

    //事件綁定
    if (typeof window[link.id + "_onclick"] === "function") link.onclick = window[link.id + "_onclick"];

    return link;
}

/**
* 標籤自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} label 與標籤代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Label(label) {
    if (!label) throw new Error("Label控制項不存在," + text.contactAdministrator);
    if (label.controlType) return label; //避免重覆宣告

    label.controlType = "Label";
    Object.defineProperty(label, 'text', {
        get: function () { return label.innerText; },
        set: function (text) { label.innerText = text; }
    });
    Object.defineProperty(label, "visible", {
        get: function () { return (label.style.display !== "none") ? true : false; },
        set: function (value) { label.style.display = (value) ? "inline-block" : "none"; }
    });
    Object.defineProperty(label, "toolTip", {
        get: function () { return (label.getAttribute("title")) ? label.getAttribute("title") : ""; },
        set: function (text) { label.setAttribute("title", text); }
    });
    Object.defineProperty(label, "top", {
        get: function () { return parseInt(label.style.top, 10); },
        set: function (value) { label.style.top = value; }
    });
    Object.defineProperty(label, "left", {
        get: function () { return parseInt(label.style.left, 10); },
        set: function (value) { label.style.left = value; }
    });
    Object.defineProperty(label, "width", {
        get: function () { return parseInt(label.style.width, 10); },
    });
    Object.defineProperty(label, "height", {
        get: function () { return parseInt(label.style.height, 10); },
    });

    return label;
}

/**
* 開窗自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} dialogInput 與開窗代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function DialogInput(dialogInput) {
    if (!dialogInput) throw new Error("Dialog控制項不存在," + text.contactAdministrator);
    if (dialogInput.controlType) return dialogInput; //避免重覆宣告

    dialogInput.controlType = "DialogInput";
    dialogInput.valueControl = TextBox(document.getElementById(dialogInput.id + "_txt"));
    dialogInput.buttonControl = Button(document.getElementById(dialogInput.id + "_btn"));
    dialogInput.labelControl = document.getElementById(dialogInput.id + "_lbl") ? TextBox(document.getElementById(dialogInput.id + "_lbl")) : undefined;
    dialogInput.titleControl = document.getElementById("lbl_" + dialogInput.id) ? Label(document.getElementById("lbl_" + dialogInput.id)) : undefined;
    dialogInput.hiddenControl = document.getElementById(dialogInput.id + "_hdn") ? HiddenTextBox(document.getElementById(dialogInput.id + "_hdn")) : undefined;
    dialogInput.listHiddenControl = document.getElementById(dialogInput.id + "_list_hdn") ? HiddenTextBox(document.getElementById(dialogInput.id + "_list_hdn")) : undefined;
    dialogInput.previousBackgroundColor = color.none;
    dialogInput.tabIndex = -1;
    dialogInput.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(dialogInput, "value", {
        get: function () { return dialogInput.valueControl.value; },
        set: function (value) { dialogInput.valueControl.value = value; }
    });
    Object.defineProperty(dialogInput, "label", {
        get: function () { return (dialogInput.labelControl) ? dialogInput.labelControl.value : ""; },
        set: function (value) { if (dialogInput.labelControl) dialogInput.labelControl.value = value; }
    });
    Object.defineProperty(dialogInput, "title", {
        get: function () {
            if (dialogInput.titleControl) {
                return dialogInput.titleControl.innerText;
            }
            else if (dialogInput.getAttribute("title")) {
                return dialogInput.getAttribute("title");
            }
            else {
                return dialogInput.id;
            }
        },
        set: function (text) {
            if (dialogInput.titleControl) {
                dialogInput.titleControl.innerText = text;
            }
            else if (dialogInput.getAttribute("title")) {
                dialogInput.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(dialogInput, "backgroundColor", {
        get: function () { return dialogInput.valueControl.style.backgroundColor; },
        set: function (color) {
            dialogInput.valueControl.style.backgroundColor = color;
            if (dialogInput.labelControl) dialogInput.labelControl.style.backgroundColor = color;
            dialogInput.previousBackgroundColor = color;
        }
    });
    Object.defineProperty(dialogInput, "noDataMessage", {
        get: function () { return (!dialogInput.value) ? "[" + dialogInput.title + "]" + "必選" : ""; }
    });
    Object.defineProperty(dialogInput, "enabled", {
        get: function () { return !dialogInput.buttonControl.disabled; },
        set: function (value) {
            dialogInput.buttonControl.disabled = !value;
            dialogInput.buttonControl.style.display = (value) ? "inline-block" : "none";
            dialogInput.valueControl.disabled = !value;
            dialogInput.valueControl.style.backgroundColor = (value) ? dialogInput.previousBackgroundColor : color.disabled;
            if (dialogInput.labelControl) {
                dialogInput.labelControl.disabled = !value;
                dialogInput.labelControl.style.backgroundColor = (value) ? dialogInput.previousBackgroundColor : color.disabled;
            }
        }
    });
    Object.defineProperty(dialogInput, "visible", {
        get: function () { return (dialogInput.style.display !== "none") ? true : false; },
        set: function (value) {
            dialogInput.style.display = (value) ? "inline-block" : "none";

            if (dialogInput.titleControl) dialogInput.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(dialogInput, "toolTip", {
        get: function () { return (dialogInput.getAttribute("title")) ? dialogInput.getAttribute("title") : ""; },
        set: function (text) {
            dialogInput.setAttribute("title", text);

            if (dialogInput.titleControl) dialogInput.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(dialogInput, "top", {
        get: function () { return parseInt(dialogInput.style.top, 10); },
        set: function (value) {
            dialogInput.style.top = value;
            if (dialogInput.titleControl) dialogInput.titleControl.top = (dialogInput.top + dialogInput.titleGapTop);
        }
    });
    Object.defineProperty(dialogInput, "left", {
        get: function () { return parseInt(dialogInput.style.left, 10); },
        set: function (value) {
            dialogInput.style.left = value;

            if (dialogInput.titleControl) dialogInput.titleControl.left = (dialogInput.left + dialogInput.titleGapLeft);
        }
    });
    Object.defineProperty(dialogInput, "width", {
        get: function () { return parseInt(dialogInput.style.width, 10); },
    });
    Object.defineProperty(dialogInput, "height", {
        get: function () { return parseInt(dialogInput.style.height, 10); },
    });
    Object.defineProperty(dialogInput, "writable", {
        get: function () { return (!dialogInput.valueControl.hasAttribute("readonly")); },
        set: function (value) { if (value) { dialogInput.valueControl.removeAttribute("readonly"); } else { dialogInput.valueControl.setAttribute("readonly", true); } }
    });
    dialogInput.titleGapTop = (dialogInput.titleControl) ? dialogInput.titleControl.top - dialogInput.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    dialogInput.titleGapLeft = (dialogInput.titleControl) ? dialogInput.titleControl.left - dialogInput.left : 0;
    dialogInput.previousValue = dialogInput.value; //用於onchange事件+對話框confirm(),當使用者取消時可由此屬性取回之前的值

    dialogInput.clear = function () {
        dialogInput.value = "";

        if (dialogInput.labelControl) dialogInput.labelControl.value = "";
    }
    dialogInput.onClick = function (func) {
        if (typeof func === "function") {
            dialogInput.buttonControl.onclick = null;
            jBPM(dialogInput.buttonControl).click(function () {
                try {
                    func();
                }
                catch (ex) {
                    showException(ex);
                }
            });
        }
    }
    dialogInput.changeDataChooser = function (dataType, filterCondition, filterText) {
        if (!(dataType === "User" || dataType === "Department" || dataType === "Project" || dataType === "Group")) {
            throw new Error("dataType必須是(User/Department/Project/Group)其中之一");
        }
        if (filterCondition) {
            if (!(filterCondition === "orgUnitId" || filterCondition === "orgUnitName" || filterCondition === "orgUnitId" || filterCondition === "userName" || filterCondition === "mailAddress" || filterCondition === "groupId" || filterCondition === "groupName" || filterCondition === "null")) {
                throw new Error("filterCondition必須是(orgUnitId/orgUnitName/userId/userName/mailAddress/groupId/groupName/null)其中之一");
            }
            if (filterCondition !== "null" && !filterText) {
                throw new Error("filterText必須有值");
            }
        }

        var onclickFunctionName = dialogInput.buttonControl.onclick.toString().replace(/\r|\n/g, "").between("{", "}").replace("(", "").replace(")", "");
        if (!window[onclickFunctionName]) throw new Error("此按鈕呼叫非BPM系統組織查詢開窗功能");
        var chooseFunctionName = window[onclickFunctionName].toString().replace(/\r|\n/g, "").between("{", "}").replace("(", "").replace(")", "").replace(";", "").trim();
        if (!chooseFunctionName.includes("choose")) throw new Error("此按鈕呼叫非BPM系統組織查詢開窗功能");
        var dataChooserFunction = window[chooseFunctionName].toString().replace(/\r|\n/g, "").between("{", "}").trim();
        var functionText = dataChooserFunction.substring(0, dataChooserFunction.indexOf("("));
        var paramsText = dataChooserFunction.between("(", ")");
        var oldParamsArray = paramsText.split(",");
        var newParamsArray = new Array();
        //複製開窗舊參數到新參數,參數有改變則取代
        for (var index = 0; index < oldParamsArray.length; index++) {
            if (index === 0) {
                newParamsArray.push("\"" + dataType + "\"");
            }
            else if (index === 2) {
                if (filterCondition) {
                    if (filterCondition !== "null") {
                        newParamsArray.push("\"" + filterCondition + "%" + filterText + "\"");
                    }
                    else {
                        newParamsArray.push("\"" + filterCondition + "\"");
                    }
                }
                else {
                    newParamsArray.push(oldParamsArray[index]);
                }
            }
            else {
                newParamsArray.push(oldParamsArray[index]);
            }
        }
        var newParamsText = newParamsArray.join(",");

        var newDataChooserFunction = functionText + "(" + newParamsText + ");";
        window[chooseFunctionName] = new Function(newDataChooserFunction);
    }

    dialogInput.valueControl.style.border = "#ccc 1px solid";
    if (dialogInput.labelControl) dialogInput.labelControl.style.border = "#ccc 1px solid";

    //右邊的中文名稱欄位向右位移2PX以避免與按鈕重疊(限非Chrome瀏覽器)
    if (dialogInput.labelControl && !isChrome) dialogInput.labelControl.style.left = (parseInt(dialogInput.labelControl.style.left, 10) + 2);

    //依狀態更新顯示外觀
    dialogInput.enabled = dialogInput.enabled;

    //點擊事件綁定
    if (typeof window[dialogInput.id + "_onclick"] === "function") {
        dialogInput.buttonControl.onclick = window[dialogInput.id + "_onclick"];
    }

    return dialogInput;
}

/**
* 表單序號自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} serialNumberTextBox 與表單序號代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function SerialNumberTextBox(serialNumberTextBox) {
    if (!serialNumberTextBox) throw new Error("SerialNumber控制項不存在," + text.contactAdministrator);
    if (serialNumberTextBox.controlType) return serialNumberTextBox; //避免重覆宣告

    serialNumberTextBox.controlType = "SerialNumberTextBox";
    serialNumberTextBox.titleControl = document.getElementById("lbl_" + serialNumberTextBox.id) ? Label(document.getElementById("lbl_" + serialNumberTextBox.id)) : undefined;
    Object.defineProperty(serialNumberTextBox, 'text', {
        get: function () { return serialNumberTextBox.innerText; }
    });
    Object.defineProperty(serialNumberTextBox, 'value', {
        get: function () { return serialNumberTextBox.innerText; }
    });
    Object.defineProperty(serialNumberTextBox, "title", {
        get: function () {
            if (serialNumberTextBox.titleControl) {
                return serialNumberTextBox.titleControl.innerText;
            }
            else if (serialNumberTextBox.getAttribute("title")) {
                return serialNumberTextBox.getAttribute("title");
            }
            else {
                return serialNumberTextBox.id;
            }
        },
        set: function (text) {
            if (serialNumberTextBox.titleControl) {
                serialNumberTextBox.titleControl.innerText = text;
            }
            else if (serialNumberTextBox.getAttribute("title")) {
                serialNumberTextBox.setAttribute("title", text);
            }
        }
    });
    Object.defineProperty(serialNumberTextBox, "visible", {
        get: function () { return (serialNumberTextBox.style.display !== "none") ? true : false; },
        set: function (value) {
            serialNumberTextBox.style.display = (value) ? "inline-block" : "none";

            if (serialNumberTextBox.titleControl) serialNumberTextBox.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(serialNumberTextBox, "toolTip", {
        get: function () { return (serialNumberTextBox.getAttribute("title")) ? serialNumberTextBox.getAttribute("title") : ""; },
        set: function (text) {
            serialNumberTextBox.setAttribute("title", text);

            if (serialNumberTextBox.titleControl) serialNumberTextBox.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(serialNumberTextBox, "top", {
        get: function () { return parseInt(serialNumberTextBox.style.top, 10); },
        set: function (value) {
            serialNumberTextBox.style.top = value;

            if (serialNumberTextBox.titleControl) serialNumberTextBox.titleControl.top = (serialNumberTextBox.top + serialNumberTextBox.titleGapTop);
        }
    });
    Object.defineProperty(serialNumberTextBox, "left", {
        get: function () { return parseInt(serialNumberTextBox.style.left, 10); },
        set: function (value) {
            serialNumberTextBox.style.left = value;

            if (serialNumberTextBox.titleControl) serialNumberTextBox.titleControl.left = (serialNumberTextBox.left + serialNumberTextBox.titleGapLeft);
        }
    });
    Object.defineProperty(serialNumberTextBox, "width", {
        get: function () { return parseInt(serialNumberTextBox.style.width, 10); },
    });
    Object.defineProperty(serialNumberTextBox, "height", {
        get: function () { return parseInt(serialNumberTextBox.style.height, 10); },
    });
    serialNumberTextBox.titleGapTop = (serialNumberTextBox.titleControl) ? serialNumberTextBox.titleControl.top - serialNumberTextBox.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    serialNumberTextBox.titleGapLeft = (serialNumberTextBox.titleControl) ? serialNumberTextBox.titleControl.left - serialNumberTextBox.left : 0;

    serialNumberTextBox.style.border = "1px solid rgb(204, 204, 204)";
    serialNumberTextBox.style.backgroundColor = color.disabled;

    return serialNumberTextBox;
}

/**
* 隱藏欄位自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} hiddenTextBox 與隱藏欄位代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function HiddenTextBox(hiddenTextBox) {
    if (!hiddenTextBox) throw new Error("Hidden控制項不存在," + text.contactAdministrator);
    if (hiddenTextBox.controlType) return hiddenTextBox; //避免重覆宣告

    hiddenTextBox.controlType = "HiddenTextBox";
    hiddenTextBox.titleControl = document.getElementById("lbl_" + hiddenTextBox.id) ? Label(document.getElementById("lbl_" + hiddenTextBox.id)) : undefined;
    hiddenTextBox.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(hiddenTextBox, "title", {
        get: function () { return (hiddenTextBox.titleControl) ? hiddenTextBox.titleControl.innerText : hiddenTextBox.id; },
        set: function (text) { if (hiddenTextBox.titleControl) hiddenTextBox.titleControl.innerText = text; }
    });
    Object.defineProperty(hiddenTextBox, "noDataMessage", {
        get: function () { return (!hiddenTextBox.value) ? "[" + hiddenTextBox.title + "]" + "無值" : ""; }
    });
    hiddenTextBox.clear = function () {
        hiddenTextBox.value = "";
    }

    if (hiddenTextBox.titleControl) hiddenTextBox.titleControl.style.display = "none";

    return hiddenTextBox;
}

/**
* 圖片自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} image 與圖片代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Image(image) {
    if (!image) throw new Error("Image控制項不存在," + text.contactAdministrator);
    if (image.controlType) return image; //避免重覆宣告

    image.controlType = "Image";
    Object.defineProperty(image, "visible", {
        get: function () { return (image.style.display !== "none") ? true : false; },
        set: function (value) { image.style.display = (value) ? "inline-block" : "none"; }
    });
    Object.defineProperty(image, "toolTip", {
        get: function () { return (image.getAttribute("title")) ? image.getAttribute("title") : ""; },
        set: function (text) { image.setAttribute("title", text); }
    });
    Object.defineProperty(image, "top", {
        get: function () { return parseInt(image.style.top, 10); },
        set: function (value) { image.style.top = value; }
    });
    Object.defineProperty(image, "left", {
        get: function () { return parseInt(image.style.left, 10); },
        set: function (value) { image.style.left = value; }
    });
    Object.defineProperty(image, "width", {
        get: function () { return parseInt(image.style.width, 10); },
    });
    Object.defineProperty(image, "height", {
        get: function () { return parseInt(image.style.height, 10); },
    });

    return image;
}

/**
* 條碼自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} barcode 與條碼代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Barcode(barcode) {
    if (!barcode) throw new Error("Barcode控制項不存在," + text.contactAdministrator);
    if (barcode.controlType) return barcode; //避免重覆宣告

    barcode.controlType = "Barcode";
    barcode.url = "/NaNaWeb/Barbecue/barcode?data=";
    barcode.titleControl = document.getElementById("lbl_" + barcode.id) ? Label(document.getElementById("lbl_" + barcode.id)) : undefined;
    barcode.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(barcode, "value", {
        get: function () { return (barcode.src.includes(barcode.url)) ? barcode.src.split("=")[1] : ""; },
        set: function (value) { barcode.src = barcode.url + value; }
    });
    Object.defineProperty(barcode, "title", {
        get: function () { return (barcode.titleControl) ? barcode.titleControl.innerText : barcode.id; },
        set: function (text) { if (barcode.titleControl) barcode.titleControl.innerText = text; }
    });
    Object.defineProperty(barcode, "noDataMessage", {
        get: function () { return (!barcode.value) ? "[" + barcode.title + "]" + "無值" : ""; }
    });
    Object.defineProperty(barcode, "visible", {
        get: function () { return (barcode.style.display !== "none") ? true : false; },
        set: function (value) {
            barcode.style.display = (value) ? "inline-block" : "none";

            if (barcode.titleControl) barcode.titleControl.style.display = (value) ? "inline-block" : "none";
        }
    });
    Object.defineProperty(barcode, "toolTip", {
        get: function () { return (barcode.getAttribute("title")) ? barcode.getAttribute("title") : ""; },
        set: function (text) {
            barcode.setAttribute("title", text);

            if (barcode.titleControl) barcode.titleControl.setAttribute("title", text);
        }
    });
    Object.defineProperty(barcode, "top", {
        get: function () { return parseInt(barcode.style.top, 10); },
        set: function (value) {
            barcode.style.top = value;

            if (barcode.titleControl) barcode.titleControl.top = (barcode.top + barcode.titleGapTop);
        }
    });
    Object.defineProperty(barcode, "left", {
        get: function () { return parseInt(barcode.style.left, 10); },
        set: function (value) {
            barcode.style.left = value;

            if (barcode.titleControl) barcode.titleControl.left = (barcode.left + barcode.titleGapLeft);
        }
    });
    Object.defineProperty(barcode, "width", {
        get: function () { return parseInt(barcode.style.width, 10); },
    });
    Object.defineProperty(barcode, "height", {
        get: function () { return parseInt(barcode.style.height, 10); },
    });
    barcode.titleGapTop = (barcode.titleControl) ? barcode.titleControl.top - barcode.top : 0; //控制項與標籤的相差距離(用於移動控制項時同時移動標籤用)
    barcode.titleGapLeft = (barcode.titleControl) ? barcode.titleControl.left - barcode.left : 0;

    barcode.clear = function () {
        barcode.src = "";
    }

    return barcode;
}

/**
* 附件按鈕自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} attachmentButton 與附件按鈕代號相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function AttachmentButton(attachmentButton) {
    if (!attachmentButton) throw new Error("Attachment控制項不存在," + text.contactAdministrator);
    if (attachmentButton.controlType) return attachmentButton; //避免重覆宣告

    attachmentButton.controlType = "AttachmentButton";
    attachmentButton.previousBackgroundColor = color.none;
    attachmentButton.needCheck = true; //此控制項是否需要檢查是否有值
    Object.defineProperty(attachmentButton, "backgroundColor", {
        get: function () { return attachmentButton.style.backgroundColor; },
        set: function (color) {
            attachmentButton.style.backgroundColor = color;
            attachmentButton.previousBackgroundColor = color;
        }
    });
    Object.defineProperty(attachmentButton, "noDataMessage", {
        get: function () { return (!document.getElementById("Attachment_shell")) ? "[" + attachmentButton.value + "]" + "沒有附上" : ""; }
    });
    Object.defineProperty(attachmentButton, "enabled", {
        get: function () { return !attachmentButton.disabled; },
        set: function (value) {
            attachmentButton.disabled = !value;
            attachmentButton.style.color = (value) ? "black" : "gray";
            attachmentButton.style.backgroundColor = (value) ? attachmentButton.previousBackgroundColor : color.none;
        }
    });
    Object.defineProperty(attachmentButton, "visible", {
        get: function () { return (attachmentButton.style.display !== "none") ? true : false; },
        set: function (value) { attachmentButton.style.display = (value) ? "inline-block" : "none"; }
    });
    Object.defineProperty(attachmentButton, "toolTip", {
        get: function () { return (attachmentButton.getAttribute("title")) ? attachmentButton.getAttribute("title") : ""; },
        set: function (text) { attachmentButton.setAttribute("title", text); }
    });
    Object.defineProperty(attachmentButton, "top", {
        get: function () { return parseInt(attachmentButton.style.top, 10); },
        set: function (value) { attachmentButton.style.top = value; }
    });
    Object.defineProperty(attachmentButton, "left", {
        get: function () { return parseInt(attachmentButton.style.left, 10); },
        set: function (value) { attachmentButton.style.left = value; }
    });
    Object.defineProperty(attachmentButton, "width", {
        get: function () { return parseInt(attachmentButton.style.width, 10); },
    });
    Object.defineProperty(attachmentButton, "height", {
        get: function () { return parseInt(attachmentButton.style.height, 10); },
    });
    attachmentButton.getAttachmentInfos = function () {
        return getAttachmentInfos();
    }

    if (attachmentButton.style.backgroundColor === "white") attachmentButton.style.backgroundColor = color.none;
    //依狀態更新顯示外觀
    attachmentButton.enabled = attachmentButton.enabled;

    return attachmentButton;
}

/**
* 表單自訂控制項(新增便捷屬性/方法)
* @param {HTMLElement} form 與表單代號加_shell相同ID的HTML元素
* @returns {HTMLElement} 回傳結果
*/
function Form(form) {
    if (!form) throw new Error("Form控制項不存在," + text.contactAdministrator);
    if (form.controlType) return form; //避免重覆宣告

    form.controlType = "Form";
    Object.defineProperty(form, "width", {
        get: function () { return parseInt(form.getAttribute("width"), 10); },
        set: function (value) { form.setAttribute("width", value); }
    });
    Object.defineProperty(form, "height", {
        get: function () { return parseInt(form.getAttribute("height"), 10); },
        set: function (value) { form.setAttribute("height", value); }
    });

    return form;
}

/**
* 批次設定表單控制項背景顏色
* @param {string} color 顏色定義(Yellow/#FFFF99)
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setBackgroudColor(color, controlVariables) {
    controlVariables.forEach(function (controlVariable) {
        controlVariable.backgroundColor = color
    });
}

/**
* 批次設定表單控制項可用/不可用
* @param {boolean} isEnabled
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setEnabled(isEnabled, controlVariables) {
    controlVariables.forEach(function (controlVariable) {
        controlVariable.enabled = isEnabled
    });
}

/**
* 批次設定表單控制項可見/不可見
* @param {boolean} isVisible
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setVisible(isVisible, controlVariables) {
    controlVariables.forEach(function (controlVariable) {
        controlVariable.visible = isVisible
    });
}

/**
* 批次設定表單控制項為必填控制項(背景顏色高亮+啟用,僅在"處理"模式有效)
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setRequired(controlVariables) {
    if (isPerformMode()) {
        setEnabled(true, controlVariables);

        setBackgroudColor(color.required, controlVariables);
    }
}

/**
* 批次設定表單控制項為選填控制項(背景顏色一般+啟用,僅在"處理"模式有效)
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setOptional(controlVariables) {
    if (isPerformMode()) {
        setEnabled(true, controlVariables);

        setBackgroudColor(color.optional, controlVariables);
    }
}

/**
* 批次設定表單控制項為忽略控制項(背景顏色反灰+不啟用,僅在"處理"模式有效)
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setDisabled(controlVariables) {
    if (isPerformMode()) {
        setEnabled(false, controlVariables);

        setBackgroudColor(color.disabled, controlVariables);
    }
}

/**
* 清除表單控制項的值
* @param {Object[]} controlVariables 表單控制項陣列
*/
function clearForm(controlVariables) {
    controlVariables.forEach(function (controlVariable) {
        controlVariable.clear();
    });
}

/**
 * 當指定的控制項無值時顯示錯誤訊息並中止執行(控制項需要設定標籤才會自動顯示中文名稱)
 * @param {Object[]} controlVariables 設為必填的控制項陣列,如[dilApplicant, ddlType, Attachment, txtDescription]
 */
function checkNoDataError(controlVariables) {
    var noDataMessage = "";

    controlVariables.forEach(function (controlVariable) {
        if (controlVariable.noDataMessage && controlVariable.needCheck) noDataMessage += lineBreak + controlVariable.noDataMessage;
    });

    if (noDataMessage) throw new Error(noDataMessage);
}

/**
 * 當符合檢查錯誤條件時顯示錯誤訊息並中止執行
 * @param {boolean} condition 錯誤條件
 * @param {string} errorMessage 錯誤訊息
 */
function checkConditionError(condition, errorMessage) {
    if (condition === true) throw new Error(errorMessage);
}

/**
* 非同步執行工作(避免畫面凍結及瀏覽器逾時錯誤)
* @param {function} task 欲執行的function內容
*/
function runLongTimeTask(task) {
    var temp = document.createElement("DIV");
    temp.innerHTML = "<div id=\"loadingOverlay\" style=\"position: fixed;width: 100%;height: 100%;top: 0;left: 0;right: 0;bottom: 0;background-color: rgba(0,0,0,0.1);z-index: 2;display: table;\"><div style=\"text-align: center;display: table-cell;vertical-align: middle;\"></div></div>";
    var loadingOverlay = temp.firstChild;
    var loadingImage = document.createElement("IMG");
    loadingImage.style.width = "80px";
    loadingImage.style.height = "150px";
    loadingImage.src = "/NaNaWeb/theme/default/images/index_images/ajax-loader.gif";
    loadingOverlay.firstChild.appendChild(loadingImage);
    window.parent.parent.parent.document.body.appendChild(loadingOverlay);

    setTimeout(function () {
        try {
            task();
        }
        catch (ex) {
            showException(ex);
        }
        finally {
            var loadingOverlay = window.parent.parent.parent.document.getElementById("loadingOverlay");
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
    }, 0);
}

/**
 * 取得SessionId以下載檔案
 * @returns {string} 回傳結果
 */
function getSessionId() {
    var sessionItemName = "jsessionid=";
    var sessionItemLength = sessionItemName.length;
    var sessionIdLength = 32;
    var startPosition = downloadDocument.toString().indexOf(sessionItemName) + sessionItemLength;
    var FinishPosition = startPosition + sessionIdLength;

    return downloadDocument.toString().substring(startPosition, FinishPosition);
}

/**
 * 取得表單已上傳附件資訊
 * @returns {Object[]} 附件資訊
 */
function getAttachmentInfos() {
    var result = new Array();

    var sessionId = getSessionId();
    var attachmentTable = document.getElementById("Attachment_shell");

    if (attachmentTable) {
        for (var index = 1; index < attachmentTable.rows.length; index++) {
            var attachmentInfo = new Object();

            var currentRow = attachmentTable.rows[index];
            var currentFileNameCell = currentRow.cells[1];
            var fileDownloadLink = currentFileNameCell.childNodes.length === 3 ? currentFileNameCell.childNodes[1] : currentFileNameCell.childNodes[3];
            var fileName = fileDownloadLink.href.replace("javascript:downloadDocument(", "").replace(")", "");
            var fileNames = fileName.split(",");
            var physicalFileName = fileNames[0].replace(/'/g, "");
            var downloadPath = location.host + "/NaNaWeb/DownloadFile/" + physicalFileName + ";jsessionid=" + sessionId + "?action=downloadDocument&docFileName=" + physicalFileName;
            var logicalFileName = fileDownloadLink.textContent;
            var fileDescription = currentRow.cells[2].innerText;

            attachmentInfo.downloadPath = downloadPath;
            attachmentInfo.logicalFileName = logicalFileName;
            attachmentInfo.fileDescription = fileDescription;
            attachmentInfo.physicalFileName = physicalFileName;

            result.push(attachmentInfo);
        }
    }

    return result;
}

/**
 * 判斷使用者是否按下"發起表單"或"繼續派送"按鈕(需置於formSave函式內)
 * @returns {boolean} 回傳結果
 */
function isDispatch() {
    var functionName = "";

    if (formSave.caller.name === undefined) {
        functionName = formSave.caller.toString().substring(0, formSave.caller.toString().indexOf("(")).replace("function ", "");
    }
    else {
        functionName = formSave.caller.name;
    }

    if (functionName === "completeFormAndWorkStep") {
        return true;
    }
    else {
        return false;
    }
}

/**
* 判斷表單是否為"新"表單(未派送/未儲存表單/未儲存草稿)
* @returns {boolean} 回傳結果
*/
function isNewForm() {
    return (!serialNumber && document.getElementById('hdnMethod').value === 'handleForm' && document.getElementById('hdnFormInstOID').value === '') ? true : false;
}

/**
* 判斷表單是否為"處理"模式
* @returns {boolean} 回傳結果
*/
function isPerformMode() {
    return (window.parent.document.getElementById("btnInvokeProcess") || window.parent.document.getElementById("btnDispatchWorkItem")) ? true : false;
}

/**
* 直接派送流程(跳過formSave函式的檢查邏輯)
* 用於formSave的runLongTimeTask函式
*/
function invokeProcessDirectly() {
    formSave = function () { return true; };
    //[發起]按鈕
    if (window.parent.invokeProcessWithoutSave) {
        window.parent.invokeProcessWithoutSave();
    }
    //[繼續派送]按鈕
    else {
        window.parent.dispatchWorkItemWithoutSave();
    }
}

/**
* 批次移動表單控制項位置
* @param {string} positionType 要調整的位置屬性(top/left)
* @param {number} offset 移動值(正/負整數)
* @param {Object[]} controlVariables 表單控制項陣列
*/
function offsetControlPositions(positionType, offset, controlVariables) {
    if ((positionType === "top" || positionType === "left") === false) throw new Error("positionType只能是(top/left)其中之一");

    controlVariables.forEach(function (controlVariable) {
        controlVariable[positionType] += offset;
    });
}

/**
* 取得表單控制項值,簽核意見內容及附件資訊(可作為稽核用佐證)
* @returns {Object} 回傳結果
*/
function getFormValues() {
    var formValues = new Object();

    Object.keys(window).forEach(function (key) {
        if (typeof window[key] === "object" && window[key]) {
            if (window[key].hasOwnProperty("controlType")) {
                var control = window[key];

                switch (control.controlType) {
                    case "SerialNumberTextBox":
                        formValues[control.id] = control.text;
                        break;

                    case "TextBox":
                    case "DropdownList":
                    case "CheckBox":
                    case "RadioButton":
                    case "DialogInput":
                    case "HiddenTextBox":
                    case "Barcode":
                        formValues[control.id] = control.value;
                        break;

                    case "Grid":
                        formValues[control.id] = control.getJson();
                        break;

                    case "AttachmentButton":
                        formValues[control.id] = control.getAttachmentInfos();

                    default:
                        break;
                }
            }
        }
    });

    //簽核意見
    formValues["executiveComment"] = (window.parent.document.getElementById("txaExecutiveComment")) ? window.parent.document.getElementById("txaExecutiveComment").value : null;

    return formValues;
}

/**
 * 取得表單所有欄位的值並轉成KeyValue物件陣列格式
 * @param {string} keyName 欄位名稱(預設為"key")
 * @param {string} valueName 欄位值(預設為"value")
 * @param {string[]} ids 要取得值的欄位代號陣列
 * @returns {JSON[]} 回傳結果,如[{keyName: "col1", valueName: "test1"}, {keyName: "col2", valueName: "test2"}]
 */
function getKeyValueObjects(keyName, valueName, ids) {
    var keyValues = new Array();

    var formValues = getFormValues();
    if (!ids) ids = Object.keys(formValues);
    ids.forEach(function (id, index, array) {
        if (formValues.hasOwnProperty(id)) {
            var keyValue = new Object();
            keyValue[keyName] = id;
            keyValue[valueName] = formValues[id];

            keyValues.push(keyValue);
        }
        else {
            throw new Error("表單控制項未包含[" + id + "]");
        }
    });

    return keyValues;
}

/**
 * 設定流程變數
 * @param {string} processInstanceOID 流程實體OID
 * @param {JSON} processVariables 變數KeyValue物件,如{var1: "var1", var2: "var2"}
 */
function setProcessVariables(processInstanceOID, processVariables) {
    if (processInstanceOID) {
        var errorMessage = "";
        DWREngine.setAsync(false);
        for (var key in processVariables) {
            var value = processVariables[key];
            //空字串會造成異常,故不設定
            if (value !== "") {
                ajax_ProcessAccessor.assignRelevantData(processInstanceOID, key, value, function (result) {
                    if (result === false) errorMessage += lineBreak + "流程變數未設定成功(變數名稱:{0},變數值:{1})".format(key, value);
                });
            }
        }

        if (errorMessage) errorMessage + lineBreak + text.contactAdministrator;
        if (errorMessage) throw new Error(errorMessage);
    }
}

/**
* 回到發起流程頁面(用在如使用者部門設定不正確會造成後續流程異常時則阻止其不允許發起流程)
* @param {string} errorMessage 錯誤訊息
*/
function backToProcessListPage(errorMessage) {
    if (window.parent.parent.gotoNewURL) window.parent.parent.gotoNewURL("InvokeProcess");

    throw new Error(errorMessage);
}

/**
* 使用Enter/Tab鍵快速移到下一個輸入控制項(加上Shift鍵則是移到上一個)
* @param {Object[]} controlVariables 表單控制項陣列
*/
function setJumpSequence(controlVariables) {
    var currentTabIndex = 0;
    var firstTabIndex = 1;
    var lastTabIndex = currentTabIndex;

    function jumpNextControl(e) {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();

            var targetTabIndex = e.target.tabIndex;
            if (e.target.type === "radio") targetTabIndex = document.getElementById(e.target.name + "_0").tabIndex;
            if (e.target.controlType === "TextBox") {
                if (e.target.explicitControl) {
                    targetTabIndex = e.target.explicitControl.tabIndex;
                }
                else {
                    targetTabIndex = e.target.tabIndex;
                }
            }

            //按Enter或Tab(沒配合Shift)
            if (!e.shiftKey) {
                var nextTabIndex = targetTabIndex + 1;
                if (nextTabIndex > lastTabIndex) nextTabIndex = 1;
            }
            //按Enter或Tab加上Shift
            else if (e.shiftKey) {
                var nextTabIndex = targetTabIndex - 1;
                if (nextTabIndex < firstTabIndex) nextTabIndex = lastTabIndex;
            }

            var nextControl = document.querySelector("[tabindex = '" + nextTabIndex.toString() + "']");
            if (nextControl) {
                if (nextControl.type === "radio") {
                    var checkedButtons = Array.apply(null, document.getElementsByName(nextControl.name)).filter(function (item) {
                        return item.checked === true;
                    });

                    if (checkedButtons.length) {
                        checkedButtons[0].focus();
                    } else {
                        nextControl.focus();
                    }
                }
                else {
                    nextControl.focus();
                }
            }
        }
    }

    Object.keys(window).forEach(function (key) {
        if (typeof window[key] === "object" && window[key]) {
            if (window[key].hasOwnProperty("controlType") && window[key].tabIndex) {
                window[key].tabIndex = -1;
            }
        }
    });

    controlVariables.forEach(function (controlVariable) {
        if (controlVariable.hasAttribute("tabIndex")) {
            switch (controlVariable.controlType) {
                case "CheckBox":
                    Array.apply(null, document.getElementsByName(controlVariable.id)).forEach(function (item) {
                        currentTabIndex += 1;
                        item.tabIndex = currentTabIndex;
                        item.onkeypress = jumpNextControl;
                    });
                    break;

                case "RadioButton":
                    currentTabIndex += 1;
                    document.getElementById(controlVariable.id + "_0").tabIndex = currentTabIndex;
                    Array.apply(null, document.getElementsByName(controlVariable.id)).forEach(function (item) {
                        item.onkeypress = jumpNextControl;
                    });
                    break;

                case "DialogInput":
                    if (controlVariable.writable === true) {
                        currentTabIndex += 1;
                        controlVariable.valueControl.tabIndex = currentTabIndex;
                        controlVariable.valueControl.onkeypress = jumpNextControl;
                    }
                    break;

                case "TextBox":
                    currentTabIndex += 1;

                    if (controlVariable.explicitControl) {
                        controlVariable.explicitControl.tabIndex = currentTabIndex;
                    }
                    else {
                        controlVariable.tabIndex = currentTabIndex;
                    }

                    controlVariable.onkeypress = jumpNextControl;
                    break;

                default:
                    currentTabIndex += 1;
                    controlVariable.tabIndex = currentTabIndex;
                    controlVariable.onkeypress = jumpNextControl;
                    break;
            }
        }
        else {
            throw new Error("控制項(" + controlVariable.id + ")不支援快速跳轉功能");
        }
    });

    lastTabIndex = currentTabIndex;
}

//IE停用Dropdownlist/RadioButton/CheckBox時字體/選項會變灰導致較難辦識,以此設定覆蓋原有CSS
(function () {
    if (isIE11 && document.getElementsByTagName("ie11-custom-css").length === 0) {
        var ie11CustomCssTag = document.createElement("ie11-custom-css");

        var dropdownListTag = document.createElement("dropdownlist");
        var dropdownListStyleTag = document.createElement("style");
        dropdownListStyleTag.type = "text/css";
        dropdownListStyleTag.appendChild(document.createTextNode("select:disabled::-ms-value { color: #4D4D4D; background-color: transparent; }"));
        dropdownListTag.appendChild(dropdownListStyleTag);
        ie11CustomCssTag.appendChild(dropdownListTag);

        var radioButtonTag = document.createElement("radioButton");
        var radioButtonStyleTag = document.createElement("style");
        radioButtonStyleTag.type = "text/css";
        radioButtonStyleTag.appendChild(document.createTextNode("input[type=radio]:disabled::-ms-check { color: #D1D1D1; background-color: transparent; }"));
        radioButtonTag.appendChild(radioButtonStyleTag);
        ie11CustomCssTag.appendChild(radioButtonTag);

        var checkBoxCustomStyleTag = document.createElement("style");
        checkBoxCustomStyleTag.type = "text/css";
        checkBoxCustomStyleTag.appendChild(document.createTextNode("input[type=checkbox]:disabled::-ms-check { color: #D1D1D1; background-color: transparent; }"));
        ie11CustomCssTag.appendChild(checkBoxCustomStyleTag);

        document.body.appendChild(ie11CustomCssTag);
    }
}());