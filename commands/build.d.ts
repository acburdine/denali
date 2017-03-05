import { Command } from 'denali-cli';
/**
 * Compile your app
 *
 * @package commands
 */
export default class BuildCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static flags: {
        environment: {
            description: string;
            default: any;
            type: any;
        };
        output: {
            description: string;
            default: string;
            type: any;
        };
        watch: {
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
        printSlowTrees: {
            description: string;
            default: boolean;
            type: any;
        };
    };
    runsInApp: boolean;
    run(argv: any): Promise<void>;
}
