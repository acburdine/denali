import { Blueprint } from 'denali-cli';
/**
 * Generates a blank service
 *
 * @package blueprints
 */
export default class ServiceBlueprint extends Blueprint {
    static blueprintName: string;
    static description: string;
    static longDescription: string;
    static params: string;
}
