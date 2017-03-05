"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const inflection_1 = require("inflection");
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../../lib/utils/unwrap");
/**
 * Generates a model, serializer, CRUD actions, and tests for a resource
 *
 * @package blueprints
 */
class ResourceBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        name = inflection_1.pluralize(name);
        let plural = {
            name,
            camelCased: lodash_1.camelCase(name),
            className: lodash_1.upperFirst(lodash_1.camelCase(name)),
            dasherized: lodash_1.kebabCase(name),
            humanized: lodash_1.lowerCase(name)
        };
        name = inflection_1.singularize(name);
        let singular = {
            name,
            camelCased: lodash_1.camelCase(name),
            className: lodash_1.upperFirst(lodash_1.camelCase(name)),
            dasherized: lodash_1.kebabCase(name),
            humanized: lodash_1.lowerCase(name)
        };
        return { plural, singular };
    }
    postInstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.addRoute('resource', inflection_1.singularize(argv.name));
        });
    }
    postUninstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.removeRoute('resource', inflection_1.singularize(argv.name));
        });
    }
}
/* tslint:disable:completed-docs typedef */
ResourceBlueprint.blueprintName = 'resource';
ResourceBlueprint.description = 'Generates a model, serializer, CRUD actions, and tests for a resource';
ResourceBlueprint.longDescription = unwrap_1.default `
    Usage: denali generate resource <name> [options]

    Generates a complete, end-to-end RESTful resource scaffold. This includes a Model to represent
    the data, a Serializer to determine how to send it over the wire, CRUD actions for manipulating
    the resource, and tests for all of the above.
  `;
ResourceBlueprint.params = '<name>';
exports.default = ResourceBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9yZXNvdXJjZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FLZ0I7QUFDaEIsMkNBQW9EO0FBQ3BELDJDQUF1QztBQUN2QyxtREFBNEM7QUFFNUM7Ozs7R0FJRztBQUNILHVCQUF1QyxTQUFRLHNCQUFTO0lBZS9DLE1BQU0sQ0FBQyxJQUFTO1FBQ3JCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxHQUFHLHNCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsSUFBSSxNQUFNLEdBQUc7WUFDWCxJQUFJO1lBQ0osVUFBVSxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1lBQzNCLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsVUFBVSxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1lBQzNCLFNBQVMsRUFBRSxrQkFBUyxDQUFDLElBQUksQ0FBQztTQUMzQixDQUFDO1FBQ0YsSUFBSSxHQUFHLHdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsSUFBSSxRQUFRLEdBQUc7WUFDYixJQUFJO1lBQ0osVUFBVSxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1lBQzNCLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsVUFBVSxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1lBQzNCLFNBQVMsRUFBRSxrQkFBUyxDQUFDLElBQUksQ0FBQztTQUMzQixDQUFDO1FBQ0YsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFWSxXQUFXLENBQUMsSUFBUzs7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsd0JBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQUE7SUFFWSxhQUFhLENBQUMsSUFBUzs7WUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsd0JBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDO0tBQUE7O0FBeENELDJDQUEyQztBQUM3QiwrQkFBYSxHQUFHLFVBQVUsQ0FBQztBQUMzQiw2QkFBVyxHQUFHLHVFQUF1RSxDQUFDO0FBQ3RGLGlDQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7Ozs7O0dBTXJDLENBQUM7QUFFWSx3QkFBTSxHQUFHLFFBQVEsQ0FBQztBQWJsQyxvQ0E0Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2UsXG4gIGxvd2VyQ2FzZSxcbiAga2ViYWJDYXNlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBzaW5ndWxhcml6ZSwgcGx1cmFsaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQgeyBCbHVlcHJpbnQgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbW9kZWwsIHNlcmlhbGl6ZXIsIENSVUQgYWN0aW9ucywgYW5kIHRlc3RzIGZvciBhIHJlc291cmNlXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvdXJjZUJsdWVwcmludCBleHRlbmRzIEJsdWVwcmludCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBwdWJsaWMgc3RhdGljIGJsdWVwcmludE5hbWUgPSAncmVzb3VyY2UnO1xuICBwdWJsaWMgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0dlbmVyYXRlcyBhIG1vZGVsLCBzZXJpYWxpemVyLCBDUlVEIGFjdGlvbnMsIGFuZCB0ZXN0cyBmb3IgYSByZXNvdXJjZSc7XG4gIHB1YmxpYyBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgcmVzb3VyY2UgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgY29tcGxldGUsIGVuZC10by1lbmQgUkVTVGZ1bCByZXNvdXJjZSBzY2FmZm9sZC4gVGhpcyBpbmNsdWRlcyBhIE1vZGVsIHRvIHJlcHJlc2VudFxuICAgIHRoZSBkYXRhLCBhIFNlcmlhbGl6ZXIgdG8gZGV0ZXJtaW5lIGhvdyB0byBzZW5kIGl0IG92ZXIgdGhlIHdpcmUsIENSVUQgYWN0aW9ucyBmb3IgbWFuaXB1bGF0aW5nXG4gICAgdGhlIHJlc291cmNlLCBhbmQgdGVzdHMgZm9yIGFsbCBvZiB0aGUgYWJvdmUuXG4gIGA7XG5cbiAgcHVibGljIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBwdWJsaWMgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIG5hbWUgPSBwbHVyYWxpemUobmFtZSk7XG4gICAgbGV0IHBsdXJhbCA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBjYW1lbENhc2VkOiBjYW1lbENhc2UobmFtZSksXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKSxcbiAgICAgIGRhc2hlcml6ZWQ6IGtlYmFiQ2FzZShuYW1lKSxcbiAgICAgIGh1bWFuaXplZDogbG93ZXJDYXNlKG5hbWUpXG4gICAgfTtcbiAgICBuYW1lID0gc2luZ3VsYXJpemUobmFtZSk7XG4gICAgbGV0IHNpbmd1bGFyID0ge1xuICAgICAgbmFtZSxcbiAgICAgIGNhbWVsQ2FzZWQ6IGNhbWVsQ2FzZShuYW1lKSxcbiAgICAgIGNsYXNzTmFtZTogdXBwZXJGaXJzdChjYW1lbENhc2UobmFtZSkpLFxuICAgICAgZGFzaGVyaXplZDoga2ViYWJDYXNlKG5hbWUpLFxuICAgICAgaHVtYW5pemVkOiBsb3dlckNhc2UobmFtZSlcbiAgICB9O1xuICAgIHJldHVybiB7IHBsdXJhbCwgc2luZ3VsYXIgfTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwb3N0SW5zdGFsbChhcmd2OiBhbnkpIHtcbiAgICB0aGlzLmFkZFJvdXRlKCdyZXNvdXJjZScsIHNpbmd1bGFyaXplKGFyZ3YubmFtZSkpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHBvc3RVbmluc3RhbGwoYXJndjogYW55KSB7XG4gICAgdGhpcy5yZW1vdmVSb3V0ZSgncmVzb3VyY2UnLCBzaW5ndWxhcml6ZShhcmd2Lm5hbWUpKTtcbiAgfVxuXG59XG4iXX0=