"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const assert = require("assert");
const serializer_1 = require("../serializer");
const model_1 = require("../model");
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
    serialize(response, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (response.body instanceof Error) {
                response.body = this.renderError(response.body);
            }
            response.body = this.renderPrimary(response.body, options);
            response.contentType = this.contentType;
        });
    }
    /**
     * Renders a primary data payload (a model or array of models).
     */
    renderPrimary(payload, options) {
        if (lodash_1.isArray(payload)) {
            return payload.map((model) => {
                return this.renderModel(model, options);
            });
        }
        return this.renderModel(payload, options);
    }
    /**
     * Renders an individual model
     */
    renderModel(model, options) {
        let id = model.id;
        let attributes = this.serializeAttributes(model, options);
        let relationships = this.serializeRelationships(model, options);
        relationships = lodash_1.mapValues(relationships, (relationship) => {
            return relationship.data;
        });
        return lodash_1.assign({ id }, attributes, relationships);
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
        let serializedRelationships = {};
        // The result of this.relationships is a whitelist of which relationships
        // should be serialized, and the configuration for their serialization
        lodash_1.forEach(this.relationships, (config, relationshipName) => {
            let key = config.key || this.serializeRelationshipName(relationshipName);
            let descriptor = model.constructor[relationshipName];
            assert(descriptor, `You specified a '${relationshipName}' relationship in your ${model.constructor.type} serializer, but no such relationship is defined on the ${model.constructor.type} model`);
            serializedRelationships[key] = this.serializeRelationship(config, descriptor, model, options);
        });
        return serializedRelationships;
    }
    /**
     * Serializes a relationship
     */
    serializeRelationship(config, descriptor, model, options) {
        if (lodash_1.isArray(model)) {
            if (model[0] instanceof model_1.default) {
                let relatedSerializer = this.container.lookup(`serializer:${descriptor.type}`);
                return model.map((relatedRecord) => {
                    return relatedSerializer.renderRecord(relatedRecord, options);
                });
            }
            return model;
        }
        if (model instanceof model_1.default) {
            let relatedSerializer = this.container.lookup(`serializer:${descriptor.type}`);
            return relatedSerializer.renderRecord(model, options);
        }
        return model;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvZGF0YS9zZXJpYWxpemVycy9mbGF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUs4QjtBQUM5QixpQ0FBaUM7QUFFakMsOENBQXVDO0FBQ3ZDLG9DQUE2QjtBQUk3Qjs7Ozs7R0FLRztBQUNILG9CQUFvQyxTQUFRLG9CQUFVO0lBQXREOztRQUVFOztXQUVHO1FBQ0ksZ0JBQVcsR0FBRyxrQkFBa0IsQ0FBQztJQXFJMUMsQ0FBQztJQW5JQzs7T0FFRztJQUNVLFNBQVMsQ0FBQyxRQUFrQixFQUFFLFVBQWUsRUFBRTs7WUFDMUQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFDRCxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMzRCxRQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDMUMsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDTyxhQUFhLENBQUMsT0FBc0IsRUFBRSxPQUFhO1FBQzNELEVBQUUsQ0FBQyxDQUFDLGdCQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSztnQkFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMs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IG1hcFZhbHVlcyxcbiAgZm9yRWFjaCxcbiAgaXNVbmRlZmluZWQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBzaW5ndWxhcml6ZSB9IGZyb20gJ2luZmxlY3Rpb24nO1xuaW1wb3J0IFNlcmlhbGl6ZXIgZnJvbSAnLi4vc2VyaWFsaXplcic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi4vbW9kZWwnO1xuaW1wb3J0IFJlc3BvbnNlIGZyb20gJy4uLy4uL3J1bnRpbWUvcmVzcG9uc2UnO1xuaW1wb3J0IHsgSGFzTWFueVJlbGF0aW9uc2hpcCwgUmVsYXRpb25zaGlwRGVzY3JpcHRvciB9IGZyb20gJy4uL2Rlc2NyaXB0b3JzJztcblxuLyoqXG4gKiBSZW5kZXJzIHRoZSBwYXlsb2FkIGFzIGEgZmxhdCBKU09OIG9iamVjdCBvciBhcnJheSBhdCB0aGUgdG9wIGxldmVsLiBSZWxhdGVkXG4gKiBtb2RlbHMgYXJlIGVtYmVkZGVkLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxhdFNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcblxuICAvKipcbiAgICogVGhlIGRlZmF1bHQgY29udGVudCB0eXBlIHRvIGFwcGx5IHRvIHJlc3BvbnNlcyBmb3JtYXR0ZWQgYnkgdGhpcyBzZXJpYWxpemVyXG4gICAqL1xuICBwdWJsaWMgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIHBheWxvYWQsIGVpdGhlciBhIHByaW1hcnkgZGF0YSBtb2RlbChzKSBvciBhbiBlcnJvciBwYXlsb2FkLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIHNlcmlhbGl6ZShyZXNwb25zZTogUmVzcG9uc2UsIG9wdGlvbnM6IGFueSA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHJlc3BvbnNlLmJvZHkgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmVzcG9uc2UuYm9keSA9IHRoaXMucmVuZGVyRXJyb3IocmVzcG9uc2UuYm9keSk7XG4gICAgfVxuICAgIHJlc3BvbnNlLmJvZHkgPSB0aGlzLnJlbmRlclByaW1hcnkocmVzcG9uc2UuYm9keSwgb3B0aW9ucyk7XG4gICAgcmVzcG9uc2UuY29udGVudFR5cGUgPSB0aGlzLmNvbnRlbnRUeXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgYSBwcmltYXJ5IGRhdGEgcGF5bG9hZCAoYSBtb2RlbCBvciBhcnJheSBvZiBtb2RlbHMpLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlbmRlclByaW1hcnkocGF5bG9hZDogTW9kZWx8TW9kZWxbXSwgb3B0aW9ucz86IGFueSk6IGFueSB7XG4gICAgaWYgKGlzQXJyYXkocGF5bG9hZCkpIHtcbiAgICAgIHJldHVybiBwYXlsb2FkLm1hcCgobW9kZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyTW9kZWwobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlck1vZGVsKHBheWxvYWQsIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgYW4gaW5kaXZpZHVhbCBtb2RlbFxuICAgKi9cbiAgcHVibGljIHJlbmRlck1vZGVsKG1vZGVsOiBNb2RlbCwgb3B0aW9ucz86IGFueSk6IGFueSB7XG4gICAgbGV0IGlkID0gbW9kZWwuaWQ7XG4gICAgbGV0IGF0dHJpYnV0ZXMgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZXMobW9kZWwsIG9wdGlvbnMpO1xuICAgIGxldCByZWxhdGlvbnNoaXBzID0gdGhpcy5zZXJpYWxpemVSZWxhdGlvbnNoaXBzKG1vZGVsLCBvcHRpb25zKTtcbiAgICByZWxhdGlvbnNoaXBzID0gbWFwVmFsdWVzKHJlbGF0aW9uc2hpcHMsIChyZWxhdGlvbnNoaXApID0+IHtcbiAgICAgIHJldHVybiByZWxhdGlvbnNoaXAuZGF0YTtcbiAgICB9KTtcbiAgICByZXR1cm4gYXNzaWduKHsgaWQgfSwgYXR0cmlidXRlcywgcmVsYXRpb25zaGlwcyk7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplIHRoZSBhdHRyaWJ1dGVzIGZvciBhIGdpdmVuIG1vZGVsXG4gICAqL1xuICBwcm90ZWN0ZWQgc2VyaWFsaXplQXR0cmlidXRlcyhtb2RlbDogTW9kZWwsIG9wdGlvbnM/OiBhbnkpOiBhbnkge1xuICAgIGxldCBzZXJpYWxpemVkQXR0cmlidXRlczogYW55ID0ge307XG4gICAgdGhpcy5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZU5hbWUpID0+IHtcbiAgICAgIGxldCBrZXkgPSB0aGlzLnNlcmlhbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlTmFtZSk7XG4gICAgICBsZXQgcmF3VmFsdWUgPSBtb2RlbFthdHRyaWJ1dGVOYW1lXTtcbiAgICAgIGlmICghaXNVbmRlZmluZWQocmF3VmFsdWUpKSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuc2VyaWFsaXplQXR0cmlidXRlVmFsdWUocmF3VmFsdWUsIGtleSwgbW9kZWwpO1xuICAgICAgICBzZXJpYWxpemVkQXR0cmlidXRlc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZWRBdHRyaWJ1dGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhdHRyaWJ1dGUgbmFtZXMgaW50byB0aGVpciBvdmVyLXRoZS13aXJlIHJlcHJlc2VudGF0aW9uLiBEZWZhdWx0XG4gICAqIGJlaGF2aW9yIHVzZXMgdGhlIGF0dHJpYnV0ZSBuYW1lIGFzLWlzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYXR0cmlidXRlTmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGFuIGF0dHJpYnV0ZSB2YWx1ZSBhbmQgcmV0dXJuIHRoZSBzZXJpYWxpemVkIHZhbHVlLiBVc2VmdWwgZm9yXG4gICAqIGNoYW5naW5nIGhvdyBjZXJ0YWluIHR5cGVzIG9mIHZhbHVlcyBhcmUgc2VyaWFsaXplZCwgaS5lLiBEYXRlIG9iamVjdHMuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIHJldHVybnMgdGhlIGF0dHJpYnV0ZSdzIHZhbHVlIHVuY2hhbmdlZC5cbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZTogYW55LCBrZXk6IHN0cmluZywgbW9kZWw6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSB0aGUgcmVsYXRpb25zaGlwcyBmb3IgYSBnaXZlbiBtb2RlbFxuICAgKi9cbiAgcHJvdGVjdGVkIHNlcmlhbGl6ZVJlbGF0aW9uc2hpcHMobW9kZWw6IGFueSwgb3B0aW9ucz86IGFueSk6IHsgW2tleTogc3RyaW5nXTogYW55IH0ge1xuICAgIGxldCBzZXJpYWxpemVkUmVsYXRpb25zaGlwczogeyBba2V5OiBzdHJpbmcgXTogYW55IH0gPSB7fTtcblxuICAgIC8vIFRoZSByZXN1bHQgb2YgdGhpcy5yZWxhdGlvbnNoaXBzIGlzIGEgd2hpdGVsaXN0IG9mIHdoaWNoIHJlbGF0aW9uc2hpcHNcbiAgICAvLyBzaG91bGQgYmUgc2VyaWFsaXplZCwgYW5kIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGVpciBzZXJpYWxpemF0aW9uXG4gICAgZm9yRWFjaCh0aGlzLnJlbGF0aW9uc2hpcHMsIChjb25maWcsIHJlbGF0aW9uc2hpcE5hbWUpID0+IHtcbiAgICAgIGxldCBrZXkgPSBjb25maWcua2V5IHx8IHRoaXMuc2VyaWFsaXplUmVsYXRpb25zaGlwTmFtZShyZWxhdGlvbnNoaXBOYW1lKTtcbiAgICAgIGxldCBkZXNjcmlwdG9yID0gbW9kZWwuY29uc3RydWN0b3JbcmVsYXRpb25zaGlwTmFtZV07XG4gICAgICBhc3NlcnQoZGVzY3JpcHRvciwgYFlvdSBzcGVjaWZpZWQgYSAnJHsgcmVsYXRpb25zaGlwTmFtZSB9JyByZWxhdGlvbnNoaXAgaW4geW91ciAkeyBtb2RlbC5jb25zdHJ1Y3Rvci50eXBlIH0gc2VyaWFsaXplciwgYnV0IG5vIHN1Y2ggcmVsYXRpb25zaGlwIGlzIGRlZmluZWQgb24gdGhlICR7IG1vZGVsLmNvbnN0cnVjdG9yLnR5cGUgfSBtb2RlbGApO1xuICAgICAgc2VyaWFsaXplZFJlbGF0aW9uc2hpcHNba2V5XSA9IHRoaXMuc2VyaWFsaXplUmVsYXRpb25zaGlwKGNvbmZpZywgZGVzY3JpcHRvciwgbW9kZWwsIG9wdGlvbnMpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWRSZWxhdGlvbnNoaXBzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZXMgYSByZWxhdGlvbnNoaXBcbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVSZWxhdGlvbnNoaXAoY29uZmlnOiBhbnksIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIG1vZGVsOiBhbnksIG9wdGlvbnM/OiBhbnkpIHtcbiAgICBpZiAoaXNBcnJheShtb2RlbCkpIHtcbiAgICAgIGlmIChtb2RlbFswXSBpbnN0YW5jZW9mIE1vZGVsKSB7XG4gICAgICAgIGxldCByZWxhdGVkU2VyaWFsaXplciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cChgc2VyaWFsaXplcjokeyBkZXNjcmlwdG9yLnR5cGUgfWApO1xuICAgICAgICByZXR1cm4gbW9kZWwubWFwKChyZWxhdGVkUmVjb3JkKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlbGF0ZWRTZXJpYWxpemVyLnJlbmRlclJlY29yZChyZWxhdGVkUmVjb3JkLCBvcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbW9kZWw7XG4gICAgfVxuICAgIGlmIChtb2RlbCBpbnN0YW5jZW9mIE1vZGVsKSB7XG4gICAgICBsZXQgcmVsYXRlZFNlcmlhbGl6ZXIgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoYHNlcmlhbGl6ZXI6JHsgZGVzY3JpcHRvci50eXBlIH1gKTtcbiAgICAgIHJldHVybiByZWxhdGVkU2VyaWFsaXplci5yZW5kZXJSZWNvcmQobW9kZWwsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kZWw7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIHJlbGF0aW9uc2hpcCBuYW1lcyBpbnRvIHRoZWlyIG92ZXItdGhlLXdpcmUgcmVwcmVzZW50YXRpb24uIERlZmF1bHRcbiAgICogYmVoYXZpb3IgdXNlcyB0aGUgcmVsYXRpb25zaGlwIG5hbWUgYXMtaXMuXG4gICAqXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHByb3RlY3RlZCBzZXJpYWxpemVSZWxhdGlvbnNoaXBOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIGFuIGVycm9yIHBheWxvYWRcbiAgICovXG4gIHByb3RlY3RlZCByZW5kZXJFcnJvcihlcnJvcjogYW55KTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiBlcnJvci5zdGF0dXMgfHwgNTAwLFxuICAgICAgY29kZTogZXJyb3IuY29kZSB8fCAnSW50ZXJuYWxTZXJ2ZXJFcnJvcicsXG4gICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=