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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1bWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9pbnN0cnVtZW50YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBdUM7QUFDdkMsbUNBQStCO0FBRS9COzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSDtJQTBERSxZQUFZLFNBQWlCLEVBQUUsSUFBUztRQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBdkREOztPQUVHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFpQixFQUFFLFFBQStDO1FBQ3hGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQWlCLEVBQUUsUUFBZ0Q7UUFDM0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBaUIsRUFBRSxJQUFTO1FBQ25ELE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsS0FBMkI7UUFDL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUE0QkQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLElBQVU7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLGNBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDOztBQXRFRDs7R0FFRztBQUNZLDZCQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztBQUwvQyx1Q0EwRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBUaGUgSW5zdHJ1bWVudGF0aW9uIGNsYXNzIGlzIGEgbG93IGxldmVsIGNsYXNzIGZvciBpbnN0cnVtZW50aW5nIHlvdXIgYXBwJ3MgY29kZS4gSXQgYWxsb3dzIHlvdVxuICogdG8gbGlzdGVuIHRvIGZyYW1ld29yayBsZXZlbCBwcm9maWxpbmcgZXZlbnRzLCBhcyB3ZWxsIGFzIGNyZWF0aW5nIGFuZCBmaXJpbmcgeW91ciBvd24gc3VjaFxuICogZXZlbnRzLlxuICpcbiAqIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudGVkIHRvIGluc3RydW1lbnQgaG93IGxvbmcgYSBwYXJ0aWN1bGFyIGFjdGlvbiB3YXMgdGFraW5nOlxuICpcbiAqICAgICBpbXBvcnQgeyBJbnN0cnVtZW50YXRpb24sIEFjdGlvbiB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICogICAgICAgcmVzcG9uZCgpIHtcbiAqICAgICAgICAgbGV0IFBvc3QgPSB0aGlzLm1vZGVsRm9yKCdwb3N0Jyk7XG4gKiAgICAgICAgIHJldHVybiBJbnN0cnVtZW50YXRpb24uaW5zdHJ1bWVudCgncG9zdCBsb29rdXAnLCB7IGN1cnJlbnRVc2VyOiB0aGlzLnVzZXIuaWQgfSwgKCkgPT4ge1xuICogICAgICAgICAgIFBvc3QuZmluZCh7IHVzZXI6IHRoaXMudXNlciB9KTtcbiAqICAgICAgICAgfSk7XG4gKiAgICAgICB9XG4gKiAgICAgfVxuICpcbiAqIEBwYWNrYWdlIG1ldGFsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluc3RydW1lbnRhdGlvbkV2ZW50IHtcblxuICAvKipcbiAgICogVGhlIGludGVybmFsIGV2ZW50IGVtaXR0ZXIgdXNlZCBmb3Igbm90aWZpY2F0aW9uc1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBiZSBub3RpZmllZCB3aGVuIGEgcGFydGljdWxhciBpbnN0cnVtZW50YXRpb24gYmxvY2sgY29tcGxldGVzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzdWJzY3JpYmUoZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IEluc3RydW1lbnRhdGlvbkV2ZW50KSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fZW1pdHRlci5vbihldmVudE5hbWUsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnN1YnNjcmliZSBmcm9tIGJlaW5nIG5vdGlmaWVkIHdoZW4gYSBwYXJ0aWN1bGFyIGluc3RydW1lbnRhdGlvbiBibG9jayBjb21wbGV0ZXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHVuc3Vic2NyaWJlKGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjaz86IChldmVudDogSW5zdHJ1bWVudGF0aW9uRXZlbnQpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0aGUgc3VwcGxpZWQgZnVuY3Rpb24sIHRpbWluZyBob3cgbG9uZyBpdCB0YWtlcyB0byBjb21wbGV0ZS4gSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgYVxuICAgKiBwcm9taXNlLCB0aGUgdGltZXIgd2FpdHMgdW50aWwgdGhhdCBwcm9taXNlIHJlc29sdmVzLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlXG4gICAqIHJldHVybiB2YWx1ZSBvZiB0aGUgc3VwcGxpZWQgZnVuY3Rpb24uIEZpcmVzIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIGV2ZW50IG5hbWUgYW5kIGV2ZW50IGRhdGFcbiAgICogKHRoZSBmdW5jdGlvbiByZXN1bHQgaXMgcHJvdmlkZWQgYXMgd2VsbCkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGluc3RydW1lbnQoZXZlbnROYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IEluc3RydW1lbnRhdGlvbkV2ZW50IHtcbiAgICByZXR1cm4gbmV3IEluc3RydW1lbnRhdGlvbkV2ZW50KGV2ZW50TmFtZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogRW1pdCBhbiBJbnN0cnVtZW50YXRpb25FdmVudCB0byBzdWJzY3JpYmVyc1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBlbWl0KGV2ZW50TmFtZTogc3RyaW5nLCBldmVudDogSW5zdHJ1bWVudGF0aW9uRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoZXZlbnROYW1lLCBldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhpcyBpbnN0cnVtZW50YXRpb24gZXZlblxuICAgKi9cbiAgcHVibGljIGV2ZW50TmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZHVyYXRpb24gb2YgdGhlIGluc3RydW1lbnRhdGlvbiBldmVudCAoY2FsY3VsYXRlZCBhZnRlciBjYWxsaW5nIGAuZmluaXNoKClgKVxuICAgKi9cbiAgcHVibGljIGR1cmF0aW9uOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEFkZGl0aW9uYWwgZGF0YSBzdXBwbGllZCBmb3IgdGhpcyBldmVudCwgZWl0aGVyIGF0IHRoZSBzdGFydCBvciBmaW5pc2ggb2YgdGhlIGV2ZW50LlxuICAgKi9cbiAgcHVibGljIGRhdGE6IGFueTtcblxuICAvKipcbiAgICogSGlnaCByZXNvbHV0aW9uIHN0YXJ0IHRpbWUgb2YgdGhpcyBldmVudFxuICAgKi9cbiAgcHJpdmF0ZSBzdGFydFRpbWU6IFsgbnVtYmVyLCBudW1iZXIgXTtcblxuICBjb25zdHJ1Y3RvcihldmVudE5hbWU6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogRmluaXNoIHRoaXMgZXZlbnQuIFJlY29yZHMgdGhlIGR1cmF0aW9uLCBhbmQgZmlyZXMgYW4gZXZlbnQgdG8gYW55IHN1YnNjcmliZXJzLiBBbnkgZGF0YVxuICAgKiBwcm92aWRlZCBoZXJlIGlzIG1lcmdlZCB3aXRoIGFueSBwcmV2aW91c2x5IHByb3ZpZGVkIGRhdGEuXG4gICAqL1xuICBwdWJsaWMgZmluaXNoKGRhdGE/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLmR1cmF0aW9uID0gcHJvY2Vzcy5ocnRpbWUodGhpcy5zdGFydFRpbWUpWzFdO1xuICAgIHRoaXMuZGF0YSA9IG1lcmdlKHt9LCB0aGlzLmRhdGEsIGRhdGEpO1xuICAgIEluc3RydW1lbnRhdGlvbkV2ZW50LmVtaXQodGhpcy5ldmVudE5hbWUsIHRoaXMpO1xuICB9XG5cbn1cbiJdfQ==