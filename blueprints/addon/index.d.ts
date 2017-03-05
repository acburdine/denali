import { Blueprint } from 'denali-cli';
/**
 * Creates a new addon project, initializes git and installs dependencies
 *
 * @package blueprints
 */
export default class AddonBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    static flags: {
        'skip-deps': {
            description: string;
            defaultValue: boolean;
            type: any;
        };
        'use-npm': {
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
