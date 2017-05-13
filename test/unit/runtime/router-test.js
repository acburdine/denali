"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const denali_1 = require("denali");
const dummyAppPath = path.join(__dirname, '..', 'dummy');
ava_1.default.todo('map creates routes');
ava_1.default.todo('handle finds matching route & hands off to action');
ava_1.default.todo('fails fast if action does not exist');
ava_1.default.todo('method shortcuts define routes');
ava_1.default.todo('resource() creates CRUD routes');
ava_1.default.todo('resource(name, { related: false }) creates CRUD routes except relationship ones');
ava_1.default.todo('resource(name, { except: [...] }) creates CRUD routes except listed ones');
ava_1.default.todo('resource(name, { only: [...] }) creates only listed CRUD routes');
ava_1.default.todo('namespace(name, ...) returns a wrapper to create routes under the namespace');
ava_1.default('runs middleware before determining routing', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let count = 0;
    let container = new denali_1.Container(dummyAppPath);
    container.register('app:router', denali_1.Router);
    container.register('app:logger', denali_1.Logger);
    container.register('parser:application', denali_1.FlatParser);
    container.register('config:environment', { environment: 'development' });
    container.register('service:db', {}, { instantiate: false });
    container.register('action:error', class TestAction extends denali_1.Action {
        respond() {
            count += 1;
            t.is(count, 2);
        }
    });
    let router = container.lookup('app:router');
    router.use((req, res, next) => {
        count += 1;
        t.is(count, 1);
        next();
    });
    yield router.handle((new denali_1.MockRequest()), new denali_1.MockResponse());
}));
ava_1.default('#urlFor works with string argument', (t) => {
    let container = new denali_1.Container(dummyAppPath);
    container.register('app:router', denali_1.Router);
    container.register('action:index', class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond() {
            // noop
        }
    });
    let router = container.lookup('app:router');
    router.get('/test/:id/', 'index');
    t.is(router.urlFor('index', { id: 10 }), '/test/10/', 'Router should return the correctly reversed url');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L3J1bnRpbWUvcm91dGVyLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2Qiw2QkFBNkI7QUFDN0IsbUNBT3lCO0FBRXpCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUV6RCxhQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDaEMsYUFBSSxDQUFDLElBQUksQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0FBQy9ELGFBQUksQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUNqRCxhQUFJLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDNUMsYUFBSSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQzVDLGFBQUksQ0FBQyxJQUFJLENBQUMsaUZBQWlGLENBQUMsQ0FBQztBQUM3RixhQUFJLENBQUMsSUFBSSxDQUFDLDBFQUEwRSxDQUFDLENBQUM7QUFDdEYsYUFBSSxDQUFDLElBQUksQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO0FBQzdFLGFBQUksQ0FBQyxJQUFJLENBQUMsNkVBQTZFLENBQUMsQ0FBQztBQUV6RixhQUFJLENBQUMsNENBQTRDLEVBQUUsQ0FBTyxDQUFDO0lBQ3pELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDVixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsZUFBTSxDQUFDLENBQUM7SUFDekMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsZUFBTSxDQUFDLENBQUM7SUFDekMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBVSxDQUFDLENBQUM7SUFDckQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzdELFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLGdCQUFpQixTQUFRLGVBQU07UUFDaEUsT0FBTztZQUNMLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBUyxZQUFZLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1FBQ3hCLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNmLElBQUksRUFBRSxDQUFDO0lBQ1QsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQU0sQ0FBQyxJQUFJLG9CQUFXLEVBQUUsQ0FBQyxFQUFRLElBQUkscUJBQVksRUFBRyxDQUFDLENBQUM7QUFDM0UsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLENBQUM7SUFDM0MsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTVDLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLGVBQU0sQ0FBQyxDQUFDO0lBQ3pDLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLGdCQUFpQixTQUFRLGVBQU07UUFBL0I7O1lBQ2pDLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJckIsQ0FBQztRQUhDLE9BQU87WUFDTCxPQUFPO1FBQ1QsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUVILElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbEMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO0FBQ3pHLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtcbiAgUm91dGVyLFxuICBNb2NrUmVxdWVzdCxcbiAgTW9ja1Jlc3BvbnNlLFxuICBDb250YWluZXIsXG4gIEFjdGlvbixcbiAgRmxhdFBhcnNlcixcbiAgTG9nZ2VyIH0gZnJvbSAnZGVuYWxpJztcblxuY29uc3QgZHVtbXlBcHBQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ2R1bW15Jyk7XG5cbnRlc3QudG9kbygnbWFwIGNyZWF0ZXMgcm91dGVzJyk7XG50ZXN0LnRvZG8oJ2hhbmRsZSBmaW5kcyBtYXRjaGluZyByb3V0ZSAmIGhhbmRzIG9mZiB0byBhY3Rpb24nKTtcbnRlc3QudG9kbygnZmFpbHMgZmFzdCBpZiBhY3Rpb24gZG9lcyBub3QgZXhpc3QnKTtcbnRlc3QudG9kbygnbWV0aG9kIHNob3J0Y3V0cyBkZWZpbmUgcm91dGVzJyk7XG50ZXN0LnRvZG8oJ3Jlc291cmNlKCkgY3JlYXRlcyBDUlVEIHJvdXRlcycpO1xudGVzdC50b2RvKCdyZXNvdXJjZShuYW1lLCB7IHJlbGF0ZWQ6IGZhbHNlIH0pIGNyZWF0ZXMgQ1JVRCByb3V0ZXMgZXhjZXB0IHJlbGF0aW9uc2hpcCBvbmVzJyk7XG50ZXN0LnRvZG8oJ3Jlc291cmNlKG5hbWUsIHsgZXhjZXB0OiBbLi4uXSB9KSBjcmVhdGVzIENSVUQgcm91dGVzIGV4Y2VwdCBsaXN0ZWQgb25lcycpO1xudGVzdC50b2RvKCdyZXNvdXJjZShuYW1lLCB7IG9ubHk6IFsuLi5dIH0pIGNyZWF0ZXMgb25seSBsaXN0ZWQgQ1JVRCByb3V0ZXMnKTtcbnRlc3QudG9kbygnbmFtZXNwYWNlKG5hbWUsIC4uLikgcmV0dXJucyBhIHdyYXBwZXIgdG8gY3JlYXRlIHJvdXRlcyB1bmRlciB0aGUgbmFtZXNwYWNlJyk7XG5cbnRlc3QoJ3J1bnMgbWlkZGxld2FyZSBiZWZvcmUgZGV0ZXJtaW5pbmcgcm91dGluZycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvdW50ID0gMDtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoZHVtbXlBcHBQYXRoKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhcHA6cm91dGVyJywgUm91dGVyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhcHA6bG9nZ2VyJywgTG9nZ2VyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdwYXJzZXI6YXBwbGljYXRpb24nLCBGbGF0UGFyc2VyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdjb25maWc6ZW52aXJvbm1lbnQnLCB7IGVudmlyb25tZW50OiAnZGV2ZWxvcG1lbnQnIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcnZpY2U6ZGInLCB7fSwgeyBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOmVycm9yJywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIGNvdW50ICs9IDE7XG4gICAgICB0LmlzKGNvdW50LCAyKTtcbiAgICB9XG4gIH0pO1xuICBsZXQgcm91dGVyID0gY29udGFpbmVyLmxvb2t1cDxSb3V0ZXI+KCdhcHA6cm91dGVyJyk7XG4gIHJvdXRlci51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgY291bnQgKz0gMTtcbiAgICB0LmlzKGNvdW50LCAxKTtcbiAgICBuZXh0KCk7XG4gIH0pO1xuICBhd2FpdCByb3V0ZXIuaGFuZGxlKDxhbnk+KG5ldyBNb2NrUmVxdWVzdCgpKSwgKDxhbnk+bmV3IE1vY2tSZXNwb25zZSgpKSk7XG59KTtcblxudGVzdCgnI3VybEZvciB3b3JrcyB3aXRoIHN0cmluZyBhcmd1bWVudCcsICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKGR1bW15QXBwUGF0aCk7XG5cbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhcHA6cm91dGVyJywgUm91dGVyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246aW5kZXgnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzZXJpYWxpemVyID0gZmFsc2U7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIC8vIG5vb3BcbiAgICB9XG4gIH0pO1xuXG4gIGxldCByb3V0ZXIgPSBjb250YWluZXIubG9va3VwKCdhcHA6cm91dGVyJyk7XG4gIHJvdXRlci5nZXQoJy90ZXN0LzppZC8nLCAnaW5kZXgnKTtcblxuICB0LmlzKHJvdXRlci51cmxGb3IoJ2luZGV4Jywge2lkOiAxMH0pLCAnL3Rlc3QvMTAvJywgJ1JvdXRlciBzaG91bGQgcmV0dXJuIHRoZSBjb3JyZWN0bHkgcmV2ZXJzZWQgdXJsJyk7XG59KTtcbiJdfQ==