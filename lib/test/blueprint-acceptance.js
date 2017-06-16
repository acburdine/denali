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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZXByaW50LWFjY2VwdGFuY2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL3Rlc3QvYmx1ZXByaW50LWFjY2VwdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQXlEO0FBRXpEOzs7OztHQUtHO0FBQ0gsNkJBQTZDLFNBQVEsNEJBQXFCO0lBT3hFLFlBQVksYUFBcUI7UUFDL0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7T0FHRztJQUNHLFFBQVEsQ0FBQyxJQUFZOztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLFlBQWEsSUFBSSxDQUFDLGFBQWMsSUFBSyxJQUFLLEVBQUUsQ0FBQztZQUM1RCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNHLE9BQU8sQ0FBQyxJQUFZOztZQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVksSUFBSSxDQUFDLGFBQWMsSUFBSyxJQUFLLEVBQUUsQ0FBQztZQUMzRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7S0FBQTtDQUVGO0FBOUJELDBDQThCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tYW5kQWNjZXB0YW5jZVRlc3QgZnJvbSAnLi9jb21tYW5kLWFjY2VwdGFuY2UnO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBhIENvbW1hbmRBY2NlcHRhbmNlVGVzdCB3aGljaCB0ZXN0cyB0aGUgZ2VuZXJhdGUgLyBkZXN0cm95IGludm9jYXRpb25zXG4gKiBvZiBhIHNwZWNpZmljIGJsdWVwcmludC5cbiAqXG4gKiBAcGFja2FnZSB0ZXN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsdWVwcmludEFjY2VwdGFuY2VUZXN0IGV4dGVuZHMgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IHtcblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGJsdWVwcmludCB0byB0ZXN0XG4gICAqL1xuICBibHVlcHJpbnROYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoYmx1ZXByaW50TmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoJycpO1xuICAgIHRoaXMuYmx1ZXByaW50TmFtZSA9IGJsdWVwcmludE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHRoZSBnZW5lcmF0ZSBjb21tYW5kIHdpdGggdGhlIHN1cHBsaWVkIGJsdWVwcmludCBuYW1lIGFuZCByZXR1cm4gYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXNcbiAgICogd2hlbiBjb21wbGV0ZS5cbiAgICovXG4gIGFzeW5jIGdlbmVyYXRlKGFyZ3M6IHN0cmluZykge1xuICAgIHRoaXMuY29tbWFuZCA9IGBnZW5lcmF0ZSAkeyB0aGlzLmJsdWVwcmludE5hbWUgfSAkeyBhcmdzIH1gO1xuICAgIHJldHVybiB0aGlzLnJ1bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB0aGUgZGVzdHJveSBjb21tYW5kIHdpdGggdGhlIHN1cHBsaWVkIGJsdWVwcmludCBuYW1lIGFuZCByZXR1cm4gYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXNcbiAgICogd2hlbiBjb21wbGV0ZS5cbiAgICovXG4gIGFzeW5jIGRlc3Ryb3koYXJnczogc3RyaW5nKSB7XG4gICAgdGhpcy5jb21tYW5kID0gYGRlc3Ryb3kgJHsgdGhpcy5ibHVlcHJpbnROYW1lIH0gJHsgYXJncyB9YDtcbiAgICByZXR1cm4gdGhpcy5ydW4oKTtcbiAgfVxuXG59XG4iXX0=