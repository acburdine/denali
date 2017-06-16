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
        this.options = options || {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzY3JpcHRvcnMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL2RhdGEvZGVzY3JpcHRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0Q0FBMkM7QUFFM0M7Ozs7R0FJRztBQUNILGdCQUF3QixTQUFRLGdCQUFZO0lBWTFDOztPQUVHO0lBQ0gsWUFBWSxJQUFZLEVBQUUsT0FBYTtRQUNyQyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUMvQixDQUFDO0NBRUY7QUFyQkQsZ0NBcUJDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILGVBQXVCLFNBQVEsVUFBVTtJQUF6Qzs7UUFFRTs7V0FFRztRQUNILGdCQUFXLEdBQUcsSUFBSSxDQUFDO0lBRXJCLENBQUM7Q0FBQTtBQVBELDhCQU9DO0FBRUQ7Ozs7O0dBS0c7QUFDSCxjQUFxQixJQUFZLEVBQUUsT0FBYTtJQUM5QyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFGRCxvQkFFQztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNILHlCQUFpQyxTQUFRLFVBQVU7SUFBbkQ7O1FBRUU7O1dBRUc7UUFDSCxtQkFBYyxHQUFHLElBQUksQ0FBQztRQUV0Qjs7V0FFRztRQUNILFNBQUksR0FBeUIsU0FBUyxDQUFDO0lBRXpDLENBQUM7Q0FBQTtBQVpELGtEQVlDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxpQkFBd0IsSUFBWSxFQUFFLE9BQWE7SUFDakQsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFGRCwwQkFFQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNILHdCQUFnQyxTQUFRLFVBQVU7SUFBbEQ7O1FBRUU7O1dBRUc7UUFDSCxtQkFBYyxHQUFHLElBQUksQ0FBQztRQUV0Qjs7V0FFRztRQUNILFNBQUksR0FBeUIsUUFBUSxDQUFDO0lBRXhDLENBQUM7Q0FBQTtBQVpELGdEQVlDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxnQkFBdUIsSUFBWSxFQUFFLE9BQWE7SUFDaEQsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFGRCx3QkFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEZW5hbGlPYmplY3QgZnJvbSAnLi4vbWV0YWwvb2JqZWN0JztcblxuLyoqXG4gKiBCYXNlIERlc2NyaXB0b3IgY2xhc3NcbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXNjcmlwdG9yIGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogV2hhdCBraW5kIG9mIGRlc2NyaXB0b3IgaXMgdGhpcz8gVXNlZCBieSBzdWJjbGFzc2VzIHRvIGRpZmZlcmVudGlhdGUgZWFzaWx5IGJldHdlZW4gdHlwZXMuXG4gICAqL1xuICB0eXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEdlbmVyaWMgb3B0aW9ucyBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBzdXBwbHkgRGVuYWxpIG9yIE9STSBzcGVjaWZpYyBjb25maWcgb3B0aW9ucy5cbiAgICovXG4gIG9wdGlvbnM6IGFueTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBEZXNjcmlwdG9yLlxuICAgKi9cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBvcHRpb25zPzogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIH1cblxufVxuXG4vKipcbiAqIFRoZSBBdHRyaWJ1dGUgY2xhc3MgaXMgdXNlZCB0byB0ZWxsIERlbmFsaSB3aGF0IHRoZSBhdmFpbGFibGUgYXR0cmlidXRlcyBhcmVcbiAqIG9uIHlvdXIgTW9kZWwuIFlvdSBzaG91bGRuJ3QgdXNlIHRoZSBBdHRyaWJ1dGUgY2xhc3MgZGlyZWN0bHk7IGluc3RlYWQsXG4gKiBpbXBvcnQgdGhlIGBhdHRyKClgIG1ldGhvZCBmcm9tIERlbmFsaSwgYW5kIHVzZSBpdCB0byBkZWZpbmUgYW4gYXR0cmlidXRlOlxuICpcbiAqICAgICBpbXBvcnQgeyBhdHRyIH0gZnJvbSAnZGVuYWxpJztcbiAqICAgICBjbGFzcyBQb3N0IGV4dGVuZHMgQXBwbGljYXRpb25Nb2RlbCB7XG4gKiAgICAgICBzdGF0aWMgdGl0bGUgPSBhdHRyKCd0ZXh0Jyk7XG4gKiAgICAgfVxuICpcbiAqIE5vdGUgdGhhdCBhdHRyaWJ1dGVzIG11c3QgYmUgZGVmaW5lZCBhcyBgc3RhdGljYCBwcm9wZXJ0aWVzIG9uIHlvdXIgTW9kZWxcbiAqIGNsYXNzLlxuICpcbiAqIFRoZSBgYXR0cigpYCBtZXRob2QgdGFrZXMgdHdvIGFyZ3VtZW50czpcbiAqXG4gKiAgICogYHR5cGVgIC0gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiB0aGlzIGF0dHJpYnV0ZS4gRGVuYWxpIGRvZXNuJ3RcbiAqICAgY2FyZSB3aGF0IHRoaXMgc3RyaW5nIGlzLiBZb3VyIE9STSBhZGFwdGVyIHNob3VsZCBzcGVjaWZ5IHdoYXQgdHlwZXMgaXRcbiAqICAgZXhwZWN0cy5cbiAqICAgKiBgb3B0aW9uc2AgLSBhbnkgYWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGlzIGF0dHJpYnV0ZS4gQXQgdGhlIG1vbWVudCxcbiAqICAgdGhlc2UgYXJlIHVzZWQgc29sZWx5IGJ5IHlvdXIgT1JNIGFkYXB0ZXIsIHRoZXJlIGFyZSBubyBhZGRpdGlvbmFsIG9wdGlvbnNcbiAqICAgdGhhdCBEZW5hbGkgZXhwZWN0cyBpdHNlbGYuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGUgZXh0ZW5kcyBEZXNjcmlwdG9yIHtcblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZmxhZyBmb3IgY2hlY2tpbmcgaWYgdGhpcyBpcyBhbiBhdHRyaWJ1dGVcbiAgICovXG4gIGlzQXR0cmlidXRlID0gdHJ1ZTtcblxufVxuXG4vKipcbiAqIFN5bnRheCBzdWdhciBmYWN0b3J5IG1ldGhvZCBmb3IgY3JlYXRpbmcgQXR0cmlidXRlc1xuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXR0cih0eXBlOiBzdHJpbmcsIG9wdGlvbnM/OiBhbnkpOiBBdHRyaWJ1dGUge1xuICByZXR1cm4gbmV3IEF0dHJpYnV0ZSh0eXBlLCBvcHRpb25zKTtcbn1cblxuXG4vKipcbiAqIFRoZSBIYXNNYW55UmVsYXRpb25zaGlwIGNsYXNzIGlzIHVzZWQgdG8gZGVzY3JpYmUgYSAxIHRvIG1hbnkgb3IgbWFueSB0byBtYW55XG4gKiByZWxhdGlvbnNoaXAgb24geW91ciBNb2RlbC4gWW91IHNob3VsZG4ndCB1c2UgdGhlIEhhc01hbnlSZWxhdGlvbnNoaXAgY2xhc3NcbiAqIGRpcmVjdGx5OyBpbnN0ZWFkLCBpbXBvcnQgdGhlIGBoYXNNYW55KClgIG1ldGhvZCBmcm9tIERlbmFsaSwgYW5kIHVzZSBpdCB0b1xuICogZGVmaW5lIGEgcmVsYXRpb25zaGlwOlxuICpcbiAqICAgICBpbXBvcnQgeyBoYXNNYW55IH0gZnJvbSAnZGVuYWxpJztcbiAqICAgICBjbGFzcyBQb3N0IGV4dGVuZHMgQXBwbGljYXRpb25Nb2RlbCB7XG4gKiAgICAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gKiAgICAgfVxuICpcbiAqIE5vdGUgdGhhdCByZWxhdGlvbnNoaXBzIG11c3QgYmUgZGVmaW5lZCBhcyBgc3RhdGljYCBwcm9wZXJ0aWVzIG9uIHlvdXIgTW9kZWxcbiAqIGNsYXNzLlxuICpcbiAqIFRoZSBgaGFzTWFueSgpYCBtZXRob2QgdGFrZXMgdHdvIGFyZ3VtZW50czpcbiAqXG4gKiAgICogYHR5cGVgIC0gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiBtb2RlbCBmb3IgdGhpcyByZWxhdGlvbnNoaXAuXG4gKiAgICogYG9wdGlvbnNgIC0gYW55IGFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhpcyBhdHRyaWJ1dGUuIEF0IHRoZSBtb21lbnQsXG4gKiAgIHRoZXNlIGFyZSB1c2VkIHNvbGVseSBieSB5b3VyIE9STSBhZGFwdGVyLCB0aGVyZSBhcmUgbm8gYWRkaXRpb25hbCBvcHRpb25zXG4gKiAgIHRoYXQgRGVuYWxpIGV4cGVjdHMgaXRzZWxmLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgSGFzTWFueVJlbGF0aW9uc2hpcCBleHRlbmRzIERlc2NyaXB0b3Ige1xuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmbGFnIGZvciBjaGVja2luZyBpZiB0aGlzIGlzIGEgcmVsYXRpb25zaGlwXG4gICAqL1xuICBpc1JlbGF0aW9uc2hpcCA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFJlbGF0aW9uc2hpcCBtb2RlLCBpLmUuIDEgLT4gMSBvciAxIC0+IE5cbiAgICovXG4gIG1vZGU6ICdoYXNNYW55JyB8ICdoYXNPbmUnID0gJ2hhc01hbnknO1xuXG59XG5cbi8qKlxuICogU3ludGF4IHN1Z2FyIGZhY3RvcnkgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIEhhc01hbnlSZWxhdGlvbnNoaXBzXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNNYW55KHR5cGU6IHN0cmluZywgb3B0aW9ucz86IGFueSk6IEhhc01hbnlSZWxhdGlvbnNoaXAge1xuICByZXR1cm4gbmV3IEhhc01hbnlSZWxhdGlvbnNoaXAodHlwZSwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogVGhlIEhhc09uZVJlbGF0aW9uc2hpcCBjbGFzcyBpcyB1c2VkIHRvIGRlc2NyaWJlIGEgMSB0byBtYW55IG9yIDEgdG8gMVxuICogcmVsYXRpb25zaGlwIG9uIHlvdXIgTW9kZWwuIFlvdSBzaG91bGRuJ3QgdXNlIHRoZSBIYXNPbmVSZWxhdGlvbnNoaXAgY2xhc3NcbiAqIGRpcmVjdGx5OyBpbnN0ZWFkLCBpbXBvcnQgdGhlIGBoYXNPbmUoKWAgbWV0aG9kIGZyb20gRGVuYWxpLCBhbmQgdXNlIGl0IHRvXG4gKiBkZWZpbmUgYSByZWxhdGlvbnNoaXA6XG4gKlxuICogICAgIGltcG9ydCB7IGhhc09uZSB9IGZyb20gJ2RlbmFsaSc7XG4gKiAgICAgY2xhc3MgUG9zdCBleHRlbmRzIEFwcGxpY2F0aW9uTW9kZWwge1xuICogICAgICAgc3RhdGljIGF1dGhvciA9IGhhc09uZSgndXNlcicpO1xuICogICAgIH1cbiAqXG4gKiBOb3RlIHRoYXQgcmVsYXRpb25zaGlwcyBtdXN0IGJlIGRlZmluZWQgYXMgYHN0YXRpY2AgcHJvcGVydGllcyBvbiB5b3VyIE1vZGVsXG4gKiBjbGFzcy5cbiAqXG4gKiBUaGUgYGhhc09uZSgpYCBtZXRob2QgdGFrZXMgdHdvIGFyZ3VtZW50czpcbiAqXG4gKiAgICogYHR5cGVgIC0gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHlwZSBvZiBtb2RlbCBmb3IgdGhpcyByZWxhdGlvbnNoaXAuXG4gKiAgICogYG9wdGlvbnNgIC0gYW55IGFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhpcyBhdHRyaWJ1dGUuIEF0IHRoZSBtb21lbnQsXG4gKiAgIHRoZXNlIGFyZSB1c2VkIHNvbGVseSBieSB5b3VyIE9STSBhZGFwdGVyLCB0aGVyZSBhcmUgbm8gYWRkaXRpb25hbCBvcHRpb25zXG4gKiAgIHRoYXQgRGVuYWxpIGV4cGVjdHMgaXRzZWxmLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgY2xhc3MgSGFzT25lUmVsYXRpb25zaGlwIGV4dGVuZHMgRGVzY3JpcHRvciB7XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZsYWcgZm9yIGNoZWNraW5nIGlmIHRoaXMgaXMgYSByZWxhdGlvbnNoaXBcbiAgICovXG4gIGlzUmVsYXRpb25zaGlwID0gdHJ1ZTtcblxuICAvKipcbiAgICogUmVsYXRpb25zaGlwIG1vZGUsIGkuZS4gMSAtPiAxIG9yIDEgLT4gTlxuICAgKi9cbiAgbW9kZTogJ2hhc01hbnknIHwgJ2hhc09uZScgPSAnaGFzT25lJztcblxufVxuXG4vKipcbiAqIFN5bnRheCBzdWdhciBmYWN0b3J5IGZ1bmN0aW9uIGZvciBjcmVhdGluZyBIYXNPbmVSZWxhdGlvbnNoaXBzXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNPbmUodHlwZTogc3RyaW5nLCBvcHRpb25zPzogYW55KTogSGFzT25lUmVsYXRpb25zaGlwIHtcbiAgcmV0dXJuIG5ldyBIYXNPbmVSZWxhdGlvbnNoaXAodHlwZSwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCB0eXBlIFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgPSBIYXNNYW55UmVsYXRpb25zaGlwIHwgSGFzT25lUmVsYXRpb25zaGlwO1xuIl19