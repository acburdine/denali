"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const fs = require("fs-extra");
const path = require("path");
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
ServerCommand.longDescription = denali_cli_1.unwrap `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FHZ0I7QUFDaEIsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpREFBb0Q7QUFDcEQsMkNBQTBEO0FBQzFELHFDQUFxQztBQUVyQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUVwRDs7OztHQUlHO0FBQ0gsbUJBQW1DLFNBQVEsb0JBQU87SUEwRTFDLEdBQUcsQ0FBQyxJQUFTOztZQUNqQixLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNoQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDO1lBQ2xDLENBQUM7WUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxhQUFhLENBQUM7WUFFOUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQztZQUNULENBQUM7WUFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLG9CQUFPLENBQUM7Z0JBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUNuQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUztnQkFDdEIsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCLENB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RSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJO1FBQ2pDLElBQUksRUFBTyxRQUFRO0tBQ3BCO0lBQ0QsU0FBUyxFQUFFO1FBQ1QsV0FBVyxFQUFFLHVKQUF1SjtRQUNwSyxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsU0FBUyxFQUFFO1FBQ1QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsTUFBTSxFQUFFO1FBQ04sV0FBVyxFQUFFLHlFQUF5RTtRQUN0RixPQUFPLEVBQUUsTUFBTTtRQUNmLElBQUksRUFBTyxRQUFRO0tBQ3BCO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsV0FBVyxFQUFFLHVEQUF1RDtRQUNwRSxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsV0FBVyxFQUFFLHdFQUF3RTtRQUNyRixPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0NBQ0YsQ0FBQztBQXRFSixnQ0E0SkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBjbG9uZSxcbiAgbWVyZ2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGF3biwgQ2hpbGRQcm9jZXNzIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyB1aSwgQ29tbWFuZCwgUHJvamVjdCwgdW53cmFwIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTpjb21tYW5kczpzZXJ2ZXInKTtcblxuLyoqXG4gKiBSdW5zIHRoZSBkZW5hbGkgc2VydmVyIGZvciBsb2NhbCBvciBwcm9kdWN0aW9uIHVzZS5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJ2ZXJDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAnc2VydmVyJztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gJ1J1bnMgdGhlIGRlbmFsaSBzZXJ2ZXIgZm9yIGxvY2FsIG9yIHByb2R1Y3Rpb24gdXNlLic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgTGF1bmNoZXMgdGhlIERlbmFsaSBzZXJ2ZXIgcnVubmluZyB5b3VyIGFwcGxpY2F0aW9uLlxuXG4gICAgSW4gYSBkZXZlbG9wbWVudCBlbnZpcm9ubWVudCwgdGhlIHNlcnZlciBkb2VzIHNldmVyYWwgdGhpbmdzOlxuXG4gICAgICogd2F0Y2hlcyB5b3VyIGxvY2FsIGZpbGVzeXN0ZW0gZm9yIGNoYW5nZXMgYW5kIGF1dG9tYXRpY2FsbHkgcmVzdGFydHMgZm9yIHlvdS5cbiAgICAgKiBsaW50IHlvdXIgY29kZSBvbiBidWlsZFxuICAgICAqIHJ1biBhIHNlY3VyaXR5IGF1ZGl0IG9mIHlvdXIgcGFja2FnZS5qc29uIG9uIGJ1aWxkICh2aWEgbnNwKVxuXG4gICAgSW4gcHJvZHVjdGlvbiwgdGhlIGFib3ZlIGZlYXR1cmVzIGFyZSBkaXNhYmxlZCBieSBkZWZhdWx0LCBhbmQgaW5zdGVhZDpcblxuICAgICAqIHRoZSBzZXJ2ZXIgd2lsbCBmb3JrIHdvcmtlciBwcm9jZXNzZXMgdG8gbWF4aW1pemUgQ1BVIGNvcmUgdXNhZ2VgO1xuXG4gIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHN0YXRpYyBmbGFncyA9IHtcbiAgICBlbnZpcm9ubWVudDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgdGFyZ2V0IGVudmlyb25tZW50IHRvIGJ1aWxkIGZvci4nLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIGRlYnVnOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1J1biBpbiBkZWJ1ZyBtb2RlIChhZGQgdGhlIC0tZGVidWcgZmxhZyB0byBub2RlLCBsYXVuY2ggbm9kZS1pbnNwZWN0b3IpJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHdhdGNoOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1Jlc3RhcnQgdGhlIHNlcnZlciB3aGVuIHRoZSBzb3VyY2UgZmlsZXMgY2hhbmdlIChkZWZhdWx0OiB0cnVlIGluIGRldmVsb3BtZW50KScsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgcG9ydDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgcG9ydCB0aGUgSFRUUCBzZXJ2ZXIgc2hvdWxkIGJpbmQgdG8gKGRlZmF1bHQ6IHByb2Nlc3MuZW52LlBPUlQgb3IgMzAwMCknLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDAwLFxuICAgICAgdHlwZTogPGFueT4nbnVtYmVyJ1xuICAgIH0sXG4gICAgc2tpcEJ1aWxkOiB7XG4gICAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBidWlsZCB0aGUgYXBwIGJlZm9yZSBsYXVuY2hpbmcgdGhlIHNlcnZlci4gVXNlZnVsIGluIHByb2R1Y3Rpb24gaWYgeW91IHByZWJ1aWxkIHRoZSBhcHAgYmVmb3JlIGRlcGxveWluZy4gSW1wbGllcyAtLXNraXAtbGludCBhbmQgLS1za2lwLWF1ZGl0LlwiLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcExpbnQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBsaW50aW5nIHRoZSBhcHAgc291cmNlIGZpbGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNraXBBdWRpdDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGF1ZGl0aW5nIHlvdXIgcGFja2FnZS5qc29uIGZvciB2dWxuZXJhYmlsaXRlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRpcmVjdG9yeSB0byB3cml0ZSB0aGUgY29tcGlsZWQgYXBwIHRvLiBEZWZhdWx0cyB0byBhIHRtcCBkaXJlY3RvcnknLFxuICAgICAgZGVmYXVsdDogJ2Rpc3QnLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgcHJvZHVjdGlvbjoge1xuICAgICAgZGVzY3JpcHRpb246ICdTaG9ydGhhbmQgZm9yIFwiLS1za2lwLWJ1aWxkIC0tZW52aXJvbm1lbnQgcHJvZHVjdGlvblwiJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHByaW50U2xvd1RyZWVzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1ByaW50IG91dCBhbiBhbmFseXNpcyBvZiB0aGUgYnVpbGQgcHJvY2Vzcywgc2hvd2luZyB0aGUgc2xvd2VzdCBub2Rlcy4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBzZXJ2ZXI6IENoaWxkUHJvY2VzcztcblxuICBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgZGVidWcoJ3J1bm5pbmcgc2VydmVyIGNvbW1hbmQnKTtcbiAgICBpZiAoYXJndi5wcm9kdWN0aW9uKSB7XG4gICAgICBhcmd2LnNraXBCdWlsZCA9IHRydWU7XG4gICAgICBhcmd2LmVudmlyb25tZW50ID0gJ3Byb2R1Y3Rpb24nO1xuICAgIH1cbiAgICBhcmd2LndhdGNoID0gYXJndi53YXRjaCB8fCBhcmd2LmVudmlyb25tZW50ID09PSAnZGV2ZWxvcG1lbnQnO1xuXG4gICAgaWYgKGFyZ3Yuc2tpcEJ1aWxkKSB7XG4gICAgICB0aGlzLnN0YXJ0U2VydmVyKGFyZ3YpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwcm9qZWN0ID0gbmV3IFByb2plY3Qoe1xuICAgICAgZW52aXJvbm1lbnQ6IGFyZ3YuZW52aXJvbm1lbnQsXG4gICAgICBwcmludFNsb3dUcmVlczogYXJndi5wcmludFNsb3dUcmVlcyxcbiAgICAgIGF1ZGl0OiAhYXJndi5za2lwQXVkaXQsXG4gICAgICBsaW50OiAhYXJndi5za2lwTGludCxcbiAgICAgIGJ1aWxkRHVtbXk6IHRydWVcbiAgICB9KTtcblxuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgZGVidWcoJ3N0YXJ0aW5nIHdhdGNoZXInKTtcbiAgICAgIHByb2plY3Qud2F0Y2goe1xuICAgICAgICBvdXRwdXREaXI6IGFyZ3Yub3V0cHV0LFxuICAgICAgICBvbkJ1aWxkOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuc2VydmVyKSB7XG4gICAgICAgICAgICBkZWJ1Zygna2lsbGluZyBleGlzdGluZyBzZXJ2ZXInKTtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyLnJlbW92ZUFsbExpc3RlbmVycygnZXhpdCcpO1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXIua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnN0YXJ0U2VydmVyKGFyZ3YpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ2J1aWxkaW5nIHByb2plY3QnKTtcbiAgICAgIGF3YWl0IHByb2plY3QuYnVpbGQoYXJndi5vdXRwdXQpO1xuICAgICAgdGhpcy5zdGFydFNlcnZlcihhcmd2KTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgY2xlYW5FeGl0KCkge1xuICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgdGhpcy5zZXJ2ZXIua2lsbCgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBzdGFydFNlcnZlcihhcmd2OiBhbnkpIHtcbiAgICBsZXQgZGlyID0gYXJndi5vdXRwdXQ7XG4gICAgbGV0IGFyZ3MgPSBbICdhcHAvaW5kZXguanMnIF07XG4gICAgaWYgKGFyZ3YuZGVidWcpIHtcbiAgICAgIGFyZ3MudW5zaGlmdCgnLS1pbnNwZWN0JywgJy0tZGVidWctYnJrJyk7XG4gICAgfVxuICAgIGlmICghZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4oZGlyLCAnYXBwJywgJ2luZGV4LmpzJykpKSB7XG4gICAgICB1aS5lcnJvcignVW5hYmxlIHRvIHN0YXJ0IHlvdXIgYXBwbGljYXRpb246IG1pc3NpbmcgYXBwL2luZGV4LmpzIGZpbGUnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZGVidWcoYHN0YXJ0aW5nIHNlcnZlciBwcm9jZXNzOiAkeyBwcm9jZXNzLmV4ZWNQYXRoIH0gJHsgYXJncy5qb2luKCcgJykgfWApO1xuICAgIHRoaXMuc2VydmVyID0gc3Bhd24ocHJvY2Vzcy5leGVjUGF0aCwgYXJncywge1xuICAgICAgY3dkOiBkaXIsXG4gICAgICBzdGRpbzogWyAncGlwZScsIHByb2Nlc3Muc3Rkb3V0LCBwcm9jZXNzLnN0ZGVyciBdLFxuICAgICAgZW52OiBtZXJnZShjbG9uZShwcm9jZXNzLmVudiksIHtcbiAgICAgICAgUE9SVDogYXJndi5wb3J0LFxuICAgICAgICBOT0RFX0VOVjogYXJndi5lbnZpcm9ubWVudFxuICAgICAgfSlcbiAgICB9KTtcbiAgICB0aGlzLnNlcnZlci5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIHVpLmVycm9yKCdVbmFibGUgdG8gc3RhcnQgeW91ciBhcHBsaWNhdGlvbjonKTtcbiAgICAgIHVpLmVycm9yKGVycm9yLnN0YWNrKTtcbiAgICB9KTtcbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgdGhpcy5zZXJ2ZXIub24oJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gY29kZSA9PT0gMCA/ICdleGl0ZWQnIDogJ2NyYXNoZWQnO1xuICAgICAgICB1aS5lcnJvcihgU2VydmVyICR7IHJlc3VsdCB9LiB3YWl0aW5nIGZvciBjaGFuZ2VzIHRvIHJlc3RhcnQgLi4uYCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxufVxuIl19