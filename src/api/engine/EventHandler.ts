export interface BaseEvent<TEventType extends string = string> {
    readonly type: TEventType;
}

/**
 * The minimal expected contract of a fired Event that was dispatched by a {@link EventDispatcher<>}.
 */
export interface Event<TEventType extends string = string, TTarget = unknown> {
    readonly type: TEventType;
    target: TTarget;
}

export type EventListener<TEventData, TEventType extends string, TTarget> = (
    event: TEventData & Event<TEventType, TTarget>,
) => void;


interface IEventDispatcher<TEventMap extends {} = {}> {
    /**
     * Adds a listener to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
    addEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T,
        listener: EventListener<TEventMap[T], T, this>,
    ): void;

    /**
     * Checks if listener is added to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
    hasEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T,
        listener: EventListener<TEventMap[T], T, this>,
    ): boolean;

    /**
     * Removes a listener from an event type.
     * @param type The type of the listener that gets removed.
     * @param listener The listener function that gets removed.
     */
    removeEventListener<T extends Extract<keyof TEventMap, string>>(
        type: T,
        listener: EventListener<TEventMap[T], T, this>,
    ): void;

    /**
     * Fire an event type.
     * @param event The event that gets fired.
     */
    dispatchEvent<T extends Extract<keyof TEventMap, string>>(event: BaseEvent<T> & TEventMap[T]): void;
}

interface IEventMap {

}
type IEventCallback<T> = (data:T) => void;

interface IEventHandler<EventMap extends IEventMap = IEventMap>{
    addEventListener<K extends keyof EventMap>(event:K, callback:IEventCallback<EventMap[K]>):void;
    removeEventListener<K extends keyof EventMap>(event:K, callback:IEventCallback<EventMap[K]>):void;
    dispatchEvent<K extends keyof EventMap>(event:K, data:EventMap[K]):void;
}

class EventHandler<TEventMap extends {} = {}> implements IEventDispatcher<TEventMap> {

    private _listeners: Partial<Record<keyof TEventMap, Function[]>> = {};

    constructor() {

    }
    addEventListener<T extends Extract<keyof TEventMap, string>>(type: T, listener: EventListener<TEventMap[T], T, this>): void {
        if ( this._listeners === undefined ) this._listeners = {};
		const listeners = this._listeners;
		if ( listeners[ type ] === undefined ) {
			listeners[ type ] = [];
		}
		if ( listeners[ type ].indexOf( listener ) === - 1 ) {
			listeners[ type ].push( listener );
		}
    }
    hasEventListener<T extends Extract<keyof TEventMap, string>>(type: T, listener: EventListener<TEventMap[T], T, this>): boolean {
        if ( this._listeners === undefined ) return false;
		const listeners = this._listeners;
		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;
    }
    removeEventListener<T extends Extract<keyof TEventMap, string>>(type: T, listener: EventListener<TEventMap[T], T, this>): void {
        if ( this._listeners === undefined ) return;
		const listeners = this._listeners;
		const listenerArray = listeners[ type ];
		if ( listenerArray !== undefined ) {
			const index = listenerArray.indexOf( listener );
			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );
			}
		}
    }
    dispatchEvent<T extends Extract<keyof TEventMap, string>>(event: BaseEvent<T> & TEventMap[T]): void {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];
        if(listenerArray)
        {
            (event as any).target = this;
			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {
				array[ i ].call( this, event );
			}
			(event as any).target = null;
		}
    }

    clear<T extends Extract<keyof TEventMap, string>>(type:T)
    {
        const listeners = this._listeners;
		if(listeners[type]) listeners[type] = [];
    }


    getFunction<T extends Extract<keyof TEventMap, string>>(type:T)
    {
		return this._listeners[type];
    }
}

export {IEventMap, IEventHandler, EventHandler};
