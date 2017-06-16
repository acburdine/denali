"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const path = require("path");
const fs = require("fs");
const tryRequire = require("try-require");
const inflection_1 = require("inflection");
const require_dir_1 = require("../utils/require-dir");
const assert = require("assert");
class Resolver {
    constructor(root) {
        /**
         * The internal cache of available references
         */
        this.registry = new Map();
        this.root = root;
    }
    /**
     * Manually add a member to this resolver. Manually registered members take precedence over any
     * retrieved from the filesystem.
     */
    register(specifier, value) {
        assert(specifier.includes(':'), 'Container specifiers must be in "type:entry" format');
        this.registry.set(specifier, value);
    }
    /**
     * Fetch the member matching the given parsedName. First checks for any manually registered
     * members, then falls back to type specific retrieve methods that typically find the matching
     * file on the filesystem.
     */
    retrieve(specifier) {
        assert(specifier.includes(':'), 'Container specifiers must be in "type:entry" format');
        let [type, entry] = specifier.split(':');
        if (this.registry.has(specifier)) {
            return this.registry.get(specifier);
        }
        let retrieveMethod = this[`retrieve${lodash_1.upperFirst(lodash_1.camelCase(type))}`];
        if (!retrieveMethod) {
            retrieveMethod = this.retrieveOther;
        }
        let result = retrieveMethod.call(this, type, entry);
        return result && result.default || result;
    }
    /**
     * Unknown types are assumed to exist underneath the `app/` folder
     */
    retrieveOther(type, entry) {
        return tryRequire(path.join(this.root, 'app', inflection_1.pluralize(type), entry));
    }
    /**
     * App files are found in `app/*`
     */
    retrieveApp(type, entry) {
        return tryRequire(path.join(this.root, 'app', entry));
    }
    /**
     * Config files are found in `config/`
     */
    retrieveConfig(type, entry) {
        return tryRequire(path.join(this.root, 'config', entry));
    }
    /**
     * Initializer files are found in `config/initializers/`
     */
    retrieveInitializer(type, entry) {
        return tryRequire(path.join(this.root, 'config', 'initializers', entry));
    }
    /**
     * Retrieve all the entries for a given type. First checks for all manual registrations matching
     * that type, then retrieves all members for that type (typically from the filesystem).
     */
    availableForType(type) {
        let registeredForType = [];
        this.registry.forEach((entry, specifier) => {
            if (specifier.split(':')[0] === type) {
                registeredForType.push(specifier);
            }
        });
        let availableMethod = this[`availableFor${lodash_1.upperFirst(lodash_1.camelCase(type))}`];
        if (!availableMethod) {
            availableMethod = this.availableForOther;
        }
        let entries = availableMethod.call(this, type);
        let resolvedEntries = entries.map((entry) => `${type}:${entry}`);
        return lodash_1.uniq(registeredForType.sort().concat(resolvedEntries.sort()));
    }
    /**
     * Unknown types are assumed to exist in the `app/` folder
     */
    availableForOther(type) {
        let typeDir = path.join(this.root, 'app', inflection_1.pluralize(type));
        if (fs.existsSync(typeDir)) {
            return Object.keys(require_dir_1.default(typeDir));
        }
        return [];
    }
    /**
     * App files are found in `app/*`
     */
    availableForApp(type, entry) {
        let appDir = path.join(this.root, 'app');
        if (fs.existsSync(appDir)) {
            return Object.keys(require_dir_1.default(appDir, { recurse: false }));
        }
        return [];
    }
    /**
     * Config files are found in the `config/` folder. Initializers are _not_ included in this group
     */
    availableForConfig(type) {
        let configDir = path.join(this.root, 'config');
        if (fs.existsSync(configDir)) {
            return Object.keys(require_dir_1.default(configDir)).filter((entry) => {
                return entry.startsWith('initializers');
            });
        }
        return [];
    }
    /**
     * Initializers files are found in the `config/initializers/` folder
     */
    availableForInitializer(type) {
        let initializersDir = path.join(this.root, 'config', 'initializers');
        if (fs.existsSync(initializersDir)) {
            return Object.keys(require_dir_1.default(initializersDir));
        }
        return [];
    }
}
exports.default = Resolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL21ldGFsL3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBSWdCO0FBQ2hCLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIsMENBQTBDO0FBQzFDLDJDQUF1QztBQUN2QyxzREFBOEM7QUFDOUMsaUNBQWlDO0FBWWpDO0lBY0UsWUFBWSxJQUFZO1FBTHhCOztXQUVHO1FBQ0ssYUFBUSxHQUFhLElBQUksR0FBRyxFQUFFLENBQUM7UUFHckMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxTQUFpQixFQUFFLEtBQVU7UUFDcEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUscURBQXFELENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsU0FBaUI7UUFDeEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUscURBQXFELENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUUsSUFBSSxFQUFFLEtBQUssQ0FBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsSUFBSSxjQUFjLEdBQW1CLElBQUksQ0FBQyxXQUFZLG1C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LElBQVk7UUFDNUMsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNyRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNELE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDWixDQUFDO0NBRUY7QUE1SUQsMkJBNElDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgY2FtZWxDYXNlLFxuICB1cHBlckZpcnN0LFxuICB1bmlxXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgdHJ5UmVxdWlyZSBmcm9tICd0cnktcmVxdWlyZSc7XG5pbXBvcnQgeyBwbHVyYWxpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCByZXF1aXJlRGlyIGZyb20gJy4uL3V0aWxzL3JlcXVpcmUtZGlyJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5pbnRlcmZhY2UgUmV0cmlldmVNZXRob2Qge1xuICAodHlwZTogc3RyaW5nLCBlbnRyeTogc3RyaW5nKTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEF2YWlsYWJsZUZvclR5cGVNZXRob2Qge1xuICAodHlwZTogc3RyaW5nKTogeyBbbW9kdWxlUGF0aDogc3RyaW5nXTogYW55IH07XG59XG5cbmV4cG9ydCB0eXBlIFJlZ2lzdHJ5ID0gTWFwPHN0cmluZywgYW55PjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzb2x2ZXIge1xuXG4gIFtrZXk6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogVGhlIHJvb3QgZGlyZWN0b3J5IGZvciB0aGlzIHJlc29sdmVyIHRvIHN0YXJ0IGZyb20gd2hlbiBzZWFyY2hpbmcgZm9yIGZpbGVzXG4gICAqL1xuICByb290OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRlcm5hbCBjYWNoZSBvZiBhdmFpbGFibGUgcmVmZXJlbmNlc1xuICAgKi9cbiAgcHJpdmF0ZSByZWdpc3RyeTogUmVnaXN0cnkgPSBuZXcgTWFwKCk7XG5cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5yb290ID0gcm9vdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYW51YWxseSBhZGQgYSBtZW1iZXIgdG8gdGhpcyByZXNvbHZlci4gTWFudWFsbHkgcmVnaXN0ZXJlZCBtZW1iZXJzIHRha2UgcHJlY2VkZW5jZSBvdmVyIGFueVxuICAgKiByZXRyaWV2ZWQgZnJvbSB0aGUgZmlsZXN5c3RlbS5cbiAgICovXG4gIHJlZ2lzdGVyKHNwZWNpZmllcjogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgYXNzZXJ0KHNwZWNpZmllci5pbmNsdWRlcygnOicpLCAnQ29udGFpbmVyIHNwZWNpZmllcnMgbXVzdCBiZSBpbiBcInR5cGU6ZW50cnlcIiBmb3JtYXQnKTtcbiAgICB0aGlzLnJlZ2lzdHJ5LnNldChzcGVjaWZpZXIsIHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCB0aGUgbWVtYmVyIG1hdGNoaW5nIHRoZSBnaXZlbiBwYXJzZWROYW1lLiBGaXJzdCBjaGVja3MgZm9yIGFueSBtYW51YWxseSByZWdpc3RlcmVkXG4gICAqIG1lbWJlcnMsIHRoZW4gZmFsbHMgYmFjayB0byB0eXBlIHNwZWNpZmljIHJldHJpZXZlIG1ldGhvZHMgdGhhdCB0eXBpY2FsbHkgZmluZCB0aGUgbWF0Y2hpbmdcbiAgICogZmlsZSBvbiB0aGUgZmlsZXN5c3RlbS5cbiAgICovXG4gIHJldHJpZXZlKHNwZWNpZmllcjogc3RyaW5nKSB7XG4gICAgYXNzZXJ0KHNwZWNpZmllci5pbmNsdWRlcygnOicpLCAnQ29udGFpbmVyIHNwZWNpZmllcnMgbXVzdCBiZSBpbiBcInR5cGU6ZW50cnlcIiBmb3JtYXQnKTtcbiAgICBsZXQgWyB0eXBlLCBlbnRyeSBdID0gc3BlY2lmaWVyLnNwbGl0KCc6Jyk7XG4gICAgaWYgKHRoaXMucmVnaXN0cnkuaGFzKHNwZWNpZmllcikpIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdldChzcGVjaWZpZXIpO1xuICAgIH1cbiAgICBsZXQgcmV0cmlldmVNZXRob2QgPSA8UmV0cmlldmVNZXRob2Q+dGhpc1tgcmV0cmlldmUkeyB1cHBlckZpcnN0KGNhbWVsQ2FzZSh0eXBlKSkgfWBdO1xuICAgIGlmICghcmV0cmlldmVNZXRob2QpIHtcbiAgICAgIHJldHJpZXZlTWV0aG9kID0gdGhpcy5yZXRyaWV2ZU90aGVyO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gcmV0cmlldmVNZXRob2QuY2FsbCh0aGlzLCB0eXBlLCBlbnRyeSk7XG4gICAgcmV0dXJuIHJlc3VsdCAmJiByZXN1bHQuZGVmYXVsdCB8fCByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogVW5rbm93biB0eXBlcyBhcmUgYXNzdW1lZCB0byBleGlzdCB1bmRlcm5lYXRoIHRoZSBgYXBwL2AgZm9sZGVyXG4gICAqL1xuICBwcm90ZWN0ZWQgcmV0cmlldmVPdGhlcih0eXBlOiBzdHJpbmcsIGVudHJ5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdHJ5UmVxdWlyZShwYXRoLmpvaW4odGhpcy5yb290LCAnYXBwJywgcGx1cmFsaXplKHR5cGUpLCBlbnRyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcCBmaWxlcyBhcmUgZm91bmQgaW4gYGFwcC8qYFxuICAgKi9cbiAgcHJvdGVjdGVkIHJldHJpZXZlQXBwKHR5cGU6IHN0cmluZywgZW50cnk6IHN0cmluZykge1xuICAgIHJldHVybiB0cnlSZXF1aXJlKHBhdGguam9pbih0aGlzLnJvb3QsICdhcHAnLCBlbnRyeSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbmZpZyBmaWxlcyBhcmUgZm91bmQgaW4gYGNvbmZpZy9gXG4gICAqL1xuICBwcm90ZWN0ZWQgcmV0cmlldmVDb25maWcodHlwZTogc3RyaW5nLCBlbnRyeTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRyeVJlcXVpcmUocGF0aC5qb2luKHRoaXMucm9vdCwgJ2NvbmZpZycsIGVudHJ5KSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXIgZmlsZXMgYXJlIGZvdW5kIGluIGBjb25maWcvaW5pdGlhbGl6ZXJzL2BcbiAgICovXG4gIHByb3RlY3RlZCByZXRyaWV2ZUluaXRpYWxpemVyKHR5cGU6IHN0cmluZywgZW50cnk6IHN0cmluZykge1xuICAgIHJldHVybiB0cnlSZXF1aXJlKHBhdGguam9pbih0aGlzLnJvb3QsICdjb25maWcnLCAnaW5pdGlhbGl6ZXJzJywgZW50cnkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhbGwgdGhlIGVudHJpZXMgZm9yIGEgZ2l2ZW4gdHlwZS4gRmlyc3QgY2hlY2tzIGZvciBhbGwgbWFudWFsIHJlZ2lzdHJhdGlvbnMgbWF0Y2hpbmdcbiAgICogdGhhdCB0eXBlLCB0aGVuIHJldHJpZXZlcyBhbGwgbWVtYmVycyBmb3IgdGhhdCB0eXBlICh0eXBpY2FsbHkgZnJvbSB0aGUgZmlsZXN5c3RlbSkuXG4gICAqL1xuICBhdmFpbGFibGVGb3JUeXBlKHR5cGU6IHN0cmluZykge1xuICAgIGxldCByZWdpc3RlcmVkRm9yVHlwZTogc3RyaW5nW10gPSBbXTtcbiAgICB0aGlzLnJlZ2lzdHJ5LmZvckVhY2goKGVudHJ5LCBzcGVjaWZpZXIpID0+IHtcbiAgICAgIGlmIChzcGVjaWZpZXIuc3BsaXQoJzonKVswXSA9PT0gdHlwZSkge1xuICAgICAgICByZWdpc3RlcmVkRm9yVHlwZS5wdXNoKHNwZWNpZmllcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IGF2YWlsYWJsZU1ldGhvZCA9IDxBdmFpbGFibGVGb3JUeXBlTWV0aG9kPnRoaXNbYGF2YWlsYWJsZUZvciR7IHVwcGVyRmlyc3QoY2FtZWxDYXNlKHR5cGUpKSB9YF07XG4gICAgaWYgKCFhdmFpbGFibGVNZXRob2QpIHtcbiAgICAgIGF2YWlsYWJsZU1ldGhvZCA9IHRoaXMuYXZhaWxhYmxlRm9yT3RoZXI7XG4gICAgfVxuICAgIGxldCBlbnRyaWVzID0gPHN0cmluZ1tdPmF2YWlsYWJsZU1ldGhvZC5jYWxsKHRoaXMsIHR5cGUpO1xuICAgIGxldCByZXNvbHZlZEVudHJpZXMgPSBlbnRyaWVzLm1hcCgoZW50cnkpID0+IGAkeyB0eXBlIH06JHsgZW50cnkgfWApO1xuICAgIHJldHVybiB1bmlxKHJlZ2lzdGVyZWRGb3JUeXBlLnNvcnQoKS5jb25jYXQocmVzb2x2ZWRFbnRyaWVzLnNvcnQoKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVua25vd24gdHlwZXMgYXJlIGFzc3VtZWQgdG8gZXhpc3QgaW4gdGhlIGBhcHAvYCBmb2xkZXJcbiAgICovXG4gIHByb3RlY3RlZCBhdmFpbGFibGVGb3JPdGhlcih0eXBlOiBzdHJpbmcpIHtcbiAgICBsZXQgdHlwZURpciA9IHBhdGguam9pbih0aGlzLnJvb3QsICdhcHAnLCBwbHVyYWxpemUodHlwZSkpO1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHR5cGVEaXIpKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVxdWlyZURpcih0eXBlRGlyKSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHAgZmlsZXMgYXJlIGZvdW5kIGluIGBhcHAvKmBcbiAgICovXG4gIHByb3RlY3RlZCBhdmFpbGFibGVGb3JBcHAodHlwZTogc3RyaW5nLCBlbnRyeTogc3RyaW5nKSB7XG4gICAgbGV0IGFwcERpciA9IHBhdGguam9pbih0aGlzLnJvb3QsICdhcHAnKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhhcHBEaXIpKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVxdWlyZURpcihhcHBEaXIsIHsgcmVjdXJzZTogZmFsc2UgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogQ29uZmlnIGZpbGVzIGFyZSBmb3VuZCBpbiB0aGUgYGNvbmZpZy9gIGZvbGRlci4gSW5pdGlhbGl6ZXJzIGFyZSBfbm90XyBpbmNsdWRlZCBpbiB0aGlzIGdyb3VwXG4gICAqL1xuICBwcm90ZWN0ZWQgYXZhaWxhYmxlRm9yQ29uZmlnKHR5cGU6IHN0cmluZykge1xuICAgIGxldCBjb25maWdEaXIgPSBwYXRoLmpvaW4odGhpcy5yb290LCAnY29uZmlnJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoY29uZmlnRGlyKSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcXVpcmVEaXIoY29uZmlnRGlyKSkuZmlsdGVyKChlbnRyeSkgPT4ge1xuICAgICAgICByZXR1cm4gZW50cnkuc3RhcnRzV2l0aCgnaW5pdGlhbGl6ZXJzJyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVycyBmaWxlcyBhcmUgZm91bmQgaW4gdGhlIGBjb25maWcvaW5pdGlhbGl6ZXJzL2AgZm9sZGVyXG4gICAqL1xuICBwcm90ZWN0ZWQgYXZhaWxhYmxlRm9ySW5pdGlhbGl6ZXIodHlwZTogc3RyaW5nKSB7XG4gICAgbGV0IGluaXRpYWxpemVyc0RpciA9IHBhdGguam9pbih0aGlzLnJvb3QsICdjb25maWcnLCAnaW5pdGlhbGl6ZXJzJyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoaW5pdGlhbGl6ZXJzRGlyKSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlcXVpcmVEaXIoaW5pdGlhbGl6ZXJzRGlyKSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG59XG4iXX0=