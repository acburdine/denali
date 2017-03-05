import DenaliObject from '../metal/object';
import ORMAdapter from './orm-adapter';
import Service from '../runtime/service';
import { RelationshipDescriptor } from './descriptors';
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
     * An internal cache of all attributes defined on this model.
     */
    private static _attributesCache;
    /**
     * The type of the Model class. This string is used as the container name for the model, as well
     * as in several other areas of Denali (i.e. serializers, ORM adapters, etc). Conventionally,
     * types are dasherized versions of the model name (i.e. the BlogPost model's type would be
     * `"blog-post"`).
     *
     * @readonly
     */
    static readonly type: string;
    /**
     * Alias for this.constructor.type
     *
     * @readonly
     */
    readonly type: string;
    /**
     * Find a single record by it's id.
     */
    static find(id: any, options?: any): Promise<Model>;
    /**
     * Find all records of this type.
     */
    static all(options?: any): Promise<Model[]>;
    /**
     * Query for records of this type that match the given criteria. The format of the criteria is
     * determined by the ORM adapter used for this model.
     */
    static query(query: any, options?: any): Promise<Model[]>;
    /**
     * Find a single record that matches the given criteria. The format of the criteria is determined
     * by the ORM adapter used for this model.
     */
    static findOne(query: any, options?: any): Promise<Model>;
    /**
     * Create a new record and immediately persist it.
     */
    static create(data: any, options?: any): Promise<Model>;
    /**
     * Marks the Model as an abstract base model, so ORM adapters can know not to create tables or
     * other supporting infrastructure.
     */
    static abstract: boolean;
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    static readonly adapter: ORMAdapter;
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
    constructor(data?: any, options?: any);
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
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute instance.
     */
    static eachAttribute<T>(fn: (attributeName: string, value: any) => T): T[];
    /**
     * A list of relationships found on this model, so we can avoid iterating over all static
     * properties every time.
     */
    private static _relationshipsCache;
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship instance.
     */
    static eachRelationship<T>(fn: (relationshipName: string, descriptor: RelationshipDescriptor) => T): T[];
    /**
     * Lookup a model class by type.
     */
    modelFor(type: string): typeof Model;
    /**
     * Lookup a model class by type.
     */
    static modelFor(type: string): Model;
    /**
     * Lookup a service by type
     */
    service(type: string): Service;
    /**
     * Lookup a service by type
     */
    static service(type: string): Service;
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
