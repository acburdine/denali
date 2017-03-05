import { Blueprint } from 'denali-cli';
/**
 * Generate an new action class + tests.
 *
 * @package blueprints
 */
export default class ActionBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    static flags: {
        method: {
            description: string;
            default: string;
            type: any;
        };
    };
    static runsInApp: boolean;
    locals(argv: any): any;
    postInstall(argv: any): Promise<void>;
    postUninstall(argv: any): Promise<void>;
}
