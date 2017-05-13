"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
/**
 * Generates a blank model
 *
 * @package blueprints
 */
class ModelBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        return {
            name,
            className: lodash_1.upperFirst(lodash_1.camelCase(name))
        };
    }
}
/* tslint:disable:completed-docs typedef */
ModelBlueprint.blueprintName = 'model';
ModelBlueprint.description = 'Generates a blank model';
ModelBlueprint.longDescription = denali_cli_1.unwrap `
    Usage: denali generate model <name> [options]

    Generates a blank model, along with a serializer for that model, and unit tests for both.

    Guides: http://denalijs.org/master/guides/data/models/
  `;
ModelBlueprint.params = '<name>';
exports.default = ModelBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9tb2RlbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQiwyQ0FBK0M7QUFFL0M7Ozs7R0FJRztBQUNILG9CQUFvQyxTQUFRLHNCQUFTO0lBZW5ELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLG1CQUFVLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QyxDQUFDO0lBQ0osQ0FBQzs7QUFuQkQsMkNBQTJDO0FBQ3BDLDRCQUFhLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcseUJBQXlCLENBQUM7QUFDeEMsOEJBQWUsR0FBRyxtQkFBTSxDQUFBOzs7Ozs7R0FNOUIsQ0FBQztBQUVLLHFCQUFNLEdBQUcsUUFBUSxDQUFDO0FBYjNCLGlDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIHVwcGVyRmlyc3QsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgQmx1ZXByaW50LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBibGFuayBtb2RlbFxuICpcbiAqIEBwYWNrYWdlIGJsdWVwcmludHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxCbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnbW9kZWwnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWwnO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgbW9kZWwgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWwsIGFsb25nIHdpdGggYSBzZXJpYWxpemVyIGZvciB0aGF0IG1vZGVsLCBhbmQgdW5pdCB0ZXN0cyBmb3IgYm90aC5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2RhdGEvbW9kZWxzL1xuICBgO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBsb2NhbHMoYXJndjogYW55KSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKVxuICAgIH07XG4gIH1cblxufVxuIl19