import { Blueprint } from 'denali-cli';
/**
 * Generates a blank serializer
 *
 * @package blueprints
 */
export default class SerializerBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
    locals(argv: any): {
        name: any;
        className: string;
    };
}
