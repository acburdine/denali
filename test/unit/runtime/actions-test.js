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
    container.register('app:logger', denali_1.Logger);
    container.register('service:db', denali_1.DatabaseService);
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
ava_1.default('before filters that return block the responder', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('action:test', (_a = class TestAction extends denali_1.Action {
            respond() {
                t.fail('Filter should have preempted this responder method');
            }
            preempt() {
                return { hello: 'world' };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9ydW50aW1lL2FjdGlvbnMtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQWF5QjtBQUV6QixxQkFBcUIsT0FBYTtJQUNoQyxNQUFNLENBQUMsSUFBSSxnQkFBTyxDQUFNLElBQUksb0JBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFFRCxhQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNoQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0QsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsZUFBTSxDQUFDLENBQUM7SUFDekMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsd0JBQWUsQ0FBQyxDQUFDO0lBQ2xELFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsbUJBQVUsQ0FBQyxDQUFDO0lBQ3JELFNBQVMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsc0JBQWEsQ0FBQyxDQUFDO0lBQzVELFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzdELFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBTyxPQUFhO1FBQ3hDLElBQUksUUFBUSxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO1FBQ2xDLElBQUksTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBUyxh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RyxDQUFFLGFBQWEsQ0FBRztZQUdqQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUM5QixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLG1EQUFtRCxFQUFFLENBQU8sQ0FBQztJQUNoRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLFFBQUUsZ0JBQWlCLFNBQVEsZUFBTTtZQUcvRCxPQUFPLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixZQUFZO2dCQUNWLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLENBQUM7WUFDRCxXQUFXLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1QjtRQVJRLFNBQU0sR0FBRyxDQUFFLGNBQWMsQ0FBRztRQUM1QixRQUFLLEdBQUcsQ0FBRSxhQUFhLENBQUc7WUFPakMsQ0FBQztJQUNILE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFDOUIsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBNb2RlbCxcbiAgQ29udGFpbmVyLFxuICBTZXJpYWxpemVyLFxuICBSZXF1ZXN0LFxuICBNb2NrUmVxdWVzdCxcbiAgTW9ja1Jlc3BvbnNlLFxuICBGbGF0UGFyc2VyLFxuICBSYXdTZXJpYWxpemVyLFxuICBSZW5kZXJPcHRpb25zLFxuICBSZXNwb25kZXJQYXJhbXMsXG4gIERhdGFiYXNlU2VydmljZSxcbiAgTG9nZ2VyIH0gZnJvbSAnZGVuYWxpJztcblxuZnVuY3Rpb24gbW9ja1JlcXVlc3Qob3B0aW9ucz86IGFueSkge1xuICByZXR1cm4gbmV3IFJlcXVlc3QoPGFueT5uZXcgTW9ja1JlcXVlc3Qob3B0aW9ucykpO1xufVxuXG50ZXN0LmJlZm9yZUVhY2goKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKF9fZGlybmFtZSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYXBwOmxvZ2dlcicsIExvZ2dlcik7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VydmljZTpkYicsIERhdGFiYXNlU2VydmljZSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcigncGFyc2VyOmFwcGxpY2F0aW9uJywgRmxhdFBhcnNlcik7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIFJhd1NlcmlhbGl6ZXIpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcnZpY2U6ZGInLCB7fSwgeyBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignY29uZmlnOmVudmlyb25tZW50Jywge30pO1xuICB0LmNvbnRleHQucnVuQWN0aW9uID0gYXN5bmMgKG9wdGlvbnM/OiBhbnkpID0+IHtcbiAgICBsZXQgcmVzcG9uc2UgPSBuZXcgTW9ja1Jlc3BvbnNlKCk7XG4gICAgbGV0IGFjdGlvbiA9IGF3YWl0IGNvbnRhaW5lci5sb29rdXA8QWN0aW9uPignYWN0aW9uOnRlc3QnKTtcbiAgICBhY3Rpb24uYWN0aW9uUGF0aCA9ICd0ZXN0JztcbiAgICBhd2FpdCBhY3Rpb24ucnVuKG1vY2tSZXF1ZXN0KG9wdGlvbnMpLCA8YW55PnJlc3BvbnNlKTtcbiAgICAvLyBJZiB3ZSBjYW4gcGFyc2UgYSByZXNwb25zZSwgcmV0dXJuIHRoYXQsIG90aGVyd2lzZSBqdXN0IHJldHVybiBmYWxzZSAobG90cyBvZiB0aGVzZSB0ZXN0c1xuICAgIC8vIGRvbid0IGNhcmUgYWJvdXQgdGhlIHJlc3BvbnNlIGJvZCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5fZ2V0SlNPTigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG59KTtcblxudGVzdC50b2RvKCdyZW5kZXJzIHdpdGggYSBjdXN0b20gdmlldyBpZiBwcm92aWRlZCcpO1xudGVzdC50b2RvKCd0aHJvd3MgaWYgbm90aGluZyByZW5kZXJzJyk7XG5cbnRlc3QoJ2ludm9rZXMgcmVzcG9uZCgpIHdpdGggcGFyYW1zJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDIpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgYXN5bmMgcmVzcG9uZCh7IHF1ZXJ5IH06IFJlc3BvbmRlclBhcmFtcykge1xuICAgICAgdC5pcyhxdWVyeS5mb28sICdiYXInKTtcbiAgICAgIHQucGFzcygpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbih7IHVybDogJy8/Zm9vPWJhcicgfSk7XG59KTtcblxudGVzdCgnZG9lcyBub3QgaW52b2tlIHRoZSBzZXJpYWxpemVyIGlmIG5vIHJlc3BvbnNlIGJvZHkgd2FzIHByb3ZpZGVkJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBUZXN0U2VyaWFsaXplciBleHRlbmRzIFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICAgIGFzeW5jIHNlcmlhbGl6ZShhY3Rpb246IEFjdGlvbiwgYm9keTogYW55LCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSB7XG4gICAgICB0LmZhaWwoJ1NlcmlhbGl6ZXIgc2hvdWxkIG5vdCBiZSBpbnZva2VkJyk7XG4gICAgfVxuICB9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHRoaXMucmVuZGVyKDIwMCk7XG4gICAgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG59KTtcblxudGVzdCgndXNlcyBhIHNwZWNpZmllZCBzZXJpYWxpemVyIHR5cGUgd2hlbiBwcm92aWRlZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmZvbycsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gICAgYXN5bmMgc2VyaWFsaXplKGFjdGlvbjogQWN0aW9uLCBib2R5OiBhbnksIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMpIHtcbiAgICAgIHQucGFzcygpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBhc3luYyByZXNwb25kKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICBhd2FpdCB0aGlzLnJlbmRlcigyMDAsIHt9LCB7IHNlcmlhbGl6ZXI6ICdmb28nIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgd2l0aCB0aGUgbW9kZWwgdHlwZSBzZXJpYWxpemVyIGlmIGEgbW9kZWwgd2FzIHJlbmRlcmVkJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDIpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Zm9vJywgY2xhc3MgRm9vU2VyaWFsaXplciBleHRlbmRzIFNlcmlhbGl6ZXIge1xuICAgIGF0dHJpYnV0ZXM6IHN0cmluZ1tdID0gW107XG4gICAgcmVsYXRpb25zaGlwcyA9IHt9O1xuICAgIGFzeW5jIHNlcmlhbGl6ZShhY3Rpb246IEFjdGlvbiwgYm9keTogYW55LCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgICAgcmV0dXJuIG5ldyBQcm94eSh7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7IHR5cGU6ICdmb28nIH0sXG4gICAgICAgIHR5cGU6ICdmb28nXG4gICAgICB9LCB7XG4gICAgICAgIGdldFByb3RvdHlwZU9mKCkge1xuICAgICAgICAgIHJldHVybiBNb2RlbC5wcm90b3R5cGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG5cbnRlc3QoJ3JlbmRlcnMgd2l0aCB0aGUgYXBwbGljYXRpb24gc2VyaWFsaXplciBpZiBhbGwgb3B0aW9ucyBleGhhdXN0ZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIFRlc3RTZXJpYWxpemVyIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgYXR0cmlidXRlczogc3RyaW5nW10gPSBbXTtcbiAgICByZWxhdGlvbnNoaXBzID0ge307XG4gICAgYXN5bmMgc2VyaWFsaXplKGFjdGlvbjogQWN0aW9uLCBib2R5OiBhbnksIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMpIHtcbiAgICAgIHQucGFzcygpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICByZXNwb25kKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG59KTtcblxudGVzdCgnaW52b2tlcyBiZWZvcmUgZmlsdGVycyBwcmlvciB0byByZXNwb25kKCknLCBhc3luYyAodCkgPT4ge1xuICBsZXQgc2VxdWVuY2U6IHN0cmluZ1tdID0gW107XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnYmVmb3JlRmlsdGVyJyBdO1xuICAgIHN0YXRpYyBhZnRlciA9IFsgJ2FmdGVyRmlsdGVyJyBdO1xuXG4gICAgYmVmb3JlRmlsdGVyKCkgeyBzZXF1ZW5jZS5wdXNoKCdiZWZvcmUnKTsgfVxuICAgIHJlc3BvbmQoKSB7IHNlcXVlbmNlLnB1c2goJ3Jlc3BvbmQnKTsgcmV0dXJuIHt9OyB9XG4gICAgYWZ0ZXJGaWx0ZXIoKSB7IHNlcXVlbmNlLnB1c2goJ2FmdGVyJyk7IH1cbiAgfSk7XG5cbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xuICB0LmRlZXBFcXVhbChzZXF1ZW5jZSwgWyAnYmVmb3JlJywgJ3Jlc3BvbmQnLCAnYWZ0ZXInIF0pO1xufSk7XG5cbnRlc3QoJ2ludm9rZXMgc3VwZXJjbGFzcyBmaWx0ZXJzIGJlZm9yZSBzdWJjbGFzcyBmaWx0ZXJzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHNlcXVlbmNlOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBhYnN0cmFjdCBjbGFzcyBQYXJlbnRDbGFzcyBleHRlbmRzIEFjdGlvbiB7XG4gICAgc3RhdGljIGJlZm9yZSA9IFsgJ3BhcmVudEJlZm9yZScgXTtcblxuICAgIHBhcmVudEJlZm9yZSgpIHsgc2VxdWVuY2UucHVzaCgncGFyZW50Jyk7IH1cbiAgfVxuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgQ2hpbGRDbGFzcyBleHRlbmRzIFBhcmVudENsYXNzIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnY2hpbGRCZWZvcmUnIF07XG5cbiAgICBjaGlsZEJlZm9yZSgpIHsgc2VxdWVuY2UucHVzaCgnY2hpbGQnKTsgfVxuICAgIHJlc3BvbmQoKSB7IHJldHVybiB7fTsgfVxuICB9KTtcblxuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG4gIHQuZGVlcEVxdWFsKHNlcXVlbmNlLCBbICdwYXJlbnQnLCAnY2hpbGQnIF0pO1xufSk7XG5cbnRlc3QoJ2Vycm9yIG91dCB3aGVuIGFuIG5vbi1leGlzdGVudCBmaWx0ZXIgd2FzIHNwZWNpZmllZCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignYWN0aW9uOnRlc3QnLCBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnc29tZS1ub24tZXhpc3RlbnQtbWV0aG9kJyBdO1xuICAgIHJlc3BvbmQoKSB7fVxuICB9KTtcblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgYXdhaXQgdC50aHJvd3ModC5jb250ZXh0LnJ1bkFjdGlvbigpKTtcbn0pO1xuXG50ZXN0KCdiZWZvcmUgZmlsdGVycyB0aGF0IHJlbmRlciBibG9jayB0aGUgcmVzcG9uZGVyJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc3RhdGljIGJlZm9yZSA9IFsgJ3ByZWVtcHQnIF07XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQuZmFpbCgnRmlsdGVyIHNob3VsZCBoYXZlIHByZWVtcHRlZCB0aGlzIHJlc3BvbmRlciBtZXRob2QnKTtcbiAgICB9XG4gICAgcHJlZW1wdCgpIHtcbiAgICAgICB0aGlzLnJlbmRlcigyMDAsIHsgaGVsbG86ICd3b3JsZCcgfSk7XG4gICAgfVxuICB9KTtcbiAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xuICB0LmRlZXBFcXVhbChyZXNwb25zZSwgeyBoZWxsbzogJ3dvcmxkJyB9KTtcbn0pO1xuXG50ZXN0KCdiZWZvcmUgZmlsdGVycyB0aGF0IHJldHVybiBibG9jayB0aGUgcmVzcG9uZGVyJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc3RhdGljIGJlZm9yZSA9IFsgJ3ByZWVtcHQnIF07XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQuZmFpbCgnRmlsdGVyIHNob3VsZCBoYXZlIHByZWVtcHRlZCB0aGlzIHJlc3BvbmRlciBtZXRob2QnKTtcbiAgICB9XG4gICAgcHJlZW1wdCgpIHtcbiAgICAgICByZXR1cm4geyBoZWxsbzogJ3dvcmxkJyB9O1xuICAgIH1cbiAgfSk7XG4gIGxldCByZXNwb25zZSA9IGF3YWl0IHQuY29udGV4dC5ydW5BY3Rpb24oKTtcbiAgdC5kZWVwRXF1YWwocmVzcG9uc2UsIHsgaGVsbG86ICd3b3JsZCcgfSk7XG59KTtcblxudGVzdCgnYWZ0ZXIgZmlsdGVycyBydW4gYWZ0ZXIgcmVzcG9uZGVyLCBldmVuIGlmIHJlc3BvbmRlciByZW5kZXJzJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2FjdGlvbjp0ZXN0JywgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc3RhdGljIGFmdGVyID0gWyAnYWZ0ZXJGaWx0ZXInIF07XG4gICAgcmVzcG9uZCgpIHsgcmV0dXJuIHt9OyB9XG4gICAgYWZ0ZXJGaWx0ZXIoKSB7IHQucGFzcygpOyB9XG4gIH0pO1xuICBhd2FpdCB0LmNvbnRleHQucnVuQWN0aW9uKCk7XG59KTtcblxudGVzdCgnYWZ0ZXIgZmlsdGVycyBydW4gZXZlbiBpZiBhIGJlZm9yZSBmaWx0ZXIgcmVuZGVycycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdhY3Rpb246dGVzdCcsIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdiZWZvcmVGaWx0ZXInIF07XG4gICAgc3RhdGljIGFmdGVyID0gWyAnYWZ0ZXJGaWx0ZXInIF07XG4gICAgcmVzcG9uZCgpIHsgdC5mYWlsKCk7IH1cbiAgICBiZWZvcmVGaWx0ZXIoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHRoaXMucmVuZGVyKDIwMCk7XG4gICAgfVxuICAgIGFmdGVyRmlsdGVyKCkgeyB0LnBhc3MoKTsgfVxuICB9KTtcbiAgYXdhaXQgdC5jb250ZXh0LnJ1bkFjdGlvbigpO1xufSk7XG4iXX0=