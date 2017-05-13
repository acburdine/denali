"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const CliTable = require("cli-table2");
const denali_cli_1 = require("denali-cli");
/**
 * Display all defined routes within your application.
 *
 * @package commands
 */
class RoutesCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                buildDummy: true
            });
            let application = yield project.createApplication();
            yield application.runInitializers();
            let routes = application.router.routes;
            let methods = Object.keys(routes);
            let table = new CliTable({
                head: ['URL', 'ACTION']
            });
            methods.forEach((method) => {
                let methodRoutes = routes[method];
                methodRoutes.forEach((route) => {
                    table.push([`${method.toUpperCase()} ${route.spec.replace(/\(\/\)$/, '/')}`, route.actionPath]);
                });
            });
            denali_cli_1.ui.info(table.toString());
        });
    }
}
/* tslint:disable:completed-docs typedef */
RoutesCommand.commandName = 'routes';
RoutesCommand.description = 'Display all defined routes within your application.';
RoutesCommand.longDescription = denali_cli_1.unwrap `
    Displays routes from your application and any routes added by addons.
    Display shows the method, endpoint, and the action associated to that
    route.`;
RoutesCommand.runsInApp = true;
RoutesCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    'print-slow-trees': {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    }
};
exports.default = RoutesCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3JvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBdUM7QUFDdkMsMkNBQTBEO0FBRzFEOzs7O0dBSUc7QUFDSCxtQkFBbUMsU0FBUSxvQkFBTztJQXlCMUMsR0FBRyxDQUFDLElBQVM7O1lBQ2pCLElBQUksT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQztnQkFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBQ25DLFVBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztZQUNILElBQUksV0FBVyxHQUFnQixNQUFNLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2pFLE1BQU0sV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3BDLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ3ZDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUM7Z0JBQ3ZCLElBQUksRUFBRSxDQUFFLEtBQUssRUFBRSxRQUFRLENBQUU7YUFDMUIsQ0FBQyxDQUFDO1lBRUgsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU07Z0JBQ3JCLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFbEMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUs7b0JBQ3pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBRSxHQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUcsSUFBSyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFFLENBQUMsQ0FBQztnQkFDeEcsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILGVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztLQUFBOztBQTlDRCwyQ0FBMkM7QUFDcEMseUJBQVcsR0FBRyxRQUFRLENBQUM7QUFDdkIseUJBQVcsR0FBRyxxREFBcUQsQ0FBQztBQUNwRSw2QkFBZSxHQUFHLG1CQUFNLENBQUE7OztXQUd0QixDQUFDO0FBRUgsdUJBQVMsR0FBRyxJQUFJLENBQUM7QUFFakIsbUJBQUssR0FBRztJQUNiLFdBQVcsRUFBRTtRQUNYLFdBQVcsRUFBRSxzQ0FBc0M7UUFDbkQsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWE7UUFDOUMsSUFBSSxFQUFPLFFBQVE7S0FDcEI7SUFDRCxrQkFBa0IsRUFBRTtRQUNsQixXQUFXLEVBQUUsd0VBQXdFO1FBQ3JGLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7Q0FDRixDQUFDO0FBdkJKLGdDQWtEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIENsaVRhYmxlIGZyb20gJ2NsaS10YWJsZTInO1xuaW1wb3J0IHsgdWksIENvbW1hbmQsIFByb2plY3QsIHVud3JhcCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4uL2xpYi9ydW50aW1lL2FwcGxpY2F0aW9uJztcblxuLyoqXG4gKiBEaXNwbGF5IGFsbCBkZWZpbmVkIHJvdXRlcyB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3V0ZXNDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAncm91dGVzJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0Rpc3BsYXkgYWxsIGRlZmluZWQgcm91dGVzIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgRGlzcGxheXMgcm91dGVzIGZyb20geW91ciBhcHBsaWNhdGlvbiBhbmQgYW55IHJvdXRlcyBhZGRlZCBieSBhZGRvbnMuXG4gICAgRGlzcGxheSBzaG93cyB0aGUgbWV0aG9kLCBlbmRwb2ludCwgYW5kIHRoZSBhY3Rpb24gYXNzb2NpYXRlZCB0byB0aGF0XG4gICAgcm91dGUuYDtcblxuICBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICAncHJpbnQtc2xvdy10cmVlcyc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgb3V0IGFuIGFuYWx5c2lzIG9mIHRoZSBidWlsZCBwcm9jZXNzLCBzaG93aW5nIHRoZSBzbG93ZXN0IG5vZGVzLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgcHJpbnRTbG93VHJlZXM6IGFyZ3YucHJpbnRTbG93VHJlZXMsXG4gICAgICBidWlsZER1bW15OiB0cnVlXG4gICAgfSk7XG4gICAgbGV0IGFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbiA9IGF3YWl0IHByb2plY3QuY3JlYXRlQXBwbGljYXRpb24oKTtcbiAgICBhd2FpdCBhcHBsaWNhdGlvbi5ydW5Jbml0aWFsaXplcnMoKTtcbiAgICBsZXQgcm91dGVzID0gYXBwbGljYXRpb24ucm91dGVyLnJvdXRlcztcbiAgICBsZXQgbWV0aG9kcyA9IE9iamVjdC5rZXlzKHJvdXRlcyk7XG4gICAgbGV0IHRhYmxlID0gbmV3IENsaVRhYmxlKHtcbiAgICAgIGhlYWQ6IFsgJ1VSTCcsICdBQ1RJT04nIF1cbiAgICB9KTtcblxuICAgIG1ldGhvZHMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgICBsZXQgbWV0aG9kUm91dGVzID0gcm91dGVzW21ldGhvZF07XG5cbiAgICAgIG1ldGhvZFJvdXRlcy5mb3JFYWNoKChyb3V0ZSkgPT4ge1xuICAgICAgICB0YWJsZS5wdXNoKFsgYCR7IG1ldGhvZC50b1VwcGVyQ2FzZSgpIH0gJHsgcm91dGUuc3BlYy5yZXBsYWNlKC9cXChcXC9cXCkkLywgJy8nKSB9YCwgcm91dGUuYWN0aW9uUGF0aCBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdWkuaW5mbyh0YWJsZS50b1N0cmluZygpKTtcbiAgfVxuXG59XG4iXX0=