import { Blueprint } from 'denali-cli';
/**
 * Generates a blank ORM adapter with stubs for all the required methods
 *
 * @package blueprints
 */
export default class ORMAdapterBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    locals(argv: any): {
        name: any;
        className: string;
    };
}
