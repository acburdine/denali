"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
/**
 * Generate an new action class + tests.
 *
 * @package blueprints
 */
class ActionBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        let levels = name.split('/').map(() => '..');
        levels.pop();
        let nesting;
        if (levels.length > 0) {
            nesting = levels.join('/');
        }
        else {
            nesting = '.';
        }
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name)),
            nesting
        };
    }
    postInstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let name = argv.name;
            let method = argv.method || 'post';
            this.addRoute(method.toLowerCase(), `/${name}`, name);
        });
    }
    postUninstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let name = argv.name;
            let method = argv.method || 'post';
            this.removeRoute(method.toLowerCase(), `/${name}`, name);
        });
    }
}
/* tslint:disable:completed-docs typedef */
ActionBlueprint.blueprintName = 'action';
ActionBlueprint.description = 'Generates a new action class & unit tests';
ActionBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate action <name> [options]

    Generates an action with the given name (can be a deeply nested path), along with unit test
    stubs.

    Guides: http://denalijs.org/master/guides/application/actions/
  `;
ActionBlueprint.params = '<name>';
ActionBlueprint.flags = {
    method: {
        description: 'The HTTP method to use for the route to this action',
        default: 'post',
        type: 'string'
    }
};
ActionBlueprint.runsInApp = true;
exports.default = ActionBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBR2dCO0FBQ2hCLDJDQUErQztBQUUvQzs7OztHQUlHO0FBQ0gscUJBQXFDLFNBQVEsc0JBQVM7SUEwQnBELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksT0FBZSxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxPQUFPO1NBQ1IsQ0FBQztJQUNKLENBQUM7SUFFSyxXQUFXLENBQUMsSUFBUzs7WUFDekIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQztZQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFLLElBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFELENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxJQUFTOztZQUMzQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3JCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUssSUFBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0QsQ0FBQztLQUFBOztBQW5ERCwyQ0FBMkM7QUFDcEMsNkJBQWEsR0FBRyxRQUFRLENBQUM7QUFDekIsMkJBQVcsR0FBRywyQ0FBMkMsQ0FBQztBQUMxRCwrQkFBZSxHQUFHLG1CQUFNLENBQUE7Ozs7Ozs7R0FPOUIsQ0FBQztBQUVLLHNCQUFNLEdBQUcsUUFBUSxDQUFDO0FBRWxCLHFCQUFLLEdBQUc7SUFDYixNQUFNLEVBQUU7UUFDTixXQUFXLEVBQUUscURBQXFEO1FBQ2xFLE9BQU8sRUFBRSxNQUFNO1FBQ2YsSUFBSSxFQUFRLFFBQVE7S0FDckI7Q0FDRixDQUFDO0FBRUsseUJBQVMsR0FBRyxJQUFJLENBQUM7QUF4QjFCLGtDQXNEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmx1ZXByaW50LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBuZXcgYWN0aW9uIGNsYXNzICsgdGVzdHMuXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY3Rpb25CbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnYWN0aW9uJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0dlbmVyYXRlcyBhIG5ldyBhY3Rpb24gY2xhc3MgJiB1bml0IHRlc3RzJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIGFjdGlvbiA8bmFtZT4gW29wdGlvbnNdXG5cbiAgICBHZW5lcmF0ZXMgYW4gYWN0aW9uIHdpdGggdGhlIGdpdmVuIG5hbWUgKGNhbiBiZSBhIGRlZXBseSBuZXN0ZWQgcGF0aCksIGFsb25nIHdpdGggdW5pdCB0ZXN0XG4gICAgc3R1YnMuXG5cbiAgICBHdWlkZXM6IGh0dHA6Ly9kZW5hbGlqcy5vcmcvbWFzdGVyL2d1aWRlcy9hcHBsaWNhdGlvbi9hY3Rpb25zL1xuICBgO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgbWV0aG9kOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBIVFRQIG1ldGhvZCB0byB1c2UgZm9yIHRoZSByb3V0ZSB0byB0aGlzIGFjdGlvbicsXG4gICAgICBkZWZhdWx0OiAncG9zdCcsXG4gICAgICB0eXBlOiA8YW55PiAnc3RyaW5nJ1xuICAgIH1cbiAgfTtcblxuICBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBsb2NhbHMoYXJndjogYW55KTogYW55IHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBsZXQgbGV2ZWxzID0gbmFtZS5zcGxpdCgnLycpLm1hcCgoKSA9PiAnLi4nKTtcbiAgICBsZXZlbHMucG9wKCk7XG4gICAgbGV0IG5lc3Rpbmc6IHN0cmluZztcbiAgICBpZiAobGV2ZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIG5lc3RpbmcgPSBsZXZlbHMuam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXN0aW5nID0gJy4nO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGNsYXNzTmFtZTogdXBwZXJGaXJzdChjYW1lbENhc2UobmFtZSkpLFxuICAgICAgbmVzdGluZ1xuICAgIH07XG4gIH1cblxuICBhc3luYyBwb3N0SW5zdGFsbChhcmd2OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBsZXQgbWV0aG9kID0gYXJndi5tZXRob2QgfHwgJ3Bvc3QnO1xuICAgIHRoaXMuYWRkUm91dGUobWV0aG9kLnRvTG93ZXJDYXNlKCksIGAvJHsgbmFtZSB9YCwgbmFtZSk7XG4gIH1cblxuICBhc3luYyBwb3N0VW5pbnN0YWxsKGFyZ3Y6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIGxldCBtZXRob2QgPSBhcmd2Lm1ldGhvZCB8fCAncG9zdCc7XG4gICAgdGhpcy5yZW1vdmVSb3V0ZShtZXRob2QudG9Mb3dlckNhc2UoKSwgYC8keyBuYW1lIH1gLCBuYW1lKTtcbiAgfVxufVxuIl19