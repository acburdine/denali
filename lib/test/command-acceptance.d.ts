/// <reference types="node" />
import { ChildProcess } from 'child_process';
import DenaliObject from '../metal/object';
/**
 * A CommandAcceptanceTest allows you to test commands included in you app or addon. It makes it
 * easy to setup a clean test directory with fixture files, run your command, and test either the
 * console output of your command or the state of the filesystem after the command finishes.
 *
 * @package test
 */
export default class CommandAcceptanceTest extends DenaliObject {
    /**
     * The command to invoke, i.e. 'build' would test the invocation of '$ denali build'
     */
    command: string;
    /**
     * The test directory generated to test this command. If it's not provided to the constructor,
     * Denali will create a tmp directory inside the 'tmp' directory in your project root.
     */
    dir: string;
    /**
     * The default NODE_ENV to invoke the command with. Defaults to development.
     */
    environment: string;
    /**
     * The root directory of the project under test.
     */
    protected projectRoot: string;
    /**
     * The package.json of the project under test.
     */
    protected projectPkg: any;
    /**
     * The path to the denali executable file that will be used when invoking the command
     */
    protected denaliPath: string;
    /**
     * When testing via the `.spawn()` method, this will be the spawned ChildProcess
     */
    protected spawnedCommand: ChildProcess;
    /**
     * The interval that checks the spawn output
     */
    protected pollOutput: NodeJS.Timer;
    /**
     * A fallback timer which will fail the test if the spawned process doesn't emit passing output in
     * a certain amount of time.
     */
    protected fallbackTimeout: NodeJS.Timer;
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
    constructor(command: string, options?: {
        dir?: string;
        environment?: string;
        name?: string;
        populateWithDummy?: boolean;
    });
    /**
     * Copy the dummy app into our test directory
     */
    populateWithDummy(): void;
    /**
     * Invoke the command and return promise that resolves with the output of the command. Useful for
     * commands that have a definitely completion (i.e. 'build', not 'serve')
     *
     * @param options.failOnStderr Should any output to stderr result in a rejected promise?
     */
    run(options?: {
        failOnStderr?: boolean;
        env?: any;
    }): Promise<{
        stdout: string;
        stderr: string;
        dir: string;
    }>;
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
    spawn(options: {
        checkOutput(stdout: string, stderr: string, dir: string): boolean;
        failOnStderr?: boolean;
        env?: any;
        pollInterval?: number;
        timeout?: number;
    }): Promise<void>;
    /**
     * Internal cleanup method to clean up timers and processes.
     */
    private cleanup();
}
