"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("../../lib/runtime/action");
const response_1 = require("../../lib/runtime/response");
class IndexAction extends action_1.default {
    respond() {
        return new response_1.default(200, { hello: 'world' }, { raw: true });
    }
}
exports.default = IndexAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYXBwL2FjdGlvbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBOEM7QUFDOUMseURBQWtEO0FBRWxELGlCQUFpQyxTQUFRLGdCQUFNO0lBRTdDLE9BQU87UUFDTCxNQUFNLENBQUMsSUFBSSxrQkFBUSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzlELENBQUM7Q0FFRjtBQU5ELDhCQU1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFjdGlvbiBmcm9tICcuLi8uLi9saWIvcnVudGltZS9hY3Rpb24nO1xuaW1wb3J0IFJlc3BvbnNlIGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL3Jlc3BvbnNlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5kZXhBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuXG4gIHJlc3BvbmQoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSgyMDAsIHsgaGVsbG86ICd3b3JsZCcgfSwgeyByYXc6IHRydWUgfSk7XG4gIH1cblxufVxuIl19