/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { Command, Project } from 'denali-cli';
/**
 * Run your app's test suite
 *
 * @package commands
 */
export default class TestCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static runsInApp: boolean;
    static params: string;
    static flags: {
        debug: {
            description: string;
            type: any;
        };
        watch: {
            description: string;
            default: boolean;
            type: any;
        };
        match: {
            description: string;
            type: any;
        };
        timeout: {
            description: string;
            type: any;
        };
        skipLint: {
            description: string;
            default: boolean;
            type: any;
        };
        skipAudit: {
            description: string;
            default: boolean;
            type: any;
        };
        verbose: {
            description: string;
            default: any;
            type: any;
        };
        output: {
            description: string;
            default: string;
            type: any;
        };
        printSlowTrees: {
            description: string;
            default: boolean;
            type: any;
        };
        failFast: {
            description: string;
            default: boolean;
            type: any;
        };
        litter: {
            description: string;
            default: boolean;
            type: any;
        };
        serial: {
            description: string;
            default: boolean;
            type: any;
        };
        concurrency: {
            description: string;
            default: number;
            type: any;
        };
    };
    tests: ChildProcess;
    run(argv: any): Promise<void>;
    protected cleanExit(): void;
    protected runTests(files: string[], project: Project, argv: any): void;
}
