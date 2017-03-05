/**
 * The Instrumentation class is a low level class for instrumenting your app's code. It allows you
 * to listen to framework level profiling events, as well as creating and firing your own such
 * events.
 *
 * For example, if you wanted to instrument how long a particular action was taking:
 *
 *     import { Instrumentation, Action } from 'denali';
 *     export default class MyAction extends Action {
 *       respond() {
 *         let Post = this.modelFor('post');
 *         return Instrumentation.instrument('post lookup', { currentUser: this.user.id }, () => {
 *           Post.find({ user: this.user });
 *         });
 *       }
 *     }
 *
 * @package metal
 */
export default class InstrumentationEvent {
    /**
     * The internal event emitter used for notifications
     */
    private static _emitter;
    /**
     * Subscribe to be notified when a particular instrumentation block completes.
     */
    static subscribe(eventName: string, callback: (event: InstrumentationEvent) => void): void;
    /**
     * Unsubscribe from being notified when a particular instrumentation block completes.
     */
    static unsubscribe(eventName: string, callback?: (event: InstrumentationEvent) => void): void;
    /**
     * Run the supplied function, timing how long it takes to complete. If the function returns a
     * promise, the timer waits until that promise resolves. Returns a promise that resolves with the
     * return value of the supplied function. Fires an event with the given event name and event data
     * (the function result is provided as well).
     */
    static instrument(eventName: string, data: any): InstrumentationEvent;
    /**
     * Emit an InstrumentationEvent to subscribers
     */
    static emit(eventName: string, event: InstrumentationEvent): void;
    /**
     * The name of this instrumentation even
     */
    eventName: string;
    /**
     * The duration of the instrumentation event (calculated after calling `.finish()`)
     */
    duration: number;
    /**
     * Additional data supplied for this event, either at the start or finish of the event.
     */
    data: any;
    /**
     * High resolution start time of this event
     */
    private startTime;
    constructor(eventName: string, data: any);
    /**
     * Finish this event. Records the duration, and fires an event to any subscribers. Any data
     * provided here is merged with any previously provided data.
     */
    finish(data?: any): void;
}
