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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUVnQjtBQUNoQiw2QkFBNkI7QUFDN0IsZ0RBQXlDO0FBQ3pDLGdEQUF5QztBQUN6QywrQkFBK0I7QUFDL0IsMkNBQWtEO0FBRWxEOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxvQkFBTztJQXdCcEMsR0FBRyxDQUFDLElBQVM7O1lBQ3hCLGVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBWSxJQUFJLENBQUMsV0FBWSx3Q0FBd0MsQ0FBQyxDQUFDO1lBQy9FLElBQUksT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQztnQkFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBQ25DLFVBQVUsRUFBRSxJQUFJO2FBQ2pCLENBQUMsQ0FBQztZQUNILElBQUksV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDcEQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxlQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFNLENBQUE7O3dDQUVvQixDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUVELE1BQU0sV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXBDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQzNCLE1BQU0sRUFBRSxVQUFVO2dCQUNsQixTQUFTLEVBQUUsSUFBSTthQUNoQixDQUFDLENBQUM7WUFFSCxJQUFJLE9BQU8sR0FBRztnQkFDWixXQUFXO2dCQUNYLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztnQkFDaEMsUUFBUSxDQUFDLElBQVk7b0JBQ25CLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFVLElBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ3pELENBQUM7YUFDRixDQUFDO1lBQ0YsZUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV4QixXQUFXLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDaEMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsTUFBTTtvQkFDSixzQ0FBc0M7b0JBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQU0sQ0FBQTs7Ozs7Ozs7O2NBU1gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUU7Y0FDL0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUU7O1NBRW5DLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7O0FBeEVELDJDQUEyQztBQUM3QiwwQkFBVyxHQUFHLFNBQVMsQ0FBQztBQUN4QiwwQkFBVyxHQUFHLDRDQUE0QyxDQUFDO0FBQzNELDhCQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7aUZBRXlDLENBQUM7QUFFbEUsb0JBQUssR0FBRztJQUNwQixXQUFXLEVBQUU7UUFDWCxXQUFXLEVBQUUsc0NBQXNDO1FBQ25ELE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxhQUFhO1FBQzlDLElBQUksRUFBTyxRQUFRO0tBQ3BCO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsV0FBVyxFQUFFLHdFQUF3RTtRQUNyRixPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxRQUFRO0tBQ3BCO0NBQ0YsQ0FBQztBQUVZLHdCQUFTLEdBQUcsSUFBSSxDQUFDO0FBdEJqQyxpQ0E0RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhc3NpZ25cbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIHJlcGwgZnJvbSAncmVwbCc7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4uL2xpYi91dGlscy91bndyYXAnO1xuaW1wb3J0IHJld3JhcCBmcm9tICcuLi9saWIvdXRpbHMvcmV3cmFwJztcbmltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCB7IHVpLCBDb21tYW5kLCBQcm9qZWN0IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5cbi8qKlxuICogTGF1bmNoIGEgUkVQTCB3aXRoIHlvdXIgYXBwbGljYXRpb24gbG9hZGVkXG4gKlxuICogQHBhY2thZ2UgY29tbWFuZHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uc29sZUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHB1YmxpYyBzdGF0aWMgY29tbWFuZE5hbWUgPSAnY29uc29sZSc7XG4gIHB1YmxpYyBzdGF0aWMgZGVzY3JpcHRpb24gPSAnTGF1bmNoIGEgUkVQTCB3aXRoIHlvdXIgYXBwbGljYXRpb24gbG9hZGVkJztcbiAgcHVibGljIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgU3RhcnRzIGEgUkVQTCAoUmVhZC1FdmFsLVByaW50IExvb3ApIHdpdGggeW91ciBhcHBsaWNhdGlvbiBpbml0aWFsaXplZCBhbmRcbiAgICBsb2FkZWQgaW50byBtZW1vcnkuIFR5cGUgXFxgLmhlbHBcXGAgaW4gdGhlIFJFUEwgZW52aXJvbm1lbnQgZm9yIG1vcmUgZGV0YWlscy5gO1xuXG4gIHB1YmxpYyBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBwcmludFNsb3dUcmVlczoge1xuICAgICAgZGVzY3JpcHRpb246ICdQcmludCBvdXQgYW4gYW5hbHlzaXMgb2YgdGhlIGJ1aWxkIHByb2Nlc3MsIHNob3dpbmcgdGhlIHNsb3dlc3Qgbm9kZXMuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH1cbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgcHVibGljIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICB1aS5pbmZvKGBMb2FkaW5nICR7IGFyZ3YuZW52aXJvbm1lbnQgfSBlbnZpcm9ubWVudC4gVHlwZSAnLmhlbHAnIGZvciBkZXRhaWxzYCk7XG4gICAgbGV0IHByb2plY3QgPSBuZXcgUHJvamVjdCh7XG4gICAgICBlbnZpcm9ubWVudDogYXJndi5lbnZpcm9ubWVudCxcbiAgICAgIHByaW50U2xvd1RyZWVzOiBhcmd2LnByaW50U2xvd1RyZWVzLFxuICAgICAgYnVpbGREdW1teTogdHJ1ZVxuICAgIH0pO1xuICAgIGxldCBhcHBsaWNhdGlvbiA9IGF3YWl0IHByb2plY3QuY3JlYXRlQXBwbGljYXRpb24oKTtcbiAgICBpZiAoYXBwbGljYXRpb24uZW52aXJvbm1lbnQgPT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdWkud2FybihyZXdyYXBgV0FSTklORzogWW91ciBjb25zb2xlIGlzIHJ1bm5pbmcgaW4gcHJvZHVjdGlvbiBlbnZpcm9ubWVudCwgbWVhbmluZyB5b3VyXG4gICAgICBwcm9kdWN0aW9uIGNvbmZpZ3VyYXRpb24gaXMgYmVpbmcgdXNlZC4gVGhpcyBtZWFucyB5b3VyIGFwcCBpcyBsaWtlbHkgY29ubmVjdGluZyB0byBsaXZlLFxuICAgICAgcHJvZHVjdGlvbiBkYXRhYmFzZS4gVXNlIGNhdXRpb24hYCk7XG4gICAgfVxuXG4gICAgYXdhaXQgYXBwbGljYXRpb24ucnVuSW5pdGlhbGl6ZXJzKCk7XG5cbiAgICBsZXQgY29uc29sZVJlcGwgPSByZXBsLnN0YXJ0KHtcbiAgICAgIHByb21wdDogJ2RlbmFsaT4gJyxcbiAgICAgIHVzZUdsb2JhbDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgbGV0IGNvbnRleHQgPSB7XG4gICAgICBhcHBsaWNhdGlvbixcbiAgICAgIGNvbnRhaW5lcjogYXBwbGljYXRpb24uY29udGFpbmVyLFxuICAgICAgbW9kZWxGb3IodHlwZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBhcHBsaWNhdGlvbi5jb250YWluZXIubG9va3VwKGBtb2RlbDokeyB0eXBlIH1gKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGFzc2lnbihnbG9iYWwsIGNvbnRleHQpO1xuXG4gICAgY29uc29sZVJlcGwuZGVmaW5lQ29tbWFuZCgnaGVscCcsIHtcbiAgICAgIGhlbHA6ICcnLFxuICAgICAgYWN0aW9uKCkge1xuICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgICBjb25zb2xlLmxvZyhyZXdyYXBgXG4gICAgICAgICAgV2VsY29tZSB0byB0aGUgRGVuYWxpIGNvbnNvbGUhXG5cbiAgICAgICAgICBUaGlzIGlzIGEgZnVsbHkgaW50ZXJhY3RpdmUgUkVQTCBmb3IgeW91ciBEZW5hbGkgYXBwLiBUaGF0IG1lYW5zIG5vcm1hbCBKYXZhU2NyaXB0IHdvcmtzXG4gICAgICAgICAgaGVyZS4gWW91ciBhcHBsaWNhdGlvbiBpcyBsb2FkZWQgKGJ1dCBub3Qgc3RhcnRlZCkgaW4gdGhlIGJhY2tncm91bmQsIGFsbG93aW5nIHlvdSB0b1xuICAgICAgICAgIGluc3BlY3QgdGhlIHJ1bnRpbWUgc3RhdGUgb2YgeW91ciBhcHAuXG5cbiAgICAgICAgICBUaGUgZm9sbG93aW5nIHZhcmlhYmxlcyBhcmUgYXZhaWxhYmU6XG5cbiAgICAgICAgICAqICR7IGNoYWxrLnVuZGVybGluZSgnYXBwbGljYXRpb24nKSB9IC0gYW4gaW5zdGFuY2Ugb2YgeW91ciBBcHBsaWNhdGlvbiBjbGFzc1xuICAgICAgICAgICogJHsgY2hhbGsudW5kZXJsaW5lKCdjb250YWluZXInKSB9IC0gc2hvcnRjdXQgdG8gYXBwbGljYXRpb24uY29udGFpbmVyLiBVc2UgdGhpcyB0b1xuICAgICAgICAgICAgbG9va3VwIHRoZSB2YXJpb3VzIGNsYXNzZXMgYXNzb2NpYXRlZCB3aXRoIHlvdXIgYXBwIChpLmUuIGFjdGlvbnMsIG1vZGVscywgZXRjKVxuICAgICAgICBgKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5UHJvbXB0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufVxuIl19