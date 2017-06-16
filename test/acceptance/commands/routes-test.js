"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ava_1 = require("ava");
const dedent = require("dedent-js");
const denali_1 = require("denali");
ava_1.default('prints list of configured routes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let generate = new denali_1.CommandAcceptanceTest('routes', { name: 'routes-command' });
    let result = yield generate.run({ failOnStderr: true });
    t.true(result.stdout.trim().endsWith(dedent `
┌───────┬────────┐
│ URL   │ ACTION │
├───────┼────────┤
│ GET / │ index  │
└───────┴────────┘
  `.trim()));
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2NvbW1hbmRzL3JvdXRlcy10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUN2QixvQ0FBb0M7QUFDcEMsbUNBQStDO0FBRS9DLGFBQUksQ0FBQyxrQ0FBa0MsRUFBRSxDQUFPLENBQUM7SUFDL0MsSUFBSSxRQUFRLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLElBQUksTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFBOzs7Ozs7R0FNMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCAqIGFzIGRlZGVudCBmcm9tICdkZWRlbnQtanMnO1xuaW1wb3J0IHsgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IH0gZnJvbSAnZGVuYWxpJztcblxudGVzdCgncHJpbnRzIGxpc3Qgb2YgY29uZmlndXJlZCByb3V0ZXMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgZ2VuZXJhdGUgPSBuZXcgQ29tbWFuZEFjY2VwdGFuY2VUZXN0KCdyb3V0ZXMnLCB7IG5hbWU6ICdyb3V0ZXMtY29tbWFuZCcgfSk7XG5cbiAgbGV0IHJlc3VsdCA9IGF3YWl0IGdlbmVyYXRlLnJ1bih7IGZhaWxPblN0ZGVycjogdHJ1ZSB9KTtcbiAgdC50cnVlKHJlc3VsdC5zdGRvdXQudHJpbSgpLmVuZHNXaXRoKGRlZGVudGBcbuKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxu4pSCIFVSTCAgIOKUgiBBQ1RJT04g4pSCXG7ilJzilIDilIDilIDilIDilIDilIDilIDilLzilIDilIDilIDilIDilIDilIDilIDilIDilKRcbuKUgiBHRVQgLyDilIIgaW5kZXggIOKUglxu4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gIGAudHJpbSgpKSk7XG59KTtcbiJdfQ==