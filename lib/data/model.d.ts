import DenaliObject from '../metal/object';
import Container from '../metal/container';
import ORMAdapter from './orm-adapter';
import { RelationshipDescriptor, AttributeDescriptor } from './descriptors';
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
    /**
     * Marks the Model as an abstract base model, so ORM adapters can know not to create tables or
     * other supporting infrastructure.
     */
    static abstract: boolean;
    /**
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute descriptor.
     */
    static mapAttributeDescriptors<T>(fn: (descriptor: AttributeDescriptor, name: string) => T): T[];
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship descriptor.
     */
    static mapRelationshipDescriptors<T>(fn: (descriptor: RelationshipDescriptor, name: string) => T): T[];
    /**
     * Get the type string for this model class. You must supply a container instance so we can lookup
     * the container name for this model class.
     */
    static getType(container: Container): string;
    [key: string]: any;
    /**
     * The underlying ORM adapter record. An opaque value to Denali, handled entirely by the ORM
     * adapter.
     */
    record: any;
    /**
     * Get the type of this model based on the container name for it
     */
    readonly type: string;
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     */
    readonly adapter: ORMAdapter;
    /**
     * The id of the record
     */
    id: any;
    /**
     * Tell the underlying ORM to build this record
     */
    init(data: any, options: any): void;
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
    getRelated(relationshipName: string, options?: any): Promise<Model | Model[]>;
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
