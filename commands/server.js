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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FHZ0I7QUFDaEIsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixnREFBeUM7QUFDekMsaURBQW9EO0FBQ3BELDJDQUFrRDtBQUNsRCxxQ0FBcUM7QUFFckMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFFcEQ7Ozs7R0FJRztBQUNILG1CQUFtQyxTQUFRLG9CQUFPO0lBMEUxQyxHQUFHLENBQUMsSUFBUzs7WUFDakIsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDaEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztZQUNsQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssYUFBYSxDQUFDO1lBRTlELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QixNQUFNLENBQUM7WUFDVCxDQUFDO1lBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxvQkFBTyxDQUFDO2dCQUN4QixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7Z0JBQzdCLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztnQkFDbkMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVM7Z0JBQ3RCLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNwQixVQUFVLEVBQUUsSUFB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RixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSTtRQUNqQyxJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSx1SkFBdUo7UUFDcEssT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBRSxtQ0FBbUM7UUFDaEQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvREFBb0Q7UUFDakUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELE1BQU0sRUFBRTtRQUNOLFdBQVcsRUFBRSx5RUFBeUU7UUFDdEYsT0FBTyxFQUFFLE1BQU07UUFDZixJQUFJLEVBQU8sUUFBUTtLQUNwQjtJQUNELFVBQVUsRUFBRTtRQUNWLFdBQVcsRUFBRSx1REFBdUQ7UUFDcEUsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELGNBQWMsRUFBRTtRQUNkLFdBQVcsRUFBRSx3RUFBd0U7UUFDckYsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUF0RUosZ0NBNEpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgY2xvbmUsXG4gIG1lcmdlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi9saWIvdXRpbHMvdW53cmFwJztcbmltcG9ydCB7IHNwYXduLCBDaGlsZFByb2Nlc3MgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHVpLCBDb21tYW5kLCBQcm9qZWN0IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTpjb21tYW5kczpzZXJ2ZXInKTtcblxuLyoqXG4gKiBSdW5zIHRoZSBkZW5hbGkgc2VydmVyIGZvciBsb2NhbCBvciBwcm9kdWN0aW9uIHVzZS5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXJDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAnc2VydmVyJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ1J1bnMgdGhlIGRlbmFsaSBzZXJ2ZXIgZm9yIGxvY2FsIG9yIHByb2R1Y3Rpb24gdXNlLic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgTGF1bmNoZXMgdGhlIERlbmFsaSBzZXJ2ZXIgcnVubmluZyB5b3VyIGFwcGxpY2F0aW9uLlxuXG4gICAgSW4gYSBkZXZlbG9wbWVudCBlbnZpcm9ubWVudCwgdGhlIHNlcnZlciBkb2VzIHNldmVyYWwgdGhpbmdzOlxuXG4gICAgICogd2F0Y2hlcyB5b3VyIGxvY2FsIGZpbGVzeXN0ZW0gZm9yIGNoYW5nZXMgYW5kIGF1dG9tYXRpY2FsbHkgcmVzdGFydHMgZm9yIHlvdS5cbiAgICAgKiBsaW50IHlvdXIgY29kZSBvbiBidWlsZFxuICAgICAqIHJ1biBhIHNlY3VyaXR5IGF1ZGl0IG9mIHlvdXIgcGFja2FnZS5qc29uIG9uIGJ1aWxkICh2aWEgbnNwKVxuXG4gICAgSW4gcHJvZHVjdGlvbiwgdGhlIGFib3ZlIGZlYXR1cmVzIGFyZSBkaXNhYmxlZCBieSBkZWZhdWx0LCBhbmQgaW5zdGVhZDpcblxuICAgICAqIHRoZSBzZXJ2ZXIgd2lsbCBmb3JrIHdvcmtlciBwcm9jZXNzZXMgdG8gbWF4aW1pemUgQ1BVIGNvcmUgdXNhZ2VgO1xuXG4gIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHN0YXRpYyBmbGFncyA9IHtcbiAgICBlbnZpcm9ubWVudDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgdGFyZ2V0IGVudmlyb25tZW50IHRvIGJ1aWxkIGZvci4nLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIGRlYnVnOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1J1biBpbiBkZWJ1ZyBtb2RlIChhZGQgdGhlIC0tZGVidWcgZmxhZyB0byBub2RlLCBsYXVuY2ggbm9kZS1pbnNwZWN0b3IpJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHdhdGNoOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1Jlc3RhcnQgdGhlIHNlcnZlciB3aGVuIHRoZSBzb3VyY2UgZmlsZXMgY2hhbmdlIChkZWZhdWx0OiB0cnVlIGluIGRldmVsb3BtZW50KScsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgcG9ydDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgcG9ydCB0aGUgSFRUUCBzZXJ2ZXIgc2hvdWxkIGJpbmQgdG8gKGRlZmF1bHQ6IHByb2Nlc3MuZW52LlBPUlQgb3IgMzAwMCknLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDAwLFxuICAgICAgdHlwZTogPGFueT4nbnVtYmVyJ1xuICAgIH0sXG4gICAgc2tpcEJ1aWxkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBidWlsZCB0aGUgYXBwIGJlZm9yZSBsYXVuY2hpbmcgdGhlIHNlcnZlci4gVXNlZnVsIGluIHByb2R1Y3Rpb24gaWYgeW91IHByZWJ1aWxkIHRoZSBhcHAgYmVmb3JlIGRlcGxveWluZy4gSW1wbGllcyAtLXNraXAtbGludCBhbmQgLS1za2lwLWF1ZGl0LlwiLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcExpbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBsaW50aW5nIHRoZSBhcHAgc291cmNlIGZpbGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNraXBBdWRpdDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGF1ZGl0aW5nIHlvdXIgcGFja2FnZS5qc29uIGZvciB2dWxuZXJhYmlsaXRlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRpcmVjdG9yeSB0byB3cml0ZSB0aGUgY29tcGlsZWQgYXBwIHRvLiBEZWZhdWx0cyB0byBhIHRtcCBkaXJlY3RvcnknLFxuICAgICAgZGVmYXVsdDogJ2Rpc3QnLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgcHJvZHVjdGlvbjoge1xuICAgICAgZGVzY3JpcHRpb246ICdTaG9ydGhhbmQgZm9yIFwiLS1za2lwLWJ1aWxkIC0tZW52aXJvbm1lbnQgcHJvZHVjdGlvblwiJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHByaW50U2xvd1RyZWVzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1ByaW50IG91dCBhbiBhbmFseXNpcyBvZiB0aGUgYnVpbGQgcHJvY2Vzcywgc2hvd2luZyB0aGUgc2xvd2VzdCBub2Rlcy4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBzZXJ2ZXI6IENoaWxkUHJvY2VzcztcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgZGVidWcoJ3J1bm5pbmcgc2VydmVyIGNvbW1hbmQnKTtcbiAgICBpZiAoYXJndi5wcm9kdWN0aW9uKSB7XG4gICAgICBhcmd2LnNraXBCdWlsZCA9IHRydWU7XG4gICAgICBhcmd2LmVudmlyb25tZW50ID0gJ3Byb2R1Y3Rpb24nO1xuICAgIH1cbiAgICBhcmd2LndhdGNoID0gYXJndi53YXRjaCB8fCBhcmd2LmVudmlyb25tZW50ID09PSAnZGV2ZWxvcG1lbnQnO1xuXG4gICAgaWYgKGFyZ3Yuc2tpcEJ1aWxkKSB7XG4gICAgICB0aGlzLnN0YXJ0U2VydmVyKGFyZ3YpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwcm9qZWN0ID0gbmV3IFByb2plY3Qoe1xuICAgICAgZW52aXJvbm1lbnQ6IGFyZ3YuZW52aXJvbm1lbnQsXG4gICAgICBwcmludFNsb3dUcmVlczogYXJndi5wcmludFNsb3dUcmVlcyxcbiAgICAgIGF1ZGl0OiAhYXJndi5za2lwQXVkaXQsXG4gICAgICBsaW50OiAhYXJndi5za2lwTGludCxcbiAgICAgIGJ1aWxkRHVtbXk6IHRydWVcbiAgICB9KTtcblxuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgZGVidWcoJ3N0YXJ0aW5nIHdhdGNoZXInKTtcbiAgICAgIHByb2plY3Qud2F0Y2goe1xuICAgICAgICBvdXRwdXREaXI6IGFyZ3Yub3V0cHV0LFxuICAgICAgICBvbkJ1aWxkOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgICAgICBkZWJ1Zygna2lsbGluZyBleGlzdGluZyBzZXJ2ZXInKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLnJlbW92ZUFsbExpc3RlbmVycygnZXhpdCcpO1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXIua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN0YXJ0U2VydmVyKGFyZ3YpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ2J1aWxkaW5nIHByb2plY3QnKTtcbiAgICAgIGF3YWl0IHByb2plY3QuYnVpbGQoYXJndi5vdXRwdXQpO1xuICAgICAgdGhpcy5zdGFydFNlcnZlcihhcmd2KTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgY2xlYW5FeGl0KCkge1xuICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgdGhpcy5zZXJ2ZXIua2lsbCgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBzdGFydFNlcnZlcihhcmd2OiBhbnkpIHtcbiAgICBsZXQgZGlyID0gYXJndi5vdXRwdXQ7XG4gICAgbGV0IGFyZ3MgPSBbICdhcHAvaW5kZXguanMnIF07XG4gICAgaWYgKGFyZ3YuZGVidWcpIHtcbiAgICAgIGFyZ3MudW5zaGlmdCgnLS1pbnNwZWN0JywgJy0tZGVidWctYnJrJyk7XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oZGlyLCAnYXBwJywgJ2luZGV4LmpzJykpKSB7XG4gICAgICB1aS5lcnJvcignVW5hYmxlIHRvIHN0YXJ0IHlvdXIgYXBwbGljYXRpb246IG1pc3NpbmcgYXBwL2luZGV4LmpzIGZpbGUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGVidWcoYHN0YXJ0aW5nIHNlcnZlciBwcm9jZXNzOiAkeyBwcm9jZXNzLmV4ZWNQYXRoIH0gJHsgYXJncy5qb2luKCcgJykgfWApO1xuICAgIHRoaXMuc2VydmVyID0gc3Bhd24ocHJvY2Vzcy5leGVjUGF0aCwgYXJncywge1xuICAgICAgY3dkOiBkaXIsXG4gICAgICBzdGRpbzogWyAncGlwZScsIHByb2Nlc3Muc3Rkb3V0LCBwcm9jZXNzLnN0ZGVyciBdLFxuICAgICAgZW52OiBtZXJnZShjbG9uZShwcm9jZXNzLmVudiksIHtcbiAgICAgICAgUE9SVDogYXJndi5wb3J0LFxuICAgICAgICBOT0RFX0VOVjogYXJndi5lbnZpcm9ubWVudFxuICAgICAgfSlcbiAgICB9KTtcbiAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIHVpLmVycm9yKCdVbmFibGUgdG8gc3RhcnQgeW91ciBhcHBsaWNhdGlvbjonKTtcbiAgICAgIHVpLmVycm9yKGVycm9yLnN0YWNrKTtcbiAgICB9KTtcbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgdGhpcy5zZXJ2ZXIub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gY29kZSA9PT0gMCA/ICdleGl0ZWQnIDogJ2NyYXNoZWQnO1xuICAgICAgICB1aS5lcnJvcihgU2VydmVyICR7IHJlc3VsdCB9LiB3YWl0aW5nIGZvciBjaGFuZ2VzIHRvIHJlc3RhcnQgLi4uYCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufVxuIl19