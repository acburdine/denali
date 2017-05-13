"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base Descriptor class
 *
 * @package data
 */
class Descriptor {
    /**
     * Creates an instance of Descriptor.
     */
    constructor(type, options = {}) {
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
class AttributeDescriptor extends Descriptor {
    constructor() {
        super(...arguments);
        /**
         * Convenience flag for checking if this is an attribute
         */
        this.isAttribute = true;
    }
}
exports.AttributeDescriptor = AttributeDescriptor;
/**
 * Syntax sugar factory method for creating Attributes
 *
 * @package data
 * @since 0.1.0
 */
function attr(type, options) {
    return new AttributeDescriptor(type, options);
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
class HasManyRelationshipDescriptor extends Descriptor {
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
exports.HasManyRelationshipDescriptor = HasManyRelationshipDescriptor;
/**
 * Syntax sugar factory function for creating HasManyRelationships
 *
 * @package data
 * @since 0.1.0
 */
function hasMany(type, options) {
    return new HasManyRelationshipDescriptor(type, options);
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
class HasOneRelationshipDescriptor extends Descriptor {
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
exports.HasOneRelationshipDescriptor = HasOneRelationshipDescriptor;
/**
 * Syntax sugar factory function for creating HasOneRelationships
 *
 * @package data
 * @since 0.1.0
 */
function hasOne(type, options) {
    return new HasOneRelationshipDescriptor(type, options);
}
exports.hasOne = hasOne;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRvcnMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL2RhdGEvZGVzY3JpcHRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztHQUlHO0FBQ0g7SUFZRTs7T0FFRztJQUNILFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0NBRUY7QUFwQkQsZ0NBb0JDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILHlCQUFpQyxTQUFRLFVBQVU7SUFBbkQ7O1FBRUU7O1dBRUc7UUFDSCxnQkFBVyxHQUFHLElBQUksQ0FBQztJQUVyQixDQUFDO0NBQUE7QUFQRCxrREFPQztBQUVEOzs7OztHQUtHO0FBQ0gsY0FBcUIsSUFBWSxFQUFFLE9BQWE7SUFDOUMsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFGRCxvQkFFQztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNILG1DQUEyQyxTQUFRLFVBQVU7SUFBN0Q7O1FBRUU7O1dBRUc7UUFDSCxtQkFBYyxHQUFHLElBQUksQ0FBQztRQUV0Qjs7V0FFRztRQUNILFNBQUksR0FBeUIsU0FBUyxDQUFDO0lBRXpDLENBQUM7Q0FBQTtBQVpELHNFQVlDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxpQkFBd0IsSUFBWSxFQUFFLE9BQWE7SUFDakQsTUFBTSxDQUFDLElBQUksNkJBQTZCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFGRCwwQkFFQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNILGtDQUEwQyxTQUFRLFVBQVU7SUFBNUQ7O1FBRUU7O1dBRUc7UUFDSCxtQkFBYyxHQUFHLElBQUksQ0FBQztRQUV0Qjs7V0FFRztRQUNILFNBQUksR0FBeUIsUUFBUSxDQUFDO0lBRXhDLENBQUM7Q0FBQTtBQVpELG9FQVlDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxnQkFBdUIsSUFBWSxFQUFFLE9BQWE7SUFDaEQsTUFBTSxDQUFDLElBQUksNEJBQTRCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCx3QkFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQmFzZSBEZXNjcmlwdG9yIGNsYXNzXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICovXG5leHBvcnQgY2xhc3MgRGVzY3JpcHRvciB7XG5cbiAgLyoqXG4gICAqIFdoYXQga2luZCBvZiBkZXNjcmlwdG9yIGlzIHRoaXM/IFVzZWQgYnkgc3ViY2xhc3NlcyB0byBkaWZmZXJlbnRpYXRlIGVhc2lseSBiZXR3ZWVuIHR5cGVzLlxuICAgKi9cbiAgdHlwZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBHZW5lcmljIG9wdGlvbnMgb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gc3VwcGx5IERlbmFsaSBvciBPUk0gc3BlY2lmaWMgY29uZmlnIG9wdGlvbnMuXG4gICAqL1xuICBvcHRpb25zOiBhbnk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRGVzY3JpcHRvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxufVxuXG4vKipcbiAqIFRoZSBBdHRyaWJ1dGUgY2xhc3MgaXMgdXNlZCB0byB0ZWxsIERlbmFsaSB3aGF0IHRoZSBhdmFpbGFibGUgYXR0cmlidXRlcyBhcmVcbiAqIG9uIHlvdXIgTW9kZWwuIFlvdSBzaG91bGRuJ3QgdXNlIHRoZSBBdHRyaWJ1dGUgY2xhc3MgZGlyZWN0bHk7IGluc3RlYWQsXG4gKiBpbXBvcnQgdGhlIGBhdHRyKClgIG1ldGhvZCBmcm9tIERlbmFsaSwgYW5kIHVzZSBpdCB0byBkZWZpbmUgYW4gYXR0cmlidXRlOlxuICpcbiAqICAgICBpbXBvcnQgeyBhdHRyIH0gZnJvbSAnZGVuYWxpJztcbiAqICAgICBjbGFzcyBQb3N0IGV4dGVuZHMgQXBwbGljYXRpb25Nb2RlbCB7XG4gKiAgICAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCd0ZXh0Jyk7XG4gKiAgICAgfVxuICpcbiAqIE5vdGUgdGhhdCBhdHRyaWJ1dGVzIG11c3QgYmUgZGVmaW5lZCBhcyBgc3RhdGljYCBwcm9wZXJ0aWVzIG9uIHlvdXIgTW9kZWxcbiAqIGNsYXNzLlxuICpcbiAqIFRoZSBgYXR0cigpYCBtZXRob2QgdGFrZXMgdHdvIGFyZ3VtZW50czpcbiAqXG4gKiAgICogYHR5cGVgIC0gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGlzIGF0dHJpYnV0ZS4gRGVuYWxpIGRvZXNuJ3RcbiAqICAgY2FyZSB3aGF0IHRoaXMgc3RyaW5nIGlzLiBZb3VyIE9STSBhZGFwdGVyIHNob3VsZCBzcGVjaWZ5IHdoYXQgdHlwZXMgaXRcbiAqICAgZXhwZWN0cy5cbiAqICAgKiBgb3B0aW9uc2AgLSBhbnkgYWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGlzIGF0dHJpYnV0ZS4gQXQgdGhlIG1vbWVudCxcbiAqICAgdGhlc2UgYXJlIHVzZWQgc29sZWx5IGJ5IHlvdXIgT1JNIGFkYXB0ZXIsIHRoZXJlIGFyZSBubyBhZGRpdGlvbmFsIG9wdGlvbnNcbiAqICAgdGhhdCBEZW5hbGkgZXhwZWN0cyBpdHNlbGYuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGVEZXNjcmlwdG9yIGV4dGVuZHMgRGVzY3JpcHRvciB7XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZsYWcgZm9yIGNoZWNraW5nIGlmIHRoaXMgaXMgYW4gYXR0cmlidXRlXG4gICAqL1xuICBpc0F0dHJpYnV0ZSA9IHRydWU7XG5cbn1cblxuLyoqXG4gKiBTeW50YXggc3VnYXIgZmFjdG9yeSBtZXRob2QgZm9yIGNyZWF0aW5nIEF0dHJpYnV0ZXNcbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHIodHlwZTogc3RyaW5nLCBvcHRpb25zPzogYW55KTogQXR0cmlidXRlRGVzY3JpcHRvciB7XG4gIHJldHVybiBuZXcgQXR0cmlidXRlRGVzY3JpcHRvcih0eXBlLCBvcHRpb25zKTtcbn1cblxuXG4vKipcbiAqIFRoZSBIYXNNYW55UmVsYXRpb25zaGlwIGNsYXNzIGlzIHVzZWQgdG8gZGVzY3JpYmUgYSAxIHRvIG1hbnkgb3IgbWFueSB0byBtYW55XG4gKiByZWxhdGlvbnNoaXAgb24geW91ciBNb2RlbC4gWW91IHNob3VsZG4ndCB1c2UgdGhlIEhhc01hbnlSZWxhdGlvbnNoaXAgY2xhc3NcbiAqIGRpcmVjdGx5OyBpbnN0ZWFkLCBpbXBvcnQgdGhlIGBoYXNNYW55KClgIG1ldGhvZCBmcm9tIERlbmFsaSwgYW5kIHVzZSBpdCB0b1xuICogZGVmaW5lIGEgcmVsYXRpb25zaGlwOlxuICpcbiAqICAgICBpbXBvcnQgeyBoYXNNYW55IH0gZnJvbSAnZGVuYWxpJztcbiAqICAgICBjbGFzcyBQb3N0IGV4dGVuZHMgQXBwbGljYXRpb25Nb2RlbCB7XG4gKiAgICAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gKiAgICAgfVxuICpcbiAqIE5vdGUgdGhhdCByZWxhdGlvbnNoaXBzIG11c3QgYmUgZGVmaW5lZCBhcyBgc3RhdGljYCBwcm9wZXJ0aWVzIG9uIHlvdXIgTW9kZWxcbiAqIGNsYXNzLlxuICpcbiAqIFRoZSBgaGFzTWFueSgpYCBtZXRob2QgdGFrZXMgdHdvIGFyZ3VtZW50czpcbiAqXG4gKiAgICogYHR5cGVgIC0gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiBtb2RlbCBmb3IgdGhpcyByZWxhdGlvbnNoaXAuXG4gKiAgICogYG9wdGlvbnNgIC0gYW55IGFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhpcyBhdHRyaWJ1dGUuIEF0IHRoZSBtb21lbnQsXG4gKiAgIHRoZXNlIGFyZSB1c2VkIHNvbGVseSBieSB5b3VyIE9STSBhZGFwdGVyLCB0aGVyZSBhcmUgbm8gYWRkaXRpb25hbCBvcHRpb25zXG4gKiAgIHRoYXQgRGVuYWxpIGV4cGVjdHMgaXRzZWxmLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgSGFzTWFueVJlbGF0aW9uc2hpcERlc2NyaXB0b3IgZXh0ZW5kcyBEZXNjcmlwdG9yIHtcblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZmxhZyBmb3IgY2hlY2tpbmcgaWYgdGhpcyBpcyBhIHJlbGF0aW9uc2hpcFxuICAgKi9cbiAgaXNSZWxhdGlvbnNoaXAgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBSZWxhdGlvbnNoaXAgbW9kZSwgaS5lLiAxIC0+IDEgb3IgMSAtPiBOXG4gICAqL1xuICBtb2RlOiAnaGFzTWFueScgfCAnaGFzT25lJyA9ICdoYXNNYW55JztcblxufVxuXG4vKipcbiAqIFN5bnRheCBzdWdhciBmYWN0b3J5IGZ1bmN0aW9uIGZvciBjcmVhdGluZyBIYXNNYW55UmVsYXRpb25zaGlwc1xuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTWFueSh0eXBlOiBzdHJpbmcsIG9wdGlvbnM/OiBhbnkpOiBIYXNNYW55UmVsYXRpb25zaGlwRGVzY3JpcHRvciB7XG4gIHJldHVybiBuZXcgSGFzTWFueVJlbGF0aW9uc2hpcERlc2NyaXB0b3IodHlwZSwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogVGhlIEhhc09uZVJlbGF0aW9uc2hpcCBjbGFzcyBpcyB1c2VkIHRvIGRlc2NyaWJlIGEgMSB0byBtYW55IG9yIDEgdG8gMVxuICogcmVsYXRpb25zaGlwIG9uIHlvdXIgTW9kZWwuIFlvdSBzaG91bGRuJ3QgdXNlIHRoZSBIYXNPbmVSZWxhdGlvbnNoaXAgY2xhc3NcbiAqIGRpcmVjdGx5OyBpbnN0ZWFkLCBpbXBvcnQgdGhlIGBoYXNPbmUoKWAgbWV0aG9kIGZyb20gRGVuYWxpLCBhbmQgdXNlIGl0IHRvXG4gKiBkZWZpbmUgYSByZWxhdGlvbnNoaXA6XG4gKlxuICogICAgIGltcG9ydCB7IGhhc09uZSB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgY2xhc3MgUG9zdCBleHRlbmRzIEFwcGxpY2F0aW9uTW9kZWwge1xuICogICAgICAgc3RhdGljIGF1dGhvciA9IGhhc09uZSgndXNlcicpO1xuICogICAgIH1cbiAqXG4gKiBOb3RlIHRoYXQgcmVsYXRpb25zaGlwcyBtdXN0IGJlIGRlZmluZWQgYXMgYHN0YXRpY2AgcHJvcGVydGllcyBvbiB5b3VyIE1vZGVsXG4gKiBjbGFzcy5cbiAqXG4gKiBUaGUgYGhhc09uZSgpYCBtZXRob2QgdGFrZXMgdHdvIGFyZ3VtZW50czpcbiAqXG4gKiAgICogYHR5cGVgIC0gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiBtb2RlbCBmb3IgdGhpcyByZWxhdGlvbnNoaXAuXG4gKiAgICogYG9wdGlvbnNgIC0gYW55IGFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhpcyBhdHRyaWJ1dGUuIEF0IHRoZSBtb21lbnQsXG4gKiAgIHRoZXNlIGFyZSB1c2VkIHNvbGVseSBieSB5b3VyIE9STSBhZGFwdGVyLCB0aGVyZSBhcmUgbm8gYWRkaXRpb25hbCBvcHRpb25zXG4gKiAgIHRoYXQgRGVuYWxpIGV4cGVjdHMgaXRzZWxmLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgSGFzT25lUmVsYXRpb25zaGlwRGVzY3JpcHRvciBleHRlbmRzIERlc2NyaXB0b3Ige1xuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmbGFnIGZvciBjaGVja2luZyBpZiB0aGlzIGlzIGEgcmVsYXRpb25zaGlwXG4gICAqL1xuICBpc1JlbGF0aW9uc2hpcCA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFJlbGF0aW9uc2hpcCBtb2RlLCBpLmUuIDEgLT4gMSBvciAxIC0+IE5cbiAgICovXG4gIG1vZGU6ICdoYXNNYW55JyB8ICdoYXNPbmUnID0gJ2hhc09uZSc7XG5cbn1cblxuLyoqXG4gKiBTeW50YXggc3VnYXIgZmFjdG9yeSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgSGFzT25lUmVsYXRpb25zaGlwc1xuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzT25lKHR5cGU6IHN0cmluZywgb3B0aW9ucz86IGFueSk6IEhhc09uZVJlbGF0aW9uc2hpcERlc2NyaXB0b3Ige1xuICByZXR1cm4gbmV3IEhhc09uZVJlbGF0aW9uc2hpcERlc2NyaXB0b3IodHlwZSwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCB0eXBlIFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgPSBIYXNNYW55UmVsYXRpb25zaGlwRGVzY3JpcHRvciB8IEhhc09uZVJlbGF0aW9uc2hpcERlc2NyaXB0b3I7XG4iXX0=