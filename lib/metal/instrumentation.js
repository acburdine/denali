"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const lodash_1 = require("lodash");
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
class InstrumentationEvent {
    constructor(eventName, data) {
        this.eventName = eventName;
        this.data = data;
        this.startTime = process.hrtime();
    }
    /**
     * Subscribe to be notified when a particular instrumentation block completes.
     */
    static subscribe(eventName, callback) {
        this._emitter.on(eventName, callback);
    }
    /**
     * Unsubscribe from being notified when a particular instrumentation block completes.
     */
    static unsubscribe(eventName, callback) {
        this._emitter.removeListener(eventName, callback);
    }
    /**
     * Run the supplied function, timing how long it takes to complete. If the function returns a
     * promise, the timer waits until that promise resolves. Returns a promise that resolves with the
     * return value of the supplied function. Fires an event with the given event name and event data
     * (the function result is provided as well).
     */
    static instrument(eventName, data) {
        return new InstrumentationEvent(eventName, data);
    }
    /**
     * Emit an InstrumentationEvent to subscribers
     */
    static emit(eventName, event) {
        this._emitter.emit(eventName, event);
    }
    /**
     * Finish this event. Records the duration, and fires an event to any subscribers. Any data
     * provided here is merged with any previously provided data.
     */
    finish(data) {
        this.duration = process.hrtime(this.startTime)[1];
        this.data = lodash_1.merge({}, this.data, data);
        InstrumentationEvent.emit(this.eventName, this);
    }
}
/**
 * The internal event emitter used for notifications
 */
