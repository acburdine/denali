"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../../lib/utils/unwrap");
/**
 * Generates a blank serializer
 *
 * @package blueprints
 */
class SerializerBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name))
        };
    }
}
/* tslint:disable:completed-docs typedef */
SerializerBlueprint.blueprintName = 'serializer';
SerializerBlueprint.description = 'Generates a blank serializer';
SerializerBlueprint.longDescription = unwrap_1.default `
    Usage: denali generate serializer <name> [options]

    Generates a blank serializer for the given model.

    Guides: http://denalijs.org/master/guides/data/serializers/
  `;
SerializerBlueprint.params = '<name>';
exports.default = SerializerBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9zZXJpYWxpemVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBR2dCO0FBQ2hCLDJDQUF1QztBQUN2QyxtREFBNEM7QUFFNUM7Ozs7R0FJRztBQUNILHlCQUF5QyxTQUFRLHNCQUFTO0lBZXhELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QyxDQUFDO0lBQ0osQ0FBQzs7QUFuQkQsMkNBQTJDO0FBQ3BDLGlDQUFhLEdBQUcsWUFBWSxDQUFDO0FBQzdCLCtCQUFXLEdBQUcsOEJBQThCLENBQUM7QUFDN0MsbUNBQWUsR0FBRyxnQkFBTSxDQUFBOzs7Ozs7R0FNOUIsQ0FBQztBQUVLLDBCQUFNLEdBQUcsUUFBUSxDQUFDO0FBYjNCLHNDQXNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmx1ZXByaW50IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4uLy4uL2xpYi91dGlscy91bndyYXAnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGJsYW5rIHNlcmlhbGl6ZXJcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcmlhbGl6ZXJCbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnc2VyaWFsaXplcic7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBibGFuayBzZXJpYWxpemVyJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIHNlcmlhbGl6ZXIgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgYmxhbmsgc2VyaWFsaXplciBmb3IgdGhlIGdpdmVuIG1vZGVsLlxuXG4gICAgR3VpZGVzOiBodHRwOi8vZGVuYWxpanMub3JnL21hc3Rlci9ndWlkZXMvZGF0YS9zZXJpYWxpemVycy9cbiAgYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiB1cHBlckZpcnN0KGNhbWVsQ2FzZShuYW1lKSlcbiAgICB9O1xuICB9XG59XG4iXX0=