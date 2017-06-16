"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const assert = require("assert");
const bluebird_1 = require("bluebird");
const serializer_1 = require("./serializer");
/**
 * Renders the payload as a flat JSON object or array at the top level. Related
 * models are embedded.
 *
 * @package data
 */
class FlatSerializer extends serializer_1.default {
    constructor() {
        super(...arguments);
        /**
         * The default content type to apply to responses formatted by this serializer
         */
        this.contentType = 'application/json';
    }
    /**
     * Renders the payload, either a primary data model(s) or an error payload.
     */
    serialize(action, body, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (body instanceof Error) {
                return this.renderError(body);
            }
            return this.renderPrimary(body, options);
        });
    }
    /**
     * Renders a primary data payload (a model or array of models).
     */
    renderPrimary(payload, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (lodash_1.isArray(payload)) {
                return yield bluebird_1.all(payload.map((model) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    return yield this.renderModel(model, options);
                })));
            }
            return yield this.renderModel(payload, options);
        });
    }
    /**
     * Renders an individual model
     */
    renderModel(model, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let id = model.id;
            let attributes = this.serializeAttributes(model, options);
            let relationships = yield this.serializeRelationships(model, options);
            return lodash_1.assign({ id }, attributes, relationships);
        });
    }
    /**
     * Serialize the attributes for a given model
     */
    serializeAttributes(model, options) {
        let serializedAttributes = {};
        this.attributes.forEach((attributeName) => {
            let key = this.serializeAttributeName(attributeName);
            let rawValue = model[attributeName];
            if (!lodash_1.isUndefined(rawValue)) {
                let value = this.serializeAttributeValue(rawValue, key, model);
                serializedAttributes[key] = value;
            }
        });
        return serializedAttributes;
    }
    /**
     * Transform attribute names into their over-the-wire representation. Default
     * behavior uses the attribute name as-is.
     */
    serializeAttributeName(attributeName) {
        return attributeName;
    }
    /**
     * Take an attribute value and return the serialized value. Useful for
     * changing how certain types of values are serialized, i.e. Date objects.
     *
     * The default implementation returns the attribute's value unchanged.
     */
    serializeAttributeValue(value, key, model) {
        return value;
    }
    /**
     * Serialize the relationships for a given model
     */
    serializeRelationships(model, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let serializedRelationships = {};
            // The result of this.relationships is a whitelist of which relationships
            // should be serialized, and the configuration for their serialization
            for (let relationshipName in this.relationships) {
                let config = this.relationships[relationshipName];
                let key = config.key || this.serializeRelationshipName(relationshipName);
                let descriptor = model.constructor[relationshipName];
                assert(descriptor, `You specified a '${relationshipName}' relationship in your ${model.constructor.type} serializer, but no such relationship is defined on the ${model.constructor.type} model`);
                serializedRelationships[key] = yield this.serializeRelationship(relationshipName, config, descriptor, model, options);
            }
            return serializedRelationships;
        });
    }
    /**
     * Serializes a relationship
     */
    serializeRelationship(relationship, config, descriptor, model, options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedSerializer = this.container.lookup(`serializer:${descriptor.type}`, { loose: true }) || this.container.lookup(`serializer:application`, { loose: true });
            assert(relatedSerializer, `No serializer found for ${descriptor.type}, and no fallback application serializer found either`);
            if (descriptor.mode === 'hasMany') {
                let relatedModels = yield model.getRelated(relationship);
                return yield bluebird_1.all(relatedModels.map((relatedModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (config.strategy === 'embed') {
                        return yield relatedSerializer.renderModel(relatedModel, options);
                    }
                    else if (config.strategy === 'id') {
                        return relatedModel.id;
                    }
                })));
            }
            else {
                let relatedModel = yield model.getRelated(relationship);
                if (config.strategy === 'embed') {
                    return yield relatedSerializer.renderModel(relatedModel, options);
                }
                else if (config.strategy === 'id') {
                    return relatedModel.id;
                }
            }
        });
    }
    /**
     * Transform relationship names into their over-the-wire representation. Default
     * behavior uses the relationship name as-is.
     *
     * @protected
     * @param {string} name
     * @returns {string}
     */
    serializeRelationshipName(name) {
        return name;
    }
    /**
     * Render an error payload
     */
    renderError(error) {
        return {
            status: error.status || 500,
            code: error.code || 'InternalServerError',
            message: error.message
        };
    }
}
exports.default = FlatSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJsaWIvcmVuZGVyL2ZsYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBRzhCO0FBQzlCLGlDQUFpQztBQUNqQyx1Q0FBK0I7QUFDL0IsNkNBQThEO0FBSzlEOzs7OztHQUtHO0FBQ0gsb0JBQTZDLFNBQVEsb0JBQVU7SUFBL0Q7O1FBRUU7O1dBRUc7UUFDSCxnQkFBVyxHQUFHLGtCQUFrQixDQUFDO0lBdUluQyxDQUFDO0lBcklDOztPQUVHO0lBQ0csU0FBUyxDQUFDLE1BQWMsRUFBRSxJQUFTLEVBQUUsVUFBeUIsRUFBRTs7WUFDcEUsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDYSxhQUFhLENBQUMsT0FBc0IsRUFBRSxPQUFhOztZQUNqRSxFQUFFLENBQUMsQ0FBQyxnQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckIsTUFBTSxDQUFDLE1BQU0sY0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBTyxLQUFLO29CQUN2QyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDaEQsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO1lBQ04sQ0FBQztZQUNELE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELENBQUM7S0FBQTtJQUVEOztPQUVH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QUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDekIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ08seUJBQXlCLENBQUMsSUFBWTtRQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOztPQUVHO0lBQ08sV0FBVyxDQUFDLEtBQVU7UUFDOUIsTUFBTSxDQUFDO1lBQ0wsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRztZQUMzQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxxQkFBcUI7WUFDekMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO1NBQ3ZCLENBQUM7SUFDSixDQUFDO0NBRUY7QUE1SUQsaUNBNElDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNBcnJheSxcbiAgYXNzaWduLFxuICBpc1VuZGVmaW5lZCB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IGFsbCB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBTZXJpYWxpemVyLCB7IFJlbGF0aW9uc2hpcENvbmZpZyB9IGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vZGF0YS9tb2RlbCc7XG5pbXBvcnQgQWN0aW9uLCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tICcuLi9ydW50aW1lL2FjdGlvbic7XG5pbXBvcnQgeyBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yIH0gZnJvbSAnLi4vZGF0YS9kZXNjcmlwdG9ycyc7XG5cbi8qKlxuICogUmVuZGVycyB0aGUgcGF5bG9hZCBhcyBhIGZsYXQgSlNPTiBvYmplY3Qgb3IgYXJyYXkgYXQgdGhlIHRvcCBsZXZlbC4gUmVsYXRlZFxuICogbW9kZWxzIGFyZSBlbWJlZGRlZC5cbiAqXG4gKiBAcGFja2FnZSBkYXRhXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEZsYXRTZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG5cbiAgLyoqXG4gICAqIFRoZSBkZWZhdWx0IGNvbnRlbnQgdHlwZSB0byBhcHBseSB0byByZXNwb25zZXMgZm9ybWF0dGVkIGJ5IHRoaXMgc2VyaWFsaXplclxuICAgKi9cbiAgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIHBheWxvYWQsIGVpdGhlciBhIHByaW1hcnkgZGF0YSBtb2RlbChzKSBvciBhbiBlcnJvciBwYXlsb2FkLlxuICAgKi9cbiAgYXN5bmMgc2VyaWFsaXplKGFjdGlvbjogQWN0aW9uLCBib2R5OiBhbnksIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGJvZHkgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyRXJyb3IoYm9keSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlclByaW1hcnkoYm9keSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyBhIHByaW1hcnkgZGF0YSBwYXlsb2FkIChhIG1vZGVsIG9yIGFycmF5IG9mIG1vZGVscykuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcmVuZGVyUHJpbWFyeShwYXlsb2FkOiBNb2RlbHxNb2RlbFtdLCBvcHRpb25zPzogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNBcnJheShwYXlsb2FkKSkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFsbChwYXlsb2FkLm1hcChhc3luYyAobW9kZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVuZGVyTW9kZWwobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5yZW5kZXJNb2RlbChwYXlsb2FkLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIGFuIGluZGl2aWR1YWwgbW9kZWxcbiAgICovXG4gIGFzeW5jIHJlbmRlck1vZGVsKG1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IGlkID0gbW9kZWwuaWQ7XG4gICAgbGV0IGF0dHJpYnV0ZXMgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZXMobW9kZWwsIG9wdGlvbnMpO1xuICAgIGxldCByZWxhdGlvbnNoaXBzID0gYXdhaXQgdGhpcy5zZXJpYWxpemVSZWxhdGlvbnNoaXBzKG1vZGVsLCBvcHRpb25zKTtcbiAgICByZXR1cm4gYXNzaWduKHsgaWQgfSwgYXR0cmlidXRlcywgcmVsYXRpb25zaGlwcyk7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBhdHRyaWJ1dGVzIGZvciBhIGdpdmVuIG1vZGVsXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplQXR0cmlidXRlcyhtb2RlbDogTW9kZWwsIG9wdGlvbnM/OiBhbnkpOiBhbnkge1xuICAgIGxldCBzZXJpYWxpemVkQXR0cmlidXRlczogYW55ID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgIGxldCBrZXkgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlTmFtZSk7XG4gICAgICBsZXQgcmF3VmFsdWUgPSBtb2RlbFthdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGlmICghaXNVbmRlZmluZWQocmF3VmFsdWUpKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuc2VyaWFsaXplQXR0cmlidXRlVmFsdWUocmF3VmFsdWUsIGtleSwgbW9kZWwpO1xuICAgICAgICBzZXJpYWxpemVkQXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZWRBdHRyaWJ1dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhdHRyaWJ1dGUgbmFtZXMgaW50byB0aGVpciBvdmVyLXRoZS13aXJlIHJlcHJlc2VudGF0aW9uLiBEZWZhdWx0XG4gICAqIGJlaGF2aW9yIHVzZXMgdGhlIGF0dHJpYnV0ZSBuYW1lIGFzLWlzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYXR0cmlidXRlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGFuIGF0dHJpYnV0ZSB2YWx1ZSBhbmQgcmV0dXJuIHRoZSBzZXJpYWxpemVkIHZhbHVlLiBVc2VmdWwgZm9yXG4gICAqIGNoYW5naW5nIGhvdyBjZXJ0YWluIHR5cGVzIG9mIHZhbHVlcyBhcmUgc2VyaWFsaXplZCwgaS5lLiBEYXRlIG9iamVjdHMuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIHJldHVybnMgdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIHVuY2hhbmdlZC5cbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZTogYW55LCBrZXk6IHN0cmluZywgbW9kZWw6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSB0aGUgcmVsYXRpb25zaGlwcyBmb3IgYSBnaXZlbiBtb2RlbFxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHNlcmlhbGl6ZVJlbGF0aW9uc2hpcHMobW9kZWw6IGFueSwgb3B0aW9ucz86IGFueSk6IFByb21pc2U8eyBba2V5OiBzdHJpbmddOiBhbnkgfT4ge1xuICAgIGxldCBzZXJpYWxpemVkUmVsYXRpb25zaGlwczogeyBba2V5OiBzdHJpbmcgXTogYW55IH0gPSB7fTtcblxuICAgIC8vIFRoZSByZXN1bHQgb2YgdGhpcy5yZWxhdGlvbnNoaXBzIGlzIGEgd2hpdGVsaXN0IG9mIHdoaWNoIHJlbGF0aW9uc2hpcHNcbiAgICAvLyBzaG91bGQgYmUgc2VyaWFsaXplZCwgYW5kIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGVpciBzZXJpYWxpemF0aW9uXG4gICAgZm9yIChsZXQgcmVsYXRpb25zaGlwTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIGxldCBjb25maWcgPSB0aGlzLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwTmFtZV07XG4gICAgICBsZXQga2V5ID0gY29uZmlnLmtleSB8fCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcE5hbWUocmVsYXRpb25zaGlwTmFtZSk7XG4gICAgICBsZXQgZGVzY3JpcHRvciA9IG1vZGVsLmNvbnN0cnVjdG9yW3JlbGF0aW9uc2hpcE5hbWVdO1xuICAgICAgYXNzZXJ0KGRlc2NyaXB0b3IsIGBZb3Ugc3BlY2lmaWVkIGEgJyR7IHJlbGF0aW9uc2hpcE5hbWUgfScgcmVsYXRpb25zaGlwIGluIHlvdXIgJHsgbW9kZWwuY29uc3RydWN0b3IudHlwZSB9IHNlcmlhbGl6ZXIsIGJ1dCBubyBzdWNoIHJlbGF0aW9uc2hpcCBpcyBkZWZpbmVkIG9uIHRoZSAkeyBtb2RlbC5jb25zdHJ1Y3Rvci50eXBlIH0gbW9kZWxgKTtcbiAgICAgIHNlcmlhbGl6ZWRSZWxhdGlvbnNoaXBzW2tleV0gPSBhd2FpdCB0aGlzLnNlcmlhbGl6ZVJlbGF0aW9uc2hpcChyZWxhdGlvbnNoaXBOYW1lLCBjb25maWcsIGRlc2NyaXB0b3IsIG1vZGVsLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VyaWFsaXplZFJlbGF0aW9uc2hpcHM7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplcyBhIHJlbGF0aW9uc2hpcFxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHNlcmlhbGl6ZVJlbGF0aW9uc2hpcChyZWxhdGlvbnNoaXA6IHN0cmluZywgY29uZmlnOiBSZWxhdGlvbnNoaXBDb25maWcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIG1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSkge1xuICAgIGxldCByZWxhdGVkU2VyaWFsaXplciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cDxGbGF0U2VyaWFsaXplcj4oYHNlcmlhbGl6ZXI6JHsgZGVzY3JpcHRvci50eXBlIH1gLCB7IGxvb3NlOiB0cnVlIH0pIHx8IHRoaXMuY29udGFpbmVyLmxvb2t1cDxGbGF0U2VyaWFsaXplcj4oYHNlcmlhbGl6ZXI6YXBwbGljYXRpb25gLCB7IGxvb3NlOiB0cnVlIH0pO1xuICAgIGFzc2VydChyZWxhdGVkU2VyaWFsaXplciwgYE5vIHNlcmlhbGl6ZXIgZm91bmQgZm9yICR7IGRlc2NyaXB0b3IudHlwZSB9LCBhbmQgbm8gZmFsbGJhY2sgYXBwbGljYXRpb24gc2VyaWFsaXplciBmb3VuZCBlaXRoZXJgKTtcbiAgICBpZiAoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzTWFueScpIHtcbiAgICAgIGxldCByZWxhdGVkTW9kZWxzID0gPE1vZGVsW10+YXdhaXQgbW9kZWwuZ2V0UmVsYXRlZChyZWxhdGlvbnNoaXApO1xuICAgICAgcmV0dXJuIGF3YWl0IGFsbChyZWxhdGVkTW9kZWxzLm1hcChhc3luYyAocmVsYXRlZE1vZGVsOiBNb2RlbCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlnLnN0cmF0ZWd5ID09PSAnZW1iZWQnKSB7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHJlbGF0ZWRTZXJpYWxpemVyLnJlbmRlck1vZGVsKHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLnN0cmF0ZWd5ID09PSAnaWQnKSB7XG4gICAgICAgICAgcmV0dXJuIHJlbGF0ZWRNb2RlbC5pZDtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmVsYXRlZE1vZGVsID0gPE1vZGVsPmF3YWl0IG1vZGVsLmdldFJlbGF0ZWQocmVsYXRpb25zaGlwKTtcbiAgICAgIGlmIChjb25maWcuc3RyYXRlZ3kgPT09ICdlbWJlZCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlbGF0ZWRTZXJpYWxpemVyLnJlbmRlck1vZGVsKHJlbGF0ZWRNb2RlbCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2UgaWYgKGNvbmZpZy5zdHJhdGVneSA9PT0gJ2lkJykge1xuICAgICAgICByZXR1cm4gcmVsYXRlZE1vZGVsLmlkO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gcmVsYXRpb25zaGlwIG5hbWVzIGludG8gdGhlaXIgb3Zlci10aGUtd2lyZSByZXByZXNlbnRhdGlvbi4gRGVmYXVsdFxuICAgKiBiZWhhdmlvciB1c2VzIHRoZSByZWxhdGlvbnNoaXAgbmFtZSBhcy1pcy5cbiAgICpcbiAgICogQHByb3RlY3RlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZVJlbGF0aW9uc2hpcE5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgYW4gZXJyb3IgcGF5bG9hZFxuICAgKi9cbiAgcHJvdGVjdGVkIHJlbmRlckVycm9yKGVycm9yOiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXM6IGVycm9yLnN0YXR1cyB8fCA1MDAsXG4gICAgICBjb2RlOiBlcnJvci5jb2RlIHx8ICdJbnRlcm5hbFNlcnZlckVycm9yJyxcbiAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2VcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==