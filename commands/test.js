"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const path = require("path");
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
            else {
                // Swap common file extensions out with `.js` so ava will find the actual, built files This
                // doesn't cover every possible edge case, hence the `isValidJsPattern` below, but it should
                // cover the common use cases.
                files = files.map((pattern) => pattern.replace(/\.[A-z0-9]{1,4}$/, '.js'));
            }
            // Filter for .js files only
            files = files.filter((pattern) => {
                let isValidJsPattern = pattern.endsWith('*') || pattern.endsWith('.js');
                if (!isValidJsPattern) {
                    denali_cli_1.ui.warn(denali_cli_1.unwrap `
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
                process.exit(process.exitCode);
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
TestCommand.commandName = 'test';
TestCommand.description = "Run your app's test suite";
TestCommand.longDescription = denali_cli_1.unwrap `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUVnQjtBQUNoQiw2QkFBNkI7QUFDN0IsaURBQW9EO0FBQ3BELDJDQUEwRDtBQUUxRDs7OztHQUlHO0FBQ0gsaUJBQWlDLFNBQVEsb0JBQU87SUFnRnhDLEdBQUcsQ0FBQyxJQUFTOztZQUNqQixJQUFJLEtBQUssR0FBYSxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sMkZBQTJGO2dCQUMzRiw0RkFBNEY7Z0JBQzVGLDhCQUE4QjtnQkFDOUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdFLENBQUM7WUFDRCw0QkFBNEI7WUFDNUIsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFlO2dCQUNuQyxJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLGVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQU0sQ0FBQTs7WUFFVCxPQUFROztTQUVaLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUMxQixDQUFD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QVM7S0FDckI7SUFDRCxRQUFRLEVBQUU7UUFDUixXQUFXLEVBQUUsaUNBQWlDO1FBQzlDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7SUFDRCxNQUFNLEVBQUU7UUFDTixXQUFXLEVBQUUsK0VBQStFO1FBQzVGLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7SUFDRCxNQUFNLEVBQUU7UUFDTixXQUFXLEVBQUUsb0JBQW9CO1FBQ2pDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7SUFDRCxXQUFXLEVBQUU7UUFDWCxXQUFXLEVBQUUsOENBQThDO1FBQzNELE9BQU8sRUFBRSxDQUFDO1FBQ1YsSUFBSSxFQUFPLFFBQVE7S0FDcEI7Q0FDRixDQUFDO0FBNUVKLDhCQXdNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFzc2lnblxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNwYXduLCBDaGlsZFByb2Nlc3MgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHVpLCBDb21tYW5kLCBQcm9qZWN0LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcblxuLyoqXG4gKiBSdW4geW91ciBhcHAncyB0ZXN0IHN1aXRlXG4gKlxuICogQHBhY2thZ2UgY29tbWFuZHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHN0YXRpYyBjb21tYW5kTmFtZSA9ICd0ZXN0JztcbiAgc3RhdGljIGRlc2NyaXB0aW9uID0gXCJSdW4geW91ciBhcHAncyB0ZXN0IHN1aXRlXCI7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgUnVucyB5b3VyIGFwcCdzIHRlc3Qgc3VpdGUsIGFuZCBjYW4gb3B0aW9uYWxseSBrZWVwIHJlLXJ1bm5pbmcgaXQgb24gZWFjaCBmaWxlIGNoYW5nZSAoLS13YXRjaCkuXG4gIGA7XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICdbZmlsZXMuLi5dJztcblxuICBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgZGVidWc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHRlc3QgZmlsZSB5b3Ugd2FudCB0byBkZWJ1Zy4gQ2FuIG9ubHkgZGVidWcgb25lIGZpbGUgYXQgYSB0aW1lLicsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICB3YXRjaDoge1xuICAgICAgZGVzY3JpcHRpb246ICdSZS1ydW4gdGhlIHRlc3RzIHdoZW4gdGhlIHNvdXJjZSBmaWxlcyBjaGFuZ2UnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgbWF0Y2g6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRmlsdGVyIHdoaWNoIHRlc3RzIHJ1biBiYXNlZCBvbiB0aGUgc3VwcGxpZWQgcmVnZXggcGF0dGVybicsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICB0aW1lb3V0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1NldCB0aGUgdGltZW91dCBmb3IgYWxsIHRlc3RzLCBpLmUuIC0tdGltZW91dCAxMHMsIC0tdGltZW91dCAybScsXG4gICAgICB0eXBlOiA8YW55PidzdHJpbmcnXG4gICAgfSxcbiAgICBza2lwTGludDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTa2lwIGxpbnRpbmcgdGhlIGFwcCBzb3VyY2UgZmlsZXMnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgc2tpcEF1ZGl0OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1NraXAgYXVkaXRpbmcgeW91ciBwYWNrYWdlLmpzb24gZm9yIHZ1bG5lcmFiaWxpdGVzJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHZlcmJvc2U6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgZGV0YWlsZWQgb3V0cHV0IG9mIHRoZSBzdGF0dXMgb2YgeW91ciB0ZXN0IHJ1bicsXG4gICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudi5DSSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBvdXRwdXQ6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRpcmVjdG9yeSB0byB3cml0ZSB0aGUgY29tcGlsZWQgYXBwIHRvLiBEZWZhdWx0cyB0byBhIHRtcCBkaXJlY3RvcnknLFxuICAgICAgZGVmYXVsdDogcGF0aC5qb2luKCd0bXAnLCAndGVzdCcpLFxuICAgICAgdHlwZTogPGFueT4nc3RyaW5nJ1xuICAgIH0sXG4gICAgcHJpbnRTbG93VHJlZXM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgb3V0IGFuIGFuYWx5c2lzIG9mIHRoZSBidWlsZCBwcm9jZXNzLCBzaG93aW5nIHRoZSBzbG93ZXN0IG5vZGVzLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBmYWlsRmFzdDoge1xuICAgICAgZGVzY3JpcHRpb246ICdTdG9wIHRlc3RzIG9uIHRoZSBmaXJzdCBmYWlsdXJlJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIGxpdHRlcjoge1xuICAgICAgZGVzY3JpcHRpb246ICdEbyBub3QgY2xlYW4gdXAgdG1wIGRpcmVjdG9yaWVzIGNyZWF0ZWQgZHVyaW5nIHRlc3RpbmcgKHVzZWZ1bCBmb3IgZGVidWdnaW5nKScsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfSxcbiAgICBzZXJpYWw6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRlc3RzIHNlcmlhbGx5JyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIGNvbmN1cnJlbmN5OiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0hvdyBtYW55IHRlc3QgZmlsZXMgc2hvdWxkIHJ1biBjb25jdXJyZW50bHk/JyxcbiAgICAgIGRlZmF1bHQ6IDUsXG4gICAgICB0eXBlOiA8YW55PidudW1iZXInXG4gICAgfVxuICB9O1xuXG4gIHRlc3RzOiBDaGlsZFByb2Nlc3M7XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIGxldCBmaWxlcyA9IDxzdHJpbmdbXT5hcmd2LmZpbGVzO1xuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGZpbGVzLnB1c2goJ3Rlc3QvKiovKi5qcycpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTd2FwIGNvbW1vbiBmaWxlIGV4dGVuc2lvbnMgb3V0IHdpdGggYC5qc2Agc28gYXZhIHdpbGwgZmluZCB0aGUgYWN0dWFsLCBidWlsdCBmaWxlcyBUaGlzXG4gICAgICAvLyBkb2Vzbid0IGNvdmVyIGV2ZXJ5IHBvc3NpYmxlIGVkZ2UgY2FzZSwgaGVuY2UgdGhlIGBpc1ZhbGlkSnNQYXR0ZXJuYCBiZWxvdywgYnV0IGl0IHNob3VsZFxuICAgICAgLy8gY292ZXIgdGhlIGNvbW1vbiB1c2UgY2FzZXMuXG4gICAgICBmaWxlcyA9IGZpbGVzLm1hcCgocGF0dGVybikgPT4gcGF0dGVybi5yZXBsYWNlKC9cXC5bQS16MC05XXsxLDR9JC8sICcuanMnKSk7XG4gICAgfVxuICAgIC8vIEZpbHRlciBmb3IgLmpzIGZpbGVzIG9ubHlcbiAgICBmaWxlcyA9IGZpbGVzLmZpbHRlcigocGF0dGVybjogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgaXNWYWxpZEpzUGF0dGVybiA9IHBhdHRlcm4uZW5kc1dpdGgoJyonKSB8fCBwYXR0ZXJuLmVuZHNXaXRoKCcuanMnKTtcbiAgICAgIGlmICghaXNWYWxpZEpzUGF0dGVybikge1xuICAgICAgICB1aS53YXJuKHVud3JhcGBcbiAgICAgICAgICBJZiB5b3Ugd2FudCB0byBydW4gc3BlY2lmaWMgdGVzdCBmaWxlcywgeW91IG11c3QgdXNlIHRoZSAuanMgZXh0ZW5zaW9uLiBZb3Ugc3VwcGxpZWRcbiAgICAgICAgICAkeyBwYXR0ZXJuIH0uIERlbmFsaSB3aWxsIGJ1aWxkIHlvdXIgdGVzdCBmaWxlcyBiZWZvcmUgcnVubmluZyB0aGVtLCBzbyB5b3UgbmVlZCB0byB1c2VcbiAgICAgICAgICB0aGUgY29tcGlsZWQgZmlsZW5hbWUgd2hpY2ggZW5kcyBpbiAuanNcbiAgICAgICAgYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNWYWxpZEpzUGF0dGVybjtcbiAgICB9KTtcblxuICAgIGxldCBwcm9qZWN0ID0gbmV3IFByb2plY3Qoe1xuICAgICAgZW52aXJvbm1lbnQ6ICd0ZXN0JyxcbiAgICAgIHByaW50U2xvd1RyZWVzOiBhcmd2LnByaW50U2xvd1RyZWVzLFxuICAgICAgYXVkaXQ6ICFhcmd2LnNraXBBdWRpdCxcbiAgICAgIGxpbnQ6ICFhcmd2LnNraXBMaW50LFxuICAgICAgYnVpbGREdW1teTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgcHJvY2Vzcy5vbignZXhpdCcsIHRoaXMuY2xlYW5FeGl0LmJpbmQodGhpcykpO1xuICAgIHByb2Nlc3Mub24oJ1NJR0lOVCcsIHRoaXMuY2xlYW5FeGl0LmJpbmQodGhpcykpO1xuICAgIHByb2Nlc3Mub24oJ1NJR1RFUk0nLCB0aGlzLmNsZWFuRXhpdC5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChhcmd2LndhdGNoKSB7XG4gICAgICBwcm9qZWN0LndhdGNoKHtcbiAgICAgICAgb3V0cHV0RGlyOiBhcmd2Lm91dHB1dCxcbiAgICAgICAgLy8gRG9uJ3QgbGV0IGJyb2Njb2xpIHJlYnVpbGQgd2hpbGUgdGVzdHMgYXJlIHN0aWxsIHJ1bm5pbmcsIG9yIGVsc2VcbiAgICAgICAgLy8gd2UnbGwgYmUgcmVtb3ZpbmcgdGhlIHRlc3QgZmlsZXMgd2hpbGUgaW4gcHJvZ3Jlc3MgbGVhZGluZyB0byBjcnlwdGljXG4gICAgICAgIC8vIGVycm9ycy5cbiAgICAgICAgYmVmb3JlUmVidWlsZDogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLnRlc3RzKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy50ZXN0cy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2V4aXQnKTtcbiAgICAgICAgICAgICAgdGhpcy50ZXN0cy5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy50ZXN0cztcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB0aGlzLnRlc3RzLmtpbGwoKTtcbiAgICAgICAgICAgICAgdWkuaW5mbygnXFxuXFxuPT09PiBDaGFuZ2VzIGRldGVjdGVkLCBjYW5jZWxsaW5nIGluLXByb2dyZXNzIHRlc3RzIC4uLlxcblxcbicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvbkJ1aWxkOiB0aGlzLnJ1blRlc3RzLmJpbmQodGhpcywgZmlsZXMsIHByb2plY3QsIGFyZ3YpXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcHJvamVjdC5idWlsZChhcmd2Lm91dHB1dCk7XG4gICAgICAgIHRoaXMucnVuVGVzdHMoZmlsZXMsIHByb2plY3QsIGFyZ3YpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNsZWFuRXhpdCgpIHtcbiAgICBpZiAodGhpcy50ZXN0cykge1xuICAgICAgdGhpcy50ZXN0cy5raWxsKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHJ1blRlc3RzKGZpbGVzOiBzdHJpbmdbXSwgcHJvamVjdDogUHJvamVjdCwgYXJndjogYW55KSB7XG4gICAgbGV0IGF2YVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcycsICcuYmluJywgJ2F2YScpO1xuICAgIGxldCBhcmdzID0gZmlsZXMuY29uY2F0KFsgJyF0ZXN0L2R1bW15LyoqLyonLCAnLS1jb25jdXJyZW5jeScsIGFyZ3YuY29uY3VycmVuY3kgXSk7XG4gICAgaWYgKGFyZ3YuZGVidWcpIHtcbiAgICAgIGF2YVBhdGggPSBwcm9jZXNzLmV4ZWNQYXRoO1xuICAgICAgYXJncyA9IFsgJy0taW5zcGVjdCcsICctLWRlYnVnLWJyaycsIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzJywgJ2F2YScsICdwcm9maWxlLmpzJyksIGFyZ3YuZGVidWcgXTtcbiAgICB9XG4gICAgaWYgKGFyZ3YubWF0Y2gpIHtcbiAgICAgIGFyZ3MucHVzaCgnLS1tYXRjaCcsIGFyZ3YubWF0Y2gpO1xuICAgIH1cbiAgICBpZiAoYXJndi52ZXJib3NlKSB7XG4gICAgICBhcmdzLnVuc2hpZnQoJy0tdmVyYm9zZScpO1xuICAgIH1cbiAgICBpZiAoYXJndi50aW1lb3V0KSB7XG4gICAgICBhcmdzLnVuc2hpZnQoJy0tdGltZW91dCcsIGFyZ3YudGltZW91dCk7XG4gICAgfVxuICAgIGlmIChhcmd2LmZhaWxGYXN0KSB7XG4gICAgICBhcmdzLnVuc2hpZnQoJy0tZmFpbC1mYXN0Jyk7XG4gICAgfVxuICAgIGlmIChhcmd2LnNlcmlhbCkge1xuICAgICAgYXJncy51bnNoaWZ0KCctLXNlcmlhbCcpO1xuICAgIH1cbiAgICB0aGlzLnRlc3RzID0gc3Bhd24oYXZhUGF0aCwgYXJncywge1xuICAgICAgY3dkOiBhcmd2Lm91dHB1dCxcbiAgICAgIHN0ZGlvOiBbICdwaXBlJywgcHJvY2Vzcy5zdGRvdXQsIHByb2Nlc3Muc3RkZXJyIF0sXG4gICAgICBlbnY6IGFzc2lnbih7fSwgcHJvY2Vzcy5lbnYsIHtcbiAgICAgICAgUE9SVDogYXJndi5wb3J0LFxuICAgICAgICBERU5BTElfTEVBVkVfVE1QOiBhcmd2LmxpdHRlcixcbiAgICAgICAgTk9ERV9FTlY6IHByb2plY3QuZW52aXJvbm1lbnQsXG4gICAgICAgIERFQlVHX0NPTE9SUzogMVxuICAgICAgfSlcbiAgICB9KTtcbiAgICB1aS5pbmZvKGA9PT0+IFJ1bm5pbmcgJHsgcHJvamVjdC5wa2cubmFtZSB9IHRlc3RzIC4uLmApO1xuICAgIHRoaXMudGVzdHMub24oJ2V4aXQnLCAoY29kZTogbnVtYmVyIHwgbnVsbCkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgdWkuc3VjY2VzcygnXFxuPT09PiBUZXN0cyBwYXNzZWQg7aC97bGNJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1aS5lcnJvcignXFxuPT09PiBUZXN0cyBmYWlsZWQg7aC97bKlJyk7XG4gICAgICB9XG4gICAgICBkZWxldGUgdGhpcy50ZXN0cztcbiAgICAgIGlmIChhcmd2LndhdGNoKSB7XG4gICAgICAgIHVpLmluZm8oJz09PT4gV2FpdGluZyBmb3IgY2hhbmdlcyB0byByZS1ydW4gLi4uXFxuXFxuJyk7XG4gICAgICAgfSBlbHNlIHtcbiAgICAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSBjb2RlID09IG51bGwgPyAxIDogY29kZTtcbiAgICAgICAgIHVpLmluZm8oYD09PT4gZXhpdGluZyB3aXRoICR7IHByb2Nlc3MuZXhpdENvZGUgfWApO1xuICAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19