import ORMAdapter from '../orm-adapter';
import Model from '../model';
import { RelationshipDescriptor } from '../descriptors';
/**
 * An in-memory ORM adapter for getting started quickly, testing, and debugging. Should **not** be
 * used for production data.
 *
 * @package data
 */
export default class MemoryAdapter extends ORMAdapter {
    /**
     * An in-memory cache of records. Top level objects are collections of records by type, indexed
     * by record id.
     */
    _cache: {
        [type: string]: {
            [id: number]: any;
        };
    };
    /**
     * Get the collection of records for a given type, indexed by record id. If the collection doesn't
     * exist yet, create it and return the empty collection.
     */
    _cacheFor(type: string): {
        [id: number]: any;
    };
    find(type: string, id: number | string): Promise<any>;
    findOne(type: string, query: any): Promise<any>;
    all(type: string): Promise<any[]>;
    query(type: string, query: any): Promise<any[]>;
    buildRecord(type: string, data: any): any;
    idFor(model: Model): any;
    setId(model: Model, value: number): void;
    getAttribute(model: Model, property: string): any;
    setAttribute(model: Model, property: string, value: any): true;
    deleteAttribute(model: Model, property: string): true;
    getRelated(model: Model, relationship: string, descriptor: RelationshipDescriptor, query: any): Promise<any | any[]>;
    setRelated(model: Model, relationship: string, descriptor: RelationshipDescriptor, relatedRecords: any | any[]): Promise<void>;
    addRelated(model: Model, relationship: string, descriptor: RelationshipDescriptor, relatedRecord: any): Promise<void>;
    removeRelated(model: Model, relationship: string, descriptor: RelationshipDescriptor, relatedRecord: any): Promise<void>;
    saveRecord(model: Model): Promise<void>;
    deleteRecord(model: Model): Promise<void>;
}
