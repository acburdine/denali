"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const path = require("path");
const inflection_1 = require("inflection");
const serializer_1 = require("../serializer");
const errors_1 = require("../../runtime/errors");
const bluebird_1 = require("bluebird");
const lodash_1 = require("lodash");
/**
 * Ensures that the value is only set if it exists, so we avoid creating iterable keys on obj for
 * undefined values.
 */
function setIfNotEmpty(obj, key, value) {
    if (!lodash_1.isEmpty(value)) {
        lodash_1.set(obj, key, value);
    }
}
/**
 * Renders the payload according to the JSONAPI 1.0 spec, including related resources, included
 * records, and support for meta and links.
 *
 * @package data
 */
class JSONAPISerializer extends serializer_1.default {
    constructor() {
        super(...arguments);
        /**
         * The default content type to use for any responses rendered by this serializer.
         */
        this.contentType = 'application/vnd.api+json';
    }
    /**
     * Take a response body (a model, an array of models, or an Error) and render it as a JSONAPI
     * compliant document
     */
    serialize(response, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let context = {
                response,
                options,
                document: {}
            };
            yield this.renderPrimary(context);
            yield this.renderIncluded(context);
            this.renderMeta(context);
            this.renderLinks(context);
            this.renderVersion(context);
            this.dedupeIncluded(context);
            response.body = context.document;
            response.contentType = this.contentType;
        });
    }
    /**
     * Render the primary payload for a JSONAPI document (either a model or array of models).
     */
    renderPrimary(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let payload = context.response.body;
            if (lodash_1.isArray(payload)) {
                yield this.renderPrimaryArray(context, payload);
            }
            else {
                yield this.renderPrimaryObject(context, payload);
            }
        });
    }
    /**
     * Render the primary data for the document, either a single Model or a single Error.
     */
    renderPrimaryObject(context, payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (payload instanceof Error) {
                context.document.errors = [yield this.renderError(context, payload)];
            }
            else {
                context.document.data = yield this.renderRecord(context, payload);
            }
        });
    }
    /**
     * Render the primary data for the document, either an array of Models or Errors
     */
    renderPrimaryArray(context, payload) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (payload[0] instanceof Error) {
                context.document.errors = yield bluebird_1.map(payload, (error) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    assert(error instanceof Error, 'You passed a mixed array of errors and models to the JSON-API serializer. The JSON-API spec does not allow for both `data` and `errors` top level objects in a response');
                    return yield this.renderError(context, error);
                }));
            }
            else {
                context.document.data = yield bluebird_1.map(payload, (record) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    assert(!(record instanceof Error), 'You passed a mixed array of errors and models to the JSON-API serializer. The JSON-API spec does not allow for both `data` and `errors` top level objects in a response');
                    return yield this.renderRecord(context, record);
                }));
            }
        });
    }
    /**
     * Render any included records supplied by the options into the top level of the document
     */
    renderIncluded(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (context.options.included) {
                assert(lodash_1.isArray(context.options.included), 'included records must be passed in as an array');
                context.document.included = yield bluebird_1.map(context.options.included, (includedRecord) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield this.renderRecord(context, includedRecord);
                }));
            }
        });
    }
    /**
     * Render top level meta object for a document. Default uses meta supplied in options call to
     * res.render().
     */
    renderMeta(context) {
        if (context.options.meta) {
            context.document.meta = context.options.meta;
        }
    }
    /**
     * Render top level links object for a document. Defaults to the links supplied in options.
     */
    renderLinks(context) {
        if (context.options.links) {
            context.document.links = context.options.links;
        }
    }
    /**
     * Render the version of JSONAPI supported.
     */
    renderVersion(context) {
        context.document.jsonapi = {
            version: '1.0'
        };
    }
    /**
     * Render the supplied record as a resource object.
     */
    renderRecord(context, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            assert(record, `Cannot serialize ${record}. You supplied ${record} instead of a Model instance.`);
            let serializedRecord = {
                type: inflection_1.pluralize(record.type),
                id: record.id
            };
            assert(serializedRecord.id != null, `Attempted to serialize a record (${record}) without an id, but the JSON-API spec requires all resources to have an id.`);
            setIfNotEmpty(serializedRecord, 'attributes', this.attributesForRecord(context, record));
            setIfNotEmpty(serializedRecord, 'relationships', yield this.relationshipsForRecord(context, record));
            setIfNotEmpty(serializedRecord, 'links', this.linksForRecord(context, record));
            setIfNotEmpty(serializedRecord, 'meta', this.metaForRecord(context, record));
            return serializedRecord;
        });
    }
    /**
     * Returns the JSONAPI attributes object representing this record's relationships
     */
    attributesForRecord(context, record) {
        let serializedAttributes = {};
        this.attributes.forEach((attributeName) => {
            let key = this.serializeAttributeName(context, attributeName);
            let rawValue = record[attributeName];
            if (!lodash_1.isUndefined(rawValue)) {
                let value = this.serializeAttributeValue(context, rawValue, key, record);
                serializedAttributes[key] = value;
            }
        });
        return serializedAttributes;
    }
    /**
     * The JSONAPI spec recommends (but does not require) that property names be dasherized. The
     * default implementation of this serializer therefore does that, but you can override this method
     * to use a different approach.
     */
    serializeAttributeName(context, name) {
        return lodash_1.kebabCase(name);
    }
    /**
     * Take an attribute value and return the serialized value. Useful for changing how certain types
     * of values are serialized, i.e. Date objects.
     *
     * The default implementation returns the attribute's value unchanged.
     */
    serializeAttributeValue(context, value, key, record) {
        return value;
    }
    /**
     * Returns the JSONAPI relationships object representing this record's relationships
     */
    relationshipsForRecord(context, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let serializedRelationships = {};
            // The result of this.relationships is a whitelist of which relationships should be serialized,
            // and the configuration for their serialization
            let relationshipNames = Object.keys(this.relationships);
            for (let name of relationshipNames) {
                let config = this.relationships[name];
                let key = config.key || this.serializeRelationshipName(context, name);
                let descriptor = record.constructor[name];
                assert(descriptor, `You specified a '${name}' relationship in your ${record.type} serializer, but no such relationship is defined on the ${record.type} model`);
                serializedRelationships[key] = yield this.serializeRelationship(context, name, config, descriptor, record);
            }
            return serializedRelationships;
        });
    }
    /**
     * Convert the relationship name to it's "over-the-wire" format. Defaults to dasherizing it.
     */
    serializeRelationshipName(context, name) {
        return lodash_1.kebabCase(name);
    }
    /**
     * Takes the serializer config and the model's descriptor for a relationship, and returns the
     * serialized relationship object. Also sideloads any full records if the relationship is so
     * configured.
     */
    serializeRelationship(context, name, config, descriptor, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relationship = {};
            setIfNotEmpty(relationship, 'links', this.linksForRelationship(context, name, config, descriptor, record));
            setIfNotEmpty(relationship, 'meta', this.metaForRelationship(context, name, config, descriptor, record));
            setIfNotEmpty(relationship, 'data', yield this.dataForRelationship(context, name, config, descriptor, record));
            return relationship;
        });
    }
    /**
     * Returns the serialized form of the related Models for the given record and relationship.
     */
    dataForRelationship(context, name, config, descriptor, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedData = yield record.getRelated(name);
            if (descriptor.mode === 'hasMany') {
                return yield bluebird_1.map(relatedData, (relatedRecord) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield this.dataForRelatedRecord(context, name, relatedRecord, config, descriptor, record);
                }));
            }
            return yield this.dataForRelatedRecord(context, name, relatedData, config, descriptor, record);
        });
    }
    /**
     * Given a related record, return the resource object for that record, and sideload the record as
     * well.
     */
    dataForRelatedRecord(context, name, relatedRecord, config, descriptor, record) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.includeRecord(context, name, relatedRecord, config, descriptor);
            return {
                type: inflection_1.pluralize(relatedRecord.type),
                id: relatedRecord.id
            };
        });
    }
    /**
     * Takes a relationship descriptor and the record it's for, and returns any links for that
     * relationship for that record. I.e. '/books/1/author'
     */
    linksForRelationship(context, name, config, descriptor, record) {
        let recordSelfLink = this.linksForRecord(context, record).self;
        let recordURL;
        if (typeof recordSelfLink === 'string') {
            recordURL = recordSelfLink;
        }
        else {
            recordURL = recordSelfLink.href;
        }
        return {
            self: path.join(recordURL, `relationships/${name}`),
            related: path.join(recordURL, name)
        };
    }
    /**
     * Returns any meta for a given relationship and record. No meta included by default.
     */
    metaForRelationship(context, name, config, descriptor, record) {
        // defaults to no meta content
    }
    /**
     * Returns links for a particular record, i.e. self: "/books/1". Default implementation assumes
     * the URL for a particular record maps to that type's `show` action, i.e. `books/show`.
     */
    linksForRecord(context, record) {
        let router = this.container.lookup('router:main');
        let url = router.urlFor(`${inflection_1.pluralize(record.type)}/show`, record);
        return typeof url === 'string' ? { self: url } : null;
    }
    /**
     * Returns meta for a particular record.
     */
    metaForRecord(context, record) {
        // defaults to no meta
    }
    /**
     * Sideloads a record into the top level "included" array
     */
    includeRecord(context, name, relatedRecord, config, descriptor) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!lodash_1.isArray(context.document.included)) {
                context.document.included = [];
            }
            let relatedOptions = (context.options.relationships && context.options.relationships[name]) || context.options;
            let relatedSerializer = config.serializer || this.container.lookup(`serializer:${relatedRecord.type}`);
            let relatedContext = lodash_1.assign({}, context, { options: relatedOptions });
            context.document.included.push(yield relatedSerializer.renderRecord(context, relatedRecord));
        });
    }
    /**
     * Render the supplied error
     */
    renderError(context, error) {
        let renderedError = {
            id: error.id,
            status: error.status || 500,
            code: error.code || error.name || 'InternalServerError',
            title: error.title,
            detail: error.message
        };
        setIfNotEmpty(renderedError, 'source', this.sourceForError(context, error));
        setIfNotEmpty(renderedError, 'meta', this.metaForError(context, error));
        setIfNotEmpty(renderedError, 'links', this.linksForError(context, error));
        return renderedError;
    }
    /**
     * Given an error, return a JSON Pointer, a URL query param name, or other info indicating the
     * source of the error.
     */
    sourceForError(context, error) {
        return error.source;
    }
    /**
     * Return the meta for a given error object. You could use this for example, to return debug
     * information in development environments.
     */
    metaForError(context, error) {
        return error.meta;
    }
    /**
     * Return a links object for an error. You could use this to link to a bug tracker report of the
     * error, for example.
     */
    linksForError(context, error) {
        // defaults to no links
    }
    /**
     * Remove duplicate entries from the sideloaded data.
     */
    dedupeIncluded(context) {
        if (lodash_1.isArray(context.document.included)) {
            context.document.included = lodash_1.uniqBy(context.document.included, (resource) => {
                return `${resource.type}/${resource.id}`;
            });
        }
    }
    /**
     * Unlike the other serializers, the default parse implementation does modify the incoming
     * payload. It converts the default dasherized attribute names into camelCase.
     *
     * The parse method here retains the JSONAPI document structure (i.e. data, included, links, meta,
     * etc), only modifying resource objects in place.
     */
    parse(payload, options) {
        try {
            assert(payload.data, 'Invalid JSON-API document (missing top level `data` object - see http://jsonapi.org/format/#document-top-level)');
            let parseResource = this._parseResource.bind(this);
            if (payload.data) {
                if (!lodash_1.isArray(payload.data)) {
                    payload.data = parseResource(payload.data);
                }
                else {
                    payload.data = payload.data.map(parseResource);
                }
            }
            if (payload.included) {
                payload.included = payload.included.map(parseResource);
            }
        }
        catch (e) {
            if (e.name === 'AssertionError') {
                throw new errors_1.default.BadRequest(e.message);
            }
            throw e;
        }
        return payload;
    }
    /**
     * Takes a JSON-API resource object and hands it off for parsing to the serializer specific to
     * that object's type.
     */
    _parseResource(resource) {
        assert(typeof resource.type === 'string', 'Invalid resource object encountered (missing `type` - see http://jsonapi.org/format/#document-resource-object-identification)');
        resource.type = this.parseType(resource.type);
        let relatedSerializer = this.container.lookup(`serializer:${resource.type}`);
        assert(relatedSerializer, `No serializer found for ${resource.type}`);
        assert(relatedSerializer.parseResource, `The serializer found for ${resource.type} does not implement the .parseResource() method. Are you trying to parse a model whose default serializer is not JSON-API?`);
        return relatedSerializer.parseResource(resource);
    }
    /**
     * Parse a single resource object from a JSONAPI document. The resource object could come from the
     * top level `data` payload, or from the sideloaded `included` records.
     */
    parseResource(resource) {
        setIfNotEmpty(resource, 'id', this.parseId(resource.id));
        setIfNotEmpty(resource, 'attributes', this.parseAttributes(resource.attributes));
        setIfNotEmpty(resource, 'relationships', this.parseRelationships(resource.relationships));
        return resource;
    }
    /**
     * Parse a resource object id
     */
    parseId(id) {
        return id;
    }
    /**
     * Parse a resource object's type string
     */
    parseType(type) {
        return inflection_1.singularize(type);
    }
    /**
     * Parse a resource object's attributes. By default, this converts from the JSONAPI recommended
     * dasheried keys to camelCase.
     */
    parseAttributes(attrs) {
        return lodash_1.mapKeys(attrs, (value, key) => {
            return lodash_1.camelCase(key);
        });
    }
    /**
     * Parse a resource object's relationships. By default, this converts from the JSONAPI recommended
     * dasheried keys to camelCase.
     */
    parseRelationships(relationships) {
        return lodash_1.mapKeys(relationships, (value, key) => {
            return lodash_1.camelCase(key);
        });
    }
}
exports.default = JSONAPISerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGkuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL2RhdGEvc2VyaWFsaXplcnMvanNvbi1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3QiwyQ0FBb0Q7QUFDcEQsOENBQXVDO0FBRXZDLGlEQUEwQztBQUsxQyx1Q0FBOEM7QUFDOUMsbUNBWWdCO0FBRWhCOzs7R0FHRztBQUNILHVCQUF1QixHQUFRLEVBQUUsR0FBVyxFQUFFLEtBQVU7SUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixZQUFHLENBQW1CLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztBQUNILENBQUM7QUFvSkQ7Ozs7O0dBS0c7QUFDSCx1QkFBdUMsU0FBUSxvQkFBVTtJQUF6RDs7UUFFRTs7V0FFRztRQUNJLGdCQUFXLEdBQUcsMEJBQTBCLENBQUM7SUErWmxELENBQUM7SUE3WkM7OztPQUdHO0lBQ1UsU0FBUyxDQUFDLFFBQWtCLEVBQUUsT0FBYTs7WUFDdEQsSUFBSSxPQUFPLEdBQVk7Z0JBQ3JCLFFBQVE7Z0JBQ1IsT0FBTztnQkFDUCxRQUFRLEVBQUUsRUFBRTthQUNiLENBQUM7WUFDRixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxD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QyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekQsYUFBYSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNqRixhQUFhLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDMUYsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQ7O09BRUc7SUFDTyxPQUFPLENBQUMsRUFBVTtRQUMxQixNQUFNLENBQUMsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVEOztPQUVHO0lBQ08sU0FBUyxDQUFDLElBQVk7UUFDOUIsTUFBTSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7T0FHRztJQUNPLGVBQWUsQ0FBQyxLQUF3QjtRQUNoRCxNQUFNLENBQUMsZ0JBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRztZQUMvQixNQUFNLENBQUMsa0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDTyxrQkFBa0IsQ0FBQyxhQUFtQztRQUM5RCxNQUFNLENBQUMsZ0JBQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRztZQUN2QyxNQUFNLENBQUMsa0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FFRjtBQXBhRCxvQ0FvYUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzaW5ndWxhcml6ZSwgcGx1cmFsaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQgU2VyaWFsaXplciBmcm9tICcuLi9zZXJpYWxpemVyJztcbmltcG9ydCBNb2RlbCBmcm9tICcuLi9tb2RlbCc7XG5pbXBvcnQgRXJyb3JzIGZyb20gJy4uLy4uL3J1bnRpbWUvZXJyb3JzJztcbmltcG9ydCBSZXNwb25zZSBmcm9tICcuLi8uLi9ydW50aW1lL3Jlc3BvbnNlJztcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi4vLi4vcnVudGltZS9yb3V0ZXInO1xuaW1wb3J0IHsgUmVsYXRpb25zaGlwRGVzY3JpcHRvciB9IGZyb20gJy4uL2Rlc2NyaXB0b3JzJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcENvbmZpZyB9IGZyb20gJy4uL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHsgbWFwLCBlYWNoLCByZXNvbHZlIH0gZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHtcbiAgYXNzaWduLFxuICBpc0FycmF5LFxuICBpc1VuZGVmaW5lZCxcbiAgaXNFbXB0eSxcbiAgc2V0LFxuICBtYXBLZXlzLFxuICBjYXBpdGFsaXplLFxuICBjYW1lbENhc2UsXG4gIGtlYmFiQ2FzZSxcbiAgZm9yRWFjaCxcbiAgdW5pcUJ5XG59IGZyb20gJ2xvZGFzaCc7XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSB2YWx1ZSBpcyBvbmx5IHNldCBpZiBpdCBleGlzdHMsIHNvIHdlIGF2b2lkIGNyZWF0aW5nIGl0ZXJhYmxlIGtleXMgb24gb2JqIGZvclxuICogdW5kZWZpbmVkIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0SWZOb3RFbXB0eShvYmo6IGFueSwga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgaWYgKCFpc0VtcHR5KHZhbHVlKSkge1xuICAgIHNldDxhbnksIHN0cmluZywgYW55PihvYmosIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaURvY3VtZW50IHtcbiAgZGF0YT86IEpzb25BcGlSZXNvdXJjZU9iamVjdCB8IEpzb25BcGlSZXNvdXJjZU9iamVjdFtdIHwgSnNvbkFwaVJlc291cmNlSWRlbnRpZmllciB8IEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXJbXTtcbiAgZXJyb3JzPzogSnNvbkFwaUVycm9yW107XG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbiAganNvbmFwaT86IHsgdmVyc2lvbjogc3RyaW5nIH07XG4gIGxpbmtzPzogSnNvbkFwaUxpbmtzO1xuICBpbmNsdWRlZD86IEpzb25BcGlSZXNvdXJjZU9iamVjdFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlFcnJvciB7XG4gIC8qKlxuICAgKiBBIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIHBhcnRpY3VsYXIgb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbVxuICAgKi9cbiAgaWQ/OiBzdHJpbmc7XG4gIGxpbmtzPzoge1xuICAgIC8qKlxuICAgICAqIEEgbGluayB0aGF0IGxlYWRzIHRvIGZ1cnRoZXIgZGV0YWlscyBhYm91dCB0aGlzIHBhcnRpY3VsYXIgb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbUFcbiAgICAgKi9cbiAgICBhYm91dD86IEpzb25BcGlMaW5rO1xuICB9O1xuICAvKipcbiAgICogVGhlIEhUVFAgc3RhdHVzIGNvZGUgYXBwbGljYWJsZSB0byB0aGlzIHByb2JsZW0sIGV4cHJlc3NlZCBhcyBhIHN0cmluZyB2YWx1ZVxuICAgKi9cbiAgc3RhdHVzPzogc3RyaW5nO1xuICAvKipcbiAgICogQW4gYXBwbGljYXRpb24tc3BlY2lmaWMgZXJyb3IgY29kZSwgZXhwcmVzc2VkIGFzIGEgc3RyaW5nIHZhbHVlXG4gICAqL1xuICBjb2RlPzogc3RyaW5nO1xuICAvKipcbiAgICogQSBzaG9ydCwgaHVtYW4tcmVhZGFibGUgc3VtbWFyeSBvZiB0aGUgcHJvYmxlbSB0aGF0IFNIT1VMRCBOT1QgY2hhbmdlIGZyb20gb2NjdXJyZW5jZSB0b1xuICAgKiBvY2N1cnJlbmNlIG9mIHRoZSBwcm9ibGVtLCBleGNlcHQgZm9yIHB1cnBvc2VzIG9mIGxvY2FsaXphdGlvblxuICAgKi9cbiAgdGl0bGU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBBIGh1bWFuLXJlYWRhYmxlIGV4cGxhbmF0aW9uIHNwZWNpZmljIHRvIHRoaXMgb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbS4gTGlrZSB0aXRsZSwgdGhpc1xuICAgKiBmaWVsZOKAmXMgdmFsdWUgY2FuIGJlIGxvY2FsaXplZFxuICAgKi9cbiAgZGV0YWlsPzogc3RyaW5nO1xuICAvKipcbiAgICogQW4gb2JqZWN0IGNvbnRhaW5pbmcgcmVmZXJlbmNlcyB0byB0aGUgc291cmNlIG9mIHRoZSBlcnJvclxuICAgKi9cbiAgc291cmNlPzoge1xuICAgIC8qKlxuICAgICAqIEEgSlNPTiBQb2ludGVyIFtSRkM2OTAxXSB0byB0aGUgYXNzb2NpYXRlZCBlbnRpdHkgaW4gdGhlIHJlcXVlc3QgZG9jdW1lbnQgW2UuZy4gXCIvZGF0YVwiIGZvciBhXG4gICAgICogcHJpbWFyeSBkYXRhIG9iamVjdCwgb3IgXCIvZGF0YS9hdHRyaWJ1dGVzL3RpdGxlXCIgZm9yIGEgc3BlY2lmaWMgYXR0cmlidXRlXVxuICAgICAqL1xuICAgIHBvaW50ZXI/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogQSBzdHJpbmcgaW5kaWNhdGluZyB3aGljaCBVUkkgcXVlcnkgcGFyYW1ldGVyIGNhdXNlZCB0aGUgZXJyb3JcbiAgICAgKi9cbiAgICBwYXJhbWV0ZXI/OiBzdHJpbmc7XG4gIH07XG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpUmVzb3VyY2VPYmplY3Qge1xuICBpZDogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIGF0dHJpYnV0ZXM/OiBKc29uQXBpQXR0cmlidXRlcztcbiAgcmVsYXRpb25zaGlwcz86IEpzb25BcGlSZWxhdGlvbnNoaXBzO1xuICBsaW5rcz86IEpzb25BcGlMaW5rcztcbiAgbWV0YT86IEpzb25BcGlNZXRhO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlBdHRyaWJ1dGVzIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlSZWxhdGlvbnNoaXBzIHtcbiAgW3JlbGF0aW9uc2hpcE5hbWU6IHN0cmluZ106IEpzb25BcGlSZWxhdGlvbnNoaXA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaVJlbGF0aW9uc2hpcCB7XG4gIC8qKlxuICAgKiBMaW5rcyBmb3IgdGhpcyByZWxhdGlvbnNoaXAuIFNob3VsZCBjb250YWluIGF0IGxlYXN0IGEgXCJzZWxmXCIgb3IgXCJyZWxhdGVkXCIgbGluay5cbiAgICovXG4gIGxpbmtzPzogSnNvbkFwaUxpbmtzO1xuICBkYXRhPzogSnNvbkFwaVJlbGF0aW9uc2hpcERhdGE7XG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbn1cblxuZXhwb3J0IHR5cGUgSnNvbkFwaVJlbGF0aW9uc2hpcERhdGEgPSBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyIHwgSnNvbkFwaVJlc291cmNlSWRlbnRpZmllcltdO1xuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXIge1xuICBpZDogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpTWV0YSB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpTGlua3Mge1xuICAvKipcbiAgICogQSBsaW5rIGZvciB0aGUgcmVzb3VyY2Ugb3IgcmVsYXRpb25zaGlwIGl0c2VsZi4gVGhpcyBsaW5rIGFsbG93cyB0aGUgY2xpZW50IHRvIGRpcmVjdGx5XG4gICAqIG1hbmlwdWxhdGUgdGhlIHJlc291cmNlIG9yIHJlbGF0aW9uc2hpcC4gRm9yIGV4YW1wbGUsIHJlbW92aW5nIGFuIGF1dGhvciB0aHJvdWdoIGFuIGFydGljbGXigJlzXG4gICAqIHJlbGF0aW9uc2hpcCBVUkwgd291bGQgZGlzY29ubmVjdCB0aGUgcGVyc29uIGZyb20gdGhlIGFydGljbGUgd2l0aG91dCBkZWxldGluZyB0aGUgcGVvcGxlXG4gICAqIHJlc291cmNlIGl0c2VsZi4gV2hlbiBmZXRjaGVkIHN1Y2Nlc3NmdWxseSwgdGhpcyBsaW5rIHJldHVybnMgdGhlIGxpbmthZ2UgZm9yIHRoZSByZWxhdGVkXG4gICAqIHJlc291cmNlcyBhcyBpdHMgcHJpbWFyeSBkYXRhXG4gICAqL1xuICBzZWxmPzogSnNvbkFwaUxpbms7XG4gIC8qKlxuICAgKiBBIOKAnHJlbGF0ZWQgcmVzb3VyY2UgbGlua+KAnSBwcm92aWRlcyBhY2Nlc3MgdG8gcmVzb3VyY2Ugb2JqZWN0cyBsaW5rZWQgaW4gYSByZWxhdGlvbnNoaXAuIFdoZW5cbiAgICogZmV0Y2hlZCwgdGhlIHJlbGF0ZWQgcmVzb3VyY2Ugb2JqZWN0KHMpIGFyZSByZXR1cm5lZCBhcyB0aGUgcmVzcG9uc2XigJlzIHByaW1hcnkgZGF0YS5cbiAgICovXG4gIHJlbGF0ZWQ/OiBKc29uQXBpTGluaztcbiAgW2tleTogc3RyaW5nXTogSnNvbkFwaUxpbms7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25BcGlMaW5rID0gc3RyaW5nIHwge1xuICBocmVmOiBzdHJpbmcsXG4gIG1ldGE6IEpzb25BcGlNZXRhXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgTW9kZWxzIHlvdSB3YW50IHRvIGVuc3VyZSBhcmUgaW5jbHVkZWQgaW4gdGhlIFwiaW5jbHVkZWRcIiBzaWRlbG9hZC4gTm90ZSB0aGF0IHRoZVxuICAgKiBzcGVjIHJlcXVpcmVzIFwiZnVsbC1saW5rYWdlXCIgLSBpLmUuIGFueSBNb2RlbHMgeW91IGluY2x1ZGUgaGVyZSBtdXN0IGJlIHJlZmVyZW5jZWQgYnkgYVxuICAgKiByZXNvdXJjZSBpZGVudGlmaWVyIGVsc2V3aGVyZSBpbiB0aGUgcGF5bG9hZCAtIHRvIG1haW50YWluIGZ1bGwgY29tcGxpYW5jZS5cbiAgICovXG4gIGluY2x1ZGVkPzogTW9kZWxbXTtcbiAgLyoqXG4gICAqIEFueSB0b3AgbGV2ZWwgbWV0YWRhdGEgdG8gc2VuZCB3aXRoIHRoZSByZXNwb25zZS5cbiAgICovXG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbiAgLyoqXG4gICAqIEFueSB0b3AgbGV2ZWwgbGlua3MgdG8gc2VuZCB3aXRoIHRoZSByZXNwb25zZS5cbiAgICovXG4gIGxpbmtzPzogSnNvbkFwaUxpbmtzO1xuICAvKipcbiAgICogQ29uZmlndXJhdGlvbiBmb3IgZWFjaCByZWxhdGlvbnNoaXAuXG4gICAqL1xuICByZWxhdGlvbnNoaXBzPzogYW55O1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbi8qKlxuICogVXNlZCBpbnRlcm5hbGx5IHRvIHNpbXBsaWZ5IHBhc3NpbmcgYXJndW1lbnRzIHJlcXVpcmVkIGJ5IGFsbCBmdW5jdGlvbnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dCB7XG4gIHJlc3BvbnNlOiBSZXNwb25zZTtcbiAgb3B0aW9uczogT3B0aW9ucztcbiAgZG9jdW1lbnQ6IEpzb25BcGlEb2N1bWVudDtcbn1cblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBwYXlsb2FkIGFjY29yZGluZyB0byB0aGUgSlNPTkFQSSAxLjAgc3BlYywgaW5jbHVkaW5nIHJlbGF0ZWQgcmVzb3VyY2VzLCBpbmNsdWRlZFxuICogcmVjb3JkcywgYW5kIHN1cHBvcnQgZm9yIG1ldGEgYW5kIGxpbmtzLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSlNPTkFQSVNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgY29udGVudCB0eXBlIHRvIHVzZSBmb3IgYW55IHJlc3BvbnNlcyByZW5kZXJlZCBieSB0aGlzIHNlcmlhbGl6ZXIuXG4gICAqL1xuICBwdWJsaWMgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vdm5kLmFwaStqc29uJztcblxuICAvKipcbiAgICogVGFrZSBhIHJlc3BvbnNlIGJvZHkgKGEgbW9kZWwsIGFuIGFycmF5IG9mIG1vZGVscywgb3IgYW4gRXJyb3IpIGFuZCByZW5kZXIgaXQgYXMgYSBKU09OQVBJXG4gICAqIGNvbXBsaWFudCBkb2N1bWVudFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHNlcmlhbGl6ZShyZXNwb25zZTogUmVzcG9uc2UsIG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29udGV4dDogQ29udGV4dCA9IHtcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIGRvY3VtZW50OiB7fVxuICAgIH07XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJQcmltYXJ5KGNvbnRleHQpO1xuICAgIGF3YWl0IHRoaXMucmVuZGVySW5jbHVkZWQoY29udGV4dCk7XG4gICAgdGhpcy5yZW5kZXJNZXRhKGNvbnRleHQpO1xuICAgIHRoaXMucmVuZGVyTGlua3MoY29udGV4dCk7XG4gICAgdGhpcy5yZW5kZXJWZXJzaW9uKGNvbnRleHQpO1xuICAgIHRoaXMuZGVkdXBlSW5jbHVkZWQoY29udGV4dCk7XG4gICAgcmVzcG9uc2UuYm9keSA9IGNvbnRleHQuZG9jdW1lbnQ7XG4gICAgcmVzcG9uc2UuY29udGVudFR5cGUgPSB0aGlzLmNvbnRlbnRUeXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgcHJpbWFyeSBwYXlsb2FkIGZvciBhIEpTT05BUEkgZG9jdW1lbnQgKGVpdGhlciBhIG1vZGVsIG9yIGFycmF5IG9mIG1vZGVscykuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVyUHJpbWFyeShjb250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHBheWxvYWQgPSBjb250ZXh0LnJlc3BvbnNlLmJvZHk7XG4gICAgaWYgKGlzQXJyYXkocGF5bG9hZCkpIHtcbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyUHJpbWFyeUFycmF5KGNvbnRleHQsIHBheWxvYWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnJlbmRlclByaW1hcnlPYmplY3QoY29udGV4dCwgcGF5bG9hZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgcHJpbWFyeSBkYXRhIGZvciB0aGUgZG9jdW1lbnQsIGVpdGhlciBhIHNpbmdsZSBNb2RlbCBvciBhIHNpbmdsZSBFcnJvci5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyByZW5kZXJQcmltYXJ5T2JqZWN0KGNvbnRleHQ6IENvbnRleHQsIHBheWxvYWQ6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuZXJyb3JzID0gWyBhd2FpdCB0aGlzLnJlbmRlckVycm9yKGNvbnRleHQsIHBheWxvYWQpIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuZGF0YSA9IGF3YWl0IHRoaXMucmVuZGVyUmVjb3JkKGNvbnRleHQsIHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHByaW1hcnkgZGF0YSBmb3IgdGhlIGRvY3VtZW50LCBlaXRoZXIgYW4gYXJyYXkgb2YgTW9kZWxzIG9yIEVycm9yc1xuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJlbmRlclByaW1hcnlBcnJheShjb250ZXh0OiBDb250ZXh0LCBwYXlsb2FkOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAocGF5bG9hZFswXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmVycm9ycyA9IGF3YWl0IG1hcChwYXlsb2FkLCBhc3luYyAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAgIGFzc2VydChlcnJvciBpbnN0YW5jZW9mIEVycm9yLCAnWW91IHBhc3NlZCBhIG1peGVkIGFycmF5IG9mIGVycm9ycyBhbmQgbW9kZWxzIHRvIHRoZSBKU09OLUFQSSBzZXJpYWxpemVyLiBUaGUgSlNPTi1BUEkgc3BlYyBkb2VzIG5vdCBhbGxvdyBmb3IgYm90aCBgZGF0YWAgYW5kIGBlcnJvcnNgIHRvcCBsZXZlbCBvYmplY3RzIGluIGEgcmVzcG9uc2UnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVuZGVyRXJyb3IoY29udGV4dCwgZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuZGF0YSA9IGF3YWl0IG1hcChwYXlsb2FkLCBhc3luYyAocmVjb3JkOiBNb2RlbCkgPT4ge1xuICAgICAgICBhc3NlcnQoIShyZWNvcmQgaW5zdGFuY2VvZiBFcnJvciksICdZb3UgcGFzc2VkIGEgbWl4ZWQgYXJyYXkgb2YgZXJyb3JzIGFuZCBtb2RlbHMgdG8gdGhlIEpTT04tQVBJIHNlcmlhbGl6ZXIuIFRoZSBKU09OLUFQSSBzcGVjIGRvZXMgbm90IGFsbG93IGZvciBib3RoIGBkYXRhYCBhbmQgYGVycm9yc2AgdG9wIGxldmVsIG9iamVjdHMgaW4gYSByZXNwb25zZScpO1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZW5kZXJSZWNvcmQoY29udGV4dCwgcmVjb3JkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgYW55IGluY2x1ZGVkIHJlY29yZHMgc3VwcGxpZWQgYnkgdGhlIG9wdGlvbnMgaW50byB0aGUgdG9wIGxldmVsIG9mIHRoZSBkb2N1bWVudFxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJlbmRlckluY2x1ZGVkKGNvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoY29udGV4dC5vcHRpb25zLmluY2x1ZGVkKSB7XG4gICAgICBhc3NlcnQoaXNBcnJheShjb250ZXh0Lm9wdGlvbnMuaW5jbHVkZWQpLCAnaW5jbHVkZWQgcmVjb3JkcyBtdXN0IGJlIHBhc3NlZCBpbiBhcyBhbiBhcnJheScpO1xuICAgICAgY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCA9IGF3YWl0IG1hcChjb250ZXh0Lm9wdGlvbnMuaW5jbHVkZWQsIGFzeW5jIChpbmNsdWRlZFJlY29yZCkgPT4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZW5kZXJSZWNvcmQoY29udGV4dCwgaW5jbHVkZWRSZWNvcmQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0b3AgbGV2ZWwgbWV0YSBvYmplY3QgZm9yIGEgZG9jdW1lbnQuIERlZmF1bHQgdXNlcyBtZXRhIHN1cHBsaWVkIGluIG9wdGlvbnMgY2FsbCB0b1xuICAgKiByZXMucmVuZGVyKCkuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVuZGVyTWV0YShjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKGNvbnRleHQub3B0aW9ucy5tZXRhKSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50Lm1ldGEgPSBjb250ZXh0Lm9wdGlvbnMubWV0YTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRvcCBsZXZlbCBsaW5rcyBvYmplY3QgZm9yIGEgZG9jdW1lbnQuIERlZmF1bHRzIHRvIHRoZSBsaW5rcyBzdXBwbGllZCBpbiBvcHRpb25zLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlbmRlckxpbmtzKGNvbnRleHQ6IENvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoY29udGV4dC5vcHRpb25zLmxpbmtzKSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmxpbmtzID0gY29udGV4dC5vcHRpb25zLmxpbmtzO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHZlcnNpb24gb2YgSlNPTkFQSSBzdXBwb3J0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVuZGVyVmVyc2lvbihjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG4gICAgY29udGV4dC5kb2N1bWVudC5qc29uYXBpID0ge1xuICAgICAgdmVyc2lvbjogJzEuMCdcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgc3VwcGxpZWQgcmVjb3JkIGFzIGEgcmVzb3VyY2Ugb2JqZWN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJlbmRlclJlY29yZChjb250ZXh0OiBDb250ZXh0LCByZWNvcmQ6IE1vZGVsKTogUHJvbWlzZTxKc29uQXBpUmVzb3VyY2VPYmplY3Q+IHtcbiAgICBhc3NlcnQocmVjb3JkLCBgQ2Fubm90IHNlcmlhbGl6ZSAkeyByZWNvcmQgfS4gWW91IHN1cHBsaWVkICR7IHJlY29yZCB9IGluc3RlYWQgb2YgYSBNb2RlbCBpbnN0YW5jZS5gKTtcbiAgICBsZXQgc2VyaWFsaXplZFJlY29yZDogSnNvbkFwaVJlc291cmNlT2JqZWN0ID0ge1xuICAgICAgdHlwZTogcGx1cmFsaXplKHJlY29yZC50eXBlKSxcbiAgICAgIGlkOiByZWNvcmQuaWRcbiAgICB9O1xuICAgIGFzc2VydChzZXJpYWxpemVkUmVjb3JkLmlkICE9IG51bGwsIGBBdHRlbXB0ZWQgdG8gc2VyaWFsaXplIGEgcmVjb3JkICgkeyByZWNvcmQgfSkgd2l0aG91dCBhbiBpZCwgYnV0IHRoZSBKU09OLUFQSSBzcGVjIHJlcXVpcmVzIGFsbCByZXNvdXJjZXMgdG8gaGF2ZSBhbiBpZC5gKTtcbiAgICBzZXRJZk5vdEVtcHR5KHNlcmlhbGl6ZWRSZWNvcmQsICdhdHRyaWJ1dGVzJywgdGhpcy5hdHRyaWJ1dGVzRm9yUmVjb3JkKGNvbnRleHQsIHJlY29yZCkpO1xuICAgIHNldElmTm90RW1wdHkoc2VyaWFsaXplZFJlY29yZCwgJ3JlbGF0aW9uc2hpcHMnLCBhd2FpdCB0aGlzLnJlbGF0aW9uc2hpcHNGb3JSZWNvcmQoY29udGV4dCwgcmVjb3JkKSk7XG4gICAgc2V0SWZOb3RFbXB0eShzZXJpYWxpemVkUmVjb3JkLCAnbGlua3MnLCB0aGlzLmxpbmtzRm9yUmVjb3JkKGNvbnRleHQsIHJlY29yZCkpO1xuICAgIHNldElmTm90RW1wdHkoc2VyaWFsaXplZFJlY29yZCwgJ21ldGEnLCB0aGlzLm1ldGFGb3JSZWNvcmQoY29udGV4dCwgcmVjb3JkKSk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZWRSZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgSlNPTkFQSSBhdHRyaWJ1dGVzIG9iamVjdCByZXByZXNlbnRpbmcgdGhpcyByZWNvcmQncyByZWxhdGlvbnNoaXBzXG4gICAqL1xuICBwcm90ZWN0ZWQgYXR0cmlidXRlc0ZvclJlY29yZChjb250ZXh0OiBDb250ZXh0LCByZWNvcmQ6IE1vZGVsKTogSnNvbkFwaUF0dHJpYnV0ZXMge1xuICAgIGxldCBzZXJpYWxpemVkQXR0cmlidXRlczogSnNvbkFwaUF0dHJpYnV0ZXMgPSB7fTtcbiAgICB0aGlzLmF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlTmFtZSkgPT4ge1xuICAgICAgbGV0IGtleSA9IHRoaXMuc2VyaWFsaXplQXR0cmlidXRlTmFtZShjb250ZXh0LCBhdHRyaWJ1dGVOYW1lKTtcbiAgICAgIGxldCByYXdWYWx1ZSA9IHJlY29yZFthdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGlmICghaXNVbmRlZmluZWQocmF3VmFsdWUpKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuc2VyaWFsaXplQXR0cmlidXRlVmFsdWUoY29udGV4dCwgcmF3VmFsdWUsIGtleSwgcmVjb3JkKTtcbiAgICAgICAgc2VyaWFsaXplZEF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzZXJpYWxpemVkQXR0cmlidXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgSlNPTkFQSSBzcGVjIHJlY29tbWVuZHMgKGJ1dCBkb2VzIG5vdCByZXF1aXJlKSB0aGF0IHByb3BlcnR5IG5hbWVzIGJlIGRhc2hlcml6ZWQuIFRoZVxuICAgKiBkZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIHRoaXMgc2VyaWFsaXplciB0aGVyZWZvcmUgZG9lcyB0aGF0LCBidXQgeW91IGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZFxuICAgKiB0byB1c2UgYSBkaWZmZXJlbnQgYXBwcm9hY2guXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplQXR0cmlidXRlTmFtZShjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZWJhYkNhc2UobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBhbiBhdHRyaWJ1dGUgdmFsdWUgYW5kIHJldHVybiB0aGUgc2VyaWFsaXplZCB2YWx1ZS4gVXNlZnVsIGZvciBjaGFuZ2luZyBob3cgY2VydGFpbiB0eXBlc1xuICAgKiBvZiB2YWx1ZXMgYXJlIHNlcmlhbGl6ZWQsIGkuZS4gRGF0ZSBvYmplY3RzLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIHRoZSBhdHRyaWJ1dGUncyB2YWx1ZSB1bmNoYW5nZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplQXR0cmlidXRlVmFsdWUoY29udGV4dDogQ29udGV4dCwgdmFsdWU6IGFueSwga2V5OiBzdHJpbmcsIHJlY29yZDogTW9kZWwpOiBhbnkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBKU09OQVBJIHJlbGF0aW9uc2hpcHMgb2JqZWN0IHJlcHJlc2VudGluZyB0aGlzIHJlY29yZCdzIHJlbGF0aW9uc2hpcHNcbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyByZWxhdGlvbnNoaXBzRm9yUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiBQcm9taXNlPEpzb25BcGlSZWxhdGlvbnNoaXBzPiB7XG4gICAgbGV0IHNlcmlhbGl6ZWRSZWxhdGlvbnNoaXBzOiBKc29uQXBpUmVsYXRpb25zaGlwcyA9IHt9O1xuXG4gICAgLy8gVGhlIHJlc3VsdCBvZiB0aGlzLnJlbGF0aW9uc2hpcHMgaXMgYSB3aGl0ZWxpc3Qgb2Ygd2hpY2ggcmVsYXRpb25zaGlwcyBzaG91bGQgYmUgc2VyaWFsaXplZCxcbiAgICAvLyBhbmQgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZWlyIHNlcmlhbGl6YXRpb25cbiAgICBsZXQgcmVsYXRpb25zaGlwTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLnJlbGF0aW9uc2hpcHMpO1xuICAgIGZvciAobGV0IG5hbWUgb2YgcmVsYXRpb25zaGlwTmFtZXMpIHtcbiAgICAgIGxldCBjb25maWcgPSB0aGlzLnJlbGF0aW9uc2hpcHNbbmFtZV07XG4gICAgICBsZXQga2V5ID0gY29uZmlnLmtleSB8fCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcE5hbWUoY29udGV4dCwgbmFtZSk7XG4gICAgICBsZXQgZGVzY3JpcHRvciA9ICg8YW55PnJlY29yZC5jb25zdHJ1Y3RvcilbbmFtZV07XG4gICAgICBhc3NlcnQoZGVzY3JpcHRvciwgYFlvdSBzcGVjaWZpZWQgYSAnJHsgbmFtZSB9JyByZWxhdGlvbnNoaXAgaW4geW91ciAkeyByZWNvcmQudHlwZSB9IHNlcmlhbGl6ZXIsIGJ1dCBubyBzdWNoIHJlbGF0aW9uc2hpcCBpcyBkZWZpbmVkIG9uIHRoZSAkeyByZWNvcmQudHlwZSB9IG1vZGVsYCk7XG4gICAgICBzZXJpYWxpemVkUmVsYXRpb25zaGlwc1trZXldID0gYXdhaXQgdGhpcy5zZXJpYWxpemVSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpO1xuICAgIH1cblxuICAgIHJldHVybiBzZXJpYWxpemVkUmVsYXRpb25zaGlwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSByZWxhdGlvbnNoaXAgbmFtZSB0byBpdCdzIFwib3Zlci10aGUtd2lyZVwiIGZvcm1hdC4gRGVmYXVsdHMgdG8gZGFzaGVyaXppbmcgaXQuXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplUmVsYXRpb25zaGlwTmFtZShjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBrZWJhYkNhc2UobmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIHNlcmlhbGl6ZXIgY29uZmlnIGFuZCB0aGUgbW9kZWwncyBkZXNjcmlwdG9yIGZvciBhIHJlbGF0aW9uc2hpcCwgYW5kIHJldHVybnMgdGhlXG4gICAqIHNlcmlhbGl6ZWQgcmVsYXRpb25zaGlwIG9iamVjdC4gQWxzbyBzaWRlbG9hZHMgYW55IGZ1bGwgcmVjb3JkcyBpZiB0aGUgcmVsYXRpb25zaGlwIGlzIHNvXG4gICAqIGNvbmZpZ3VyZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc2VyaWFsaXplUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBQcm9taXNlPEpzb25BcGlSZWxhdGlvbnNoaXA+IHtcbiAgICBsZXQgcmVsYXRpb25zaGlwOiBKc29uQXBpUmVsYXRpb25zaGlwID0ge307XG4gICAgc2V0SWZOb3RFbXB0eShyZWxhdGlvbnNoaXAsICdsaW5rcycsIHRoaXMubGlua3NGb3JSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbGF0aW9uc2hpcCwgJ21ldGEnLCB0aGlzLm1ldGFGb3JSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbGF0aW9uc2hpcCwgJ2RhdGEnLCBhd2FpdCB0aGlzLmRhdGFGb3JSZWxhdGlvbnNoaXAoY29udGV4dCwgbmFtZSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpKTtcbiAgICByZXR1cm4gcmVsYXRpb25zaGlwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNlcmlhbGl6ZWQgZm9ybSBvZiB0aGUgcmVsYXRlZCBNb2RlbHMgZm9yIHRoZSBnaXZlbiByZWNvcmQgYW5kIHJlbGF0aW9uc2hpcC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBkYXRhRm9yUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBQcm9taXNlPEpzb25BcGlSZWxhdGlvbnNoaXBEYXRhPiB7XG4gICAgbGV0IHJlbGF0ZWREYXRhID0gYXdhaXQgcmVjb3JkLmdldFJlbGF0ZWQobmFtZSk7XG4gICAgaWYgKGRlc2NyaXB0b3IubW9kZSA9PT0gJ2hhc01hbnknKSB7XG4gICAgICByZXR1cm4gYXdhaXQgbWFwKDxNb2RlbFtdPnJlbGF0ZWREYXRhLCBhc3luYyAocmVsYXRlZFJlY29yZCkgPT4ge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5kYXRhRm9yUmVsYXRlZFJlY29yZChjb250ZXh0LCBuYW1lLCByZWxhdGVkUmVjb3JkLCBjb25maWcsIGRlc2NyaXB0b3IsIHJlY29yZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZGF0YUZvclJlbGF0ZWRSZWNvcmQoY29udGV4dCwgbmFtZSwgPE1vZGVsPnJlbGF0ZWREYXRhLCBjb25maWcsIGRlc2NyaXB0b3IsIHJlY29yZCk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSByZWxhdGVkIHJlY29yZCwgcmV0dXJuIHRoZSByZXNvdXJjZSBvYmplY3QgZm9yIHRoYXQgcmVjb3JkLCBhbmQgc2lkZWxvYWQgdGhlIHJlY29yZCBhc1xuICAgKiB3ZWxsLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGRhdGFGb3JSZWxhdGVkUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgcmVsYXRlZFJlY29yZDogTW9kZWwsIGNvbmZpZzogUmVsYXRpb25zaGlwQ29uZmlnLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWNvcmQ6IE1vZGVsKTogUHJvbWlzZTxKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyPiB7XG4gICAgYXdhaXQgdGhpcy5pbmNsdWRlUmVjb3JkKGNvbnRleHQsIG5hbWUsIHJlbGF0ZWRSZWNvcmQsIGNvbmZpZywgZGVzY3JpcHRvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHBsdXJhbGl6ZShyZWxhdGVkUmVjb3JkLnR5cGUpLFxuICAgICAgaWQ6IHJlbGF0ZWRSZWNvcmQuaWRcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgcmVsYXRpb25zaGlwIGRlc2NyaXB0b3IgYW5kIHRoZSByZWNvcmQgaXQncyBmb3IsIGFuZCByZXR1cm5zIGFueSBsaW5rcyBmb3IgdGhhdFxuICAgKiByZWxhdGlvbnNoaXAgZm9yIHRoYXQgcmVjb3JkLiBJLmUuICcvYm9va3MvMS9hdXRob3InXG4gICAqL1xuICBwcm90ZWN0ZWQgbGlua3NGb3JSZWxhdGlvbnNoaXAoY29udGV4dDogQ29udGV4dCwgbmFtZTogc3RyaW5nLCBjb25maWc6IFJlbGF0aW9uc2hpcENvbmZpZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVjb3JkOiBNb2RlbCk6IEpzb25BcGlMaW5rcyB7XG4gICAgbGV0IHJlY29yZFNlbGZMaW5rID0gdGhpcy5saW5rc0ZvclJlY29yZChjb250ZXh0LCByZWNvcmQpLnNlbGY7XG4gICAgbGV0IHJlY29yZFVSTDogc3RyaW5nO1xuICAgIGlmICh0eXBlb2YgcmVjb3JkU2VsZkxpbmsgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZWNvcmRVUkwgPSByZWNvcmRTZWxmTGluaztcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjb3JkVVJMID0gcmVjb3JkU2VsZkxpbmsuaHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGY6IHBhdGguam9pbihyZWNvcmRVUkwsIGByZWxhdGlvbnNoaXBzLyR7IG5hbWUgfWApLFxuICAgICAgcmVsYXRlZDogcGF0aC5qb2luKHJlY29yZFVSTCwgbmFtZSlcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW55IG1ldGEgZm9yIGEgZ2l2ZW4gcmVsYXRpb25zaGlwIGFuZCByZWNvcmQuIE5vIG1ldGEgaW5jbHVkZWQgYnkgZGVmYXVsdC5cbiAgICovXG4gIHByb3RlY3RlZCBtZXRhRm9yUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBKc29uQXBpTWV0YSB8IHZvaWQge1xuICAgIC8vIGRlZmF1bHRzIHRvIG5vIG1ldGEgY29udGVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbGlua3MgZm9yIGEgcGFydGljdWxhciByZWNvcmQsIGkuZS4gc2VsZjogXCIvYm9va3MvMVwiLiBEZWZhdWx0IGltcGxlbWVudGF0aW9uIGFzc3VtZXNcbiAgICogdGhlIFVSTCBmb3IgYSBwYXJ0aWN1bGFyIHJlY29yZCBtYXBzIHRvIHRoYXQgdHlwZSdzIGBzaG93YCBhY3Rpb24sIGkuZS4gYGJvb2tzL3Nob3dgLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxpbmtzRm9yUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiBKc29uQXBpTGlua3Mge1xuICAgIGxldCByb3V0ZXI6IFJvdXRlciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cCgncm91dGVyOm1haW4nKTtcbiAgICBsZXQgdXJsID0gcm91dGVyLnVybEZvcihgJHsgcGx1cmFsaXplKHJlY29yZC50eXBlKSB9L3Nob3dgLCByZWNvcmQpO1xuICAgIHJldHVybiB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHsgc2VsZjogdXJsIH0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbWV0YSBmb3IgYSBwYXJ0aWN1bGFyIHJlY29yZC5cbiAgICovXG4gIHByb3RlY3RlZCBtZXRhRm9yUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiB2b2lkIHwgSnNvbkFwaU1ldGEge1xuICAgIC8vIGRlZmF1bHRzIHRvIG5vIG1ldGFcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWRlbG9hZHMgYSByZWNvcmQgaW50byB0aGUgdG9wIGxldmVsIFwiaW5jbHVkZWRcIiBhcnJheVxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGluY2x1ZGVSZWNvcmQoY29udGV4dDogQ29udGV4dCwgbmFtZTogc3RyaW5nLCByZWxhdGVkUmVjb3JkOiBNb2RlbCwgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWlzQXJyYXkoY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCkpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuaW5jbHVkZWQgPSBbXTtcbiAgICB9XG4gICAgbGV0IHJlbGF0ZWRPcHRpb25zID0gKGNvbnRleHQub3B0aW9ucy5yZWxhdGlvbnNoaXBzICYmIGNvbnRleHQub3B0aW9ucy5yZWxhdGlvbnNoaXBzW25hbWVdKSB8fCBjb250ZXh0Lm9wdGlvbnM7XG4gICAgbGV0IHJlbGF0ZWRTZXJpYWxpemVyOiBKU09OQVBJU2VyaWFsaXplciA9IGNvbmZpZy5zZXJpYWxpemVyIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cChgc2VyaWFsaXplcjokeyByZWxhdGVkUmVjb3JkLnR5cGUgfWApO1xuICAgIGxldCByZWxhdGVkQ29udGV4dDogQ29udGV4dCA9IGFzc2lnbih7fSwgY29udGV4dCwgeyBvcHRpb25zOiByZWxhdGVkT3B0aW9ucyB9KTtcbiAgICBjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkLnB1c2goYXdhaXQgcmVsYXRlZFNlcmlhbGl6ZXIucmVuZGVyUmVjb3JkKGNvbnRleHQsIHJlbGF0ZWRSZWNvcmQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHN1cHBsaWVkIGVycm9yXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVuZGVyRXJyb3IoY29udGV4dDogQ29udGV4dCwgZXJyb3I6IGFueSk6IEpzb25BcGlFcnJvciB7XG4gICAgbGV0IHJlbmRlcmVkRXJyb3IgPSB7XG4gICAgICBpZDogZXJyb3IuaWQsXG4gICAgICBzdGF0dXM6IGVycm9yLnN0YXR1cyB8fCA1MDAsXG4gICAgICBjb2RlOiBlcnJvci5jb2RlIHx8IGVycm9yLm5hbWUgfHwgJ0ludGVybmFsU2VydmVyRXJyb3InLFxuICAgICAgdGl0bGU6IGVycm9yLnRpdGxlLFxuICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlXG4gICAgfTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbmRlcmVkRXJyb3IsICdzb3VyY2UnLCB0aGlzLnNvdXJjZUZvckVycm9yKGNvbnRleHQsIGVycm9yKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZW5kZXJlZEVycm9yLCAnbWV0YScsIHRoaXMubWV0YUZvckVycm9yKGNvbnRleHQsIGVycm9yKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZW5kZXJlZEVycm9yLCAnbGlua3MnLCB0aGlzLmxpbmtzRm9yRXJyb3IoY29udGV4dCwgZXJyb3IpKTtcbiAgICByZXR1cm4gcmVuZGVyZWRFcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBlcnJvciwgcmV0dXJuIGEgSlNPTiBQb2ludGVyLCBhIFVSTCBxdWVyeSBwYXJhbSBuYW1lLCBvciBvdGhlciBpbmZvIGluZGljYXRpbmcgdGhlXG4gICAqIHNvdXJjZSBvZiB0aGUgZXJyb3IuXG4gICAqL1xuICBwcm90ZWN0ZWQgc291cmNlRm9yRXJyb3IoY29udGV4dDogQ29udGV4dCwgZXJyb3I6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVycm9yLnNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIG1ldGEgZm9yIGEgZ2l2ZW4gZXJyb3Igb2JqZWN0LiBZb3UgY291bGQgdXNlIHRoaXMgZm9yIGV4YW1wbGUsIHRvIHJldHVybiBkZWJ1Z1xuICAgKiBpbmZvcm1hdGlvbiBpbiBkZXZlbG9wbWVudCBlbnZpcm9ubWVudHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgbWV0YUZvckVycm9yKGNvbnRleHQ6IENvbnRleHQsIGVycm9yOiBhbnkpOiBKc29uQXBpTWV0YSB8IHZvaWQge1xuICAgIHJldHVybiBlcnJvci5tZXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIGxpbmtzIG9iamVjdCBmb3IgYW4gZXJyb3IuIFlvdSBjb3VsZCB1c2UgdGhpcyB0byBsaW5rIHRvIGEgYnVnIHRyYWNrZXIgcmVwb3J0IG9mIHRoZVxuICAgKiBlcnJvciwgZm9yIGV4YW1wbGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgbGlua3NGb3JFcnJvcihjb250ZXh0OiBDb250ZXh0LCBlcnJvcjogYW55KTogSnNvbkFwaUxpbmtzIHwgdm9pZCB7XG4gICAgLy8gZGVmYXVsdHMgdG8gbm8gbGlua3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZHVwbGljYXRlIGVudHJpZXMgZnJvbSB0aGUgc2lkZWxvYWRlZCBkYXRhLlxuICAgKi9cbiAgcHJvdGVjdGVkIGRlZHVwZUluY2x1ZGVkKGNvbnRleHQ6IENvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoaXNBcnJheShjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkKSkge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCA9IHVuaXFCeShjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkLCAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgcmV0dXJuIGAkeyByZXNvdXJjZS50eXBlIH0vJHsgcmVzb3VyY2UuaWQgfWA7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVW5saWtlIHRoZSBvdGhlciBzZXJpYWxpemVycywgdGhlIGRlZmF1bHQgcGFyc2UgaW1wbGVtZW50YXRpb24gZG9lcyBtb2RpZnkgdGhlIGluY29taW5nXG4gICAqIHBheWxvYWQuIEl0IGNvbnZlcnRzIHRoZSBkZWZhdWx0IGRhc2hlcml6ZWQgYXR0cmlidXRlIG5hbWVzIGludG8gY2FtZWxDYXNlLlxuICAgKlxuICAgKiBUaGUgcGFyc2UgbWV0aG9kIGhlcmUgcmV0YWlucyB0aGUgSlNPTkFQSSBkb2N1bWVudCBzdHJ1Y3R1cmUgKGkuZS4gZGF0YSwgaW5jbHVkZWQsIGxpbmtzLCBtZXRhLFxuICAgKiBldGMpLCBvbmx5IG1vZGlmeWluZyByZXNvdXJjZSBvYmplY3RzIGluIHBsYWNlLlxuICAgKi9cbiAgcHVibGljIHBhcnNlKHBheWxvYWQ6IGFueSwgb3B0aW9ucz86IGFueSk6IGFueSB7XG4gICAgdHJ5IHtcbiAgICAgIGFzc2VydChwYXlsb2FkLmRhdGEsICdJbnZhbGlkIEpTT04tQVBJIGRvY3VtZW50IChtaXNzaW5nIHRvcCBsZXZlbCBgZGF0YWAgb2JqZWN0IC0gc2VlIGh0dHA6Ly9qc29uYXBpLm9yZy9mb3JtYXQvI2RvY3VtZW50LXRvcC1sZXZlbCknKTtcbiAgICAgIGxldCBwYXJzZVJlc291cmNlID0gdGhpcy5fcGFyc2VSZXNvdXJjZS5iaW5kKHRoaXMpO1xuICAgICAgaWYgKHBheWxvYWQuZGF0YSkge1xuICAgICAgICBpZiAoIWlzQXJyYXkocGF5bG9hZC5kYXRhKSkge1xuICAgICAgICAgIHBheWxvYWQuZGF0YSA9IHBhcnNlUmVzb3VyY2UocGF5bG9hZC5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXlsb2FkLmRhdGEgPSBwYXlsb2FkLmRhdGEubWFwKHBhcnNlUmVzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGF5bG9hZC5pbmNsdWRlZCkge1xuICAgICAgICBwYXlsb2FkLmluY2x1ZGVkID0gcGF5bG9hZC5pbmNsdWRlZC5tYXAocGFyc2VSZXNvdXJjZSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSA9PT0gJ0Fzc2VydGlvbkVycm9yJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3JzLkJhZFJlcXVlc3QoZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHJldHVybiBwYXlsb2FkO1xuICB9XG5cblxuICAvKipcbiAgICogVGFrZXMgYSBKU09OLUFQSSByZXNvdXJjZSBvYmplY3QgYW5kIGhhbmRzIGl0IG9mZiBmb3IgcGFyc2luZyB0byB0aGUgc2VyaWFsaXplciBzcGVjaWZpYyB0b1xuICAgKiB0aGF0IG9iamVjdCdzIHR5cGUuXG4gICAqL1xuICBwcml2YXRlIF9wYXJzZVJlc291cmNlKHJlc291cmNlOiBKc29uQXBpUmVzb3VyY2VPYmplY3QpOiBhbnkge1xuICAgIGFzc2VydCh0eXBlb2YgcmVzb3VyY2UudHlwZSA9PT0gJ3N0cmluZycsICdJbnZhbGlkIHJlc291cmNlIG9iamVjdCBlbmNvdW50ZXJlZCAobWlzc2luZyBgdHlwZWAgLSBzZWUgaHR0cDovL2pzb25hcGkub3JnL2Zvcm1hdC8jZG9jdW1lbnQtcmVzb3VyY2Utb2JqZWN0LWlkZW50aWZpY2F0aW9uKScpO1xuICAgIHJlc291cmNlLnR5cGUgPSB0aGlzLnBhcnNlVHlwZShyZXNvdXJjZS50eXBlKTtcbiAgICBsZXQgcmVsYXRlZFNlcmlhbGl6ZXI6IEpTT05BUElTZXJpYWxpemVyID0gdGhpcy5jb250YWluZXIubG9va3VwKGBzZXJpYWxpemVyOiR7IHJlc291cmNlLnR5cGUgfWApO1xuICAgIGFzc2VydChyZWxhdGVkU2VyaWFsaXplciwgYE5vIHNlcmlhbGl6ZXIgZm91bmQgZm9yICR7IHJlc291cmNlLnR5cGUgfWApO1xuICAgIGFzc2VydChyZWxhdGVkU2VyaWFsaXplci5wYXJzZVJlc291cmNlLCBgVGhlIHNlcmlhbGl6ZXIgZm91bmQgZm9yICR7IHJlc291cmNlLnR5cGUgfSBkb2VzIG5vdCBpbXBsZW1lbnQgdGhlIC5wYXJzZVJlc291cmNlKCkgbWV0aG9kLiBBcmUgeW91IHRyeWluZyB0byBwYXJzZSBhIG1vZGVsIHdob3NlIGRlZmF1bHQgc2VyaWFsaXplciBpcyBub3QgSlNPTi1BUEk/YCk7XG4gICAgcmV0dXJuIHJlbGF0ZWRTZXJpYWxpemVyLnBhcnNlUmVzb3VyY2UocmVzb3VyY2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgc2luZ2xlIHJlc291cmNlIG9iamVjdCBmcm9tIGEgSlNPTkFQSSBkb2N1bWVudC4gVGhlIHJlc291cmNlIG9iamVjdCBjb3VsZCBjb21lIGZyb20gdGhlXG4gICAqIHRvcCBsZXZlbCBgZGF0YWAgcGF5bG9hZCwgb3IgZnJvbSB0aGUgc2lkZWxvYWRlZCBgaW5jbHVkZWRgIHJlY29yZHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VSZXNvdXJjZShyZXNvdXJjZTogSnNvbkFwaVJlc291cmNlT2JqZWN0KTogYW55IHtcbiAgICBzZXRJZk5vdEVtcHR5KHJlc291cmNlLCAnaWQnLCB0aGlzLnBhcnNlSWQocmVzb3VyY2UuaWQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlc291cmNlLCAnYXR0cmlidXRlcycsIHRoaXMucGFyc2VBdHRyaWJ1dGVzKHJlc291cmNlLmF0dHJpYnV0ZXMpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlc291cmNlLCAncmVsYXRpb25zaGlwcycsIHRoaXMucGFyc2VSZWxhdGlvbnNoaXBzKHJlc291cmNlLnJlbGF0aW9uc2hpcHMpKTtcbiAgICByZXR1cm4gcmVzb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSByZXNvdXJjZSBvYmplY3QgaWRcbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZUlkKGlkOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHJlc291cmNlIG9iamVjdCdzIHR5cGUgc3RyaW5nXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VUeXBlKHR5cGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNpbmd1bGFyaXplKHR5cGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgcmVzb3VyY2Ugb2JqZWN0J3MgYXR0cmlidXRlcy4gQnkgZGVmYXVsdCwgdGhpcyBjb252ZXJ0cyBmcm9tIHRoZSBKU09OQVBJIHJlY29tbWVuZGVkXG4gICAqIGRhc2hlcmllZCBrZXlzIHRvIGNhbWVsQ2FzZS5cbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZUF0dHJpYnV0ZXMoYXR0cnM6IEpzb25BcGlBdHRyaWJ1dGVzKTogYW55IHtcbiAgICByZXR1cm4gbWFwS2V5cyhhdHRycywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIHJldHVybiBjYW1lbENhc2Uoa2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHJlc291cmNlIG9iamVjdCdzIHJlbGF0aW9uc2hpcHMuIEJ5IGRlZmF1bHQsIHRoaXMgY29udmVydHMgZnJvbSB0aGUgSlNPTkFQSSByZWNvbW1lbmRlZFxuICAgKiBkYXNoZXJpZWQga2V5cyB0byBjYW1lbENhc2UuXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VSZWxhdGlvbnNoaXBzKHJlbGF0aW9uc2hpcHM6IEpzb25BcGlSZWxhdGlvbnNoaXBzKTogYW55IHtcbiAgICByZXR1cm4gbWFwS2V5cyhyZWxhdGlvbnNoaXBzLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgcmV0dXJuIGNhbWVsQ2FzZShrZXkpO1xuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==