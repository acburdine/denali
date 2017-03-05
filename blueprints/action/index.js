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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hY3Rpb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBR2dCO0FBQ2hCLDJDQUF1QztBQUN2QyxtREFBNEM7QUFFNUM7Ozs7R0FJRztBQUNILHFCQUFxQyxTQUFRLHNCQUFTO0lBMEI3QyxNQUFNLENBQUMsSUFBUztRQUNyQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxPQUFlLENBQUM7UUFDcEIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQztZQUNMLElBQUk7WUFDSixTQUFTLEVBQUUsbUJBQVUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLE9BQU87U0FDUixDQUFDO0lBQ0osQ0FBQztJQUVZLFdBQVcsQ0FBQyxJQUFTOztZQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3JCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUssSUFBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsQ0FBQztLQUFBO0lBRVksYUFBYSxDQUFDLElBQVM7O1lBQ2xDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDckIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUM7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSyxJQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3RCxDQUFDO0tBQUE7O0FBbkRELDJDQUEyQztBQUM3Qiw2QkFBYSxHQUFHLFFBQVEsQ0FBQztBQUN6QiwyQkFBVyxHQUFHLDJDQUEyQyxDQUFDO0FBQzFELCtCQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7Ozs7OztHQU9yQyxDQUFDO0FBRVksc0JBQU0sR0FBRyxRQUFRLENBQUM7QUFFbEIscUJBQUssR0FBRztJQUNwQixNQUFNLEVBQUU7UUFDTixXQUFXLEVBQUUscURBQXFEO1FBQ2xFLE9BQU8sRUFBRSxNQUFNO1FBQ2YsSUFBSSxFQUFRLFFBQVE7S0FDckI7Q0FDRixDQUFDO0FBRVkseUJBQVMsR0FBRyxJQUFJLENBQUM7QUF4QmpDLGtDQXNEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmx1ZXByaW50IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4uLy4uL2xpYi91dGlscy91bndyYXAnO1xuXG4vKipcbiAqIEdlbmVyYXRlIGFuIG5ldyBhY3Rpb24gY2xhc3MgKyB0ZXN0cy5cbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGlvbkJsdWVwcmludCBleHRlbmRzIEJsdWVwcmludCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBwdWJsaWMgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnYWN0aW9uJztcbiAgcHVibGljIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBuZXcgYWN0aW9uIGNsYXNzICYgdW5pdCB0ZXN0cyc7XG4gIHB1YmxpYyBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgYWN0aW9uIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhbiBhY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gbmFtZSAoY2FuIGJlIGEgZGVlcGx5IG5lc3RlZCBwYXRoKSwgYWxvbmcgd2l0aCB1bml0IHRlc3RcbiAgICBzdHVicy5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2FwcGxpY2F0aW9uL2FjdGlvbnMvXG4gIGA7XG5cbiAgcHVibGljIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBwdWJsaWMgc3RhdGljIGZsYWdzID0ge1xuICAgIG1ldGhvZDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgSFRUUCBtZXRob2QgdG8gdXNlIGZvciB0aGUgcm91dGUgdG8gdGhpcyBhY3Rpb24nLFxuICAgICAgZGVmYXVsdDogJ3Bvc3QnLFxuICAgICAgdHlwZTogPGFueT4gJ3N0cmluZydcbiAgICB9XG4gIH07XG5cbiAgcHVibGljIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHB1YmxpYyBsb2NhbHMoYXJndjogYW55KTogYW55IHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBsZXQgbGV2ZWxzID0gbmFtZS5zcGxpdCgnLycpLm1hcCgoKSA9PiAnLi4nKTtcbiAgICBsZXZlbHMucG9wKCk7XG4gICAgbGV0IG5lc3Rpbmc6IHN0cmluZztcbiAgICBpZiAobGV2ZWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIG5lc3RpbmcgPSBsZXZlbHMuam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXN0aW5nID0gJy4nO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGNsYXNzTmFtZTogdXBwZXJGaXJzdChjYW1lbENhc2UobmFtZSkpLFxuICAgICAgbmVzdGluZ1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcG9zdEluc3RhbGwoYXJndjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgbGV0IG1ldGhvZCA9IGFyZ3YubWV0aG9kIHx8ICdwb3N0JztcbiAgICB0aGlzLmFkZFJvdXRlKG1ldGhvZC50b0xvd2VyQ2FzZSgpLCBgLyR7IG5hbWUgfWAsIG5hbWUpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHBvc3RVbmluc3RhbGwoYXJndjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgbGV0IG1ldGhvZCA9IGFyZ3YubWV0aG9kIHx8ICdwb3N0JztcbiAgICB0aGlzLnJlbW92ZVJvdXRlKG1ldGhvZC50b0xvd2VyQ2FzZSgpLCBgLyR7IG5hbWUgfWAsIG5hbWUpO1xuICB9XG59XG4iXX0=