"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
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
SerializerBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate serializer <name> [options]

    Generates a blank serializer for the given model.

    Guides: http://denalijs.org/master/guides/data/serializers/
  `;
SerializerBlueprint.params = '<name>';
exports.default = SerializerBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9zZXJpYWxpemVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBR2dCO0FBQ2hCLDJDQUErQztBQUUvQzs7OztHQUlHO0FBQ0gseUJBQXlDLFNBQVEsc0JBQVM7SUFleEQsTUFBTSxDQUFDLElBQVM7UUFDZCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQztZQUNMLElBQUk7WUFDSixTQUFTLEVBQUUsbUJBQVUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDLENBQUM7SUFDSixDQUFDOztBQW5CRCwyQ0FBMkM7QUFDcEMsaUNBQWEsR0FBRyxZQUFZLENBQUM7QUFDN0IsK0JBQVcsR0FBRyw4QkFBOEIsQ0FBQztBQUM3QyxtQ0FBZSxHQUFHLG1CQUFNLENBQUE7Ozs7OztHQU05QixDQUFDO0FBRUssMEJBQU0sR0FBRyxRQUFRLENBQUM7QUFiM0Isc0NBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgdXBwZXJGaXJzdCxcbiAgY2FtZWxDYXNlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBCbHVlcHJpbnQsIHVud3JhcCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGJsYW5rIHNlcmlhbGl6ZXJcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcmlhbGl6ZXJCbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnc2VyaWFsaXplcic7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBibGFuayBzZXJpYWxpemVyJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIHNlcmlhbGl6ZXIgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgYmxhbmsgc2VyaWFsaXplciBmb3IgdGhlIGdpdmVuIG1vZGVsLlxuXG4gICAgR3VpZGVzOiBodHRwOi8vZGVuYWxpanMub3JnL21hc3Rlci9ndWlkZXMvZGF0YS9zZXJpYWxpemVycy9cbiAgYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiB1cHBlckZpcnN0KGNhbWVsQ2FzZShuYW1lKSlcbiAgICB9O1xuICB9XG59XG4iXX0=