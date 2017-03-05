"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const object_1 = require("../metal/object");
/**
 * The Container houses all the various classes that makeup a Denali app's
 *
 * runtime. It holds references to the modules themselves, as well as managing lookup logic (i.e.
 * some types of classes fall back to a generic "application" class if a more specific one is not
 * found.
 *
 * @package runtime
 * @since 0.1.0
 */
class Container extends object_1.default {
    constructor() {
        super(...arguments);
        /**
         * An internal cache of lookups and their resolved values
         */
        this._cache = {};
        /**
         * The internal cache of available references
         */
        this._registry = {};
    }
    /**
     * A reference to the application config
     *
     * @since 0.1.0
     */
    get config() {
        return this.lookup('config:environment');
    }
    /**
     * A reference to the application logger
     *
     * @since 0.1.0
     */
    get logger() {
        return this.lookup('logger:main');
    }
    /**
     * Register a value under the given `fullName` for later use.
     *
     * @since 0.1.0
     */
    register(name, value) {
        let parsedName = this.parseName(name);
        this._registry[parsedName.fullName] = value;
    }
    /**
     * Lookup a value in the container. Uses type specific lookup logic if available.
     *
     * @since 0.1.0
     */
    lookup(name) {
        let parsedName = this.parseName(name);
        let lookupMethod = this[`lookup${lodash_1.upperFirst(lodash_1.camelCase(parsedName.type))}`] || this._lookupOther;
        return lookupMethod.call(this, parsedName);
    }
    /**
     * Lookup all modules of a specific type in the container. Returns an object of all the modules
     * keyed by their module path (i.e. `role:employees/manager` would be found under
     * `lookupAll('role')['employees/manager']`
     *
     * @since 0.1.0
     */
    lookupAll(type) {
        return lodash_1.keys(this._registry).filter((fullName) => {
            return this.parseName(fullName).type === type;
        }).reduce((typeMap, fullName) => {
            typeMap[this.parseName(fullName).modulePath] = this.lookup(fullName);
            return typeMap;
        }, {});
    }
    /**
     * The base lookup method that most other lookup methods delegate to. Attempts to lookup a cached
     * resolution for the parsedName provided. If none is found, performs the lookup and caches it
     * for future retrieval
     */
    _lookupOther(parsedName, options = { containerize: false, singleton: false }) {
        // Cache all this containerization / singleton instantiation, etc
        if (!this._cache[parsedName.fullName]) {
            let Class = this._registry[parsedName.fullName];
            // If lookup succeeded, handle any first-time lookup chores
            if (Class) {
                if (Class.containerize || options.containerize) {
                    Class.container = this;
                    Class.prototype.container = this;
                }
                if (Class.singleton || options.singleton) {
                    Class = new Class();
                }
                // If the lookup failed, allow for a fallback
            }
            else if (options.fallback) {
                let fallback = result(options.fallback);
                let fallbackOptions = lodash_1.merge(options, {
                    fallback: null,
                    original: parsedName
                });
                Class = this._lookupOther(this.parseName(fallback), fallbackOptions);
                // If the lookup and fallback failed, bail
            }
            else {
                let message = `No such ${parsedName.type} found: '${parsedName.moduleName}'`;
                if (options.original) {
                    message += `. Fallback lookup '${options.original.fullName}' was also not found.`;
                }
                message += `\nAvailable "${parsedName.type}" container entries:\n`;
                message += Object.keys(this.lookupAll(parsedName.type));
                throw new Error(message);
            }
            // Update the cache with either the successful lookup, or the fallback
            this._cache[parsedName.fullName] = Class;
        }
        return this._cache[parsedName.fullName];
    }
    /**
     * Lookup an ORM adapter. If not found, falls back to the application ORM adapter as determined
     * by the `ormAdapter` config property.
     */
    lookupOrmAdapter(parsedName) {
        return this._lookupOther(parsedName, {
            fallback: () => {
                if (!this.config.ormAdapter) {
                    throw new Error('No default ORM adapter was defined in supplied in config.ormAdapter!');
                }
                return `orm-adapter:${this.config.ormAdapter}`;
            }
        });
    }
    /**
     * Lookup a serializer. Falls back to the application serializer if not found.
     */
    lookupSerializer(parsedName) {
        return this._lookupOther(parsedName, {
            fallback: 'serializer:application'
        });
    }
    /**
     * Take the supplied name which can come in several forms, and normalize it.
     */
    parseName(name) {
        let [type, modulePath] = name.split(':');
        if (modulePath === undefined || modulePath === 'undefined') {
            throw new Error(`You tried to look up a ${type} called undefined - did you pass in a variable that doesn't have the expected value?`);
        }
        return {
            fullName: name,
            type,
            modulePath,
            moduleName: lodash_1.camelCase(modulePath)
        };
    }
    /**
     * For a given type, returns the names of all the available modules under that
     * type. Primarily used for debugging purposes (i.e. to show available modules
     * when a lookup of that type fails).
     */
    availableForType(type) {
        return Object.keys(this._registry).filter((key) => {
            return key.split(':')[0] === type;
        }).map((key) => {
            return key.split(':')[1];
        });
    }
}
exports.default = Container;
/**
 * If the value is a function, execute it and return the value, otherwise, return the value itself.
 */
