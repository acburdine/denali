"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("../metal/object");
/**
 * Serializers allow you to customize what data is returned in the response and apply simple
 * transformations to it. They allow you to decouple what data is sent from how that data is
 * structured / rendered.
 *
 * @package data
 */
class Serializer extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * The list of attribute names that should be serialized. Attributes not included in this list
         * will be omitted from the final rendered payload.
         */
        this.attributes = [];
        /**
         * An object with configuration on how to serialize relationships. Relationships that have no
         * configuration present are omitted from the final rendered payload.
         *
         * Out of the box, one option is supported:
         *
         * **strategy**
         *
         * It has one of two possible values:
         *
         *   * `embed`: embed all related records in the response payload
         *   * `id`: include only the id of the related record(s)
         *
         * What the embedded records or ids look like is up to each serializer to determine.
         */
        this.relationships = {};
    }
    /**
     * Take a serialized JSON document (i.e. an incoming request body), and perform any normalization
     * required.
     *
     * The return value of this method is entirely up to the specific serializer, i.e. some may return
     * the payload unchanged, others may tweak the structure, or some could even return actual ORM
     * model instances.
     *
     * This method is optional - the default implementation returns the payload unchanged.
     *
     * @param payload The incoming request body
     */
    parse(payload) {
        return payload;
    }
}
/**
 * Serializers should be singletons
 */
