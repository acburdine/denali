"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_acceptance_1 = require("./command-acceptance");
/**
 * A specialized version of a CommandAcceptanceTest which tests the generate / destroy invocations
 * of a specific blueprint.
 *
 * @package test
 */
class BlueprintAcceptanceTest extends command_acceptance_1.default {
    constructor(blueprintName) {
        super('');
        this.blueprintName = blueprintName;
    }
    /**
     * Run the generate command with the supplied blueprint name and return a Promise that resolves
     * when complete.
     */
    generate(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.command = `generate ${this.blueprintName} ${args}`;
            return this.run();
        });
    }
    /**
     * Run the destroy command with the supplied blueprint name and return a Promise that resolves
     * when complete.
     */
    destroy(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.command = `destroy ${this.blueprintName} ${args}`;
            return this.run();
        });
    }
}
exports.default = BlueprintAcceptanceTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZXByaW50LWFjY2VwdGFuY2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3Rlc3QvYmx1ZXByaW50LWFjY2VwdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQXlEO0FBRXpEOzs7OztHQUtHO0FBQ0gsNkJBQTZDLFNBQVEsNEJBQXFCO0lBT3hFLFlBQVksYUFBcUI7UUFDL0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7T0FHRztJQUNVLFFBQVEsQ0FBQyxJQUFZOztZQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQWEsSUFBSSxDQUFDLGFBQWMsSUFBSyxJQUFLLEVBQUUsQ0FBQztZQUM1RCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNVLE9BQU8sQ0FBQyxJQUFZOztZQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVksSUFBSSxDQUFDLGFBQWMsSUFBSyxJQUFLLEVBQUUsQ0FBQztZQUMzRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtDQUVGO0FBOUJELDBDQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tYW5kQWNjZXB0YW5jZVRlc3QgZnJvbSAnLi9jb21tYW5kLWFjY2VwdGFuY2UnO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBhIENvbW1hbmRBY2NlcHRhbmNlVGVzdCB3aGljaCB0ZXN0cyB0aGUgZ2VuZXJhdGUgLyBkZXN0cm95IGludm9jYXRpb25zXG4gKiBvZiBhIHNwZWNpZmljIGJsdWVwcmludC5cbiAqXG4gKiBAcGFja2FnZSB0ZXN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsdWVwcmludEFjY2VwdGFuY2VUZXN0IGV4dGVuZHMgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IHtcblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGJsdWVwcmludCB0byB0ZXN0XG4gICAqL1xuICBwdWJsaWMgYmx1ZXByaW50TmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGJsdWVwcmludE5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKCcnKTtcbiAgICB0aGlzLmJsdWVwcmludE5hbWUgPSBibHVlcHJpbnROYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0aGUgZ2VuZXJhdGUgY29tbWFuZCB3aXRoIHRoZSBzdXBwbGllZCBibHVlcHJpbnQgbmFtZSBhbmQgcmV0dXJuIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzXG4gICAqIHdoZW4gY29tcGxldGUuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2VuZXJhdGUoYXJnczogc3RyaW5nKSB7XG4gICAgdGhpcy5jb21tYW5kID0gYGdlbmVyYXRlICR7IHRoaXMuYmx1ZXByaW50TmFtZSB9ICR7IGFyZ3MgfWA7XG4gICAgcmV0dXJuIHRoaXMucnVuKCk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHRoZSBkZXN0cm95IGNvbW1hbmQgd2l0aCB0aGUgc3VwcGxpZWQgYmx1ZXByaW50IG5hbWUgYW5kIHJldHVybiBhIFByb21pc2UgdGhhdCByZXNvbHZlc1xuICAgKiB3aGVuIGNvbXBsZXRlLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGRlc3Ryb3koYXJnczogc3RyaW5nKSB7XG4gICAgdGhpcy5jb21tYW5kID0gYGRlc3Ryb3kgJHsgdGhpcy5ibHVlcHJpbnROYW1lIH0gJHsgYXJncyB9YDtcbiAgICByZXR1cm4gdGhpcy5ydW4oKTtcbiAgfVxuXG59XG4iXX0=