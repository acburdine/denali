"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const unwrap_1 = require("../lib/utils/unwrap");
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
RoutesCommand.longDescription = unwrap_1.default `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3JvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnREFBeUM7QUFDekMsdUNBQXVDO0FBQ3ZDLDJDQUFrRDtBQUdsRDs7OztHQUlHO0FBQ0gsbUJBQW1DLFNBQVEsb0JBQU87SUF5Qm5DLEdBQUcsQ0FBQyxJQUFTOztZQUN4QixJQUFJLE9BQU8sR0FBRyxJQUFJLG9CQUFPLENBQUM7Z0JBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUNuQyxVQUFVLEVBQUUsSUFBSTthQUNqQixDQUFDLENBQUM7WUFDSCxJQUFJLFdBQVcsR0FBZ0IsTUFBTSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNqRSxNQUFNLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN2QyxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLElBQUksS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDO2dCQUN2QixJQUFJLEVBQUUsQ0FBRSxLQUFLLEVBQUUsUUFBUSxDQUFFO2FBQzFCLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO2dCQUNyQixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLO29CQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUUsR0FBSSxNQUFNLENBQUMsV0FBVyxFQUFHLElBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBRSxDQUFDLENBQUM7Z0JBQ3hHLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxlQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7S0FBQTs7QUE5Q0QsMkNBQTJDO0FBQzdCLHlCQUFXLEdBQUcsUUFBUSxDQUFDO0FBQ3ZCLHlCQUFXLEdBQUcscURBQXFELENBQUM7QUFDcEUsNkJBQWUsR0FBRyxnQkFBTSxDQUFBOzs7V0FHN0IsQ0FBQztBQUVJLHVCQUFTLEdBQUcsSUFBSSxDQUFDO0FBRWpCLG1CQUFLLEdBQUc7SUFDcEIsV0FBVyxFQUFFO1FBQ1gsV0FBVyxFQUFFLHNDQUFzQztRQUNuRCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYTtRQUM5QyxJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELGtCQUFrQixFQUFFO1FBQ2xCLFdBQVcsRUFBRSx3RUFBd0U7UUFDckYsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUF2QkosZ0NBa0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVud3JhcCBmcm9tICcuLi9saWIvdXRpbHMvdW53cmFwJztcbmltcG9ydCAqIGFzIENsaVRhYmxlIGZyb20gJ2NsaS10YWJsZTInO1xuaW1wb3J0IHsgdWksIENvbW1hbmQsIFByb2plY3QgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCBBcHBsaWNhdGlvbiBmcm9tICcuLi9saWIvcnVudGltZS9hcHBsaWNhdGlvbic7XG5cbi8qKlxuICogRGlzcGxheSBhbGwgZGVmaW5lZCByb3V0ZXMgd2l0aGluIHlvdXIgYXBwbGljYXRpb24uXG4gKlxuICogQHBhY2thZ2UgY29tbWFuZHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm91dGVzQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgcHVibGljIHN0YXRpYyBjb21tYW5kTmFtZSA9ICdyb3V0ZXMnO1xuICBwdWJsaWMgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0Rpc3BsYXkgYWxsIGRlZmluZWQgcm91dGVzIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLic7XG4gIHB1YmxpYyBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIERpc3BsYXlzIHJvdXRlcyBmcm9tIHlvdXIgYXBwbGljYXRpb24gYW5kIGFueSByb3V0ZXMgYWRkZWQgYnkgYWRkb25zLlxuICAgIERpc3BsYXkgc2hvd3MgdGhlIG1ldGhvZCwgZW5kcG9pbnQsIGFuZCB0aGUgYWN0aW9uIGFzc29jaWF0ZWQgdG8gdGhhdFxuICAgIHJvdXRlLmA7XG5cbiAgcHVibGljIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHB1YmxpYyBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICAncHJpbnQtc2xvdy10cmVlcyc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgb3V0IGFuIGFuYWx5c2lzIG9mIHRoZSBidWlsZCBwcm9jZXNzLCBzaG93aW5nIHRoZSBzbG93ZXN0IG5vZGVzLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIHB1YmxpYyBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgbGV0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICBlbnZpcm9ubWVudDogYXJndi5lbnZpcm9ubWVudCxcbiAgICAgIHByaW50U2xvd1RyZWVzOiBhcmd2LnByaW50U2xvd1RyZWVzLFxuICAgICAgYnVpbGREdW1teTogdHJ1ZVxuICAgIH0pO1xuICAgIGxldCBhcHBsaWNhdGlvbjogQXBwbGljYXRpb24gPSBhd2FpdCBwcm9qZWN0LmNyZWF0ZUFwcGxpY2F0aW9uKCk7XG4gICAgYXdhaXQgYXBwbGljYXRpb24ucnVuSW5pdGlhbGl6ZXJzKCk7XG4gICAgbGV0IHJvdXRlcyA9IGFwcGxpY2F0aW9uLnJvdXRlci5yb3V0ZXM7XG4gICAgbGV0IG1ldGhvZHMgPSBPYmplY3Qua2V5cyhyb3V0ZXMpO1xuICAgIGxldCB0YWJsZSA9IG5ldyBDbGlUYWJsZSh7XG4gICAgICBoZWFkOiBbICdVUkwnLCAnQUNUSU9OJyBdXG4gICAgfSk7XG5cbiAgICBtZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgbGV0IG1ldGhvZFJvdXRlcyA9IHJvdXRlc1ttZXRob2RdO1xuXG4gICAgICBtZXRob2RSb3V0ZXMuZm9yRWFjaCgocm91dGUpID0+IHtcbiAgICAgICAgdGFibGUucHVzaChbIGAkeyBtZXRob2QudG9VcHBlckNhc2UoKSB9ICR7IHJvdXRlLnNwZWMucmVwbGFjZSgvXFwoXFwvXFwpJC8sICcvJykgfWAsIHJvdXRlLmFjdGlvblBhdGggXSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHVpLmluZm8odGFibGUudG9TdHJpbmcoKSk7XG4gIH1cblxufVxuIl19