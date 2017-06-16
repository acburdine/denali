"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../../lib/utils/unwrap");
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
ModelBlueprint.longDescription = unwrap_1.default `
    Usage: denali generate model <name> [options]

    Generates a blank model, along with a serializer for that model, and unit tests for both.

    Guides: http://denalijs.org/master/guides/data/models/
  `;
ModelBlueprint.params = '<name>';
exports.default = ModelBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9tb2RlbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQiwyQ0FBdUM7QUFDdkMsbURBQTRDO0FBRTVDOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxzQkFBUztJQWVuRCxNQUFNLENBQUMsSUFBUztRQUNkLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQkFBVSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkMsQ0FBQztJQUNKLENBQUM7O0FBbkJELDJDQUEyQztBQUNwQyw0QkFBYSxHQUFHLE9BQU8sQ0FBQztBQUN4QiwwQkFBVyxHQUFHLHlCQUF5QixDQUFDO0FBQ3hDLDhCQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7Ozs7O0dBTTlCLENBQUM7QUFFSyxxQkFBTSxHQUFHLFFBQVEsQ0FBQztBQWIzQixpQ0F1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB1cHBlckZpcnN0LFxuICBjYW1lbENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IEJsdWVwcmludCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi8uLi9saWIvdXRpbHMvdW53cmFwJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBibGFuayBtb2RlbFxuICpcbiAqIEBwYWNrYWdlIGJsdWVwcmludHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxCbHVlcHJpbnQgZXh0ZW5kcyBCbHVlcHJpbnQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGJsdWVwcmludE5hbWUgPSAnbW9kZWwnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWwnO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgbW9kZWwgPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWwsIGFsb25nIHdpdGggYSBzZXJpYWxpemVyIGZvciB0aGF0IG1vZGVsLCBhbmQgdW5pdCB0ZXN0cyBmb3IgYm90aC5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL2RhdGEvbW9kZWxzL1xuICBgO1xuXG4gIHN0YXRpYyBwYXJhbXMgPSAnPG5hbWU+JztcblxuICBsb2NhbHMoYXJndjogYW55KSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKVxuICAgIH07XG4gIH1cblxufVxuIl19