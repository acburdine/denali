"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../../lib/utils/unwrap");
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
ActionBlueprint.longDescription = unwrap_1.default `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBR2dCO0FBQ2hCLDJDQUF1QztBQUN2QyxtREFBNEM7QUFFNUM7Ozs7R0FJRztBQUNILHFCQUFxQyxTQUFRLHNCQUFTO0lBMEJwRCxNQUFNLENBQUMsSUFBUztRQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLE9BQWUsQ0FBQztRQUNwQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sT0FBTyxHQUFHLEdBQUcsQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsT0FBTztTQUNSLENBQUM7SUFDSixDQUFDO0lBRUssV0FBVyxDQUFDLElBQVM7O1lBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDckIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSyxJQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQUE7SUFFSyxhQUFhLENBQUMsSUFBUzs7WUFDM0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQztZQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFLLElBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTs7QUFuREQsMkNBQTJDO0FBQ3BDLDZCQUFhLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLDJCQUFXLEdBQUcsMkNBQTJDLENBQUM7QUFDMUQsK0JBQWUsR0FBRyxnQkFBTSxDQUFBOzs7Ozs7O0dBTzlCLENBQUM7QUFFSyxzQkFBTSxHQUFHLFFBQVEsQ0FBQztBQUVsQixxQkFBSyxHQUFHO0lBQ2IsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxPQUFPLEVBQUUsTUFBTTtRQUNmLElBQUksRUFBUSxRQUFRO0tBQ3JCO0NBQ0YsQ0FBQztBQUVLLHlCQUFTLEdBQUcsSUFBSSxDQUFDO0FBeEIxQixrQ0FzREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJsdWVwcmludCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi8uLi9saWIvdXRpbHMvdW53cmFwJztcblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBuZXcgYWN0aW9uIGNsYXNzICsgdGVzdHMuXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY3Rpb25CbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnYWN0aW9uJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0dlbmVyYXRlcyBhIG5ldyBhY3Rpb24gY2xhc3MgJiB1bml0IHRlc3RzJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIGFjdGlvbiA8bmFtZT4gW29wdGlvbnNdXG5cbiAgICBHZW5lcmF0ZXMgYW4gYWN0aW9uIHdpdGggdGhlIGdpdmVuIG5hbWUgKGNhbiBiZSBhIGRlZXBseSBuZXN0ZWQgcGF0aCksIGFsb25nIHdpdGggdW5pdCB0ZXN0XG4gICAgc3R1YnMuXG5cbiAgICBHdWlkZXM6IGh0dHA6Ly9kZW5hbGlqcy5vcmcvbWFzdGVyL2d1aWRlcy9hcHBsaWNhdGlvbi9hY3Rpb25zL1xuICBgO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgbWV0aG9kOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBIVFRQIG1ldGhvZCB0byB1c2UgZm9yIHRoZSByb3V0ZSB0byB0aGlzIGFjdGlvbicsXG4gICAgICBkZWZhdWx0OiAncG9zdCcsXG4gICAgICB0eXBlOiA8YW55PiAnc3RyaW5nJ1xuICAgIH1cbiAgfTtcblxuICBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBsb2NhbHMoYXJndjogYW55KTogYW55IHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBsZXQgbGV2ZWxzID0gbmFtZS5zcGxpdCgnLycpLm1hcCgoKSA9PiAnLi4nKTtcbiAgICBsZXZlbHMucG9wKCk7XG4gICAgbGV0IG5lc3Rpbmc6IHN0cmluZztcbiAgICBpZiAobGV2ZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIG5lc3RpbmcgPSBsZXZlbHMuam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXN0aW5nID0gJy4nO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGNsYXNzTmFtZTogdXBwZXJGaXJzdChjYW1lbENhc2UobmFtZSkpLFxuICAgICAgbmVzdGluZ1xuICAgIH07XG4gIH1cblxuICBhc3luYyBwb3N0SW5zdGFsbChhcmd2OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBsZXQgbWV0aG9kID0gYXJndi5tZXRob2QgfHwgJ3Bvc3QnO1xuICAgIHRoaXMuYWRkUm91dGUobWV0aG9kLnRvTG93ZXJDYXNlKCksIGAvJHsgbmFtZSB9YCwgbmFtZSk7XG4gIH1cblxuICBhc3luYyBwb3N0VW5pbnN0YWxsKGFyZ3Y6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIGxldCBtZXRob2QgPSBhcmd2Lm1ldGhvZCB8fCAncG9zdCc7XG4gICAgdGhpcy5yZW1vdmVSb3V0ZShtZXRob2QudG9Mb3dlckNhc2UoKSwgYC8keyBuYW1lIH1gLCBuYW1lKTtcbiAgfVxufVxuIl19