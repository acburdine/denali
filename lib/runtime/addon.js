"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const findup = require("findup-sync");
const tryRequire = require("try-require");
const object_1 = require("../metal/object");
const resolver_1 = require("../metal/resolver");
/**
 * Addons are the fundamental unit of organization for Denali apps. The Application class is just a
 * specialized Addon, and each Addon can contain any amount of functionality.
 *
 * ## Structure
 *
 * Addons are packaged as npm modules for easy sharing. When Denali boots up, it searches your
 * node_modules for available Denali Addons (identified by the `denali-addon` keyword in the
 * package.json). Addons can be nested (i.e. an addon can itself depend on another addon).
 *
 * Each addon can be composed of one or several of the following parts:
 *
 *   * Config
 *   * Initializers
 *   * Middleware
 *   * App classes
 *   * Routes
 *
 * ## Load order
 *
 * After Denali discovers the available addons, it then merges them to form a unified application.
 * Addons higher in the dependency tree take precedence, and sibling addons can specify load order
 * via their package.json files:
 *
 *     "denali": {
 *       "before": [ "another-addon-name" ],
 *       "after": [ "cool-addon-name" ]
 *     }
 *
 * @package runtime
 * @since 0.1.0
 */
class Addon extends object_1.default {
    constructor(options) {
        super();
        this.container = options.container;
        this.environment = options.environment;
        this.dir = options.dir;
        this.pkg = options.pkg || tryRequire(findup('package.json', { cwd: this.dir }));
        this.resolver = this.resolver || new resolver_1.default(this.dir);
        this.container.addResolver(this.resolver);
        this.container.register(`addon:${this.pkg.name}@${this.pkg.version}`, this);
    }
    /**
     * The name of the addon. Override this to use a different name than the package name for your
     * addon.
     *
     * @since 0.1.0
     */
    get name() {
        return (this.pkg && this.pkg.name) || 'anonymous-addon';
    }
    /**
     * A hook to perform any shutdown actions necessary to gracefully exit the application, i.e. close
     * database/socket connections.
     *
     * @since 0.1.0
     */
    shutdown(application) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // defaults to noop
        });
    }
}
exports.default = Addon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb24uanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3J1bnRpbWUvYWRkb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQXVDO0FBQ3ZDLDBDQUEwQztBQUMxQyw0Q0FBMkM7QUFHM0MsZ0RBQXlDO0FBZXpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0JHO0FBQ0gsV0FBMkIsU0FBUSxnQkFBWTtJQXFDN0MsWUFBWSxPQUFxQjtRQUMvQixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWhGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLGtCQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFVLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSyxJQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBSSxJQUFJO1FBQ04sTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNHLFFBQVEsQ0FBQyxXQUF3Qjs7WUFDckMsbUJBQW1CO1FBQ3JCLENBQUM7S0FBQTtDQUVGO0FBckVELHdCQXFFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmaW5kdXAgPSByZXF1aXJlKCdmaW5kdXAtc3luYycpO1xuaW1wb3J0ICogYXMgdHJ5UmVxdWlyZSBmcm9tICd0cnktcmVxdWlyZSc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4uL21ldGFsL2NvbnRhaW5lcic7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi9hcHBsaWNhdGlvbic7XG5pbXBvcnQgUmVzb2x2ZXIgZnJvbSAnLi4vbWV0YWwvcmVzb2x2ZXInO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIG9wdGlvbnMgZm9yIEFkZG9uIGNsYXNzXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWRkb25PcHRpb25zIHtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuICBwa2c/OiBhbnk7XG59XG5cbi8qKlxuICogQWRkb25zIGFyZSB0aGUgZnVuZGFtZW50YWwgdW5pdCBvZiBvcmdhbml6YXRpb24gZm9yIERlbmFsaSBhcHBzLiBUaGUgQXBwbGljYXRpb24gY2xhc3MgaXMganVzdCBhXG4gKiBzcGVjaWFsaXplZCBBZGRvbiwgYW5kIGVhY2ggQWRkb24gY2FuIGNvbnRhaW4gYW55IGFtb3VudCBvZiBmdW5jdGlvbmFsaXR5LlxuICpcbiAqICMjIFN0cnVjdHVyZVxuICpcbiAqIEFkZG9ucyBhcmUgcGFja2FnZWQgYXMgbnBtIG1vZHVsZXMgZm9yIGVhc3kgc2hhcmluZy4gV2hlbiBEZW5hbGkgYm9vdHMgdXAsIGl0IHNlYXJjaGVzIHlvdXJcbiAqIG5vZGVfbW9kdWxlcyBmb3IgYXZhaWxhYmxlIERlbmFsaSBBZGRvbnMgKGlkZW50aWZpZWQgYnkgdGhlIGBkZW5hbGktYWRkb25gIGtleXdvcmQgaW4gdGhlXG4gKiBwYWNrYWdlLmpzb24pLiBBZGRvbnMgY2FuIGJlIG5lc3RlZCAoaS5lLiBhbiBhZGRvbiBjYW4gaXRzZWxmIGRlcGVuZCBvbiBhbm90aGVyIGFkZG9uKS5cbiAqXG4gKiBFYWNoIGFkZG9uIGNhbiBiZSBjb21wb3NlZCBvZiBvbmUgb3Igc2V2ZXJhbCBvZiB0aGUgZm9sbG93aW5nIHBhcnRzOlxuICpcbiAqICAgKiBDb25maWdcbiAqICAgKiBJbml0aWFsaXplcnNcbiAqICAgKiBNaWRkbGV3YXJlXG4gKiAgICogQXBwIGNsYXNzZXNcbiAqICAgKiBSb3V0ZXNcbiAqXG4gKiAjIyBMb2FkIG9yZGVyXG4gKlxuICogQWZ0ZXIgRGVuYWxpIGRpc2NvdmVycyB0aGUgYXZhaWxhYmxlIGFkZG9ucywgaXQgdGhlbiBtZXJnZXMgdGhlbSB0byBmb3JtIGEgdW5pZmllZCBhcHBsaWNhdGlvbi5cbiAqIEFkZG9ucyBoaWdoZXIgaW4gdGhlIGRlcGVuZGVuY3kgdHJlZSB0YWtlIHByZWNlZGVuY2UsIGFuZCBzaWJsaW5nIGFkZG9ucyBjYW4gc3BlY2lmeSBsb2FkIG9yZGVyXG4gKiB2aWEgdGhlaXIgcGFja2FnZS5qc29uIGZpbGVzOlxuICpcbiAqICAgICBcImRlbmFsaVwiOiB7XG4gKiAgICAgICBcImJlZm9yZVwiOiBbIFwiYW5vdGhlci1hZGRvbi1uYW1lXCIgXSxcbiAqICAgICAgIFwiYWZ0ZXJcIjogWyBcImNvb2wtYWRkb24tbmFtZVwiIF1cbiAqICAgICB9XG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZG9uIGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogVGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgZm9yIHRoZSBhcHAsIGkuZS4gJ2RldmVsb3BtZW50J1xuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSByb290IGRpcmVjdG9yeSBvbiB0aGUgZmlsZXN5c3RlbSBmb3IgdGhpcyBhZGRvblxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGRpcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFja2FnZS5qc29uIGZvciB0aGlzIGFkZG9uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcGtnOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSByZXNvbHZlciBpbnN0YW5jZSB0byB1c2Ugd2l0aCB0aGlzIGFkZG9uLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHJlc29sdmVyOiBSZXNvbHZlcjtcblxuICAvKipcbiAgICogVGhlIGNvbnN1bWluZyBhcHBsaWNhdGlvbiBjb250YWluZXIgaW5zdGFuY2VcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBjb250YWluZXI6IENvbnRhaW5lcjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBZGRvbk9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXI7XG4gICAgdGhpcy5lbnZpcm9ubWVudCA9IG9wdGlvbnMuZW52aXJvbm1lbnQ7XG4gICAgdGhpcy5kaXIgPSBvcHRpb25zLmRpcjtcbiAgICB0aGlzLnBrZyA9IG9wdGlvbnMucGtnIHx8IHRyeVJlcXVpcmUoZmluZHVwKCdwYWNrYWdlLmpzb24nLCB7IGN3ZDogdGhpcy5kaXIgfSkpO1xuXG4gICAgdGhpcy5yZXNvbHZlciA9IHRoaXMucmVzb2x2ZXIgfHwgbmV3IFJlc29sdmVyKHRoaXMuZGlyKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRSZXNvbHZlcih0aGlzLnJlc29sdmVyKTtcbiAgICB0aGlzLmNvbnRhaW5lci5yZWdpc3RlcihgYWRkb246JHsgdGhpcy5wa2cubmFtZSB9QCR7IHRoaXMucGtnLnZlcnNpb24gfWAsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBhZGRvbi4gT3ZlcnJpZGUgdGhpcyB0byB1c2UgYSBkaWZmZXJlbnQgbmFtZSB0aGFuIHRoZSBwYWNrYWdlIG5hbWUgZm9yIHlvdXJcbiAgICogYWRkb24uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMucGtnICYmIHRoaXMucGtnLm5hbWUpIHx8ICdhbm9ueW1vdXMtYWRkb24nO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgaG9vayB0byBwZXJmb3JtIGFueSBzaHV0ZG93biBhY3Rpb25zIG5lY2Vzc2FyeSB0byBncmFjZWZ1bGx5IGV4aXQgdGhlIGFwcGxpY2F0aW9uLCBpLmUuIGNsb3NlXG4gICAqIGRhdGFiYXNlL3NvY2tldCBjb25uZWN0aW9ucy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBzaHV0ZG93bihhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBkZWZhdWx0cyB0byBub29wXG4gIH1cblxufVxuIl19