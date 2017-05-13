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
    buildRecord(type, data = {}) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9kYXRhL21lbW9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FNZ0I7QUFDaEIsK0NBQXVDO0FBR3ZDLGlDQUFpQztBQUNqQywyQ0FBeUM7QUFFekMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBRWI7Ozs7O0dBS0c7QUFDSCxtQkFBbUMsU0FBUSxxQkFBVTtJQUFyRDs7UUFHRTs7O1dBR0c7UUFDSCxXQUFNLEdBQThDLEVBQUUsQ0FBQztJQWdIekQsQ0FBQztJQTlHQzs7O09BR0c7SUFDSCxTQUFTLENBQUMsSUFBWTtRQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsZ0NBQWdDO0lBRTFCLElBQUksQ0FBQyxJQUFZLEVBQUUsRUFBVTs7WUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQzFDLENBQUM7S0FBQTtJQUVLLFFBQVEsQ0FBQyxJQUFZLEVBQUUsS0FBVTs7WUFDckMsTUFBTSxDQUFDLGFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQztRQUNuRCxDQUFDO0tBQUE7SUFFSyxHQUFHLENBQUMsSUFBWTs7WUFDcEIsTUFBTSxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFD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NUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxJQUFJLENBQUMsQ0FBQztnQkFDVixLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDekIsQ0FBQztZQUNELFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDM0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDdEIsQ0FBQztLQUFBO0lBRUssWUFBWSxDQUFDLEtBQVk7O1lBQzdCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUFBO0NBRUY7QUF2SEQsZ0NBdUhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZmluZCxcbiAgZmlsdGVyLFxuICBtYXAsXG4gIHJlbW92ZSxcbiAgdmFsdWVzXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgT1JNQWRhcHRlciBmcm9tICcuL29ybS1hZGFwdGVyJztcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IgfSBmcm9tICcuL2Rlc2NyaXB0b3JzJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgc2luZ3VsYXJpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcblxubGV0IGd1aWQgPSAwO1xuXG4vKipcbiAqIEFuIGluLW1lbW9yeSBPUk0gYWRhcHRlciBmb3IgZ2V0dGluZyBzdGFydGVkIHF1aWNrbHksIHRlc3RpbmcsIGFuZCBkZWJ1Z2dpbmcuIFNob3VsZCAqKm5vdCoqIGJlXG4gKiB1c2VkIGZvciBwcm9kdWN0aW9uIGRhdGEuXG4gKlxuICogQHBhY2thZ2UgZGF0YVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZW1vcnlBZGFwdGVyIGV4dGVuZHMgT1JNQWRhcHRlciB7XG5cblxuICAvKipcbiAgICogQW4gaW4tbWVtb3J5IGNhY2hlIG9mIHJlY29yZHMuIFRvcCBsZXZlbCBvYmplY3RzIGFyZSBjb2xsZWN0aW9ucyBvZiByZWNvcmRzIGJ5IHR5cGUsIGluZGV4ZWRcbiAgICogYnkgcmVjb3JkIGlkLlxuICAgKi9cbiAgX2NhY2hlOiB7IFt0eXBlOiBzdHJpbmddOiB7IFtpZDogbnVtYmVyXTogYW55IH0gfSA9IHt9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbGxlY3Rpb24gb2YgcmVjb3JkcyBmb3IgYSBnaXZlbiB0eXBlLCBpbmRleGVkIGJ5IHJlY29yZCBpZC4gSWYgdGhlIGNvbGxlY3Rpb24gZG9lc24ndFxuICAgKiBleGlzdCB5ZXQsIGNyZWF0ZSBpdCBhbmQgcmV0dXJuIHRoZSBlbXB0eSBjb2xsZWN0aW9uLlxuICAgKi9cbiAgX2NhY2hlRm9yKHR5cGU6IHN0cmluZyk6IHsgW2lkOiBudW1iZXJdOiBhbnkgfSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZVt0eXBlXSkge1xuICAgICAgdGhpcy5fY2FjaGVbdHlwZV0gPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlW3R5cGVdO1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3NcblxuICBhc3luYyBmaW5kKHR5cGU6IHN0cmluZywgaWQ6IG51bWJlcik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlRm9yKHR5cGUpW2lkXSB8fCBudWxsO1xuICB9XG5cbiAgYXN5bmMgcXVlcnlPbmUodHlwZTogc3RyaW5nLCBxdWVyeTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gZmluZCh0aGlzLl9jYWNoZUZvcih0eXBlKSwgcXVlcnkpIHx8IG51bGw7XG4gIH1cblxuICBhc3luYyBhbGwodHlwZTogc3RyaW5nKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIHJldHVybiB2YWx1ZXModGhpcy5fY2FjaGVGb3IodHlwZSkpO1xuICB9XG5cbiAgYXN5bmMgcXVlcnkodHlwZTogc3RyaW5nLCBxdWVyeTogYW55KTogUHJvbWlzZTxhbnlbXT4ge1xuICAgIHJldHVybiBmaWx0ZXIodGhpcy5fY2FjaGVGb3IodHlwZSksIHF1ZXJ5KTtcbiAgfVxuXG4gIGJ1aWxkUmVjb3JkKHR5cGU6IHN0cmluZywgZGF0YTogYW55ID0ge30pOiBhbnkge1xuICAgIHRoaXMuX2NhY2hlRm9yKHR5cGUpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgaWRGb3IobW9kZWw6IE1vZGVsKSB7XG4gICAgcmV0dXJuIG1vZGVsLnJlY29yZC5pZDtcbiAgfVxuXG4gIHNldElkKG1vZGVsOiBNb2RlbCwgdmFsdWU6IG51bWJlcikge1xuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5fY2FjaGVGb3IobW9kZWwudHlwZSk7XG4gICAgZGVsZXRlIGNvbGxlY3Rpb25bbW9kZWwucmVjb3JkLmlkXTtcbiAgICBtb2RlbC5yZWNvcmQuaWQgPSB2YWx1ZTtcbiAgICBjb2xsZWN0aW9uW3ZhbHVlXSA9IG1vZGVsLnJlY29yZDtcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZShtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBtb2RlbC5yZWNvcmRbcHJvcGVydHldO1xuICB9XG5cbiAgc2V0QXR0cmlidXRlKG1vZGVsOiBNb2RlbCwgcHJvcGVydHk6IHN0cmluZywgdmFsdWU6IGFueSk6IHRydWUge1xuICAgIG1vZGVsLnJlY29yZFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRlbGV0ZUF0dHJpYnV0ZShtb2RlbDogTW9kZWwsIHByb3BlcnR5OiBzdHJpbmcpOiB0cnVlIHtcbiAgICBtb2RlbC5yZWNvcmRbcHJvcGVydHldID0gbnVsbDtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGdldFJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcXVlcnk6IGFueSk6IFByb21pc2U8YW55fGFueVtdPiB7XG4gICAgbGV0IHJlbGF0ZWRDb2xsZWN0aW9uID0gdGhpcy5fY2FjaGVGb3IoZGVzY3JpcHRvci50eXBlKTtcbiAgICBpZiAoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzTWFueScpIHtcbiAgICAgIGxldCByZWxhdGVkID0gZmlsdGVyKHJlbGF0ZWRDb2xsZWN0aW9uLCAocmVsYXRlZFJlY29yZDogYW55KSA9PiB7XG4gICAgICAgIGxldCByZWxhdGVkSWRzID0gbW9kZWwucmVjb3JkW2AkeyBzaW5ndWxhcml6ZShyZWxhdGlvbnNoaXApIH1faWRzYF07XG4gICAgICAgIHJldHVybiByZWxhdGVkSWRzICYmIHJlbGF0ZWRJZHMuaW5jbHVkZXMocmVsYXRlZFJlY29yZC5pZCk7XG4gICAgICB9KTtcbiAgICAgIGlmIChxdWVyeSkge1xuICAgICAgICByZWxhdGVkID0gZmlsdGVyKHJlbGF0ZWQsIHF1ZXJ5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWxhdGVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5xdWVyeU9uZShkZXNjcmlwdG9yLnR5cGUsIHsgaWQ6IG1vZGVsLnJlY29yZFtgJHsgcmVsYXRpb25zaGlwIH1faWRgXSB9KTtcbiAgfVxuXG4gIGFzeW5jIHNldFJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogUmVsYXRpb25zaGlwRGVzY3JpcHRvciwgcmVsYXRlZE1vZGVsczogTW9kZWx8TW9kZWxbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJlbGF0ZWRNb2RlbHMpKSB7XG4gICAgICBhc3NlcnQoZGVzY3JpcHRvci5tb2RlID09PSAnaGFzTWFueScsIGBZb3UgdHJpZWQgdG8gc2V0ICR7IHJlbGF0aW9uc2hpcCB9IHRvIGFuIGFycmF5IG9mIHJlbGF0ZWQgcmVjb3JkcywgYnV0IGl0IGlzIGEgaGFzT25lIHJlbGF0aW9uc2hpcGApO1xuICAgICAgbW9kZWwucmVjb3JkW2AkeyBzaW5ndWxhcml6ZShyZWxhdGlvbnNoaXApIH1faWRzYF0gPSBtYXAocmVsYXRlZE1vZGVscywgJ3JlY29yZC5pZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtb2RlbC5yZWNvcmRbYCR7IHJlbGF0aW9uc2hpcCB9X2lkYF0gPSByZWxhdGVkTW9kZWxzLnJlY29yZC5pZDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBhZGRSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IFJlbGF0aW9uc2hpcERlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbDogTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgcmVsYXRlZElkcyA9IG1vZGVsLnJlY29yZFtgJHsgc2luZ3VsYXJpemUocmVsYXRpb25zaGlwKSB9X2lkc2BdO1xuICAgIGlmICghcmVsYXRlZElkcykge1xuICAgICAgcmVsYXRlZElkcyA9IG1vZGVsLnJlY29yZFtgJHsgc2luZ3VsYXJpemUocmVsYXRpb25zaGlwKSB9X2lkc2BdID0gW107XG4gICAgfVxuICAgIHJlbGF0ZWRJZHMucHVzaChyZWxhdGVkTW9kZWwuaWQpO1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlUmVsYXRlZChtb2RlbDogTW9kZWwsIHJlbGF0aW9uc2hpcDogc3RyaW5nLCBkZXNjcmlwdG9yOiBSZWxhdGlvbnNoaXBEZXNjcmlwdG9yLCByZWxhdGVkTW9kZWw6IE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmVtb3ZlKG1vZGVsLnJlY29yZFtgJHsgc2luZ3VsYXJpemUocmVsYXRpb25zaGlwKSB9X2lkc2BdLCAoaWQpID0+IGlkID09PSByZWxhdGVkTW9kZWwuaWQpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVJlY29yZChtb2RlbDogTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuX2NhY2hlRm9yKG1vZGVsLnR5cGUpO1xuICAgIGlmIChtb2RlbC5yZWNvcmQuaWQgPT0gbnVsbCkge1xuICAgICAgZ3VpZCArPSAxO1xuICAgICAgbW9kZWwucmVjb3JkLmlkID0gZ3VpZDtcbiAgICB9XG4gICAgY29sbGVjdGlvblttb2RlbC5yZWNvcmQuaWRdID0gbW9kZWwucmVjb3JkO1xuICAgIHJldHVybiBtb2RlbC5yZWNvcmQ7XG4gIH1cblxuICBhc3luYyBkZWxldGVSZWNvcmQobW9kZWw6IE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLl9jYWNoZUZvcihtb2RlbC50eXBlKTtcbiAgICBkZWxldGUgY29sbGVjdGlvblttb2RlbC5yZWNvcmQuaWRdO1xuICB9XG5cbn1cbiJdfQ==