Serializer.singleton = true;
exports.default = Serializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvZGF0YS9zZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQTJDO0FBZ0IzQzs7Ozs7O0dBTUc7QUFDSCxnQkFBMEIsU0FBUSxnQkFBWTtJQUE5Qzs7UUE2QkU7OztXQUdHO1FBQ08sZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUVwQzs7Ozs7Ozs7Ozs7Ozs7V0FjRztRQUNPLGtCQUFhLEdBQXlELEVBQUUsQ0FBQztJQUVyRixDQUFDO0lBdkNDOzs7Ozs7Ozs7OztPQVdHO0lBQ0ksS0FBSyxDQUFDLE9BQVk7UUFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQixDQUFDOztBQXpCRDs7R0FFRztBQUNJLG9CQUFTLEdBQUcsSUFBSSxDQUFDO0FBaUQxQixrQkFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgUmVzcG9uc2UgZnJvbSAnLi4vcnVudGltZS9yZXNwb25zZSc7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4uL3J1bnRpbWUvY29udGFpbmVyJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGZvciBob3cgYSBzZXJpYWxpemVyIHNob3VsZCBzZXJpYWxpemUgYSByZWxhdGlvbnNoaXBcbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsYXRpb25zaGlwQ29uZmlnIHtcbiAgc3RyYXRlZ3k/OiAnZW1iZWQnIHwgJ2lkJztcbiAga2V5Pzogc3RyaW5nO1xuICBzZXJpYWxpemVyPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZXJzIGFsbG93IHlvdSB0byBjdXN0b21pemUgd2hhdCBkYXRhIGlzIHJldHVybmVkIGluIHRoZSByZXNwb25zZSBhbmQgYXBwbHkgc2ltcGxlXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gaXQuIFRoZXkgYWxsb3cgeW91IHRvIGRlY291cGxlIHdoYXQgZGF0YSBpcyBzZW50IGZyb20gaG93IHRoYXQgZGF0YSBpc1xuICogc3RydWN0dXJlZCAvIHJlbmRlcmVkLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuYWJzdHJhY3QgY2xhc3MgU2VyaWFsaXplciBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZXJzIHNob3VsZCBiZSBzaW5nbGV0b25zXG4gICAqL1xuICBzdGF0aWMgc2luZ2xldG9uID0gdHJ1ZTtcblxuICAvKipcbiAgICogVGFrZSB0aGUgc3VwcGxpZWQgUmVzcG9uc2UgaW5zdGFuY2UgYW5kIHRoZSBzdXBwbGllZCBvcHRpb25zIGFuZCByZXR1cm4gYSByZW5kZXJlZCBhIEpTT05cbiAgICogcmVzcG9uc2Ugb2JqZWN0LlxuICAgKi9cbiAgcHVibGljIGFic3RyYWN0IHNlcmlhbGl6ZShyZXNwb25zZTogUmVzcG9uc2UsIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcblxuICAvKipcbiAgICogVGFrZSBhIHNlcmlhbGl6ZWQgSlNPTiBkb2N1bWVudCAoaS5lLiBhbiBpbmNvbWluZyByZXF1ZXN0IGJvZHkpLCBhbmQgcGVyZm9ybSBhbnkgbm9ybWFsaXphdGlvblxuICAgKiByZXF1aXJlZC5cbiAgICpcbiAgICogVGhlIHJldHVybiB2YWx1ZSBvZiB0aGlzIG1ldGhvZCBpcyBlbnRpcmVseSB1cCB0byB0aGUgc3BlY2lmaWMgc2VyaWFsaXplciwgaS5lLiBzb21lIG1heSByZXR1cm5cbiAgICogdGhlIHBheWxvYWQgdW5jaGFuZ2VkLCBvdGhlcnMgbWF5IHR3ZWFrIHRoZSBzdHJ1Y3R1cmUsIG9yIHNvbWUgY291bGQgZXZlbiByZXR1cm4gYWN0dWFsIE9STVxuICAgKiBtb2RlbCBpbnN0YW5jZXMuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIG9wdGlvbmFsIC0gdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gcmV0dXJucyB0aGUgcGF5bG9hZCB1bmNoYW5nZWQuXG4gICAqXG4gICAqIEBwYXJhbSBwYXlsb2FkIFRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHlcbiAgICovXG4gIHB1YmxpYyBwYXJzZShwYXlsb2FkOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBwYXlsb2FkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBsaXN0IG9mIGF0dHJpYnV0ZSBuYW1lcyB0aGF0IHNob3VsZCBiZSBzZXJpYWxpemVkLiBBdHRyaWJ1dGVzIG5vdCBpbmNsdWRlZCBpbiB0aGlzIGxpc3RcbiAgICogd2lsbCBiZSBvbWl0dGVkIGZyb20gdGhlIGZpbmFsIHJlbmRlcmVkIHBheWxvYWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcblxuICAvKipcbiAgICogQW4gb2JqZWN0IHdpdGggY29uZmlndXJhdGlvbiBvbiBob3cgdG8gc2VyaWFsaXplIHJlbGF0aW9uc2hpcHMuIFJlbGF0aW9uc2hpcHMgdGhhdCBoYXZlIG5vXG4gICAqIGNvbmZpZ3VyYXRpb24gcHJlc2VudCBhcmUgb21pdHRlZCBmcm9tIHRoZSBmaW5hbCByZW5kZXJlZCBwYXlsb2FkLlxuICAgKlxuICAgKiBPdXQgb2YgdGhlIGJveCwgb25lIG9wdGlvbiBpcyBzdXBwb3J0ZWQ6XG4gICAqXG4gICAqICoqc3RyYXRlZ3kqKlxuICAgKlxuICAgKiBJdCBoYXMgb25lIG9mIHR3byBwb3NzaWJsZSB2YWx1ZXM6XG4gICAqXG4gICAqICAgKiBgZW1iZWRgOiBlbWJlZCBhbGwgcmVsYXRlZCByZWNvcmRzIGluIHRoZSByZXNwb25zZSBwYXlsb2FkXG4gICAqICAgKiBgaWRgOiBpbmNsdWRlIG9ubHkgdGhlIGlkIG9mIHRoZSByZWxhdGVkIHJlY29yZChzKVxuICAgKlxuICAgKiBXaGF0IHRoZSBlbWJlZGRlZCByZWNvcmRzIG9yIGlkcyBsb29rIGxpa2UgaXMgdXAgdG8gZWFjaCBzZXJpYWxpemVyIHRvIGRldGVybWluZS5cbiAgICovXG4gIHByb3RlY3RlZCByZWxhdGlvbnNoaXBzOiB7IFsgcmVsYXRpb25zaGlwTmFtZTogc3RyaW5nIF06IFJlbGF0aW9uc2hpcENvbmZpZyB9ID0ge307XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VyaWFsaXplcjtcbiJdfQ==