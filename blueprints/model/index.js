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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9tb2RlbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUdnQjtBQUNoQiwyQ0FBdUM7QUFDdkMsbURBQTRDO0FBRTVDOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxzQkFBUztJQWU1QyxNQUFNLENBQUMsSUFBUztRQUNyQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQztZQUNMLElBQUk7WUFDSixTQUFTLEVBQUUsbUJBQVUsQ0FBQyxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDLENBQUM7SUFDSixDQUFDOztBQW5CRCwyQ0FBMkM7QUFDN0IsNEJBQWEsR0FBRyxPQUFPLENBQUM7QUFDeEIsMEJBQVcsR0FBRyx5QkFBeUIsQ0FBQztBQUN4Qyw4QkFBZSxHQUFHLGdCQUFNLENBQUE7Ozs7OztHQU1yQyxDQUFDO0FBRVkscUJBQU0sR0FBRyxRQUFRLENBQUM7QUFibEMsaUNBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgdXBwZXJGaXJzdCxcbiAgY2FtZWxDYXNlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBCbHVlcHJpbnQgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWxcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHB1YmxpYyBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdtb2RlbCc7XG4gIHB1YmxpYyBzdGF0aWMgZGVzY3JpcHRpb24gPSAnR2VuZXJhdGVzIGEgYmxhbmsgbW9kZWwnO1xuICBwdWJsaWMgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIG1vZGVsIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBhIGJsYW5rIG1vZGVsLCBhbG9uZyB3aXRoIGEgc2VyaWFsaXplciBmb3IgdGhhdCBtb2RlbCwgYW5kIHVuaXQgdGVzdHMgZm9yIGJvdGguXG5cbiAgICBHdWlkZXM6IGh0dHA6Ly9kZW5hbGlqcy5vcmcvbWFzdGVyL2d1aWRlcy9kYXRhL21vZGVscy9cbiAgYDtcblxuICBwdWJsaWMgc3RhdGljIHBhcmFtcyA9ICc8bmFtZT4nO1xuXG4gIHB1YmxpYyBsb2NhbHMoYXJndjogYW55KSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWUsXG4gICAgICBjbGFzc05hbWU6IHVwcGVyRmlyc3QoY2FtZWxDYXNlKG5hbWUpKVxuICAgIH07XG4gIH1cblxufVxuIl19