import { Blueprint } from 'denali-cli';
/**
 * Generates a model, serializer, CRUD actions, and tests for a resource
 *
 * @package blueprints
 */
export default class ResourceBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    locals(argv: any): {
        name: any;
        humanizedName: string;
    };
}
