"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../lib/utils/unwrap");
/**
 * Compile your app
 *
 * @package commands
 */
class BuildCommand extends denali_cli_1.Command {
    constructor() {
        super(...arguments);
        this.runsInApp = true;
    }
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                lint: !argv.skipLint,
                audit: !argv.skipAudit
            });
            if (argv.watch) {
                project.watch({
                    outputDir: argv.output
                });
            }
            else {
                try {
                    yield project.build(argv.output);
                }
                catch (error) {
                    yield denali_cli_1.spinner.fail('Build failed');
                    denali_cli_1.ui.error(error.stack);
                }
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
BuildCommand.commandName = 'build';
BuildCommand.description = 'Compile your app';
BuildCommand.longDescription = unwrap_1.default `
    Compiles your app based on your denali-build.js file, as well as any build-related addons.
  `;
BuildCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    output: {
        description: 'The directory to build into',
        default: 'dist',
        type: 'string'
    },
    watch: {
        description: 'Continuously watch the source files and rebuild on changes',
        default: false,
        type: 'boolean'
    },
    skipLint: {
        description: 'Skip linting the app source files',
        default: false,
        type: 'boolean'
    },
    skipAudit: {
        description: 'Skip auditing your package.json for vulnerabilites',
        default: false,
        type: 'boolean'
    },
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    }
};
exports.default = BuildCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJEO0FBQzNELGdEQUF5QztBQUV6Qzs7OztHQUlHO0FBQ0gsa0JBQWtDLFNBQVEsb0JBQU87SUFBakQ7O1FBMENFLGNBQVMsR0FBRyxJQUFJLENBQUM7SUF3Qm5CLENBQUM7SUF0Qk8sR0FBRyxDQUFDLElBQVM7O1lBQ2pCLElBQUksT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQztnQkFDeEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO2dCQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7Z0JBQ25DLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNwQixLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUzthQUN2QixDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDO29CQUNaLFNBQVMsRUFBVSxJQUFJLENBQUMsTUFBTTtpQkFDL0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQztvQkFDSCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuQyxDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2YsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDbkMsZUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztLQUFBOztBQTlERCwyQ0FBMkM7QUFDcEMsd0JBQVcsR0FBRyxPQUFPLENBQUM7QUFDdEIsd0JBQVcsR0FBRyxrQkFBa0IsQ0FBQztBQUNqQyw0QkFBZSxHQUFHLGdCQUFNLENBQUE7O0dBRTlCLENBQUM7QUFFSyxrQkFBSyxHQUFHO0lBQ2IsV0FBVyxFQUFFO1FBQ1gsV0FBVyxFQUFFLHNDQUFzQztRQUNuRCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYTtRQUM5QyxJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELE1BQU0sRUFBRTtRQUNOLFdBQVcsRUFBRSw2QkFBNkI7UUFDMUMsT0FBTyxFQUFFLE1BQU07UUFDZixJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELEtBQUssRUFBRTtRQUNMLFdBQVcsRUFBRSw0REFBNEQ7UUFDekUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvREFBb0Q7UUFDakUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELGNBQWMsRUFBRTtRQUNkLFdBQVcsRUFBRSx3RUFBd0U7UUFDckYsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUF4Q0osK0JBa0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdWksIHNwaW5uZXIsIENvbW1hbmQsIFByb2plY3QgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5cbi8qKlxuICogQ29tcGlsZSB5b3VyIGFwcFxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWxkQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ2J1aWxkJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0NvbXBpbGUgeW91ciBhcHAnO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIENvbXBpbGVzIHlvdXIgYXBwIGJhc2VkIG9uIHlvdXIgZGVuYWxpLWJ1aWxkLmpzIGZpbGUsIGFzIHdlbGwgYXMgYW55IGJ1aWxkLXJlbGF0ZWQgYWRkb25zLlxuICBgO1xuXG4gIHN0YXRpYyBmbGFncyA9IHtcbiAgICBlbnZpcm9ubWVudDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgdGFyZ2V0IGVudmlyb25tZW50IHRvIGJ1aWxkIGZvci4nLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIG91dHB1dDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZGlyZWN0b3J5IHRvIGJ1aWxkIGludG8nLFxuICAgICAgZGVmYXVsdDogJ2Rpc3QnLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29udGludW91c2x5IHdhdGNoIHRoZSBzb3VyY2UgZmlsZXMgYW5kIHJlYnVpbGQgb24gY2hhbmdlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBza2lwTGludDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGxpbnRpbmcgdGhlIGFwcCBzb3VyY2UgZmlsZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcEF1ZGl0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1NraXAgYXVkaXRpbmcgeW91ciBwYWNrYWdlLmpzb24gZm9yIHZ1bG5lcmFiaWxpdGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHByaW50U2xvd1RyZWVzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1ByaW50IG91dCBhbiBhbmFseXNpcyBvZiB0aGUgYnVpbGQgcHJvY2Vzcywgc2hvd2luZyB0aGUgc2xvd2VzdCBub2Rlcy4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgcHJpbnRTbG93VHJlZXM6IGFyZ3YucHJpbnRTbG93VHJlZXMsXG4gICAgICBsaW50OiAhYXJndi5za2lwTGludCxcbiAgICAgIGF1ZGl0OiAhYXJndi5za2lwQXVkaXRcbiAgICB9KTtcblxuICAgIGlmIChhcmd2LndhdGNoKSB7XG4gICAgICBwcm9qZWN0LndhdGNoKHtcbiAgICAgICAgb3V0cHV0RGlyOiA8c3RyaW5nPmFyZ3Yub3V0cHV0XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcHJvamVjdC5idWlsZChhcmd2Lm91dHB1dCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ0J1aWxkIGZhaWxlZCcpO1xuICAgICAgICB1aS5lcnJvcihlcnJvci5zdGFjayk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==