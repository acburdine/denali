"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
/**
 * Invoke the supplied callback for each directory in the supplied directory.
 *
 * @package util
 */
function eachDir(dirpath, fn) {
    fs.readdirSync(dirpath).forEach((childpath) => {
        let absolutepath = path.join(dirpath, childpath);
        if (fs.statSync(absolutepath).isDirectory()) {
            fn(childpath);
        }
    });
}
exports.default = eachDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFjaC1kaXIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL2VhY2gtZGlyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUU3Qjs7OztHQUlHO0FBQ0gsaUJBQWdDLE9BQWUsRUFBRSxFQUErQjtJQUM5RSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVM7UUFDeEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakQsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCwwQkFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbi8qKlxuICogSW52b2tlIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmb3IgZWFjaCBkaXJlY3RvcnkgaW4gdGhlIHN1cHBsaWVkIGRpcmVjdG9yeS5cbiAqXG4gKiBAcGFja2FnZSB1dGlsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGVhY2hEaXIoZGlycGF0aDogc3RyaW5nLCBmbjogKGNoaWxkcGF0aDogc3RyaW5nKSA9PiB2b2lkKTogdm9pZCB7XG4gIGZzLnJlYWRkaXJTeW5jKGRpcnBhdGgpLmZvckVhY2goKGNoaWxkcGF0aCkgPT4ge1xuICAgIGxldCBhYnNvbHV0ZXBhdGggPSBwYXRoLmpvaW4oZGlycGF0aCwgY2hpbGRwYXRoKTtcbiAgICBpZiAoZnMuc3RhdFN5bmMoYWJzb2x1dGVwYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBmbihjaGlsZHBhdGgpO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=