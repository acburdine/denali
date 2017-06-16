import { Command } from 'denali-cli';
/**
 * Run migrations to update your database schema
 *
 * @package commands
 */
export default class MigrateCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static flags: {
        environment: {
            description: string;
            default: any;
            type: any;
        };
        rollback: {
            description: string;
            default: boolean;
            type: any;
        };
        redo: {
            description: string;
            default: boolean;
            type: any;
        };
    };
    static runsInApp: boolean;
    run(argv: any): Promise<void>;
}
