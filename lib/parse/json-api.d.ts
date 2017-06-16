import Parser from './parser';
import { ResponderParams } from '../runtime/action';
import Request from '../runtime/request';
import { JsonApiResourceObject, JsonApiAttributes, JsonApiRelationships } from '../render/json-api';
export default class JSONAPIParser extends Parser {
    /**
     * Unlike the other serializers, the default parse implementation does modify the incoming
     * payload. It converts the default dasherized attribute names into camelCase.
     *
     * The parse method here retains the JSONAPI document structure (i.e. data, included, links, meta,
     * etc), only modifying resource objects in place.
     */
    parse(request: Request): ResponderParams;
    /**
     * Parse a single resource object from a JSONAPI document. The resource object could come from the
     * top level `data` payload, or from the sideloaded `included` records.
     */
    protected parseResource(resource: JsonApiResourceObject): any;
    /**
     * Parse a resource object id
     */
    protected parseId(id: string): any;
    /**
     * Parse a resource object's type string
     */
    protected parseType(type: string): string;
    /**
     * Parse a resource object's attributes. By default, this converts from the JSONAPI recommended
     * dasheried keys to camelCase.
     */
    protected parseAttributes(attrs: JsonApiAttributes): any;
    /**
     * Parse a resource object's relationships. By default, this converts from the JSONAPI recommended
     * dasheried keys to camelCase.
     */
    protected parseRelationships(relationships: JsonApiRelationships): any;
}
