"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const assert = require("assert");
const typeis = require("type-is");
const parser_1 = require("./parser");
const errors_1 = require("../runtime/errors");
const set_if_not_empty_1 = require("../utils/set-if-not-empty");
const inflection_1 = require("inflection");
class JSONAPIParser extends parser_1.default {
    /**
     * Unlike the other serializers, the default parse implementation does modify the incoming
     * payload. It converts the default dasherized attribute names into camelCase.
     *
     * The parse method here retains the JSONAPI document structure (i.e. data, included, links, meta,
     * etc), only modifying resource objects in place.
     */
    parse(request) {
        let result = {
            query: request.query,
            headers: request.headers,
            params: request.params
        };
        if (!typeis.hasBody(request) || !request.body) {
            return result;
        }
        try {
            assert(request.get('content-type') === 'application/vnd.api+json', 'Invalid content type - must have `application/vnd.api+json` as the request content type');
            assert(request.body.data, 'Invalid JSON-API document (missing top level `data` object - see http://jsonapi.org/format/#document-top-level)');
            let parseResource = this.parseResource.bind(this);
            if (request.body.data) {
                if (!lodash_1.isArray(request.body.data)) {
                    result.body = parseResource(request.body.data);
                }
                else {
                    result.body = request.body.data.map(parseResource);
                }
            }
            if (request.body.included) {
                result.included = request.body.included.map(parseResource);
            }
            return result;
        }
        catch (e) {
            if (e.name === 'AssertionError') {
                throw new errors_1.default.BadRequest(e.message);
            }
            throw e;
        }
    }
    /**
     * Parse a single resource object from a JSONAPI document. The resource object could come from the
     * top level `data` payload, or from the sideloaded `included` records.
     */
    parseResource(resource) {
        let parsedResource = {};
        set_if_not_empty_1.default(parsedResource, 'id', this.parseId(resource.id));
        Object.assign(parsedResource, this.parseAttributes(resource.attributes));
        Object.assign(parsedResource, this.parseRelationships(resource.relationships));
        return parsedResource;
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
exports.default = JSONAPIParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGkuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL3BhcnNlL2pzb24tYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBSWdCO0FBQ2hCLGlDQUFpQztBQUNqQyxrQ0FBa0M7QUFDbEMscUNBQThCO0FBQzlCLDhDQUF1QztBQUd2QyxnRUFBc0Q7QUFDdEQsMkNBQXlDO0FBT3pDLG1CQUFtQyxTQUFRLGdCQUFNO0lBRS9DOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxPQUFnQjtRQUNwQixJQUFJLE1BQU0sR0FBb0I7WUFDNUIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07U0FDdkIsQ0FBQztRQUVGLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVELElBQUksQ0FBQztZQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLDBCQUEwQixFQUFFLHlGQUF5RixDQUFDLENBQUM7WUFDOUosTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlIQUFpSCxDQUFDLENBQUM7WUFFN0ksSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7WUFDSCxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxNQUFNLElBQUksZ0JBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUM7SUFDSCxDQUFDO0lBR0Q7OztPQUdHO0lBQ08sYUFBYSxDQUFDLFFBQStCO1FBQ3JELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN4QiwwQkFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRCxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUMvRSxNQUFNLENBQUMsY0FBYyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7T0FFRztJQUNPLE9BQU8sQ0FBQyxFQUFVO1FBQzFCLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQ7O09BRUc7SUFDTyxTQUFTLENBQUMsSUFBWTtRQUM5QixNQUFNLENBQUMsd0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sZUFBZSxDQUFDLEtBQXdCO1FBQ2hELE1BQU0sQ0FBQyxnQkFBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHO1lBQy9CLE1BQU0sQ0FBQyxrQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7T0FHRztJQUNPLGtCQUFrQixDQUFDLGFBQW1DO1FBQzlELE1BQU0sQ0FBQyxnQkFBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHO1lBQ3ZDLE1BQU0sQ0FBQyxrQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUVGO0FBOUZELGdDQThGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzQXJyYXksXG4gIG1hcEtleXMsXG4gIGNhbWVsQ2FzZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyB0eXBlaXMgZnJvbSAndHlwZS1pcyc7XG5pbXBvcnQgUGFyc2VyIGZyb20gJy4vcGFyc2VyJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi4vcnVudGltZS9lcnJvcnMnO1xuaW1wb3J0IHsgUmVzcG9uZGVyUGFyYW1zIH0gZnJvbSAnLi4vcnVudGltZS9hY3Rpb24nO1xuaW1wb3J0IFJlcXVlc3QgZnJvbSAnLi4vcnVudGltZS9yZXF1ZXN0JztcbmltcG9ydCBzZXRJZk5vdEVtcHR5IGZyb20gJy4uL3V0aWxzL3NldC1pZi1ub3QtZW1wdHknO1xuaW1wb3J0IHsgc2luZ3VsYXJpemUgfSBmcm9tICdpbmZsZWN0aW9uJztcbmltcG9ydCB7XG4gIEpzb25BcGlSZXNvdXJjZU9iamVjdCxcbiAgSnNvbkFwaUF0dHJpYnV0ZXMsXG4gIEpzb25BcGlSZWxhdGlvbnNoaXBzXG59IGZyb20gJy4uL3JlbmRlci9qc29uLWFwaSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEpTT05BUElQYXJzZXIgZXh0ZW5kcyBQYXJzZXIge1xuXG4gIC8qKlxuICAgKiBVbmxpa2UgdGhlIG90aGVyIHNlcmlhbGl6ZXJzLCB0aGUgZGVmYXVsdCBwYXJzZSBpbXBsZW1lbnRhdGlvbiBkb2VzIG1vZGlmeSB0aGUgaW5jb21pbmdcbiAgICogcGF5bG9hZC4gSXQgY29udmVydHMgdGhlIGRlZmF1bHQgZGFzaGVyaXplZCBhdHRyaWJ1dGUgbmFtZXMgaW50byBjYW1lbENhc2UuXG4gICAqXG4gICAqIFRoZSBwYXJzZSBtZXRob2QgaGVyZSByZXRhaW5zIHRoZSBKU09OQVBJIGRvY3VtZW50IHN0cnVjdHVyZSAoaS5lLiBkYXRhLCBpbmNsdWRlZCwgbGlua3MsIG1ldGEsXG4gICAqIGV0YyksIG9ubHkgbW9kaWZ5aW5nIHJlc291cmNlIG9iamVjdHMgaW4gcGxhY2UuXG4gICAqL1xuICBwYXJzZShyZXF1ZXN0OiBSZXF1ZXN0KTogUmVzcG9uZGVyUGFyYW1zIHtcbiAgICBsZXQgcmVzdWx0OiBSZXNwb25kZXJQYXJhbXMgPSB7XG4gICAgICBxdWVyeTogcmVxdWVzdC5xdWVyeSxcbiAgICAgIGhlYWRlcnM6IHJlcXVlc3QuaGVhZGVycyxcbiAgICAgIHBhcmFtczogcmVxdWVzdC5wYXJhbXNcbiAgICB9O1xuXG4gICAgaWYgKCF0eXBlaXMuaGFzQm9keShyZXF1ZXN0KSB8fCAhcmVxdWVzdC5ib2R5KSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBhc3NlcnQocmVxdWVzdC5nZXQoJ2NvbnRlbnQtdHlwZScpID09PSAnYXBwbGljYXRpb24vdm5kLmFwaStqc29uJywgJ0ludmFsaWQgY29udGVudCB0eXBlIC0gbXVzdCBoYXZlIGBhcHBsaWNhdGlvbi92bmQuYXBpK2pzb25gIGFzIHRoZSByZXF1ZXN0IGNvbnRlbnQgdHlwZScpO1xuICAgICAgYXNzZXJ0KHJlcXVlc3QuYm9keS5kYXRhLCAnSW52YWxpZCBKU09OLUFQSSBkb2N1bWVudCAobWlzc2luZyB0b3AgbGV2ZWwgYGRhdGFgIG9iamVjdCAtIHNlZSBodHRwOi8vanNvbmFwaS5vcmcvZm9ybWF0LyNkb2N1bWVudC10b3AtbGV2ZWwpJyk7XG5cbiAgICAgIGxldCBwYXJzZVJlc291cmNlID0gdGhpcy5wYXJzZVJlc291cmNlLmJpbmQodGhpcyk7XG5cbiAgICAgIGlmIChyZXF1ZXN0LmJvZHkuZGF0YSkge1xuICAgICAgICBpZiAoIWlzQXJyYXkocmVxdWVzdC5ib2R5LmRhdGEpKSB7XG4gICAgICAgICAgcmVzdWx0LmJvZHkgPSBwYXJzZVJlc291cmNlKHJlcXVlc3QuYm9keS5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQuYm9keSA9IHJlcXVlc3QuYm9keS5kYXRhLm1hcChwYXJzZVJlc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocmVxdWVzdC5ib2R5LmluY2x1ZGVkKSB7XG4gICAgICAgIHJlc3VsdC5pbmNsdWRlZCA9IHJlcXVlc3QuYm9keS5pbmNsdWRlZC5tYXAocGFyc2VSZXNvdXJjZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSA9PT0gJ0Fzc2VydGlvbkVycm9yJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3JzLkJhZFJlcXVlc3QoZS5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogUGFyc2UgYSBzaW5nbGUgcmVzb3VyY2Ugb2JqZWN0IGZyb20gYSBKU09OQVBJIGRvY3VtZW50LiBUaGUgcmVzb3VyY2Ugb2JqZWN0IGNvdWxkIGNvbWUgZnJvbSB0aGVcbiAgICogdG9wIGxldmVsIGBkYXRhYCBwYXlsb2FkLCBvciBmcm9tIHRoZSBzaWRlbG9hZGVkIGBpbmNsdWRlZGAgcmVjb3Jkcy5cbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZVJlc291cmNlKHJlc291cmNlOiBKc29uQXBpUmVzb3VyY2VPYmplY3QpOiBhbnkge1xuICAgIGxldCBwYXJzZWRSZXNvdXJjZSA9IHt9O1xuICAgIHNldElmTm90RW1wdHkocGFyc2VkUmVzb3VyY2UsICdpZCcsIHRoaXMucGFyc2VJZChyZXNvdXJjZS5pZCkpO1xuICAgIE9iamVjdC5hc3NpZ24ocGFyc2VkUmVzb3VyY2UsIHRoaXMucGFyc2VBdHRyaWJ1dGVzKHJlc291cmNlLmF0dHJpYnV0ZXMpKTtcbiAgICBPYmplY3QuYXNzaWduKHBhcnNlZFJlc291cmNlLCB0aGlzLnBhcnNlUmVsYXRpb25zaGlwcyhyZXNvdXJjZS5yZWxhdGlvbnNoaXBzKSk7XG4gICAgcmV0dXJuIHBhcnNlZFJlc291cmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgcmVzb3VyY2Ugb2JqZWN0IGlkXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VJZChpZDogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSByZXNvdXJjZSBvYmplY3QncyB0eXBlIHN0cmluZ1xuICAgKi9cbiAgcHJvdGVjdGVkIHBhcnNlVHlwZSh0eXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBzaW5ndWxhcml6ZSh0eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHJlc291cmNlIG9iamVjdCdzIGF0dHJpYnV0ZXMuIEJ5IGRlZmF1bHQsIHRoaXMgY29udmVydHMgZnJvbSB0aGUgSlNPTkFQSSByZWNvbW1lbmRlZFxuICAgKiBkYXNoZXJpZWQga2V5cyB0byBjYW1lbENhc2UuXG4gICAqL1xuICBwcm90ZWN0ZWQgcGFyc2VBdHRyaWJ1dGVzKGF0dHJzOiBKc29uQXBpQXR0cmlidXRlcyk6IGFueSB7XG4gICAgcmV0dXJuIG1hcEtleXMoYXR0cnMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICByZXR1cm4gY2FtZWxDYXNlKGtleSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSByZXNvdXJjZSBvYmplY3QncyByZWxhdGlvbnNoaXBzLiBCeSBkZWZhdWx0LCB0aGlzIGNvbnZlcnRzIGZyb20gdGhlIEpTT05BUEkgcmVjb21tZW5kZWRcbiAgICogZGFzaGVyaWVkIGtleXMgdG8gY2FtZWxDYXNlLlxuICAgKi9cbiAgcHJvdGVjdGVkIHBhcnNlUmVsYXRpb25zaGlwcyhyZWxhdGlvbnNoaXBzOiBKc29uQXBpUmVsYXRpb25zaGlwcyk6IGFueSB7XG4gICAgcmV0dXJuIG1hcEtleXMocmVsYXRpb25zaGlwcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIHJldHVybiBjYW1lbENhc2Uoa2V5KTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=