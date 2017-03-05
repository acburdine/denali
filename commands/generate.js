"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../lib/utils/unwrap");
/**
 * Scaffold code for your app.
 *
 * @package commands
 */
class GenerateCommand extends denali_cli_1.Command {
    static configureSubcommands(commandName, yargs, projectPkg) {
        return denali_cli_1.Blueprint.findAndConfigureBlueprints(yargs, 'generate', projectPkg);
    }
}
/* tslint:disable:completed-docs typedef */
GenerateCommand.commandName = 'generate';
GenerateCommand.description = 'Scaffold code for your app.';
GenerateCommand.longDescription = unwrap_1.default `
    Usage: denali generate <blueprint> [options]

    Generates code from the given blueprint. Blueprints are templates used by the
    generate command, but they can go beyond simple templating (i.e. installing
    addons).
  `;
GenerateCommand.params = '<blueprint>';
GenerateCommand.flags = {
    skipPostInstall: {
        description: "Don't run any post install hooks for the blueprint",
        default: false,
        type: 'boolean'
    }
};
exports.default = GenerateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvZ2VuZXJhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwyQ0FBNkQ7QUFDN0QsZ0RBQXlDO0FBR3pDOzs7O0dBSUc7QUFDSCxxQkFBcUMsU0FBUSxvQkFBTztJQXVCeEMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFdBQW1CLEVBQUUsS0FBVSxFQUFFLFVBQWU7UUFDcEYsTUFBTSxDQUFDLHNCQUFTLENBQUMsMEJBQTBCLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM3RSxDQUFDOztBQXZCRCwyQ0FBMkM7QUFDN0IsMkJBQVcsR0FBRyxVQUFVLENBQUM7QUFDekIsMkJBQVcsR0FBRyw2QkFBNkIsQ0FBQztBQUM1QywrQkFBZSxHQUFHLGdCQUFNLENBQUE7Ozs7OztHQU1yQyxDQUFDO0FBRVksc0JBQU0sR0FBRyxhQUFhLENBQUM7QUFFdkIscUJBQUssR0FBRztJQUNwQixlQUFlLEVBQUU7UUFDZixXQUFXLEVBQUUsb0RBQW9EO1FBQ2pFLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7Q0FDRixDQUFDO0FBckJKLGtDQTJCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIG1lcmdlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyB1aSwgQ29tbWFuZCwgUHJvamVjdCwgQmx1ZXByaW50IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4uL2xpYi91dGlscy91bndyYXAnO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG4vKipcbiAqIFNjYWZmb2xkIGNvZGUgZm9yIHlvdXIgYXBwLlxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdlbmVyYXRlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgcHVibGljIHN0YXRpYyBjb21tYW5kTmFtZSA9ICdnZW5lcmF0ZSc7XG4gIHB1YmxpYyBzdGF0aWMgZGVzY3JpcHRpb24gPSAnU2NhZmZvbGQgY29kZSBmb3IgeW91ciBhcHAuJztcbiAgcHVibGljIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgVXNhZ2U6IGRlbmFsaSBnZW5lcmF0ZSA8Ymx1ZXByaW50PiBbb3B0aW9uc11cblxuICAgIEdlbmVyYXRlcyBjb2RlIGZyb20gdGhlIGdpdmVuIGJsdWVwcmludC4gQmx1ZXByaW50cyBhcmUgdGVtcGxhdGVzIHVzZWQgYnkgdGhlXG4gICAgZ2VuZXJhdGUgY29tbWFuZCwgYnV0IHRoZXkgY2FuIGdvIGJleW9uZCBzaW1wbGUgdGVtcGxhdGluZyAoaS5lLiBpbnN0YWxsaW5nXG4gICAgYWRkb25zKS5cbiAgYDtcblxuICBwdWJsaWMgc3RhdGljIHBhcmFtcyA9ICc8Ymx1ZXByaW50Pic7XG5cbiAgcHVibGljIHN0YXRpYyBmbGFncyA9IHtcbiAgICBza2lwUG9zdEluc3RhbGw6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IHJ1biBhbnkgcG9zdCBpbnN0YWxsIGhvb2tzIGZvciB0aGUgYmx1ZXByaW50XCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIHByb3RlY3RlZCBzdGF0aWMgY29uZmlndXJlU3ViY29tbWFuZHMoY29tbWFuZE5hbWU6IHN0cmluZywgeWFyZ3M6IGFueSwgcHJvamVjdFBrZzogYW55KTogeWFyZ3MuQXJndiB7XG4gICAgcmV0dXJuIEJsdWVwcmludC5maW5kQW5kQ29uZmlndXJlQmx1ZXByaW50cyh5YXJncywgJ2dlbmVyYXRlJywgcHJvamVjdFBrZyk7XG4gIH1cblxufVxuIl19