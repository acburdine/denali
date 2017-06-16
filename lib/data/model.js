"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const createDebug = require("debug");
const inflection_1 = require("inflection");
const lodash_1 = require("lodash");
const object_1 = require("../metal/object");
const container_1 = require("../metal/container");
const debug = createDebug('denali:model');
/**
 * List of private properties on the Denali model class itself. Used for
 * determining which properties should or shouldn't be returned by the proxy.
 */
const privateProps = ['record'];
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
    constructor(container, data = {}, options) {
        super();
        /**
         * The underlying ORM adapter record. An opaque value to Denali, handled entirely by the ORM
         * adapter.
         */
        this.record = null;
        assert(container instanceof container_1.default, 'You must supply a container to new Model instances. If you are directly instantiating this Model instance, try using the db service instead');
        this.container = container;
        this.record = this.adapter.buildRecord(this.type, data, options);
        // tslint:disable:completed-docs
        return new Proxy(this, {
            get(model, property) {
                // If the property is not a string, defer to model instance
                if (typeof property !== 'string') {
                    return model[property];
                }
                if (isAttribute(model, property)) {
                    return model.adapter.getAttribute(model, property);
                }
                let relatedMethodParts = property.match(/^(get|set|add|remove)(\w+)/);
                if (relatedMethodParts) {
                    let [, operation, relationshipName] = relatedMethodParts;
                    relationshipName = lodash_1.lowerFirst(relationshipName);
                    if (isRelationship(model, relationshipName)) {
                        return model[`${operation}Related`].bind(model, relationshipName);
                    }
                }
                if (isModelProperty(model, property)) {
                    return model[property];
                }
                return model.adapter.getAttribute(model, property);
            },
            set(model, property, value) {
                if (isAttribute(model, property)) {
                    return model.adapter.setAttribute(model, property, value);
                }
                model[property] = value;
                return true;
            },
            deleteProperty(model, property) {
                if (isAttribute(model, property)) {
                    return model.adapter.deleteAttribute(model, property);
                }
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
     */
    get type() {
        return this.constructor.type;
    }
    /**
     * Find a single record by it's id.
     */
    static find(container, id, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} find: ${id}`);
            assert(id != null, `You must pass an id to Model.find(id)`);
            let adapter = this.getAdapter(container);
            let result = yield adapter.find(this.type, id, options);
            if (!result) {
                return null;
            }
            let Factory = container.factoryFor(`model:${this.type}`);
            return Factory.create(container, result);
        });
    }
    /**
     * Find all records of this type.
     */
    static all(container, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} all`);
            let adapter = this.getAdapter(container);
            let result = yield adapter.all(this.type, options);
            let Factory = container.factoryFor(`model:${this.type}`);
            return result.map((record) => {
                return Factory.create(container, record);
            });
        });
    }
    /**
     * Query for records of this type that match the given criteria. The format of the criteria is
     * determined by the ORM adapter used for this model.
     */
    static query(container, query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} query: ${query}`);
            assert(query != null, `You must pass a query to Model.query(conditions)`);
            let adapter = this.getAdapter(container);
            let result = yield adapter.query(this.type, query, options);
            let Factory = container.factoryFor(`model:${this.type}`);
            return result.map((record) => {
                return Factory.create(container, record);
            });
        });
    }
    /**
     * Find a single record that matches the given criteria. The format of the criteria is determined
     * by the ORM adapter used for this model.
     */
    static queryOne(container, query, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug(`${this.type} queryOne: ${query}`);
            assert(query != null, `You must pass a query to Model.queryOne(conditions)`);
            let adapter = this.getAdapter(container);
            let record = yield adapter.queryOne(this.type, query, options);
            if (record) {
                let Factory = container.factoryFor(`model:${this.type}`);
                return Factory.create(container, record);
            }
            return null;
        });
    }
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    static getAdapter(container) {
        assert(container instanceof container_1.default, `You must supply a container to lookup this model's adapter instead`);
        let adapter = container.lookup(`orm-adapter:${this.type}`, { loose: true });
        if (!adapter) {
            // Specific model adapter not found, try application adapter
            adapter = container.lookup('orm-adapter:application', { loose: true });
        }
        assert(adapter, `No orm-adapter found for "${this.type}", and no fallback "application" orm-adapter found either. Available adapters: ${container.availableForType('orm-adapter')}`);
        return adapter;
    }
    /**
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute instance.
     */
    static mapAttributes(container, fn) {
        let meta = container.metaFor(this);
        if (meta.attributesCache == null) {
            meta.attributesCache = [];
            let klass = this;
            for (let key in klass) {
                if (klass[key] && klass[key].isAttribute) {
                    meta.attributesCache.push(key);
                }
            }
        }
        return meta.attributesCache.map((attributeName) => {
            return fn(this[attributeName], attributeName);
        });
    }
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship instance.
     */
    static mapRelationships(container, fn) {
        let meta = container.metaFor(this);
        let klass = this;
        if (meta.relationshipsCache == null) {
            meta.relationshipsCache = [];
            for (let key in klass) {
                if (klass[key] && klass[key].isRelationship) {
                    meta.relationshipsCache.push(key);
                }
            }
        }
        return meta.relationshipsCache.map((relationshipName) => {
            return fn(this[relationshipName], relationshipName);
        });
    }
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     *
     * @readonly
     */
    get adapter() {
        return this.constructor.getAdapter(this.container);
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
            let descriptor = this.constructor[relationshipName];
            assert(descriptor && descriptor.isRelationship, `You tried to fetch related ${relationshipName}, but no such relationship exists on ${this.type}`);
            if (descriptor.mode === 'hasOne') {
                options = query;
                query = null;
            }
            let results = yield this.adapter.getRelated(this, relationshipName, descriptor, query, options);
            let RelatedModel = this.container.factoryFor(`model:${descriptor.type}`);
            if (!Array.isArray(results)) {
                assert(descriptor.mode === 'hasOne', 'The ORM adapter returned an array for a hasOne relationship - it should return either the record or null');
                return results ? RelatedModel.create(this.container, results) : null;
            }
            return results.map((record) => RelatedModel.create(this.container, record));
        });
    }
    /**
     * Replaces the related records for the given relationship with the supplied related records.
     */
    setRelated(relationshipName, relatedModels, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName];
            yield this.adapter.setRelated(this, relationshipName, descriptor, relatedModels, options);
        });
    }
    /**
     * Add a related record to a hasMany relationship.
     */
    addRelated(relationshipName, relatedModel, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.addRelated(this, relationshipName, descriptor, relatedModel, options);
        });
    }
    /**
     * Remove the given record from the hasMany relationship
     */
    removeRelated(relationshipName, relatedModel, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[inflection_1.pluralize(relationshipName)];
            yield this.adapter.removeRelated(this, relationshipName, descriptor, relatedModel, options);
        });
    }
    /**
     * Return an human-friendly string representing this Model instance, with a summary of it's
     * attributes
     */
    inspect() {
        let attributesSummary = this.constructor.mapAttributes(this.container, (value, attributeName) => {
            return `${attributeName}=${JSON.stringify(this[attributeName])}`;
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
 * Marks the Model as an abstract base model, so ORM adapters can know not to create tables or
 * other supporting infrastructure.
 */
Model.abstract = false;
exports.default = Model;
function isAttribute(model, property) {
    let descriptor = model.constructor[property];
    return descriptor && descriptor.isAttribute;
}
exports.isAttribute = isAttribute;
function isRelationship(model, property) {
    let descriptor = model.constructor[property] || model.constructor[inflection_1.pluralize(property)];
    return descriptor && descriptor.isRelationship;
}
exports.isRelationship = isRelationship;
function isModelProperty(model, property) {
    return model[property] !== undefined && !privateProps.includes(property);
}
exports.isModelProperty = isModelProperty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL2RhdGEvbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlDO0FBQ2pDLHFDQUFxQztBQUNyQywyQ0FBdUM7QUFDdkMsbUNBRzZCO0FBQzdCLDRDQUEyQztBQUczQyxrREFBMkM7QUFFM0MsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTFDOzs7R0FHRztBQUNILE1BQU0sWUFBWSxHQUFhLENBQUUsUUFBUSxDQUFFLENBQUM7QUFFNUM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxXQUEyQixTQUFRLGdCQUFZO0lBNks3Qzs7T0FFRztJQUNILFlBQVksU0FBb0IsRUFBRSxPQUFZLEVBQUUsRUFBRSxPQUFhO1FBQzdELEtBQUssRUFBRSxDQUFDO1FBVlY7OztXQUdHO1FBQ0gsV0FBTSxHQUFRLElBQUksQ0FBQztRQU9qQixNQUFNLENBQUMsU0FBUyxZQUFZLG1CQUFTLEVBQUUsNklBQTZJLENBQUMsQ0FBQztRQUN0TCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWpFLGdDQUFnQztRQUNoQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBRXJCLEdBQUcsQ0FBQyxLQUFZLEVBQUUsUUFBYTtnQkFDN0IsMkRBQTJEO2dCQUMzRCxFQUFFLENBQUMsQ0FBQyxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QixDQUFDO2dCQUVELEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO2dCQUVELElBQUksa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUN0RSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBRSxBQUFELEVBQUcsU0FBUyxFQUFFLGdCQUFnQixDQUFFLEdBQUcsa0JBQWtCLENBQUM7b0JBQzNELGdCQUFnQixHQUFHLG1CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDaEQsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFJLFNBQVUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUN0RSxDQUFDO2dCQUNILENBQUM7Z0JBRUQsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsR0FBRyxDQUFDLEtBQVksRUFBRSxRQUFnQixFQUFFLEtBQVU7Z0JBQzVDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUQsQ0FBQztnQkFDRCxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUVELGNBQWMsQ0FBQyxLQUFZLEVBQUUsUUFBZ0I7Z0JBQzNDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN4RCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxDQUFDO1NBRUYsQ0FBQyxDQUFDO1FBQ0gsK0JBQStCO0lBQ2pDLENBQUM7SUFoT0Q7Ozs7O09BS0c7SUFDSCxNQUFNLEtBQUssSUFBSTtRQUNiLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxJQUFJO1FBQ04sTUFBTSxDQUFnQixJQUFJLENBQUMsV0FBWSxDQUFDLElBQUksQ0FBQztJQUMvQyxDQUFDO0lBUUQ7O09BRUc7SUFDSCxNQUFNLENBQU8sSUFBSSxDQUFDLFNBQW9CLEVBQUUsRUFBTyxFQUFFLE9BQWE7O1lBQzVELEtBQUssQ0FBQyxHQUFJLElBQUksQ0FBQyxJQUFLLFVBQVcsRUFBRyxFQUFFLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO1lBQzVELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsSUFBSSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQVEsU0FBVSxJQUFJLENBQUMsSUFBSyxFQUFFLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0MsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQU8sR0FBRyxDQUFDLFNBQW9CLEVBQUUsT0FBYTs7WUFDbEQsS0FBSyxDQUFDLEdBQUksSUFBSSxDQUFDLElBQUssTUFBTSxDQUFDLENBQUM7WUFDNUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxJQUFJLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNuRCxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFRLFNBQVUsSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNO2dCQUN2QixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQU8sS0FBSyxDQUFDLFNBQW9CLEVBQUUsS0FBVSxFQUFFLE9BQWE7O1lBQ2hFLEtBQUssQ0FBQyxHQUFJLElBQUksQ0FBQyxJQUFLLFdBQVksS0FBTSxFQUFFLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRSxrREFBa0QsQ0FBQyxDQUFDO1lBQzFFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsSUFBSSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVELElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQVEsU0FBVSxJQUFJLENBQUMsSUFBSyxFQUFFLENBQUMsQ0FBQztZQUNsRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU07Z0JBQ3ZCLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBTyxRQUFRLENBQUMsU0FBb0IsRUFBRSxLQUFVLEVBQUUsT0FBYTs7WUFDbkUsS0FBSyxDQUFDLEdBQUksSUFBSSxDQUFDLElBQUssY0FBZSxLQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFLHFEQUFxRCxDQUFDLENBQUM7WUFDN0UsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxJQUFJLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDWCxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFRLFNBQVUsSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2xFLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFvQjtRQUNwQyxNQUFNLENBQUMsU0FBUyxZQUFZLG1CQUFTLEVBQUUsb0VBQW9FLENBQUMsQ0FBQztRQUM3RyxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWdCLElBQUksQ0FBQyxJQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNiLDREQUE0RDtZQUM1RCxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxFQUFFLDZCQUE4QixJQUFJLENBQUMsSUFBSyxrRkFBbUYsU0FBUyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBRSxFQUFFLENBQUMsQ0FBQztRQUN6TCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsYUFBYSxDQUFJLFNBQW9CLEVBQUUsRUFBdUQ7UUFDbkcsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDMUIsSUFBSSxLQUFLLEdBQVEsSUFBSSxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDekMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQXFCO1lBQ3BELE1BQU0sQ0FBQyxFQUFFLENBQU8sSUFBSyxDQUFDLGFBQWEsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBSSxTQUFvQixFQUFFLEVBQXVFO1FBQ3RILElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxLQUFLLEdBQVEsSUFBSSxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7WUFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUF3QjtZQUMxRCxNQUFNLENBQUMsRUFBRSxDQUFPLElBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxJQUFJLE9BQU87UUFDVCxNQUFNLENBQWdCLElBQUksQ0FBQyxXQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLEVBQUU7UUFDSixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELElBQUksRUFBRSxDQUFDLEtBQVU7UUFDZixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQWlFRDs7T0FFRztJQUNHLElBQUksQ0FBQyxPQUFhOztZQUN0QixLQUFLLENBQUMsVUFBVyxJQUFJLENBQUMsSUFBSyxFQUFFLENBQUMsQ0FBQztZQUMvQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDRyxNQUFNLENBQUMsT0FBYTs7WUFDeEIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDRyxVQUFVLENBQUMsZ0JBQXdCLEVBQUUsS0FBVyxFQUFFLE9BQWE7O1lBQ25FLElBQUksVUFBVSxHQUFTLElBQUksQ0FBQyxXQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxNQUFNLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxjQUFjLEVBQUUsOEJBQStCLGdCQUFpQix3Q0FBeUMsSUFBSSxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7WUFDdkosRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUNoQixLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2YsQ0FBQztZQUNELElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEcsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQVEsU0FBVSxVQUFVLENBQUMsSUFBSyxFQUFFLENBQUMsQ0FBQztZQUNsRixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsMEdBQTBHLENBQUMsQ0FBQztnQkFDakosTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3ZFLENBQUM7WUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5RSxDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNHLFVBQVUsQ0FBQyxnQkFBd0IsRUFBRSxhQUE0QixFQUFFLE9BQWE7O1lBQ3BGLElBQUksVUFBVSxHQUFTLElBQUksQ0FBQyxXQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVGLENBQUM7S0FBQTtJQUVEOztPQUVHO0lBQ0csVUFBVSxDQUFDLGdCQUF3QixFQUFFLFlBQW1CLEVBQUUsT0FBYTs7WUFDM0UsSUFBSSxVQUFVLEdBQVMsSUFBSSxDQUFDLFdBQVksQ0FBQyxzQkFBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNGLENBQUM7S0FBQTtJQUVEOztPQUVHO0lBQ0csYUFBYSxDQUFDLGdCQUF3QixFQUFFLFlBQW1CLEVBQUUsT0FBYTs7WUFDOUUsSUFBSSxVQUFVLEdBQVMsSUFBSSxDQUFDLFdBQVksQ0FBQyxzQkFBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlGLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNILE9BQU87UUFDTCxJQUFJLGlCQUFpQixHQUE0QixJQUFJLENBQUMsV0FBWSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLGFBQWE7WUFDcEgsTUFBTSxDQUFDLEdBQUksYUFBYyxJQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFFLEVBQUUsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFLLGtCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxJQUFLLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRyxJQUFLLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFDO0lBQ2xILENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixNQUFNLENBQUMsSUFBSyxrQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUcsR0FBRyxDQUFDO0lBQ2hGLENBQUM7O0FBeFJEOzs7R0FHRztBQUNJLGNBQVEsR0FBRyxLQUFLLENBQUM7QUE3QjFCLHdCQW1UQztBQUVELHFCQUE0QixLQUFZLEVBQUUsUUFBZ0I7SUFDeEQsSUFBSSxVQUFVLEdBQVMsS0FBSyxDQUFDLFdBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUM7QUFDOUMsQ0FBQztBQUhELGtDQUdDO0FBRUQsd0JBQStCLEtBQVksRUFBRSxRQUFnQjtJQUMzRCxJQUFJLFVBQVUsR0FBUyxLQUFLLENBQUMsV0FBWSxDQUFDLFFBQVEsQ0FBQyxJQUFVLEtBQUssQ0FBQyxXQUFZLENBQUMsc0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3JHLE1BQU0sQ0FBQyxVQUFVLElBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQztBQUNqRCxDQUFDO0FBSEQsd0NBR0M7QUFFRCx5QkFBZ0MsS0FBWSxFQUFFLFFBQWdCO0lBQzVELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRkQsMENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB7IHBsdXJhbGl6ZSB9IGZyb20gJ2luZmxlY3Rpb24nO1xuaW1wb3J0IHtcbiAga2ViYWJDYXNlLFxuICBzdGFydENhc2UsXG4gIGxvd2VyRmlyc3QgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5pbXBvcnQgeyBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCBBdHRyaWJ1dGUgfSBmcm9tICcuL2Rlc2NyaXB0b3JzJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi4vbWV0YWwvY29udGFpbmVyJztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGVuYWxpOm1vZGVsJyk7XG5cbi8qKlxuICogTGlzdCBvZiBwcml2YXRlIHByb3BlcnRpZXMgb24gdGhlIERlbmFsaSBtb2RlbCBjbGFzcyBpdHNlbGYuIFVzZWQgZm9yXG4gKiBkZXRlcm1pbmluZyB3aGljaCBwcm9wZXJ0aWVzIHNob3VsZCBvciBzaG91bGRuJ3QgYmUgcmV0dXJuZWQgYnkgdGhlIHByb3h5LlxuICovXG5jb25zdCBwcml2YXRlUHJvcHM6IFN0cmluZ1tdID0gWyAncmVjb3JkJyBdO1xuXG4vKipcbiAqIFRoZSBNb2RlbCBjbGFzcyBpcyB0aGUgY29yZSBvZiBEZW5hbGkncyB1bmlxdWUgYXBwcm9hY2ggdG8gZGF0YSBhbmQgT1JNcy4gSXQgYWN0cyBhcyBhIHdyYXBwZXJcbiAqIGFuZCB0cmFuc2xhdGlvbiBsYXllciB0aGF0IHByb3ZpZGVzIGEgdW5pZmllZCBpbnRlcmZhY2UgdG8gYWNjZXNzIGFuZCBtYW5pcHVsYXRlIGRhdGEsIGJ1dFxuICogdHJhbnNsYXRlcyB0aG9zZSBpbnRlcmFjdGlvbnMgaW50byBPUk0gc3BlY2lmaWMgb3BlcmF0aW9ucyB2aWEgT1JNIGFkYXB0ZXJzLlxuICpcbiAqIE1vZGVscyBhcmUgYWJsZSB0byBtYWludGFpbiB0aGVpciByZWxhdGl2ZWx5IGNsZWFuIGludGVyZmFjZSB0aGFua3MgdG8gdGhlIHdheSB0aGUgY29uc3RydWN0b3JcbiAqIGFjdHVhbGx5IHJldHVybnMgYSBQcm94eSB3aGljaCB3cmFwcyB0aGUgTW9kZWwgaW5zdGFuY2UsIHJhdGhlciB0aGFuIHRoZSBNb2RlbCBpbnN0YW5jZSBkaXJlY3RseS5cbiAqIFRoaXMgbWVhbnMgeW91IGNhbiBkaXJlY3RseSBnZXQgYW5kIHNldCBwcm9wZXJ0aWVzIG9uIHlvdXIgcmVjb3JkcywgYW5kIHRoZSByZWNvcmQgKHdoaWNoIGlzIGFcbiAqIFByb3h5LXdyYXBwZWQgTW9kZWwpIHdpbGwgdHJhbnNsYXRlIGFuZCBmb3J3YXJkIHRob3NlIGNhbGxzIHRvIHRoZSB1bmRlcmx5aW5nIE9STSBhZGFwdGVyLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIFtrZXk6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogVGhlIHR5cGUgb2YgdGhlIE1vZGVsIGNsYXNzLiBUaGlzIHN0cmluZyBpcyB1c2VkIGFzIHRoZSBjb250YWluZXIgbmFtZSBmb3IgdGhlIG1vZGVsLCBhcyB3ZWxsXG4gICAqIGFzIGluIHNldmVyYWwgb3RoZXIgYXJlYXMgb2YgRGVuYWxpIChpLmUuIHNlcmlhbGl6ZXJzLCBPUk0gYWRhcHRlcnMsIGV0YykuIENvbnZlbnRpb25hbGx5LFxuICAgKiB0eXBlcyBhcmUgZGFzaGVyaXplZCB2ZXJzaW9ucyBvZiB0aGUgbW9kZWwgbmFtZSAoaS5lLiB0aGUgQmxvZ1Bvc3QgbW9kZWwncyB0eXBlIHdvdWxkIGJlXG4gICAqIGBcImJsb2ctcG9zdFwiYCkuXG4gICAqL1xuICBzdGF0aWMgZ2V0IHR5cGUoKTogc3RyaW5nIHtcbiAgICBsZXQgbmFtZSA9IHRoaXMubmFtZTtcbiAgICBpZiAobmFtZS5lbmRzV2l0aCgnTW9kZWwnKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMCwgLSgnTW9kZWwnKS5sZW5ndGgpO1xuICAgIH1cbiAgICByZXR1cm4ga2ViYWJDYXNlKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGZvciB0aGlzLmNvbnN0cnVjdG9yLnR5cGVcbiAgICovXG4gIGdldCB0eXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICg8dHlwZW9mIE1vZGVsPnRoaXMuY29uc3RydWN0b3IpLnR5cGU7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIE1vZGVsIGFzIGFuIGFic3RyYWN0IGJhc2UgbW9kZWwsIHNvIE9STSBhZGFwdGVycyBjYW4ga25vdyBub3QgdG8gY3JlYXRlIHRhYmxlcyBvclxuICAgKiBvdGhlciBzdXBwb3J0aW5nIGluZnJhc3RydWN0dXJlLlxuICAgKi9cbiAgc3RhdGljIGFic3RyYWN0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEZpbmQgYSBzaW5nbGUgcmVjb3JkIGJ5IGl0J3MgaWQuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgZmluZChjb250YWluZXI6IENvbnRhaW5lciwgaWQ6IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWw+IHtcbiAgICBkZWJ1ZyhgJHsgdGhpcy50eXBlIH0gZmluZDogJHsgaWQgfWApO1xuICAgIGFzc2VydChpZCAhPSBudWxsLCBgWW91IG11c3QgcGFzcyBhbiBpZCB0byBNb2RlbC5maW5kKGlkKWApO1xuICAgIGxldCBhZGFwdGVyID0gdGhpcy5nZXRBZGFwdGVyKGNvbnRhaW5lcik7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuZmluZCh0aGlzLnR5cGUsIGlkLCBvcHRpb25zKTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBGYWN0b3J5ID0gY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KGBtb2RlbDokeyB0aGlzLnR5cGUgfWApO1xuICAgIHJldHVybiBGYWN0b3J5LmNyZWF0ZShjb250YWluZXIsIHJlc3VsdCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhbGwgcmVjb3JkcyBvZiB0aGlzIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgYWxsKGNvbnRhaW5lcjogQ29udGFpbmVyLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbFtdPiB7XG4gICAgZGVidWcoYCR7IHRoaXMudHlwZSB9IGFsbGApO1xuICAgIGxldCBhZGFwdGVyID0gdGhpcy5nZXRBZGFwdGVyKGNvbnRhaW5lcik7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIuYWxsKHRoaXMudHlwZSwgb3B0aW9ucyk7XG4gICAgbGV0IEZhY3RvcnkgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oYG1vZGVsOiR7IHRoaXMudHlwZSB9YCk7XG4gICAgcmV0dXJuIHJlc3VsdC5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgcmV0dXJuIEZhY3RvcnkuY3JlYXRlKGNvbnRhaW5lciwgcmVjb3JkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWVyeSBmb3IgcmVjb3JkcyBvZiB0aGlzIHR5cGUgdGhhdCBtYXRjaCB0aGUgZ2l2ZW4gY3JpdGVyaWEuIFRoZSBmb3JtYXQgb2YgdGhlIGNyaXRlcmlhIGlzXG4gICAqIGRldGVybWluZWQgYnkgdGhlIE9STSBhZGFwdGVyIHVzZWQgZm9yIHRoaXMgbW9kZWwuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgcXVlcnkoY29udGFpbmVyOiBDb250YWluZXIsIHF1ZXJ5OiBhbnksIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsW10+IHtcbiAgICBkZWJ1ZyhgJHsgdGhpcy50eXBlIH0gcXVlcnk6ICR7IHF1ZXJ5IH1gKTtcbiAgICBhc3NlcnQocXVlcnkgIT0gbnVsbCwgYFlvdSBtdXN0IHBhc3MgYSBxdWVyeSB0byBNb2RlbC5xdWVyeShjb25kaXRpb25zKWApO1xuICAgIGxldCBhZGFwdGVyID0gdGhpcy5nZXRBZGFwdGVyKGNvbnRhaW5lcik7XG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGFkYXB0ZXIucXVlcnkodGhpcy50eXBlLCBxdWVyeSwgb3B0aW9ucyk7XG4gICAgbGV0IEZhY3RvcnkgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oYG1vZGVsOiR7IHRoaXMudHlwZSB9YCk7XG4gICAgcmV0dXJuIHJlc3VsdC5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgcmV0dXJuIEZhY3RvcnkuY3JlYXRlKGNvbnRhaW5lciwgcmVjb3JkKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc2luZ2xlIHJlY29yZCB0aGF0IG1hdGNoZXMgdGhlIGdpdmVuIGNyaXRlcmlhLiBUaGUgZm9ybWF0IG9mIHRoZSBjcml0ZXJpYSBpcyBkZXRlcm1pbmVkXG4gICAqIGJ5IHRoZSBPUk0gYWRhcHRlciB1c2VkIGZvciB0aGlzIG1vZGVsLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIHF1ZXJ5T25lKGNvbnRhaW5lcjogQ29udGFpbmVyLCBxdWVyeTogYW55LCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbD4ge1xuICAgIGRlYnVnKGAkeyB0aGlzLnR5cGUgfSBxdWVyeU9uZTogJHsgcXVlcnkgfWApO1xuICAgIGFzc2VydChxdWVyeSAhPSBudWxsLCBgWW91IG11c3QgcGFzcyBhIHF1ZXJ5IHRvIE1vZGVsLnF1ZXJ5T25lKGNvbmRpdGlvbnMpYCk7XG4gICAgbGV0IGFkYXB0ZXIgPSB0aGlzLmdldEFkYXB0ZXIoY29udGFpbmVyKTtcbiAgICBsZXQgcmVjb3JkID0gYXdhaXQgYWRhcHRlci5xdWVyeU9uZSh0aGlzLnR5cGUsIHF1ZXJ5LCBvcHRpb25zKTtcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICBsZXQgRmFjdG9yeSA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPihgbW9kZWw6JHsgdGhpcy50eXBlIH1gKTtcbiAgICAgIHJldHVybiBGYWN0b3J5LmNyZWF0ZShjb250YWluZXIsIHJlY29yZCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBPUk0gYWRhcHRlciBzcGVjaWZpYyB0byB0aGlzIG1vZGVsIHR5cGUuIERlZmF1bHRzIHRvIHRoZSBhcHBsaWNhdGlvbidzIE9STSBhZGFwdGVyIGlmIG5vbmVcbiAgICogZm9yIHRoaXMgc3BlY2lmaWMgbW9kZWwgdHlwZSBpcyBmb3VuZC5cbiAgICpcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBzdGF0aWMgZ2V0QWRhcHRlcihjb250YWluZXI6IENvbnRhaW5lcik6IE9STUFkYXB0ZXIge1xuICAgIGFzc2VydChjb250YWluZXIgaW5zdGFuY2VvZiBDb250YWluZXIsIGBZb3UgbXVzdCBzdXBwbHkgYSBjb250YWluZXIgdG8gbG9va3VwIHRoaXMgbW9kZWwncyBhZGFwdGVyIGluc3RlYWRgKTtcbiAgICBsZXQgYWRhcHRlciA9IGNvbnRhaW5lci5sb29rdXAoYG9ybS1hZGFwdGVyOiR7IHRoaXMudHlwZSB9YCwgeyBsb29zZTogdHJ1ZSB9KTtcbiAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgIC8vIFNwZWNpZmljIG1vZGVsIGFkYXB0ZXIgbm90IGZvdW5kLCB0cnkgYXBwbGljYXRpb24gYWRhcHRlclxuICAgICAgYWRhcHRlciA9IGNvbnRhaW5lci5sb29rdXAoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgeyBsb29zZTogdHJ1ZSB9KTtcbiAgICB9XG4gICAgYXNzZXJ0KGFkYXB0ZXIsIGBObyBvcm0tYWRhcHRlciBmb3VuZCBmb3IgXCIkeyB0aGlzLnR5cGUgfVwiLCBhbmQgbm8gZmFsbGJhY2sgXCJhcHBsaWNhdGlvblwiIG9ybS1hZGFwdGVyIGZvdW5kIGVpdGhlci4gQXZhaWxhYmxlIGFkYXB0ZXJzOiAkeyBjb250YWluZXIuYXZhaWxhYmxlRm9yVHlwZSgnb3JtLWFkYXB0ZXInKSB9YCk7XG4gICAgcmV0dXJuIGFkYXB0ZXI7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCB0aGUgc3VwcGxpZWQgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGVhY2ggYXR0cmlidXRlIG9uIHRoaXMgbW9kZWwsIHBhc3NpbmcgaW4gdGhlIGF0dHJpYnV0ZVxuICAgKiBuYW1lIGFuZCBhdHRyaWJ1dGUgaW5zdGFuY2UuXG4gICAqL1xuICBzdGF0aWMgbWFwQXR0cmlidXRlczxUPihjb250YWluZXI6IENvbnRhaW5lciwgZm46IChkZXNjcmlwdG9yOiBBdHRyaWJ1dGUsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4gVCk6IFRbXSB7XG4gICAgbGV0IG1ldGEgPSBjb250YWluZXIubWV0YUZvcih0aGlzKTtcbiAgICBpZiAobWV0YS5hdHRyaWJ1dGVzQ2FjaGUgPT0gbnVsbCkge1xuICAgICAgbWV0YS5hdHRyaWJ1dGVzQ2FjaGUgPSBbXTtcbiAgICAgIGxldCBrbGFzcyA9IDxhbnk+dGhpcztcbiAgICAgIGZvciAobGV0IGtleSBpbiBrbGFzcykge1xuICAgICAgICBpZiAoa2xhc3Nba2V5XSAmJiBrbGFzc1trZXldLmlzQXR0cmlidXRlKSB7XG4gICAgICAgICAgbWV0YS5hdHRyaWJ1dGVzQ2FjaGUucHVzaChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXRhLmF0dHJpYnV0ZXNDYWNoZS5tYXAoKGF0dHJpYnV0ZU5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIGZuKCg8YW55PnRoaXMpW2F0dHJpYnV0ZU5hbWVdLCBhdHRyaWJ1dGVOYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZWFjaCByZWxhdGlvbnNoaXAgb24gdGhpcyBtb2RlbCwgcGFzc2luZyBpbiB0aGVcbiAgICogcmVsYXRpb25zaGlwIG5hbWUgYW5kIHJlbGF0aW9uc2hpcCBpbnN0YW5jZS5cbiAgICovXG4gIHN0YXRpYyBtYXBSZWxhdGlvbnNoaXBzPFQ+KGNvbnRhaW5lcjogQ29udGFpbmVyLCBmbjogKGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZykgPT4gVCk6IFRbXSB7XG4gICAgbGV0IG1ldGEgPSBjb250YWluZXIubWV0YUZvcih0aGlzKTtcbiAgICBsZXQga2xhc3MgPSA8YW55PnRoaXM7XG4gICAgaWYgKG1ldGEucmVsYXRpb25zaGlwc0NhY2hlID09IG51bGwpIHtcbiAgICAgIG1ldGEucmVsYXRpb25zaGlwc0NhY2hlID0gW107XG4gICAgICBmb3IgKGxldCBrZXkgaW4ga2xhc3MpIHtcbiAgICAgICAgaWYgKGtsYXNzW2tleV0gJiYga2xhc3Nba2V5XS5pc1JlbGF0aW9uc2hpcCkge1xuICAgICAgICAgIG1ldGEucmVsYXRpb25zaGlwc0NhY2hlLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWV0YS5yZWxhdGlvbnNoaXBzQ2FjaGUubWFwKChyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiBmbigoPGFueT50aGlzKVtyZWxhdGlvbnNoaXBOYW1lXSwgcmVsYXRpb25zaGlwTmFtZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIE9STSBhZGFwdGVyIHNwZWNpZmljIHRvIHRoaXMgbW9kZWwgdHlwZS4gRGVmYXVsdHMgdG8gdGhlIGFwcGxpY2F0aW9uJ3MgT1JNIGFkYXB0ZXIgaWYgbm9uZVxuICAgKiBmb3IgdGhpcyBzcGVjaWZpYyBtb2RlbCB0eXBlIGlzIGZvdW5kLlxuICAgKlxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBhZGFwdGVyKCk6IE9STUFkYXB0ZXIge1xuICAgIHJldHVybiAoPHR5cGVvZiBNb2RlbD50aGlzLmNvbnN0cnVjdG9yKS5nZXRBZGFwdGVyKHRoaXMuY29udGFpbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaWQgb2YgdGhlIHJlY29yZFxuICAgKi9cbiAgZ2V0IGlkKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5pZEZvcih0aGlzKTtcbiAgfVxuICBzZXQgaWQodmFsdWU6IGFueSkge1xuICAgIHRoaXMuYWRhcHRlci5zZXRJZCh0aGlzLCB2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHVuZGVybHlpbmcgT1JNIGFkYXB0ZXIgcmVjb3JkLiBBbiBvcGFxdWUgdmFsdWUgdG8gRGVuYWxpLCBoYW5kbGVkIGVudGlyZWx5IGJ5IHRoZSBPUk1cbiAgICogYWRhcHRlci5cbiAgICovXG4gIHJlY29yZDogYW55ID0gbnVsbDtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBNb2RlbC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvbnRhaW5lcjogQ29udGFpbmVyLCBkYXRhOiBhbnkgPSB7fSwgb3B0aW9ucz86IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgYXNzZXJ0KGNvbnRhaW5lciBpbnN0YW5jZW9mIENvbnRhaW5lciwgJ1lvdSBtdXN0IHN1cHBseSBhIGNvbnRhaW5lciB0byBuZXcgTW9kZWwgaW5zdGFuY2VzLiBJZiB5b3UgYXJlIGRpcmVjdGx5IGluc3RhbnRpYXRpbmcgdGhpcyBNb2RlbCBpbnN0YW5jZSwgdHJ5IHVzaW5nIHRoZSBkYiBzZXJ2aWNlIGluc3RlYWQnKTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICB0aGlzLnJlY29yZCA9IHRoaXMuYWRhcHRlci5idWlsZFJlY29yZCh0aGlzLnR5cGUsIGRhdGEsIG9wdGlvbnMpO1xuXG4gICAgLy8gdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3NcbiAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcblxuICAgICAgZ2V0KG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IGFueSk6IGFueSB7XG4gICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBub3QgYSBzdHJpbmcsIGRlZmVyIHRvIG1vZGVsIGluc3RhbmNlXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGVsW3Byb3BlcnR5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0F0dHJpYnV0ZShtb2RlbCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGVsLmFkYXB0ZXIuZ2V0QXR0cmlidXRlKG1vZGVsLCBwcm9wZXJ0eSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVsYXRlZE1ldGhvZFBhcnRzID0gcHJvcGVydHkubWF0Y2goL14oZ2V0fHNldHxhZGR8cmVtb3ZlKShcXHcrKS8pO1xuICAgICAgICBpZiAocmVsYXRlZE1ldGhvZFBhcnRzKSB7XG4gICAgICAgICAgbGV0IFsgLCBvcGVyYXRpb24sIHJlbGF0aW9uc2hpcE5hbWUgXSA9IHJlbGF0ZWRNZXRob2RQYXJ0cztcbiAgICAgICAgICByZWxhdGlvbnNoaXBOYW1lID0gbG93ZXJGaXJzdChyZWxhdGlvbnNoaXBOYW1lKTtcbiAgICAgICAgICBpZiAoaXNSZWxhdGlvbnNoaXAobW9kZWwsIHJlbGF0aW9uc2hpcE5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWxbYCR7IG9wZXJhdGlvbiB9UmVsYXRlZGBdLmJpbmQobW9kZWwsIHJlbGF0aW9uc2hpcE5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc01vZGVsUHJvcGVydHkobW9kZWwsIHByb3BlcnR5KSkge1xuICAgICAgICAgIHJldHVybiBtb2RlbFtwcm9wZXJ0eV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbW9kZWwuYWRhcHRlci5nZXRBdHRyaWJ1dGUobW9kZWwsIHByb3BlcnR5KTtcbiAgICAgIH0sXG5cbiAgICAgIHNldChtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGlzQXR0cmlidXRlKG1vZGVsLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICByZXR1cm4gbW9kZWwuYWRhcHRlci5zZXRBdHRyaWJ1dGUobW9kZWwsIHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcblxuICAgICAgZGVsZXRlUHJvcGVydHkobW9kZWw6IE1vZGVsLCBwcm9wZXJ0eTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChpc0F0dHJpYnV0ZShtb2RlbCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGVsLmFkYXB0ZXIuZGVsZXRlQXR0cmlidXRlKG1vZGVsLCBwcm9wZXJ0eSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlbGV0ZSBtb2RlbFtwcm9wZXJ0eV07XG4gICAgICB9XG5cbiAgICB9KTtcbiAgICAvLyB0c2xpbnQ6ZW5hYmxlOmNvbXBsZXRlZC1kb2NzXG4gIH1cblxuICAvKipcbiAgICogUGVyc2lzdCB0aGlzIG1vZGVsLlxuICAgKi9cbiAgYXN5bmMgc2F2ZShvcHRpb25zPzogYW55KTogUHJvbWlzZTxNb2RlbD4ge1xuICAgIGRlYnVnKGBzYXZpbmcgJHsgdGhpcy50eXBlIH1gKTtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuc2F2ZVJlY29yZCh0aGlzLCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgdGhpcyBtb2RlbC5cbiAgICovXG4gIGFzeW5jIGRlbGV0ZShvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLmRlbGV0ZVJlY29yZCh0aGlzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZWxhdGVkIHJlY29yZChzKSBmb3IgdGhlIGdpdmVuIHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIGFzeW5jIGdldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCBxdWVyeT86IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8TW9kZWx8TW9kZWxbXT4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcmVsYXRpb25zaGlwTmFtZV07XG4gICAgYXNzZXJ0KGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5pc1JlbGF0aW9uc2hpcCwgYFlvdSB0cmllZCB0byBmZXRjaCByZWxhdGVkICR7IHJlbGF0aW9uc2hpcE5hbWUgfSwgYnV0IG5vIHN1Y2ggcmVsYXRpb25zaGlwIGV4aXN0cyBvbiAkeyB0aGlzLnR5cGUgfWApO1xuICAgIGlmIChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNPbmUnKSB7XG4gICAgICBvcHRpb25zID0gcXVlcnk7XG4gICAgICBxdWVyeSA9IG51bGw7XG4gICAgfVxuICAgIGxldCByZXN1bHRzID0gYXdhaXQgdGhpcy5hZGFwdGVyLmdldFJlbGF0ZWQodGhpcywgcmVsYXRpb25zaGlwTmFtZSwgZGVzY3JpcHRvciwgcXVlcnksIG9wdGlvbnMpO1xuICAgIGxldCBSZWxhdGVkTW9kZWwgPSB0aGlzLmNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPihgbW9kZWw6JHsgZGVzY3JpcHRvci50eXBlIH1gKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdWx0cykpIHtcbiAgICAgIGFzc2VydChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNPbmUnLCAnVGhlIE9STSBhZGFwdGVyIHJldHVybmVkIGFuIGFycmF5IGZvciBhIGhhc09uZSByZWxhdGlvbnNoaXAgLSBpdCBzaG91bGQgcmV0dXJuIGVpdGhlciB0aGUgcmVjb3JkIG9yIG51bGwnKTtcbiAgICAgIHJldHVybiByZXN1bHRzID8gUmVsYXRlZE1vZGVsLmNyZWF0ZSh0aGlzLmNvbnRhaW5lciwgcmVzdWx0cykgOiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlY29yZCkgPT4gUmVsYXRlZE1vZGVsLmNyZWF0ZSh0aGlzLmNvbnRhaW5lciwgcmVjb3JkKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlbGF0ZWQgcmVjb3JkcyBmb3IgdGhlIGdpdmVuIHJlbGF0aW9uc2hpcCB3aXRoIHRoZSBzdXBwbGllZCByZWxhdGVkIHJlY29yZHMuXG4gICAqL1xuICBhc3luYyBzZXRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgcmVsYXRlZE1vZGVsczogTW9kZWx8TW9kZWxbXSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcmVsYXRpb25zaGlwTmFtZV07XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLnNldFJlbGF0ZWQodGhpcywgcmVsYXRpb25zaGlwTmFtZSwgZGVzY3JpcHRvciwgcmVsYXRlZE1vZGVscywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgcmVsYXRlZCByZWNvcmQgdG8gYSBoYXNNYW55IHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIGFzeW5jIGFkZFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCByZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5hZGRSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBnaXZlbiByZWNvcmQgZnJvbSB0aGUgaGFzTWFueSByZWxhdGlvbnNoaXBcbiAgICovXG4gIGFzeW5jIHJlbW92ZVJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCByZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5yZW1vdmVSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGh1bWFuLWZyaWVuZGx5IHN0cmluZyByZXByZXNlbnRpbmcgdGhpcyBNb2RlbCBpbnN0YW5jZSwgd2l0aCBhIHN1bW1hcnkgb2YgaXQnc1xuICAgKiBhdHRyaWJ1dGVzXG4gICAqL1xuICBpbnNwZWN0KCk6IHN0cmluZyB7XG4gICAgbGV0IGF0dHJpYnV0ZXNTdW1tYXJ5OiBzdHJpbmdbXSA9ICg8dHlwZW9mIE1vZGVsPnRoaXMuY29uc3RydWN0b3IpLm1hcEF0dHJpYnV0ZXModGhpcy5jb250YWluZXIsICh2YWx1ZSwgYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGAkeyBhdHRyaWJ1dGVOYW1lIH09JHsgSlNPTi5zdHJpbmdpZnkodGhpc1thdHRyaWJ1dGVOYW1lXSkgfWA7XG4gICAgfSk7XG4gICAgcmV0dXJuIGA8JHsgc3RhcnRDYXNlKHRoaXMudHlwZSkgfTokeyB0aGlzLmlkID09IG51bGwgPyAnLW5ldy0nIDogdGhpcy5pZCB9ICR7IGF0dHJpYnV0ZXNTdW1tYXJ5LmpvaW4oJywgJykgfT5gO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBodW1hbi1mcmllbmRseSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoaXMgTW9kZWwgaW5zdGFuY2VcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGA8JHsgc3RhcnRDYXNlKHRoaXMudHlwZSkgfTokeyB0aGlzLmlkID09IG51bGwgPyAnLW5ldy0nIDogdGhpcy5pZCB9PmA7XG4gIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBdHRyaWJ1dGUobW9kZWw6IE1vZGVsLCBwcm9wZXJ0eTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+bW9kZWwuY29uc3RydWN0b3IpW3Byb3BlcnR5XTtcbiAgcmV0dXJuIGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5pc0F0dHJpYnV0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVsYXRpb25zaGlwKG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBsZXQgZGVzY3JpcHRvciA9ICg8YW55Pm1vZGVsLmNvbnN0cnVjdG9yKVtwcm9wZXJ0eV0gfHwgKDxhbnk+bW9kZWwuY29uc3RydWN0b3IpW3BsdXJhbGl6ZShwcm9wZXJ0eSldO1xuICByZXR1cm4gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmlzUmVsYXRpb25zaGlwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNb2RlbFByb3BlcnR5KG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW9kZWxbcHJvcGVydHldICE9PSB1bmRlZmluZWQgJiYgIXByaXZhdGVQcm9wcy5pbmNsdWRlcyhwcm9wZXJ0eSk7XG59XG4iXX0=