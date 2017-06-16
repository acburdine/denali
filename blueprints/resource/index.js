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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9yZXNvdXJjZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FLZ0I7QUFDaEIsMkNBQW9EO0FBQ3BELDJDQUF1QztBQUN2QyxtREFBNEM7QUFFNUM7Ozs7R0FJRztBQUNILHVCQUF1QyxTQUFRLHNCQUFTO0lBZXRELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixJQUFJLEdBQUcsc0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJLE1BQU0sR0FBRztZQUNYLElBQUk7WUFDSixVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1NBQzNCLENBQUM7UUFDRixJQUFJLEdBQUcsd0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixJQUFJLFFBQVEsR0FBRztZQUNiLElBQUk7WUFDSixVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxVQUFVLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1NBQzNCLENBQUM7UUFDRixNQUFNLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUVLLFdBQVcsQ0FBQyxJQUFTOztZQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSx3QkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQTtJQUVLLGFBQWEsQ0FBQyxJQUFTOztZQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSx3QkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7S0FBQTs7QUF4Q0QsMkNBQTJDO0FBQ3BDLCtCQUFhLEdBQUcsVUFBVSxDQUFDO0FBQzNCLDZCQUFXLEdBQUcsdUVBQXVFLENBQUM7QUFDdEYsaUNBQWUsR0FBRyxnQkFBTSxDQUFBOzs7Ozs7R0FNOUIsQ0FBQztBQUVLLHdCQUFNLEdBQUcsUUFBUSxDQUFDO0FBYjNCLG9DQTRDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZSxcbiAgbG93ZXJDYXNlLFxuICBrZWJhYkNhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHNpbmd1bGFyaXplLCBwbHVyYWxpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCB7IEJsdWVwcmludCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi8uLi9saWIvdXRpbHMvdW53cmFwJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBtb2RlbCwgc2VyaWFsaXplciwgQ1JVRCBhY3Rpb25zLCBhbmQgdGVzdHMgZm9yIGEgcmVzb3VyY2VcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc291cmNlQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBibHVlcHJpbnROYW1lID0gJ3Jlc291cmNlJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0dlbmVyYXRlcyBhIG1vZGVsLCBzZXJpYWxpemVyLCBDUlVEIGFjdGlvbnMsIGFuZCB0ZXN0cyBmb3IgYSByZXNvdXJjZSc7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgVXNhZ2U6IGRlbmFsaSBnZW5lcmF0ZSByZXNvdXJjZSA8bmFtZT4gW29wdGlvbnNdXG5cbiAgICBHZW5lcmF0ZXMgYSBjb21wbGV0ZSwgZW5kLXRvLWVuZCBSRVNUZnVsIHJlc291cmNlIHNjYWZmb2xkLiBUaGlzIGluY2x1ZGVzIGEgTW9kZWwgdG8gcmVwcmVzZW50XG4gICAgdGhlIGRhdGEsIGEgU2VyaWFsaXplciB0byBkZXRlcm1pbmUgaG93IHRvIHNlbmQgaXQgb3ZlciB0aGUgd2lyZSwgQ1JVRCBhY3Rpb25zIGZvciBtYW5pcHVsYXRpbmdcbiAgICB0aGUgcmVzb3VyY2UsIGFuZCB0ZXN0cyBmb3IgYWxsIG9mIHRoZSBhYm92ZS5cbiAgYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIG5hbWUgPSBwbHVyYWxpemUobmFtZSk7XG4gICAgbGV0IHBsdXJhbCA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBjYW1lbENhc2VkOiBjYW1lbENhc2UobmFtZSksXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKSxcbiAgICAgIGRhc2hlcml6ZWQ6IGtlYmFiQ2FzZShuYW1lKSxcbiAgICAgIGh1bWFuaXplZDogbG93ZXJDYXNlKG5hbWUpXG4gICAgfTtcbiAgICBuYW1lID0gc2luZ3VsYXJpemUobmFtZSk7XG4gICAgbGV0IHNpbmd1bGFyID0ge1xuICAgICAgbmFtZSxcbiAgICAgIGNhbWVsQ2FzZWQ6IGNhbWVsQ2FzZShuYW1lKSxcbiAgICAgIGNsYXNzTmFtZTogdXBwZXJGaXJzdChjYW1lbENhc2UobmFtZSkpLFxuICAgICAgZGFzaGVyaXplZDoga2ViYWJDYXNlKG5hbWUpLFxuICAgICAgaHVtYW5pemVkOiBsb3dlckNhc2UobmFtZSlcbiAgICB9O1xuICAgIHJldHVybiB7IHBsdXJhbCwgc2luZ3VsYXIgfTtcbiAgfVxuXG4gIGFzeW5jIHBvc3RJbnN0YWxsKGFyZ3Y6IGFueSkge1xuICAgIHRoaXMuYWRkUm91dGUoJ3Jlc291cmNlJywgc2luZ3VsYXJpemUoYXJndi5uYW1lKSk7XG4gIH1cblxuICBhc3luYyBwb3N0VW5pbnN0YWxsKGFyZ3Y6IGFueSkge1xuICAgIHRoaXMucmVtb3ZlUm91dGUoJ3Jlc291cmNlJywgc2luZ3VsYXJpemUoYXJndi5uYW1lKSk7XG4gIH1cblxufVxuIl19