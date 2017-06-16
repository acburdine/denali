import { Command } from 'denali-cli';
/**
 * Display all defined routes within your application.
 *
 * @package commands
 */
export default class RoutesCommand extends Command {
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
        'print-slow-trees': {
            description: string;
            default: boolean;
            type: any;
        };
    };
    run(argv: any): Promise<void>;
}
