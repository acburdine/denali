/// <reference types="yargs" />
import { Command } from 'denali-cli';
import * as yargs from 'yargs';
/**
 * Remove scaffolded code from your app
 *
 * @package commands
 */
export default class DestroyCommand extends Command {
    static commandName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    static flags: {
        skipPostUninstall: {
            description: string;
            default: boolean;
            type: any;
        };
    };
    protected static configureSubcommands(commandName: string, yargs: any, projectPkg: any): yargs.Argv;
}
