"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const unwrap_1 = require("../lib/utils/unwrap");
const child_process_1 = require("child_process");
const denali_cli_1 = require("denali-cli");
const createDebug = require("debug");
const debug = createDebug('denali:commands:server');
/**
 * Runs the denali server for local or production use.
 *
 * @package commands
 */
class ServerCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug('running server command');
            if (argv.production) {
                argv.skipBuild = true;
                argv.environment = 'production';
            }
            argv.watch = argv.watch || argv.environment === 'development';
            if (argv.skipBuild) {
                this.startServer(argv);
                return;
            }
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                printSlowTrees: argv.printSlowTrees,
                audit: !argv.skipAudit,
                lint: !argv.skipLint,
                buildDummy: true
            });
            process.on('exit', this.cleanExit.bind(this));
            process.on('SIGINT', this.cleanExit.bind(this));
            process.on('SIGTERM', this.cleanExit.bind(this));
            if (argv.watch) {
                debug('starting watcher');
                project.watch({
                    outputDir: argv.output,
                    onBuild: () => {
                        if (this.server) {
                            debug('killing existing server');
                            this.server.removeAllListeners('exit');
                            this.server.kill();
                        }
                        this.startServer(argv);
                    }
                });
            }
            else {
                debug('building project');
                yield project.build(argv.output);
                this.startServer(argv);
            }
        });
    }
    cleanExit() {
        if (this.server) {
            this.server.kill();
        }
    }
    startServer(argv) {
        let dir = argv.output;
        let args = ['app/index.js'];
        if (argv.debug) {
            args.unshift('--inspect', '--debug-brk');
        }
        if (!fs.existsSync(path.join(dir, 'app', 'index.js'))) {
            denali_cli_1.ui.error('Unable to start your application: missing app/index.js file');
            return;
        }
        debug(`starting server process: ${process.execPath} ${args.join(' ')}`);
        let defaultEnvs = {
            PORT: argv.port,
            NODE_ENV: argv.environment
        };
        this.server = child_process_1.spawn(process.execPath, args, {
            cwd: dir,
            stdio: ['pipe', process.stdout, process.stderr],
            env: lodash_1.merge(lodash_1.clone(process.env), {
                PORT: argv.port,
                NODE_ENV: argv.environment
            })
        });
        this.server.on('error', (error) => {
            denali_cli_1.ui.error('Unable to start your application:');
            denali_cli_1.ui.error(error.stack);
        });
        if (argv.watch) {
            this.server.on('exit', (code) => {
                let result = code === 0 ? 'exited' : 'crashed';
                denali_cli_1.ui.error(`Server ${result}. waiting for changes to restart ...`);
            });
        }
    }
}
/* tslint:disable:completed-docs typedef */
ServerCommand.commandName = 'server';
ServerCommand.description = 'Runs the denali server for local or production use.';
ServerCommand.longDescription = unwrap_1.default `
    Launches the Denali server running your application.

    In a development environment, the server does several things:

     * watches your local filesystem for changes and automatically restarts for you.
     * lint your code on build
     * run a security audit of your package.json on build (via nsp)

    In production, the above features are disabled by default, and instead:

     * the server will fork worker processes to maximize CPU core usage`;
