interface DropdownList extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    hiddenControl: HiddenTextBox | undefined;
    previousBackgroundColor: string;
    tabIndex: number;
    needCheck: boolean;
    title: string;
    text: string;
    backgroundColor: string;
    noDataMessage: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
    previousValue: string;
    loadOptions(records: string[], textTagName: string, valueTagName: string, allowDuplicateValue: boolean): void;
    addOption(text: string, value: string, addAtFirst: boolean): void;
    clear(): void;
    clearOptions(): void;
}

interface Grid extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    columnWidth: number;
    hasChanged: boolean;
    needCheck: boolean;
    id: string;
    value: string;
    title: string;
    noDataMessage: string;
    style: CSSStyleDeclaration;
    visible: boolean;
    data: string;
    hasRows: boolean;
    rowIndex: number;
    isSelected: boolean;
    top: number;
    left: number;
    width: number;
    height: number;
    beforeReloadTop: number;
    beforeReloadLeft: number;
    titleGapTop: number;
    titleGapLeft: number;
    previousValue: string;
    getData(): string[][];
    load(data: string[]): void;
    save(): void;
    onChange(func: Function): void;
    clear(): void;
    getColumnIndex(columnId: string): number;
    setColumnWidthByIds(width: number, columnIds: string[]): void;
    sortById(columnId: string, direction: string): void;
    getJson(names: string[]): string[];
    toJsonString(names: string[]): string;
    onSelect(func: Function): void;
    setSelectByUpDownKeys(): void;
    hideColumnByIds(columnIds: string[]): void;
    getCellById(columnId: string, rowIndex: number): string;
    setRowBackgroundColor(color: string, rowIndex: number): void;
    add(): void;
    update(): void;
    delete(): void;
    saveTemp(): void;
    restore(): void;
    display(data: string[]): void;
    getDuplicateRowIndex(excludeSelectedRow: number, columnIds: string[]): number;
    reposition(): void;
    enableCellEdit(columnIds: string[]): void;
}

interface Button extends HTMLElement {
    controlType: string;
    previousBackgroundColor: string;
    backgroundColor: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    openSearchWindow(dataArray: string[], columnNames: object, returnIdMappings: object, clickFunc: Function, cancelFunc: Function, isTiptopMode: boolean): void;
    openPhraseWindow(textBox: TextBox): void;
}

interface TextBox extends HTMLElement {
    controlType: string;
    explicitControl: TextBox | undefined;
    titleControl: Label | undefined;
    previousBackgroundColor: string;
    formatChecker: RegExp;
    range: string;
    decimalPlaces: number;
    txtDatatype: string;
    currentMousePosition: number;
    decimalPointPosition: number;
    noticeMessage: string;
    tabIndex: number;
    needCheck: boolean;
    value: string;
    title: string;
    maxlength: number;
    enableIME: boolean;
    backgroundColor: string;
    noDataMessage: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
    setUpperCase(): void;
    setLowerCase(): void;
    setFormatChecker(pattern: string, flag: string, noticeMessage: string): void;
    clear(): void;
    previousValue: string;
}

interface RadioButton extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    buttonControls: NodeListOf<HTMLInputElement>;
    previousBackgroundColor: string;
    tabIndex: number;
    needCheck: boolean;
    value: string;
    text: string;
    title: string;
    backgroundColor: string;
    noDataMessage: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
    previousValue: string;
    clear(): void;
    removeButton(text: string, value: string): void;
    hideButton(text: string, value: string): void;
}

interface CheckBox extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    buttonControls: NodeListOf<HTMLInputElement>;
    previousBackgroundColor: string;
    tabIndex: number;
    needCheck: boolean;
    title: string;
    value: string;
    text: string;
    backgroundColor: string;
    noDataMessage: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
    previousValue: string;
    clear(): void;
}

interface Link extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    target: string;
    text: string;
    title: string;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
}

interface Label extends HTMLElement {
    controlType: string;
    text: string;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
}

interface DialogInput extends HTMLElement {
    controlType: string;
    valueControl: TextBox;
    buttonControl: Button;
    labelControl: TextBox | undefined;
    titleControl: Label | undefined;
    hiddenControl: HiddenTextBox | undefined;
    listHiddenControl: HiddenTextBox | undefined;
    previousBackgroundColor: string;
    tabIndex: number;
    needCheck: boolean;
    value: string;
    label: string;
    title: string;
    backgroundColor: string;
    noDataMessage: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    writable: boolean;
    titleGapTop: number;
    titleGapLeft: number;
    previousValue: string;
    clear(): void;
    onClick(func: Function): void;
    changeDataChooser(dataType: string, filterCondition: string, filterText: string): void;
}

interface SerialNumberTextBox extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    text: string;
    value: string;
    title: string;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
}

interface HiddenTextBox extends HTMLElement {
    controlType: string;
    titleControl: Label | undefined;
    needCheck: boolean;
    value: string;
    title: string;
    noDataMessage: string;
    clear(): void;
}

interface Image extends HTMLElement {
    controlType: string;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
}

interface Barcode extends HTMLElement {
    controlType: string;
    url: string;
    titleControl: Label | undefined;
    needCheck: boolean;
    value: string;
    title: string;
    noDataMessage: string;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    titleGapTop: number;
    titleGapLeft: number;
    clear(): void;
}

interface AttachmentButton extends HTMLElement {
    controlType: string;
    previousBackgroundColor: string;
    needCheck: boolean;
    backgroundColor: string;
    noDataMessage: string;
    enabled: boolean;
    visible: boolean;
    toolTip: string;
    top: number;
    left: number;
    width: number;
    height: number;
    getAttachmentInfos(): string[];
}

interface Form extends HTMLElement {
    controlType: string;
    width: number;
    height: number;
}