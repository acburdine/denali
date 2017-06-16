import { Blueprint } from 'denali-cli';
/**
 * Generates a database schema migration
 *
 * @package blueprints
 */
export default class MigrationBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    locals(argv: any): {
        name: any;
        filename: string;
    };
}
