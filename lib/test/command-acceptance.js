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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC1hY2NlcHRhbmNlLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi90ZXN0L2NvbW1hbmQtYWNjZXB0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3QixpREFBMEQ7QUFDMUQsMkJBQTJCO0FBQzNCLG9DQUFvQztBQUNwQyxxQ0FBcUM7QUFDckMsNENBQTJDO0FBRTNDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBRTVELE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFFekI7Ozs7OztHQU1HO0FBQ0gsMkJBQTJDLFNBQVEsZ0JBQVk7SUFpRDdEOzs7Ozs7Ozs7T0FTRztJQUNILFlBQVksT0FBZSxFQUFFLFVBQThGLEVBQUU7UUFDM0gsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLElBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUMxQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjtZQUM1QyxNQUFNLEVBQUUsUUFBUyxPQUFPLENBQUMsSUFBSSxJQUFJLG9CQUFxQixFQUFFO1NBQ3pELENBQUUsQ0FBQyxJQUFJLENBQUM7UUFDVCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksYUFBYSxDQUFDO1FBQ3hELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxD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QUFDO0tBQUE7SUFFRDs7T0FFRztJQUNLLE9BQU87UUFDYixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0IsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBRUY7QUFwT0Qsd0NBb09DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZXhlYywgc3Bhd24sIENoaWxkUHJvY2VzcyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0ICogYXMgdG1wIGZyb20gJ3RtcCc7XG5pbXBvcnQgKiBhcyBkZWRlbnQgZnJvbSAnZGVkZW50LWpzJztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBEZW5hbGlPYmplY3QgZnJvbSAnLi4vbWV0YWwvb2JqZWN0JztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGVuYWxpOnRlc3Q6Y29tbWFuZC1hY2NlcHRhbmNlJyk7XG5cbmNvbnN0IE1JTlVURSA9IDYwICogMTAwMDtcblxuLyoqXG4gKiBBIENvbW1hbmRBY2NlcHRhbmNlVGVzdCBhbGxvd3MgeW91IHRvIHRlc3QgY29tbWFuZHMgaW5jbHVkZWQgaW4geW91IGFwcCBvciBhZGRvbi4gSXQgbWFrZXMgaXRcbiAqIGVhc3kgdG8gc2V0dXAgYSBjbGVhbiB0ZXN0IGRpcmVjdG9yeSB3aXRoIGZpeHR1cmUgZmlsZXMsIHJ1biB5b3VyIGNvbW1hbmQsIGFuZCB0ZXN0IGVpdGhlciB0aGVcbiAqIGNvbnNvbGUgb3V0cHV0IG9mIHlvdXIgY29tbWFuZCBvciB0aGUgc3RhdGUgb2YgdGhlIGZpbGVzeXN0ZW0gYWZ0ZXIgdGhlIGNvbW1hbmQgZmluaXNoZXMuXG4gKlxuICogQHBhY2thZ2UgdGVzdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kQWNjZXB0YW5jZVRlc3QgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBUaGUgY29tbWFuZCB0byBpbnZva2UsIGkuZS4gJ2J1aWxkJyB3b3VsZCB0ZXN0IHRoZSBpbnZvY2F0aW9uIG9mICckIGRlbmFsaSBidWlsZCdcbiAgICovXG4gIHB1YmxpYyBjb21tYW5kOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSB0ZXN0IGRpcmVjdG9yeSBnZW5lcmF0ZWQgdG8gdGVzdCB0aGlzIGNvbW1hbmQuIElmIGl0J3Mgbm90IHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvcixcbiAgICogRGVuYWxpIHdpbGwgY3JlYXRlIGEgdG1wIGRpcmVjdG9yeSBpbnNpZGUgdGhlICd0bXAnIGRpcmVjdG9yeSBpbiB5b3VyIHByb2plY3Qgcm9vdC5cbiAgICovXG4gIHB1YmxpYyBkaXI6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgTk9ERV9FTlYgdG8gaW52b2tlIHRoZSBjb21tYW5kIHdpdGguIERlZmF1bHRzIHRvIGRldmVsb3BtZW50LlxuICAgKi9cbiAgcHVibGljIGVudmlyb25tZW50OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSByb290IGRpcmVjdG9yeSBvZiB0aGUgcHJvamVjdCB1bmRlciB0ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIHByb2plY3RSb290OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBwYWNrYWdlLmpzb24gb2YgdGhlIHByb2plY3QgdW5kZXIgdGVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBwcm9qZWN0UGtnOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBwYXRoIHRvIHRoZSBkZW5hbGkgZXhlY3V0YWJsZSBmaWxlIHRoYXQgd2lsbCBiZSB1c2VkIHdoZW4gaW52b2tpbmcgdGhlIGNvbW1hbmRcbiAgICovXG4gIHByb3RlY3RlZCBkZW5hbGlQYXRoOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdoZW4gdGVzdGluZyB2aWEgdGhlIGAuc3Bhd24oKWAgbWV0aG9kLCB0aGlzIHdpbGwgYmUgdGhlIHNwYXduZWQgQ2hpbGRQcm9jZXNzXG4gICAqL1xuICBwcm90ZWN0ZWQgc3Bhd25lZENvbW1hbmQ6IENoaWxkUHJvY2VzcztcblxuICAvKipcbiAgICogVGhlIGludGVydmFsIHRoYXQgY2hlY2tzIHRoZSBzcGF3biBvdXRwdXRcbiAgICovXG4gIHByb3RlY3RlZCBwb2xsT3V0cHV0OiBOb2RlSlMuVGltZXI7XG5cbiAgLyoqXG4gICAqIEEgZmFsbGJhY2sgdGltZXIgd2hpY2ggd2lsbCBmYWlsIHRoZSB0ZXN0IGlmIHRoZSBzcGF3bmVkIHByb2Nlc3MgZG9lc24ndCBlbWl0IHBhc3Npbmcgb3V0cHV0IGluXG4gICAqIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS5cbiAgICovXG4gIHByb3RlY3RlZCBmYWxsYmFja1RpbWVvdXQ6IE5vZGVKUy5UaW1lcjtcblxuICAvKipcbiAgICogQHBhcmFtIG9wdGlvbnMuZGlyIEZvcmNlIHRoZSB0ZXN0IHRvIHVzZSB0aGlzIGRpcmVjdG9yeSBhcyB0aGUgdGVzdCBkaXJlY3RvcnkuIFVzZWZ1bCBpZiB5b3VcbiAgICogICAgICAgICAgICAgICAgICAgIHdhbnQgdG8gY3VzdG9taXplIHRoZSBmaXh0dXJlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgYmVmb3JlIHJ1bm5pbmdcbiAgICogQHBhcmFtIG9wdGlvbnMubmFtZSBBIHN0cmluZyB0byBpbmNsdWRlIGluIHRoZSBnZW5lcmF0ZWQgdG1wIGRpcmVjdG9yeSBuYW1lLiBVc2VmdWwgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgIGNvbWJpbmVkIHdpdGggdGhlIGBkZW5hbGkgdGVzdCAtLWxpdHRlcmAgb3B0aW9uLCB3aGljaCB3aWxsIGxlYXZlIHRoZSB0bXBcbiAgICogICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcmllcyBiZWhpbmQsIG1ha2luZyBpdCBlYXNpZXIgdG8gaW5zcGVjdCB3aGF0J3MgaGFwcGVuaW5nIGluIGFcbiAgICogICAgICAgICAgICAgICAgICAgICBDb21tYW5kQWNjZXB0YW5jZVRlc3RcbiAgICogQHBhcmFtIG9wdGlvbnMucG9wdWxhdGVXaXRoRHVtbXkgU2hvdWxkIHRoZSB0ZXN0IGRpcmVjdG9yeSBiZSBwb3B1bGF0ZWQgd2l0aCBhIGNvcHkgb2YgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1bW15IGFwcD9cbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbW1hbmQ6IHN0cmluZywgb3B0aW9uczogeyBkaXI/OiBzdHJpbmcsIGVudmlyb25tZW50Pzogc3RyaW5nLCBuYW1lPzogc3RyaW5nLCBwb3B1bGF0ZVdpdGhEdW1teT86IGJvb2xlYW4gfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgIHRoaXMuZGlyID0gb3B0aW9ucy5kaXIgfHwgKDxhbnk+dG1wLmRpclN5bmMoe1xuICAgICAgdW5zYWZlQ2xlYW51cDogIXByb2Nlc3MuZW52LkRFTkFMSV9MRUFWRV9UTVAsXG4gICAgICBwcmVmaXg6IGB0ZXN0LSR7IG9wdGlvbnMubmFtZSB8fCAnY29tbWFuZC1hY2NlcHRhbmNlJyB9YFxuICAgIH0pKS5uYW1lO1xuICAgIHRoaXMuZW52aXJvbm1lbnQgPSBvcHRpb25zLmVudmlyb25tZW50IHx8ICdkZXZlbG9wbWVudCc7XG4gICAgdGhpcy5wcm9qZWN0Um9vdCA9IHBhdGguZGlybmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpO1xuICAgIHRoaXMucHJvamVjdFBrZyA9IHJlcXVpcmUocGF0aC5qb2luKHRoaXMucHJvamVjdFJvb3QsICdwYWNrYWdlLmpzb24nKSk7XG4gICAgLy8gV2UgZG9uJ3QgdXNlIG5vZGVfbW9kdWxlcy8uYmluL2RlbmFsaSBiZWNhdXNlIGlmIGRlbmFsaS1jbGkgaXMgbGlua2VkIGluIHZpYSB5YXJuLCBpdCBkb2Vzbid0XG4gICAgLy8gYWRkIHRoZSBiaW5hcnkgc3ltbGlua3MgdG8gLmJpbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS95YXJucGtnL3lhcm4vaXNzdWVzLzI0OTNcbiAgICB0aGlzLmRlbmFsaVBhdGggPSBwYXRoLmpvaW4odGhpcy5wcm9qZWN0Um9vdCwgJ25vZGVfbW9kdWxlcycsICdkZW5hbGktY2xpJywgJ2Rpc3QnLCAnYmluJywgJ2RlbmFsaScpO1xuXG4gICAgaWYgKG9wdGlvbnMucG9wdWxhdGVXaXRoRHVtbXkgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnBvcHVsYXRlV2l0aER1bW15KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvcHkgdGhlIGR1bW15IGFwcCBpbnRvIG91ciB0ZXN0IGRpcmVjdG9yeVxuICAgKi9cbiAgcHVibGljIHBvcHVsYXRlV2l0aER1bW15KCk6IHZvaWQge1xuICAgIGRlYnVnKGBwb3B1bGF0aW5nIHRtcCBkaXJlY3RvcnkgZm9yIFwiJHsgdGhpcy5jb21tYW5kIH1cIiBjb21tYW5kIHdpdGggZHVtbXkgYXBwYCk7XG4gICAgbGV0IGR1bW15ID0gcGF0aC5qb2luKHRoaXMucHJvamVjdFJvb3QsICd0ZXN0JywgJ2R1bW15Jyk7XG4gICAgbGV0IHRtcE5vZGVNb2R1bGVzID0gcGF0aC5qb2luKHRoaXMuZGlyLCAnbm9kZV9tb2R1bGVzJyk7XG4gICAgYXNzZXJ0KCFmcy5leGlzdHNTeW5jKHRtcE5vZGVNb2R1bGVzKSwgJ1lvdSB0cmllZCB0byBydW4gYSBDb21tYW5kQWNjZXB0YW5jZVRlc3QgYWdhaW5zdCBhIGRpcmVjdG9yeSB0aGF0IGFscmVhZHkgaGFzIGFuIGFwcCBpbiBpdC4gRGlkIHlvdSBmb3JnZXQgdG8gc3BlY2lmeSB7IHBvcHVsYXRlV2l0aER1bW15OiBmYWxzZSB9PycpO1xuICAgIC8vIENvcHkgb3ZlciB0aGUgZHVtbXkgYXBwXG4gICAgZnMuY29weVN5bmMoZHVtbXksIHRoaXMuZGlyKTtcbiAgICAvLyBTeW1saW5rIHRoZSBhZGRvbiBpdHNlbGYgYXMgYSBkZXBlbmRlbmN5IG9mIHRoZSBkdW1teSBhcHAuIFRoZSBjb21waWxlZCBkdW1teSBhcHAgd2lsbCBoYXZlXG4gICAgLy8gdGhlIGNvbXBpbGVkIGFkZG9uIGluIGl0J3Mgbm9kZV9tb2R1bGVzXG4gICAgZnMubWtkaXJTeW5jKHRtcE5vZGVNb2R1bGVzKTtcbiAgICBmcy5yZWFkZGlyU3luYyhwYXRoLmpvaW4odGhpcy5wcm9qZWN0Um9vdCwgJ25vZGVfbW9kdWxlcycpKS5mb3JFYWNoKChub2RlTW9kdWxlRW50cnkpID0+IHtcbiAgICAgIGZzLnN5bWxpbmtTeW5jKHBhdGguam9pbih0aGlzLnByb2plY3RSb290LCAnbm9kZV9tb2R1bGVzJywgbm9kZU1vZHVsZUVudHJ5KSwgcGF0aC5qb2luKHRtcE5vZGVNb2R1bGVzLCBub2RlTW9kdWxlRW50cnkpKTtcbiAgICB9KTtcbiAgICBmcy5zeW1saW5rU3luYyhwYXRoLmpvaW4odGhpcy5wcm9qZWN0Um9vdCwgJ3RtcCcsICd0ZXN0JywgJ25vZGVfbW9kdWxlcycsIHRoaXMucHJvamVjdFBrZy5uYW1lKSwgcGF0aC5qb2luKHRtcE5vZGVNb2R1bGVzLCB0aGlzLnByb2plY3RQa2cubmFtZSkpO1xuICAgIGRlYnVnKCd0bXAgZGlyZWN0b3J5IHBvcHVsYXRlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGUgY29tbWFuZCBhbmQgcmV0dXJuIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBvdXRwdXQgb2YgdGhlIGNvbW1hbmQuIFVzZWZ1bCBmb3JcbiAgICogY29tbWFuZHMgdGhhdCBoYXZlIGEgZGVmaW5pdGVseSBjb21wbGV0aW9uIChpLmUuICdidWlsZCcsIG5vdCAnc2VydmUnKVxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucy5mYWlsT25TdGRlcnIgU2hvdWxkIGFueSBvdXRwdXQgdG8gc3RkZXJyIHJlc3VsdCBpbiBhIHJlamVjdGVkIHByb21pc2U/XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcnVuKG9wdGlvbnM6IHsgZmFpbE9uU3RkZXJyPzogYm9vbGVhbiwgZW52PzogYW55IH0gPSB7fSk6IFByb21pc2U8eyBzdGRvdXQ6IHN0cmluZywgc3RkZXJyOiBzdHJpbmcsIGRpcjogc3RyaW5nIH0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8eyBzdGRvdXQ6IHN0cmluZywgc3RkZXJyOiBzdHJpbmcsIGRpcjogc3RyaW5nIH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGV4ZWMoYCR7IHRoaXMuZGVuYWxpUGF0aCB9ICR7IHRoaXMuY29tbWFuZCB9YCwge1xuICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oe30sIHByb2Nlc3MuZW52LCB7XG4gICAgICAgICAgTk9ERV9FTlY6IHRoaXMuZW52aXJvbm1lbnRcbiAgICAgICAgfSwgb3B0aW9ucy5lbnYgfHwge30pLFxuICAgICAgICBjd2Q6IHRoaXMuZGlyXG4gICAgICB9LCAoZXJyLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyIHx8IChvcHRpb25zLmZhaWxPblN0ZGVyciAmJiBzdGRlcnIubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICBlcnIgPSBlcnIgfHwgbmV3IEVycm9yKCdcXG4nKTtcbiAgICAgICAgICBlcnIubWVzc2FnZSArPSBkZWRlbnRgXG4gICAgICAgICAgICBcIiQgZGVuYWxpICR7IHRoaXMuY29tbWFuZCB9XCIgZmFpbGVkIHdpdGggdGhlIGZvbGxvd2luZyBvdXRwdXQ6XG4gICAgICAgICAgICA9PT09PiBjd2Q6ICR7IHRoaXMuZGlyIH1cbiAgICAgICAgICAgID09PT0+IHN0ZG91dDpcbiAgICAgICAgICAgICR7IHN0ZG91dCB9XG4gICAgICAgICAgICA9PT09PiBzdGRlcnI6XG4gICAgICAgICAgICAkeyBzdGRlcnIgfVxuICAgICAgICAgIGA7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZSh7IHN0ZG91dCwgc3RkZXJyLCBkaXI6IHRoaXMuZGlyIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnZva2UgdGhlIGNvbW1hbmQgYW5kIHBvbGwgdGhlIG91dHB1dCBldmVyeSBvcHRpb25zLnBvbGxJbnRlcnZhbC4gVXNlZnVsIGZvciBjb21tYW5kcyB0aGF0XG4gICAqIGhhdmUgYSBkZWZpbml0ZWx5IGNvbXBsZXRpb24gKGkuZS4gJ2J1aWxkJywgbm90ICdzZXJ2ZScpLiBFYWNoIHBvbGwgb2YgdGhlIG91dHB1dCB3aWxsIHJ1biB0aGVcbiAgICogc3VwcGxpZWQgb3B0aW9ucy5jaGVja091dHB1dCBtZXRob2QsIHBhc3NpbmcgaW4gdGhlIHN0ZG91dCBhbmQgc3RkZXJyIGJ1ZmZlcnMuIElmIHRoZVxuICAgKiBvcHRpb25zLmNoZWNrT3V0cHV0IG1ldGhvZCByZXR1cm5zIGEgdHJ1dGh5IHZhbHVlLCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlc29sdmUuXG4gICAqIE90aGVyd2lzZSwgaXQgd2lsbCBjb250aW51ZSB0byBwb2xsIHRoZSBvdXRwdXQgdW50aWwgb3B0aW9ucy50aW1lb3V0IGVsYXBzZXMsIGFmdGVyIHdoaWNoIHRoZVxuICAgKiByZXR1cm5lZCBwcm9tc2llIHdpbGwgcmVqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucy5mYWlsT25TdGRlcnIgU2hvdWxkIGFueSBvdXRwdXQgdG8gc3RkZXJyIHJlc3VsdCBpbiBhIHJlamVjdGVkIHByb21pc2U/XG4gICAqIEBwYXJhbSBvcHRpb25zLmNoZWNrT3V0cHV0IEEgZnVuY3Rpb24gaW52b2tlZCB3aXRoIHRoZSBzdGRvdXQgYW5kIHN0ZGVyciBidWZmZXJzIG9mIHRoZSBpbnZva2VkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQsIGFuZCBzaG91bGQgcmV0dXJuIHRydWUgaWYgdGhlIG91dHB1dCBwYXNzZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzcGF3bihvcHRpb25zOiB7XG4gICAgY2hlY2tPdXRwdXQoc3Rkb3V0OiBzdHJpbmcsIHN0ZGVycjogc3RyaW5nLCBkaXI6IHN0cmluZyk6IGJvb2xlYW4sXG4gICAgZmFpbE9uU3RkZXJyPzogYm9vbGVhbixcbiAgICBlbnY/OiBhbnksXG4gICAgcG9sbEludGVydmFsPzogbnVtYmVyLFxuICAgIHRpbWVvdXQ/OiBudW1iZXJcbiAgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiA8YW55Pm5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgdGhpcy5zcGF3bmVkQ29tbWFuZCA9IHNwYXduKHRoaXMuZGVuYWxpUGF0aCwgdGhpcy5jb21tYW5kLnNwbGl0KCcgJyksIHtcbiAgICAgICAgZW52OiBPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudiwge1xuICAgICAgICAgIE5PREVfRU5WOiB0aGlzLmVudmlyb25tZW50XG4gICAgICAgIH0sIG9wdGlvbnMuZW52IHx8IHt9KSxcbiAgICAgICAgY3dkOiB0aGlzLmRpcixcbiAgICAgICAgc3RkaW86ICdwaXBlJ1xuICAgICAgfSk7XG5cbiAgICAgIC8vIENsZWFudXAgc3Bhd25lZCBwcm9jZXNzZXMgaWYgb3VyIHByb2Nlc3MgaXMga2lsbGVkXG4gICAgICBsZXQgY2xlYW51cCA9IHRoaXMuY2xlYW51cC5iaW5kKHRoaXMpO1xuICAgICAgcHJvY2Vzcy5vbignZXhpdCcsIGNsZWFudXAuYmluZCh0aGlzKSk7XG5cbiAgICAgIC8vIEJ1ZmZlciB1cCB0aGUgb3V0cHV0IHNvIHRoZSBwb2xsaW5nIHRpbWVyIGNhbiBjaGVjayBpdFxuICAgICAgbGV0IHN0ZG91dEJ1ZmZlciA9ICcnO1xuICAgICAgbGV0IHN0ZGVyckJ1ZmZlciA9ICcnO1xuICAgICAgdGhpcy5zcGF3bmVkQ29tbWFuZC5zdGRvdXQub24oJ2RhdGEnLCAoZCkgPT4ge1xuICAgICAgICBzdGRvdXRCdWZmZXIgKz0gZC50b1N0cmluZygpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnNwYXduZWRDb21tYW5kLnN0ZGVyci5vbignZGF0YScsIChkKSA9PiB7XG4gICAgICAgIHN0ZGVyckJ1ZmZlciArPSBkLnRvU3RyaW5nKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gSGFuZGxlIGVycm9ycyBmcm9tIHRoZSBjaGlsZCBwcm9jZXNzXG4gICAgICB0aGlzLnNwYXduZWRDb21tYW5kLnN0ZG91dC5vbignZXJyb3InLCByZWplY3QpO1xuICAgICAgdGhpcy5zcGF3bmVkQ29tbWFuZC5zdGRlcnIub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgIHRoaXMuc3Bhd25lZENvbW1hbmQub24oJ2Vycm9yJywgcmVqZWN0KTtcblxuICAgICAgLy8gUG9sbCBwZXJpb2RpY2FsbHkgdG8gY2hlY2sgdGhlIHJlc3VsdHNcbiAgICAgIHRoaXMucG9sbE91dHB1dCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgaWYgKHN0ZGVyckJ1ZmZlci5sZW5ndGggPiAwICYmIG9wdGlvbnMuZmFpbE9uU3RkZXJyKSB7XG4gICAgICAgICAgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcignZXhpdCcsIGNsZWFudXApO1xuICAgICAgICAgIHRoaXMuY2xlYW51cCgpO1xuICAgICAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcihgJyR7IHRoaXMuY29tbWFuZCB9JyBwcmludGVkIHRvIHN0ZGVyciB3aXRoIGZhaWxPblN0ZGVyciBlbmFibGVkOlxcbmApO1xuICAgICAgICAgIGVycm9yLm1lc3NhZ2UgKz0gZGVkZW50YFxuICAgICAgICAgICAgPT09PT4gY3dkOiAkeyB0aGlzLmRpciB9XG4gICAgICAgICAgICA9PT09PiBzdGRvdXQ6XG4gICAgICAgICAgICAkeyBzdGRvdXRCdWZmZXIgfVxuICAgICAgICAgICAgPT09PT4gc3RkZXJyOlxuICAgICAgICAgICAgJHsgc3RkZXJyQnVmZmVyIH1cbiAgICAgICAgICBgO1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBhc3NlZCA9IG9wdGlvbnMuY2hlY2tPdXRwdXQoc3Rkb3V0QnVmZmVyLCBzdGRlcnJCdWZmZXIsIHRoaXMuZGlyKTtcbiAgICAgICAgaWYgKHBhc3NlZCkge1xuICAgICAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoJ2V4aXQnLCBjbGVhbnVwKTtcbiAgICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIG9wdGlvbnMucG9sbEludGVydmFsIHx8IDUwKTtcblxuICAgICAgLy8gRW5zdXJlIHRoZSB0ZXN0IGZhaWxzIGlmIHdlIGRvbid0IHBhc3MgdGhlIHRlc3QgYWZ0ZXIgYSB3aGlsZVxuICAgICAgbGV0IHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgfHwgKHByb2Nlc3MuZW52LkNJID8gNSAqIE1JTlVURSA6IDMgKiBNSU5VVEUpO1xuICAgICAgdGhpcy5mYWxsYmFja1RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcignZXhpdCcsIGNsZWFudXApO1xuICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgbGV0IG1lc3NhZ2UgPSBgVGltZW91dCBvZiAkeyAodGltZW91dCAvIDEwMDApIC8gNjAgfSBtaW51dGVzIGV4Y2VlZGVkIGZvciBzcGF3bmVkIGNvbW1hbmQ6ICR7IHRoaXMuY29tbWFuZCB9XFxuYDtcbiAgICAgICAgbWVzc2FnZSArPSBkZWRlbnRgXG4gICAgICAgICAgPT09PT4gc3Rkb3V0OlxuICAgICAgICAgICR7IHN0ZG91dEJ1ZmZlciB9XG4gICAgICAgICAgPT09PT4gc3RkZXJyOlxuICAgICAgICAgICR7IHN0ZGVyckJ1ZmZlciB9XG4gICAgICAgIGA7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IobWVzc2FnZSkpO1xuICAgICAgfSwgdGltZW91dCk7XG5cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBjbGVhbnVwIG1ldGhvZCB0byBjbGVhbiB1cCB0aW1lcnMgYW5kIHByb2Nlc3Nlcy5cbiAgICovXG4gIHByaXZhdGUgY2xlYW51cCgpIHtcbiAgICB0aGlzLnNwYXduZWRDb21tYW5kLmtpbGwoKTtcbiAgICBjbGVhckludGVydmFsKHRoaXMucG9sbE91dHB1dCk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuZmFsbGJhY2tUaW1lb3V0KTtcbiAgfVxuXG59XG4iXX0=