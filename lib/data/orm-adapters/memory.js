"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const orm_adapter_1 = require("../orm-adapter");
const assert = require("assert");
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
            return lodash_1.find(this._cacheFor(type), id);
        });
    }
    findOne(type, query) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return lodash_1.find(this._cacheFor(type), query);
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
                return lodash_1.filter(relatedCollection, (relatedRecord) => {
                    return model.record[`${relationship}_ids`].contains(relatedRecord.id);
                });
            }
            return this.findOne(descriptor.type, { id: model.record[`${relationship}_id`] });
        });
    }
    setRelated(model, relationship, descriptor, relatedRecords) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(relatedRecords)) {
                assert(descriptor.mode === 'hasMany', `You tried to set ${relationship} to an array of related records, but it is a hasOne relationship`);
                model.record[`${relationship}_ids`] = lodash_1.map(relatedRecords, 'id');
            }
            else {
                model.record[`${relationship}_id`] = relatedRecords.id;
            }
        });
    }
    addRelated(model, relationship, descriptor, relatedRecord) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            model.record[`${relationship}_ids`].push(relatedRecord.id);
        });
    }
    removeRelated(model, relationship, descriptor, relatedRecord) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            lodash_1.remove(model.record[`${relationship}_ids`], { id: relatedRecord.id });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL29ybS1hZGFwdGVycy9tZW1vcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBTWdCO0FBQ2hCLGdEQUF3QztBQUd4QyxpQ0FBaUM7QUFFakMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBRWI7Ozs7O0dBS0c7QUFDSCxtQkFBbUMsU0FBUSxxQkFBVTtJQUFyRDs7UUFHRTs7O1dBR0c7UUFDSSxXQUFNLEdBQThDLEVBQUUsQ0FBQztJQXVHaEUsQ0FBQztJQXJHQzs7O09BR0c7SUFDSSxTQUFTLENBQUMsSUFBWTtRQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0NBQWdDO0lBRW5CLElBQUksQ0FBQyxJQUFZLEVBQUUsRUFBbUI7O1lBQ2pELE1BQU0sQ0FBQyxhQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDO0tBQUE7SUFFWSxPQUFPLENBQUMsSUFBWSxFQUFFLEtBQVU7O1lBQzNDLE1BQU0sQ0FBQyxhQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO0tBQUE7SUFFWSxHQUFHLENBQUMsSUFBWTs7WUFDM0IsTUFBTSxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFD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QThHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGZpbmQsXG4gIGZpbHRlcixcbiAgbWFwLFxuICByZW1vdmUsXG4gIHZhbHVlc1xufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE9STUFkYXB0ZXIgZnJvbSAnLi4vb3JtLWFkYXB0ZXInO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4uL21vZGVsJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgfSBmcm9tICcuLi9kZXNjcmlwdG9ycyc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxubGV0IGd1aWQgPSAwO1xuXG4vKipcbiAqIEFuIGluLW1lbW9yeSBPUk0gYWRhcHRlciBmb3IgZ2V0dGluZyBzdGFydGVkIHF1aWNrbHksIHRlc3RpbmcsIGFuZCBkZWJ1Z2dpbmcuIFNob3VsZCAqKm5vdCoqIGJlXG4gKiB1c2VkIGZvciBwcm9kdWN0aW9uIGRhdGEuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZW1vcnlBZGFwdGVyIGV4dGVuZHMgT1JNQWRhcHRlciB7XG5cblxuICAvKipcbiAgICogQW4gaW4tbWVtb3J5IGNhY2hlIG9mIHJlY29yZHMuIFRvcCBsZXZlbCBvYmplY3RzIGFyZSBjb2xsZWN0aW9ucyBvZiByZWNvcmRzIGJ5IHR5cGUsIGluZGV4ZWRcbiAgICogYnkgcmVjb3JkIGlkLlxuICAgKi9cbiAgcHVibGljIF9jYWNoZTogeyBbdHlwZTogc3RyaW5nXTogeyBbaWQ6IG51bWJlcl06IGFueSB9IH0gPSB7fTtcblxuICAvKipcbiAgICogR2V0IHRoZSBjb2xsZWN0aW9uIG9mIHJlY29yZHMgZm9yIGEgZ2l2ZW4gdHlwZSwgaW5kZXhlZCBieSByZWNvcmQgaWQuIElmIHRoZSBjb2xsZWN0aW9uIGRvZXNuJ3RcbiAgICogZXhpc3QgeWV0LCBjcmVhdGUgaXQgYW5kIHJldHVybiB0aGUgZW1wdHkgY29sbGVjdGlvbi5cbiAgICovXG4gIHB1YmxpYyBfY2FjaGVGb3IodHlwZTogc3RyaW5nKTogeyBbaWQ6IG51bWJlcl06IGFueSB9IHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlW3R5cGVdKSB7XG4gICAgICB0aGlzLl9jYWNoZVt0eXBlXSA9IHt9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVbdHlwZV07XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jc1xuXG4gIHB1YmxpYyBhc3luYyBmaW5kKHR5cGU6IHN0cmluZywgaWQ6IG51bWJlciB8IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGZpbmQodGhpcy5fY2FjaGVGb3IodHlwZSksIGlkKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmaW5kT25lKHR5cGU6IHN0cmluZywgcXVlcnk6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGZpbmQodGhpcy5fY2FjaGVGb3IodHlwZSksIHF1ZXJ5KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhbGwodHlwZTogc3RyaW5nKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIHJldHVybiB2YWx1ZXModGhpcy5fY2FjaGVGb3IodHlwZSkpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHR5cGU6IHN0cmluZywgcXVlcnk6IGFueSk6IFByb21pc2U8YW55W10+IHtcbiAgICByZXR1cm4gZmlsdGVyKHRoaXMuX2NhY2hlRm9yKHR5cGUpLCBxdWVyeSk7XG4gIH1cblxuICBwdWJsaWMgYnVpbGRSZWNvcmQodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBhbnkge1xuICAgIHRoaXMuX2NhY2hlRm9yKHR5cGUpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgcHVibGljIGlkRm9yKG1vZGVsOiBNb2RlbCkge1xuICAgIHJldHVybiBtb2RlbC5yZWNvcmQuaWQ7XG4gIH1cblxuICBwdWJsaWMgc2V0SWQobW9kZWw6IE1vZGVsLCB2YWx1ZTogbnVtYmVyKSB7XG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLl9jYWNoZUZvcihtb2RlbC50eXBlKTtcbiAgICBkZWxldGUgY29sbGVjdGlvblttb2RlbC5yZWNvcmQuaWRdO1xuICAgIG1vZGVsLnJlY29yZC5pZCA9IHZhbHVlO1xuICAgIGNvbGxlY3Rpb25bdmFsdWVdID0gbW9kZWwucmVjb3JkO1xuICB9XG5cbiAgcHVibGljIGdldEF0dHJpYnV0ZShtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBtb2RlbC5yZWNvcmRbcHJvcGVydHldO1xuICB9XG5cbiAgcHVibGljIHNldEF0dHJpYnV0ZShtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB0cnVlIHtcbiAgICBtb2RlbC5yZWNvcmRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwdWJsaWMgZGVsZXRlQXR0cmlidXRlKG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IHN0cmluZyk6IHRydWUge1xuICAgIG1vZGVsLnJlY29yZFtwcm9wZXJ0eV0gPSBudWxsO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldFJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcXVlcnk6IGFueSk6IFByb21pc2U8YW55fGFueVtdPiB7XG4gICAgbGV0IHJlbGF0ZWRDb2xsZWN0aW9uID0gdGhpcy5fY2FjaGVGb3IoZGVzY3JpcHRvci50eXBlKTtcbiAgICBpZiAoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzTWFueScpIHtcbiAgICAgIHJldHVybiBmaWx0ZXIocmVsYXRlZENvbGxlY3Rpb24sIChyZWxhdGVkUmVjb3JkOiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlY29yZFtgJHsgcmVsYXRpb25zaGlwIH1faWRzYF0uY29udGFpbnMocmVsYXRlZFJlY29yZC5pZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmluZE9uZShkZXNjcmlwdG9yLnR5cGUsIHsgaWQ6IG1vZGVsLnJlY29yZFtgJHsgcmVsYXRpb25zaGlwIH1faWRgXSB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzZXRSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlbGF0ZWRSZWNvcmRzOiBhbnl8YW55W10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWxhdGVkUmVjb3JkcykpIHtcbiAgICAgIGFzc2VydChkZXNjcmlwdG9yLm1vZGUgPT09ICdoYXNNYW55JywgYFlvdSB0cmllZCB0byBzZXQgJHsgcmVsYXRpb25zaGlwIH0gdG8gYW4gYXJyYXkgb2YgcmVsYXRlZCByZWNvcmRzLCBidXQgaXQgaXMgYSBoYXNPbmUgcmVsYXRpb25zaGlwYCk7XG4gICAgICBtb2RlbC5yZWNvcmRbYCR7IHJlbGF0aW9uc2hpcCB9X2lkc2BdID0gbWFwKHJlbGF0ZWRSZWNvcmRzLCAnaWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kZWwucmVjb3JkW2AkeyByZWxhdGlvbnNoaXAgfV9pZGBdID0gcmVsYXRlZFJlY29yZHMuaWQ7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFkZFJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVsYXRlZFJlY29yZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbW9kZWwucmVjb3JkW2AkeyByZWxhdGlvbnNoaXAgfV9pZHNgXS5wdXNoKHJlbGF0ZWRSZWNvcmQuaWQpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHJlbW92ZVJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVsYXRlZFJlY29yZDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmVtb3ZlKG1vZGVsLnJlY29yZFtgJHsgcmVsYXRpb25zaGlwIH1faWRzYF0sIHsgaWQ6IHJlbGF0ZWRSZWNvcmQuaWQgfSk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2F2ZVJlY29yZChtb2RlbDogTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuX2NhY2hlRm9yKG1vZGVsLnR5cGUpO1xuICAgIGlmIChtb2RlbC5yZWNvcmQuaWQgPT0gbnVsbCkge1xuICAgICAgZ3VpZCArPSAxO1xuICAgICAgbW9kZWwucmVjb3JkLmlkID0gZ3VpZDtcbiAgICB9XG4gICAgY29sbGVjdGlvblttb2RlbC5yZWNvcmQuaWRdID0gbW9kZWwucmVjb3JkO1xuICAgIHJldHVybiBtb2RlbC5yZWNvcmQ7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsZXRlUmVjb3JkKG1vZGVsOiBNb2RlbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5fY2FjaGVGb3IobW9kZWwudHlwZSk7XG4gICAgZGVsZXRlIGNvbGxlY3Rpb25bbW9kZWwucmVjb3JkLmlkXTtcbiAgfVxuXG59XG4iXX0=