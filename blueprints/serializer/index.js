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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9zZXJpYWxpemVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBR2dCO0FBQ2hCLDJDQUF1QztBQUN2QyxtREFBNEM7QUFFNUM7Ozs7R0FJRztBQUNILHlCQUF5QyxTQUFRLHNCQUFTO0lBZWpELE1BQU0sQ0FBQyxJQUFTO1FBQ3JCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkMsQ0FBQztJQUNKLENBQUM7O0FBbkJELDJDQUEyQztBQUM3QixpQ0FBYSxHQUFHLFlBQVksQ0FBQztBQUM3QiwrQkFBVyxHQUFHLDhCQUE4QixDQUFDO0FBQzdDLG1DQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7Ozs7O0dBTXJDLENBQUM7QUFFWSwwQkFBTSxHQUFHLFFBQVEsQ0FBQztBQWJsQyxzQ0FzQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJsdWVwcmludCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi8uLi9saWIvdXRpbHMvdW53cmFwJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBibGFuayBzZXJpYWxpemVyXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJpYWxpemVyQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHB1YmxpYyBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdzZXJpYWxpemVyJztcbiAgcHVibGljIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBibGFuayBzZXJpYWxpemVyJztcbiAgcHVibGljIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgVXNhZ2U6IGRlbmFsaSBnZW5lcmF0ZSBzZXJpYWxpemVyIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhIGJsYW5rIHNlcmlhbGl6ZXIgZm9yIHRoZSBnaXZlbiBtb2RlbC5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2RhdGEvc2VyaWFsaXplcnMvXG4gIGA7XG5cbiAgcHVibGljIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBwdWJsaWMgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiB1cHBlckZpcnN0KGNhbWVsQ2FzZShuYW1lKSlcbiAgICB9O1xuICB9XG59XG4iXX0=