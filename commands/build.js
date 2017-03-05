"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const denali_cli_1 = require("denali-cli");
const unwrap_1 = require("../lib/utils/unwrap");
const createDebug = require("debug");
const debug = createDebug('denali:commands:build');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTJEO0FBQzNELGdEQUF5QztBQUN6QyxxQ0FBcUM7QUFFckMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFbkQ7Ozs7R0FJRztBQUNILGtCQUFrQyxTQUFRLG9CQUFPO0lBQWpEOztRQTBDUyxjQUFTLEdBQUcsSUFBSSxDQUFDO0lBd0IxQixDQUFDO0lBdEJjLEdBQUcsQ0FBQyxJQUFTOztZQUN4QixJQUFJLE9BQU8sR0FBRyxJQUFJLG9CQUFPLENBQUM7Z0JBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUNuQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUTtnQkFDcEIsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVM7YUFDdkIsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDWixTQUFTLEVBQVUsSUFBSSxDQUFDLE1BQU07aUJBQy9CLENBQUMsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUM7b0JBQ0gsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkMsQ0FBQztnQkFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNmLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ25DLGVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7S0FBQTs7QUE5REQsMkNBQTJDO0FBQzdCLHdCQUFXLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLHdCQUFXLEdBQUcsa0JBQWtCLENBQUM7QUFDakMsNEJBQWUsR0FBRyxnQkFBTSxDQUFBOztHQUVyQyxDQUFDO0FBRVksa0JBQUssR0FBRztJQUNwQixXQUFXLEVBQUU7UUFDWCxXQUFXLEVBQUUsc0NBQXNDO1FBQ25ELE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxhQUFhO1FBQzlDLElBQUksRUFBTyxRQUFRO0tBQ3BCO0lBQ0QsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFLDZCQUE2QjtRQUMxQyxPQUFPLEVBQUUsTUFBTTtRQUNmLElBQUksRUFBTyxRQUFRO0tBQ3BCO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsV0FBVyxFQUFFLDREQUE0RDtRQUN6RSxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsU0FBUyxFQUFFO1FBQ1QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsV0FBVyxFQUFFLHdFQUF3RTtRQUNyRixPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0NBQ0YsQ0FBQztBQXhDSiwrQkFrRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1aSwgc3Bpbm5lciwgQ29tbWFuZCwgUHJvamVjdCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi9saWIvdXRpbHMvdW53cmFwJztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGVuYWxpOmNvbW1hbmRzOmJ1aWxkJyk7XG5cbi8qKlxuICogQ29tcGlsZSB5b3VyIGFwcFxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWxkQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgcHVibGljIHN0YXRpYyBjb21tYW5kTmFtZSA9ICdidWlsZCc7XG4gIHB1YmxpYyBzdGF0aWMgZGVzY3JpcHRpb24gPSAnQ29tcGlsZSB5b3VyIGFwcCc7XG4gIHB1YmxpYyBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIENvbXBpbGVzIHlvdXIgYXBwIGJhc2VkIG9uIHlvdXIgZGVuYWxpLWJ1aWxkLmpzIGZpbGUsIGFzIHdlbGwgYXMgYW55IGJ1aWxkLXJlbGF0ZWQgYWRkb25zLlxuICBgO1xuXG4gIHB1YmxpYyBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRhcmdldCBlbnZpcm9ubWVudCB0byBidWlsZCBmb3IuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WIHx8ICdkZXZlbG9wbWVudCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRpcmVjdG9yeSB0byBidWlsZCBpbnRvJyxcbiAgICAgIGRlZmF1bHQ6ICdkaXN0JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHdhdGNoOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbnRpbnVvdXNseSB3YXRjaCB0aGUgc291cmNlIGZpbGVzIGFuZCByZWJ1aWxkIG9uIGNoYW5nZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcExpbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBsaW50aW5nIHRoZSBhcHAgc291cmNlIGZpbGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNraXBBdWRpdDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGF1ZGl0aW5nIHlvdXIgcGFja2FnZS5qc29uIGZvciB2dWxuZXJhYmlsaXRlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBwcmludFNsb3dUcmVlczoge1xuICAgICAgZGVzY3JpcHRpb246ICdQcmludCBvdXQgYW4gYW5hbHlzaXMgb2YgdGhlIGJ1aWxkIHByb2Nlc3MsIHNob3dpbmcgdGhlIHNsb3dlc3Qgbm9kZXMuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9XG4gIH07XG5cbiAgcHVibGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgcHVibGljIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgcHJpbnRTbG93VHJlZXM6IGFyZ3YucHJpbnRTbG93VHJlZXMsXG4gICAgICBsaW50OiAhYXJndi5za2lwTGludCxcbiAgICAgIGF1ZGl0OiAhYXJndi5za2lwQXVkaXRcbiAgICB9KTtcblxuICAgIGlmIChhcmd2LndhdGNoKSB7XG4gICAgICBwcm9qZWN0LndhdGNoKHtcbiAgICAgICAgb3V0cHV0RGlyOiA8c3RyaW5nPmFyZ3Yub3V0cHV0XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcHJvamVjdC5idWlsZChhcmd2Lm91dHB1dCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ0J1aWxkIGZhaWxlZCcpO1xuICAgICAgICB1aS5lcnJvcihlcnJvci5zdGFjayk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==