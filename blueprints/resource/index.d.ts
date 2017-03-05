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
        plural: {
            name: any;
            camelCased: string;
            className: string;
            dasherized: string;
            humanized: string;
        };
        singular: {
            name: any;
            camelCased: string;
            className: string;
            dasherized: string;
            humanized: string;
        };
    };
    postInstall(argv: any): Promise<void>;
    postUninstall(argv: any): Promise<void>;
}
