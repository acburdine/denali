"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const orm_adapter_1 = require("./orm-adapter");
const assert = require("assert");
const inflection_1 = require("inflection");
let guid = 0;
/**
 * An in-memory ORM adapter for getting started quickly, testing, and debugging. Should **not** be
 * used for production data.
 *
 * @package data
 */
class MemoryAdapter extends orm_adapter_1.default {
    constructor() {
        super(...arguments);
        /**
         * An in-memory cache of records. Top level objects are collections of records by type, indexed
         * by record id.
         */
        this._cache = {};
    }
    /**
     * Get the collection of records for a given type, indexed by record id. If the collection doesn't
     * exist yet, create it and return the empty collection.
     */
    _cacheFor(type) {
        if (!this._cache[type]) {
            this._cache[type] = {};
        }
        return this._cache[type];
    }
    // tslint:disable:completed-docs
    find(type, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this._cacheFor(type)[id] || null;
        });
    }
    queryOne(type, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.find(this._cacheFor(type), query) || null;
        });
    }
    all(type) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.values(this._cacheFor(type));
        });
    }
    query(type, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.filter(this._cacheFor(type), query);
        });
    }
    buildRecord(type, data) {
        this._cacheFor(type);
        return data;
    }
    idFor(model) {
        return model.record.id;
    }
    setId(model, value) {
        let collection = this._cacheFor(model.type);
        delete collection[model.record.id];
        model.record.id = value;
        collection[value] = model.record;
    }
    getAttribute(model, property) {
        return model.record[property];
    }
    setAttribute(model, property, value) {
        model.record[property] = value;
        return true;
    }
    deleteAttribute(model, property) {
        model.record[property] = null;
        return true;
    }
    getRelated(model, relationship, descriptor, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedCollection = this._cacheFor(descriptor.type);
            if (descriptor.mode === 'hasMany') {
                let related = lodash_1.filter(relatedCollection, (relatedRecord) => {
                    let relatedIds = model.record[`${inflection_1.singularize(relationship)}_ids`];
                    return relatedIds && relatedIds.includes(relatedRecord.id);
                });
                if (query) {
                    related = lodash_1.filter(related, query);
                }
                return related;
            }
            return this.queryOne(descriptor.type, { id: model.record[`${relationship}_id`] });
        });
    }
    setRelated(model, relationship, descriptor, relatedModels) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(relatedModels)) {
                assert(descriptor.mode === 'hasMany', `You tried to set ${relationship} to an array of related records, but it is a hasOne relationship`);
                model.record[`${inflection_1.singularize(relationship)}_ids`] = lodash_1.map(relatedModels, 'record.id');
            }
            else {
                model.record[`${relationship}_id`] = relatedModels.record.id;
            }
        });
    }
    addRelated(model, relationship, descriptor, relatedModel) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let relatedIds = model.record[`${inflection_1.singularize(relationship)}_ids`];
            if (!relatedIds) {
                relatedIds = model.record[`${inflection_1.singularize(relationship)}_ids`] = [];
            }
            relatedIds.push(relatedModel.id);
        });
    }
    removeRelated(model, relationship, descriptor, relatedModel) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            lodash_1.remove(model.record[`${inflection_1.singularize(relationship)}_ids`], (id) => id === relatedModel.id);
        });
    }
    saveRecord(model) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let collection = this._cacheFor(model.type);
            if (model.record.id == null) {
                guid += 1;
                model.record.id = guid;
            }
            collection[model.record.id] = model.record;
            return model.record;
        });
    }
    deleteRecord(model) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let collection = this._cacheFor(model.type);
            delete collection[model.record.id];
        });
    }
}
exports.default = MemoryAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL21lbW9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FNZ0I7QUFDaEIsK0NBQXVDO0FBR3ZDLGlDQUFpQztBQUNqQywyQ0FBeUM7QUFFekMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBRWI7Ozs7O0dBS0c7QUFDSCxtQkFBbUMsU0FBUSxxQkFBVTtJQUFyRDs7UUFHRTs7O1dBR0c7UUFDSCxXQUFNLEdBQThDLEVBQUUsQ0FBQztJQWdIekQsQ0FBQztJQTlHQzs7O09BR0c7SUFDSCxTQUFTLENBQUMsSUFBWTtRQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0NBQWdDO0lBRTFCLElBQUksQ0FBQyxJQUFZLEVBQUUsRUFBVTs7WUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzFDLENBQUM7S0FBQTtJQUVLLFFBQVEsQ0FBQyxJQUFZLEVBQUUsS0FBVTs7WUFDckMsTUFBTSxDQUFDLGFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztRQUNuRCxDQUFDO0tBQUE7SUFFSyxHQUFHLENBQUMsSUFBWTs7WUFDcEIsTUFBTSxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENB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Q0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUksSUFBSSxDQUFDLENBQUM7Z0JBQ1YsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFDRCxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUM7S0FBQTtJQUVLLFlBQVksQ0FBQyxLQUFZOztZQUM3QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7S0FBQTtDQUVGO0FBdkhELGdDQXVIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGZpbmQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICByZW1vdmUsXG4gIHZhbHVlc1xufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi9vcm0tYWRhcHRlcic7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCc7XG5pbXBvcnQgeyBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yIH0gZnJvbSAnLi9kZXNjcmlwdG9ycyc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHNpbmd1bGFyaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5cbmxldCBndWlkID0gMDtcblxuLyoqXG4gKiBBbiBpbi1tZW1vcnkgT1JNIGFkYXB0ZXIgZm9yIGdldHRpbmcgc3RhcnRlZCBxdWlja2x5LCB0ZXN0aW5nLCBhbmQgZGVidWdnaW5nLiBTaG91bGQgKipub3QqKiBiZVxuICogdXNlZCBmb3IgcHJvZHVjdGlvbiBkYXRhLlxuICpcbiAqIEBwYWNrYWdlIGRhdGFcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVtb3J5QWRhcHRlciBleHRlbmRzIE9STUFkYXB0ZXIge1xuXG5cbiAgLyoqXG4gICAqIEFuIGluLW1lbW9yeSBjYWNoZSBvZiByZWNvcmRzLiBUb3AgbGV2ZWwgb2JqZWN0cyBhcmUgY29sbGVjdGlvbnMgb2YgcmVjb3JkcyBieSB0eXBlLCBpbmRleGVkXG4gICAqIGJ5IHJlY29yZCBpZC5cbiAgICovXG4gIF9jYWNoZTogeyBbdHlwZTogc3RyaW5nXTogeyBbaWQ6IG51bWJlcl06IGFueSB9IH0gPSB7fTtcblxuICAvKipcbiAgICogR2V0IHRoZSBjb2xsZWN0aW9uIG9mIHJlY29yZHMgZm9yIGEgZ2l2ZW4gdHlwZSwgaW5kZXhlZCBieSByZWNvcmQgaWQuIElmIHRoZSBjb2xsZWN0aW9uIGRvZXNuJ3RcbiAgICogZXhpc3QgeWV0LCBjcmVhdGUgaXQgYW5kIHJldHVybiB0aGUgZW1wdHkgY29sbGVjdGlvbi5cbiAgICovXG4gIF9jYWNoZUZvcih0eXBlOiBzdHJpbmcpOiB7IFtpZDogbnVtYmVyXTogYW55IH0ge1xuICAgIGlmICghdGhpcy5fY2FjaGVbdHlwZV0pIHtcbiAgICAgIHRoaXMuX2NhY2hlW3R5cGVdID0ge307XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jYWNoZVt0eXBlXTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzXG5cbiAgYXN5bmMgZmluZCh0eXBlOiBzdHJpbmcsIGlkOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jYWNoZUZvcih0eXBlKVtpZF0gfHwgbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHF1ZXJ5T25lKHR5cGU6IHN0cmluZywgcXVlcnk6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGZpbmQodGhpcy5fY2FjaGVGb3IodHlwZSksIHF1ZXJ5KSB8fCBudWxsO1xuICB9XG5cbiAgYXN5bmMgYWxsKHR5cGU6IHN0cmluZyk6IFByb21pc2U8YW55W10+IHtcbiAgICByZXR1cm4gdmFsdWVzKHRoaXMuX2NhY2hlRm9yKHR5cGUpKTtcbiAgfVxuXG4gIGFzeW5jIHF1ZXJ5KHR5cGU6IHN0cmluZywgcXVlcnk6IGFueSk6IFByb21pc2U8YW55W10+IHtcbiAgICByZXR1cm4gZmlsdGVyKHRoaXMuX2NhY2hlRm9yKHR5cGUpLCBxdWVyeSk7XG4gIH1cblxuICBidWlsZFJlY29yZCh0eXBlOiBzdHJpbmcsIGRhdGE6IGFueSk6IGFueSB7XG4gICAgdGhpcy5fY2FjaGVGb3IodHlwZSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBpZEZvcihtb2RlbDogTW9kZWwpIHtcbiAgICByZXR1cm4gbW9kZWwucmVjb3JkLmlkO1xuICB9XG5cbiAgc2V0SWQobW9kZWw6IE1vZGVsLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLl9jYWNoZUZvcihtb2RlbC50eXBlKTtcbiAgICBkZWxldGUgY29sbGVjdGlvblttb2RlbC5yZWNvcmQuaWRdO1xuICAgIG1vZGVsLnJlY29yZC5pZCA9IHZhbHVlO1xuICAgIGNvbGxlY3Rpb25bdmFsdWVdID0gbW9kZWwucmVjb3JkO1xuICB9XG5cbiAgZ2V0QXR0cmlidXRlKG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IHN0cmluZyk6IGFueSB7XG4gICAgcmV0dXJuIG1vZGVsLnJlY29yZFtwcm9wZXJ0eV07XG4gIH1cblxuICBzZXRBdHRyaWJ1dGUobW9kZWw6IE1vZGVsLCBwcm9wZXJ0eTogc3RyaW5nLCB2YWx1ZTogYW55KTogdHJ1ZSB7XG4gICAgbW9kZWwucmVjb3JkW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVsZXRlQXR0cmlidXRlKG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IHN0cmluZyk6IHRydWUge1xuICAgIG1vZGVsLnJlY29yZFtwcm9wZXJ0eV0gPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmVsYXRlZChtb2RlbDogTW9kZWwsIHJlbGF0aW9uc2hpcDogc3RyaW5nLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCBxdWVyeTogYW55KTogUHJvbWlzZTxhbnl8YW55W10+IHtcbiAgICBsZXQgcmVsYXRlZENvbGxlY3Rpb24gPSB0aGlzLl9jYWNoZUZvcihkZXNjcmlwdG9yLnR5cGUpO1xuICAgIGlmIChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNNYW55Jykge1xuICAgICAgbGV0IHJlbGF0ZWQgPSBmaWx0ZXIocmVsYXRlZENvbGxlY3Rpb24sIChyZWxhdGVkUmVjb3JkOiBhbnkpID0+IHtcbiAgICAgICAgbGV0IHJlbGF0ZWRJZHMgPSBtb2RlbC5yZWNvcmRbYCR7IHNpbmd1bGFyaXplKHJlbGF0aW9uc2hpcCkgfV9pZHNgXTtcbiAgICAgICAgcmV0dXJuIHJlbGF0ZWRJZHMgJiYgcmVsYXRlZElkcy5pbmNsdWRlcyhyZWxhdGVkUmVjb3JkLmlkKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgIHJlbGF0ZWQgPSBmaWx0ZXIocmVsYXRlZCwgcXVlcnkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlbGF0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnF1ZXJ5T25lKGRlc2NyaXB0b3IudHlwZSwgeyBpZDogbW9kZWwucmVjb3JkW2AkeyByZWxhdGlvbnNoaXAgfV9pZGBdIH0pO1xuICB9XG5cbiAgYXN5bmMgc2V0UmVsYXRlZChtb2RlbDogTW9kZWwsIHJlbGF0aW9uc2hpcDogc3RyaW5nLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWxhdGVkTW9kZWxzOiBNb2RlbHxNb2RlbFtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVsYXRlZE1vZGVscykpIHtcbiAgICAgIGFzc2VydChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNNYW55JywgYFlvdSB0cmllZCB0byBzZXQgJHsgcmVsYXRpb25zaGlwIH0gdG8gYW4gYXJyYXkgb2YgcmVsYXRlZCByZWNvcmRzLCBidXQgaXQgaXMgYSBoYXNPbmUgcmVsYXRpb25zaGlwYCk7XG4gICAgICBtb2RlbC5yZWNvcmRbYCR7IHNpbmd1bGFyaXplKHJlbGF0aW9uc2hpcCkgfV9pZHNgXSA9IG1hcChyZWxhdGVkTW9kZWxzLCAncmVjb3JkLmlkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1vZGVsLnJlY29yZFtgJHsgcmVsYXRpb25zaGlwIH1faWRgXSA9IHJlbGF0ZWRNb2RlbHMucmVjb3JkLmlkO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGFkZFJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVsYXRlZE1vZGVsOiBNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCByZWxhdGVkSWRzID0gbW9kZWwucmVjb3JkW2AkeyBzaW5ndWxhcml6ZShyZWxhdGlvbnNoaXApIH1faWRzYF07XG4gICAgaWYgKCFyZWxhdGVkSWRzKSB7XG4gICAgICByZWxhdGVkSWRzID0gbW9kZWwucmVjb3JkW2AkeyBzaW5ndWxhcml6ZShyZWxhdGlvbnNoaXApIH1faWRzYF0gPSBbXTtcbiAgICB9XG4gICAgcmVsYXRlZElkcy5wdXNoKHJlbGF0ZWRNb2RlbC5pZCk7XG4gIH1cblxuICBhc3luYyByZW1vdmVSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbDogTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZW1vdmUobW9kZWwucmVjb3JkW2AkeyBzaW5ndWxhcml6ZShyZWxhdGlvbnNoaXApIH1faWRzYF0sIChpZCkgPT4gaWQgPT09IHJlbGF0ZWRNb2RlbC5pZCk7XG4gIH1cblxuICBhc3luYyBzYXZlUmVjb3JkKG1vZGVsOiBNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5fY2FjaGVGb3IobW9kZWwudHlwZSk7XG4gICAgaWYgKG1vZGVsLnJlY29yZC5pZCA9PSBudWxsKSB7XG4gICAgICBndWlkICs9IDE7XG4gICAgICBtb2RlbC5yZWNvcmQuaWQgPSBndWlkO1xuICAgIH1cbiAgICBjb2xsZWN0aW9uW21vZGVsLnJlY29yZC5pZF0gPSBtb2RlbC5yZWNvcmQ7XG4gICAgcmV0dXJuIG1vZGVsLnJlY29yZDtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZVJlY29yZChtb2RlbDogTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuX2NhY2hlRm9yKG1vZGVsLnR5cGUpO1xuICAgIGRlbGV0ZSBjb2xsZWN0aW9uW21vZGVsLnJlY29yZC5pZF07XG4gIH1cblxufVxuIl19