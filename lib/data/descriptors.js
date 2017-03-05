"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("../metal/object");
/**
 * Base Descriptor class
 *
 * @package data
 */
class Descriptor extends object_1.default {
    /**
     * Creates an instance of Descriptor.
     */
    constructor(type, options) {
        super();
        this.type = type;
        this.options = options;
    }
}
exports.Descriptor = Descriptor;
/**
 * The Attribute class is used to tell Denali what the available attributes are
 * on your Model. You shouldn't use the Attribute class directly; instead,
 * import the `attr()` method from Denali, and use it to define an attribute:
 *
 *     import { attr } from 'denali';
 *     class Post extends ApplicationModel {
 *       static title = attr('text');
 *     }
 *
 * Note that attributes must be defined as `static` properties on your Model
 * class.
 *
 * The `attr()` method takes two arguments:
 *
 *   * `type` - a string indicating the type of this attribute. Denali doesn't
 *   care what this string is. Your ORM adapter should specify what types it
 *   expects.
 *   * `options` - any additional options for this attribute. At the moment,
 *   these are used solely by your ORM adapter, there are no additional options
 *   that Denali expects itself.
 *
 * @package data
 * @since 0.1.0
 */
class Attribute extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is an attribute
         */
        this.isAttribute = true;
    }
}
exports.Attribute = Attribute;
/**
 * Syntax sugar factory method for creating Attributes
 *
 * @package data
 * @since 0.1.0
 */
function attr(type, options) {
    return new Attribute(type, options);
}
exports.attr = attr;
/**
 * The HasManyRelationship class is used to describe a 1 to many or many to many
 * relationship on your Model. You shouldn't use the HasManyRelationship class
 * directly; instead, import the `hasMany()` method from Denali, and use it to
 * define a relationship:
 *
 *     import { hasMany } from 'denali';
 *     class Post extends ApplicationModel {
 *       static comments = hasMany('comment');
 *     }
 *
 * Note that relationships must be defined as `static` properties on your Model
 * class.
 *
 * The `hasMany()` method takes two arguments:
 *
 *   * `type` - a string indicating the type of model for this relationship.
 *   * `options` - any additional options for this attribute. At the moment,
 *   these are used solely by your ORM adapter, there are no additional options
 *   that Denali expects itself.
 *
 * @package data
 * @since 0.1.0
 */
class HasManyRelationship extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is a relationship
         */
        this.isRelationship = true;
        /**
         * Relationship mode, i.e. 1 -> 1 or 1 -> N
         */
        this.mode = 'hasMany';
    }
}
exports.HasManyRelationship = HasManyRelationship;
/**
 * Syntax sugar factory function for creating HasManyRelationships
 *
 * @package data
 * @since 0.1.0
 */
function hasMany(type, options) {
    return new HasManyRelationship(type, options);
}
exports.hasMany = hasMany;
/**
 * The HasOneRelationship class is used to describe a 1 to many or 1 to 1
 * relationship on your Model. You shouldn't use the HasOneRelationship class
 * directly; instead, import the `hasOne()` method from Denali, and use it to
 * define a relationship:
 *
 *     import { hasOne } from 'denali';
 *     class Post extends ApplicationModel {
 *       static author = hasOne('user');
 *     }
 *
 * Note that relationships must be defined as `static` properties on your Model
 * class.
 *
 * The `hasOne()` method takes two arguments:
 *
 *   * `type` - a string indicating the type of model for this relationship.
 *   * `options` - any additional options for this attribute. At the moment,
 *   these are used solely by your ORM adapter, there are no additional options
 *   that Denali expects itself.
 *
 * @package data
 * @since 0.1.0
 */
class HasOneRelationship extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is a relationship
         */
        this.isRelationship = true;
        /**
         * Relationship mode, i.e. 1 -> 1 or 1 -> N
         */
        this.mode = 'hasOne';
    }
}
exports.HasOneRelationship = HasOneRelationship;
/**
 * Syntax sugar factory function for creating HasOneRelationships
 *
 * @package data
 * @since 0.1.0
 */
