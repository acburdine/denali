import { Blueprint } from 'denali-cli';
/**
 * Creates a new app, initializes git and installs dependencies.
 *
 * @package blueprints
 */
export default class AppBlueprint extends Blueprint {
    static blueprintName: string;
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
    locals(argv: any): {
        name: any;
        className: string;
        humanizedName: string;
        denaliVersion: any;
    };
    postInstall(argv: any): Promise<void>;
}
