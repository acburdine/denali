import DenaliObject from '../metal/object';
import ORMAdapter from './orm-adapter';
import { RelationshipDescriptor, Attribute } from './descriptors';
import Container from '../metal/container';
/**
 * The Model class is the core of Denali's unique approach to data and ORMs. It acts as a wrapper
 * and translation layer that provides a unified interface to access and manipulate data, but
 * translates those interactions into ORM specific operations via ORM adapters.
 *
 * Models are able to maintain their relatively clean interface thanks to the way the constructor
 * actually returns a Proxy which wraps the Model instance, rather than the Model instance directly.
 * This means you can directly get and set properties on your records, and the record (which is a
 * Proxy-wrapped Model) will translate and forward those calls to the underlying ORM adapter.
 *
 * @package data
 */
export default class Model extends DenaliObject {
    [key: string]: any;
    /**
     * The type of the Model class. This string is used as the container name for the model, as well
     * as in several other areas of Denali (i.e. serializers, ORM adapters, etc). Conventionally,
     * types are dasherized versions of the model name (i.e. the BlogPost model's type would be
     * `"blog-post"`).
     */
    static readonly type: string;
    /**
     * Alias for this.constructor.type
     */
    readonly type: string;
    /**
     * Marks the Model as an abstract base model, so ORM adapters can know not to create tables or
     * other supporting infrastructure.
     */
    static abstract: boolean;
    /**
     * Find a single record by it's id.
     */
    static find(container: Container, id: any, options?: any): Promise<Model>;
    /**
     * Find all records of this type.
     */
    static all(container: Container, options?: any): Promise<Model[]>;
    /**
     * Query for records of this type that match the given criteria. The format of the criteria is
     * determined by the ORM adapter used for this model.
     */
    static query(container: Container, query: any, options?: any): Promise<Model[]>;
    /**
     * Find a single record that matches the given criteria. The format of the criteria is determined
     * by the ORM adapter used for this model.
     */
    static queryOne(container: Container, query: any, options?: any): Promise<Model>;
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    static getAdapter(container: Container): ORMAdapter;
    /**
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute instance.
     */
    static mapAttributes<T>(container: Container, fn: (descriptor: Attribute, attributeName: string) => T): T[];
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship instance.
     */
    static mapRelationships<T>(container: Container, fn: (descriptor: RelationshipDescriptor, relationshipName: string) => T): T[];
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    readonly adapter: ORMAdapter;
    /**
     * The id of the record
     */
    id: any;
    /**
     * The underlying ORM adapter record. An opaque value to Denali, handled entirely by the ORM
     * adapter.
     */
    record: any;
    /**
     * Creates an instance of Model.
     */
    constructor(container: Container, data?: any, options?: any);
    /**
     * Persist this model.
     */
    save(options?: any): Promise<Model>;
    /**
     * Delete this model.
     */
    delete(options?: any): Promise<void>;
    /**
     * Returns the related record(s) for the given relationship.
     */
    getRelated(relationshipName: string, query?: any, options?: any): Promise<Model | Model[]>;
    /**
     * Replaces the related records for the given relationship with the supplied related records.
     */
    setRelated(relationshipName: string, relatedModels: Model | Model[], options?: any): Promise<void>;
    /**
     * Add a related record to a hasMany relationship.
     */
    addRelated(relationshipName: string, relatedModel: Model, options?: any): Promise<void>;
    /**
     * Remove the given record from the hasMany relationship
     */
    removeRelated(relationshipName: string, relatedModel: Model, options?: any): Promise<void>;
    /**
     * Return an human-friendly string representing this Model instance, with a summary of it's
     * attributes
     */
    inspect(): string;
    /**
     * Return an human-friendly string representing this Model instance
     */
    toString(): string;
}
export declare function isAttribute(model: Model, property: string): boolean;
export declare function isRelationship(model: Model, property: string): boolean;
export declare function isModelProperty(model: Model, property: string): boolean;
