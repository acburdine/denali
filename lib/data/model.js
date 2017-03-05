"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const createDebug = require("debug");
const inflection_1 = require("inflection");
const lodash_1 = require("lodash");
const object_1 = require("../metal/object");
const debug = createDebug('denali:model');
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
class Model extends object_1.default {
    /**
     * Creates an instance of Model.
     */
    constructor(data = {}, options) {
        super();
        /**
         * The underlying ORM adapter record. An opaque value to Denali, handled entirely by the ORM
         * adapter.
         */
        this.record = null;
        this.record = this.adapter.buildRecord(this.type, data, options);
        // tslint:disable:completed-docs
        return new Proxy(this, {
            get(model, property) {
                if (typeof property === 'string') {
                    // Return the attribute value if that's what is requested
                    let descriptor = model.constructor[property];
                    if (descriptor && descriptor.isAttribute) {
                        return model.adapter.getAttribute(model, property);
                    }
                    // Forward relationship related methods to their generic counterparts
                    let relatedMethodParts = property.match(/^(get|set|add|remove)(\w+)/);
                    if (relatedMethodParts) {
                        let [, operation, relationshipName] = relatedMethodParts;
                        relationshipName = lodash_1.lowerFirst(relationshipName);
                        descriptor = model.constructor[relationshipName] || model.constructor[inflection_1.pluralize(relationshipName)];
                        if (descriptor && descriptor.isRelationship) {
                            return model[`${operation}Related`].bind(model, relationshipName);
                        }
                    }
                }
                // It's not an attribute or a relationship method, so let the model respond normally
                return model[property];
            },
            set(model, property, value) {
                // Set attribute values
                let descriptor = model.constructor[property];
                if (descriptor && descriptor.isAttribute) {
                    return model.adapter.setAttribute(model, property, value);
                }
                // Otherwise just set the model property directly
                model[property] = value;
                return true;
            },
            deleteProperty(model, property) {
                // Delete the attribute
                let descriptor = model.constructor[property];
                if (descriptor && descriptor.isAttribute) {
                    return model.adapter.deleteAttribute(model, property);
                }
                // Otherwise just delete the model property directly
                return delete model[property];
            }
        });
        // tslint:enable:completed-docs
    }
    /**
     * The type of the Model class. This string is used as the container name for the model, as well
     * as in several other areas of Denali (i.e. serializers, ORM adapters, etc). Conventionally,
     * types are dasherized versions of the model name (i.e. the BlogPost model's type would be
     * `"blog-post"`).
     *
     * @readonly
     */
    static get type() {
        let name = this.name;
        if (name.endsWith('Model')) {
            name = name.slice(0, -('Model').length);
        }
        return lodash_1.kebabCase(name);
    }
    /**
     * Alias for this.constructor.type
     *
     * @readonly
     */
    get type() {
        return this.constructor.type;
    }
    /**
     * Find a single record by it's id.
     */
    static find(id, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} find: ${id}`);
            assert(id != null, `You must pass an id to Model.find(id)`);
            let result = yield this.adapter.find(this.type, id, options);
            return new this(result);
        });
    }
    /**
     * Find all records of this type.
     */
    static all(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} all`);
            let result = yield this.adapter.all(this.type, options);
            return result.map((record) => {
                return new this(record);
            });
        });
    }
    /**
     * Query for records of this type that match the given criteria. The format of the criteria is
     * determined by the ORM adapter used for this model.
     */
    static query(query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} query: ${query}`);
            assert(query != null, `You must pass a query to Model.query(conditions)`);
            let result = yield this.adapter.query(this.type, query, options);
            return result.map((record) => {
                return new this(record);
            });
        });
    }
    /**
     * Find a single record that matches the given criteria. The format of the criteria is determined
     * by the ORM adapter used for this model.
     */
    static findOne(query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} findOne: ${query}`);
            assert(query != null, `You must pass a query to Model.findOne(conditions)`);
            let record = yield this.adapter.findOne(this.type, query, options);
            if (record) {
                return new this(record);
            }
            return null;
        });
    }
    /**
     * Create a new record and immediately persist it.
     */
    static create(data, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`creating ${this.type}`);
            let instance = new this({}, options);
            // We do this here, rather than in buildRecord, in case some of the data supplied isn't an
            // actual attribute (which means it will get set on the wrapper proxy this way).
            Object.assign(instance, data);
            return yield instance.save();
        });
    }
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    static get adapter() {
        let adapter = this.container.lookup(`orm-adapter:${this.type}`);
        assert(adapter, `No adapter found for ${this.type}! Available adapters: ${this.container.availableForType('orm-adapter')}`);
        return adapter;
    }
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    get adapter() {
        return this.constructor.adapter;
    }
    /**
     * The id of the record
     */
    get id() {
        return this.adapter.idFor(this);
    }
    set id(value) {
        this.adapter.setId(this, value);
    }
    /**
     * Persist this model.
     */
    save(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`saving ${this.type}`);
            yield this.adapter.saveRecord(this, options);
            return this;
        });
    }
    /**
     * Delete this model.
     */
    delete(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.adapter.deleteRecord(this, options);
        });
    }
    /**
     * Returns the related record(s) for the given relationship.
     */
    getRelated(relationshipName, query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName] || this.constructor[inflection_1.pluralize(relationshipName)];
            assert(descriptor && descriptor.isRelationship, `You tried to fetch related ${relationshipName}, but no such relationship exists on ${this.type}`);
            if (descriptor.mode === 'hasOne') {
                options = query;
                query = null;
            }
            let results = yield this.adapter.getRelated(this, relationshipName, descriptor, query, options);
            let RelatedModel = this.modelFor(descriptor.type);
            if (!Array.isArray(results)) {
                assert(descriptor.mode === 'hasOne', 'The ORM adapter returned an array for a hasOne relationship - it should return either the record or null');
                return results ? new RelatedModel(results) : null;
            }
            return results.map((record) => new RelatedModel(record));
        });
    }
    /**
     * Replaces the related records for the given relationship with the supplied related records.
     */
    setRelated(relationshipName, relatedModels, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName] || this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.setRelated(this, relationshipName, descriptor, relatedModels, options);
        });
    }
    /**
     * Add a related record to a hasMany relationship.
     */
    addRelated(relationshipName, relatedModel, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName] || this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.addRelated(this, relationshipName, descriptor, relatedModel, options);
        });
    }
    /**
     * Remove the given record from the hasMany relationship
     */
    removeRelated(relationshipName, relatedModel, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName] || this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.removeRelated(this, relationshipName, descriptor, relatedModel, options);
        });
    }
    /**
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute instance.
     */
    static eachAttribute(fn) {
        if (!this.hasOwnProperty('_attributesCache') || this._attributesCache == null) {
            this._attributesCache = [];
            for (let key in this) {
                if (this[key] && this[key].isAttribute) {
                    this._attributesCache.push(key);
                }
            }
        }
        return this._attributesCache.map((attributeName) => {
            return fn(attributeName, this[attributeName]);
        });
    }
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship instance.
     */
    static eachRelationship(fn) {
        if (!this.hasOwnProperty('_relationshipsCache') || this._relationshipsCache == null) {
            this._relationshipsCache = [];
            for (let key in this) {
                if (this[key] && this[key].isRelationship) {
                    this._relationshipsCache.push(key);
                }
            }
        }
        return this._relationshipsCache.map((relationshipName) => {
            return fn(relationshipName, this[relationshipName]);
        });
    }
    /**
     * Lookup a model class by type.
     */
    modelFor(type) {
        return this.container.lookup(`model:${type}`);
    }
    /**
     * Lookup a model class by type.
     */
    static modelFor(type) {
        return this.container.lookup(`model:${type}`);
    }
    /**
     * Lookup a service by type
     */
    service(type) {
        return this.container.lookup(`service:${type}`);
    }
    /**
     * Lookup a service by type
     */
    static service(type) {
        return this.container.lookup(`service:${type}`);
    }
    /**
     * Return an human-friendly string representing this Model instance, with a summary of it's
     * attributes
     */
    inspect() {
        let attributesSummary = this.constructor.eachAttribute((attr) => {
            return `${attr}=${JSON.stringify(this[attr])}`;
        });
        return `<${lodash_1.startCase(this.type)}:${this.id == null ? '-new-' : this.id} ${attributesSummary.join(', ')}>`;
    }
    /**
     * Return an human-friendly string representing this Model instance
     */
    toString() {
        return `<${lodash_1.startCase(this.type)}:${this.id == null ? '-new-' : this.id}>`;
    }
}
/**
 * An internal cache of all attributes defined on this model.
 */
