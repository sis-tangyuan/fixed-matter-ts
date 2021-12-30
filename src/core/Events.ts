import { Common } from "./Common";

export interface IEvent {
    events?: Map<string, Function[]>
}

export default class Events {

    public static on(object: IEvent, eventNames: string, callback: Function): Function {
        let names: string[] = eventNames.split(" "),
            name: string
        for (let index = 0; index < names.length; index++) {
            name = names[index];
            object.events = object.events || new Map()
            if (object.events.get(name) == null) {
                object.events.set(name, [])
            }
            object.events.get(name)?.push(callback)
        }
        return callback
    }

    public static off(object: IEvent, eventNames?: any, callback?: Function) {
        if (!eventNames) {
            object?.events?.clear()
            return
        }

        if (typeof eventNames === 'function') {
            callback = eventNames
            eventNames = Common.keys(object.events).join(' ')
        }

        var names = eventNames.split(' ')

        for (let index = 0; index < names.length; index++) {
            const name: string = names[index];
            var  callbacks = object?.events?.get(name),
                newCallbacks = [];
            if (callback && callbacks) {
                for (let j = 0; j < callbacks.length; j++) {
                    const cb = callbacks[j];
                    if (cb != callback) {
                        newCallbacks.push(cb)
                    }
                }
            }
            object?.events?.set(name, newCallbacks)
        }
        
    }

    public static trigger(object: IEvent, eventName: string, event?: any) {
        var names,
            name: string,
            callbacks,
            eventClone;
        
        var events = object.events;

        if (events && Common.keys(events).length > 0) {
            if (!event) 
                event = {}
            names = eventName.split(' ');

            for (let i = 0; i < names.length; i++) {
                name = names[i];
                callbacks = events.get(name)

                if (callbacks) {
                    eventClone = Common.clone(event, false)
                    eventClone.name = name;
                    eventClone.source = object;

                    for (let j = 0; j < callbacks.length; j++) {
                        const callback = callbacks[j];
                        callback.apply(object, [eventClone])
                    }
                }
            }
        }
    }
}