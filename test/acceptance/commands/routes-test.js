"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ava_1 = require("ava");
const dedent = require("dedent-js");
const denali_1 = require("denali");
ava_1.default('routes command > prints list of configured routes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2NvbW1hbmRzL3JvdXRlcy10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUN2QixvQ0FBb0M7QUFDcEMsbUNBQStDO0FBRS9DLGFBQUksQ0FBQyxtREFBbUQsRUFBRSxDQUFPLENBQUM7SUFDaEUsSUFBSSxRQUFRLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLElBQUksTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFBOzs7Ozs7R0FNMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCAqIGFzIGRlZGVudCBmcm9tICdkZWRlbnQtanMnO1xuaW1wb3J0IHsgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IH0gZnJvbSAnZGVuYWxpJztcblxudGVzdCgncm91dGVzIGNvbW1hbmQgPiBwcmludHMgbGlzdCBvZiBjb25maWd1cmVkIHJvdXRlcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBnZW5lcmF0ZSA9IG5ldyBDb21tYW5kQWNjZXB0YW5jZVRlc3QoJ3JvdXRlcycsIHsgbmFtZTogJ3JvdXRlcy1jb21tYW5kJyB9KTtcblxuICBsZXQgcmVzdWx0ID0gYXdhaXQgZ2VuZXJhdGUucnVuKHsgZmFpbE9uU3RkZXJyOiB0cnVlIH0pO1xuICB0LnRydWUocmVzdWx0LnN0ZG91dC50cmltKCkuZW5kc1dpdGgoZGVkZW50YFxu4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXG7ilIIgVVJMICAg4pSCIEFDVElPTiDilIJcbuKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxu4pSCIEdFVCAvIOKUgiBpbmRleCAg4pSCXG7ilJTilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAgYC50cmltKCkpKTtcbn0pO1xuIl19