ServerCommand.runsInApp = true;
ServerCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    debug: {
        description: 'Run in debug mode (add the --debug flag to node, launch node-inspector)',
        default: false,
        type: 'boolean'
    },
    watch: {
        description: 'Restart the server when the source files change (default: true in development)',
        type: 'boolean'
    },
    port: {
        description: 'The port the HTTP server should bind to (default: process.env.PORT or 3000)',
        default: process.env.PORT || 3000,
        type: 'number'
    },
    skipBuild: {
        description: "Don't build the app before launching the server. Useful in production if you prebuild the app before deploying. Implies --skip-lint and --skip-audit.",
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
    output: {
        description: 'The directory to write the compiled app to. Defaults to a tmp directory',
        default: 'dist',
        type: 'string'
    },
    production: {
        description: 'Shorthand for "--skip-build --environment production"',
        default: false,
        type: 'boolean'
    },
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    }
};
exports.default = ServerCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FHZ0I7QUFDaEIsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixnREFBeUM7QUFDekMsaURBQW9EO0FBQ3BELDJDQUFrRDtBQUNsRCxxQ0FBcUM7QUFFckMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFFcEQ7Ozs7R0FJRztBQUNILG1CQUFtQyxTQUFRLG9CQUFPO0lBMEVuQyxHQUFHLENBQUMsSUFBUzs7WUFDeEIsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDaEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztZQUNsQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssYUFBYSxDQUFDO1lBRTlELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QixNQUFNLENBQUM7WUFDVCxDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxvQkFBTyxDQUFDO2dCQUN4QixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztnQkFDbkMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVM7Z0JBQ3RCLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNwQixVQUFVLEVBQUUs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LEVBQUU7UUFDTCxXQUFXLEVBQUUsZ0ZBQWdGO1FBQzdGLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsSUFBSSxFQUFFO1FBQ0osV0FBVyxFQUFFLDZFQUE2RTtRQUMxRixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSTtRQUNqQyxJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSx1SkFBdUo7UUFDcEssT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvREFBb0Q7UUFDakUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELE1BQU0sRUFBRTtRQUNOLFdBQVcsRUFBRSx5RUFBeUU7UUFDdEYsT0FBTyxFQUFFLE1BQU07UUFDZixJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELFVBQVUsRUFBRTtRQUNWLFdBQVcsRUFBRSx1REFBdUQ7UUFDcEUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELGNBQWMsRUFBRTtRQUNkLFdBQVcsRUFBRSx3RUFBd0U7UUFDckYsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUF0RUosZ0NBZ0tDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgY2xvbmUsXG4gIG1lcmdlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi9saWIvdXRpbHMvdW53cmFwJztcbmltcG9ydCB7IHNwYXduLCBDaGlsZFByb2Nlc3MgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHVpLCBDb21tYW5kLCBQcm9qZWN0IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTpjb21tYW5kczpzZXJ2ZXInKTtcblxuLyoqXG4gKiBSdW5zIHRoZSBkZW5hbGkgc2VydmVyIGZvciBsb2NhbCBvciBwcm9kdWN0aW9uIHVzZS5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXJDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBwdWJsaWMgc3RhdGljIGNvbW1hbmROYW1lID0gJ3NlcnZlcic7XG4gIHB1YmxpYyBzdGF0aWMgZGVzY3JpcHRpb24gPSAnUnVucyB0aGUgZGVuYWxpIHNlcnZlciBmb3IgbG9jYWwgb3IgcHJvZHVjdGlvbiB1c2UuJztcbiAgcHVibGljIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgTGF1bmNoZXMgdGhlIERlbmFsaSBzZXJ2ZXIgcnVubmluZyB5b3VyIGFwcGxpY2F0aW9uLlxuXG4gICAgSW4gYSBkZXZlbG9wbWVudCBlbnZpcm9ubWVudCwgdGhlIHNlcnZlciBkb2VzIHNldmVyYWwgdGhpbmdzOlxuXG4gICAgICogd2F0Y2hlcyB5b3VyIGxvY2FsIGZpbGVzeXN0ZW0gZm9yIGNoYW5nZXMgYW5kIGF1dG9tYXRpY2FsbHkgcmVzdGFydHMgZm9yIHlvdS5cbiAgICAgKiBsaW50IHlvdXIgY29kZSBvbiBidWlsZFxuICAgICAqIHJ1biBhIHNlY3VyaXR5IGF1ZGl0IG9mIHlvdXIgcGFja2FnZS5qc29uIG9uIGJ1aWxkICh2aWEgbnNwKVxuXG4gICAgSW4gcHJvZHVjdGlvbiwgdGhlIGFib3ZlIGZlYXR1cmVzIGFyZSBkaXNhYmxlZCBieSBkZWZhdWx0LCBhbmQgaW5zdGVhZDpcblxuICAgICAqIHRoZSBzZXJ2ZXIgd2lsbCBmb3JrIHdvcmtlciBwcm9jZXNzZXMgdG8gbWF4aW1pemUgQ1BVIGNvcmUgdXNhZ2VgO1xuXG4gIHB1YmxpYyBzdGF0aWMgcnVuc0luQXBwID0gdHJ1ZTtcblxuICBwdWJsaWMgc3RhdGljIGZsYWdzID0ge1xuICAgIGVudmlyb25tZW50OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0YXJnZXQgZW52aXJvbm1lbnQgdG8gYnVpbGQgZm9yLicsXG4gICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgZGVidWc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIGluIGRlYnVnIG1vZGUgKGFkZCB0aGUgLS1kZWJ1ZyBmbGFnIHRvIG5vZGUsIGxhdW5jaCBub2RlLWluc3BlY3RvciknLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVzdGFydCB0aGUgc2VydmVyIHdoZW4gdGhlIHNvdXJjZSBmaWxlcyBjaGFuZ2UgKGRlZmF1bHQ6IHRydWUgaW4gZGV2ZWxvcG1lbnQpJyxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBwb3J0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwb3J0IHRoZSBIVFRQIHNlcnZlciBzaG91bGQgYmluZCB0byAoZGVmYXVsdDogcHJvY2Vzcy5lbnYuUE9SVCBvciAzMDAwKScsXG4gICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudi5QT1JUIHx8IDMwMDAsXG4gICAgICB0eXBlOiA8YW55PidudW1iZXInXG4gICAgfSxcbiAgICBza2lwQnVpbGQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkRvbid0IGJ1aWxkIHRoZSBhcHAgYmVmb3JlIGxhdW5jaGluZyB0aGUgc2VydmVyLiBVc2VmdWwgaW4gcHJvZHVjdGlvbiBpZiB5b3UgcHJlYnVpbGQgdGhlIGFwcCBiZWZvcmUgZGVwbG95aW5nLiBJbXBsaWVzIC0tc2tpcC1saW50IGFuZCAtLXNraXAtYXVkaXQuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBza2lwTGludDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGxpbnRpbmcgdGhlIGFwcCBzb3VyY2UgZmlsZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcEF1ZGl0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1NraXAgYXVkaXRpbmcgeW91ciBwYWNrYWdlLmpzb24gZm9yIHZ1bG5lcmFiaWxpdGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIG91dHB1dDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZGlyZWN0b3J5IHRvIHdyaXRlIHRoZSBjb21waWxlZCBhcHAgdG8uIERlZmF1bHRzIHRvIGEgdG1wIGRpcmVjdG9yeScsXG4gICAgICBkZWZhdWx0OiAnZGlzdCcsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBwcm9kdWN0aW9uOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3J0aGFuZCBmb3IgXCItLXNraXAtYnVpbGQgLS1lbnZpcm9ubWVudCBwcm9kdWN0aW9uXCInLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgcHJpbnRTbG93VHJlZXM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgb3V0IGFuIGFuYWx5c2lzIG9mIHRoZSBidWlsZCBwcm9jZXNzLCBzaG93aW5nIHRoZSBzbG93ZXN0IG5vZGVzLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIHB1YmxpYyBzZXJ2ZXI6IENoaWxkUHJvY2VzcztcblxuICBwdWJsaWMgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIGRlYnVnKCdydW5uaW5nIHNlcnZlciBjb21tYW5kJyk7XG4gICAgaWYgKGFyZ3YucHJvZHVjdGlvbikge1xuICAgICAgYXJndi5za2lwQnVpbGQgPSB0cnVlO1xuICAgICAgYXJndi5lbnZpcm9ubWVudCA9ICdwcm9kdWN0aW9uJztcbiAgICB9XG4gICAgYXJndi53YXRjaCA9IGFyZ3Yud2F0Y2ggfHwgYXJndi5lbnZpcm9ubWVudCA9PT0gJ2RldmVsb3BtZW50JztcblxuICAgIGlmIChhcmd2LnNraXBCdWlsZCkge1xuICAgICAgdGhpcy5zdGFydFNlcnZlcihhcmd2KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiBhcmd2LmVudmlyb25tZW50LFxuICAgICAgcHJpbnRTbG93VHJlZXM6IGFyZ3YucHJpbnRTbG93VHJlZXMsXG4gICAgICBhdWRpdDogIWFyZ3Yuc2tpcEF1ZGl0LFxuICAgICAgbGludDogIWFyZ3Yuc2tpcExpbnQsXG4gICAgICBidWlsZER1bW15OiB0cnVlXG4gICAgfSk7XG5cbiAgICBwcm9jZXNzLm9uKCdleGl0JywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG4gICAgcHJvY2Vzcy5vbignU0lHSU5UJywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG4gICAgcHJvY2Vzcy5vbignU0lHVEVSTScsIHRoaXMuY2xlYW5FeGl0LmJpbmQodGhpcykpO1xuXG4gICAgaWYgKGFyZ3Yud2F0Y2gpIHtcbiAgICAgIGRlYnVnKCdzdGFydGluZyB3YXRjaGVyJyk7XG4gICAgICBwcm9qZWN0LndhdGNoKHtcbiAgICAgICAgb3V0cHV0RGlyOiBhcmd2Lm91dHB1dCxcbiAgICAgICAgb25CdWlsZDogKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgZGVidWcoJ2tpbGxpbmcgZXhpc3Rpbmcgc2VydmVyJyk7XG4gICAgICAgICAgICB0aGlzLnNlcnZlci5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2V4aXQnKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLmtpbGwoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zdGFydFNlcnZlcihhcmd2KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdidWlsZGluZyBwcm9qZWN0Jyk7XG4gICAgICBhd2FpdCBwcm9qZWN0LmJ1aWxkKGFyZ3Yub3V0cHV0KTtcbiAgICAgIHRoaXMuc3RhcnRTZXJ2ZXIoYXJndik7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNsZWFuRXhpdCgpIHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuc2VydmVyLmtpbGwoKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhcnRTZXJ2ZXIoYXJndjogYW55KSB7XG4gICAgbGV0IGRpciA9IGFyZ3Yub3V0cHV0O1xuICAgIGxldCBhcmdzID0gWyAnYXBwL2luZGV4LmpzJyBdO1xuICAgIGlmIChhcmd2LmRlYnVnKSB7XG4gICAgICBhcmdzLnVuc2hpZnQoJy0taW5zcGVjdCcsICctLWRlYnVnLWJyaycpO1xuICAgIH1cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocGF0aC5qb2luKGRpciwgJ2FwcCcsICdpbmRleC5qcycpKSkge1xuICAgICAgdWkuZXJyb3IoJ1VuYWJsZSB0byBzdGFydCB5b3VyIGFwcGxpY2F0aW9uOiBtaXNzaW5nIGFwcC9pbmRleC5qcyBmaWxlJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRlYnVnKGBzdGFydGluZyBzZXJ2ZXIgcHJvY2VzczogJHsgcHJvY2Vzcy5leGVjUGF0aCB9ICR7IGFyZ3Muam9pbignICcpIH1gKTtcbiAgICBsZXQgZGVmYXVsdEVudnMgPSB7XG4gICAgICBQT1JUOiBhcmd2LnBvcnQsXG4gICAgICBOT0RFX0VOVjogYXJndi5lbnZpcm9ubWVudFxuICAgIH07XG4gICAgdGhpcy5zZXJ2ZXIgPSBzcGF3bihwcm9jZXNzLmV4ZWNQYXRoLCBhcmdzLCB7XG4gICAgICBjd2Q6IGRpcixcbiAgICAgIHN0ZGlvOiBbICdwaXBlJywgcHJvY2Vzcy5zdGRvdXQsIHByb2Nlc3Muc3RkZXJyIF0sXG4gICAgICBlbnY6IG1lcmdlKGNsb25lKHByb2Nlc3MuZW52KSwge1xuICAgICAgICBQT1JUOiBhcmd2LnBvcnQsXG4gICAgICAgIE5PREVfRU5WOiBhcmd2LmVudmlyb25tZW50XG4gICAgICB9KVxuICAgIH0pO1xuICAgIHRoaXMuc2VydmVyLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgdWkuZXJyb3IoJ1VuYWJsZSB0byBzdGFydCB5b3VyIGFwcGxpY2F0aW9uOicpO1xuICAgICAgdWkuZXJyb3IoZXJyb3Iuc3RhY2spO1xuICAgIH0pO1xuICAgIGlmIChhcmd2LndhdGNoKSB7XG4gICAgICB0aGlzLnNlcnZlci5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBjb2RlID09PSAwID8gJ2V4aXRlZCcgOiAnY3Jhc2hlZCc7XG4gICAgICAgIHVpLmVycm9yKGBTZXJ2ZXIgJHsgcmVzdWx0IH0uIHdhaXRpbmcgZm9yIGNoYW5nZXMgdG8gcmVzdGFydCAuLi5gKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=