Model._attributesCache = null;
/**
 * Marks the Model as an abstract base model, so ORM adapters can know not to create tables or
 * other supporting infrastructure.
 */
Model.abstract = false;
exports.default = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL2RhdGEvbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlDO0FBQ2pDLHFDQUFxQztBQUNyQywyQ0FBdUM7QUFDdkMsbUNBRzZCO0FBRTdCLDRDQUEyQztBQU0zQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxXQUEyQixTQUFRLGdCQUFZO0lBMEk3Qzs7T0FFRztJQUNILFlBQVksT0FBWSxFQUFFLEVBQUUsT0FBYTtRQUN2QyxLQUFLLEVBQUUsQ0FBQztRQVZWOzs7V0FHRztRQUNJLFdBQU0sR0FBUSxJQUFJLENBQUM7UUFPeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRSxnQ0FBZ0M7UUFDaEMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtZQUVyQixHQUFHLENBQUMsS0FBWSxFQUFFLFFBQWdCO2dCQUNoQyxFQUFFLENBQUMsQ0FBQyxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNqQyx5REFBeUQ7b0JBQ3pELElBQUksVUFBVSxHQUFTLEtBQUssQ0FBQyxXQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3BELEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDckQsQ0FBQztvQkFDRCxxRUFBcUU7b0JBQ3JFLElBQUksa0JBQWtCLEdBQUcsUUFB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Q2hGLENBQUM7O0FBaFZEOztHQUVHO0FBQ1ksc0JBQWdCLEdBQWEsSUFBSSxDQUFDO0FBdUZqRDs7O0dBR0c7QUFDVyxjQUFRLEdBQUcsS0FBSyxDQUFDO0FBbEdqQyx3QkFzVkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gJ2luZmxlY3Rpb24nO1xuaW1wb3J0IHtcbiAga2ViYWJDYXNlLFxuICBzdGFydENhc2UsXG4gIGxvd2VyRmlyc3QgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5pbXBvcnQgU2VydmljZSBmcm9tICcuLi9ydW50aW1lL3NlcnZpY2UnO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuLi9ydW50aW1lL2NvbnRhaW5lcic7XG5pbXBvcnQgeyBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yIH0gZnJvbSAnLi9kZXNjcmlwdG9ycyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTptb2RlbCcpO1xuXG4vKipcbiAqIFRoZSBNb2RlbCBjbGFzcyBpcyB0aGUgY29yZSBvZiBEZW5hbGkncyB1bmlxdWUgYXBwcm9hY2ggdG8gZGF0YSBhbmQgT1JNcy4gSXQgYWN0cyBhcyBhIHdyYXBwZXJcbiAqIGFuZCB0cmFuc2xhdGlvbiBsYXllciB0aGF0IHByb3ZpZGVzIGEgdW5pZmllZCBpbnRlcmZhY2UgdG8gYWNjZXNzIGFuZCBtYW5pcHVsYXRlIGRhdGEsIGJ1dFxuICogdHJhbnNsYXRlcyB0aG9zZSBpbnRlcmFjdGlvbnMgaW50byBPUk0gc3BlY2lmaWMgb3BlcmF0aW9ucyB2aWEgT1JNIGFkYXB0ZXJzLlxuICpcbiAqIE1vZGVscyBhcmUgYWJsZSB0byBtYWludGFpbiB0aGVpciByZWxhdGl2ZWx5IGNsZWFuIGludGVyZmFjZSB0aGFua3MgdG8gdGhlIHdheSB0aGUgY29uc3RydWN0b3JcbiAqIGFjdHVhbGx5IHJldHVybnMgYSBQcm94eSB3aGljaCB3cmFwcyB0aGUgTW9kZWwgaW5zdGFuY2UsIHJhdGhlciB0aGFuIHRoZSBNb2RlbCBpbnN0YW5jZSBkaXJlY3RseS5cbiAqIFRoaXMgbWVhbnMgeW91IGNhbiBkaXJlY3RseSBnZXQgYW5kIHNldCBwcm9wZXJ0aWVzIG9uIHlvdXIgcmVjb3JkcywgYW5kIHRoZSByZWNvcmQgKHdoaWNoIGlzIGFcbiAqIFByb3h5LXdyYXBwZWQgTW9kZWwpIHdpbGwgdHJhbnNsYXRlIGFuZCBmb3J3YXJkIHRob3NlIGNhbGxzIHRvIHRoZSB1bmRlcmx5aW5nIE9STSBhZGFwdGVyLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIFtrZXk6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogQW4gaW50ZXJuYWwgY2FjaGUgb2YgYWxsIGF0dHJpYnV0ZXMgZGVmaW5lZCBvbiB0aGlzIG1vZGVsLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX2F0dHJpYnV0ZXNDYWNoZTogc3RyaW5nW10gPSBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgdHlwZSBvZiB0aGUgTW9kZWwgY2xhc3MuIFRoaXMgc3RyaW5nIGlzIHVzZWQgYXMgdGhlIGNvbnRhaW5lciBuYW1lIGZvciB0aGUgbW9kZWwsIGFzIHdlbGxcbiAgICogYXMgaW4gc2V2ZXJhbCBvdGhlciBhcmVhcyBvZiBEZW5hbGkgKGkuZS4gc2VyaWFsaXplcnMsIE9STSBhZGFwdGVycywgZXRjKS4gQ29udmVudGlvbmFsbHksXG4gICAqIHR5cGVzIGFyZSBkYXNoZXJpemVkIHZlcnNpb25zIG9mIHRoZSBtb2RlbCBuYW1lIChpLmUuIHRoZSBCbG9nUG9zdCBtb2RlbCdzIHR5cGUgd291bGQgYmVcbiAgICogYFwiYmxvZy1wb3N0XCJgKS5cbiAgICpcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldCB0eXBlKCk6IHN0cmluZyB7XG4gICAgbGV0IG5hbWUgPSB0aGlzLm5hbWU7XG4gICAgaWYgKG5hbWUuZW5kc1dpdGgoJ01vZGVsJykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDAsIC0oJ01vZGVsJykubGVuZ3RoKTtcbiAgICB9XG4gICAgcmV0dXJuIGtlYmFiQ2FzZShuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgdGhpcy5jb25zdHJ1Y3Rvci50eXBlXG4gICAqXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgcHVibGljIGdldCB0eXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICg8dHlwZW9mIE1vZGVsPnRoaXMuY29uc3RydWN0b3IpLnR5cGU7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhIHNpbmdsZSByZWNvcmQgYnkgaXQncyBpZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYXN5bmMgZmluZChpZDogYW55LCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbD4ge1xuICAgIGRlYnVnKGAkeyB0aGlzLnR5cGUgfSBmaW5kOiAkeyBpZCB9YCk7XG4gICAgYXNzZXJ0KGlkICE9IG51bGwsIGBZb3UgbXVzdCBwYXNzIGFuIGlkIHRvIE1vZGVsLmZpbmQoaWQpYCk7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMuYWRhcHRlci5maW5kKHRoaXMudHlwZSwgaWQsIG9wdGlvbnMpO1xuICAgIHJldHVybiBuZXcgdGhpcyhyZXN1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgYWxsIHJlY29yZHMgb2YgdGhpcyB0eXBlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhc3luYyBhbGwob3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWxbXT4ge1xuICAgIGRlYnVnKGAkeyB0aGlzLnR5cGUgfSBhbGxgKTtcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgdGhpcy5hZGFwdGVyLmFsbCh0aGlzLnR5cGUsIG9wdGlvbnMpO1xuICAgIHJldHVybiByZXN1bHQubWFwKChyZWNvcmQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhyZWNvcmQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IGZvciByZWNvcmRzIG9mIHRoaXMgdHlwZSB0aGF0IG1hdGNoIHRoZSBnaXZlbiBjcml0ZXJpYS4gVGhlIGZvcm1hdCBvZiB0aGUgY3JpdGVyaWEgaXNcbiAgICogZGV0ZXJtaW5lZCBieSB0aGUgT1JNIGFkYXB0ZXIgdXNlZCBmb3IgdGhpcyBtb2RlbC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYXN5bmMgcXVlcnkocXVlcnk6IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWxbXT4ge1xuICAgIGRlYnVnKGAkeyB0aGlzLnR5cGUgfSBxdWVyeTogJHsgcXVlcnkgfWApO1xuICAgIGFzc2VydChxdWVyeSAhPSBudWxsLCBgWW91IG11c3QgcGFzcyBhIHF1ZXJ5IHRvIE1vZGVsLnF1ZXJ5KGNvbmRpdGlvbnMpYCk7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMuYWRhcHRlci5xdWVyeSh0aGlzLnR5cGUsIHF1ZXJ5LCBvcHRpb25zKTtcbiAgICByZXR1cm4gcmVzdWx0Lm1hcCgocmVjb3JkKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IHRoaXMocmVjb3JkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc2luZ2xlIHJlY29yZCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIGNyaXRlcmlhLiBUaGUgZm9ybWF0IG9mIHRoZSBjcml0ZXJpYSBpcyBkZXRlcm1pbmVkXG4gICAqIGJ5IHRoZSBPUk0gYWRhcHRlciB1c2VkIGZvciB0aGlzIG1vZGVsLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhc3luYyBmaW5kT25lKHF1ZXJ5OiBhbnksIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsPiB7XG4gICAgZGVidWcoYCR7IHRoaXMudHlwZSB9IGZpbmRPbmU6ICR7IHF1ZXJ5IH1gKTtcbiAgICBhc3NlcnQocXVlcnkgIT0gbnVsbCwgYFlvdSBtdXN0IHBhc3MgYSBxdWVyeSB0byBNb2RlbC5maW5kT25lKGNvbmRpdGlvbnMpYCk7XG4gICAgbGV0IHJlY29yZCA9IGF3YWl0IHRoaXMuYWRhcHRlci5maW5kT25lKHRoaXMudHlwZSwgcXVlcnksIG9wdGlvbnMpO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcyhyZWNvcmQpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgcmVjb3JkIGFuZCBpbW1lZGlhdGVseSBwZXJzaXN0IGl0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhc3luYyBjcmVhdGUoZGF0YTogYW55LCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbD4ge1xuICAgIGRlYnVnKGBjcmVhdGluZyAkeyB0aGlzLnR5cGUgfWApO1xuICAgIGxldCBpbnN0YW5jZSA9IG5ldyB0aGlzKHt9LCBvcHRpb25zKTtcbiAgICAvLyBXZSBkbyB0aGlzIGhlcmUsIHJhdGhlciB0aGFuIGluIGJ1aWxkUmVjb3JkLCBpbiBjYXNlIHNvbWUgb2YgdGhlIGRhdGEgc3VwcGxpZWQgaXNuJ3QgYW5cbiAgICAvLyBhY3R1YWwgYXR0cmlidXRlICh3aGljaCBtZWFucyBpdCB3aWxsIGdldCBzZXQgb24gdGhlIHdyYXBwZXIgcHJveHkgdGhpcyB3YXkpLlxuICAgIE9iamVjdC5hc3NpZ24oaW5zdGFuY2UsIGRhdGEpO1xuICAgIHJldHVybiBhd2FpdCBpbnN0YW5jZS5zYXZlKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIE1vZGVsIGFzIGFuIGFic3RyYWN0IGJhc2UgbW9kZWwsIHNvIE9STSBhZGFwdGVycyBjYW4ga25vdyBub3QgdG8gY3JlYXRlIHRhYmxlcyBvclxuICAgKiBvdGhlciBzdXBwb3J0aW5nIGluZnJhc3RydWN0dXJlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhYnN0cmFjdCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgT1JNIGFkYXB0ZXIgc3BlY2lmaWMgdG8gdGhpcyBtb2RlbCB0eXBlLiBEZWZhdWx0cyB0byB0aGUgYXBwbGljYXRpb24ncyBPUk0gYWRhcHRlciBpZiBub25lXG4gICAqIGZvciB0aGlzIHNwZWNpZmljIG1vZGVsIHR5cGUgaXMgZm91bmQuXG4gICAqXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgYWRhcHRlcigpOiBPUk1BZGFwdGVyIHtcbiAgICBsZXQgYWRhcHRlciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cChgb3JtLWFkYXB0ZXI6JHsgdGhpcy50eXBlIH1gKTtcbiAgICBhc3NlcnQoYWRhcHRlciwgYE5vIGFkYXB0ZXIgZm91bmQgZm9yICR7IHRoaXMudHlwZSB9ISBBdmFpbGFibGUgYWRhcHRlcnM6ICR7IHRoaXMuY29udGFpbmVyLmF2YWlsYWJsZUZvclR5cGUoJ29ybS1hZGFwdGVyJykgfWApO1xuICAgIHJldHVybiBhZGFwdGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBPUk0gYWRhcHRlciBzcGVjaWZpYyB0byB0aGlzIG1vZGVsIHR5cGUuIERlZmF1bHRzIHRvIHRoZSBhcHBsaWNhdGlvbidzIE9STSBhZGFwdGVyIGlmIG5vbmVcbiAgICogZm9yIHRoaXMgc3BlY2lmaWMgbW9kZWwgdHlwZSBpcyBmb3VuZC5cbiAgICpcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBwdWJsaWMgZ2V0IGFkYXB0ZXIoKTogT1JNQWRhcHRlciB7XG4gICAgcmV0dXJuICg8dHlwZW9mIE1vZGVsPnRoaXMuY29uc3RydWN0b3IpLmFkYXB0ZXI7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGlkIG9mIHRoZSByZWNvcmRcbiAgICovXG4gIHB1YmxpYyBnZXQgaWQoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmlkRm9yKHRoaXMpO1xuICB9XG4gIHB1YmxpYyBzZXQgaWQodmFsdWU6IGFueSkge1xuICAgIHRoaXMuYWRhcHRlci5zZXRJZCh0aGlzLCB2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHVuZGVybHlpbmcgT1JNIGFkYXB0ZXIgcmVjb3JkLiBBbiBvcGFxdWUgdmFsdWUgdG8gRGVuYWxpLCBoYW5kbGVkIGVudGlyZWx5IGJ5IHRoZSBPUk1cbiAgICogYWRhcHRlci5cbiAgICovXG4gIHB1YmxpYyByZWNvcmQ6IGFueSA9IG51bGw7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgTW9kZWwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkYXRhOiBhbnkgPSB7fSwgb3B0aW9ucz86IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5yZWNvcmQgPSB0aGlzLmFkYXB0ZXIuYnVpbGRSZWNvcmQodGhpcy50eXBlLCBkYXRhLCBvcHRpb25zKTtcblxuICAgIC8vIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzXG4gICAgcmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XG5cbiAgICAgIGdldChtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIFJldHVybiB0aGUgYXR0cmlidXRlIHZhbHVlIGlmIHRoYXQncyB3aGF0IGlzIHJlcXVlc3RlZFxuICAgICAgICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+bW9kZWwuY29uc3RydWN0b3IpW3Byb3BlcnR5XTtcbiAgICAgICAgICBpZiAoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmlzQXR0cmlidXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwuYWRhcHRlci5nZXRBdHRyaWJ1dGUobW9kZWwsIHByb3BlcnR5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gRm9yd2FyZCByZWxhdGlvbnNoaXAgcmVsYXRlZCBtZXRob2RzIHRvIHRoZWlyIGdlbmVyaWMgY291bnRlcnBhcnRzXG4gICAgICAgICAgbGV0IHJlbGF0ZWRNZXRob2RQYXJ0cyA9IHByb3BlcnR5Lm1hdGNoKC9eKGdldHxzZXR8YWRkfHJlbW92ZSkoXFx3KykvKTtcbiAgICAgICAgICBpZiAocmVsYXRlZE1ldGhvZFBhcnRzKSB7XG4gICAgICAgICAgICBsZXQgWyAsIG9wZXJhdGlvbiwgcmVsYXRpb25zaGlwTmFtZSBdID0gcmVsYXRlZE1ldGhvZFBhcnRzO1xuICAgICAgICAgICAgcmVsYXRpb25zaGlwTmFtZSA9IGxvd2VyRmlyc3QocmVsYXRpb25zaGlwTmFtZSk7XG4gICAgICAgICAgICBkZXNjcmlwdG9yID0gKDxhbnk+bW9kZWwuY29uc3RydWN0b3IpW3JlbGF0aW9uc2hpcE5hbWVdIHx8ICg8YW55Pm1vZGVsLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgICAgICAgICAgaWYgKGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5pc1JlbGF0aW9uc2hpcCkge1xuICAgICAgICAgICAgICByZXR1cm4gbW9kZWxbYCR7IG9wZXJhdGlvbiB9UmVsYXRlZGBdLmJpbmQobW9kZWwsIHJlbGF0aW9uc2hpcE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJdCdzIG5vdCBhbiBhdHRyaWJ1dGUgb3IgYSByZWxhdGlvbnNoaXAgbWV0aG9kLCBzbyBsZXQgdGhlIG1vZGVsIHJlc3BvbmQgbm9ybWFsbHlcbiAgICAgICAgcmV0dXJuIG1vZGVsW3Byb3BlcnR5XTtcbiAgICAgIH0sXG5cbiAgICAgIHNldChtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgLy8gU2V0IGF0dHJpYnV0ZSB2YWx1ZXNcbiAgICAgICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT5tb2RlbC5jb25zdHJ1Y3RvcilbcHJvcGVydHldO1xuICAgICAgICBpZiAoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmlzQXR0cmlidXRlKSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGVsLmFkYXB0ZXIuc2V0QXR0cmlidXRlKG1vZGVsLCBwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSBqdXN0IHNldCB0aGUgbW9kZWwgcHJvcGVydHkgZGlyZWN0bHlcbiAgICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcblxuICAgICAgZGVsZXRlUHJvcGVydHkobW9kZWw6IE1vZGVsLCBwcm9wZXJ0eTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIERlbGV0ZSB0aGUgYXR0cmlidXRlXG4gICAgICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+bW9kZWwuY29uc3RydWN0b3IpW3Byb3BlcnR5XTtcbiAgICAgICAgaWYgKGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5pc0F0dHJpYnV0ZSkge1xuICAgICAgICAgIHJldHVybiBtb2RlbC5hZGFwdGVyLmRlbGV0ZUF0dHJpYnV0ZShtb2RlbCwgcHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSBqdXN0IGRlbGV0ZSB0aGUgbW9kZWwgcHJvcGVydHkgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIGRlbGV0ZSBtb2RlbFtwcm9wZXJ0eV07XG4gICAgICB9XG5cbiAgICB9KTtcbiAgICAvLyB0c2xpbnQ6ZW5hYmxlOmNvbXBsZXRlZC1kb2NzXG4gIH1cblxuICAvKipcbiAgICogUGVyc2lzdCB0aGlzIG1vZGVsLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmUob3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWw+IHtcbiAgICBkZWJ1Zyhgc2F2aW5nICR7IHRoaXMudHlwZSB9YCk7XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLnNhdmVSZWNvcmQodGhpcywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIHRoaXMgbW9kZWwuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZGVsZXRlKG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuZGVsZXRlUmVjb3JkKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlbGF0ZWQgcmVjb3JkKHMpIGZvciB0aGUgZ2l2ZW4gcmVsYXRpb25zaGlwLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCBxdWVyeT86IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWx8TW9kZWxbXT4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcmVsYXRpb25zaGlwTmFtZV0gfHwgKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcGx1cmFsaXplKHJlbGF0aW9uc2hpcE5hbWUpXTtcbiAgICBhc3NlcnQoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmlzUmVsYXRpb25zaGlwLCBgWW91IHRyaWVkIHRvIGZldGNoIHJlbGF0ZWQgJHsgcmVsYXRpb25zaGlwTmFtZSB9LCBidXQgbm8gc3VjaCByZWxhdGlvbnNoaXAgZXhpc3RzIG9uICR7IHRoaXMudHlwZSB9YCk7XG4gICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc09uZScpIHtcbiAgICAgIG9wdGlvbnMgPSBxdWVyeTtcbiAgICAgIHF1ZXJ5ID0gbnVsbDtcbiAgICB9XG4gICAgbGV0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmFkYXB0ZXIuZ2V0UmVsYXRlZCh0aGlzLCByZWxhdGlvbnNoaXBOYW1lLCBkZXNjcmlwdG9yLCBxdWVyeSwgb3B0aW9ucyk7XG4gICAgbGV0IFJlbGF0ZWRNb2RlbCA9IHRoaXMubW9kZWxGb3IoZGVzY3JpcHRvci50eXBlKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdWx0cykpIHtcbiAgICAgIGFzc2VydChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNPbmUnLCAnVGhlIE9STSBhZGFwdGVyIHJldHVybmVkIGFuIGFycmF5IGZvciBhIGhhc09uZSByZWxhdGlvbnNoaXAgLSBpdCBzaG91bGQgcmV0dXJuIGVpdGhlciB0aGUgcmVjb3JkIG9yIG51bGwnKTtcbiAgICAgIHJldHVybiByZXN1bHRzID8gbmV3IFJlbGF0ZWRNb2RlbChyZXN1bHRzKSA6IG51bGw7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVjb3JkKSA9PiBuZXcgUmVsYXRlZE1vZGVsKHJlY29yZCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWxhdGVkIHJlY29yZHMgZm9yIHRoZSBnaXZlbiByZWxhdGlvbnNoaXAgd2l0aCB0aGUgc3VwcGxpZWQgcmVsYXRlZCByZWNvcmRzLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIHNldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCByZWxhdGVkTW9kZWxzOiBNb2RlbHxNb2RlbFtdLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtyZWxhdGlvbnNoaXBOYW1lXSB8fCAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5zZXRSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbHMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlbGF0ZWQgcmVjb3JkIHRvIGEgaGFzTWFueSByZWxhdGlvbnNoaXAuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgYWRkUmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmcsIHJlbGF0ZWRNb2RlbDogTW9kZWwsIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgZGVzY3JpcHRvciA9ICg8YW55PnRoaXMuY29uc3RydWN0b3IpW3JlbGF0aW9uc2hpcE5hbWVdIHx8ICg8YW55PnRoaXMuY29uc3RydWN0b3IpW3BsdXJhbGl6ZShyZWxhdGlvbnNoaXBOYW1lKV07XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLmFkZFJlbGF0ZWQodGhpcywgcmVsYXRpb25zaGlwTmFtZSwgZGVzY3JpcHRvciwgcmVsYXRlZE1vZGVsLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGhlIGdpdmVuIHJlY29yZCBmcm9tIHRoZSBoYXNNYW55IHJlbGF0aW9uc2hpcFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJlbW92ZVJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCByZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtyZWxhdGlvbnNoaXBOYW1lXSB8fCAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5yZW1vdmVSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB0aGUgc3VwcGxpZWQgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGVhY2ggYXR0cmlidXRlIG9uIHRoaXMgbW9kZWwsIHBhc3NpbmcgaW4gdGhlIGF0dHJpYnV0ZVxuICAgKiBuYW1lIGFuZCBhdHRyaWJ1dGUgaW5zdGFuY2UuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGVhY2hBdHRyaWJ1dGU8VD4oZm46IChhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IFQpOiBUW10ge1xuICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eSgnX2F0dHJpYnV0ZXNDYWNoZScpIHx8IHRoaXMuX2F0dHJpYnV0ZXNDYWNoZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9hdHRyaWJ1dGVzQ2FjaGUgPSBbXTtcbiAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzKSB7XG4gICAgICAgIGlmICgoPGFueT50aGlzKVtrZXldICYmICg8YW55PnRoaXMpW2tleV0uaXNBdHRyaWJ1dGUpIHtcbiAgICAgICAgICB0aGlzLl9hdHRyaWJ1dGVzQ2FjaGUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hdHRyaWJ1dGVzQ2FjaGUubWFwKChhdHRyaWJ1dGVOYW1lKSA9PiB7XG4gICAgICByZXR1cm4gZm4oYXR0cmlidXRlTmFtZSwgKDxhbnk+dGhpcylbYXR0cmlidXRlTmFtZV0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiByZWxhdGlvbnNoaXBzIGZvdW5kIG9uIHRoaXMgbW9kZWwsIHNvIHdlIGNhbiBhdm9pZCBpdGVyYXRpbmcgb3ZlciBhbGwgc3RhdGljXG4gICAqIHByb3BlcnRpZXMgZXZlcnkgdGltZS5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIF9yZWxhdGlvbnNoaXBzQ2FjaGU6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZWFjaCByZWxhdGlvbnNoaXAgb24gdGhpcyBtb2RlbCwgcGFzc2luZyBpbiB0aGVcbiAgICogcmVsYXRpb25zaGlwIG5hbWUgYW5kIHJlbGF0aW9uc2hpcCBpbnN0YW5jZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZWFjaFJlbGF0aW9uc2hpcDxUPihmbjogKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvcikgPT4gVCk6IFRbXSB7XG4gICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KCdfcmVsYXRpb25zaGlwc0NhY2hlJykgfHwgdGhpcy5fcmVsYXRpb25zaGlwc0NhY2hlID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbGF0aW9uc2hpcHNDYWNoZSA9IFtdO1xuICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcbiAgICAgICAgaWYgKCg8YW55PnRoaXMpW2tleV0gJiYgKDxhbnk+dGhpcylba2V5XS5pc1JlbGF0aW9uc2hpcCkge1xuICAgICAgICAgIHRoaXMuX3JlbGF0aW9uc2hpcHNDYWNoZS5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JlbGF0aW9uc2hpcHNDYWNoZS5tYXAoKHJlbGF0aW9uc2hpcE5hbWUpID0+IHtcbiAgICAgIHJldHVybiBmbihyZWxhdGlvbnNoaXBOYW1lLCAoPGFueT50aGlzKVtyZWxhdGlvbnNoaXBOYW1lXSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTG9va3VwIGEgbW9kZWwgY2xhc3MgYnkgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBtb2RlbEZvcih0eXBlOiBzdHJpbmcpOiB0eXBlb2YgTW9kZWwge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5sb29rdXAoYG1vZGVsOiR7IHR5cGUgfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2t1cCBhIG1vZGVsIGNsYXNzIGJ5IHR5cGUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG1vZGVsRm9yKHR5cGU6IHN0cmluZyk6IE1vZGVsIHtcbiAgICByZXR1cm4gdGhpcy5jb250YWluZXIubG9va3VwKGBtb2RlbDokeyB0eXBlIH1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYSBzZXJ2aWNlIGJ5IHR5cGVcbiAgICovXG4gIHB1YmxpYyBzZXJ2aWNlKHR5cGU6IHN0cmluZyk6IFNlcnZpY2Uge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5sb29rdXAoYHNlcnZpY2U6JHsgdHlwZSB9YCk7XG4gIH1cblxuICAvKipcbiAgICogTG9va3VwIGEgc2VydmljZSBieSB0eXBlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNlcnZpY2UodHlwZTogc3RyaW5nKTogU2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmxvb2t1cChgc2VydmljZTokeyB0eXBlIH1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gaHVtYW4tZnJpZW5kbHkgc3RyaW5nIHJlcHJlc2VudGluZyB0aGlzIE1vZGVsIGluc3RhbmNlLCB3aXRoIGEgc3VtbWFyeSBvZiBpdCdzXG4gICAqIGF0dHJpYnV0ZXNcbiAgICovXG4gIHB1YmxpYyBpbnNwZWN0KCk6IHN0cmluZyB7XG4gICAgbGV0IGF0dHJpYnV0ZXNTdW1tYXJ5OiBzdHJpbmdbXSA9ICg8dHlwZW9mIE1vZGVsPnRoaXMuY29uc3RydWN0b3IpLmVhY2hBdHRyaWJ1dGUoKGF0dHIpID0+IHtcbiAgICAgIHJldHVybiBgJHsgYXR0ciB9PSR7IEpTT04uc3RyaW5naWZ5KHRoaXNbYXR0cl0pIH1gO1xuICAgIH0pO1xuICAgIHJldHVybiBgPCR7IHN0YXJ0Q2FzZSh0aGlzLnR5cGUpIH06JHsgdGhpcy5pZCA9PSBudWxsID8gJy1uZXctJyA6IHRoaXMuaWQgfSAkeyBhdHRyaWJ1dGVzU3VtbWFyeS5qb2luKCcsICcpIH0+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gaHVtYW4tZnJpZW5kbHkgc3RyaW5nIHJlcHJlc2VudGluZyB0aGlzIE1vZGVsIGluc3RhbmNlXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYDwkeyBzdGFydENhc2UodGhpcy50eXBlKSB9OiR7IHRoaXMuaWQgPT0gbnVsbCA/ICctbmV3LScgOiB0aGlzLmlkIH0+YDtcbiAgfVxuXG59XG4iXX0=