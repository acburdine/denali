"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denali_cli_1 = require("denali-cli");
const inflection_1 = require("inflection");
const lodash_1 = require("lodash");
const unwrap_1 = require("../../lib/utils/unwrap");
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
ORMAdapterBlueprint.longDescription = unwrap_1.default `
    Usage: denali generate orm-adapter <name> [options]

    Generates a new ORM adapter with stubs for all the required adapter methods. Note: this is
    typically an advanced use case (i.e. using a niche, specialty database). You should check to
    make sure there isn't already a Denali addon that implements the ORM adapter you need.

    Guides: http://denalijs.org/master/guides/data/orm-adapters/
  `;
ORMAdapterBlueprint.params = '<name>';
exports.default = ORMAdapterBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9vcm0tYWRhcHRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUF1QztBQUN2QywyQ0FBeUM7QUFDekMsbUNBR2dCO0FBQ2hCLG1EQUE0QztBQUU1Qzs7OztHQUlHO0FBQ0gseUJBQXlDLFNBQVEsc0JBQVM7SUFpQmpELE1BQU0sQ0FBQyxJQUFTO1FBQ3JCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxHQUFHLHdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkMsQ0FBQztJQUNKLENBQUM7O0FBdEJELDJDQUEyQztBQUM3QixpQ0FBYSxHQUFHLGFBQWEsQ0FBQztBQUM5QiwrQkFBVyxHQUFHLHVFQUF1RSxDQUFDO0FBQ3RGLG1DQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7Ozs7Ozs7R0FRckMsQ0FBQztBQUVZLDBCQUFNLEdBQUcsUUFBUSxDQUFDO0FBZmxDLHNDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJsdWVwcmludCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHsgc2luZ3VsYXJpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi8uLi9saWIvdXRpbHMvdW53cmFwJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBibGFuayBPUk0gYWRhcHRlciB3aXRoIHN0dWJzIGZvciBhbGwgdGhlIHJlcXVpcmVkIG1ldGhvZHNcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9STUFkYXB0ZXJCbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgcHVibGljIHN0YXRpYyBibHVlcHJpbnROYW1lID0gJ29ybS1hZGFwdGVyJztcbiAgcHVibGljIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdHZW5lcmF0ZXMgYSBibGFuayBPUk0gYWRhcHRlciB3aXRoIHN0dWJzIGZvciBhbGwgdGhlIHJlcXVpcmVkIG1ldGhvZHMnO1xuICBwdWJsaWMgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIG9ybS1hZGFwdGVyIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhIG5ldyBPUk0gYWRhcHRlciB3aXRoIHN0dWJzIGZvciBhbGwgdGhlIHJlcXVpcmVkIGFkYXB0ZXIgbWV0aG9kcy4gTm90ZTogdGhpcyBpc1xuICAgIHR5cGljYWxseSBhbiBhZHZhbmNlZCB1c2UgY2FzZSAoaS5lLiB1c2luZyBhIG5pY2hlLCBzcGVjaWFsdHkgZGF0YWJhc2UpLiBZb3Ugc2hvdWxkIGNoZWNrIHRvXG4gICAgbWFrZSBzdXJlIHRoZXJlIGlzbid0IGFscmVhZHkgYSBEZW5hbGkgYWRkb24gdGhhdCBpbXBsZW1lbnRzIHRoZSBPUk0gYWRhcHRlciB5b3UgbmVlZC5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2RhdGEvb3JtLWFkYXB0ZXJzL1xuICBgO1xuXG4gIHB1YmxpYyBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgcHVibGljIGxvY2Fscyhhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICBuYW1lID0gc2luZ3VsYXJpemUobmFtZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKVxuICAgIH07XG4gIH1cblxufVxuIl19