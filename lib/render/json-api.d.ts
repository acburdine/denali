import Serializer from './serializer';
import Model from '../data/model';
import Action, { RenderOptions } from '../runtime/action';
import { RelationshipDescriptor } from '../data/descriptors';
import { RelationshipConfig } from './serializer';
/**
 * Ensures that the value is only set if it exists, so we avoid creating iterable keys on obj for
 * undefined values.
 */
export interface JsonApiDocument {
    data?: JsonApiResourceObject | JsonApiResourceObject[] | JsonApiResourceIdentifier | JsonApiResourceIdentifier[];
    errors?: JsonApiError[];
    meta?: JsonApiMeta;
    jsonapi?: {
        version: string;
    };
    links?: JsonApiLinks;
    included?: JsonApiResourceObject[];
}
export interface JsonApiError {
    /**
     * A unique identifier for this particular occurrence of the problem
     */
    id?: string;
    links?: {
        /**
         * A link that leads to further details about this particular occurrence of the problemA
         */
        about?: JsonApiLink;
    };
    /**
     * The HTTP status code applicable to this problem, expressed as a string value
     */
    status?: string;
    /**
     * An application-specific error code, expressed as a string value
     */
    code?: string;
    /**
     * A short, human-readable summary of the problem that SHOULD NOT change from occurrence to
     * occurrence of the problem, except for purposes of localization
     */
    title?: string;
    /**
     * A human-readable explanation specific to this occurrence of the problem. Like title, this
     * field’s value can be localized
     */
    detail?: string;
    /**
     * An object containing references to the source of the error
     */
    source?: {
        /**
         * A JSON Pointer [RFC6901] to the associated entity in the request document [e.g. "/data" for a
         * primary data object, or "/data/attributes/title" for a specific attribute]
         */
        pointer?: string;
        /**
         * A string indicating which URI query parameter caused the error
         */
        parameter?: string;
    };
    meta?: JsonApiMeta;
}
export interface JsonApiResourceObject {
    id: string;
    type: string;
    attributes?: JsonApiAttributes;
    relationships?: JsonApiRelationships;
    links?: JsonApiLinks;
    meta?: JsonApiMeta;
}
export interface JsonApiAttributes {
    [key: string]: any;
}
export interface JsonApiRelationships {
    [relationshipName: string]: JsonApiRelationship;
}
export interface JsonApiRelationship {
    /**
     * Links for this relationship. Should contain at least a "self" or "related" link.
     */
    links?: JsonApiLinks;
    data?: JsonApiRelationshipData;
    meta?: JsonApiMeta;
}
export declare type JsonApiRelationshipData = JsonApiResourceIdentifier | JsonApiResourceIdentifier[];
export interface JsonApiResourceIdentifier {
    id: string;
    type: string;
    meta?: JsonApiMeta;
}
export interface JsonApiMeta {
    [key: string]: any;
}
export interface JsonApiLinks {
    /**
     * A link for the resource or relationship itself. This link allows the client to directly
     * manipulate the resource or relationship. For example, removing an author through an article’s
     * relationship URL would disconnect the person from the article without deleting the people
     * resource itself. When fetched successfully, this link returns the linkage for the related
     * resources as its primary data
     */
    self?: JsonApiLink;
    /**
     * A “related resource link” provides access to resource objects linked in a relationship. When
     * fetched, the related resource object(s) are returned as the response’s primary data.
     */
    related?: JsonApiLink;
    [key: string]: JsonApiLink;
}
export declare type JsonApiLink = string | {
    href: string;
    meta: JsonApiMeta;
};
export interface Options {
    /**
     * An array of Models you want to ensure are included in the "included" sideload. Note that the
     * spec requires "full-linkage" - i.e. any Models you include here must be referenced by a
     * resource identifier elsewhere in the payload - to maintain full compliance.
     */
    included?: Model[];
    /**
     * Any top level metadata to send with the response.
     */
    meta?: JsonApiMeta;
    /**
     * Any top level links to send with the response.
     */
    links?: JsonApiLinks;
    /**
     * Configuration for each relationship.
     */
    relationships?: any;
    [key: string]: any;
}
/**
 * Used internally to simplify passing arguments required by all functions.
 */
export interface Context {
    action: Action;
    body: any;
    options: Options;
    document: JsonApiDocument;
}
/**
 * Renders the payload according to the JSONAPI 1.0 spec, including related resources, included
 * records, and support for meta and links.
 *
 * @package data
 */
