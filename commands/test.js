"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const path = require("path");
const unwrap_1 = require("../lib/utils/unwrap");
const child_process_1 = require("child_process");
const denali_cli_1 = require("denali-cli");
/**
 * Run your app's test suite
 *
 * @package commands
 */
class TestCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let files = argv.files;
            if (files.length === 0) {
                files.push('test/**/*.js');
            }
            // Filter for .js files only
            files = files.filter((pattern) => {
                let isValidJsPattern = pattern.endsWith('*') || pattern.endsWith('.js');
                if (!isValidJsPattern) {
                    denali_cli_1.ui.warn(unwrap_1.default `
          If you want to run specific test files, you must use the .js extension. You supplied
          ${pattern}. Denali will build your test files before running them, so you need to use
          the compiled filename which ends in .js
        `);
                }
                return isValidJsPattern;
            });
            let project = new denali_cli_1.Project({
                environment: 'test',
                printSlowTrees: argv.printSlowTrees,
                audit: !argv.skipAudit,
                lint: !argv.skipLint,
                buildDummy: true
            });
            process.on('exit', this.cleanExit.bind(this));
            process.on('SIGINT', this.cleanExit.bind(this));
            process.on('SIGTERM', this.cleanExit.bind(this));
            if (argv.watch) {
                project.watch({
                    outputDir: argv.output,
                    // Don't let broccoli rebuild while tests are still running, or else
                    // we'll be removing the test files while in progress leading to cryptic
                    // errors.
                    beforeRebuild: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        if (this.tests) {
                            return new Promise((resolve) => {
                                this.tests.removeAllListeners('exit');
                                this.tests.on('exit', () => {
                                    delete this.tests;
                                    resolve();
                                });
                                this.tests.kill();
                                denali_cli_1.ui.info('\n\n===> Changes detected, cancelling in-progress tests ...\n\n');
                            });
                        }
                    }),
                    onBuild: this.runTests.bind(this, files, project, argv)
                });
            }
            else {
                try {
                    yield project.build(argv.output);
                    this.runTests(files, project, argv);
                }
                catch (error) {
                    process.exitCode = 1;
                }
            }
        });
    }
    cleanExit() {
        if (this.tests) {
            this.tests.kill();
        }
    }
    runTests(files, project, argv) {
        let avaPath = path.join(process.cwd(), 'node_modules', '.bin', 'ava');
        let args = files.concat(['!test/dummy/**/*', '--concurrency', argv.concurrency]);
        if (argv.debug) {
            avaPath = process.execPath;
            args = ['--inspect', '--debug-brk', path.join(process.cwd(), 'node_modules', 'ava', 'profile.js'), argv.debug];
        }
        if (argv.match) {
            args.push('--match', argv.match);
        }
        if (argv.verbose) {
            args.unshift('--verbose');
        }
        if (argv.timeout) {
            args.unshift('--timeout', argv.timeout);
        }
        if (argv.failFast) {
            args.unshift('--fail-fast');
        }
        if (argv.serial) {
            args.unshift('--serial');
        }
        this.tests = child_process_1.spawn(avaPath, args, {
            cwd: argv.output,
            stdio: ['pipe', process.stdout, process.stderr],
            env: lodash_1.assign({}, process.env, {
                PORT: argv.port,
                DENALI_LEAVE_TMP: argv.litter,
                NODE_ENV: project.environment,
                DEBUG_COLORS: 1
            })
        });
        denali_cli_1.ui.info(`===> Running ${project.pkg.name} tests ...`);
        this.tests.on('exit', (code) => {
            if (code === 0) {
                denali_cli_1.ui.success('\n===> Tests passed 👍');
            }
            else {
                denali_cli_1.ui.error('\n===> Tests failed 💥');
            }
            delete this.tests;
            if (argv.watch) {
                denali_cli_1.ui.info('===> Waiting for changes to re-run ...\n\n');
            }
            else {
                process.exitCode = code == null ? 1 : code;
                denali_cli_1.ui.info(`===> exiting with ${process.exitCode}`);
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
TestCommand.commandName = 'test';
TestCommand.description = "Run your app's test suite";
TestCommand.longDescription = unwrap_1.default `
    Runs your app's test suite, and can optionally keep re-running it on each file change (--watch).
  `;
TestCommand.runsInApp = true;
TestCommand.params = '[files...]';
TestCommand.flags = {
    debug: {
        description: 'The test file you want to debug. Can only debug one file at a time.',
        type: 'string'
    },
    watch: {
        description: 'Re-run the tests when the source files change',
        default: false,
        type: 'boolean'
    },
    match: {
        description: 'Filter which tests run based on the supplied regex pattern',
        type: 'string'
    },
    timeout: {
        description: 'Set the timeout for all tests, i.e. --timeout 10s, --timeout 2m',
        type: 'string'
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
    verbose: {
        description: 'Print detailed output of the status of your test run',
        default: process.env.CI,
        type: 'boolean'
    },
    output: {
        description: 'The directory to write the compiled app to. Defaults to a tmp directory',
        default: path.join('tmp', 'test'),
        type: 'string'
    },
    printSlowTrees: {
        description: 'Print out an analysis of the build process, showing the slowest nodes.',
        default: false,
        type: 'boolean'
    },
    failFast: {
        description: 'Stop tests on the first failure',
        default: false,
        type: 'boolean'
    },
    litter: {
        description: 'Do not clean up tmp directories created during testing (useful for debugging)',
        default: false,
        type: 'boolean'
    },
    serial: {
        description: 'Run tests serially',
        default: false,
        type: 'boolean'
    },
    concurrency: {
        description: 'How many test files should run concurrently?',
        default: 5,
        type: 'number'
    }
};
exports.default = TestCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUVnQjtBQUNoQiw2QkFBNkI7QUFDN0IsZ0RBQXlDO0FBQ3pDLGlEQUFvRDtBQUNwRCwyQ0FBa0Q7QUFFbEQ7Ozs7R0FJRztBQUNILGlCQUFpQyxTQUFRLG9CQUFPO0lBZ0ZqQyxHQUFHLENBQUMsSUFBUzs7WUFDeEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN2QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDN0IsQ0FBQztZQUNELDRCQUE0QjtZQUM1QixLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQWU7Z0JBQ25DLElBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4RSxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztvQkFDdEIsZUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBTSxDQUFBOztZQUVULE9BQVE7O1NBRVosQ0FBQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxPQUFPLEdBQUcsSUFBSSxvQkFBTyxDQUFDO2dCQUN4QixXQUFXLEVBQUUsTUFBTTtnQkFDbkIsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO2dCQUNuQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUztnQkFDdEIsSUFBSSxFQUFFLENBQUMsSUFB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QUFPLFNBQVM7S0FDckI7SUFDRCxNQUFNLEVBQUU7UUFDTixXQUFXLEVBQUUsb0JBQW9CO1FBQ2pDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7SUFDRCxXQUFXLEVBQUU7UUFDWCxXQUFXLEVBQUUsOENBQThDO1FBQzNELE9BQU8sRUFBRSxDQUFDO1FBQ1YsSUFBSSxFQUFPLFFBQVE7S0FDcEI7Q0FDRixDQUFDO0FBNUVKLDhCQW1NQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFzc2lnblxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5pbXBvcnQgeyBzcGF3biwgQ2hpbGRQcm9jZXNzIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyB1aSwgQ29tbWFuZCwgUHJvamVjdCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuXG4vKipcbiAqIFJ1biB5b3VyIGFwcCdzIHRlc3Qgc3VpdGVcbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0Q29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgcHVibGljIHN0YXRpYyBjb21tYW5kTmFtZSA9ICd0ZXN0JztcbiAgcHVibGljIHN0YXRpYyBkZXNjcmlwdGlvbiA9IFwiUnVuIHlvdXIgYXBwJ3MgdGVzdCBzdWl0ZVwiO1xuICBwdWJsaWMgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBSdW5zIHlvdXIgYXBwJ3MgdGVzdCBzdWl0ZSwgYW5kIGNhbiBvcHRpb25hbGx5IGtlZXAgcmUtcnVubmluZyBpdCBvbiBlYWNoIGZpbGUgY2hhbmdlICgtLXdhdGNoKS5cbiAgYDtcblxuICBwdWJsaWMgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgcHVibGljIHN0YXRpYyBwYXJhbXMgPSAnW2ZpbGVzLi4uXSc7XG5cbiAgcHVibGljIHN0YXRpYyBmbGFncyA9IHtcbiAgICBkZWJ1Zzoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgdGVzdCBmaWxlIHlvdSB3YW50IHRvIGRlYnVnLiBDYW4gb25seSBkZWJ1ZyBvbmUgZmlsZSBhdCBhIHRpbWUuJyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHdhdGNoOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1JlLXJ1biB0aGUgdGVzdHMgd2hlbiB0aGUgc291cmNlIGZpbGVzIGNoYW5nZScsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBtYXRjaDoge1xuICAgICAgZGVzY3JpcHRpb246ICdGaWx0ZXIgd2hpY2ggdGVzdHMgcnVuIGJhc2VkIG9uIHRoZSBzdXBwbGllZCByZWdleCBwYXR0ZXJuJyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHRpbWVvdXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2V0IHRoZSB0aW1lb3V0IGZvciBhbGwgdGVzdHMsIGkuZS4gLS10aW1lb3V0IDEwcywgLS10aW1lb3V0IDJtJyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHNraXBMaW50OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1NraXAgbGludGluZyB0aGUgYXBwIHNvdXJjZSBmaWxlcycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBza2lwQXVkaXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2tpcCBhdWRpdGluZyB5b3VyIHBhY2thZ2UuanNvbiBmb3IgdnVsbmVyYWJpbGl0ZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgdmVyYm9zZToge1xuICAgICAgZGVzY3JpcHRpb246ICdQcmludCBkZXRhaWxlZCBvdXRwdXQgb2YgdGhlIHN0YXR1cyBvZiB5b3VyIHRlc3QgcnVuJyxcbiAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52LkNJLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIG91dHB1dDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZGlyZWN0b3J5IHRvIHdyaXRlIHRoZSBjb21waWxlZCBhcHAgdG8uIERlZmF1bHRzIHRvIGEgdG1wIGRpcmVjdG9yeScsXG4gICAgICBkZWZhdWx0OiBwYXRoLmpvaW4oJ3RtcCcsICd0ZXN0JyksXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBwcmludFNsb3dUcmVlczoge1xuICAgICAgZGVzY3JpcHRpb246ICdQcmludCBvdXQgYW4gYW5hbHlzaXMgb2YgdGhlIGJ1aWxkIHByb2Nlc3MsIHNob3dpbmcgdGhlIHNsb3dlc3Qgbm9kZXMuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIGZhaWxGYXN0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1N0b3AgdGVzdHMgb24gdGhlIGZpcnN0IGZhaWx1cmUnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgbGl0dGVyOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0RvIG5vdCBjbGVhbiB1cCB0bXAgZGlyZWN0b3JpZXMgY3JlYXRlZCBkdXJpbmcgdGVzdGluZyAodXNlZnVsIGZvciBkZWJ1Z2dpbmcpJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHNlcmlhbDoge1xuICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGVzdHMgc2VyaWFsbHknLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgY29uY3VycmVuY3k6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnSG93IG1hbnkgdGVzdCBmaWxlcyBzaG91bGQgcnVuIGNvbmN1cnJlbnRseT8nLFxuICAgICAgZGVmYXVsdDogNSxcbiAgICAgIHR5cGU6IDxhbnk+J251bWJlcidcbiAgICB9XG4gIH07XG5cbiAgcHVibGljIHRlc3RzOiBDaGlsZFByb2Nlc3M7XG5cbiAgcHVibGljIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICBsZXQgZmlsZXMgPSBhcmd2LmZpbGVzO1xuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGZpbGVzLnB1c2goJ3Rlc3QvKiovKi5qcycpO1xuICAgIH1cbiAgICAvLyBGaWx0ZXIgZm9yIC5qcyBmaWxlcyBvbmx5XG4gICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIoKHBhdHRlcm46IHN0cmluZykgPT4ge1xuICAgICAgbGV0IGlzVmFsaWRKc1BhdHRlcm4gPSBwYXR0ZXJuLmVuZHNXaXRoKCcqJykgfHwgcGF0dGVybi5lbmRzV2l0aCgnLmpzJyk7XG4gICAgICBpZiAoIWlzVmFsaWRKc1BhdHRlcm4pIHtcbiAgICAgICAgdWkud2Fybih1bndyYXBgXG4gICAgICAgICAgSWYgeW91IHdhbnQgdG8gcnVuIHNwZWNpZmljIHRlc3QgZmlsZXMsIHlvdSBtdXN0IHVzZSB0aGUgLmpzIGV4dGVuc2lvbi4gWW91IHN1cHBsaWVkXG4gICAgICAgICAgJHsgcGF0dGVybiB9LiBEZW5hbGkgd2lsbCBidWlsZCB5b3VyIHRlc3QgZmlsZXMgYmVmb3JlIHJ1bm5pbmcgdGhlbSwgc28geW91IG5lZWQgdG8gdXNlXG4gICAgICAgICAgdGhlIGNvbXBpbGVkIGZpbGVuYW1lIHdoaWNoIGVuZHMgaW4gLmpzXG4gICAgICAgIGApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzVmFsaWRKc1BhdHRlcm47XG4gICAgfSk7XG5cbiAgICBsZXQgcHJvamVjdCA9IG5ldyBQcm9qZWN0KHtcbiAgICAgIGVudmlyb25tZW50OiAndGVzdCcsXG4gICAgICBwcmludFNsb3dUcmVlczogYXJndi5wcmludFNsb3dUcmVlcyxcbiAgICAgIGF1ZGl0OiAhYXJndi5za2lwQXVkaXQsXG4gICAgICBsaW50OiAhYXJndi5za2lwTGludCxcbiAgICAgIGJ1aWxkRHVtbXk6IHRydWVcbiAgICB9KTtcblxuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdJTlQnLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcbiAgICBwcm9jZXNzLm9uKCdTSUdURVJNJywgdGhpcy5jbGVhbkV4aXQuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgcHJvamVjdC53YXRjaCh7XG4gICAgICAgIG91dHB1dERpcjogYXJndi5vdXRwdXQsXG4gICAgICAgIC8vIERvbid0IGxldCBicm9jY29saSByZWJ1aWxkIHdoaWxlIHRlc3RzIGFyZSBzdGlsbCBydW5uaW5nLCBvciBlbHNlXG4gICAgICAgIC8vIHdlJ2xsIGJlIHJlbW92aW5nIHRoZSB0ZXN0IGZpbGVzIHdoaWxlIGluIHByb2dyZXNzIGxlYWRpbmcgdG8gY3J5cHRpY1xuICAgICAgICAvLyBlcnJvcnMuXG4gICAgICAgIGJlZm9yZVJlYnVpbGQ6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy50ZXN0cykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMudGVzdHMucmVtb3ZlQWxsTGlzdGVuZXJzKCdleGl0Jyk7XG4gICAgICAgICAgICAgIHRoaXMudGVzdHMub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMudGVzdHM7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy50ZXN0cy5raWxsKCk7XG4gICAgICAgICAgICAgIHVpLmluZm8oJ1xcblxcbj09PT4gQ2hhbmdlcyBkZXRlY3RlZCwgY2FuY2VsbGluZyBpbi1wcm9ncmVzcyB0ZXN0cyAuLi5cXG5cXG4nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25CdWlsZDogdGhpcy5ydW5UZXN0cy5iaW5kKHRoaXMsIGZpbGVzLCBwcm9qZWN0LCBhcmd2KVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHByb2plY3QuYnVpbGQoYXJndi5vdXRwdXQpO1xuICAgICAgICB0aGlzLnJ1blRlc3RzKGZpbGVzLCBwcm9qZWN0LCBhcmd2KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjbGVhbkV4aXQoKSB7XG4gICAgaWYgKHRoaXMudGVzdHMpIHtcbiAgICAgIHRoaXMudGVzdHMua2lsbCgpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBydW5UZXN0cyhmaWxlczogc3RyaW5nW10sIHByb2plY3Q6IFByb2plY3QsIGFyZ3Y6IGFueSkge1xuICAgIGxldCBhdmFQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMnLCAnLmJpbicsICdhdmEnKTtcbiAgICBsZXQgYXJncyA9IGZpbGVzLmNvbmNhdChbICchdGVzdC9kdW1teS8qKi8qJywgJy0tY29uY3VycmVuY3knLCBhcmd2LmNvbmN1cnJlbmN5IF0pO1xuICAgIGlmIChhcmd2LmRlYnVnKSB7XG4gICAgICBhdmFQYXRoID0gcHJvY2Vzcy5leGVjUGF0aDtcbiAgICAgIGFyZ3MgPSBbICctLWluc3BlY3QnLCAnLS1kZWJ1Zy1icmsnLCBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcycsICdhdmEnLCAncHJvZmlsZS5qcycpLCBhcmd2LmRlYnVnIF07XG4gICAgfVxuICAgIGlmIChhcmd2Lm1hdGNoKSB7XG4gICAgICBhcmdzLnB1c2goJy0tbWF0Y2gnLCBhcmd2Lm1hdGNoKTtcbiAgICB9XG4gICAgaWYgKGFyZ3YudmVyYm9zZSkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLXZlcmJvc2UnKTtcbiAgICB9XG4gICAgaWYgKGFyZ3YudGltZW91dCkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLXRpbWVvdXQnLCBhcmd2LnRpbWVvdXQpO1xuICAgIH1cbiAgICBpZiAoYXJndi5mYWlsRmFzdCkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLWZhaWwtZmFzdCcpO1xuICAgIH1cbiAgICBpZiAoYXJndi5zZXJpYWwpIHtcbiAgICAgIGFyZ3MudW5zaGlmdCgnLS1zZXJpYWwnKTtcbiAgICB9XG4gICAgdGhpcy50ZXN0cyA9IHNwYXduKGF2YVBhdGgsIGFyZ3MsIHtcbiAgICAgIGN3ZDogYXJndi5vdXRwdXQsXG4gICAgICBzdGRpbzogWyAncGlwZScsIHByb2Nlc3Muc3Rkb3V0LCBwcm9jZXNzLnN0ZGVyciBdLFxuICAgICAgZW52OiBhc3NpZ24oe30sIHByb2Nlc3MuZW52LCB7XG4gICAgICAgIFBPUlQ6IGFyZ3YucG9ydCxcbiAgICAgICAgREVOQUxJX0xFQVZFX1RNUDogYXJndi5saXR0ZXIsXG4gICAgICAgIE5PREVfRU5WOiBwcm9qZWN0LmVudmlyb25tZW50LFxuICAgICAgICBERUJVR19DT0xPUlM6IDFcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgdWkuaW5mbyhgPT09PiBSdW5uaW5nICR7IHByb2plY3QucGtnLm5hbWUgfSB0ZXN0cyAuLi5gKTtcbiAgICB0aGlzLnRlc3RzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlciB8IG51bGwpID0+IHtcbiAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgIHVpLnN1Y2Nlc3MoJ1xcbj09PT4gVGVzdHMgcGFzc2VkIO2gve2xjScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdWkuZXJyb3IoJ1xcbj09PT4gVGVzdHMgZmFpbGVkIO2gve2ypScpO1xuICAgICAgfVxuICAgICAgZGVsZXRlIHRoaXMudGVzdHM7XG4gICAgICBpZiAoYXJndi53YXRjaCkge1xuICAgICAgICB1aS5pbmZvKCc9PT0+IFdhaXRpbmcgZm9yIGNoYW5nZXMgdG8gcmUtcnVuIC4uLlxcblxcbicpO1xuICAgICAgIH0gZWxzZSB7XG4gICAgICAgICBwcm9jZXNzLmV4aXRDb2RlID0gY29kZSA9PSBudWxsID8gMSA6IGNvZGU7XG4gICAgICAgICB1aS5pbmZvKGA9PT0+IGV4aXRpbmcgd2l0aCAkeyBwcm9jZXNzLmV4aXRDb2RlIH1gKTtcbiAgICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==