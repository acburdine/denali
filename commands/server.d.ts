/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { Command } from 'denali-cli';
/**
 * Runs the denali server for local or production use.
 *
 * @package commands
 */
export default class ServerCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static runsInApp: boolean;
    static flags: {
        environment: {
            description: string;
            default: any;
            type: any;
        };
        debug: {
            description: string;
            default: boolean;
            type: any;
        };
        watch: {
            description: string;
            type: any;
        };
        port: {
            description: string;
            default: any;
            type: any;
        };
        skipBuild: {
            description: string;
            default: boolean;
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
        output: {
            description: string;
            default: string;
            type: any;
        };
        production: {
            description: string;
            default: boolean;
            type: any;
        };
        printSlowTrees: {
            description: string;
            default: boolean;
            type: any;
        };
    };
    server: ChildProcess;
    run(argv: any): Promise<void>;
    protected cleanExit(): void;
    protected startServer(argv: any): void;
}