function hasOne(type, options) {
    return new HasOneRelationship(type, options);
}
exports.hasOne = hasOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRvcnMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL2RhdGEvZGVzY3JpcHRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBMkM7QUFFM0M7Ozs7R0FJRztBQUNILGdCQUF3QixTQUFRLGdCQUFZO0lBWTFDOztPQUVHO0lBQ0gsWUFBWSxJQUFZLEVBQUUsT0FBYTtRQUNyQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7Q0FFRjtBQXJCRCxnQ0FxQkM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0JHO0FBQ0gsZUFBdUIsU0FBUSxVQUFVO0lBQXpDOztRQUVFOztXQUVHO1FBQ0ksZ0JBQVcsR0FBRyxJQUFJLENBQUM7SUFFNUIsQ0FBQztDQUFBO0FBUEQsOEJBT0M7QUFFRDs7Ozs7R0FLRztBQUNILGNBQXFCLElBQVksRUFBRSxPQUFhO0lBQzlDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUZELG9CQUVDO0FBR0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gseUJBQWlDLFNBQVEsVUFBVTtJQUFuRDs7UUFFRTs7V0FFRztRQUNJLG1CQUFjLEdBQUcsSUFBSSxDQUFDO1FBRTdCOztXQUVHO1FBQ0ksU0FBSSxHQUF5QixTQUFTLENBQUM7SUFFaEQsQ0FBQztDQUFBO0FBWkQsa0RBWUM7QUFFRDs7Ozs7R0FLRztBQUNILGlCQUF3QixJQUFZLEVBQUUsT0FBYTtJQUNqRCxNQUFNLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUZELDBCQUVDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsd0JBQWdDLFNBQVEsVUFBVTtJQUFsRDs7UUFFRTs7V0FFRztRQUNJLG1CQUFjLEdBQUcsSUFBSSxDQUFDO1FBRTdCOztXQUVHO1FBQ0ksU0FBSSxHQUF5QixRQUFRLENBQUM7SUFFL0MsQ0FBQztDQUFBO0FBWkQsZ0RBWUM7QUFFRDs7Ozs7R0FLRztBQUNILGdCQUF1QixJQUFZLEVBQUUsT0FBYTtJQUNoRCxNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUZELHdCQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuXG4vKipcbiAqIEJhc2UgRGVzY3JpcHRvciBjbGFzc1xuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGNsYXNzIERlc2NyaXB0b3IgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBXaGF0IGtpbmQgb2YgZGVzY3JpcHRvciBpcyB0aGlzPyBVc2VkIGJ5IHN1YmNsYXNzZXMgdG8gZGlmZmVyZW50aWF0ZSBlYXNpbHkgYmV0d2VlbiB0eXBlcy5cbiAgICovXG4gIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEdlbmVyaWMgb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBzdXBwbHkgRGVuYWxpIG9yIE9STSBzcGVjaWZpYyBjb25maWcgb3B0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBvcHRpb25zOiBhbnk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRGVzY3JpcHRvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgb3B0aW9ucz86IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbn1cblxuLyoqXG4gKiBUaGUgQXR0cmlidXRlIGNsYXNzIGlzIHVzZWQgdG8gdGVsbCBEZW5hbGkgd2hhdCB0aGUgYXZhaWxhYmxlIGF0dHJpYnV0ZXMgYXJlXG4gKiBvbiB5b3VyIE1vZGVsLiBZb3Ugc2hvdWxkbid0IHVzZSB0aGUgQXR0cmlidXRlIGNsYXNzIGRpcmVjdGx5OyBpbnN0ZWFkLFxuICogaW1wb3J0IHRoZSBgYXR0cigpYCBtZXRob2QgZnJvbSBEZW5hbGksIGFuZCB1c2UgaXQgdG8gZGVmaW5lIGFuIGF0dHJpYnV0ZTpcbiAqXG4gKiAgICAgaW1wb3J0IHsgYXR0ciB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgY2xhc3MgUG9zdCBleHRlbmRzIEFwcGxpY2F0aW9uTW9kZWwge1xuICogICAgICAgc3RhdGljIHRpdGxlID0gYXR0cigndGV4dCcpO1xuICogICAgIH1cbiAqXG4gKiBOb3RlIHRoYXQgYXR0cmlidXRlcyBtdXN0IGJlIGRlZmluZWQgYXMgYHN0YXRpY2AgcHJvcGVydGllcyBvbiB5b3VyIE1vZGVsXG4gKiBjbGFzcy5cbiAqXG4gKiBUaGUgYGF0dHIoKWAgbWV0aG9kIHRha2VzIHR3byBhcmd1bWVudHM6XG4gKlxuICogICAqIGB0eXBlYCAtIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIHR5cGUgb2YgdGhpcyBhdHRyaWJ1dGUuIERlbmFsaSBkb2Vzbid0XG4gKiAgIGNhcmUgd2hhdCB0aGlzIHN0cmluZyBpcy4gWW91ciBPUk0gYWRhcHRlciBzaG91bGQgc3BlY2lmeSB3aGF0IHR5cGVzIGl0XG4gKiAgIGV4cGVjdHMuXG4gKiAgICogYG9wdGlvbnNgIC0gYW55IGFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhpcyBhdHRyaWJ1dGUuIEF0IHRoZSBtb21lbnQsXG4gKiAgIHRoZXNlIGFyZSB1c2VkIHNvbGVseSBieSB5b3VyIE9STSBhZGFwdGVyLCB0aGVyZSBhcmUgbm8gYWRkaXRpb25hbCBvcHRpb25zXG4gKiAgIHRoYXQgRGVuYWxpIGV4cGVjdHMgaXRzZWxmLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgQXR0cmlidXRlIGV4dGVuZHMgRGVzY3JpcHRvciB7XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZsYWcgZm9yIGNoZWNraW5nIGlmIHRoaXMgaXMgYW4gYXR0cmlidXRlXG4gICAqL1xuICBwdWJsaWMgaXNBdHRyaWJ1dGUgPSB0cnVlO1xuXG59XG5cbi8qKlxuICogU3ludGF4IHN1Z2FyIGZhY3RvcnkgbWV0aG9kIGZvciBjcmVhdGluZyBBdHRyaWJ1dGVzXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRyKHR5cGU6IHN0cmluZywgb3B0aW9ucz86IGFueSk6IEF0dHJpYnV0ZSB7XG4gIHJldHVybiBuZXcgQXR0cmlidXRlKHR5cGUsIG9wdGlvbnMpO1xufVxuXG5cbi8qKlxuICogVGhlIEhhc01hbnlSZWxhdGlvbnNoaXAgY2xhc3MgaXMgdXNlZCB0byBkZXNjcmliZSBhIDEgdG8gbWFueSBvciBtYW55IHRvIG1hbnlcbiAqIHJlbGF0aW9uc2hpcCBvbiB5b3VyIE1vZGVsLiBZb3Ugc2hvdWxkbid0IHVzZSB0aGUgSGFzTWFueVJlbGF0aW9uc2hpcCBjbGFzc1xuICogZGlyZWN0bHk7IGluc3RlYWQsIGltcG9ydCB0aGUgYGhhc01hbnkoKWAgbWV0aG9kIGZyb20gRGVuYWxpLCBhbmQgdXNlIGl0IHRvXG4gKiBkZWZpbmUgYSByZWxhdGlvbnNoaXA6XG4gKlxuICogICAgIGltcG9ydCB7IGhhc01hbnkgfSBmcm9tICdkZW5hbGknO1xuICogICAgIGNsYXNzIFBvc3QgZXh0ZW5kcyBBcHBsaWNhdGlvbk1vZGVsIHtcbiAqICAgICAgIHN0YXRpYyBjb21tZW50cyA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAqICAgICB9XG4gKlxuICogTm90ZSB0aGF0IHJlbGF0aW9uc2hpcHMgbXVzdCBiZSBkZWZpbmVkIGFzIGBzdGF0aWNgIHByb3BlcnRpZXMgb24geW91ciBNb2RlbFxuICogY2xhc3MuXG4gKlxuICogVGhlIGBoYXNNYW55KClgIG1ldGhvZCB0YWtlcyB0d28gYXJndW1lbnRzOlxuICpcbiAqICAgKiBgdHlwZWAgLSBhIHN0cmluZyBpbmRpY2F0aW5nIHRoZSB0eXBlIG9mIG1vZGVsIGZvciB0aGlzIHJlbGF0aW9uc2hpcC5cbiAqICAgKiBgb3B0aW9uc2AgLSBhbnkgYWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGlzIGF0dHJpYnV0ZS4gQXQgdGhlIG1vbWVudCxcbiAqICAgdGhlc2UgYXJlIHVzZWQgc29sZWx5IGJ5IHlvdXIgT1JNIGFkYXB0ZXIsIHRoZXJlIGFyZSBubyBhZGRpdGlvbmFsIG9wdGlvbnNcbiAqICAgdGhhdCBEZW5hbGkgZXhwZWN0cyBpdHNlbGYuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBjbGFzcyBIYXNNYW55UmVsYXRpb25zaGlwIGV4dGVuZHMgRGVzY3JpcHRvciB7XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZsYWcgZm9yIGNoZWNraW5nIGlmIHRoaXMgaXMgYSByZWxhdGlvbnNoaXBcbiAgICovXG4gIHB1YmxpYyBpc1JlbGF0aW9uc2hpcCA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFJlbGF0aW9uc2hpcCBtb2RlLCBpLmUuIDEgLT4gMSBvciAxIC0+IE5cbiAgICovXG4gIHB1YmxpYyBtb2RlOiAnaGFzTWFueScgfCAnaGFzT25lJyA9ICdoYXNNYW55JztcblxufVxuXG4vKipcbiAqIFN5bnRheCBzdWdhciBmYWN0b3J5IGZ1bmN0aW9uIGZvciBjcmVhdGluZyBIYXNNYW55UmVsYXRpb25zaGlwc1xuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTWFueSh0eXBlOiBzdHJpbmcsIG9wdGlvbnM/OiBhbnkpOiBIYXNNYW55UmVsYXRpb25zaGlwIHtcbiAgcmV0dXJuIG5ldyBIYXNNYW55UmVsYXRpb25zaGlwKHR5cGUsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIFRoZSBIYXNPbmVSZWxhdGlvbnNoaXAgY2xhc3MgaXMgdXNlZCB0byBkZXNjcmliZSBhIDEgdG8gbWFueSBvciAxIHRvIDFcbiAqIHJlbGF0aW9uc2hpcCBvbiB5b3VyIE1vZGVsLiBZb3Ugc2hvdWxkbid0IHVzZSB0aGUgSGFzT25lUmVsYXRpb25zaGlwIGNsYXNzXG4gKiBkaXJlY3RseTsgaW5zdGVhZCwgaW1wb3J0IHRoZSBgaGFzT25lKClgIG1ldGhvZCBmcm9tIERlbmFsaSwgYW5kIHVzZSBpdCB0b1xuICogZGVmaW5lIGEgcmVsYXRpb25zaGlwOlxuICpcbiAqICAgICBpbXBvcnQgeyBoYXNPbmUgfSBmcm9tICdkZW5hbGknO1xuICogICAgIGNsYXNzIFBvc3QgZXh0ZW5kcyBBcHBsaWNhdGlvbk1vZGVsIHtcbiAqICAgICAgIHN0YXRpYyBhdXRob3IgPSBoYXNPbmUoJ3VzZXInKTtcbiAqICAgICB9XG4gKlxuICogTm90ZSB0aGF0IHJlbGF0aW9uc2hpcHMgbXVzdCBiZSBkZWZpbmVkIGFzIGBzdGF0aWNgIHByb3BlcnRpZXMgb24geW91ciBNb2RlbFxuICogY2xhc3MuXG4gKlxuICogVGhlIGBoYXNPbmUoKWAgbWV0aG9kIHRha2VzIHR3byBhcmd1bWVudHM6XG4gKlxuICogICAqIGB0eXBlYCAtIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIHR5cGUgb2YgbW9kZWwgZm9yIHRoaXMgcmVsYXRpb25zaGlwLlxuICogICAqIGBvcHRpb25zYCAtIGFueSBhZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoaXMgYXR0cmlidXRlLiBBdCB0aGUgbW9tZW50LFxuICogICB0aGVzZSBhcmUgdXNlZCBzb2xlbHkgYnkgeW91ciBPUk0gYWRhcHRlciwgdGhlcmUgYXJlIG5vIGFkZGl0aW9uYWwgb3B0aW9uc1xuICogICB0aGF0IERlbmFsaSBleHBlY3RzIGl0c2VsZi5cbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGNsYXNzIEhhc09uZVJlbGF0aW9uc2hpcCBleHRlbmRzIERlc2NyaXB0b3Ige1xuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmbGFnIGZvciBjaGVja2luZyBpZiB0aGlzIGlzIGEgcmVsYXRpb25zaGlwXG4gICAqL1xuICBwdWJsaWMgaXNSZWxhdGlvbnNoaXAgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBSZWxhdGlvbnNoaXAgbW9kZSwgaS5lLiAxIC0+IDEgb3IgMSAtPiBOXG4gICAqL1xuICBwdWJsaWMgbW9kZTogJ2hhc01hbnknIHwgJ2hhc09uZScgPSAnaGFzT25lJztcblxufVxuXG4vKipcbiAqIFN5bnRheCBzdWdhciBmYWN0b3J5IGZ1bmN0aW9uIGZvciBjcmVhdGluZyBIYXNPbmVSZWxhdGlvbnNoaXBzXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNPbmUodHlwZTogc3RyaW5nLCBvcHRpb25zPzogYW55KTogSGFzT25lUmVsYXRpb25zaGlwIHtcbiAgcmV0dXJuIG5ldyBIYXNPbmVSZWxhdGlvbnNoaXAodHlwZSwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCB0eXBlIFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgPSBIYXNNYW55UmVsYXRpb25zaGlwIHwgSGFzT25lUmVsYXRpb25zaGlwO1xuIl19