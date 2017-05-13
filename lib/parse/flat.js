"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
class FlatParser extends parser_1.default {
    parse(request) {
        return {
            body: request.body,
            query: request.query,
            headers: request.headers,
            params: request.params
        };
    }
}
exports.default = FlatParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJsaWIvcGFyc2UvZmxhdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUE4QjtBQUk5QixnQkFBZ0MsU0FBUSxnQkFBTTtJQUU1QyxLQUFLLENBQUMsT0FBZ0I7UUFDcEIsTUFBTSxDQUFDO1lBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQ2xCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87WUFDeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1NBQ3ZCLENBQUM7SUFDSixDQUFDO0NBRUY7QUFYRCw2QkFXQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQYXJzZXIgZnJvbSAnLi9wYXJzZXInO1xuaW1wb3J0IFJlcXVlc3QgZnJvbSAnLi4vcnVudGltZS9yZXF1ZXN0JztcbmltcG9ydCB7IFJlc3BvbmRlclBhcmFtcyB9IGZyb20gJy4uL3J1bnRpbWUvYWN0aW9uJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxhdFBhcnNlciBleHRlbmRzIFBhcnNlciB7XG5cbiAgcGFyc2UocmVxdWVzdDogUmVxdWVzdCk6IFJlc3BvbmRlclBhcmFtcyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHk6IHJlcXVlc3QuYm9keSxcbiAgICAgIHF1ZXJ5OiByZXF1ZXN0LnF1ZXJ5LFxuICAgICAgaGVhZGVyczogcmVxdWVzdC5oZWFkZXJzLFxuICAgICAgcGFyYW1zOiByZXF1ZXN0LnBhcmFtc1xuICAgIH07XG4gIH1cblxufSJdfQ==