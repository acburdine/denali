"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("../../lib/runtime/action");
class IndexAction extends action_1.default {
    respond() {
        return this.render(200, { hello: 'world' }, { serializer: 'raw' });
    }
}
exports.default = IndexAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYXBwL2FjdGlvbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBOEM7QUFFOUMsaUJBQWlDLFNBQVEsZ0JBQU07SUFFN0MsT0FBTztRQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FFRjtBQU5ELDhCQU1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFjdGlvbiBmcm9tICcuLi8uLi9saWIvcnVudGltZS9hY3Rpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmRleEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG5cbiAgcmVzcG9uZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXIoMjAwLCB7IGhlbGxvOiAnd29ybGQnIH0sIHsgc2VyaWFsaXplcjogJ3JhdycgfSk7XG4gIH1cblxufVxuIl19