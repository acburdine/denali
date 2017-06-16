"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const assert = require("assert");
const path = require("path");
const inflection_1 = require("inflection");
const serializer_1 = require("./serializer");
const bluebird_1 = require("bluebird");
const set_if_not_empty_1 = require("../utils/set-if-not-empty");
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
    serialize(action, body, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let context = {
                action,
                body,
                options,
                document: {}
            };
            yield this.renderPrimary(context);
            yield this.renderIncluded(context);
            this.renderMeta(context);
            this.renderLinks(context);
            this.renderVersion(context);
            this.dedupeIncluded(context);
            return context.document;
        });
    }
    /**
     * Render the primary payload for a JSONAPI document (either a model or array of models).
     */
    renderPrimary(context) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let payload = context.body;
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
            set_if_not_empty_1.default(serializedRecord, 'attributes', this.attributesForRecord(context, record));
            set_if_not_empty_1.default(serializedRecord, 'relationships', yield this.relationshipsForRecord(context, record));
            set_if_not_empty_1.default(serializedRecord, 'links', this.linksForRecord(context, record));
            set_if_not_empty_1.default(serializedRecord, 'meta', this.metaForRecord(context, record));
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
            set_if_not_empty_1.default(relationship, 'links', this.linksForRelationship(context, name, config, descriptor, record));
            set_if_not_empty_1.default(relationship, 'meta', this.metaForRelationship(context, name, config, descriptor, record));
            set_if_not_empty_1.default(relationship, 'data', yield this.dataForRelationship(context, name, config, descriptor, record));
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
        let router = this.container.lookup('app:router');
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
            context.document.included.push(yield relatedSerializer.renderRecord(relatedContext, relatedRecord));
        });
    }
    /**
     * Render the supplied error
     */
    renderError(context, error) {
        let renderedError = {
            status: error.status || 500,
            code: error.code || error.name || 'InternalServerError',
            detail: error.message
        };
        set_if_not_empty_1.default(renderedError, 'id', this.idForError(context, error));
        set_if_not_empty_1.default(renderedError, 'title', this.titleForError(context, error));
        set_if_not_empty_1.default(renderedError, 'source', this.sourceForError(context, error));
        set_if_not_empty_1.default(renderedError, 'meta', this.metaForError(context, error));
        set_if_not_empty_1.default(renderedError, 'links', this.linksForError(context, error));
        return renderedError;
    }
    /**
     * Given an error, return a unique id for this particular occurence of the problem.
     */
    idForError(context, error) {
        return error.id;
    }
    /**
     * A short, human-readable summary of the problem that SHOULD NOT change from occurrence to
     * occurrence of the problem, except for purposes of localization.
     */
    titleForError(context, error) {
        return error.title;
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
}
exports.default = JSONAPISerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGkuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL3JlbmRlci9qc29uLWFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FNZ0I7QUFDaEIsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3QiwyQ0FBdUM7QUFDdkMsNkNBQXNDO0FBTXRDLHVDQUErQjtBQUMvQixnRUFBc0Q7QUF5SnREOzs7OztHQUtHO0FBQ0gsdUJBQWdELFNBQVEsb0JBQVU7SUFBbEU7O1FBRUU7O1dBRUc7UUFDSCxnQkFBVyxHQUFHLDBCQUEwQixDQUFDO0lBc1YzQyxDQUFDO0lBcFZDOzs7T0FHRztJQUNHLFNBQVMsQ0FBQyxNQUFjLEVBQUUsSUFBUyxFQUFFLE9BQXNCOztZQUMvRCxJQUFJLE9BQU8sR0FBWTtnQkFDckIsTUFBTTtnQkFDTixJQUFJO2dCQUNKLE9BQU87Z0JBQ1AsUUFBUSxFQUFFLEVBQUU7YUFDYixDQUFDO1lBQ0YsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQzFCLENBQUM7S0FBQTtJQUVEOztPQUVHO0lBQ2EsYUFBYSxDQUFDLE9BQWdCOztZQUM1QyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQzNCLEVBQUUsQ0FBQyxDQUFDLGdCQUFPLENBQUMsT0FBTyxDQUFD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QUN0QixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sWUFBWSxDQUFDLE9BQWdCLEVBQUUsS0FBVTtRQUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sYUFBYSxDQUFDLE9BQWdCLEVBQUUsS0FBVTtRQUNsRCx1QkFBdUI7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ08sY0FBYyxDQUFDLE9BQWdCO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLGdCQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsZUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUTtnQkFDckUsTUFBTSxDQUFDLEdBQUksUUFBUSxDQUFDLElBQUssSUFBSyxRQUFRLENBQUMsRUFBRyxFQUFFLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztDQUdGO0FBM1ZELG9DQTJWQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFzc2lnbixcbiAgaXNBcnJheSxcbiAgaXNVbmRlZmluZWQsXG4gIGtlYmFiQ2FzZSxcbiAgdW5pcUJ5XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBwbHVyYWxpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vZGF0YS9tb2RlbCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJy4uL3J1bnRpbWUvcm91dGVyJztcbmltcG9ydCBBY3Rpb24sIHsgUmVuZGVyT3B0aW9ucyB9IGZyb20gJy4uL3J1bnRpbWUvYWN0aW9uJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgfSBmcm9tICcuLi9kYXRhL2Rlc2NyaXB0b3JzJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcENvbmZpZyB9IGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgc2V0SWZOb3RFbXB0eSBmcm9tICcuLi91dGlscy9zZXQtaWYtbm90LWVtcHR5JztcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgdGhlIHZhbHVlIGlzIG9ubHkgc2V0IGlmIGl0IGV4aXN0cywgc28gd2UgYXZvaWQgY3JlYXRpbmcgaXRlcmFibGUga2V5cyBvbiBvYmogZm9yXG4gKiB1bmRlZmluZWQgdmFsdWVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlEb2N1bWVudCB7XG4gIGRhdGE/OiBKc29uQXBpUmVzb3VyY2VPYmplY3QgfCBKc29uQXBpUmVzb3VyY2VPYmplY3RbXSB8IEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXIgfCBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyW107XG4gIGVycm9ycz86IEpzb25BcGlFcnJvcltdO1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG4gIGpzb25hcGk/OiB7IHZlcnNpb246IHN0cmluZyB9O1xuICBsaW5rcz86IEpzb25BcGlMaW5rcztcbiAgaW5jbHVkZWQ/OiBKc29uQXBpUmVzb3VyY2VPYmplY3RbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpRXJyb3Ige1xuICAvKipcbiAgICogQSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyBwYXJ0aWN1bGFyIG9jY3VycmVuY2Ugb2YgdGhlIHByb2JsZW1cbiAgICovXG4gIGlkPzogc3RyaW5nO1xuICBsaW5rcz86IHtcbiAgICAvKipcbiAgICAgKiBBIGxpbmsgdGhhdCBsZWFkcyB0byBmdXJ0aGVyIGRldGFpbHMgYWJvdXQgdGhpcyBwYXJ0aWN1bGFyIG9jY3VycmVuY2Ugb2YgdGhlIHByb2JsZW1BXG4gICAgICovXG4gICAgYWJvdXQ/OiBKc29uQXBpTGluaztcbiAgfTtcbiAgLyoqXG4gICAqIFRoZSBIVFRQIHN0YXR1cyBjb2RlIGFwcGxpY2FibGUgdG8gdGhpcyBwcm9ibGVtLCBleHByZXNzZWQgYXMgYSBzdHJpbmcgdmFsdWVcbiAgICovXG4gIHN0YXR1cz86IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIGFwcGxpY2F0aW9uLXNwZWNpZmljIGVycm9yIGNvZGUsIGV4cHJlc3NlZCBhcyBhIHN0cmluZyB2YWx1ZVxuICAgKi9cbiAgY29kZT86IHN0cmluZztcbiAgLyoqXG4gICAqIEEgc2hvcnQsIGh1bWFuLXJlYWRhYmxlIHN1bW1hcnkgb2YgdGhlIHByb2JsZW0gdGhhdCBTSE9VTEQgTk9UIGNoYW5nZSBmcm9tIG9jY3VycmVuY2UgdG9cbiAgICogb2NjdXJyZW5jZSBvZiB0aGUgcHJvYmxlbSwgZXhjZXB0IGZvciBwdXJwb3NlcyBvZiBsb2NhbGl6YXRpb25cbiAgICovXG4gIHRpdGxlPzogc3RyaW5nO1xuICAvKipcbiAgICogQSBodW1hbi1yZWFkYWJsZSBleHBsYW5hdGlvbiBzcGVjaWZpYyB0byB0aGlzIG9jY3VycmVuY2Ugb2YgdGhlIHByb2JsZW0uIExpa2UgdGl0bGUsIHRoaXNcbiAgICogZmllbGTigJlzIHZhbHVlIGNhbiBiZSBsb2NhbGl6ZWRcbiAgICovXG4gIGRldGFpbD86IHN0cmluZztcbiAgLyoqXG4gICAqIEFuIG9iamVjdCBjb250YWluaW5nIHJlZmVyZW5jZXMgdG8gdGhlIHNvdXJjZSBvZiB0aGUgZXJyb3JcbiAgICovXG4gIHNvdXJjZT86IHtcbiAgICAvKipcbiAgICAgKiBBIEpTT04gUG9pbnRlciBbUkZDNjkwMV0gdG8gdGhlIGFzc29jaWF0ZWQgZW50aXR5IGluIHRoZSByZXF1ZXN0IGRvY3VtZW50IFtlLmcuIFwiL2RhdGFcIiBmb3IgYVxuICAgICAqIHByaW1hcnkgZGF0YSBvYmplY3QsIG9yIFwiL2RhdGEvYXR0cmlidXRlcy90aXRsZVwiIGZvciBhIHNwZWNpZmljIGF0dHJpYnV0ZV1cbiAgICAgKi9cbiAgICBwb2ludGVyPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIEEgc3RyaW5nIGluZGljYXRpbmcgd2hpY2ggVVJJIHF1ZXJ5IHBhcmFtZXRlciBjYXVzZWQgdGhlIGVycm9yXG4gICAgICovXG4gICAgcGFyYW1ldGVyPzogc3RyaW5nO1xuICB9O1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaVJlc291cmNlT2JqZWN0IHtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuICBhdHRyaWJ1dGVzPzogSnNvbkFwaUF0dHJpYnV0ZXM7XG4gIHJlbGF0aW9uc2hpcHM/OiBKc29uQXBpUmVsYXRpb25zaGlwcztcbiAgbGlua3M/OiBKc29uQXBpTGlua3M7XG4gIG1ldGE/OiBKc29uQXBpTWV0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpQXR0cmlidXRlcyB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpUmVsYXRpb25zaGlwcyB7XG4gIFtyZWxhdGlvbnNoaXBOYW1lOiBzdHJpbmddOiBKc29uQXBpUmVsYXRpb25zaGlwO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcGlSZWxhdGlvbnNoaXAge1xuICAvKipcbiAgICogTGlua3MgZm9yIHRoaXMgcmVsYXRpb25zaGlwLiBTaG91bGQgY29udGFpbiBhdCBsZWFzdCBhIFwic2VsZlwiIG9yIFwicmVsYXRlZFwiIGxpbmsuXG4gICAqL1xuICBsaW5rcz86IEpzb25BcGlMaW5rcztcbiAgZGF0YT86IEpzb25BcGlSZWxhdGlvbnNoaXBEYXRhO1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25BcGlSZWxhdGlvbnNoaXBEYXRhID0gSnNvbkFwaVJlc291cmNlSWRlbnRpZmllciB8IEpzb25BcGlSZXNvdXJjZUlkZW50aWZpZXJbXTtcblxuZXhwb3J0IGludGVyZmFjZSBKc29uQXBpUmVzb3VyY2VJZGVudGlmaWVyIHtcbiAgaWQ6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaU1ldGEge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFwaUxpbmtzIHtcbiAgLyoqXG4gICAqIEEgbGluayBmb3IgdGhlIHJlc291cmNlIG9yIHJlbGF0aW9uc2hpcCBpdHNlbGYuIFRoaXMgbGluayBhbGxvd3MgdGhlIGNsaWVudCB0byBkaXJlY3RseVxuICAgKiBtYW5pcHVsYXRlIHRoZSByZXNvdXJjZSBvciByZWxhdGlvbnNoaXAuIEZvciBleGFtcGxlLCByZW1vdmluZyBhbiBhdXRob3IgdGhyb3VnaCBhbiBhcnRpY2xl4oCZc1xuICAgKiByZWxhdGlvbnNoaXAgVVJMIHdvdWxkIGRpc2Nvbm5lY3QgdGhlIHBlcnNvbiBmcm9tIHRoZSBhcnRpY2xlIHdpdGhvdXQgZGVsZXRpbmcgdGhlIHBlb3BsZVxuICAgKiByZXNvdXJjZSBpdHNlbGYuIFdoZW4gZmV0Y2hlZCBzdWNjZXNzZnVsbHksIHRoaXMgbGluayByZXR1cm5zIHRoZSBsaW5rYWdlIGZvciB0aGUgcmVsYXRlZFxuICAgKiByZXNvdXJjZXMgYXMgaXRzIHByaW1hcnkgZGF0YVxuICAgKi9cbiAgc2VsZj86IEpzb25BcGlMaW5rO1xuICAvKipcbiAgICogQSDigJxyZWxhdGVkIHJlc291cmNlIGxpbmvigJ0gcHJvdmlkZXMgYWNjZXNzIHRvIHJlc291cmNlIG9iamVjdHMgbGlua2VkIGluIGEgcmVsYXRpb25zaGlwLiBXaGVuXG4gICAqIGZldGNoZWQsIHRoZSByZWxhdGVkIHJlc291cmNlIG9iamVjdChzKSBhcmUgcmV0dXJuZWQgYXMgdGhlIHJlc3BvbnNl4oCZcyBwcmltYXJ5IGRhdGEuXG4gICAqL1xuICByZWxhdGVkPzogSnNvbkFwaUxpbms7XG4gIFtrZXk6IHN0cmluZ106IEpzb25BcGlMaW5rO1xufVxuXG5leHBvcnQgdHlwZSBKc29uQXBpTGluayA9IHN0cmluZyB8IHtcbiAgaHJlZjogc3RyaW5nLFxuICBtZXRhOiBKc29uQXBpTWV0YVxufTtcblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIE1vZGVscyB5b3Ugd2FudCB0byBlbnN1cmUgYXJlIGluY2x1ZGVkIGluIHRoZSBcImluY2x1ZGVkXCIgc2lkZWxvYWQuIE5vdGUgdGhhdCB0aGVcbiAgICogc3BlYyByZXF1aXJlcyBcImZ1bGwtbGlua2FnZVwiIC0gaS5lLiBhbnkgTW9kZWxzIHlvdSBpbmNsdWRlIGhlcmUgbXVzdCBiZSByZWZlcmVuY2VkIGJ5IGFcbiAgICogcmVzb3VyY2UgaWRlbnRpZmllciBlbHNld2hlcmUgaW4gdGhlIHBheWxvYWQgLSB0byBtYWludGFpbiBmdWxsIGNvbXBsaWFuY2UuXG4gICAqL1xuICBpbmNsdWRlZD86IE1vZGVsW107XG4gIC8qKlxuICAgKiBBbnkgdG9wIGxldmVsIG1ldGFkYXRhIHRvIHNlbmQgd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAqL1xuICBtZXRhPzogSnNvbkFwaU1ldGE7XG4gIC8qKlxuICAgKiBBbnkgdG9wIGxldmVsIGxpbmtzIHRvIHNlbmQgd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAqL1xuICBsaW5rcz86IEpzb25BcGlMaW5rcztcbiAgLyoqXG4gICAqIENvbmZpZ3VyYXRpb24gZm9yIGVhY2ggcmVsYXRpb25zaGlwLlxuICAgKi9cbiAgcmVsYXRpb25zaGlwcz86IGFueTtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG4vKipcbiAqIFVzZWQgaW50ZXJuYWxseSB0byBzaW1wbGlmeSBwYXNzaW5nIGFyZ3VtZW50cyByZXF1aXJlZCBieSBhbGwgZnVuY3Rpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHQge1xuICBhY3Rpb246IEFjdGlvbjtcbiAgYm9keTogYW55O1xuICBvcHRpb25zOiBPcHRpb25zO1xuICBkb2N1bWVudDogSnNvbkFwaURvY3VtZW50O1xufVxuXG4vKipcbiAqIFJlbmRlcnMgdGhlIHBheWxvYWQgYWNjb3JkaW5nIHRvIHRoZSBKU09OQVBJIDEuMCBzcGVjLCBpbmNsdWRpbmcgcmVsYXRlZCByZXNvdXJjZXMsIGluY2x1ZGVkXG4gKiByZWNvcmRzLCBhbmQgc3VwcG9ydCBmb3IgbWV0YSBhbmQgbGlua3MuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBKU09OQVBJU2VyaWFsaXplciBleHRlbmRzIFNlcmlhbGl6ZXIge1xuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBjb250ZW50IHR5cGUgdG8gdXNlIGZvciBhbnkgcmVzcG9uc2VzIHJlbmRlcmVkIGJ5IHRoaXMgc2VyaWFsaXplci5cbiAgICovXG4gIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL3ZuZC5hcGkranNvbic7XG5cbiAgLyoqXG4gICAqIFRha2UgYSByZXNwb25zZSBib2R5IChhIG1vZGVsLCBhbiBhcnJheSBvZiBtb2RlbHMsIG9yIGFuIEVycm9yKSBhbmQgcmVuZGVyIGl0IGFzIGEgSlNPTkFQSVxuICAgKiBjb21wbGlhbnQgZG9jdW1lbnRcbiAgICovXG4gIGFzeW5jIHNlcmlhbGl6ZShhY3Rpb246IEFjdGlvbiwgYm9keTogYW55LCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKTogUHJvbWlzZTxKc29uQXBpRG9jdW1lbnQ+IHtcbiAgICBsZXQgY29udGV4dDogQ29udGV4dCA9IHtcbiAgICAgIGFjdGlvbixcbiAgICAgIGJvZHksXG4gICAgICBvcHRpb25zLFxuICAgICAgZG9jdW1lbnQ6IHt9XG4gICAgfTtcbiAgICBhd2FpdCB0aGlzLnJlbmRlclByaW1hcnkoY29udGV4dCk7XG4gICAgYXdhaXQgdGhpcy5yZW5kZXJJbmNsdWRlZChjb250ZXh0KTtcbiAgICB0aGlzLnJlbmRlck1ldGEoY29udGV4dCk7XG4gICAgdGhpcy5yZW5kZXJMaW5rcyhjb250ZXh0KTtcbiAgICB0aGlzLnJlbmRlclZlcnNpb24oY29udGV4dCk7XG4gICAgdGhpcy5kZWR1cGVJbmNsdWRlZChjb250ZXh0KTtcbiAgICByZXR1cm4gY29udGV4dC5kb2N1bWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHByaW1hcnkgcGF5bG9hZCBmb3IgYSBKU09OQVBJIGRvY3VtZW50IChlaXRoZXIgYSBtb2RlbCBvciBhcnJheSBvZiBtb2RlbHMpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJlbmRlclByaW1hcnkoY29udGV4dDogQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBwYXlsb2FkID0gY29udGV4dC5ib2R5O1xuICAgIGlmIChpc0FycmF5KHBheWxvYWQpKSB7XG4gICAgICBhd2FpdCB0aGlzLnJlbmRlclByaW1hcnlBcnJheShjb250ZXh0LCBwYXlsb2FkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy5yZW5kZXJQcmltYXJ5T2JqZWN0KGNvbnRleHQsIHBheWxvYWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHByaW1hcnkgZGF0YSBmb3IgdGhlIGRvY3VtZW50LCBlaXRoZXIgYSBzaW5nbGUgTW9kZWwgb3IgYSBzaW5nbGUgRXJyb3IuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVyUHJpbWFyeU9iamVjdChjb250ZXh0OiBDb250ZXh0LCBwYXlsb2FkOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAocGF5bG9hZCBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmVycm9ycyA9IFsgYXdhaXQgdGhpcy5yZW5kZXJFcnJvcihjb250ZXh0LCBwYXlsb2FkKSBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmRhdGEgPSBhd2FpdCB0aGlzLnJlbmRlclJlY29yZChjb250ZXh0LCBwYXlsb2FkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBwcmltYXJ5IGRhdGEgZm9yIHRoZSBkb2N1bWVudCwgZWl0aGVyIGFuIGFycmF5IG9mIE1vZGVscyBvciBFcnJvcnNcbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyByZW5kZXJQcmltYXJ5QXJyYXkoY29udGV4dDogQ29udGV4dCwgcGF5bG9hZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHBheWxvYWRbMF0gaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5lcnJvcnMgPSBhd2FpdCBtYXAocGF5bG9hZCwgYXN5bmMgKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgICBhc3NlcnQoZXJyb3IgaW5zdGFuY2VvZiBFcnJvciwgJ1lvdSBwYXNzZWQgYSBtaXhlZCBhcnJheSBvZiBlcnJvcnMgYW5kIG1vZGVscyB0byB0aGUgSlNPTi1BUEkgc2VyaWFsaXplci4gVGhlIEpTT04tQVBJIHNwZWMgZG9lcyBub3QgYWxsb3cgZm9yIGJvdGggYGRhdGFgIGFuZCBgZXJyb3JzYCB0b3AgbGV2ZWwgb2JqZWN0cyBpbiBhIHJlc3BvbnNlJyk7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbmRlckVycm9yKGNvbnRleHQsIGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmRvY3VtZW50LmRhdGEgPSBhd2FpdCBtYXAocGF5bG9hZCwgYXN5bmMgKHJlY29yZDogTW9kZWwpID0+IHtcbiAgICAgICAgYXNzZXJ0KCEocmVjb3JkIGluc3RhbmNlb2YgRXJyb3IpLCAnWW91IHBhc3NlZCBhIG1peGVkIGFycmF5IG9mIGVycm9ycyBhbmQgbW9kZWxzIHRvIHRoZSBKU09OLUFQSSBzZXJpYWxpemVyLiBUaGUgSlNPTi1BUEkgc3BlYyBkb2VzIG5vdCBhbGxvdyBmb3IgYm90aCBgZGF0YWAgYW5kIGBlcnJvcnNgIHRvcCBsZXZlbCBvYmplY3RzIGluIGEgcmVzcG9uc2UnKTtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVuZGVyUmVjb3JkKGNvbnRleHQsIHJlY29yZCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGFueSBpbmNsdWRlZCByZWNvcmRzIHN1cHBsaWVkIGJ5IHRoZSBvcHRpb25zIGludG8gdGhlIHRvcCBsZXZlbCBvZiB0aGUgZG9jdW1lbnRcbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyByZW5kZXJJbmNsdWRlZChjb250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGNvbnRleHQub3B0aW9ucy5pbmNsdWRlZCkge1xuICAgICAgYXNzZXJ0KGlzQXJyYXkoY29udGV4dC5vcHRpb25zLmluY2x1ZGVkKSwgJ2luY2x1ZGVkIHJlY29yZHMgbXVzdCBiZSBwYXNzZWQgaW4gYXMgYW4gYXJyYXknKTtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuaW5jbHVkZWQgPSBhd2FpdCBtYXAoY29udGV4dC5vcHRpb25zLmluY2x1ZGVkLCBhc3luYyAoaW5jbHVkZWRSZWNvcmQpID0+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVuZGVyUmVjb3JkKGNvbnRleHQsIGluY2x1ZGVkUmVjb3JkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdG9wIGxldmVsIG1ldGEgb2JqZWN0IGZvciBhIGRvY3VtZW50LiBEZWZhdWx0IHVzZXMgbWV0YSBzdXBwbGllZCBpbiBvcHRpb25zIGNhbGwgdG9cbiAgICogcmVzLnJlbmRlcigpLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlbmRlck1ldGEoY29udGV4dDogQ29udGV4dCk6IHZvaWQge1xuICAgIGlmIChjb250ZXh0Lm9wdGlvbnMubWV0YSkge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5tZXRhID0gY29udGV4dC5vcHRpb25zLm1ldGE7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0b3AgbGV2ZWwgbGlua3Mgb2JqZWN0IGZvciBhIGRvY3VtZW50LiBEZWZhdWx0cyB0byB0aGUgbGlua3Mgc3VwcGxpZWQgaW4gb3B0aW9ucy5cbiAgICovXG4gIHByb3RlY3RlZCByZW5kZXJMaW5rcyhjb250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG4gICAgaWYgKGNvbnRleHQub3B0aW9ucy5saW5rcykge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5saW5rcyA9IGNvbnRleHQub3B0aW9ucy5saW5rcztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSB2ZXJzaW9uIG9mIEpTT05BUEkgc3VwcG9ydGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlbmRlclZlcnNpb24oY29udGV4dDogQ29udGV4dCk6IHZvaWQge1xuICAgIGNvbnRleHQuZG9jdW1lbnQuanNvbmFwaSA9IHtcbiAgICAgIHZlcnNpb246ICcxLjAnXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHN1cHBsaWVkIHJlY29yZCBhcyBhIHJlc291cmNlIG9iamVjdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyByZW5kZXJSZWNvcmQoY29udGV4dDogQ29udGV4dCwgcmVjb3JkOiBNb2RlbCk6IFByb21pc2U8SnNvbkFwaVJlc291cmNlT2JqZWN0PiB7XG4gICAgYXNzZXJ0KHJlY29yZCwgYENhbm5vdCBzZXJpYWxpemUgJHsgcmVjb3JkIH0uIFlvdSBzdXBwbGllZCAkeyByZWNvcmQgfSBpbnN0ZWFkIG9mIGEgTW9kZWwgaW5zdGFuY2UuYCk7XG4gICAgbGV0IHNlcmlhbGl6ZWRSZWNvcmQ6IEpzb25BcGlSZXNvdXJjZU9iamVjdCA9IHtcbiAgICAgIHR5cGU6IHBsdXJhbGl6ZShyZWNvcmQudHlwZSksXG4gICAgICBpZDogcmVjb3JkLmlkXG4gICAgfTtcbiAgICBhc3NlcnQoc2VyaWFsaXplZFJlY29yZC5pZCAhPSBudWxsLCBgQXR0ZW1wdGVkIHRvIHNlcmlhbGl6ZSBhIHJlY29yZCAoJHsgcmVjb3JkIH0pIHdpdGhvdXQgYW4gaWQsIGJ1dCB0aGUgSlNPTi1BUEkgc3BlYyByZXF1aXJlcyBhbGwgcmVzb3VyY2VzIHRvIGhhdmUgYW4gaWQuYCk7XG4gICAgc2V0SWZOb3RFbXB0eShzZXJpYWxpemVkUmVjb3JkLCAnYXR0cmlidXRlcycsIHRoaXMuYXR0cmlidXRlc0ZvclJlY29yZChjb250ZXh0LCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHNlcmlhbGl6ZWRSZWNvcmQsICdyZWxhdGlvbnNoaXBzJywgYXdhaXQgdGhpcy5yZWxhdGlvbnNoaXBzRm9yUmVjb3JkKGNvbnRleHQsIHJlY29yZCkpO1xuICAgIHNldElmTm90RW1wdHkoc2VyaWFsaXplZFJlY29yZCwgJ2xpbmtzJywgdGhpcy5saW5rc0ZvclJlY29yZChjb250ZXh0LCByZWNvcmQpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHNlcmlhbGl6ZWRSZWNvcmQsICdtZXRhJywgdGhpcy5tZXRhRm9yUmVjb3JkKGNvbnRleHQsIHJlY29yZCkpO1xuICAgIHJldHVybiBzZXJpYWxpemVkUmVjb3JkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEpTT05BUEkgYXR0cmlidXRlcyBvYmplY3QgcmVwcmVzZW50aW5nIHRoaXMgcmVjb3JkJ3MgcmVsYXRpb25zaGlwc1xuICAgKi9cbiAgcHJvdGVjdGVkIGF0dHJpYnV0ZXNGb3JSZWNvcmQoY29udGV4dDogQ29udGV4dCwgcmVjb3JkOiBNb2RlbCk6IEpzb25BcGlBdHRyaWJ1dGVzIHtcbiAgICBsZXQgc2VyaWFsaXplZEF0dHJpYnV0ZXM6IEpzb25BcGlBdHRyaWJ1dGVzID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgIGxldCBrZXkgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZU5hbWUoY29udGV4dCwgYXR0cmlidXRlTmFtZSk7XG4gICAgICBsZXQgcmF3VmFsdWUgPSByZWNvcmRbYXR0cmlidXRlTmFtZV07XG4gICAgICBpZiAoIWlzVW5kZWZpbmVkKHJhd1ZhbHVlKSkge1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZVZhbHVlKGNvbnRleHQsIHJhd1ZhbHVlLCBrZXksIHJlY29yZCk7XG4gICAgICAgIHNlcmlhbGl6ZWRBdHRyaWJ1dGVzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2VyaWFsaXplZEF0dHJpYnV0ZXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIEpTT05BUEkgc3BlYyByZWNvbW1lbmRzIChidXQgZG9lcyBub3QgcmVxdWlyZSkgdGhhdCBwcm9wZXJ0eSBuYW1lcyBiZSBkYXNoZXJpemVkLiBUaGVcbiAgICogZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIHNlcmlhbGl6ZXIgdGhlcmVmb3JlIGRvZXMgdGhhdCwgYnV0IHlvdSBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2RcbiAgICogdG8gdXNlIGEgZGlmZmVyZW50IGFwcHJvYWNoLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZUF0dHJpYnV0ZU5hbWUoY29udGV4dDogQ29udGV4dCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2ViYWJDYXNlKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYW4gYXR0cmlidXRlIHZhbHVlIGFuZCByZXR1cm4gdGhlIHNlcmlhbGl6ZWQgdmFsdWUuIFVzZWZ1bCBmb3IgY2hhbmdpbmcgaG93IGNlcnRhaW4gdHlwZXNcbiAgICogb2YgdmFsdWVzIGFyZSBzZXJpYWxpemVkLCBpLmUuIERhdGUgb2JqZWN0cy5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gcmV0dXJucyB0aGUgYXR0cmlidXRlJ3MgdmFsdWUgdW5jaGFuZ2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZUF0dHJpYnV0ZVZhbHVlKGNvbnRleHQ6IENvbnRleHQsIHZhbHVlOiBhbnksIGtleTogc3RyaW5nLCByZWNvcmQ6IE1vZGVsKTogYW55IHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgSlNPTkFQSSByZWxhdGlvbnNoaXBzIG9iamVjdCByZXByZXNlbnRpbmcgdGhpcyByZWNvcmQncyByZWxhdGlvbnNoaXBzXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVsYXRpb25zaGlwc0ZvclJlY29yZChjb250ZXh0OiBDb250ZXh0LCByZWNvcmQ6IE1vZGVsKTogUHJvbWlzZTxKc29uQXBpUmVsYXRpb25zaGlwcz4ge1xuICAgIGxldCBzZXJpYWxpemVkUmVsYXRpb25zaGlwczogSnNvbkFwaVJlbGF0aW9uc2hpcHMgPSB7fTtcblxuICAgIC8vIFRoZSByZXN1bHQgb2YgdGhpcy5yZWxhdGlvbnNoaXBzIGlzIGEgd2hpdGVsaXN0IG9mIHdoaWNoIHJlbGF0aW9uc2hpcHMgc2hvdWxkIGJlIHNlcmlhbGl6ZWQsXG4gICAgLy8gYW5kIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGVpciBzZXJpYWxpemF0aW9uXG4gICAgbGV0IHJlbGF0aW9uc2hpcE5hbWVzID0gT2JqZWN0LmtleXModGhpcy5yZWxhdGlvbnNoaXBzKTtcbiAgICBmb3IgKGxldCBuYW1lIG9mIHJlbGF0aW9uc2hpcE5hbWVzKSB7XG4gICAgICBsZXQgY29uZmlnID0gdGhpcy5yZWxhdGlvbnNoaXBzW25hbWVdO1xuICAgICAgbGV0IGtleSA9IGNvbmZpZy5rZXkgfHwgdGhpcy5zZXJpYWxpemVSZWxhdGlvbnNoaXBOYW1lKGNvbnRleHQsIG5hbWUpO1xuICAgICAgbGV0IGRlc2NyaXB0b3IgPSAoPGFueT5yZWNvcmQuY29uc3RydWN0b3IpW25hbWVdO1xuICAgICAgYXNzZXJ0KGRlc2NyaXB0b3IsIGBZb3Ugc3BlY2lmaWVkIGEgJyR7IG5hbWUgfScgcmVsYXRpb25zaGlwIGluIHlvdXIgJHsgcmVjb3JkLnR5cGUgfSBzZXJpYWxpemVyLCBidXQgbm8gc3VjaCByZWxhdGlvbnNoaXAgaXMgZGVmaW5lZCBvbiB0aGUgJHsgcmVjb3JkLnR5cGUgfSBtb2RlbGApO1xuICAgICAgc2VyaWFsaXplZFJlbGF0aW9uc2hpcHNba2V5XSA9IGF3YWl0IHRoaXMuc2VyaWFsaXplUmVsYXRpb25zaGlwKGNvbnRleHQsIG5hbWUsIGNvbmZpZywgZGVzY3JpcHRvciwgcmVjb3JkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VyaWFsaXplZFJlbGF0aW9uc2hpcHM7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB0aGUgcmVsYXRpb25zaGlwIG5hbWUgdG8gaXQncyBcIm92ZXItdGhlLXdpcmVcIiBmb3JtYXQuIERlZmF1bHRzIHRvIGRhc2hlcml6aW5nIGl0LlxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZVJlbGF0aW9uc2hpcE5hbWUoY29udGV4dDogQ29udGV4dCwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4ga2ViYWJDYXNlKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBzZXJpYWxpemVyIGNvbmZpZyBhbmQgdGhlIG1vZGVsJ3MgZGVzY3JpcHRvciBmb3IgYSByZWxhdGlvbnNoaXAsIGFuZCByZXR1cm5zIHRoZVxuICAgKiBzZXJpYWxpemVkIHJlbGF0aW9uc2hpcCBvYmplY3QuIEFsc28gc2lkZWxvYWRzIGFueSBmdWxsIHJlY29yZHMgaWYgdGhlIHJlbGF0aW9uc2hpcCBpcyBzb1xuICAgKiBjb25maWd1cmVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHNlcmlhbGl6ZVJlbGF0aW9uc2hpcChjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIGNvbmZpZzogUmVsYXRpb25zaGlwQ29uZmlnLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWNvcmQ6IE1vZGVsKTogUHJvbWlzZTxKc29uQXBpUmVsYXRpb25zaGlwPiB7XG4gICAgbGV0IHJlbGF0aW9uc2hpcDogSnNvbkFwaVJlbGF0aW9uc2hpcCA9IHt9O1xuICAgIHNldElmTm90RW1wdHkocmVsYXRpb25zaGlwLCAnbGlua3MnLCB0aGlzLmxpbmtzRm9yUmVsYXRpb25zaGlwKGNvbnRleHQsIG5hbWUsIGNvbmZpZywgZGVzY3JpcHRvciwgcmVjb3JkKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZWxhdGlvbnNoaXAsICdtZXRhJywgdGhpcy5tZXRhRm9yUmVsYXRpb25zaGlwKGNvbnRleHQsIG5hbWUsIGNvbmZpZywgZGVzY3JpcHRvciwgcmVjb3JkKSk7XG4gICAgc2V0SWZOb3RFbXB0eShyZWxhdGlvbnNoaXAsICdkYXRhJywgYXdhaXQgdGhpcy5kYXRhRm9yUmVsYXRpb25zaGlwKGNvbnRleHQsIG5hbWUsIGNvbmZpZywgZGVzY3JpcHRvciwgcmVjb3JkKSk7XG4gICAgcmV0dXJuIHJlbGF0aW9uc2hpcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzZXJpYWxpemVkIGZvcm0gb2YgdGhlIHJlbGF0ZWQgTW9kZWxzIGZvciB0aGUgZ2l2ZW4gcmVjb3JkIGFuZCByZWxhdGlvbnNoaXAuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgZGF0YUZvclJlbGF0aW9uc2hpcChjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIGNvbmZpZzogUmVsYXRpb25zaGlwQ29uZmlnLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWNvcmQ6IE1vZGVsKTogUHJvbWlzZTxKc29uQXBpUmVsYXRpb25zaGlwRGF0YT4ge1xuICAgIGxldCByZWxhdGVkRGF0YSA9IGF3YWl0IHJlY29yZC5nZXRSZWxhdGVkKG5hbWUpO1xuICAgIGlmIChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNNYW55Jykge1xuICAgICAgcmV0dXJuIGF3YWl0IG1hcCg8TW9kZWxbXT5yZWxhdGVkRGF0YSwgYXN5bmMgKHJlbGF0ZWRSZWNvcmQpID0+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZGF0YUZvclJlbGF0ZWRSZWNvcmQoY29udGV4dCwgbmFtZSwgcmVsYXRlZFJlY29yZCwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmRhdGFGb3JSZWxhdGVkUmVjb3JkKGNvbnRleHQsIG5hbWUsIDxNb2RlbD5yZWxhdGVkRGF0YSwgY29uZmlnLCBkZXNjcmlwdG9yLCByZWNvcmQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgcmVsYXRlZCByZWNvcmQsIHJldHVybiB0aGUgcmVzb3VyY2Ugb2JqZWN0IGZvciB0aGF0IHJlY29yZCwgYW5kIHNpZGVsb2FkIHRoZSByZWNvcmQgYXNcbiAgICogd2VsbC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBkYXRhRm9yUmVsYXRlZFJlY29yZChjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIHJlbGF0ZWRSZWNvcmQ6IE1vZGVsLCBjb25maWc6IFJlbGF0aW9uc2hpcENvbmZpZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVjb3JkOiBNb2RlbCk6IFByb21pc2U8SnNvbkFwaVJlc291cmNlSWRlbnRpZmllcj4ge1xuICAgIGF3YWl0IHRoaXMuaW5jbHVkZVJlY29yZChjb250ZXh0LCBuYW1lLCByZWxhdGVkUmVjb3JkLCBjb25maWcsIGRlc2NyaXB0b3IpO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBwbHVyYWxpemUocmVsYXRlZFJlY29yZC50eXBlKSxcbiAgICAgIGlkOiByZWxhdGVkUmVjb3JkLmlkXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHJlbGF0aW9uc2hpcCBkZXNjcmlwdG9yIGFuZCB0aGUgcmVjb3JkIGl0J3MgZm9yLCBhbmQgcmV0dXJucyBhbnkgbGlua3MgZm9yIHRoYXRcbiAgICogcmVsYXRpb25zaGlwIGZvciB0aGF0IHJlY29yZC4gSS5lLiAnL2Jvb2tzLzEvYXV0aG9yJ1xuICAgKi9cbiAgcHJvdGVjdGVkIGxpbmtzRm9yUmVsYXRpb25zaGlwKGNvbnRleHQ6IENvbnRleHQsIG5hbWU6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlY29yZDogTW9kZWwpOiBKc29uQXBpTGlua3Mge1xuICAgIGxldCByZWNvcmRTZWxmTGluayA9IHRoaXMubGlua3NGb3JSZWNvcmQoY29udGV4dCwgcmVjb3JkKS5zZWxmO1xuICAgIGxldCByZWNvcmRVUkw6IHN0cmluZztcbiAgICBpZiAodHlwZW9mIHJlY29yZFNlbGZMaW5rID09PSAnc3RyaW5nJykge1xuICAgICAgcmVjb3JkVVJMID0gcmVjb3JkU2VsZkxpbms7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZFVSTCA9IHJlY29yZFNlbGZMaW5rLmhyZWY7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzZWxmOiBwYXRoLmpvaW4ocmVjb3JkVVJMLCBgcmVsYXRpb25zaGlwcy8keyBuYW1lIH1gKSxcbiAgICAgIHJlbGF0ZWQ6IHBhdGguam9pbihyZWNvcmRVUkwsIG5hbWUpXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFueSBtZXRhIGZvciBhIGdpdmVuIHJlbGF0aW9uc2hpcCBhbmQgcmVjb3JkLiBObyBtZXRhIGluY2x1ZGVkIGJ5IGRlZmF1bHQuXG4gICAqL1xuICBwcm90ZWN0ZWQgbWV0YUZvclJlbGF0aW9uc2hpcChjb250ZXh0OiBDb250ZXh0LCBuYW1lOiBzdHJpbmcsIGNvbmZpZzogUmVsYXRpb25zaGlwQ29uZmlnLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWNvcmQ6IE1vZGVsKTogSnNvbkFwaU1ldGEgfCB2b2lkIHtcbiAgICAvLyBkZWZhdWx0cyB0byBubyBtZXRhIGNvbnRlbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGxpbmtzIGZvciBhIHBhcnRpY3VsYXIgcmVjb3JkLCBpLmUuIHNlbGY6IFwiL2Jvb2tzLzFcIi4gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBhc3N1bWVzXG4gICAqIHRoZSBVUkwgZm9yIGEgcGFydGljdWxhciByZWNvcmQgbWFwcyB0byB0aGF0IHR5cGUncyBgc2hvd2AgYWN0aW9uLCBpLmUuIGBib29rcy9zaG93YC5cbiAgICovXG4gIHByb3RlY3RlZCBsaW5rc0ZvclJlY29yZChjb250ZXh0OiBDb250ZXh0LCByZWNvcmQ6IE1vZGVsKTogSnNvbkFwaUxpbmtzIHtcbiAgICBsZXQgcm91dGVyOiBSb3V0ZXIgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ2FwcDpyb3V0ZXInKTtcbiAgICBsZXQgdXJsID0gcm91dGVyLnVybEZvcihgJHsgcGx1cmFsaXplKHJlY29yZC50eXBlKSB9L3Nob3dgLCByZWNvcmQpO1xuICAgIHJldHVybiB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHsgc2VsZjogdXJsIH0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbWV0YSBmb3IgYSBwYXJ0aWN1bGFyIHJlY29yZC5cbiAgICovXG4gIHByb3RlY3RlZCBtZXRhRm9yUmVjb3JkKGNvbnRleHQ6IENvbnRleHQsIHJlY29yZDogTW9kZWwpOiB2b2lkIHwgSnNvbkFwaU1ldGEge1xuICAgIC8vIGRlZmF1bHRzIHRvIG5vIG1ldGFcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWRlbG9hZHMgYSByZWNvcmQgaW50byB0aGUgdG9wIGxldmVsIFwiaW5jbHVkZWRcIiBhcnJheVxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGluY2x1ZGVSZWNvcmQoY29udGV4dDogQ29udGV4dCwgbmFtZTogc3RyaW5nLCByZWxhdGVkUmVjb3JkOiBNb2RlbCwgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWlzQXJyYXkoY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCkpIHtcbiAgICAgIGNvbnRleHQuZG9jdW1lbnQuaW5jbHVkZWQgPSBbXTtcbiAgICB9XG4gICAgbGV0IHJlbGF0ZWRPcHRpb25zID0gKGNvbnRleHQub3B0aW9ucy5yZWxhdGlvbnNoaXBzICYmIGNvbnRleHQub3B0aW9ucy5yZWxhdGlvbnNoaXBzW25hbWVdKSB8fCBjb250ZXh0Lm9wdGlvbnM7XG4gICAgbGV0IHJlbGF0ZWRTZXJpYWxpemVyOiBKU09OQVBJU2VyaWFsaXplciA9IGNvbmZpZy5zZXJpYWxpemVyIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cChgc2VyaWFsaXplcjokeyByZWxhdGVkUmVjb3JkLnR5cGUgfWApO1xuICAgIGxldCByZWxhdGVkQ29udGV4dDogQ29udGV4dCA9IGFzc2lnbih7fSwgY29udGV4dCwgeyBvcHRpb25zOiByZWxhdGVkT3B0aW9ucyB9KTtcbiAgICBjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkLnB1c2goYXdhaXQgcmVsYXRlZFNlcmlhbGl6ZXIucmVuZGVyUmVjb3JkKHJlbGF0ZWRDb250ZXh0LCByZWxhdGVkUmVjb3JkKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBzdXBwbGllZCBlcnJvclxuICAgKi9cbiAgcHJvdGVjdGVkIHJlbmRlckVycm9yKGNvbnRleHQ6IENvbnRleHQsIGVycm9yOiBhbnkpOiBKc29uQXBpRXJyb3Ige1xuICAgIGxldCByZW5kZXJlZEVycm9yID0ge1xuICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgfHwgNTAwLFxuICAgICAgY29kZTogZXJyb3IuY29kZSB8fCBlcnJvci5uYW1lIHx8ICdJbnRlcm5hbFNlcnZlckVycm9yJyxcbiAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZVxuICAgIH07XG4gICAgc2V0SWZOb3RFbXB0eShyZW5kZXJlZEVycm9yLCAnaWQnLCB0aGlzLmlkRm9yRXJyb3IoY29udGV4dCwgZXJyb3IpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbmRlcmVkRXJyb3IsICd0aXRsZScsIHRoaXMudGl0bGVGb3JFcnJvcihjb250ZXh0LCBlcnJvcikpO1xuICAgIHNldElmTm90RW1wdHkocmVuZGVyZWRFcnJvciwgJ3NvdXJjZScsIHRoaXMuc291cmNlRm9yRXJyb3IoY29udGV4dCwgZXJyb3IpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbmRlcmVkRXJyb3IsICdtZXRhJywgdGhpcy5tZXRhRm9yRXJyb3IoY29udGV4dCwgZXJyb3IpKTtcbiAgICBzZXRJZk5vdEVtcHR5KHJlbmRlcmVkRXJyb3IsICdsaW5rcycsIHRoaXMubGlua3NGb3JFcnJvcihjb250ZXh0LCBlcnJvcikpO1xuICAgIHJldHVybiByZW5kZXJlZEVycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGVycm9yLCByZXR1cm4gYSB1bmlxdWUgaWQgZm9yIHRoaXMgcGFydGljdWxhciBvY2N1cmVuY2Ugb2YgdGhlIHByb2JsZW0uXG4gICAqL1xuICBwcm90ZWN0ZWQgaWRGb3JFcnJvcihjb250ZXh0OiBDb250ZXh0LCBlcnJvcjogYW55KTogc3RyaW5nIHtcbiAgICByZXR1cm4gZXJyb3IuaWQ7XG4gIH1cblxuICAvKipcbiAgICogQSBzaG9ydCwgaHVtYW4tcmVhZGFibGUgc3VtbWFyeSBvZiB0aGUgcHJvYmxlbSB0aGF0IFNIT1VMRCBOT1QgY2hhbmdlIGZyb20gb2NjdXJyZW5jZSB0b1xuICAgKiBvY2N1cnJlbmNlIG9mIHRoZSBwcm9ibGVtLCBleGNlcHQgZm9yIHB1cnBvc2VzIG9mIGxvY2FsaXphdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCB0aXRsZUZvckVycm9yKGNvbnRleHQ6IENvbnRleHQsIGVycm9yOiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBlcnJvci50aXRsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBlcnJvciwgcmV0dXJuIGEgSlNPTiBQb2ludGVyLCBhIFVSTCBxdWVyeSBwYXJhbSBuYW1lLCBvciBvdGhlciBpbmZvIGluZGljYXRpbmcgdGhlXG4gICAqIHNvdXJjZSBvZiB0aGUgZXJyb3IuXG4gICAqL1xuICBwcm90ZWN0ZWQgc291cmNlRm9yRXJyb3IoY29udGV4dDogQ29udGV4dCwgZXJyb3I6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVycm9yLnNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIG1ldGEgZm9yIGEgZ2l2ZW4gZXJyb3Igb2JqZWN0LiBZb3UgY291bGQgdXNlIHRoaXMgZm9yIGV4YW1wbGUsIHRvIHJldHVybiBkZWJ1Z1xuICAgKiBpbmZvcm1hdGlvbiBpbiBkZXZlbG9wbWVudCBlbnZpcm9ubWVudHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgbWV0YUZvckVycm9yKGNvbnRleHQ6IENvbnRleHQsIGVycm9yOiBhbnkpOiBKc29uQXBpTWV0YSB8IHZvaWQge1xuICAgIHJldHVybiBlcnJvci5tZXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIGxpbmtzIG9iamVjdCBmb3IgYW4gZXJyb3IuIFlvdSBjb3VsZCB1c2UgdGhpcyB0byBsaW5rIHRvIGEgYnVnIHRyYWNrZXIgcmVwb3J0IG9mIHRoZVxuICAgKiBlcnJvciwgZm9yIGV4YW1wbGUuXG4gICAqL1xuICBwcm90ZWN0ZWQgbGlua3NGb3JFcnJvcihjb250ZXh0OiBDb250ZXh0LCBlcnJvcjogYW55KTogSnNvbkFwaUxpbmtzIHwgdm9pZCB7XG4gICAgLy8gZGVmYXVsdHMgdG8gbm8gbGlua3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgZHVwbGljYXRlIGVudHJpZXMgZnJvbSB0aGUgc2lkZWxvYWRlZCBkYXRhLlxuICAgKi9cbiAgcHJvdGVjdGVkIGRlZHVwZUluY2x1ZGVkKGNvbnRleHQ6IENvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoaXNBcnJheShjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkKSkge1xuICAgICAgY29udGV4dC5kb2N1bWVudC5pbmNsdWRlZCA9IHVuaXFCeShjb250ZXh0LmRvY3VtZW50LmluY2x1ZGVkLCAocmVzb3VyY2UpID0+IHtcbiAgICAgICAgcmV0dXJuIGAkeyByZXNvdXJjZS50eXBlIH0vJHsgcmVzb3VyY2UuaWQgfWA7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuXG59XG4iXX0=