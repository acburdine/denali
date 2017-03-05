import { Blueprint } from 'denali-cli';
/**
 * Generates a blank model
 *
 * @package blueprints
 */
export default class ModelBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    locals(argv: any): {
        name: any;
        className: string;
    };
}