function result(value) {
    if (typeof value === 'function') {
        return value();
    }
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL2NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQU1nQjtBQUNoQiw0Q0FBMkM7QUErQjNDOzs7Ozs7Ozs7R0FTRztBQUNILGVBQStCLFNBQVEsZ0JBQVk7SUFBbkQ7O1FBRUU7O1dBRUc7UUFDSyxXQUFNLEdBQW1CLEVBQUUsQ0FBQztRQUVwQzs7V0FFRztRQUNLLGNBQVMsR0FBbUIsRUFBRSxDQUFDO0lBNkp6QyxDQUFDO0lBM0pDOzs7O09BSUc7SUFDSCxJQUFXLE1BQU07UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBVyxNQUFNO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxRQUFRLENBQUMsSUFBWSxFQUFFLEtBQVU7UUFDdEMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsSUFBWTtRQUN4QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFVLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNsRyxNQUFNLENBQUMsWUFBWSxDQUFD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RUFBRSxrQkFBUyxDQUFDLFVBQVUsQ0FBQztTQUNsQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxJQUFZO1FBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHO1lBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO1lBQ1QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF2S0QsNEJBdUtDO0FBR0Q7O0dBRUc7QUFDSCxnQkFBZ0IsS0FBVTtJQUN4QixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBmaW5kS2V5LFxuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2UsXG4gIGtleXMsXG4gIG1lcmdlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9kYXRhL21vZGVsJztcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4uL2RhdGEvc2VyaWFsaXplcic7XG5pbXBvcnQgT3JtQWRhcHRlciBmcm9tICcuLi9kYXRhL29ybS1hZGFwdGVyJztcbmltcG9ydCBTZXJ2aWNlIGZyb20gJy4vc2VydmljZSc7XG5cbmludGVyZmFjZSBQYXJzZWROYW1lIHtcbiAgZnVsbE5hbWU6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuICBtb2R1bGVQYXRoOiBzdHJpbmc7XG4gIG1vZHVsZU5hbWU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEZhbGxiYWNrR2V0dGVyIHtcbiAgKCk6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIExvb2t1cE9wdGlvbnMge1xuICBjb250YWluZXJpemU/OiBib29sZWFuO1xuICBzaW5nbGV0b24/OiBib29sZWFuO1xuICBmYWxsYmFjaz86IHN0cmluZyB8IEZhbGxiYWNrR2V0dGVyO1xuICBvcmlnaW5hbD86IFBhcnNlZE5hbWU7XG59XG5cbmludGVyZmFjZSBNb2R1bGVSZWdpc3RyeSB7XG4gIFttb2R1bGVOYW1lOiBzdHJpbmddOiBhbnk7XG59XG5cbnR5cGUgQ29uc3RydWN0b3I8VD4gPSBuZXcoLi4uYXJnczogYW55W10pID0+IFQ7XG5cbi8qKlxuICogVGhlIENvbnRhaW5lciBob3VzZXMgYWxsIHRoZSB2YXJpb3VzIGNsYXNzZXMgdGhhdCBtYWtldXAgYSBEZW5hbGkgYXBwJ3NcbiAqXG4gKiBydW50aW1lLiBJdCBob2xkcyByZWZlcmVuY2VzIHRvIHRoZSBtb2R1bGVzIHRoZW1zZWx2ZXMsIGFzIHdlbGwgYXMgbWFuYWdpbmcgbG9va3VwIGxvZ2ljIChpLmUuXG4gKiBzb21lIHR5cGVzIG9mIGNsYXNzZXMgZmFsbCBiYWNrIHRvIGEgZ2VuZXJpYyBcImFwcGxpY2F0aW9uXCIgY2xhc3MgaWYgYSBtb3JlIHNwZWNpZmljIG9uZSBpcyBub3RcbiAqIGZvdW5kLlxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBBbiBpbnRlcm5hbCBjYWNoZSBvZiBsb29rdXBzIGFuZCB0aGVpciByZXNvbHZlZCB2YWx1ZXNcbiAgICovXG4gIHByaXZhdGUgX2NhY2hlOiBNb2R1bGVSZWdpc3RyeSA9IHt9O1xuXG4gIC8qKlxuICAgKiBUaGUgaW50ZXJuYWwgY2FjaGUgb2YgYXZhaWxhYmxlIHJlZmVyZW5jZXNcbiAgICovXG4gIHByaXZhdGUgX3JlZ2lzdHJ5OiBNb2R1bGVSZWdpc3RyeSA9IHt9O1xuXG4gIC8qKlxuICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgYXBwbGljYXRpb24gY29uZmlnXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGdldCBjb25maWcoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5sb29rdXAoJ2NvbmZpZzplbnZpcm9ubWVudCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBhcHBsaWNhdGlvbiBsb2dnZXJcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvZ2dlcigpOiBMb2dnZXIge1xuICAgIHJldHVybiB0aGlzLmxvb2t1cCgnbG9nZ2VyOm1haW4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHZhbHVlIHVuZGVyIHRoZSBnaXZlbiBgZnVsbE5hbWVgIGZvciBsYXRlciB1c2UuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyKG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGxldCBwYXJzZWROYW1lID0gdGhpcy5wYXJzZU5hbWUobmFtZSk7XG4gICAgdGhpcy5fcmVnaXN0cnlbcGFyc2VkTmFtZS5mdWxsTmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYSB2YWx1ZSBpbiB0aGUgY29udGFpbmVyLiBVc2VzIHR5cGUgc3BlY2lmaWMgbG9va3VwIGxvZ2ljIGlmIGF2YWlsYWJsZS5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgbG9va3VwKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IHBhcnNlZE5hbWUgPSB0aGlzLnBhcnNlTmFtZShuYW1lKTtcbiAgICBsZXQgbG9va3VwTWV0aG9kID0gdGhpc1tgbG9va3VwJHsgdXBwZXJGaXJzdChjYW1lbENhc2UocGFyc2VkTmFtZS50eXBlKSkgfWBdIHx8IHRoaXMuX2xvb2t1cE90aGVyO1xuICAgIHJldHVybiBsb29rdXBNZXRob2QuY2FsbCh0aGlzLCBwYXJzZWROYW1lKTtcbiAgfVxuXG4gIFtrZXk6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogTG9va3VwIGFsbCBtb2R1bGVzIG9mIGEgc3BlY2lmaWMgdHlwZSBpbiB0aGUgY29udGFpbmVyLiBSZXR1cm5zIGFuIG9iamVjdCBvZiBhbGwgdGhlIG1vZHVsZXNcbiAgICoga2V5ZWQgYnkgdGhlaXIgbW9kdWxlIHBhdGggKGkuZS4gYHJvbGU6ZW1wbG95ZWVzL21hbmFnZXJgIHdvdWxkIGJlIGZvdW5kIHVuZGVyXG4gICAqIGBsb29rdXBBbGwoJ3JvbGUnKVsnZW1wbG95ZWVzL21hbmFnZXInXWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgbG9va3VwQWxsKHR5cGU6IHN0cmluZyk6IHsgW21vZHVsZU5hbWU6IHN0cmluZ106IGFueSB9IHtcbiAgICByZXR1cm4ga2V5cyh0aGlzLl9yZWdpc3RyeSkuZmlsdGVyKChmdWxsTmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VOYW1lKGZ1bGxOYW1lKS50eXBlID09PSB0eXBlO1xuICAgIH0pLnJlZHVjZSgodHlwZU1hcDogTW9kdWxlUmVnaXN0cnksIGZ1bGxOYW1lKSA9PiB7XG4gICAgICB0eXBlTWFwW3RoaXMucGFyc2VOYW1lKGZ1bGxOYW1lKS5tb2R1bGVQYXRoXSA9IHRoaXMubG9va3VwKGZ1bGxOYW1lKTtcbiAgICAgIHJldHVybiB0eXBlTWFwO1xuICAgIH0sIHt9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYmFzZSBsb29rdXAgbWV0aG9kIHRoYXQgbW9zdCBvdGhlciBsb29rdXAgbWV0aG9kcyBkZWxlZ2F0ZSB0by4gQXR0ZW1wdHMgdG8gbG9va3VwIGEgY2FjaGVkXG4gICAqIHJlc29sdXRpb24gZm9yIHRoZSBwYXJzZWROYW1lIHByb3ZpZGVkLiBJZiBub25lIGlzIGZvdW5kLCBwZXJmb3JtcyB0aGUgbG9va3VwIGFuZCBjYWNoZXMgaXRcbiAgICogZm9yIGZ1dHVyZSByZXRyaWV2YWxcbiAgICovXG4gIHByaXZhdGUgX2xvb2t1cE90aGVyKHBhcnNlZE5hbWU6IFBhcnNlZE5hbWUsIG9wdGlvbnM6IExvb2t1cE9wdGlvbnMgPSB7IGNvbnRhaW5lcml6ZTogZmFsc2UsIHNpbmdsZXRvbjogZmFsc2UgfSkge1xuICAgIC8vIENhY2hlIGFsbCB0aGlzIGNvbnRhaW5lcml6YXRpb24gLyBzaW5nbGV0b24gaW5zdGFudGlhdGlvbiwgZXRjXG4gICAgaWYgKCF0aGlzLl9jYWNoZVtwYXJzZWROYW1lLmZ1bGxOYW1lXSkge1xuICAgICAgbGV0IENsYXNzID0gdGhpcy5fcmVnaXN0cnlbcGFyc2VkTmFtZS5mdWxsTmFtZV07XG5cbiAgICAgIC8vIElmIGxvb2t1cCBzdWNjZWVkZWQsIGhhbmRsZSBhbnkgZmlyc3QtdGltZSBsb29rdXAgY2hvcmVzXG4gICAgICBpZiAoQ2xhc3MpIHtcbiAgICAgICAgaWYgKENsYXNzLmNvbnRhaW5lcml6ZSB8fCBvcHRpb25zLmNvbnRhaW5lcml6ZSkge1xuICAgICAgICAgIENsYXNzLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgICAgQ2xhc3MucHJvdG90eXBlLmNvbnRhaW5lciA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKENsYXNzLnNpbmdsZXRvbiB8fCBvcHRpb25zLnNpbmdsZXRvbikge1xuICAgICAgICAgIENsYXNzID0gbmV3IENsYXNzKCk7XG4gICAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGxvb2t1cCBmYWlsZWQsIGFsbG93IGZvciBhIGZhbGxiYWNrXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZmFsbGJhY2spIHtcbiAgICAgICAgbGV0IGZhbGxiYWNrID0gcmVzdWx0KG9wdGlvbnMuZmFsbGJhY2spO1xuICAgICAgICBsZXQgZmFsbGJhY2tPcHRpb25zID0gbWVyZ2Uob3B0aW9ucywge1xuICAgICAgICAgIGZhbGxiYWNrOiBudWxsLFxuICAgICAgICAgIG9yaWdpbmFsOiBwYXJzZWROYW1lXG4gICAgICAgIH0pO1xuICAgICAgICBDbGFzcyA9IHRoaXMuX2xvb2t1cE90aGVyKHRoaXMucGFyc2VOYW1lKGZhbGxiYWNrKSwgZmFsbGJhY2tPcHRpb25zKTtcblxuICAgICAgLy8gSWYgdGhlIGxvb2t1cCBhbmQgZmFsbGJhY2sgZmFpbGVkLCBiYWlsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgbWVzc2FnZSA9IGBObyBzdWNoICR7IHBhcnNlZE5hbWUudHlwZSB9IGZvdW5kOiAnJHsgcGFyc2VkTmFtZS5tb2R1bGVOYW1lIH0nYDtcbiAgICAgICAgaWYgKG9wdGlvbnMub3JpZ2luYWwpIHtcbiAgICAgICAgICBtZXNzYWdlICs9IGAuIEZhbGxiYWNrIGxvb2t1cCAnJHsgb3B0aW9ucy5vcmlnaW5hbC5mdWxsTmFtZSB9JyB3YXMgYWxzbyBub3QgZm91bmQuYDtcbiAgICAgICAgfVxuICAgICAgICBtZXNzYWdlICs9IGBcXG5BdmFpbGFibGUgXCIkeyBwYXJzZWROYW1lLnR5cGUgfVwiIGNvbnRhaW5lciBlbnRyaWVzOlxcbmA7XG4gICAgICAgIG1lc3NhZ2UgKz0gT2JqZWN0LmtleXModGhpcy5sb29rdXBBbGwocGFyc2VkTmFtZS50eXBlKSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHRoZSBjYWNoZSB3aXRoIGVpdGhlciB0aGUgc3VjY2Vzc2Z1bCBsb29rdXAsIG9yIHRoZSBmYWxsYmFja1xuICAgICAgdGhpcy5fY2FjaGVbcGFyc2VkTmFtZS5mdWxsTmFtZV0gPSBDbGFzcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlW3BhcnNlZE5hbWUuZnVsbE5hbWVdO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2t1cCBhbiBPUk0gYWRhcHRlci4gSWYgbm90IGZvdW5kLCBmYWxscyBiYWNrIHRvIHRoZSBhcHBsaWNhdGlvbiBPUk0gYWRhcHRlciBhcyBkZXRlcm1pbmVkXG4gICAqIGJ5IHRoZSBgb3JtQWRhcHRlcmAgY29uZmlnIHByb3BlcnR5LlxuICAgKi9cbiAgcHJpdmF0ZSBsb29rdXBPcm1BZGFwdGVyKHBhcnNlZE5hbWU6IFBhcnNlZE5hbWUpOiBPcm1BZGFwdGVyIHtcbiAgICByZXR1cm4gdGhpcy5fbG9va3VwT3RoZXIocGFyc2VkTmFtZSwge1xuICAgICAgZmFsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5vcm1BZGFwdGVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkZWZhdWx0IE9STSBhZGFwdGVyIHdhcyBkZWZpbmVkIGluIHN1cHBsaWVkIGluIGNvbmZpZy5vcm1BZGFwdGVyIScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBgb3JtLWFkYXB0ZXI6JHsgdGhpcy5jb25maWcub3JtQWRhcHRlciB9YDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYSBzZXJpYWxpemVyLiBGYWxscyBiYWNrIHRvIHRoZSBhcHBsaWNhdGlvbiBzZXJpYWxpemVyIGlmIG5vdCBmb3VuZC5cbiAgICovXG4gIHByaXZhdGUgbG9va3VwU2VyaWFsaXplcihwYXJzZWROYW1lOiBQYXJzZWROYW1lKTogU2VyaWFsaXplciB7XG4gICAgcmV0dXJuIHRoaXMuX2xvb2t1cE90aGVyKHBhcnNlZE5hbWUsIHtcbiAgICAgIGZhbGxiYWNrOiAnc2VyaWFsaXplcjphcHBsaWNhdGlvbidcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIHRoZSBzdXBwbGllZCBuYW1lIHdoaWNoIGNhbiBjb21lIGluIHNldmVyYWwgZm9ybXMsIGFuZCBub3JtYWxpemUgaXQuXG4gICAqL1xuICBwcml2YXRlIHBhcnNlTmFtZShuYW1lOiBzdHJpbmcpOiBQYXJzZWROYW1lIHtcbiAgICBsZXQgWyB0eXBlLCBtb2R1bGVQYXRoIF0gPSBuYW1lLnNwbGl0KCc6Jyk7XG4gICAgaWYgKG1vZHVsZVBhdGggPT09IHVuZGVmaW5lZCB8fCBtb2R1bGVQYXRoID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBZb3UgdHJpZWQgdG8gbG9vayB1cCBhICR7IHR5cGUgfSBjYWxsZWQgdW5kZWZpbmVkIC0gZGlkIHlvdSBwYXNzIGluIGEgdmFyaWFibGUgdGhhdCBkb2Vzbid0IGhhdmUgdGhlIGV4cGVjdGVkIHZhbHVlP2ApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZnVsbE5hbWU6IG5hbWUsXG4gICAgICB0eXBlLFxuICAgICAgbW9kdWxlUGF0aCxcbiAgICAgIG1vZHVsZU5hbWU6IGNhbWVsQ2FzZShtb2R1bGVQYXRoKVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRm9yIGEgZ2l2ZW4gdHlwZSwgcmV0dXJucyB0aGUgbmFtZXMgb2YgYWxsIHRoZSBhdmFpbGFibGUgbW9kdWxlcyB1bmRlciB0aGF0XG4gICAqIHR5cGUuIFByaW1hcmlseSB1c2VkIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMgKGkuZS4gdG8gc2hvdyBhdmFpbGFibGUgbW9kdWxlc1xuICAgKiB3aGVuIGEgbG9va3VwIG9mIHRoYXQgdHlwZSBmYWlscykuXG4gICAqL1xuICBhdmFpbGFibGVGb3JUeXBlKHR5cGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5fcmVnaXN0cnkpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICByZXR1cm4ga2V5LnNwbGl0KCc6JylbMF0gPT09IHR5cGU7XG4gICAgfSkubWFwKChrZXkpID0+IHtcbiAgICAgIHJldHVybiBrZXkuc3BsaXQoJzonKVsxXTtcbiAgICB9KTtcbiAgfVxufVxuXG5cbi8qKlxuICogSWYgdGhlIHZhbHVlIGlzIGEgZnVuY3Rpb24sIGV4ZWN1dGUgaXQgYW5kIHJldHVybiB0aGUgdmFsdWUsIG90aGVyd2lzZSwgcmV0dXJuIHRoZSB2YWx1ZSBpdHNlbGYuXG4gKi9cbmZ1bmN0aW9uIHJlc3VsdCh2YWx1ZTogYW55KTogYW55IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB2YWx1ZSgpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cbiJdfQ==