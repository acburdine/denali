"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const repl = require("repl");
const unwrap_1 = require("../lib/utils/unwrap");
const rewrap_1 = require("../lib/utils/rewrap");
const chalk = require("chalk");
const denali_cli_1 = require("denali-cli");
/**
 * Launch a REPL with your application loaded
 *
 * @package commands
 */
class ConsoleCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            denali_cli_1.ui.info(`Loading ${argv.environment} environment. Type '.help' for details`);
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                buildDummy: true
            });
            let application = yield project.createApplication();
            if (application.environment === 'production') {
                denali_cli_1.ui.warn(rewrap_1.default `WARNING: Your console is running in production environment, meaning your
      production configuration is being used. This means your app is likely connecting to live,
      production database. Use caution!`);
            }
            yield application.runInitializers();
            let consoleRepl = repl.start({
                prompt: 'denali> ',
                useGlobal: true
            });
            let context = {
                application,
                container: application.container,
                modelFor(type) {
                    return application.container.lookup(`model:${type}`);
                }
            };
            lodash_1.assign(global, context);
            consoleRepl.defineCommand('help', {
                help: '',
                action() {
                    // tslint:disable-next-line:no-console
                    console.log(rewrap_1.default `
          Welcome to the Denali console!

          This is a fully interactive REPL for your Denali app. That means normal JavaScript works
          here. Your application is loaded (but not started) in the background, allowing you to
          inspect the runtime state of your app.

          The following variables are availabe:

          * ${chalk.underline('application')} - an instance of your Application class
          * ${chalk.underline('container')} - shortcut to application.container. Use this to
            lookup the various classes associated with your app (i.e. actions, models, etc)
        `);
                    this.displayPrompt();
                }
            });
        });
    }
}
/* tslint:disable:completed-docs typedef */
ConsoleCommand.commandName = 'console';
ConsoleCommand.description = 'Launch a REPL with your application loaded';
ConsoleCommand.longDescription = unwrap_1.default `
    Starts a REPL (Read-Eval-Print Loop) with your application initialized and
    loaded into memory. Type \`.help\` in the REPL environment for more details.`;
ConsoleCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'string'
    }
};
ConsoleCommand.runsInApp = true;
exports.default = ConsoleCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJjb21tYW5kcy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUVnQjtBQUNoQiw2QkFBNkI7QUFDN0IsZ0RBQXlDO0FBQ3pDLGdEQUF5QztBQUN6QywrQkFBK0I7QUFDL0IsMkNBQWtEO0FBRWxEOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxvQkFBTztJQXdCM0MsR0FBRyxDQUFDLElBQVM7O1lBQ2pCLGVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBWSxJQUFJLENBQUMsV0FBWSx3Q0FBd0MsQ0FBQyxDQUFDO1lBQy9FLElBQUksT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQztnQkFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBQ25DLFVBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztZQUNILElBQUksV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDcEQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxlQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFNLENBQUE7O3dDQUVvQixDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUVELE1BQU0sV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXBDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQzNCLE1BQU0sRUFBRSxVQUFVO2dCQUNsQixTQUFTLEVBQUUsSUFBSTthQUNoQixDQUFDLENBQUM7WUFFSCxJQUFJLE9BQU8sR0FBRztnQkFDWixXQUFXO2dCQUNYLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztnQkFDaEMsUUFBUSxDQUFDLElBQVk7b0JBQ25CLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFVLElBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ3pELENBQUM7YUFDRixDQUFDO1lBQ0YsZUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV4QixXQUFXLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDaEMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsTUFBTTtvQkFDSixzQ0FBc0M7b0JBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQU0sQ0FBQTs7Ozs7Ozs7O2NBU1gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUU7Y0FDL0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUU7O1NBRW5DLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7O0FBeEVELDJDQUEyQztBQUNwQywwQkFBVyxHQUFHLFNBQVMsQ0FBQztBQUN4QiwwQkFBVyxHQUFHLDRDQUE0QyxDQUFDO0FBQzNELDhCQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7aUZBRWdELENBQUM7QUFFekUsb0JBQUssR0FBRztJQUNiLFdBQVcsRUFBRTtRQUNYLFdBQVcsRUFBRSxzQ0FBc0M7UUFDbkQsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWE7UUFDOUMsSUFBSSxFQUFPLFFBQVE7S0FDcEI7SUFDRCxjQUFjLEVBQUU7UUFDZCxXQUFXLEVBQUUsd0VBQXdFO1FBQ3JGLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFFBQVE7S0FDcEI7Q0FDRixDQUFDO0FBRUssd0JBQVMsR0FBRyxJQUFJLENBQUM7QUF0QjFCLGlDQTRFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFzc2lnblxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcmVwbCBmcm9tICdyZXBsJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5pbXBvcnQgcmV3cmFwIGZyb20gJy4uL2xpYi91dGlscy9yZXdyYXAnO1xuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHsgdWksIENvbW1hbmQsIFByb2plY3QgfSBmcm9tICdkZW5hbGktY2xpJztcblxuLyoqXG4gKiBMYXVuY2ggYSBSRVBMIHdpdGggeW91ciBhcHBsaWNhdGlvbiBsb2FkZWRcbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25zb2xlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ2NvbnNvbGUnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnTGF1bmNoIGEgUkVQTCB3aXRoIHlvdXIgYXBwbGljYXRpb24gbG9hZGVkJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBTdGFydHMgYSBSRVBMIChSZWFkLUV2YWwtUHJpbnQgTG9vcCkgd2l0aCB5b3VyIGFwcGxpY2F0aW9uIGluaXRpYWxpemVkIGFuZFxuICAgIGxvYWRlZCBpbnRvIG1lbW9yeS4gVHlwZSBcXGAuaGVscFxcYCBpbiB0aGUgUkVQTCBlbnZpcm9ubWVudCBmb3IgbW9yZSBkZXRhaWxzLmA7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIGVudmlyb25tZW50OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0YXJnZXQgZW52aXJvbm1lbnQgdG8gYnVpbGQgZm9yLicsXG4gICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgcHJpbnRTbG93VHJlZXM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgb3V0IGFuIGFuYWx5c2lzIG9mIHRoZSBidWlsZCBwcm9jZXNzLCBzaG93aW5nIHRoZSBzbG93ZXN0IG5vZGVzLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9XG4gIH07XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIHVpLmluZm8oYExvYWRpbmcgJHsgYXJndi5lbnZpcm9ubWVudCB9IGVudmlyb25tZW50LiBUeXBlICcuaGVscCcgZm9yIGRldGFpbHNgKTtcbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgcHJpbnRTbG93VHJlZXM6IGFyZ3YucHJpbnRTbG93VHJlZXMsXG4gICAgICBidWlsZER1bW15OiB0cnVlXG4gICAgfSk7XG4gICAgbGV0IGFwcGxpY2F0aW9uID0gYXdhaXQgcHJvamVjdC5jcmVhdGVBcHBsaWNhdGlvbigpO1xuICAgIGlmIChhcHBsaWNhdGlvbi5lbnZpcm9ubWVudCA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB1aS53YXJuKHJld3JhcGBXQVJOSU5HOiBZb3VyIGNvbnNvbGUgaXMgcnVubmluZyBpbiBwcm9kdWN0aW9uIGVudmlyb25tZW50LCBtZWFuaW5nIHlvdXJcbiAgICAgIHByb2R1Y3Rpb24gY29uZmlndXJhdGlvbiBpcyBiZWluZyB1c2VkLiBUaGlzIG1lYW5zIHlvdXIgYXBwIGlzIGxpa2VseSBjb25uZWN0aW5nIHRvIGxpdmUsXG4gICAgICBwcm9kdWN0aW9uIGRhdGFiYXNlLiBVc2UgY2F1dGlvbiFgKTtcbiAgICB9XG5cbiAgICBhd2FpdCBhcHBsaWNhdGlvbi5ydW5Jbml0aWFsaXplcnMoKTtcblxuICAgIGxldCBjb25zb2xlUmVwbCA9IHJlcGwuc3RhcnQoe1xuICAgICAgcHJvbXB0OiAnZGVuYWxpPiAnLFxuICAgICAgdXNlR2xvYmFsOiB0cnVlXG4gICAgfSk7XG5cbiAgICBsZXQgY29udGV4dCA9IHtcbiAgICAgIGFwcGxpY2F0aW9uLFxuICAgICAgY29udGFpbmVyOiBhcHBsaWNhdGlvbi5jb250YWluZXIsXG4gICAgICBtb2RlbEZvcih0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGFwcGxpY2F0aW9uLmNvbnRhaW5lci5sb29rdXAoYG1vZGVsOiR7IHR5cGUgfWApO1xuICAgICAgfVxuICAgIH07XG4gICAgYXNzaWduKGdsb2JhbCwgY29udGV4dCk7XG5cbiAgICBjb25zb2xlUmVwbC5kZWZpbmVDb21tYW5kKCdoZWxwJywge1xuICAgICAgaGVscDogJycsXG4gICAgICBhY3Rpb24oKSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgICAgIGNvbnNvbGUubG9nKHJld3JhcGBcbiAgICAgICAgICBXZWxjb21lIHRvIHRoZSBEZW5hbGkgY29uc29sZSFcblxuICAgICAgICAgIFRoaXMgaXMgYSBmdWxseSBpbnRlcmFjdGl2ZSBSRVBMIGZvciB5b3VyIERlbmFsaSBhcHAuIFRoYXQgbWVhbnMgbm9ybWFsIEphdmFTY3JpcHQgd29ya3NcbiAgICAgICAgICBoZXJlLiBZb3VyIGFwcGxpY2F0aW9uIGlzIGxvYWRlZCAoYnV0IG5vdCBzdGFydGVkKSBpbiB0aGUgYmFja2dyb3VuZCwgYWxsb3dpbmcgeW91IHRvXG4gICAgICAgICAgaW5zcGVjdCB0aGUgcnVudGltZSBzdGF0ZSBvZiB5b3VyIGFwcC5cblxuICAgICAgICAgIFRoZSBmb2xsb3dpbmcgdmFyaWFibGVzIGFyZSBhdmFpbGFiZTpcblxuICAgICAgICAgICogJHsgY2hhbGsudW5kZXJsaW5lKCdhcHBsaWNhdGlvbicpIH0gLSBhbiBpbnN0YW5jZSBvZiB5b3VyIEFwcGxpY2F0aW9uIGNsYXNzXG4gICAgICAgICAgKiAkeyBjaGFsay51bmRlcmxpbmUoJ2NvbnRhaW5lcicpIH0gLSBzaG9ydGN1dCB0byBhcHBsaWNhdGlvbi5jb250YWluZXIuIFVzZSB0aGlzIHRvXG4gICAgICAgICAgICBsb29rdXAgdGhlIHZhcmlvdXMgY2xhc3NlcyBhc3NvY2lhdGVkIHdpdGggeW91ciBhcHAgKGkuZS4gYWN0aW9ucywgbW9kZWxzLCBldGMpXG4gICAgICAgIGApO1xuICAgICAgICB0aGlzLmRpc3BsYXlQcm9tcHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=