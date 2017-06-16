"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs-extra");
const assert = require("assert");
const path = require("path");
const child_process_1 = require("child_process");
const tmp = require("tmp");
const dedent = require("dedent-js");
const createDebug = require("debug");
const object_1 = require("../metal/object");
const debug = createDebug('denali:test:command-acceptance');
const MINUTE = 60 * 1000;
/**
 * A CommandAcceptanceTest allows you to test commands included in you app or addon. It makes it
 * easy to setup a clean test directory with fixture files, run your command, and test either the
 * console output of your command or the state of the filesystem after the command finishes.
 *
 * @package test
 */
class CommandAcceptanceTest extends object_1.default {
    /**
     * @param options.dir Force the test to use this directory as the test directory. Useful if you
     *                    want to customize the fixture directory structure before running
     * @param options.name A string to include in the generated tmp directory name. Useful when
     *                     combined with the `denali test --litter` option, which will leave the tmp
     *                     directories behind, making it easier to inspect what's happening in a
     *                     CommandAcceptanceTest
     * @param options.populateWithDummy Should the test directory be populated with a copy of the
     *                                  dummy app?
     */
    constructor(command, options = {}) {
        super();
        this.command = command;
        this.dir = options.dir || tmp.dirSync({
            unsafeCleanup: !process.env.DENALI_LEAVE_TMP,
            prefix: `test-${options.name || 'command-acceptance'}`
        }).name;
        this.environment = options.environment || 'development';
        this.projectRoot = path.dirname(path.dirname(process.cwd()));
        this.projectPkg = require(path.join(this.projectRoot, 'package.json'));
        // We don't use node_modules/.bin/denali because if denali-cli is linked in via yarn, it doesn't
        // add the binary symlinks to .bin. See https://github.com/yarnpkg/yarn/issues/2493
        this.denaliPath = path.join(this.projectRoot, 'node_modules', 'denali-cli', 'dist', 'bin', 'denali');
        if (options.populateWithDummy !== false) {
            this.populateWithDummy();
        }
    }
    /**
     * Copy the dummy app into our test directory
     */
    populateWithDummy() {
        debug(`populating tmp directory for "${this.command}" command with dummy app`);
        let dummy = path.join(this.projectRoot, 'test', 'dummy');
        let tmpNodeModules = path.join(this.dir, 'node_modules');
        assert(!fs.existsSync(tmpNodeModules), 'You tried to run a CommandAcceptanceTest against a directory that already has an app in it. Did you forget to specify { populateWithDummy: false }?');
        // Copy over the dummy app
        fs.copySync(dummy, this.dir);
        // Symlink the addon itself as a dependency of the dummy app. The compiled dummy app will have
        // the compiled addon in it's node_modules
        fs.mkdirSync(tmpNodeModules);
        fs.readdirSync(path.join(this.projectRoot, 'node_modules')).forEach((nodeModuleEntry) => {
            fs.symlinkSync(path.join(this.projectRoot, 'node_modules', nodeModuleEntry), path.join(tmpNodeModules, nodeModuleEntry));
        });
        fs.symlinkSync(path.join(this.projectRoot, 'tmp', 'test', 'node_modules', this.projectPkg.name), path.join(tmpNodeModules, this.projectPkg.name));
        debug('tmp directory populated');
    }
    /**
     * Invoke the command and return promise that resolves with the output of the command. Useful for
     * commands that have a definitely completion (i.e. 'build', not 'serve')
     *
     * @param options.failOnStderr Should any output to stderr result in a rejected promise?
     */
    run(options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                child_process_1.exec(`${this.denaliPath} ${this.command}`, {
                    env: Object.assign({}, process.env, {
                        NODE_ENV: this.environment
                    }, options.env || {}),
                    cwd: this.dir
                }, (err, stdout, stderr) => {
                    if (err || (options.failOnStderr && stderr.length > 0)) {
                        err = err || new Error('\n');
                        err.message += dedent `
            "$ denali ${this.command}" failed with the following output:
            ====> cwd: ${this.dir}
            ====> stdout:
            ${stdout}
            ====> stderr:
            ${stderr}
          `;
                        reject(err);
                    }
                    else {
                        resolve({ stdout, stderr, dir: this.dir });
                    }
                });
            });
        });
    }
    /**
     * Invoke the command and poll the output every options.pollInterval. Useful for commands that
     * have a definitely completion (i.e. 'build', not 'serve'). Each poll of the output will run the
     * supplied options.checkOutput method, passing in the stdout and stderr buffers. If the
     * options.checkOutput method returns a truthy value, the returned promise will resolve.
     * Otherwise, it will continue to poll the output until options.timeout elapses, after which the
     * returned promsie will reject.
     *
     * @param options.failOnStderr Should any output to stderr result in a rejected promise?
     * @param options.checkOutput A function invoked with the stdout and stderr buffers of the invoked
     *                            command, and should return true if the output passes
     */
    spawn(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.spawnedCommand = child_process_1.spawn(this.denaliPath, this.command.split(' '), {
                    env: Object.assign({}, process.env, {
                        NODE_ENV: this.environment
                    }, options.env || {}),
                    cwd: this.dir,
                    stdio: 'pipe'
                });
                // Cleanup spawned processes if our process is killed
                let cleanup = this.cleanup.bind(this);
                process.on('exit', cleanup.bind(this));
                // Buffer up the output so the polling timer can check it
                let stdoutBuffer = '';
                let stderrBuffer = '';
                this.spawnedCommand.stdout.on('data', (d) => {
                    stdoutBuffer += d.toString();
                });
                this.spawnedCommand.stderr.on('data', (d) => {
                    stderrBuffer += d.toString();
                });
                // Handle errors from the child process
                this.spawnedCommand.stdout.on('error', reject);
                this.spawnedCommand.stderr.on('error', reject);
                this.spawnedCommand.on('error', reject);
                // Poll periodically to check the results
                this.pollOutput = setInterval(() => {
                    if (stderrBuffer.length > 0 && options.failOnStderr) {
                        process.removeListener('exit', cleanup);
                        this.cleanup();
                        let error = new Error(`'${this.command}' printed to stderr with failOnStderr enabled:\n`);
                        error.message += dedent `
            ====> cwd: ${this.dir}
            ====> stdout:
            ${stdoutBuffer}
            ====> stderr:
            ${stderrBuffer}
          `;
                        reject(error);
                    }
                    let passed = options.checkOutput(stdoutBuffer, stderrBuffer, this.dir);
                    if (passed) {
                        process.removeListener('exit', cleanup);
                        this.cleanup();
                        resolve();
                    }
                }, options.pollInterval || 50);
                // Ensure the test fails if we don't pass the test after a while
                let timeout = options.timeout || (process.env.CI ? 5 * MINUTE : 3 * MINUTE);
                this.fallbackTimeout = setTimeout(() => {
                    process.removeListener('exit', cleanup);
                    this.cleanup();
                    let message = `Timeout of ${(timeout / 1000) / 60} minutes exceeded for spawned command: ${this.command}\n`;
                    message += dedent `
          ====> stdout:
          ${stdoutBuffer}
          ====> stderr:
          ${stderrBuffer}
        `;
                    reject(new Error(message));
                }, timeout);
            });
        });
    }
    /**
     * Internal cleanup method to clean up timers and processes.
     */
    cleanup() {
        this.spawnedCommand.kill();
        clearInterval(this.pollOutput);
        clearTimeout(this.fallbackTimeout);
    }
}
exports.default = CommandAcceptanceTest;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1hY2NlcHRhbmNlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi90ZXN0L2NvbW1hbmQtYWNjZXB0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3QixpREFBMEQ7QUFDMUQsMkJBQTJCO0FBQzNCLG9DQUFvQztBQUNwQyxxQ0FBcUM7QUFDckMsNENBQTJDO0FBRTNDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBRTVELE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFekI7Ozs7OztHQU1HO0FBQ0gsMkJBQTJDLFNBQVEsZ0JBQVk7SUFpRDdEOzs7Ozs7Ozs7T0FTRztJQUNILFlBQVksT0FBZSxFQUFFLFVBQThGLEVBQUU7UUFDM0gsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUMxQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtZQUM1QyxNQUFNLEVBQUUsUUFBUyxPQUFPLENBQUMsSUFBSSxJQUFJLG9CQUFxQixFQUFFO1NBQ3pELENBQUUsQ0FBQyxJQUFJLENBQUM7UUFDVCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksYUFBYSxDQUFDO1FBQ3hELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFD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QUFBO0lBRUQ7O09BRUc7SUFDSyxPQUFPO1FBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQixhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUVGO0FBcE9ELHdDQW9PQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGV4ZWMsIHNwYXduLCBDaGlsZFByb2Nlc3MgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCAqIGFzIHRtcCBmcm9tICd0bXAnO1xuaW1wb3J0ICogYXMgZGVkZW50IGZyb20gJ2RlZGVudC1qcyc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgRGVuYWxpT2JqZWN0IGZyb20gJy4uL21ldGFsL29iamVjdCc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTp0ZXN0OmNvbW1hbmQtYWNjZXB0YW5jZScpO1xuXG5jb25zdCBNSU5VVEUgPSA2MCAqIDEwMDA7XG5cbi8qKlxuICogQSBDb21tYW5kQWNjZXB0YW5jZVRlc3QgYWxsb3dzIHlvdSB0byB0ZXN0IGNvbW1hbmRzIGluY2x1ZGVkIGluIHlvdSBhcHAgb3IgYWRkb24uIEl0IG1ha2VzIGl0XG4gKiBlYXN5IHRvIHNldHVwIGEgY2xlYW4gdGVzdCBkaXJlY3Rvcnkgd2l0aCBmaXh0dXJlIGZpbGVzLCBydW4geW91ciBjb21tYW5kLCBhbmQgdGVzdCBlaXRoZXIgdGhlXG4gKiBjb25zb2xlIG91dHB1dCBvZiB5b3VyIGNvbW1hbmQgb3IgdGhlIHN0YXRlIG9mIHRoZSBmaWxlc3lzdGVtIGFmdGVyIHRoZSBjb21tYW5kIGZpbmlzaGVzLlxuICpcbiAqIEBwYWNrYWdlIHRlc3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IGV4dGVuZHMgRGVuYWxpT2JqZWN0IHtcblxuICAvKipcbiAgICogVGhlIGNvbW1hbmQgdG8gaW52b2tlLCBpLmUuICdidWlsZCcgd291bGQgdGVzdCB0aGUgaW52b2NhdGlvbiBvZiAnJCBkZW5hbGkgYnVpbGQnXG4gICAqL1xuICBjb21tYW5kOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSB0ZXN0IGRpcmVjdG9yeSBnZW5lcmF0ZWQgdG8gdGVzdCB0aGlzIGNvbW1hbmQuIElmIGl0J3Mgbm90IHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvcixcbiAgICogRGVuYWxpIHdpbGwgY3JlYXRlIGEgdG1wIGRpcmVjdG9yeSBpbnNpZGUgdGhlICd0bXAnIGRpcmVjdG9yeSBpbiB5b3VyIHByb2plY3Qgcm9vdC5cbiAgICovXG4gIGRpcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBOT0RFX0VOViB0byBpbnZva2UgdGhlIGNvbW1hbmQgd2l0aC4gRGVmYXVsdHMgdG8gZGV2ZWxvcG1lbnQuXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHByb2plY3QgdW5kZXIgdGVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBwcm9qZWN0Um9vdDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFja2FnZS5qc29uIG9mIHRoZSBwcm9qZWN0IHVuZGVyIHRlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJvamVjdFBrZzogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgcGF0aCB0byB0aGUgZGVuYWxpIGV4ZWN1dGFibGUgZmlsZSB0aGF0IHdpbGwgYmUgdXNlZCB3aGVuIGludm9raW5nIHRoZSBjb21tYW5kXG4gICAqL1xuICBwcm90ZWN0ZWQgZGVuYWxpUGF0aDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGVuIHRlc3RpbmcgdmlhIHRoZSBgLnNwYXduKClgIG1ldGhvZCwgdGhpcyB3aWxsIGJlIHRoZSBzcGF3bmVkIENoaWxkUHJvY2Vzc1xuICAgKi9cbiAgcHJvdGVjdGVkIHNwYXduZWRDb21tYW5kOiBDaGlsZFByb2Nlc3M7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnRlcnZhbCB0aGF0IGNoZWNrcyB0aGUgc3Bhd24gb3V0cHV0XG4gICAqL1xuICBwcm90ZWN0ZWQgcG9sbE91dHB1dDogTm9kZUpTLlRpbWVyO1xuXG4gIC8qKlxuICAgKiBBIGZhbGxiYWNrIHRpbWVyIHdoaWNoIHdpbGwgZmFpbCB0aGUgdGVzdCBpZiB0aGUgc3Bhd25lZCBwcm9jZXNzIGRvZXNuJ3QgZW1pdCBwYXNzaW5nIG91dHB1dCBpblxuICAgKiBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUuXG4gICAqL1xuICBwcm90ZWN0ZWQgZmFsbGJhY2tUaW1lb3V0OiBOb2RlSlMuVGltZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBvcHRpb25zLmRpciBGb3JjZSB0aGUgdGVzdCB0byB1c2UgdGhpcyBkaXJlY3RvcnkgYXMgdGhlIHRlc3QgZGlyZWN0b3J5LiBVc2VmdWwgaWYgeW91XG4gICAqICAgICAgICAgICAgICAgICAgICB3YW50IHRvIGN1c3RvbWl6ZSB0aGUgZml4dHVyZSBkaXJlY3Rvcnkgc3RydWN0dXJlIGJlZm9yZSBydW5uaW5nXG4gICAqIEBwYXJhbSBvcHRpb25zLm5hbWUgQSBzdHJpbmcgdG8gaW5jbHVkZSBpbiB0aGUgZ2VuZXJhdGVkIHRtcCBkaXJlY3RvcnkgbmFtZS4gVXNlZnVsIHdoZW5cbiAgICogICAgICAgICAgICAgICAgICAgICBjb21iaW5lZCB3aXRoIHRoZSBgZGVuYWxpIHRlc3QgLS1saXR0ZXJgIG9wdGlvbiwgd2hpY2ggd2lsbCBsZWF2ZSB0aGUgdG1wXG4gICAqICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3JpZXMgYmVoaW5kLCBtYWtpbmcgaXQgZWFzaWVyIHRvIGluc3BlY3Qgd2hhdCdzIGhhcHBlbmluZyBpbiBhXG4gICAqICAgICAgICAgICAgICAgICAgICAgQ29tbWFuZEFjY2VwdGFuY2VUZXN0XG4gICAqIEBwYXJhbSBvcHRpb25zLnBvcHVsYXRlV2l0aER1bW15IFNob3VsZCB0aGUgdGVzdCBkaXJlY3RvcnkgYmUgcG9wdWxhdGVkIHdpdGggYSBjb3B5IG9mIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdW1teSBhcHA/XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb21tYW5kOiBzdHJpbmcsIG9wdGlvbnM6IHsgZGlyPzogc3RyaW5nLCBlbnZpcm9ubWVudD86IHN0cmluZywgbmFtZT86IHN0cmluZywgcG9wdWxhdGVXaXRoRHVtbXk/OiBib29sZWFuIH0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb21tYW5kID0gY29tbWFuZDtcbiAgICB0aGlzLmRpciA9IG9wdGlvbnMuZGlyIHx8ICg8YW55PnRtcC5kaXJTeW5jKHtcbiAgICAgIHVuc2FmZUNsZWFudXA6ICFwcm9jZXNzLmVudi5ERU5BTElfTEVBVkVfVE1QLFxuICAgICAgcHJlZml4OiBgdGVzdC0keyBvcHRpb25zLm5hbWUgfHwgJ2NvbW1hbmQtYWNjZXB0YW5jZScgfWBcbiAgICB9KSkubmFtZTtcbiAgICB0aGlzLmVudmlyb25tZW50ID0gb3B0aW9ucy5lbnZpcm9ubWVudCB8fCAnZGV2ZWxvcG1lbnQnO1xuICAgIHRoaXMucHJvamVjdFJvb3QgPSBwYXRoLmRpcm5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKTtcbiAgICB0aGlzLnByb2plY3RQa2cgPSByZXF1aXJlKHBhdGguam9pbih0aGlzLnByb2plY3RSb290LCAncGFja2FnZS5qc29uJykpO1xuICAgIC8vIFdlIGRvbid0IHVzZSBub2RlX21vZHVsZXMvLmJpbi9kZW5hbGkgYmVjYXVzZSBpZiBkZW5hbGktY2xpIGlzIGxpbmtlZCBpbiB2aWEgeWFybiwgaXQgZG9lc24ndFxuICAgIC8vIGFkZCB0aGUgYmluYXJ5IHN5bWxpbmtzIHRvIC5iaW4uIFNlZSBodHRwczovL2dpdGh1Yi5jb20veWFybnBrZy95YXJuL2lzc3Vlcy8yNDkzXG4gICAgdGhpcy5kZW5hbGlQYXRoID0gcGF0aC5qb2luKHRoaXMucHJvamVjdFJvb3QsICdub2RlX21vZHVsZXMnLCAnZGVuYWxpLWNsaScsICdkaXN0JywgJ2JpbicsICdkZW5hbGknKTtcblxuICAgIGlmIChvcHRpb25zLnBvcHVsYXRlV2l0aER1bW15ICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5wb3B1bGF0ZVdpdGhEdW1teSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb3B5IHRoZSBkdW1teSBhcHAgaW50byBvdXIgdGVzdCBkaXJlY3RvcnlcbiAgICovXG4gIHBvcHVsYXRlV2l0aER1bW15KCk6IHZvaWQge1xuICAgIGRlYnVnKGBwb3B1bGF0aW5nIHRtcCBkaXJlY3RvcnkgZm9yIFwiJHsgdGhpcy5jb21tYW5kIH1cIiBjb21tYW5kIHdpdGggZHVtbXkgYXBwYCk7XG4gICAgbGV0IGR1bW15ID0gcGF0aC5qb2luKHRoaXMucHJvamVjdFJvb3QsICd0ZXN0JywgJ2R1bW15Jyk7XG4gICAgbGV0IHRtcE5vZGVNb2R1bGVzID0gcGF0aC5qb2luKHRoaXMuZGlyLCAnbm9kZV9tb2R1bGVzJyk7XG4gICAgYXNzZXJ0KCFmcy5leGlzdHNTeW5jKHRtcE5vZGVNb2R1bGVzKSwgJ1lvdSB0cmllZCB0byBydW4gYSBDb21tYW5kQWNjZXB0YW5jZVRlc3QgYWdhaW5zdCBhIGRpcmVjdG9yeSB0aGF0IGFscmVhZHkgaGFzIGFuIGFwcCBpbiBpdC4gRGlkIHlvdSBmb3JnZXQgdG8gc3BlY2lmeSB7IHBvcHVsYXRlV2l0aER1bW15OiBmYWxzZSB9PycpO1xuICAgIC8vIENvcHkgb3ZlciB0aGUgZHVtbXkgYXBwXG4gICAgZnMuY29weVN5bmMoZHVtbXksIHRoaXMuZGlyKTtcbiAgICAvLyBTeW1saW5rIHRoZSBhZGRvbiBpdHNlbGYgYXMgYSBkZXBlbmRlbmN5IG9mIHRoZSBkdW1teSBhcHAuIFRoZSBjb21waWxlZCBkdW1teSBhcHAgd2lsbCBoYXZlXG4gICAgLy8gdGhlIGNvbXBpbGVkIGFkZG9uIGluIGl0J3Mgbm9kZV9tb2R1bGVzXG4gICAgZnMubWtkaXJTeW5jKHRtcE5vZGVNb2R1bGVzKTtcbiAgICBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4odGhpcy5wcm9qZWN0Um9vdCwgJ25vZGVfbW9kdWxlcycpKS5mb3JFYWNoKChub2RlTW9kdWxlRW50cnkpID0+IHtcbiAgICAgIGZzLnN5bWxpbmtTeW5jKHBhdGguam9pbih0aGlzLnByb2plY3RSb290LCAnbm9kZV9tb2R1bGVzJywgbm9kZU1vZHVsZUVudHJ5KSwgcGF0aC5qb2luKHRtcE5vZGVNb2R1bGVzLCBub2RlTW9kdWxlRW50cnkpKTtcbiAgICB9KTtcbiAgICBmcy5zeW1saW5rU3luYyhwYXRoLmpvaW4odGhpcy5wcm9qZWN0Um9vdCwgJ3RtcCcsICd0ZXN0JywgJ25vZGVfbW9kdWxlcycsIHRoaXMucHJvamVjdFBrZy5uYW1lKSwgcGF0aC5qb2luKHRtcE5vZGVNb2R1bGVzLCB0aGlzLnByb2plY3RQa2cubmFtZSkpO1xuICAgIGRlYnVnKCd0bXAgZGlyZWN0b3J5IHBvcHVsYXRlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGUgY29tbWFuZCBhbmQgcmV0dXJuIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBvdXRwdXQgb2YgdGhlIGNvbW1hbmQuIFVzZWZ1bCBmb3JcbiAgICogY29tbWFuZHMgdGhhdCBoYXZlIGEgZGVmaW5pdGVseSBjb21wbGV0aW9uIChpLmUuICdidWlsZCcsIG5vdCAnc2VydmUnKVxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucy5mYWlsT25TdGRlcnIgU2hvdWxkIGFueSBvdXRwdXQgdG8gc3RkZXJyIHJlc3VsdCBpbiBhIHJlamVjdGVkIHByb21pc2U/XG4gICAqL1xuICBhc3luYyBydW4ob3B0aW9uczogeyBmYWlsT25TdGRlcnI/OiBib29sZWFuLCBlbnY/OiBhbnkgfSA9IHt9KTogUHJvbWlzZTx7IHN0ZG91dDogc3RyaW5nLCBzdGRlcnI6IHN0cmluZywgZGlyOiBzdHJpbmcgfT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx7IHN0ZG91dDogc3RyaW5nLCBzdGRlcnI6IHN0cmluZywgZGlyOiBzdHJpbmcgfT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZXhlYyhgJHsgdGhpcy5kZW5hbGlQYXRoIH0gJHsgdGhpcy5jb21tYW5kIH1gLCB7XG4gICAgICAgIGVudjogT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYsIHtcbiAgICAgICAgICBOT0RFX0VOVjogdGhpcy5lbnZpcm9ubWVudFxuICAgICAgICB9LCBvcHRpb25zLmVudiB8fCB7fSksXG4gICAgICAgIGN3ZDogdGhpcy5kaXJcbiAgICAgIH0sIChlcnIsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgIGlmIChlcnIgfHwgKG9wdGlvbnMuZmFpbE9uU3RkZXJyICYmIHN0ZGVyci5sZW5ndGggPiAwKSkge1xuICAgICAgICAgIGVyciA9IGVyciB8fCBuZXcgRXJyb3IoJ1xcbicpO1xuICAgICAgICAgIGVyci5tZXNzYWdlICs9IGRlZGVudGBcbiAgICAgICAgICAgIFwiJCBkZW5hbGkgJHsgdGhpcy5jb21tYW5kIH1cIiBmYWlsZWQgd2l0aCB0aGUgZm9sbG93aW5nIG91dHB1dDpcbiAgICAgICAgICAgID09PT0+IGN3ZDogJHsgdGhpcy5kaXIgfVxuICAgICAgICAgICAgPT09PT4gc3Rkb3V0OlxuICAgICAgICAgICAgJHsgc3Rkb3V0IH1cbiAgICAgICAgICAgID09PT0+IHN0ZGVycjpcbiAgICAgICAgICAgICR7IHN0ZGVyciB9XG4gICAgICAgICAgYDtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHsgc3Rkb3V0LCBzdGRlcnIsIGRpcjogdGhpcy5kaXIgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGUgY29tbWFuZCBhbmQgcG9sbCB0aGUgb3V0cHV0IGV2ZXJ5IG9wdGlvbnMucG9sbEludGVydmFsLiBVc2VmdWwgZm9yIGNvbW1hbmRzIHRoYXRcbiAgICogaGF2ZSBhIGRlZmluaXRlbHkgY29tcGxldGlvbiAoaS5lLiAnYnVpbGQnLCBub3QgJ3NlcnZlJykuIEVhY2ggcG9sbCBvZiB0aGUgb3V0cHV0IHdpbGwgcnVuIHRoZVxuICAgKiBzdXBwbGllZCBvcHRpb25zLmNoZWNrT3V0cHV0IG1ldGhvZCwgcGFzc2luZyBpbiB0aGUgc3Rkb3V0IGFuZCBzdGRlcnIgYnVmZmVycy4gSWYgdGhlXG4gICAqIG9wdGlvbnMuY2hlY2tPdXRwdXQgbWV0aG9kIHJldHVybnMgYSB0cnV0aHkgdmFsdWUsIHRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgcmVzb2x2ZS5cbiAgICogT3RoZXJ3aXNlLCBpdCB3aWxsIGNvbnRpbnVlIHRvIHBvbGwgdGhlIG91dHB1dCB1bnRpbCBvcHRpb25zLnRpbWVvdXQgZWxhcHNlcywgYWZ0ZXIgd2hpY2ggdGhlXG4gICAqIHJldHVybmVkIHByb21zaWUgd2lsbCByZWplY3QuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zLmZhaWxPblN0ZGVyciBTaG91bGQgYW55IG91dHB1dCB0byBzdGRlcnIgcmVzdWx0IGluIGEgcmVqZWN0ZWQgcHJvbWlzZT9cbiAgICogQHBhcmFtIG9wdGlvbnMuY2hlY2tPdXRwdXQgQSBmdW5jdGlvbiBpbnZva2VkIHdpdGggdGhlIHN0ZG91dCBhbmQgc3RkZXJyIGJ1ZmZlcnMgb2YgdGhlIGludm9rZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCwgYW5kIHNob3VsZCByZXR1cm4gdHJ1ZSBpZiB0aGUgb3V0cHV0IHBhc3Nlc1xuICAgKi9cbiAgYXN5bmMgc3Bhd24ob3B0aW9uczoge1xuICAgIGZhaWxPblN0ZGVycj86IGJvb2xlYW4sXG4gICAgZW52PzogYW55LFxuICAgIHBvbGxJbnRlcnZhbD86IG51bWJlcixcbiAgICB0aW1lb3V0PzogbnVtYmVyLFxuICAgIGNoZWNrT3V0cHV0KHN0ZG91dDogc3RyaW5nLCBzdGRlcnI6IHN0cmluZywgZGlyOiBzdHJpbmcpOiBib29sZWFuXG4gIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gPGFueT5uZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgIHRoaXMuc3Bhd25lZENvbW1hbmQgPSBzcGF3bih0aGlzLmRlbmFsaVBhdGgsIHRoaXMuY29tbWFuZC5zcGxpdCgnICcpLCB7XG4gICAgICAgIGVudjogT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYsIHtcbiAgICAgICAgICBOT0RFX0VOVjogdGhpcy5lbnZpcm9ubWVudFxuICAgICAgICB9LCBvcHRpb25zLmVudiB8fCB7fSksXG4gICAgICAgIGN3ZDogdGhpcy5kaXIsXG4gICAgICAgIHN0ZGlvOiAncGlwZSdcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDbGVhbnVwIHNwYXduZWQgcHJvY2Vzc2VzIGlmIG91ciBwcm9jZXNzIGlzIGtpbGxlZFxuICAgICAgbGV0IGNsZWFudXAgPSB0aGlzLmNsZWFudXAuYmluZCh0aGlzKTtcbiAgICAgIHByb2Nlc3Mub24oJ2V4aXQnLCBjbGVhbnVwLmJpbmQodGhpcykpO1xuXG4gICAgICAvLyBCdWZmZXIgdXAgdGhlIG91dHB1dCBzbyB0aGUgcG9sbGluZyB0aW1lciBjYW4gY2hlY2sgaXRcbiAgICAgIGxldCBzdGRvdXRCdWZmZXIgPSAnJztcbiAgICAgIGxldCBzdGRlcnJCdWZmZXIgPSAnJztcbiAgICAgIHRoaXMuc3Bhd25lZENvbW1hbmQuc3Rkb3V0Lm9uKCdkYXRhJywgKGQpID0+IHtcbiAgICAgICAgc3Rkb3V0QnVmZmVyICs9IGQudG9TdHJpbmcoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zcGF3bmVkQ29tbWFuZC5zdGRlcnIub24oJ2RhdGEnLCAoZCkgPT4ge1xuICAgICAgICBzdGRlcnJCdWZmZXIgKz0gZC50b1N0cmluZygpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEhhbmRsZSBlcnJvcnMgZnJvbSB0aGUgY2hpbGQgcHJvY2Vzc1xuICAgICAgdGhpcy5zcGF3bmVkQ29tbWFuZC5zdGRvdXQub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIHRoaXMuc3Bhd25lZENvbW1hbmQuc3RkZXJyLm9uKCdlcnJvcicsIHJlamVjdCk7XG4gICAgICB0aGlzLnNwYXduZWRDb21tYW5kLm9uKCdlcnJvcicsIHJlamVjdCk7XG5cbiAgICAgIC8vIFBvbGwgcGVyaW9kaWNhbGx5IHRvIGNoZWNrIHRoZSByZXN1bHRzXG4gICAgICB0aGlzLnBvbGxPdXRwdXQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChzdGRlcnJCdWZmZXIubGVuZ3RoID4gMCAmJiBvcHRpb25zLmZhaWxPblN0ZGVycikge1xuICAgICAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoJ2V4aXQnLCBjbGVhbnVwKTtcbiAgICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgICBsZXQgZXJyb3IgPSBuZXcgRXJyb3IoYCckeyB0aGlzLmNvbW1hbmQgfScgcHJpbnRlZCB0byBzdGRlcnIgd2l0aCBmYWlsT25TdGRlcnIgZW5hYmxlZDpcXG5gKTtcbiAgICAgICAgICBlcnJvci5tZXNzYWdlICs9IGRlZGVudGBcbiAgICAgICAgICAgID09PT0+IGN3ZDogJHsgdGhpcy5kaXIgfVxuICAgICAgICAgICAgPT09PT4gc3Rkb3V0OlxuICAgICAgICAgICAgJHsgc3Rkb3V0QnVmZmVyIH1cbiAgICAgICAgICAgID09PT0+IHN0ZGVycjpcbiAgICAgICAgICAgICR7IHN0ZGVyckJ1ZmZlciB9XG4gICAgICAgICAgYDtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwYXNzZWQgPSBvcHRpb25zLmNoZWNrT3V0cHV0KHN0ZG91dEJ1ZmZlciwgc3RkZXJyQnVmZmVyLCB0aGlzLmRpcik7XG4gICAgICAgIGlmIChwYXNzZWQpIHtcbiAgICAgICAgICBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKCdleGl0JywgY2xlYW51cCk7XG4gICAgICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9LCBvcHRpb25zLnBvbGxJbnRlcnZhbCB8fCA1MCk7XG5cbiAgICAgIC8vIEVuc3VyZSB0aGUgdGVzdCBmYWlscyBpZiB3ZSBkb24ndCBwYXNzIHRoZSB0ZXN0IGFmdGVyIGEgd2hpbGVcbiAgICAgIGxldCB0aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0IHx8IChwcm9jZXNzLmVudi5DSSA/IDUgKiBNSU5VVEUgOiAzICogTUlOVVRFKTtcbiAgICAgIHRoaXMuZmFsbGJhY2tUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoJ2V4aXQnLCBjbGVhbnVwKTtcbiAgICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgICAgIGxldCBtZXNzYWdlID0gYFRpbWVvdXQgb2YgJHsgKHRpbWVvdXQgLyAxMDAwKSAvIDYwIH0gbWludXRlcyBleGNlZWRlZCBmb3Igc3Bhd25lZCBjb21tYW5kOiAkeyB0aGlzLmNvbW1hbmQgfVxcbmA7XG4gICAgICAgIG1lc3NhZ2UgKz0gZGVkZW50YFxuICAgICAgICAgID09PT0+IHN0ZG91dDpcbiAgICAgICAgICAkeyBzdGRvdXRCdWZmZXIgfVxuICAgICAgICAgID09PT0+IHN0ZGVycjpcbiAgICAgICAgICAkeyBzdGRlcnJCdWZmZXIgfVxuICAgICAgICBgO1xuICAgICAgICByZWplY3QobmV3IEVycm9yKG1lc3NhZ2UpKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJuYWwgY2xlYW51cCBtZXRob2QgdG8gY2xlYW4gdXAgdGltZXJzIGFuZCBwcm9jZXNzZXMuXG4gICAqL1xuICBwcml2YXRlIGNsZWFudXAoKSB7XG4gICAgdGhpcy5zcGF3bmVkQ29tbWFuZC5raWxsKCk7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLnBvbGxPdXRwdXQpO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmZhbGxiYWNrVGltZW91dCk7XG4gIH1cblxufVxuIl19