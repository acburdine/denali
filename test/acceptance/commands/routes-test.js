"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ava_1 = require("ava");
const dedent = require("dedent-js");
const denali_cli_1 = require("denali-cli");
ava_1.default('prints list of configured routes', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let generate = new denali_cli_1.CommandAcceptanceTest('routes', { name: 'routes-command' });
    let result = yield generate.run({ failOnStderr: true });
    t.true(result.stdout.trim().endsWith(dedent `
┌───────┬────────┐
│ URL   │ ACTION │
├───────┼────────┤
│ GET / │ index  │
└───────┴────────┘
  `.trim()));
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2NvbW1hbmRzL3JvdXRlcy10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUN2QixvQ0FBb0M7QUFDcEMsMkNBQW1EO0FBRW5ELGFBQUksQ0FBQyxrQ0FBa0MsRUFBRSxDQUFPLENBQUM7SUFDL0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxrQ0FBcUIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLElBQUksTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFBOzs7Ozs7R0FNMUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDYixDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCAqIGFzIGRlZGVudCBmcm9tICdkZWRlbnQtanMnO1xuaW1wb3J0IHsgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5cbnRlc3QoJ3ByaW50cyBsaXN0IG9mIGNvbmZpZ3VyZWQgcm91dGVzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGdlbmVyYXRlID0gbmV3IENvbW1hbmRBY2NlcHRhbmNlVGVzdCgncm91dGVzJywgeyBuYW1lOiAncm91dGVzLWNvbW1hbmQnIH0pO1xuXG4gIGxldCByZXN1bHQgPSBhd2FpdCBnZW5lcmF0ZS5ydW4oeyBmYWlsT25TdGRlcnI6IHRydWUgfSk7XG4gIHQudHJ1ZShyZXN1bHQuc3Rkb3V0LnRyaW0oKS5lbmRzV2l0aChkZWRlbnRgXG7ilIzilIDilIDilIDilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilIDilIDilIDilJBcbuKUgiBVUkwgICDilIIgQUNUSU9OIOKUglxu4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkXG7ilIIgR0VUIC8g4pSCIGluZGV4ICDilIJcbuKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxuICBgLnRyaW0oKSkpO1xufSk7XG4iXX0=