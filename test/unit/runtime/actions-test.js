"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
function mockRequest(options) {
    return new denali_1.Request(new denali_1.MockRequest(options));
}
ava_1.default.beforeEach((t) => {
    let container = t.context.container = new denali_1.Container(__dirname);
    container.register('parser:application', denali_1.FlatParser);
    container.register('serializer:application', denali_1.RawSerializer);
    container.register('service:db', {}, { instantiate: false });
    container.register('config:environment', {});
    t.context.runAction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        let response = new denali_1.MockResponse();
        let action = yield container.lookup('action:test');
        action.actionPath = 'test';
        yield action.run(mockRequest(options), response);
        // If we can parse a response, return that, otherwise just return false (lots of these tests
        // don't care about the response bod);
        try {
            return response._getJSON();
        }
        catch (e) {
            return false;
        }
    });
});
ava_1.default.todo('renders with a custom view if provided');
ava_1.default.todo('throws if nothing renders');
ava_1.default('invokes respond() with params', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('action:test', class TestAction extends denali_1.Action {
        respond({ query }) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.is(query.foo, 'bar');
                t.pass();
                return {};
            });
        }
    });
    yield t.context.runAction({ url: '/?foo=bar' });
}));
ava_1.default('does not invoke the serializer if no response body was provided', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.fail('Serializer should not be invoked');
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            this.render(200);
        }
    });
    yield t.context.runAction();
}));
ava_1.default('uses a specified serializer type when provided', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('serializer:foo', class TestSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
                yield this.render(200, {}, { serializer: 'foo' });
            });
        }
    });
    yield t.context.runAction();
}));
ava_1.default('renders with the model type serializer if a model was rendered', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('serializer:foo', class FooSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            return new Proxy({
                constructor: { type: 'foo' },
                type: 'foo'
            }, {
                getPrototypeOf() {
                    return denali_1.Model.prototype;
                }
            });
        }
    });
    yield t.context.runAction();
}));
ava_1.default('renders with the application serializer if all options exhausted', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('serializer:application', class TestSerializer extends denali_1.Serializer {
        constructor() {
            super(...arguments);
            this.attributes = [];
            this.relationships = {};
        }
        serialize(action, body, options) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.pass();
            });
        }
    });
    container.register('action:test', class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            return {};
        }
    });
    yield t.context.runAction();
}));
ava_1.default('invokes before filters prior to respond()', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sequence = [];
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            beforeFilter() { sequence.push('before'); }
            respond() { sequence.push('respond'); return {}; }
            afterFilter() { sequence.push('after'); }
        },
        _a.before = ['beforeFilter'],
        _a.after = ['afterFilter'],
        _a));
    yield t.context.runAction();
    t.deepEqual(sequence, ['before', 'respond', 'after']);
    var _a;
}));
ava_1.default('invokes superclass filters before subclass filters', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sequence = [];
    let container = t.context.container;
    class ParentClass extends denali_1.Action {
        parentBefore() { sequence.push('parent'); }
    }
    ParentClass.before = ['parentBefore'];
    container.register('action:test', (_a = class ChildClass extends ParentClass {
            childBefore() { sequence.push('child'); }
            respond() { return {}; }
        },
        _a.before = ['childBefore'],
        _a));
    yield t.context.runAction();
    t.deepEqual(sequence, ['parent', 'child']);
    var _a;
}));
ava_1.default('error out when an non-existent filter was specified', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() { }
        },
        _a.before = ['some-non-existent-method'],
        _a));
    // tslint:disable-next-line:no-floating-promises
    yield t.throws(t.context.runAction());
    var _a;
}));
ava_1.default('before filters that render block the responder', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() {
                t.fail('Filter should have preempted this responder method');
            }
            preempt() {
                this.render(200, { hello: 'world' });
            }
        },
        _a.before = ['preempt'],
        _a));
    let response = yield t.context.runAction();
    t.deepEqual(response, { hello: 'world' });
    var _a;
}));
ava_1.default('after filters run after responder, even if responder renders', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() { return {}; }
            afterFilter() { t.pass(); }
        },
        _a.after = ['afterFilter'],
        _a));
    yield t.context.runAction();
    var _a;
}));
ava_1.default('after filters run even if a before filter renders', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() { t.fail(); }
            beforeFilter() {
                t.pass();
                this.render(200);
            }
            afterFilter() { t.pass(); }
        },
        _a.before = ['beforeFilter'],
        _a.after = ['afterFilter'],
        _a));
    yield t.context.runAction();
    var _a;
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9ydW50aW1lL2FjdGlvbnMtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQVNnQztBQUdoQyxxQkFBcUIsT0FBYTtJQUNoQyxNQUFNLENBQUMsSUFBSSxnQkFBTyxDQUFNLElBQUksb0JBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFFRCxhQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBVSxDQUFDLENBQUM7SUFDckQsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxzQkFBYSxDQUFDLENBQUM7SUFDNUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDN0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3QyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFPLE9BQWE7UUFDeEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7UUFDbEMsSUFBSSxNQUFNLEdBQUcsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFTLGFBQWEsQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzNCLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQU8s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QUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7XG4gIEFjdGlvbixcbiAgTW9kZWwsXG4gIENvbnRhaW5lcixcbiAgU2VyaWFsaXplcixcbiAgUmVxdWVzdCxcbiAgTW9ja1JlcXVlc3QsXG4gIE1vY2tSZXNwb25zZSxcbiAgRmxhdFBhcnNlcixcbiAgUmF3U2VyaWFsaXplciB9IGZyb20gJ2RlbmFsaSc7XG5pbXBvcnQgeyBSZW5kZXJPcHRpb25zLCBSZXNwb25kZXJQYXJhbXMgfSBmcm9tICdsaWIvcnVudGltZS9hY3Rpb24nO1xuXG5mdW5jdGlvbiBtb2NrUmVxdWVzdChvcHRpb25zPzogYW55KSB7XG4gIHJldHVybiBuZXcgUmVxdWVzdCg8YW55Pm5ldyBNb2NrUmVxdWVzdChvcHRpb25zKSk7XG59XG5cbnRlc3QuYmVmb3JlRWFjaCgodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoX19kaXJuYW1lKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdwYXJzZXI6YXBwbGljYXRpb24nLCBGbGF0UGFyc2VyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJywgUmF3U2VyaWFsaXplcik7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VydmljZTpkYicsIHt9LCB7IGluc3RhbnRpYXRlOiBmYWxzZSB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdjb25maWc6ZW52aXJvbm1lbnQnLCB7fSk7XG4gIHQuY29udGV4dC5ydW5BY3Rpb24gPSBhc3luYyAob3B0aW9ucz86IGFueSkgPT4ge1xuICAgIGxldCByZXNwb25zZSA9IG5ldyBNb2NrUmVzcG9uc2UoKTtcbiAgICBsZXQgYWN0aW9uID0gYXdhaXQgY29udGFpbmVyLmxvb2t1cDxBY3Rpb24+KCdhY3Rpb246dGVzdCcpO1xuICAgIGFjdGlvbi5hY3Rpb25QYXRoID0gJ3Rlc3QnO1xuICAgIGF3YWl0IGFjdGlvbi5ydW4obW9ja1JlcXVlc3Qob3B0aW9ucyksIDxhbnk+cmVzcG9uc2UpO1xuICAgIC8vIElmIHdlIGNhbiBwYXJzZSBhIHJlc3BvbnNlLCByZXR1cm4gdGhhdCwgb3RoZXJ3aXNlIGp1c3QgcmV0dXJuIGZhbHNlIChsb3RzIG9mIHRoZXNlIHRlc3RzXG4gICAgLy8gZG9uJ3QgY2FyZSBhYm91dCB0aGUgcmVzcG9uc2UgYm9kKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLl9nZXRKU09OKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcbn0pO1xuXG50ZXN0LnRvZG8oJ3JlbmRlcnMgd2l0aCBhIGN1c3RvbSB2aWV3IGlmIHByb3ZpZGVkJyk7XG50ZXN0LnRvZG8oJ3Rocm93cyBpZiBub3RoaW5nIHJlbmRlcnMnKTtcblxudGVzdCgnaW52b2tlcyByZXNwb25kKCkgd2l0aCBwYXJhbXMnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBhc3luYyByZXNwb25kKHsgcXVlcnkgfTogUmVzcG9uZGVyUGFyYW1zKSB7XG4gICAgICB0LmlzKHF1ZXJ5LmZvbywgJ2JhcicpO1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKHsgdXJsOiAnLz9mb289YmFyJyB9KTtcbn0pO1xuXG50ZXN0KCdkb2VzIG5vdCBpbnZva2UgdGhlIHNlcmlhbGl6ZXIgaWYgbm8gcmVzcG9uc2UgYm9keSB3YXMgcHJvdmlkZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gICAgYXN5bmMgc2VyaWFsaXplKGFjdGlvbjogQWN0aW9uLCBib2R5OiBhbnksIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMpIHtcbiAgICAgIHQuZmFpbCgnU2VyaWFsaXplciBzaG91bGQgbm90IGJlIGludm9rZWQnKTtcbiAgICB9XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgICAgdGhpcy5yZW5kZXIoMjAwKTtcbiAgICB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbn0pO1xuXG50ZXN0KCd1c2VzIGEgc3BlY2lmaWVkIHNlcmlhbGl6ZXIgdHlwZSB3aGVuIHByb3ZpZGVkJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDIpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Zm9vJywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgICBhc3luYyBzZXJpYWxpemUoYWN0aW9uOiBBY3Rpb24sIGJvZHk6IGFueSwgb3B0aW9uczogUmVuZGVyT3B0aW9ucykge1xuICAgICAgdC5wYXNzKCk7XG4gICAgfVxuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIGFzeW5jIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIGF3YWl0IHRoaXMucmVuZGVyKDIwMCwge30sIHsgc2VyaWFsaXplcjogJ2ZvbycgfSk7XG4gICAgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG59KTtcblxudGVzdCgncmVuZGVycyB3aXRoIHRoZSBtb2RlbCB0eXBlIHNlcmlhbGl6ZXIgaWYgYSBtb2RlbCB3YXMgcmVuZGVyZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpmb28nLCBjbGFzcyBGb29TZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gICAgYXN5bmMgc2VyaWFsaXplKGFjdGlvbjogQWN0aW9uLCBib2R5OiBhbnksIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMpIHtcbiAgICAgIHQucGFzcygpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICByZXNwb25kKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4gbmV3IFByb3h5KHtcbiAgICAgICAgY29uc3RydWN0b3I6IHsgdHlwZTogJ2ZvbycgfSxcbiAgICAgICAgdHlwZTogJ2ZvbydcbiAgICAgIH0sIHtcbiAgICAgICAgZ2V0UHJvdG90eXBlT2YoKSB7XG4gICAgICAgICAgcmV0dXJuIE1vZGVsLnByb3RvdHlwZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG59KTtcblxudGVzdCgncmVuZGVycyB3aXRoIHRoZSBhcHBsaWNhdGlvbiBzZXJpYWxpemVyIGlmIGFsbCBvcHRpb25zIGV4aGF1c3RlZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJywgY2xhc3MgVGVzdFNlcmlhbGl6ZXIgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgICBhdHRyaWJ1dGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHJlbGF0aW9uc2hpcHMgPSB7fTtcbiAgICBhc3luYyBzZXJpYWxpemUoYWN0aW9uOiBBY3Rpb24sIGJvZHk6IGFueSwgb3B0aW9uczogUmVuZGVyT3B0aW9ucykge1xuICAgICAgdC5wYXNzKCk7XG4gICAgfVxuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbn0pO1xuXG50ZXN0KCdpbnZva2VzIGJlZm9yZSBmaWx0ZXJzIHByaW9yIHRvIHJlc3BvbmQoKScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBzZXF1ZW5jZTogc3RyaW5nW10gPSBbXTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdiZWZvcmVGaWx0ZXInIF07XG4gICAgc3RhdGljIGFmdGVyID0gWyAnYWZ0ZXJGaWx0ZXInIF07XG5cbiAgICBiZWZvcmVGaWx0ZXIoKSB7IHNlcXVlbmNlLnB1c2goJ2JlZm9yZScpOyB9XG4gICAgcmVzcG9uZCgpIHsgc2VxdWVuY2UucHVzaCgncmVzcG9uZCcpOyByZXR1cm4ge307IH1cbiAgICBhZnRlckZpbHRlcigpIHsgc2VxdWVuY2UucHVzaCgnYWZ0ZXInKTsgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG4gIHQuZGVlcEVxdWFsKHNlcXVlbmNlLCBbICdiZWZvcmUnLCAncmVzcG9uZCcsICdhZnRlcicgXSk7XG59KTtcblxudGVzdCgnaW52b2tlcyBzdXBlcmNsYXNzIGZpbHRlcnMgYmVmb3JlIHN1YmNsYXNzIGZpbHRlcnMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgc2VxdWVuY2U6IHN0cmluZ1tdID0gW107XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGFic3RyYWN0IGNsYXNzIFBhcmVudENsYXNzIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAncGFyZW50QmVmb3JlJyBdO1xuXG4gICAgcGFyZW50QmVmb3JlKCkgeyBzZXF1ZW5jZS5wdXNoKCdwYXJlbnQnKTsgfVxuICB9XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBDaGlsZENsYXNzIGV4dGVuZHMgUGFyZW50Q2xhc3Mge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdjaGlsZEJlZm9yZScgXTtcblxuICAgIGNoaWxkQmVmb3JlKCkgeyBzZXF1ZW5jZS5wdXNoKCdjaGlsZCcpOyB9XG4gICAgcmVzcG9uZCgpIHsgcmV0dXJuIHt9OyB9XG4gIH0pO1xuXG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbiAgdC5kZWVwRXF1YWwoc2VxdWVuY2UsIFsgJ3BhcmVudCcsICdjaGlsZCcgXSk7XG59KTtcblxudGVzdCgnZXJyb3Igb3V0IHdoZW4gYW4gbm9uLWV4aXN0ZW50IGZpbHRlciB3YXMgc3BlY2lmaWVkJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdzb21lLW5vbi1leGlzdGVudC1tZXRob2QnIF07XG4gICAgcmVzcG9uZCgpIHt9XG4gIH0pO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICBhd2FpdCB0LnRocm93cyh0LmNvbnRleHQucnVuQWN0aW9uKCkpO1xufSk7XG5cbnRlc3QoJ2JlZm9yZSBmaWx0ZXJzIHRoYXQgcmVuZGVyIGJsb2NrIHRoZSByZXNwb25kZXInLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAncHJlZW1wdCcgXTtcbiAgICByZXNwb25kKCkge1xuICAgICAgdC5mYWlsKCdGaWx0ZXIgc2hvdWxkIGhhdmUgcHJlZW1wdGVkIHRoaXMgcmVzcG9uZGVyIG1ldGhvZCcpO1xuICAgIH1cbiAgICBwcmVlbXB0KCkge1xuICAgICAgIHRoaXMucmVuZGVyKDIwMCwgeyBoZWxsbzogJ3dvcmxkJyB9KTtcbiAgICB9XG4gIH0pO1xuICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG4gIHQuZGVlcEVxdWFsKHJlc3BvbnNlLCB7IGhlbGxvOiAnd29ybGQnIH0pO1xufSk7XG5cbnRlc3QoJ2FmdGVyIGZpbHRlcnMgcnVuIGFmdGVyIHJlc3BvbmRlciwgZXZlbiBpZiByZXNwb25kZXIgcmVuZGVycycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBhZnRlciA9IFsgJ2FmdGVyRmlsdGVyJyBdO1xuICAgIHJlc3BvbmQoKSB7IHJldHVybiB7fTsgfVxuICAgIGFmdGVyRmlsdGVyKCkgeyB0LnBhc3MoKTsgfVxuICB9KTtcbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG5cbnRlc3QoJ2FmdGVyIGZpbHRlcnMgcnVuIGV2ZW4gaWYgYSBiZWZvcmUgZmlsdGVyIHJlbmRlcnMnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnYmVmb3JlRmlsdGVyJyBdO1xuICAgIHN0YXRpYyBhZnRlciA9IFsgJ2FmdGVyRmlsdGVyJyBdO1xuICAgIHJlc3BvbmQoKSB7IHQuZmFpbCgpOyB9XG4gICAgYmVmb3JlRmlsdGVyKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICB0aGlzLnJlbmRlcigyMDApO1xuICAgIH1cbiAgICBhZnRlckZpbHRlcigpIHsgdC5wYXNzKCk7IH1cbiAgfSk7XG4gIGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbn0pO1xuIl19