InstrumentationEvent._emitter = new EventEmitter();
exports.default = InstrumentationEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9pbnN0cnVtZW50YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBdUM7QUFDdkMsbUNBQStCO0FBRS9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSDtJQTBERSxZQUFZLFNBQWlCLEVBQUUsSUFBUztRQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBdkREOztPQUVHO0lBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFpQixFQUFFLFFBQStDO1FBQ2pGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQWlCLEVBQUUsUUFBZ0Q7UUFDcEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBaUIsRUFBRSxJQUFTO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsS0FBMkI7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUE0QkQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLElBQVU7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBSyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7O0FBdEVEOztHQUVHO0FBQ1ksNkJBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0FBTC9DLHVDQTBFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICdsb2Rhc2gnO1xuXG4vKipcbiAqIFRoZSBJbnN0cnVtZW50YXRpb24gY2xhc3MgaXMgYSBsb3cgbGV2ZWwgY2xhc3MgZm9yIGluc3RydW1lbnRpbmcgeW91ciBhcHAncyBjb2RlLiBJdCBhbGxvd3MgeW91XG4gKiB0byBsaXN0ZW4gdG8gZnJhbWV3b3JrIGxldmVsIHByb2ZpbGluZyBldmVudHMsIGFzIHdlbGwgYXMgY3JlYXRpbmcgYW5kIGZpcmluZyB5b3VyIG93biBzdWNoXG4gKiBldmVudHMuXG4gKlxuICogRm9yIGV4YW1wbGUsIGlmIHlvdSB3YW50ZWQgdG8gaW5zdHJ1bWVudCBob3cgbG9uZyBhIHBhcnRpY3VsYXIgYWN0aW9uIHdhcyB0YWtpbmc6XG4gKlxuICogICAgIGltcG9ydCB7IEluc3RydW1lbnRhdGlvbiwgQWN0aW9uIH0gZnJvbSAnZGVuYWxpJztcbiAqICAgICBleHBvcnQgZGVmYXVsdCBjbGFzcyBNeUFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gKiAgICAgICByZXNwb25kKCkge1xuICogICAgICAgICBsZXQgUG9zdCA9IHRoaXMubW9kZWxGb3IoJ3Bvc3QnKTtcbiAqICAgICAgICAgcmV0dXJuIEluc3RydW1lbnRhdGlvbi5pbnN0cnVtZW50KCdwb3N0IGxvb2t1cCcsIHsgY3VycmVudFVzZXI6IHRoaXMudXNlci5pZCB9LCAoKSA9PiB7XG4gKiAgICAgICAgICAgUG9zdC5maW5kKHsgdXNlcjogdGhpcy51c2VyIH0pO1xuICogICAgICAgICB9KTtcbiAqICAgICAgIH1cbiAqICAgICB9XG4gKlxuICogQHBhY2thZ2UgbWV0YWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5zdHJ1bWVudGF0aW9uRXZlbnQge1xuXG4gIC8qKlxuICAgKiBUaGUgaW50ZXJuYWwgZXZlbnQgZW1pdHRlciB1c2VkIGZvciBub3RpZmljYXRpb25zXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBfZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIGJlIG5vdGlmaWVkIHdoZW4gYSBwYXJ0aWN1bGFyIGluc3RydW1lbnRhdGlvbiBibG9jayBjb21wbGV0ZXMuXG4gICAqL1xuICBzdGF0aWMgc3Vic2NyaWJlKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBJbnN0cnVtZW50YXRpb25FdmVudCkgPT4gdm9pZCkge1xuICAgIHRoaXMuX2VtaXR0ZXIub24oZXZlbnROYW1lLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogVW5zdWJzY3JpYmUgZnJvbSBiZWluZyBub3RpZmllZCB3aGVuIGEgcGFydGljdWxhciBpbnN0cnVtZW50YXRpb24gYmxvY2sgY29tcGxldGVzLlxuICAgKi9cbiAgc3RhdGljIHVuc3Vic2NyaWJlKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjaz86IChldmVudDogSW5zdHJ1bWVudGF0aW9uRXZlbnQpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0aGUgc3VwcGxpZWQgZnVuY3Rpb24sIHRpbWluZyBob3cgbG9uZyBpdCB0YWtlcyB0byBjb21wbGV0ZS4gSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgYVxuICAgKiBwcm9taXNlLCB0aGUgdGltZXIgd2FpdHMgdW50aWwgdGhhdCBwcm9taXNlIHJlc29sdmVzLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlXG4gICAqIHJldHVybiB2YWx1ZSBvZiB0aGUgc3VwcGxpZWQgZnVuY3Rpb24uIEZpcmVzIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIGV2ZW50IG5hbWUgYW5kIGV2ZW50IGRhdGFcbiAgICogKHRoZSBmdW5jdGlvbiByZXN1bHQgaXMgcHJvdmlkZWQgYXMgd2VsbCkuXG4gICAqL1xuICBzdGF0aWMgaW5zdHJ1bWVudChldmVudE5hbWU6IHN0cmluZywgZGF0YTogYW55KTogSW5zdHJ1bWVudGF0aW9uRXZlbnQge1xuICAgIHJldHVybiBuZXcgSW5zdHJ1bWVudGF0aW9uRXZlbnQoZXZlbnROYW1lLCBkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0IGFuIEluc3RydW1lbnRhdGlvbkV2ZW50IHRvIHN1YnNjcmliZXJzXG4gICAqL1xuICBzdGF0aWMgZW1pdChldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IEluc3RydW1lbnRhdGlvbkV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KGV2ZW50TmFtZSwgZXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoaXMgaW5zdHJ1bWVudGF0aW9uIGV2ZW5cbiAgICovXG4gIGV2ZW50TmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZHVyYXRpb24gb2YgdGhlIGluc3RydW1lbnRhdGlvbiBldmVudCAoY2FsY3VsYXRlZCBhZnRlciBjYWxsaW5nIGAuZmluaXNoKClgKVxuICAgKi9cbiAgZHVyYXRpb246IG51bWJlcjtcblxuICAvKipcbiAgICogQWRkaXRpb25hbCBkYXRhIHN1cHBsaWVkIGZvciB0aGlzIGV2ZW50LCBlaXRoZXIgYXQgdGhlIHN0YXJ0IG9yIGZpbmlzaCBvZiB0aGUgZXZlbnQuXG4gICAqL1xuICBkYXRhOiBhbnk7XG5cbiAgLyoqXG4gICAqIEhpZ2ggcmVzb2x1dGlvbiBzdGFydCB0aW1lIG9mIHRoaXMgZXZlbnRcbiAgICovXG4gIHByaXZhdGUgc3RhcnRUaW1lOiBbIG51bWJlciwgbnVtYmVyIF07XG5cbiAgY29uc3RydWN0b3IoZXZlbnROYW1lOiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5zdGFydFRpbWUgPSBwcm9jZXNzLmhydGltZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmlzaCB0aGlzIGV2ZW50LiBSZWNvcmRzIHRoZSBkdXJhdGlvbiwgYW5kIGZpcmVzIGFuIGV2ZW50IHRvIGFueSBzdWJzY3JpYmVycy4gQW55IGRhdGFcbiAgICogcHJvdmlkZWQgaGVyZSBpcyBtZXJnZWQgd2l0aCBhbnkgcHJldmlvdXNseSBwcm92aWRlZCBkYXRhLlxuICAgKi9cbiAgZmluaXNoKGRhdGE/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmR1cmF0aW9uID0gcHJvY2Vzcy5ocnRpbWUodGhpcy5zdGFydFRpbWUpWzFdO1xuICAgIHRoaXMuZGF0YSA9IG1lcmdlKHt9LCB0aGlzLmRhdGEsIGRhdGEpO1xuICAgIEluc3RydW1lbnRhdGlvbkV2ZW50LmVtaXQodGhpcy5ldmVudE5hbWUsIHRoaXMpO1xuICB9XG5cbn1cbiJdfQ==