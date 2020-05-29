import { FormControl } from '@angular/forms';

/** Cell data in case of `header.type = "input"` and `header.input != "switch"` */
export interface DTInputData {
    control: FormControl;
    errorText?: string;
    disabled?: boolean;
}

/** Cell data in case of `header.type = "button"` */
export interface DTButtonData {
    action: string;
    text?: string;
    classes?:string;
    hide?: boolean;
    disabled?: boolean;
}

/** Data object to pass as `data` in DataTable params */
export interface DTBodyData {
    [propName:string] : DTInputData | DTButtonData | DTButtonData[] | string | number | boolean | any;
}

/** Header object to pass as `headers` in DataTable params */
export interface DTHeaderData {
    id:string;
    name:string;
    hide?:boolean;
    type:'text'|'input'|'button';
    input?: 'text'|'number'|'float'|'email'|'switch';
    props?:DTSwitchProps;
}

/** Properties for switch coming in `data` DataTable parameter */
export interface DTSwitchProps {
    trueText?: string;
    trueColor?: string;
    falseText?: string;
    falseColor?: string;
}

/** Data received in `eventHandler` to handle Button actions  */
export interface DTEvent {
    id: string | number;
    column?: string;
    action: string;
}