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
    constructor() {
        super(...arguments);
        /**
         * The underlying ORM adapter record. An opaque value to Denali, handled entirely by the ORM
         * adapter.
         */
        this.record = null;
    }
    /**
     * When this class is loaded into a container, inspect the class defintion and add the appropriate
     * getters and setters for each attribute defined, and the appropriate relationship methods for
     * each relationship defined. These will delegate activity to the underlying ORM instance.
     */
    static [container_1.onLoad](ModelClass) {
        // Skip defining on abstract classes
        if (ModelClass.hasOwnProperty('abstract') && ModelClass.abstract) {
            return;
        }
        let proto = ModelClass.prototype;
        // Define attribute getter/settters
        ModelClass.mapAttributeDescriptors((descriptor, attributeName) => {
            Object.defineProperty(proto, attributeName, {
                configurable: true,
                get() {
                    return this.adapter.getAttribute(this, attributeName);
                },
                set(newValue) {
                    return this.adapter.setAttribute(this, attributeName, newValue);
                }
            });
        });
        // Define relationship operations
        ModelClass.mapRelationshipDescriptors((descriptor, relationshipName) => {
            let methodRoot = lodash_1.upperFirst(relationshipName);
            // getAuthor(options?)
            Object.defineProperty(proto, `get${methodRoot}`, {
                configurable: true,
                value(options) {
                    return this.getRelated(relationshipName, options);
                }
            });
            // setAuthor(comments, options?)
            Object.defineProperty(proto, `set${methodRoot}`, {
                configurable: true,
                value(relatedModels, options) {
                    return this.setRelated(relationshipName, relatedModels, options);
                }
            });
            if (descriptor.mode === 'hasMany') {
                let singularRoot = inflection_1.singularize(methodRoot);
                // addComment(comment, options?)
                Object.defineProperty(proto, `add${singularRoot}`, {
                    configurable: true,
                    value(relatedModel, options) {
                        return this.addRelated(relationshipName, relatedModel, options);
                    }
                });
                // removeComment(comment, options?)
                Object.defineProperty(proto, `remove${singularRoot}`, {
                    configurable: true,
                    value(relatedModel, options) {
                        return this.removeRelated(relationshipName, relatedModel, options);
                    }
                });
            }
        });
    }
    /**
     * Call the supplied callback function for each attribute on this model, passing in the attribute
     * name and attribute descriptor.
     */
    static mapAttributeDescriptors(fn) {
        let klass = this;
        let result = [];
        for (let key in klass) {
            if (klass[key] && klass[key].isAttribute) {
                result.push(fn(klass[key], key));
            }
        }
        return result;
    }
    /**
     * Call the supplied callback function for each relationship on this model, passing in the
     * relationship name and relationship descriptor.
     */
    static mapRelationshipDescriptors(fn) {
        let klass = this;
        let result = [];
        for (let key in klass) {
            if (klass[key] && klass[key].isRelationship) {
                result.push(fn(klass[key], key));
            }
        }
        return result;
    }
    /**
     * Get the type string for this model class. You must supply a container instance so we can lookup
     * the container name for this model class.
     */
    static getType(container) {
        return container.metaFor(this).containerName;
    }
    /**
     * Get the type of this model based on the container name for it
     */
    get type() {
        return this.container.metaFor(this.constructor).containerName;
    }
    /**
     * The ORM adapter specific to this model type. Defaults to the application's ORM adapter if none
     * for this specific model type is found.
     */
    get adapter() {
        return this.container.lookup(`orm-adapter:${this.type}`, { loose: true })
            || this.container.lookup('orm-adapter:application');
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
     * Tell the underlying ORM to build this record
     */
    init(data, options) {
        super.init(...arguments);
        this.record = this.adapter.buildRecord(this.type, data, options);
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
    getRelated(relationshipName, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let descriptor = this.constructor[relationshipName];
            assert(descriptor && descriptor.isRelationship, `You tried to fetch related ${relationshipName}, but no such relationship exists on ${this.type}`);
            let RelatedModel = this.container.factoryFor(`model:${descriptor.type}`);
            let results = yield this.adapter.getRelated(this, relationshipName, descriptor, options);
            if (descriptor.mode === 'hasOne') {
                assert(!Array.isArray(results), `The ${this.type} ORM adapter returned an array for the hasOne '${relationshipName}' relationship - it should return either an ORM record or null.`);
                return results ? RelatedModel.create(results) : null;
            }
            assert(Array.isArray(results), `The ${this.type} ORM adapter did not return an array for the hasMany '${relationshipName}' relationship - it should return an array (empty if no related records exist).`);
            return results.map((record) => RelatedModel.create(record));
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
        let attributesSummary = this.constructor.mapAttributeDescriptors((descriptor, attributeName) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL2RhdGEvbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlDO0FBQ2pDLHFDQUFxQztBQUNyQywyQ0FBb0Q7QUFDcEQsbUNBQStDO0FBQy9DLDRDQUEyQztBQUMzQyxrREFBdUQ7QUFJdkQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTFDOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsV0FBMkIsU0FBUSxnQkFBWTtJQUEvQzs7UUE0R0U7OztXQUdHO1FBQ0gsV0FBTSxHQUFRLElBQUksQ0FBQztJQThHckIsQ0FBQztJQXROQzs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLENBQUMsa0JBQU0sQ0FBQyxDQUFDLFVBQXdCO1FBQ3RDLG9DQUFvQztRQUNwQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sQ0FBQztRQUNULENBQUM7UUFDRCxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ2pDLG1DQUFtQztRQUNuQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxVQUFVLEVBQUUsYUFBYTtZQUMzRCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUU7Z0JBQzFDLFlBQVksRUFBRSxJQUFJO2dCQUNsQixHQUFHO29CQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3hELENBQUM7Z0JBQ0QsR0FBRyxDQUFDLFFBQVE7b0JBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUs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QUFVLEdBQVMsSUFBSSxDQUFDLFdBQVksQ0FBQyxzQkFBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN0RSxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlGLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNILE9BQU87UUFDTCxJQUFJLGlCQUFpQixHQUE0QixJQUFJLENBQUMsV0FBWSxDQUFDLHVCQUF1QixDQUFDLENBQUMsVUFBVSxFQUFFLGFBQWE7WUFDbkgsTUFBTSxDQUFDLEdBQUksYUFBYyxJQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFFLEVBQUUsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFLLGtCQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxJQUFLLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRyxJQUFLLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFDO0lBQ2xILENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixNQUFNLENBQUMsSUFBSyxrQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUcsR0FBRyxDQUFDO0lBQ2hGLENBQUM7O0FBMU5EOzs7R0FHRztBQUNJLGNBQVEsR0FBRyxLQUFLLENBQUM7QUFOMUIsd0JBOE5DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgeyBwbHVyYWxpemUsIHNpbmd1bGFyaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQgeyBzdGFydENhc2UsIHVwcGVyRmlyc3QgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IENvbnRhaW5lciwgeyBvbkxvYWQgfSBmcm9tICcuLi9tZXRhbC9jb250YWluZXInO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5pbXBvcnQgeyBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCBBdHRyaWJ1dGVEZXNjcmlwdG9yIH0gZnJvbSAnLi9kZXNjcmlwdG9ycyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTptb2RlbCcpO1xuXG4vKipcbiAqIFRoZSBNb2RlbCBjbGFzcyBpcyB0aGUgY29yZSBvZiBEZW5hbGkncyB1bmlxdWUgYXBwcm9hY2ggdG8gZGF0YSBhbmQgT1JNcy4gSXQgYWN0cyBhcyBhIHdyYXBwZXJcbiAqIGFuZCB0cmFuc2xhdGlvbiBsYXllciB0aGF0IHByb3ZpZGVzIGEgdW5pZmllZCBpbnRlcmZhY2UgdG8gYWNjZXNzIGFuZCBtYW5pcHVsYXRlIGRhdGEsIGJ1dFxuICogdHJhbnNsYXRlcyB0aG9zZSBpbnRlcmFjdGlvbnMgaW50byBPUk0gc3BlY2lmaWMgb3BlcmF0aW9ucyB2aWEgT1JNIGFkYXB0ZXJzLlxuICpcbiAqIE1vZGVscyBhcmUgYWJsZSB0byBtYWludGFpbiB0aGVpciByZWxhdGl2ZWx5IGNsZWFuIGludGVyZmFjZSB0aGFua3MgdG8gdGhlIHdheSB0aGUgY29uc3RydWN0b3JcbiAqIGFjdHVhbGx5IHJldHVybnMgYSBQcm94eSB3aGljaCB3cmFwcyB0aGUgTW9kZWwgaW5zdGFuY2UsIHJhdGhlciB0aGFuIHRoZSBNb2RlbCBpbnN0YW5jZSBkaXJlY3RseS5cbiAqIFRoaXMgbWVhbnMgeW91IGNhbiBkaXJlY3RseSBnZXQgYW5kIHNldCBwcm9wZXJ0aWVzIG9uIHlvdXIgcmVjb3JkcywgYW5kIHRoZSByZWNvcmQgKHdoaWNoIGlzIGFcbiAqIFByb3h5LXdyYXBwZWQgTW9kZWwpIHdpbGwgdHJhbnNsYXRlIGFuZCBmb3J3YXJkIHRob3NlIGNhbGxzIHRvIHRoZSB1bmRlcmx5aW5nIE9STSBhZGFwdGVyLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwgZXh0ZW5kcyBEZW5hbGlPYmplY3Qge1xuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgTW9kZWwgYXMgYW4gYWJzdHJhY3QgYmFzZSBtb2RlbCwgc28gT1JNIGFkYXB0ZXJzIGNhbiBrbm93IG5vdCB0byBjcmVhdGUgdGFibGVzIG9yXG4gICAqIG90aGVyIHN1cHBvcnRpbmcgaW5mcmFzdHJ1Y3R1cmUuXG4gICAqL1xuICBzdGF0aWMgYWJzdHJhY3QgPSBmYWxzZTtcblxuICAvKipcbiAgICogV2hlbiB0aGlzIGNsYXNzIGlzIGxvYWRlZCBpbnRvIGEgY29udGFpbmVyLCBpbnNwZWN0IHRoZSBjbGFzcyBkZWZpbnRpb24gYW5kIGFkZCB0aGUgYXBwcm9wcmlhdGVcbiAgICogZ2V0dGVycyBhbmQgc2V0dGVycyBmb3IgZWFjaCBhdHRyaWJ1dGUgZGVmaW5lZCwgYW5kIHRoZSBhcHByb3ByaWF0ZSByZWxhdGlvbnNoaXAgbWV0aG9kcyBmb3JcbiAgICogZWFjaCByZWxhdGlvbnNoaXAgZGVmaW5lZC4gVGhlc2Ugd2lsbCBkZWxlZ2F0ZSBhY3Rpdml0eSB0byB0aGUgdW5kZXJseWluZyBPUk0gaW5zdGFuY2UuXG4gICAqL1xuICBzdGF0aWMgW29uTG9hZF0oTW9kZWxDbGFzczogdHlwZW9mIE1vZGVsKSB7XG4gICAgLy8gU2tpcCBkZWZpbmluZyBvbiBhYnN0cmFjdCBjbGFzc2VzXG4gICAgaWYgKE1vZGVsQ2xhc3MuaGFzT3duUHJvcGVydHkoJ2Fic3RyYWN0JykgJiYgTW9kZWxDbGFzcy5hYnN0cmFjdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgcHJvdG8gPSBNb2RlbENsYXNzLnByb3RvdHlwZTtcbiAgICAvLyBEZWZpbmUgYXR0cmlidXRlIGdldHRlci9zZXR0dGVyc1xuICAgIE1vZGVsQ2xhc3MubWFwQXR0cmlidXRlRGVzY3JpcHRvcnMoKGRlc2NyaXB0b3IsIGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgYXR0cmlidXRlTmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGFwdGVyLmdldEF0dHJpYnV0ZSh0aGlzLCBhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KG5ld1ZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRhcHRlci5zZXRBdHRyaWJ1dGUodGhpcywgYXR0cmlidXRlTmFtZSwgbmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICAvLyBEZWZpbmUgcmVsYXRpb25zaGlwIG9wZXJhdGlvbnNcbiAgICBNb2RlbENsYXNzLm1hcFJlbGF0aW9uc2hpcERlc2NyaXB0b3JzKChkZXNjcmlwdG9yLCByZWxhdGlvbnNoaXBOYW1lKSA9PiB7XG4gICAgICBsZXQgbWV0aG9kUm9vdCA9IHVwcGVyRmlyc3QocmVsYXRpb25zaGlwTmFtZSk7XG4gICAgICAvLyBnZXRBdXRob3Iob3B0aW9ucz8pXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIGBnZXQke21ldGhvZFJvb3R9YCwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlKG9wdGlvbnM/OiBhbnkpIHtcbiAgICAgICAgICByZXR1cm4gKDxNb2RlbD50aGlzKS5nZXRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWUsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIHNldEF1dGhvcihjb21tZW50cywgb3B0aW9ucz8pXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIGBzZXQke21ldGhvZFJvb3R9YCwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIHZhbHVlKHJlbGF0ZWRNb2RlbHM6IE1vZGVsIHwgTW9kZWxbXSwgb3B0aW9ucz86IGFueSkge1xuICAgICAgICAgIHJldHVybiAoPE1vZGVsPnRoaXMpLnNldFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZSwgcmVsYXRlZE1vZGVscywgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc01hbnknKSB7XG4gICAgICAgIGxldCBzaW5ndWxhclJvb3QgPSBzaW5ndWxhcml6ZShtZXRob2RSb290KTtcbiAgICAgICAgLy8gYWRkQ29tbWVudChjb21tZW50LCBvcHRpb25zPylcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBgYWRkJHtzaW5ndWxhclJvb3R9YCwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZShyZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4gKDxNb2RlbD50aGlzKS5hZGRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWUsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gcmVtb3ZlQ29tbWVudChjb21tZW50LCBvcHRpb25zPylcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBgcmVtb3ZlJHtzaW5ndWxhclJvb3R9YCwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZShyZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4gKDxNb2RlbD50aGlzKS5yZW1vdmVSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWUsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmdW5jdGlvbiBmb3IgZWFjaCBhdHRyaWJ1dGUgb24gdGhpcyBtb2RlbCwgcGFzc2luZyBpbiB0aGUgYXR0cmlidXRlXG4gICAqIG5hbWUgYW5kIGF0dHJpYnV0ZSBkZXNjcmlwdG9yLlxuICAgKi9cbiAgc3RhdGljIG1hcEF0dHJpYnV0ZURlc2NyaXB0b3JzPFQ+KGZuOiAoZGVzY3JpcHRvcjogQXR0cmlidXRlRGVzY3JpcHRvciwgbmFtZTogc3RyaW5nKSA9PiBUKTogVFtdIHtcbiAgICBsZXQga2xhc3MgPSA8YW55PnRoaXM7XG4gICAgbGV0IHJlc3VsdDogVFtdID0gW107XG4gICAgZm9yIChsZXQga2V5IGluIGtsYXNzKSB7XG4gICAgICBpZiAoa2xhc3Nba2V5XSAmJiBrbGFzc1trZXldLmlzQXR0cmlidXRlKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGZuKGtsYXNzW2tleV0sIGtleSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdGhlIHN1cHBsaWVkIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBlYWNoIHJlbGF0aW9uc2hpcCBvbiB0aGlzIG1vZGVsLCBwYXNzaW5nIGluIHRoZVxuICAgKiByZWxhdGlvbnNoaXAgbmFtZSBhbmQgcmVsYXRpb25zaGlwIGRlc2NyaXB0b3IuXG4gICAqL1xuICBzdGF0aWMgbWFwUmVsYXRpb25zaGlwRGVzY3JpcHRvcnM8VD4oZm46IChkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCBuYW1lOiBzdHJpbmcpID0+IFQpOiBUW10ge1xuICAgIGxldCBrbGFzcyA9IDxhbnk+dGhpcztcbiAgICBsZXQgcmVzdWx0OiBUW10gPSBbXTtcbiAgICBmb3IgKGxldCBrZXkgaW4ga2xhc3MpIHtcbiAgICAgIGlmIChrbGFzc1trZXldICYmIGtsYXNzW2tleV0uaXNSZWxhdGlvbnNoaXApIHtcbiAgICAgICAgcmVzdWx0LnB1c2goZm4oa2xhc3Nba2V5XSwga2V5KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0eXBlIHN0cmluZyBmb3IgdGhpcyBtb2RlbCBjbGFzcy4gWW91IG11c3Qgc3VwcGx5IGEgY29udGFpbmVyIGluc3RhbmNlIHNvIHdlIGNhbiBsb29rdXBcbiAgICogdGhlIGNvbnRhaW5lciBuYW1lIGZvciB0aGlzIG1vZGVsIGNsYXNzLlxuICAgKi9cbiAgc3RhdGljIGdldFR5cGUoY29udGFpbmVyOiBDb250YWluZXIpOiBzdHJpbmcge1xuICAgIHJldHVybiBjb250YWluZXIubWV0YUZvcih0aGlzKS5jb250YWluZXJOYW1lO1xuICB9XG5cbiAgW2tleTogc3RyaW5nXTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgdW5kZXJseWluZyBPUk0gYWRhcHRlciByZWNvcmQuIEFuIG9wYXF1ZSB2YWx1ZSB0byBEZW5hbGksIGhhbmRsZWQgZW50aXJlbHkgYnkgdGhlIE9STVxuICAgKiBhZGFwdGVyLlxuICAgKi9cbiAgcmVjb3JkOiBhbnkgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHR5cGUgb2YgdGhpcyBtb2RlbCBiYXNlZCBvbiB0aGUgY29udGFpbmVyIG5hbWUgZm9yIGl0XG4gICAqL1xuICBnZXQgdHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5tZXRhRm9yKHRoaXMuY29uc3RydWN0b3IpLmNvbnRhaW5lck5hbWU7XG4gIH1cblxuICAvKipcbiAgICogVGhlIE9STSBhZGFwdGVyIHNwZWNpZmljIHRvIHRoaXMgbW9kZWwgdHlwZS4gRGVmYXVsdHMgdG8gdGhlIGFwcGxpY2F0aW9uJ3MgT1JNIGFkYXB0ZXIgaWYgbm9uZVxuICAgKiBmb3IgdGhpcyBzcGVjaWZpYyBtb2RlbCB0eXBlIGlzIGZvdW5kLlxuICAgKi9cbiAgZ2V0IGFkYXB0ZXIoKTogT1JNQWRhcHRlciB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLmxvb2t1cChgb3JtLWFkYXB0ZXI6JHsgdGhpcy50eXBlIH1gLCB7IGxvb3NlOiB0cnVlIH0pXG4gICAgICAgIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cCgnb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaWQgb2YgdGhlIHJlY29yZFxuICAgKi9cbiAgZ2V0IGlkKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuYWRhcHRlci5pZEZvcih0aGlzKTtcbiAgfVxuICBzZXQgaWQodmFsdWU6IGFueSkge1xuICAgIHRoaXMuYWRhcHRlci5zZXRJZCh0aGlzLCB2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogVGVsbCB0aGUgdW5kZXJseWluZyBPUk0gdG8gYnVpbGQgdGhpcyByZWNvcmRcbiAgICovXG4gIGluaXQoZGF0YTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICBzdXBlci5pbml0KC4uLmFyZ3VtZW50cyk7XG4gICAgdGhpcy5yZWNvcmQgPSB0aGlzLmFkYXB0ZXIuYnVpbGRSZWNvcmQodGhpcy50eXBlLCBkYXRhLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJzaXN0IHRoaXMgbW9kZWwuXG4gICAqL1xuICBhc3luYyBzYXZlKG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsPiB7XG4gICAgZGVidWcoYHNhdmluZyAkeyB0aGlzLnR5cGUgfWApO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5zYXZlUmVjb3JkKHRoaXMsIG9wdGlvbnMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0aGlzIG1vZGVsLlxuICAgKi9cbiAgYXN5bmMgZGVsZXRlKG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmFkYXB0ZXIuZGVsZXRlUmVjb3JkKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlbGF0ZWQgcmVjb3JkKHMpIGZvciB0aGUgZ2l2ZW4gcmVsYXRpb25zaGlwLlxuICAgKi9cbiAgYXN5bmMgZ2V0UmVsYXRlZChyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPE1vZGVsfE1vZGVsW10+IHtcbiAgICBsZXQgZGVzY3JpcHRvciA9ICg8YW55PnRoaXMuY29uc3RydWN0b3IpW3JlbGF0aW9uc2hpcE5hbWVdO1xuICAgIGFzc2VydChkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IuaXNSZWxhdGlvbnNoaXAsIGBZb3UgdHJpZWQgdG8gZmV0Y2ggcmVsYXRlZCAkeyByZWxhdGlvbnNoaXBOYW1lIH0sIGJ1dCBubyBzdWNoIHJlbGF0aW9uc2hpcCBleGlzdHMgb24gJHsgdGhpcy50eXBlIH1gKTtcbiAgICBsZXQgUmVsYXRlZE1vZGVsID0gdGhpcy5jb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oYG1vZGVsOiR7IGRlc2NyaXB0b3IudHlwZSB9YCk7XG4gICAgbGV0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmFkYXB0ZXIuZ2V0UmVsYXRlZCh0aGlzLCByZWxhdGlvbnNoaXBOYW1lLCBkZXNjcmlwdG9yLCBvcHRpb25zKTtcbiAgICBpZiAoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzT25lJykge1xuICAgICAgYXNzZXJ0KCFBcnJheS5pc0FycmF5KHJlc3VsdHMpLCBgVGhlICR7IHRoaXMudHlwZSB9IE9STSBhZGFwdGVyIHJldHVybmVkIGFuIGFycmF5IGZvciB0aGUgaGFzT25lICckeyByZWxhdGlvbnNoaXBOYW1lIH0nIHJlbGF0aW9uc2hpcCAtIGl0IHNob3VsZCByZXR1cm4gZWl0aGVyIGFuIE9STSByZWNvcmQgb3IgbnVsbC5gKTtcbiAgICAgIHJldHVybiByZXN1bHRzID8gUmVsYXRlZE1vZGVsLmNyZWF0ZShyZXN1bHRzKSA6IG51bGw7XG4gICAgfVxuICAgIGFzc2VydChBcnJheS5pc0FycmF5KHJlc3VsdHMpLCBgVGhlICR7IHRoaXMudHlwZSB9IE9STSBhZGFwdGVyIGRpZCBub3QgcmV0dXJuIGFuIGFycmF5IGZvciB0aGUgaGFzTWFueSAnJHsgcmVsYXRpb25zaGlwTmFtZSB9JyByZWxhdGlvbnNoaXAgLSBpdCBzaG91bGQgcmV0dXJuIGFuIGFycmF5IChlbXB0eSBpZiBubyByZWxhdGVkIHJlY29yZHMgZXhpc3QpLmApO1xuICAgIHJldHVybiByZXN1bHRzLm1hcCgocmVjb3JkOiBhbnkpID0+IFJlbGF0ZWRNb2RlbC5jcmVhdGUocmVjb3JkKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlbGF0ZWQgcmVjb3JkcyBmb3IgdGhlIGdpdmVuIHJlbGF0aW9uc2hpcCB3aXRoIHRoZSBzdXBwbGllZCByZWxhdGVkIHJlY29yZHMuXG4gICAqL1xuICBhc3luYyBzZXRSZWxhdGVkKHJlbGF0aW9uc2hpcE5hbWU6IHN0cmluZywgcmVsYXRlZE1vZGVsczogTW9kZWx8TW9kZWxbXSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBkZXNjcmlwdG9yID0gKDxhbnk+dGhpcy5jb25zdHJ1Y3RvcilbcmVsYXRpb25zaGlwTmFtZV07XG4gICAgYXdhaXQgdGhpcy5hZGFwdGVyLnNldFJlbGF0ZWQodGhpcywgcmVsYXRpb25zaGlwTmFtZSwgZGVzY3JpcHRvciwgcmVsYXRlZE1vZGVscywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgcmVsYXRlZCByZWNvcmQgdG8gYSBoYXNNYW55IHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIGFzeW5jIGFkZFJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCByZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5hZGRSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBnaXZlbiByZWNvcmQgZnJvbSB0aGUgaGFzTWFueSByZWxhdGlvbnNoaXBcbiAgICovXG4gIGFzeW5jIHJlbW92ZVJlbGF0ZWQocmVsYXRpb25zaGlwTmFtZTogc3RyaW5nLCByZWxhdGVkTW9kZWw6IE1vZGVsLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT50aGlzLmNvbnN0cnVjdG9yKVtwbHVyYWxpemUocmVsYXRpb25zaGlwTmFtZSldO1xuICAgIGF3YWl0IHRoaXMuYWRhcHRlci5yZW1vdmVSZWxhdGVkKHRoaXMsIHJlbGF0aW9uc2hpcE5hbWUsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGh1bWFuLWZyaWVuZGx5IHN0cmluZyByZXByZXNlbnRpbmcgdGhpcyBNb2RlbCBpbnN0YW5jZSwgd2l0aCBhIHN1bW1hcnkgb2YgaXQnc1xuICAgKiBhdHRyaWJ1dGVzXG4gICAqL1xuICBpbnNwZWN0KCk6IHN0cmluZyB7XG4gICAgbGV0IGF0dHJpYnV0ZXNTdW1tYXJ5OiBzdHJpbmdbXSA9ICg8dHlwZW9mIE1vZGVsPnRoaXMuY29uc3RydWN0b3IpLm1hcEF0dHJpYnV0ZURlc2NyaXB0b3JzKChkZXNjcmlwdG9yLCBhdHRyaWJ1dGVOYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYCR7IGF0dHJpYnV0ZU5hbWUgfT0keyBKU09OLnN0cmluZ2lmeSh0aGlzW2F0dHJpYnV0ZU5hbWVdKSB9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gYDwkeyBzdGFydENhc2UodGhpcy50eXBlKSB9OiR7IHRoaXMuaWQgPT0gbnVsbCA/ICctbmV3LScgOiB0aGlzLmlkIH0gJHsgYXR0cmlidXRlc1N1bW1hcnkuam9pbignLCAnKSB9PmA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGh1bWFuLWZyaWVuZGx5IHN0cmluZyByZXByZXNlbnRpbmcgdGhpcyBNb2RlbCBpbnN0YW5jZVxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYDwkeyBzdGFydENhc2UodGhpcy50eXBlKSB9OiR7IHRoaXMuaWQgPT0gbnVsbCA/ICctbmV3LScgOiB0aGlzLmlkIH0+YDtcbiAgfVxuXG59XG5cbiJdfQ==