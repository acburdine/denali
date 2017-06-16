"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mixin_1 = require("./mixin");
/**
 * The base object class for Denali classes. Adds mixin support.
 *
 * @package metal
 */
class DenaliObject {
    /**
     * Prevent people from introducing subtle and difficult to diagnose bugs by sharing container
     * state statically
     */
    static set container(value) {
        throw new Error('You tried to set a `container` property on a class directly - this is generally a bad idea, since static references to containers');
    }
    /**
     * Apply mixins using this class as the base class. Pure syntactic sugar for the `mixin` helper.
     */
    static mixin(...mixins) {
        return mixin_1.default(this, ...mixins);
    }
}
exports.default = DenaliObject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBaUQ7QUFHakQ7Ozs7R0FJRztBQUNIO0lBRUU7OztPQUdHO0lBQ08sTUFBTSxLQUFLLFNBQVMsQ0FBQyxLQUFVO1FBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUlBQW1JLENBQUMsQ0FBQTtJQUN0SixDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBbUM7UUFDakQsTUFBTSxDQUFNLGVBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBT0Y7QUF0QkQsK0JBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1peGluLCB7IE1peGluQXBwbGljYXRvciB9IGZyb20gJy4vbWl4aW4nO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcic7XG5cbi8qKlxuICogVGhlIGJhc2Ugb2JqZWN0IGNsYXNzIGZvciBEZW5hbGkgY2xhc3Nlcy4gQWRkcyBtaXhpbiBzdXBwb3J0LlxuICpcbiAqIEBwYWNrYWdlIG1ldGFsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIFByZXZlbnQgcGVvcGxlIGZyb20gaW50cm9kdWNpbmcgc3VidGxlIGFuZCBkaWZmaWN1bHQgdG8gZGlhZ25vc2UgYnVncyBieSBzaGFyaW5nIGNvbnRhaW5lclxuICAgKiBzdGF0ZSBzdGF0aWNhbGx5XG4gICAqL1xuICBwcm90ZWN0ZWQgc3RhdGljIHNldCBjb250YWluZXIodmFsdWU6IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignWW91IHRyaWVkIHRvIHNldCBhIGBjb250YWluZXJgIHByb3BlcnR5IG9uIGEgY2xhc3MgZGlyZWN0bHkgLSB0aGlzIGlzIGdlbmVyYWxseSBhIGJhZCBpZGVhLCBzaW5jZSBzdGF0aWMgcmVmZXJlbmNlcyB0byBjb250YWluZXJzJylcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBtaXhpbnMgdXNpbmcgdGhpcyBjbGFzcyBhcyB0aGUgYmFzZSBjbGFzcy4gUHVyZSBzeW50YWN0aWMgc3VnYXIgZm9yIHRoZSBgbWl4aW5gIGhlbHBlci5cbiAgICovXG4gIHN0YXRpYyBtaXhpbiguLi5taXhpbnM6IE1peGluQXBwbGljYXRvcjxhbnksIGFueT5bXSk6IGFueSB7XG4gICAgcmV0dXJuIDxhbnk+bWl4aW4odGhpcywgLi4ubWl4aW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gY29udGFpbmVyIGluc3RhbmNlXG4gICAqL1xuICBwcm90ZWN0ZWQgY29udGFpbmVyOiBDb250YWluZXI7XG5cbn1cbiJdfQ==