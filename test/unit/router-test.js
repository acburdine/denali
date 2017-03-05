"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('Router > runs middleware before determining routing', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let count = 0;
    let container = new denali_1.Container();
    let logger = new denali_1.Logger();
    container.register('config:environment', { environment: 'development' });
    container.register('action:error', class TestAction extends denali_1.Action {
        respond() {
            count += 1;
            t.is(count, 2);
        }
    });
    let router = new denali_1.Router({ container, logger });
    router.use((req, res, next) => {
        count += 1;
        t.is(count, 1);
        next();
    });
    yield router.handle((new denali_1.MockRequest()), new denali_1.MockResponse());
}));
ava_1.default('Router > does not attempt to serialize when action.serializer = false', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = new denali_1.Container();
    let logger = new denali_1.Logger();
    container.register('config:environment', { environment: 'development' });
    container.register('action:error', class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond(params) {
            t.fail(` Router should not have encountered an error:\n${params.error.stack}`);
        }
    });
    container.register('action:index', class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond() {
            t.pass();
        }
    });
    container.register('serializer:application', class extends denali_1.Serializer {
        parse() {
            t.fail('Router should not have attempted to parse this request with a serializer');
        }
        serialize() {
            t.fail('Router should not have attempted to serialize this response with a serializer');
        }
    });
    let router = new denali_1.Router({ container, logger });
    router.post('/', 'index');
    let req = new denali_1.MockRequest({ url: '/', method: 'POST' });
    req.write('{}');
    yield router.handle(req, new denali_1.MockResponse());
}));
ava_1.default('Router > #urlFor works with string argument', (t) => {
    let container = new denali_1.Container();
    let logger = new denali_1.Logger();
    container.register('action:index', class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond() {
            // noop
        }
    });
    let router = new denali_1.Router({ container, logger });
    router.get('/test/:id/', 'index');
    t.is(router.urlFor('index', { id: 10 }), '/test/10/', 'Router should return the correctly reversed url');
});
ava_1.default('Router > #urlFor works with action argument', (t) => {
    let container = new denali_1.Container();
    let logger = new denali_1.Logger();
    container.register('action:index', class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond() {
            // noop
        }
    });
    let router = new denali_1.Router({ container, logger });
    router.get('/test/:id/', 'index');
    let TestAction = container.lookup('action:index');
    t.is(router.urlFor(TestAction, { id: 10 }), '/test/10/', 'Router should return the correctly reversed url');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L3JvdXRlci10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFFdkIsbUNBT3lCO0FBRXpCLGFBQUksQ0FBQyxxREFBcUQsRUFBRSxDQUFPLENBQUM7SUFDbEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNkLElBQUksU0FBUyxHQUFHLElBQUksa0JBQVMsRUFBRSxDQUFDO0lBQ2hDLElBQUksTUFBTSxHQUFHLElBQUksZUFBTSxFQUFFLENBQUM7SUFDMUIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLGdCQUFpQixTQUFRLGVBQU07UUFDaEUsT0FBTztZQUNMLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUMvQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJO1FBQ3hCLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNmLElBQUksRUFBRSxDQUFDO0lBQ1QsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQU0sQ0FBQyxJQUFJLG9CQUFXLEVBQUUsQ0FBQyxFQUFRLElBQUkscUJBQVksRUFBRyxDQUFDLENBQUM7QUFDM0UsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx1RUFBdUUsRUFBRSxDQUFPLENBQUM7SUFDcEYsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLElBQUksU0FBUyxHQUFHLElBQUksa0JBQVMsRUFBRSxDQUFDO0lBQ2hDLElBQUksTUFBTSxHQUFHLElBQUksZUFBTSxFQUFFLENBQUM7SUFDMUIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLGdCQUFpQixTQUFRLGVBQU07UUFBL0I7O1lBQ2pDLGVBQVUsR0FBVSxLQUFLLENBQUM7UUFJNUIsQ0FBQztRQUhDLE9BQU8sQ0FBQyxNQUFXO1lBQ2pCLENBQUMsQ0FBQyxJQUFJLENBQUMsa0RBQW1ELE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBTSxFQUFFLENBQUMsQ0FBQztRQUNuRixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsZ0JBQWlCLFNBQVEsZUFBTTtRQUEvQjs7WUFDakMsZUFBVSxHQUFVLEtBQUssQ0FBQztRQUk1QixDQUFDO1FBSEMsT0FBTztZQUNMLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRixDQUFDLENBQUM7SUFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEtBQU0sU0FBUSxtQkFBVTtRQUNuRSxLQUFLO1lBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFDRCxTQUFTO1lBQ1AsQ0FBQyxDQUFDLElBQUksQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FDRixDQUFDLENBQUM7SUFDSCxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTFCLElBQUksR0FBRyxHQUFHLElBQUksb0JBQVcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDeEQsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQU0sR0FBRyxFQUFPLElBQUkscUJBQVksRUFBRSxDQUFDLENBQUM7QUFDekQsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyw2Q0FBNkMsRUFBRSxDQUFDLENBQUM7SUFDcEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7SUFDaEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztJQUUxQixTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxnQkFBaUIsU0FBUSxlQUFNO1FBQS9COztZQUNqQyxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSXJCLENBQUM7UUFIQyxPQUFPO1lBQ0wsT0FBTztRQUNULENBQUM7S0FDRixDQUFDLENBQUM7SUFFSCxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsaURBQWlELENBQUMsQ0FBQztBQUN6RyxDQUFDLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyw2Q0FBNkMsRUFBRSxDQUFDLENBQUM7SUFDcEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7SUFDaEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztJQUUxQixTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxnQkFBaUIsU0FBUSxlQUFNO1FBQS9COztZQUNqQyxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSXJCLENBQUM7UUFIQyxPQUFPO1lBQ0wsT0FBTztRQUNULENBQUM7S0FDRixDQUFDLENBQUM7SUFFSCxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO0FBQzVHLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgeyBJbmNvbWluZ01lc3NhZ2UgfSBmcm9tICdodHRwJztcbmltcG9ydCB7XG4gIExvZ2dlcixcbiAgUm91dGVyLFxuICBNb2NrUmVxdWVzdCxcbiAgTW9ja1Jlc3BvbnNlLFxuICBDb250YWluZXIsXG4gIFNlcmlhbGl6ZXIsXG4gIEFjdGlvbiB9IGZyb20gJ2RlbmFsaSc7XG5cbnRlc3QoJ1JvdXRlciA+IHJ1bnMgbWlkZGxld2FyZSBiZWZvcmUgZGV0ZXJtaW5pbmcgcm91dGluZycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvdW50ID0gMDtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdjb25maWc6ZW52aXJvbm1lbnQnLCB7IGVudmlyb25tZW50OiAnZGV2ZWxvcG1lbnQnIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjplcnJvcicsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICBjb3VudCArPSAxO1xuICAgICAgdC5pcyhjb3VudCwgMik7XG4gICAgfVxuICB9KTtcbiAgbGV0IHJvdXRlciA9IG5ldyBSb3V0ZXIoeyBjb250YWluZXIsIGxvZ2dlciB9KTtcbiAgcm91dGVyLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBjb3VudCArPSAxO1xuICAgIHQuaXMoY291bnQsIDEpO1xuICAgIG5leHQoKTtcbiAgfSk7XG4gIGF3YWl0IHJvdXRlci5oYW5kbGUoPGFueT4obmV3IE1vY2tSZXF1ZXN0KCkpLCAoPGFueT5uZXcgTW9ja1Jlc3BvbnNlKCkpKTtcbn0pO1xuXG50ZXN0KCdSb3V0ZXIgPiBkb2VzIG5vdCBhdHRlbXB0IHRvIHNlcmlhbGl6ZSB3aGVuIGFjdGlvbi5zZXJpYWxpemVyID0gZmFsc2UnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG4gIGxldCBsb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignY29uZmlnOmVudmlyb25tZW50JywgeyBlbnZpcm9ubWVudDogJ2RldmVsb3BtZW50JyB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246ZXJyb3InLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzZXJpYWxpemVyOiBmYWxzZSA9IGZhbHNlO1xuICAgIHJlc3BvbmQocGFyYW1zOiBhbnkpIHtcbiAgICAgIHQuZmFpbChgIFJvdXRlciBzaG91bGQgbm90IGhhdmUgZW5jb3VudGVyZWQgYW4gZXJyb3I6XFxuJHsgcGFyYW1zLmVycm9yLnN0YWNrIH1gKTtcbiAgICB9XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjppbmRleCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHNlcmlhbGl6ZXI6IGZhbHNlID0gZmFsc2U7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgcGFyc2UoKSB7XG4gICAgICB0LmZhaWwoJ1JvdXRlciBzaG91bGQgbm90IGhhdmUgYXR0ZW1wdGVkIHRvIHBhcnNlIHRoaXMgcmVxdWVzdCB3aXRoIGEgc2VyaWFsaXplcicpO1xuICAgIH1cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICB0LmZhaWwoJ1JvdXRlciBzaG91bGQgbm90IGhhdmUgYXR0ZW1wdGVkIHRvIHNlcmlhbGl6ZSB0aGlzIHJlc3BvbnNlIHdpdGggYSBzZXJpYWxpemVyJyk7XG4gICAgfVxuICB9KTtcbiAgbGV0IHJvdXRlciA9IG5ldyBSb3V0ZXIoeyBjb250YWluZXIsIGxvZ2dlciB9KTtcbiAgcm91dGVyLnBvc3QoJy8nLCAnaW5kZXgnKTtcblxuICBsZXQgcmVxID0gbmV3IE1vY2tSZXF1ZXN0KHsgdXJsOiAnLycsIG1ldGhvZDogJ1BPU1QnIH0pO1xuICByZXEud3JpdGUoJ3t9Jyk7XG4gIGF3YWl0IHJvdXRlci5oYW5kbGUoPGFueT5yZXEsIDxhbnk+bmV3IE1vY2tSZXNwb25zZSgpKTtcbn0pO1xuXG50ZXN0KCdSb3V0ZXIgPiAjdXJsRm9yIHdvcmtzIHdpdGggc3RyaW5nIGFyZ3VtZW50JywgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblxuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjppbmRleCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHNlcmlhbGl6ZXIgPSBmYWxzZTtcbiAgICByZXNwb25kKCkge1xuICAgICAgLy8gbm9vcFxuICAgIH1cbiAgfSk7XG5cbiAgbGV0IHJvdXRlciA9IG5ldyBSb3V0ZXIoeyBjb250YWluZXIsIGxvZ2dlciB9KTtcbiAgcm91dGVyLmdldCgnL3Rlc3QvOmlkLycsICdpbmRleCcpO1xuXG4gIHQuaXMocm91dGVyLnVybEZvcignaW5kZXgnLCB7aWQ6IDEwfSksICcvdGVzdC8xMC8nLCAnUm91dGVyIHNob3VsZCByZXR1cm4gdGhlIGNvcnJlY3RseSByZXZlcnNlZCB1cmwnKTtcbn0pO1xuXG50ZXN0KCdSb3V0ZXIgPiAjdXJsRm9yIHdvcmtzIHdpdGggYWN0aW9uIGFyZ3VtZW50JywgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblxuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjppbmRleCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHNlcmlhbGl6ZXIgPSBmYWxzZTtcbiAgICByZXNwb25kKCkge1xuICAgICAgLy8gbm9vcFxuICAgIH1cbiAgfSk7XG5cbiAgbGV0IHJvdXRlciA9IG5ldyBSb3V0ZXIoeyBjb250YWluZXIsIGxvZ2dlciB9KTtcbiAgcm91dGVyLmdldCgnL3Rlc3QvOmlkLycsICdpbmRleCcpO1xuXG4gIGxldCBUZXN0QWN0aW9uID0gY29udGFpbmVyLmxvb2t1cCgnYWN0aW9uOmluZGV4Jyk7XG4gIHQuaXMocm91dGVyLnVybEZvcihUZXN0QWN0aW9uLCB7aWQ6IDEwfSksICcvdGVzdC8xMC8nLCAnUm91dGVyIHNob3VsZCByZXR1cm4gdGhlIGNvcnJlY3RseSByZXZlcnNlZCB1cmwnKTtcbn0pO1xuIl19