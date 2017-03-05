"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const walk = require("walk-sync");
/**
 * Recursively require every .js file in a directory. Returns an object whose keys are the filepaths
 * of the loaded modules (relative to the given directory). Handles modules with default exports
 * (the default export will be the returned module value).
 *
 * @package util
 */
function requireDir(dirpath, options = {}) {
    let modules = {};
    let paths;
    if (options.recurse === false) {
        paths = fs.readdirSync(dirpath);
    }
    else {
        paths = walk(dirpath);
    }
    paths.forEach((filepath) => {
        let absolutepath = path.join(dirpath, filepath);
        if (fs.statSync(absolutepath).isFile() && /\.js$/.test(filepath)) {
            let moduleName = filepath.slice(0, filepath.length - 3);
            let mod = require(absolutepath);
            modules[moduleName] = mod.default || mod;
        }
    });
    return modules;
}
exports.default = requireDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZS1kaXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL3JlcXVpcmUtZGlyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixrQ0FBa0M7QUFFbEM7Ozs7OztHQU1HO0FBQ0gsb0JBQW1DLE9BQWUsRUFBRSxVQUErQixFQUFFO0lBQ25GLElBQUksT0FBTyxHQUFrQyxFQUFFLENBQUM7SUFDaEQsSUFBSSxLQUFLLENBQUM7SUFDVixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUIsS0FBSyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sS0FBSyxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVE7UUFDckIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEQsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUM7UUFDM0MsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBakJELDZCQWlCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB3YWxrIGZyb20gJ3dhbGstc3luYyc7XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgcmVxdWlyZSBldmVyeSAuanMgZmlsZSBpbiBhIGRpcmVjdG9yeS4gUmV0dXJucyBhbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgdGhlIGZpbGVwYXRoc1xuICogb2YgdGhlIGxvYWRlZCBtb2R1bGVzIChyZWxhdGl2ZSB0byB0aGUgZ2l2ZW4gZGlyZWN0b3J5KS4gSGFuZGxlcyBtb2R1bGVzIHdpdGggZGVmYXVsdCBleHBvcnRzXG4gKiAodGhlIGRlZmF1bHQgZXhwb3J0IHdpbGwgYmUgdGhlIHJldHVybmVkIG1vZHVsZSB2YWx1ZSkuXG4gKlxuICogQHBhY2thZ2UgdXRpbFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXF1aXJlRGlyKGRpcnBhdGg6IHN0cmluZywgb3B0aW9uczogeyByZWN1cnNlPzogZmFsc2UgfSA9IHt9KTogeyBbbW9kdWxlTmFtZTogc3RyaW5nXTogYW55IH0ge1xuICBsZXQgbW9kdWxlczogeyBbbW9kdWxlTmFtZTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgbGV0IHBhdGhzO1xuICBpZiAob3B0aW9ucy5yZWN1cnNlID09PSBmYWxzZSkge1xuICAgIHBhdGhzID0gZnMucmVhZGRpclN5bmMoZGlycGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgcGF0aHMgPSA8c3RyaW5nW10+d2FsayhkaXJwYXRoKTtcbiAgfVxuICBwYXRocy5mb3JFYWNoKChmaWxlcGF0aCkgPT4ge1xuICAgIGxldCBhYnNvbHV0ZXBhdGggPSBwYXRoLmpvaW4oZGlycGF0aCwgZmlsZXBhdGgpO1xuICAgIGlmIChmcy5zdGF0U3luYyhhYnNvbHV0ZXBhdGgpLmlzRmlsZSgpICYmIC9cXC5qcyQvLnRlc3QoZmlsZXBhdGgpKSB7XG4gICAgICBsZXQgbW9kdWxlTmFtZSA9IGZpbGVwYXRoLnNsaWNlKDAsIGZpbGVwYXRoLmxlbmd0aCAtIDMpO1xuICAgICAgbGV0IG1vZCA9IHJlcXVpcmUoYWJzb2x1dGVwYXRoKTtcbiAgICAgIG1vZHVsZXNbbW9kdWxlTmFtZV0gPSBtb2QuZGVmYXVsdCB8fCBtb2Q7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG1vZHVsZXM7XG59XG4iXX0=