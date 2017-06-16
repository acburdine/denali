"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const serializer_1 = require("./serializer");
/**
 * Renders the payload as a flat JSON object or array at the top level. Related
 * models are embedded.
 *
 * @package data
 */
class RawSerializer extends serializer_1.default {
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
            return body;
        });
    }
}
exports.default = RawSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmF3LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi9yZW5kZXIvcmF3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFzQztBQUd0Qzs7Ozs7R0FLRztBQUNILG1CQUE0QyxTQUFRLG9CQUFVO0lBQTlEOztRQUVFOztXQUVHO1FBQ0gsZ0JBQVcsR0FBRyxrQkFBa0IsQ0FBQztJQVNuQyxDQUFDO0lBUEM7O09BRUc7SUFDRyxTQUFTLENBQUMsTUFBYyxFQUFFLElBQVMsRUFBRSxVQUF5QixFQUFFOztZQUNwRSxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0NBRUY7QUFkRCxnQ0FjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJpYWxpemVyIGZyb20gJy4vc2VyaWFsaXplcic7XG5pbXBvcnQgQWN0aW9uLCB7IFJlbmRlck9wdGlvbnMgfSBmcm9tICdsaWIvcnVudGltZS9hY3Rpb24nO1xuXG4vKipcbiAqIFJlbmRlcnMgdGhlIHBheWxvYWQgYXMgYSBmbGF0IEpTT04gb2JqZWN0IG9yIGFycmF5IGF0IHRoZSB0b3AgbGV2ZWwuIFJlbGF0ZWRcbiAqIG1vZGVscyBhcmUgZW1iZWRkZWQuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBSYXdTZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG5cbiAgLyoqXG4gICAqIFRoZSBkZWZhdWx0IGNvbnRlbnQgdHlwZSB0byBhcHBseSB0byByZXNwb25zZXMgZm9ybWF0dGVkIGJ5IHRoaXMgc2VyaWFsaXplclxuICAgKi9cbiAgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIHBheWxvYWQsIGVpdGhlciBhIHByaW1hcnkgZGF0YSBtb2RlbChzKSBvciBhbiBlcnJvciBwYXlsb2FkLlxuICAgKi9cbiAgYXN5bmMgc2VyaWFsaXplKGFjdGlvbjogQWN0aW9uLCBib2R5OiBhbnksIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMgPSB7fSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxufVxuIl19