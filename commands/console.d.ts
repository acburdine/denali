import { Command } from 'denali-cli';
/**
 * Launch a REPL with your application loaded
 *
 * @package commands
 */
export default class ConsoleCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static flags: {
        environment: {
            description: string;
            default: any;
            type: any;
        };
        printSlowTrees: {
            description: string;
            default: boolean;
            type: any;
        };
    };
    static runsInApp: boolean;
    run(argv: any): Promise<void>;
}
