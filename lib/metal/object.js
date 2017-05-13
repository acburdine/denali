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
        throw new Error('You tried to set a `container` property on a class directly - this is generally a bad idea, since the static class is shared across multiple containers, likely resulting in leaky state and bizarre test failures.');
    }
    /**
     * Apply mixins using this class as the base class. Pure syntactic sugar for the `mixin` helper.
     */
    static mixin(...mixins) {
        return mixin_1.default(this, ...mixins);
    }
    /**
     * A hook that users should override for constructor-time logic so they don't have to worry about
     * correctly handling super and container references.
     */
    init(...args) {
        // Default is no-op
    }
}
exports.default = DenaliObject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9vYmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBaUQ7QUFHakQ7Ozs7R0FJRztBQUNIO0lBRUU7OztPQUdHO0lBQ08sTUFBTSxLQUFLLFNBQVMsQ0FBQyxLQUFVO1FBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMscU5BQXFOLENBQUMsQ0FBQztJQUN6TyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBbUM7UUFDakQsTUFBTSxDQUFNLGVBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBT0Q7OztPQUdHO0lBQ0gsSUFBSSxDQUFDLEdBQUcsSUFBVztRQUNqQixtQkFBbUI7SUFDckIsQ0FBQztDQUVGO0FBOUJELCtCQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtaXhpbiwgeyBNaXhpbkFwcGxpY2F0b3IgfSBmcm9tICcuL21peGluJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuXG4vKipcbiAqIFRoZSBiYXNlIG9iamVjdCBjbGFzcyBmb3IgRGVuYWxpIGNsYXNzZXMuIEFkZHMgbWl4aW4gc3VwcG9ydC5cbiAqXG4gKiBAcGFja2FnZSBtZXRhbFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBQcmV2ZW50IHBlb3BsZSBmcm9tIGludHJvZHVjaW5nIHN1YnRsZSBhbmQgZGlmZmljdWx0IHRvIGRpYWdub3NlIGJ1Z3MgYnkgc2hhcmluZyBjb250YWluZXJcbiAgICogc3RhdGUgc3RhdGljYWxseVxuICAgKi9cbiAgcHJvdGVjdGVkIHN0YXRpYyBzZXQgY29udGFpbmVyKHZhbHVlOiBhbnkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSB0cmllZCB0byBzZXQgYSBgY29udGFpbmVyYCBwcm9wZXJ0eSBvbiBhIGNsYXNzIGRpcmVjdGx5IC0gdGhpcyBpcyBnZW5lcmFsbHkgYSBiYWQgaWRlYSwgc2luY2UgdGhlIHN0YXRpYyBjbGFzcyBpcyBzaGFyZWQgYWNyb3NzIG11bHRpcGxlIGNvbnRhaW5lcnMsIGxpa2VseSByZXN1bHRpbmcgaW4gbGVha3kgc3RhdGUgYW5kIGJpemFycmUgdGVzdCBmYWlsdXJlcy4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBtaXhpbnMgdXNpbmcgdGhpcyBjbGFzcyBhcyB0aGUgYmFzZSBjbGFzcy4gUHVyZSBzeW50YWN0aWMgc3VnYXIgZm9yIHRoZSBgbWl4aW5gIGhlbHBlci5cbiAgICovXG4gIHN0YXRpYyBtaXhpbiguLi5taXhpbnM6IE1peGluQXBwbGljYXRvcjxhbnksIGFueT5bXSk6IGFueSB7XG4gICAgcmV0dXJuIDxhbnk+bWl4aW4odGhpcywgLi4ubWl4aW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gY29udGFpbmVyIGluc3RhbmNlXG4gICAqL1xuICBwcm90ZWN0ZWQgY29udGFpbmVyOiBDb250YWluZXI7XG5cbiAgLyoqXG4gICAqIEEgaG9vayB0aGF0IHVzZXJzIHNob3VsZCBvdmVycmlkZSBmb3IgY29uc3RydWN0b3ItdGltZSBsb2dpYyBzbyB0aGV5IGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXRcbiAgICogY29ycmVjdGx5IGhhbmRsaW5nIHN1cGVyIGFuZCBjb250YWluZXIgcmVmZXJlbmNlcy5cbiAgICovXG4gIGluaXQoLi4uYXJnczogYW55W10pOiB2b2lkIHtcbiAgICAvLyBEZWZhdWx0IGlzIG5vLW9wXG4gIH1cblxufVxuIl19