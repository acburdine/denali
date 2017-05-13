"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denali_cli_1 = require("denali-cli");
const inflection_1 = require("inflection");
const lodash_1 = require("lodash");
/**
 * Generates a blank ORM adapter with stubs for all the required methods
 *
 * @package blueprints
 */
class ORMAdapterBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        name = inflection_1.singularize(name);
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name))
        };
    }
}
/* tslint:disable:completed-docs typedef */
ORMAdapterBlueprint.blueprintName = 'orm-adapter';
ORMAdapterBlueprint.description = 'Generates a blank ORM adapter with stubs for all the required methods';
ORMAdapterBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate orm-adapter <name> [options]

    Generates a new ORM adapter with stubs for all the required adapter methods. Note: this is
    typically an advanced use case (i.e. using a niche, specialty database). You should check to
    make sure there isn't already a Denali addon that implements the ORM adapter you need.

    Guides: http://denalijs.org/master/guides/data/orm-adapters/
  `;
ORMAdapterBlueprint.params = '<name>';
exports.default = ORMAdapterBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9vcm0tYWRhcHRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUErQztBQUMvQywyQ0FBeUM7QUFDekMsbUNBR2dCO0FBRWhCOzs7O0dBSUc7QUFDSCx5QkFBeUMsU0FBUSxzQkFBUztJQWlCeEQsTUFBTSxDQUFDLElBQVM7UUFDZCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksR0FBRyx3QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQztZQUNMLElBQUk7WUFDSixTQUFTLEVBQUUsbUJBQVUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDLENBQUM7SUFDSixDQUFDOztBQXRCRCwyQ0FBMkM7QUFDcEMsaUNBQWEsR0FBRyxhQUFhLENBQUM7QUFDOUIsK0JBQVcsR0FBRyx1RUFBdUUsQ0FBQztBQUN0RixtQ0FBZSxHQUFHLG1CQUFNLENBQUE7Ozs7Ozs7O0dBUTlCLENBQUM7QUFFSywwQkFBTSxHQUFHLFFBQVEsQ0FBQztBQWYzQixzQ0EwQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCbHVlcHJpbnQsIHVud3JhcCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHsgc2luZ3VsYXJpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGJsYW5rIE9STSBhZGFwdGVyIHdpdGggc3R1YnMgZm9yIGFsbCB0aGUgcmVxdWlyZWQgbWV0aG9kc1xuICpcbiAqIEBwYWNrYWdlIGJsdWVwcmludHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1JNQWRhcHRlckJsdWVwcmludCBleHRlbmRzIEJsdWVwcmludCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdvcm0tYWRhcHRlcic7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBibGFuayBPUk0gYWRhcHRlciB3aXRoIHN0dWJzIGZvciBhbGwgdGhlIHJlcXVpcmVkIG1ldGhvZHMnO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgb3JtLWFkYXB0ZXIgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgbmV3IE9STSBhZGFwdGVyIHdpdGggc3R1YnMgZm9yIGFsbCB0aGUgcmVxdWlyZWQgYWRhcHRlciBtZXRob2RzLiBOb3RlOiB0aGlzIGlzXG4gICAgdHlwaWNhbGx5IGFuIGFkdmFuY2VkIHVzZSBjYXNlIChpLmUuIHVzaW5nIGEgbmljaGUsIHNwZWNpYWx0eSBkYXRhYmFzZSkuIFlvdSBzaG91bGQgY2hlY2sgdG9cbiAgICBtYWtlIHN1cmUgdGhlcmUgaXNuJ3QgYWxyZWFkeSBhIERlbmFsaSBhZGRvbiB0aGF0IGltcGxlbWVudHMgdGhlIE9STSBhZGFwdGVyIHlvdSBuZWVkLlxuXG4gICAgR3VpZGVzOiBodHRwOi8vZGVuYWxpanMub3JnL21hc3Rlci9ndWlkZXMvZGF0YS9vcm0tYWRhcHRlcnMvXG4gIGA7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICc8bmFtZT4nO1xuXG4gIGxvY2Fscyhhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBuYW1lID0gc2luZ3VsYXJpemUobmFtZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKVxuICAgIH07XG4gIH1cblxufVxuIl19