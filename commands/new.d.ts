import { Command } from 'denali-cli';
/**
 * Create a new denali app
 *
 * @package commands
 */
export default class NewCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    static flags: {
        skipDeps: {
            description: string;
            defaultValue: boolean;
            type: any;
        };
        useNpm: {
            description: string;
            defaultValue: boolean;
            type: any;
        };
    };
    static runsInApp: boolean;
    run(argv: any): Promise<void>;
}
