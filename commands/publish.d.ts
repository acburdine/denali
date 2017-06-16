import { Command } from 'denali-cli';
/**
 * Publish an addon to the npm registry.
 *
 * @package commands
 */
export default class PublishCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static runsInApp: boolean;
    static flags: {
        skipTests: {
            description: string;
            default: boolean;
            type: any;
        };
    };
    run(argv: any): Promise<void>;
    protected runTests(): Promise<void>;
    protected build(): Promise<void>;
    protected publish(): Promise<void>;
}
