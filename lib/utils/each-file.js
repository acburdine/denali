"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
/**
 * Invoke the supplied callback for each file (not directories) in the supplied directory.
 *
 * @package util
 */
function eachFile(dirpath, fn) {
    fs.readdirSync(dirpath).forEach((childpath) => {
        let absolutepath = path.join(dirpath, childpath);
        if (fs.statSync(absolutepath).isFile()) {
            fn(childpath);
        }
    });
}
exports.default = eachFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFjaC1maWxlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9lYWNoLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBRTdCOzs7O0dBSUc7QUFDSCxrQkFBaUMsT0FBZSxFQUFFLEVBQStCO0lBQy9FLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUztRQUN4QyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRCxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVBELDJCQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBJbnZva2UgdGhlIHN1cHBsaWVkIGNhbGxiYWNrIGZvciBlYWNoIGZpbGUgKG5vdCBkaXJlY3RvcmllcykgaW4gdGhlIHN1cHBsaWVkIGRpcmVjdG9yeS5cbiAqXG4gKiBAcGFja2FnZSB1dGlsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGVhY2hGaWxlKGRpcnBhdGg6IHN0cmluZywgZm46IChjaGlsZHBhdGg6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xuICBmcy5yZWFkZGlyU3luYyhkaXJwYXRoKS5mb3JFYWNoKChjaGlsZHBhdGgpID0+IHtcbiAgICBsZXQgYWJzb2x1dGVwYXRoID0gcGF0aC5qb2luKGRpcnBhdGgsIGNoaWxkcGF0aCk7XG4gICAgaWYgKGZzLnN0YXRTeW5jKGFic29sdXRlcGF0aCkuaXNGaWxlKCkpIHtcbiAgICAgIGZuKGNoaWxkcGF0aCk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==