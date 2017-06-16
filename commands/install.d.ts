import { Command } from 'denali-cli';
/**
 * Install an addon in your app.
 *
 * @package commands
 */
export default class InstallCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static runsInApp: boolean;
    static params: string;
    run(argv: any): Promise<void>;
    installAddon(addonName: string): Promise<void>;
    private fail(msg);
}
