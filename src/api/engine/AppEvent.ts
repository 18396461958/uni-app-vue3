import { EventHandler } from "./EventHandler";


export interface BaseEvent<T extends string> {
    readonly type: T;
}

export interface ElementSelectedEventArgv {
    Position: string;
    ElementId: string;
}

export interface MeasureType {
    'dis': number,
    'area': number,
    'angle': number,
    'polyline':number[],
    'closedArea' : number,
}

export interface IAppEventMap {
    "OnLoadModelInfos": {ModelIds:string[]};
    "OnInit": {ModelId:string};
    "OnInitAfter": {ModelId:string};
    'OnTreeSelected': {ModelId:string, ElementId:string};
    'OnElementSelected': ElementSelectedEventArgv;
    'OnMeasureResult': {MeasureType:keyof MeasureType, data:any};
    'OnPersonRoamPath': {recordView:string};
    'OnDrawRoamPath': {recordView:string};
    'OnMessageCallback': {msg:string};
}

class AppEventType extends EventHandler<IAppEventMap> {
    
}

export const AppEvent = new AppEventType();