export default abstract class JSONAPISerializer extends Serializer {
    /**
     * The default content type to use for any responses rendered by this serializer.
     */
    contentType: string;
    /**
     * Take a response body (a model, an array of models, or an Error) and render it as a JSONAPI
     * compliant document
     */
    serialize(action: Action, body: any, options: RenderOptions): Promise<JsonApiDocument>;
    /**
     * Render the primary payload for a JSONAPI document (either a model or array of models).
     */
    protected renderPrimary(context: Context): Promise<void>;
    /**
     * Render the primary data for the document, either a single Model or a single Error.
     */
    protected renderPrimaryObject(context: Context, payload: any): Promise<void>;
    /**
     * Render the primary data for the document, either an array of Models or Errors
     */
    protected renderPrimaryArray(context: Context, payload: any): Promise<void>;
    /**
     * Render any included records supplied by the options into the top level of the document
     */
    protected renderIncluded(context: Context): Promise<void>;
    /**
     * Render top level meta object for a document. Default uses meta supplied in options call to
     * res.render().
     */
    protected renderMeta(context: Context): void;
    /**
     * Render top level links object for a document. Defaults to the links supplied in options.
     */
    protected renderLinks(context: Context): void;
    /**
     * Render the version of JSONAPI supported.
     */
    protected renderVersion(context: Context): void;
    /**
     * Render the supplied record as a resource object.
     */
    protected renderRecord(context: Context, record: Model): Promise<JsonApiResourceObject>;
    /**
     * Returns the JSONAPI attributes object representing this record's relationships
     */
    protected attributesForRecord(context: Context, record: Model): JsonApiAttributes;
    /**
     * The JSONAPI spec recommends (but does not require) that property names be dasherized. The
     * default implementation of this serializer therefore does that, but you can override this method
     * to use a different approach.
     */
    protected serializeAttributeName(context: Context, name: string): string;
    /**
     * Take an attribute value and return the serialized value. Useful for changing how certain types
     * of values are serialized, i.e. Date objects.
     *
     * The default implementation returns the attribute's value unchanged.
     */
    protected serializeAttributeValue(context: Context, value: any, key: string, record: Model): any;
    /**
     * Returns the JSONAPI relationships object representing this record's relationships
     */
    protected relationshipsForRecord(context: Context, record: Model): Promise<JsonApiRelationships>;
    /**
     * Convert the relationship name to it's "over-the-wire" format. Defaults to dasherizing it.
     */
    protected serializeRelationshipName(context: Context, name: string): string;
    /**
     * Takes the serializer config and the model's descriptor for a relationship, and returns the
     * serialized relationship object. Also sideloads any full records if the relationship is so
     * configured.
     */
    protected serializeRelationship(context: Context, name: string, config: RelationshipConfig, descriptor: RelationshipDescriptor, record: Model): Promise<JsonApiRelationship>;
    /**
     * Returns the serialized form of the related Models for the given record and relationship.
     */
    protected dataForRelationship(context: Context, name: string, config: RelationshipConfig, descriptor: RelationshipDescriptor, record: Model): Promise<JsonApiRelationshipData>;
    /**
     * Given a related record, return the resource object for that record, and sideload the record as
     * well.
     */
    protected dataForRelatedRecord(context: Context, name: string, relatedRecord: Model, config: RelationshipConfig, descriptor: RelationshipDescriptor, record: Model): Promise<JsonApiResourceIdentifier>;
    /**
     * Takes a relationship descriptor and the record it's for, and returns any links for that
     * relationship for that record. I.e. '/books/1/author'
     */
    protected linksForRelationship(context: Context, name: string, config: RelationshipConfig, descriptor: RelationshipDescriptor, record: Model): JsonApiLinks;
    /**
     * Returns any meta for a given relationship and record. No meta included by default.
     */
    protected metaForRelationship(context: Context, name: string, config: RelationshipConfig, descriptor: RelationshipDescriptor, record: Model): JsonApiMeta | void;
    /**
     * Returns links for a particular record, i.e. self: "/books/1". Default implementation assumes
     * the URL for a particular record maps to that type's `show` action, i.e. `books/show`.
     */
    protected linksForRecord(context: Context, record: Model): JsonApiLinks;
    /**
     * Returns meta for a particular record.
     */
    protected metaForRecord(context: Context, record: Model): void | JsonApiMeta;
    /**
     * Sideloads a record into the top level "included" array
     */
    protected includeRecord(context: Context, name: string, relatedRecord: Model, config: RelationshipConfig, descriptor: RelationshipDescriptor): Promise<void>;
    /**
     * Render the supplied error
     */
    protected renderError(context: Context, error: any): JsonApiError;
    /**
     * Given an error, return a unique id for this particular occurence of the problem.
     */
    protected idForError(context: Context, error: any): string;
    /**
     * A short, human-readable summary of the problem that SHOULD NOT change from occurrence to
     * occurrence of the problem, except for purposes of localization.
     */
    protected titleForError(context: Context, error: any): string;
    /**
     * Given an error, return a JSON Pointer, a URL query param name, or other info indicating the
     * source of the error.
     */
    protected sourceForError(context: Context, error: any): string;
    /**
     * Return the meta for a given error object. You could use this for example, to return debug
     * information in development environments.
     */
    protected metaForError(context: Context, error: any): JsonApiMeta | void;
    /**
     * Return a links object for an error. You could use this to link to a bug tracker report of the
     * error, for example.
     */
    protected linksForError(context: Context, error: any): JsonApiLinks | void;
    /**
     * Remove duplicate entries from the sideloaded data.
     */
    protected dedupeIncluded(context: Context): void;
}
