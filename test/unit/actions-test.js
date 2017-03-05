"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
const lodash_1 = require("lodash");
function mockReqRes(overrides) {
    let container = new denali_1.Container();
    container.register('serializer:application', denali_1.FlatSerializer);
    container.register('config:environment', {});
    return lodash_1.merge({
        container,
        request: {
            get(headerName) {
                return this.headers && this.headers[headerName.toLowerCase()];
            },
            headers: {
                'content-type': 'application/json'
            },
            query: {},
            body: {}
        },
        response: {
            write() { },
            setHeader() { },
            render() { },
            end() { }
        },
        next() { }
    }, overrides);
}
ava_1.default('Action > invokes respond() with params', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(3);
    class TestAction extends denali_1.Action {
        respond(params) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                t.true(params.query);
                t.true(params.body);
                t.pass();
            });
        }
    }
    let action = new TestAction(mockReqRes({
        request: {
            query: { query: true },
            body: { body: true }
        }
    }));
    return action.run();
}));
ava_1.default('Action > does not invoke the serializer if no response body was provided', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = 'foo';
        }
        respond() {
            t.pass();
        }
    }
    let mock = mockReqRes();
    mock.container.register('serializer:foo', class extends denali_1.Serializer {
        serialize(response) {
            t.fail('Serializer should not be invoked');
        }
    });
    let action = new TestAction(mock);
    return action.run();
}));
ava_1.default('Action > uses a specified serializer type when provided', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = 'foo';
        }
        respond() {
            t.pass();
            return {};
        }
    }
    let mock = mockReqRes();
    mock.container.register('serializer:foo', class extends denali_1.Serializer {
        serialize() {
            t.pass();
        }
    });
    let action = new TestAction(mock);
    return action.run();
}));
ava_1.default('Action > renders with the error serializer if an error was rendered', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            return new Error();
        }
    }
    let mock = mockReqRes();
    mock.container.register('serializer:error', class extends denali_1.Serializer {
        serialize() {
            t.pass();
        }
    });
    let action = new TestAction(mock);
    return action.run();
}));
ava_1.default('Action > should render with the model type serializer if a model was rendered', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let mock = mockReqRes();
    class TestAction extends denali_1.Action {
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
    }
    mock.container.register('serializer:foo', class extends denali_1.Serializer {
        serialize() {
            t.pass();
        }
    });
    let action = new TestAction(mock);
    return action.run();
}));
ava_1.default('Action > should render with the application serializer if all options exhausted', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    let mock = mockReqRes();
    class TestAction extends denali_1.Action {
        respond() {
            t.pass();
            return {};
        }
    }
    mock.container.register('serializer:application', class extends denali_1.Serializer {
        serialize() {
            t.pass();
        }
    });
    let action = new TestAction(mock);
    return action.run();
}));
ava_1.default('Action > filters > invokes before filters prior to respond()', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sequence = [];
    class TestAction extends denali_1.Action {
        before() {
            sequence.push('before');
        }
        respond() {
            sequence.push('respond');
        }
        after() {
            sequence.push('after');
        }
    }
    TestAction.before = ['before'];
    TestAction.after = ['after'];
    let action = new TestAction(mockReqRes());
    yield action.run();
    t.deepEqual(sequence, ['before', 'respond', 'after']);
}));
ava_1.default('Action > filters > invokes superclass filters before subclass filters', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let sequence = [];
    class ParentClass extends denali_1.Action {
        before() {
            sequence.push('parent');
        }
        respond() { }
    }
    ParentClass.before = ['before'];
    class ChildClass extends ParentClass {
        beforeChild() {
            sequence.push('child');
        }
    }
    ChildClass.before = ['before', 'beforeChild'];
    let action = new ChildClass(mockReqRes());
    yield action.run();
    t.deepEqual(sequence, ['parent', 'child']);
}));
ava_1.default('Action > filters > error out when an non-existent filter was specified', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class TestAction extends denali_1.Action {
        respond() { }
    }
    TestAction.before = ['some-non-existent-method'];
    let action = new TestAction(mockReqRes());
    // tslint:disable-next-line:no-floating-promises
    t.throws(action.run());
}));
ava_1.default('Action > filters > should render the returned value of a before filter (if that value != null)', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    class TestAction extends denali_1.Action {
        constructor() {
            super(...arguments);
            this.serializer = false;
        }
        respond() {
            t.fail('Filter should have preempted this responder method');
        }
        preempt() {
            return { hello: 'world' };
        }
    }
    TestAction.before = ['preempt'];
    let action = new TestAction(mockReqRes());
    let response = yield action.run();
    t.deepEqual(response.body, { hello: 'world' });
}));
ava_1.default('Action > content negotiation > respond with the content-type specific responder', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class TestAction extends denali_1.Action {
        respond() {
            t.fail('Should have used HTML responder');
        }
        respondWithHtml() {
            t.pass();
        }
    }
    let action = new TestAction(mockReqRes({
        request: {
            headers: {
                'Content-type': 'text/html'
            },
            accepts() {
                return 'html';
            }
        }
    }));
    return action.run();
}));
ava_1.default('Action > #modelFor(type) > returns the model for a given type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let mock = mockReqRes();
    class User extends denali_1.Model {
    }
    mock.container.register('model:user', User);
    class TestAction extends denali_1.Action {
        respond() { }
    }
    let action = new TestAction(mock);
    let ContainerUser = action.modelFor('user');
    t.is(ContainerUser.type, 'user');
}));
ava_1.default('Action > #service(name) > returns the service for a given service name', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let mock = mockReqRes();
    class MyService extends denali_1.Service {
    }
    mock.container.register('service:mine', MyService);
    class TestAction extends denali_1.Action {
        respond() { }
    }
    let action = new TestAction(mock);
    let service = action.service('mine');
    t.true(service instanceof MyService);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9hY3Rpb25zLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEVBQTBFO0FBQzFFLDZCQUF1QjtBQUN2QixtQ0FNaUM7QUFDakMsbUNBRWdCO0FBR2hCLG9CQUFvQixTQUFlO0lBQ2pDLElBQUksU0FBUyxHQUFHLElBQUksa0JBQVMsRUFBRSxDQUFDO0lBRWhDLFNBQVMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsdUJBQWMsQ0FBQyxDQUFDO0lBQzdELFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFN0MsTUFBTSxDQUFDLGNBQUssQ0FBQztRQUNYLFNBQVM7UUFDVCxPQUFPLEVBQUU7WUFDUCxHQUFHLENBQUMsVUFBa0I7Z0JBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDaEUsQ0FBQztZQUNELE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2FBQ25DO1lBQ0QsS0FBSyxFQUFFLEVBQUU7WUFDVCxJQUFJLEVBQUUsRUFBRTtTQUNUO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsS0FBSyxLQUFJLENBQUM7WUFDVixTQUFTLEtBQUksQ0FBQztZQUNkLE1BQU0sS0FBSSxDQUFDO1lBQ1gsR0FBRyxLQUFJLENBQUM7U0FDVDtRQUNELElBQUksS0FBSSxDQUFDO0tBQ1YsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNoQixDQUFDO0FBRUQsYUFBSSxDQUFDLHdDQUF3QyxFQUFFLENBQU8sQ0FBQztJQUNyRCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1YsZ0JBQWlCLFNBQVEsZUFBTTtRQUN2QixPQUFPLENBQUMsTUFBVzs7Z0JBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQztTQUFBO0tBQ0Y7SUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDckMsT0FBTyxFQUFFO1lBQ1AsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUN0QixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO1NBQ3JCO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsMEVBQTBFLEVBQUUsQ0FBTyxDQUFDO0lBQ3ZGLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDVixnQkFBaUIsU0FBUSxlQUFNO1FBQS9COztZQUNFLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJckIsQ0FBQztRQUhDLE9BQU87WUFDTCxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDO0tBQ0Y7SUFDRCxJQUFJLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFNLFNBQVEsbUJBQVU7UUFDaEUsU0FBUyxDQUFDLFFBQWtCO1lBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHlEQUF5RCxFQUFFLENBQU8sQ0FBQztJQUN0RSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1YsZ0JBQWlCLFNBQVEsZUFBTTtRQUEvQjs7WUFDRSxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBS3JCLENBQUM7UUFKQyxPQUFPO1lBQ0wsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1QsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUM7S0FDRjtJQUNELElBQUksSUFBSSxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEtBQU0sU0FBUSxtQkFBVTtRQUNoRSxTQUFTO1lBQ1AsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUNILElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEIsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxxRUFBcUUsRUFBRSxDQUFPLENBQUM7SUFDbEYsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLGdCQUFpQixTQUFRLGVBQU07UUFDN0IsT0FBTztZQUNMLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUM7S0FDRjtJQUNELElBQUksSUFBSSxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEtBQU0sU0FBUSxtQkFBVTtRQUNsRSxTQUFTO1lBQ1AsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUNILElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEIsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQywrRUFBK0UsRUFBRSxDQUFPLENBQUM7SUFDNUYsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLElBQUksSUFBSSxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBQ3hCLGdCQUFpQixTQUFRLGVBQU07UUFDN0IsT0FBTztZQUNMLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQztnQkFDZixXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO2dCQUM1QixJQUFJLEVBQUUsS0FBSzthQUNaLEVBQUU7Z0JBQ0QsY0FBYztvQkFDWixNQUFNLENBQUMsY0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDekIsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRjtJQUNELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEtBQU0sU0FBUSxtQkFBVTtRQUNoRSxTQUFTO1lBQ1AsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUNILElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEIsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxpRkFBaUYsRUFBRSxDQUFPLENBQUM7SUFDOUYsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNWLElBQUksSUFBSSxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBQ3hCLGdCQUFpQixTQUFRLGVBQU07UUFDN0IsT0FBTztZQUNMLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDWixDQUFDO0tBQ0Y7SUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxLQUFNLFNBQVEsbUJBQVU7UUFDeEUsU0FBUztZQUNQLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FDRixDQUFDLENBQUM7SUFDSCxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVsQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsOERBQThELEVBQUUsQ0FBTyxDQUFDO0lBQzNFLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztJQUM1QixnQkFBaUIsU0FBUSxlQUFNO1FBSTdCLE1BQU07WUFDSixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFRCxPQUFPO1lBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsS0FBSztZQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsQ0FBQzs7SUFiTSxpQkFBTSxHQUFHLENBQUUsUUFBUSxDQUFFLENBQUM7SUFDdEIsZ0JBQUssR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDO0lBYzdCLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFMUMsTUFBTSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDbkIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7QUFDMUQsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx1RUFBdUUsRUFBRSxDQUFPLENBQUM7SUFDcEYsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO0lBQzVCLGlCQUFrQixTQUFRLGVBQU07UUFHOUIsTUFBTTtZQUNKLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUVELE9BQU8sS0FBSSxDQUFDOztJQU5MLGtCQUFNLEdBQUcsQ0FBRSxRQUFRLENBQUUsQ0FBQztJQVEvQixnQkFBaUIsU0FBUSxXQUFXO1FBR2xDLFdBQVc7WUFDVCxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7O0lBSk0saUJBQU0sR0FBRyxDQUFFLFFBQVEsRUFBRSxhQUFhLENBQUUsQ0FBQztJQU05QyxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx3RUFBd0UsRUFBRSxDQUFPLENBQUM7SUFDckYsZ0JBQWlCLFNBQVEsZUFBTTtRQUU3QixPQUFPLEtBQUksQ0FBQzs7SUFETCxpQkFBTSxHQUFHLENBQUUsMEJBQTBCLENBQUUsQ0FBQztJQUdqRCxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBRTFDLGdEQUFnRDtJQUNoRCxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsZ0dBQWdHLEVBQUUsQ0FBTyxDQUFDO0lBQzdHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDVixnQkFBaUIsU0FBUSxlQUFNO1FBQS9COztZQUVFLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFPckIsQ0FBQztRQU5DLE9BQU87WUFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUNELE9BQU87WUFDTCxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7UUFDNUIsQ0FBQzs7SUFQTSxpQkFBTSxHQUFHLENBQUUsU0FBUyxDQUFFLENBQUM7SUFTaEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUMxQyxJQUFJLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNsQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLGlGQUFpRixFQUFFLENBQU8sQ0FBQztJQUM5RixnQkFBaUIsU0FBUSxlQUFNO1FBQzdCLE9BQU87WUFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELGVBQWU7WUFDYixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDO0tBQ0o7SUFDQyxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDckMsT0FBTyxFQUFFO1lBQ1AsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxXQUFXO2FBQzVCO1lBQ0QsT0FBTztnQkFDTCxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ2hCLENBQUM7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUosTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLCtEQUErRCxFQUFFLENBQU8sQ0FBQztJQUM1RSxJQUFJLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztJQUN4QixVQUFXLFNBQVEsY0FBSztLQUFHO0lBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxnQkFBaUIsU0FBUSxlQUFNO1FBQzdCLE9BQU8sS0FBSSxDQUFDO0tBQ2I7SUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVsQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHdFQUF3RSxFQUFFLENBQU8sQ0FBQztJQUNyRixJQUFJLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztJQUN4QixlQUFnQixTQUFRLGdCQUFPO0tBQUc7SUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ25ELGdCQUFpQixTQUFRLGVBQU07UUFDN0IsT0FBTyxLQUFJLENBQUM7S0FDYjtJQUNELElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWxDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLFlBQVksU0FBUyxDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHtcbiAgQWN0aW9uLFxuICBNb2RlbCxcbiAgQ29udGFpbmVyLFxuICBTZXJpYWxpemVyLFxuICBTZXJ2aWNlLFxuICBGbGF0U2VyaWFsaXplciB9IGZyb20gJ2RlbmFsaSc7XG5pbXBvcnQge1xuICBtZXJnZVxufSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFJlc3BvbnNlIGZyb20gJy4uLy4uL2xpYi9ydW50aW1lL3Jlc3BvbnNlJztcblxuZnVuY3Rpb24gbW9ja1JlcVJlcyhvdmVycmlkZXM/OiBhbnkpOiBhbnkge1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpO1xuXG4gIGNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIEZsYXRTZXJpYWxpemVyKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdjb25maWc6ZW52aXJvbm1lbnQnLCB7fSk7XG5cbiAgcmV0dXJuIG1lcmdlKHtcbiAgICBjb250YWluZXIsXG4gICAgcmVxdWVzdDoge1xuICAgICAgZ2V0KGhlYWRlck5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWFkZXJzICYmIHRoaXMuaGVhZGVyc1toZWFkZXJOYW1lLnRvTG93ZXJDYXNlKCldO1xuICAgICAgfSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgfSxcbiAgICAgIHF1ZXJ5OiB7fSxcbiAgICAgIGJvZHk6IHt9XG4gICAgfSxcbiAgICByZXNwb25zZToge1xuICAgICAgd3JpdGUoKSB7fSxcbiAgICAgIHNldEhlYWRlcigpIHt9LFxuICAgICAgcmVuZGVyKCkge30sXG4gICAgICBlbmQoKSB7fVxuICAgIH0sXG4gICAgbmV4dCgpIHt9XG4gIH0sIG92ZXJyaWRlcyk7XG59XG5cbnRlc3QoJ0FjdGlvbiA+IGludm9rZXMgcmVzcG9uZCgpIHdpdGggcGFyYW1zJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDMpO1xuICBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBhc3luYyByZXNwb25kKHBhcmFtczogYW55KSB7XG4gICAgICB0LnRydWUocGFyYW1zLnF1ZXJ5KTtcbiAgICAgIHQudHJ1ZShwYXJhbXMuYm9keSk7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH1cbiAgbGV0IGFjdGlvbiA9IG5ldyBUZXN0QWN0aW9uKG1vY2tSZXFSZXMoe1xuICAgIHJlcXVlc3Q6IHtcbiAgICAgIHF1ZXJ5OiB7IHF1ZXJ5OiB0cnVlIH0sXG4gICAgICBib2R5OiB7IGJvZHk6IHRydWUgfVxuICAgIH1cbiAgfSkpO1xuICByZXR1cm4gYWN0aW9uLnJ1bigpO1xufSk7XG5cbnRlc3QoJ0FjdGlvbiA+IGRvZXMgbm90IGludm9rZSB0aGUgc2VyaWFsaXplciBpZiBubyByZXNwb25zZSBib2R5IHdhcyBwcm92aWRlZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgc2VyaWFsaXplciA9ICdmb28nO1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH1cbiAgbGV0IG1vY2sgPSBtb2NrUmVxUmVzKCk7XG4gIG1vY2suY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmZvbycsIGNsYXNzIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgc2VyaWFsaXplKHJlc3BvbnNlOiBSZXNwb25zZSkge1xuICAgICAgdC5mYWlsKCdTZXJpYWxpemVyIHNob3VsZCBub3QgYmUgaW52b2tlZCcpO1xuICAgIH1cbiAgfSk7XG4gIGxldCBhY3Rpb24gPSBuZXcgVGVzdEFjdGlvbihtb2NrKTtcblxuICByZXR1cm4gYWN0aW9uLnJ1bigpO1xufSk7XG5cbnRlc3QoJ0FjdGlvbiA+IHVzZXMgYSBzcGVjaWZpZWQgc2VyaWFsaXplciB0eXBlIHdoZW4gcHJvdmlkZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHNlcmlhbGl6ZXIgPSAnZm9vJztcbiAgICByZXNwb25kKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG4gIGxldCBtb2NrID0gbW9ja1JlcVJlcygpO1xuICBtb2NrLmNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjpmb28nLCBjbGFzcyBleHRlbmRzIFNlcmlhbGl6ZXIge1xuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgIH1cbiAgfSk7XG4gIGxldCBhY3Rpb24gPSBuZXcgVGVzdEFjdGlvbihtb2NrKTtcblxuICByZXR1cm4gYWN0aW9uLnJ1bigpO1xufSk7XG5cbnRlc3QoJ0FjdGlvbiA+IHJlbmRlcnMgd2l0aCB0aGUgZXJyb3Igc2VyaWFsaXplciBpZiBhbiBlcnJvciB3YXMgcmVuZGVyZWQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMik7XG4gIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoKTtcbiAgICB9XG4gIH1cbiAgbGV0IG1vY2sgPSBtb2NrUmVxUmVzKCk7XG4gIG1vY2suY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOmVycm9yJywgY2xhc3MgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH0pO1xuICBsZXQgYWN0aW9uID0gbmV3IFRlc3RBY3Rpb24obW9jayk7XG5cbiAgcmV0dXJuIGFjdGlvbi5ydW4oKTtcbn0pO1xuXG50ZXN0KCdBY3Rpb24gPiBzaG91bGQgcmVuZGVyIHdpdGggdGhlIG1vZGVsIHR5cGUgc2VyaWFsaXplciBpZiBhIG1vZGVsIHdhcyByZW5kZXJlZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgbGV0IG1vY2sgPSBtb2NrUmVxUmVzKCk7XG4gIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHJlc3BvbmQoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiBuZXcgUHJveHkoe1xuICAgICAgICBjb25zdHJ1Y3RvcjogeyB0eXBlOiAnZm9vJyB9LFxuICAgICAgICB0eXBlOiAnZm9vJ1xuICAgICAgfSwge1xuICAgICAgICBnZXRQcm90b3R5cGVPZigpIHtcbiAgICAgICAgICByZXR1cm4gTW9kZWwucHJvdG90eXBlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgbW9jay5jb250YWluZXIucmVnaXN0ZXIoJ3NlcmlhbGl6ZXI6Zm9vJywgY2xhc3MgZXh0ZW5kcyBTZXJpYWxpemVyIHtcbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH0pO1xuICBsZXQgYWN0aW9uID0gbmV3IFRlc3RBY3Rpb24obW9jayk7XG5cbiAgcmV0dXJuIGFjdGlvbi5ydW4oKTtcbn0pO1xuXG50ZXN0KCdBY3Rpb24gPiBzaG91bGQgcmVuZGVyIHdpdGggdGhlIGFwcGxpY2F0aW9uIHNlcmlhbGl6ZXIgaWYgYWxsIG9wdGlvbnMgZXhoYXVzdGVkJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDIpO1xuICBsZXQgbW9jayA9IG1vY2tSZXFSZXMoKTtcbiAgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQucGFzcygpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxuICBtb2NrLmNvbnRhaW5lci5yZWdpc3Rlcignc2VyaWFsaXplcjphcHBsaWNhdGlvbicsIGNsYXNzIGV4dGVuZHMgU2VyaWFsaXplciB7XG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgfVxuICB9KTtcbiAgbGV0IGFjdGlvbiA9IG5ldyBUZXN0QWN0aW9uKG1vY2spO1xuXG4gIHJldHVybiBhY3Rpb24ucnVuKCk7XG59KTtcblxudGVzdCgnQWN0aW9uID4gZmlsdGVycyA+IGludm9rZXMgYmVmb3JlIGZpbHRlcnMgcHJpb3IgdG8gcmVzcG9uZCgpJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHNlcXVlbmNlOiBzdHJpbmdbXSA9IFtdO1xuICBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnYmVmb3JlJyBdO1xuICAgIHN0YXRpYyBhZnRlciA9IFsgJ2FmdGVyJyBdO1xuXG4gICAgYmVmb3JlKCkge1xuICAgICAgc2VxdWVuY2UucHVzaCgnYmVmb3JlJyk7XG4gICAgfVxuXG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHNlcXVlbmNlLnB1c2goJ3Jlc3BvbmQnKTtcbiAgICB9XG5cbiAgICBhZnRlcigpIHtcbiAgICAgIHNlcXVlbmNlLnB1c2goJ2FmdGVyJyk7XG4gICAgfVxuICB9XG4gIGxldCBhY3Rpb24gPSBuZXcgVGVzdEFjdGlvbihtb2NrUmVxUmVzKCkpO1xuXG4gIGF3YWl0IGFjdGlvbi5ydW4oKTtcbiAgdC5kZWVwRXF1YWwoc2VxdWVuY2UsIFsgJ2JlZm9yZScsICdyZXNwb25kJywgJ2FmdGVyJyBdKTtcbn0pO1xuXG50ZXN0KCdBY3Rpb24gPiBmaWx0ZXJzID4gaW52b2tlcyBzdXBlcmNsYXNzIGZpbHRlcnMgYmVmb3JlIHN1YmNsYXNzIGZpbHRlcnMnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgc2VxdWVuY2U6IHN0cmluZ1tdID0gW107XG4gIGNsYXNzIFBhcmVudENsYXNzIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnYmVmb3JlJyBdO1xuXG4gICAgYmVmb3JlKCkge1xuICAgICAgc2VxdWVuY2UucHVzaCgncGFyZW50Jyk7XG4gICAgfVxuXG4gICAgcmVzcG9uZCgpIHt9XG4gIH1cbiAgY2xhc3MgQ2hpbGRDbGFzcyBleHRlbmRzIFBhcmVudENsYXNzIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnYmVmb3JlJywgJ2JlZm9yZUNoaWxkJyBdO1xuXG4gICAgYmVmb3JlQ2hpbGQoKSB7XG4gICAgICBzZXF1ZW5jZS5wdXNoKCdjaGlsZCcpO1xuICAgIH1cbiAgfVxuICBsZXQgYWN0aW9uID0gbmV3IENoaWxkQ2xhc3MobW9ja1JlcVJlcygpKTtcblxuICBhd2FpdCBhY3Rpb24ucnVuKCk7XG4gIHQuZGVlcEVxdWFsKHNlcXVlbmNlLCBbICdwYXJlbnQnLCAnY2hpbGQnIF0pO1xufSk7XG5cbnRlc3QoJ0FjdGlvbiA+IGZpbHRlcnMgPiBlcnJvciBvdXQgd2hlbiBhbiBub24tZXhpc3RlbnQgZmlsdGVyIHdhcyBzcGVjaWZpZWQnLCBhc3luYyAodCkgPT4ge1xuICBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICBzdGF0aWMgYmVmb3JlID0gWyAnc29tZS1ub24tZXhpc3RlbnQtbWV0aG9kJyBdO1xuICAgIHJlc3BvbmQoKSB7fVxuICB9XG4gIGxldCBhY3Rpb24gPSBuZXcgVGVzdEFjdGlvbihtb2NrUmVxUmVzKCkpO1xuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1mbG9hdGluZy1wcm9taXNlc1xuICB0LnRocm93cyhhY3Rpb24ucnVuKCkpO1xufSk7XG5cbnRlc3QoJ0FjdGlvbiA+IGZpbHRlcnMgPiBzaG91bGQgcmVuZGVyIHRoZSByZXR1cm5lZCB2YWx1ZSBvZiBhIGJlZm9yZSBmaWx0ZXIgKGlmIHRoYXQgdmFsdWUgIT0gbnVsbCknLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGNsYXNzIFRlc3RBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIHN0YXRpYyBiZWZvcmUgPSBbICdwcmVlbXB0JyBdO1xuICAgIHNlcmlhbGl6ZXIgPSBmYWxzZTtcbiAgICByZXNwb25kKCkge1xuICAgICAgdC5mYWlsKCdGaWx0ZXIgc2hvdWxkIGhhdmUgcHJlZW1wdGVkIHRoaXMgcmVzcG9uZGVyIG1ldGhvZCcpO1xuICAgIH1cbiAgICBwcmVlbXB0KCkge1xuICAgICAgcmV0dXJuIHsgaGVsbG86ICd3b3JsZCcgfTtcbiAgICB9XG4gIH1cbiAgbGV0IGFjdGlvbiA9IG5ldyBUZXN0QWN0aW9uKG1vY2tSZXFSZXMoKSk7XG4gIGxldCByZXNwb25zZSA9IGF3YWl0IGFjdGlvbi5ydW4oKTtcbiAgdC5kZWVwRXF1YWwocmVzcG9uc2UuYm9keSwgeyBoZWxsbzogJ3dvcmxkJyB9KTtcbn0pO1xuXG50ZXN0KCdBY3Rpb24gPiBjb250ZW50IG5lZ290aWF0aW9uID4gcmVzcG9uZCB3aXRoIHRoZSBjb250ZW50LXR5cGUgc3BlY2lmaWMgcmVzcG9uZGVyJywgYXN5bmMgKHQpID0+IHtcbiAgY2xhc3MgVGVzdEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgcmVzcG9uZCgpIHtcbiAgICAgIHQuZmFpbCgnU2hvdWxkIGhhdmUgdXNlZCBIVE1MIHJlc3BvbmRlcicpO1xuICAgIH1cbiAgICByZXNwb25kV2l0aEh0bWwoKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG59XG4gIGxldCBhY3Rpb24gPSBuZXcgVGVzdEFjdGlvbihtb2NrUmVxUmVzKHtcbiAgICByZXF1ZXN0OiB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LXR5cGUnOiAndGV4dC9odG1sJ1xuICAgICAgfSxcbiAgICAgIGFjY2VwdHMoKSB7XG4gICAgICAgIHJldHVybiAnaHRtbCc7XG4gICAgICB9XG4gICAgfVxuICB9KSk7XG5cbiAgcmV0dXJuIGFjdGlvbi5ydW4oKTtcbn0pO1xuXG50ZXN0KCdBY3Rpb24gPiAjbW9kZWxGb3IodHlwZSkgPiByZXR1cm5zIHRoZSBtb2RlbCBmb3IgYSBnaXZlbiB0eXBlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IG1vY2sgPSBtb2NrUmVxUmVzKCk7XG4gIGNsYXNzIFVzZXIgZXh0ZW5kcyBNb2RlbCB7fVxuICBtb2NrLmNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6dXNlcicsIFVzZXIpO1xuICBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICByZXNwb25kKCkge31cbiAgfVxuICBsZXQgYWN0aW9uID0gbmV3IFRlc3RBY3Rpb24obW9jayk7XG5cbiAgbGV0IENvbnRhaW5lclVzZXIgPSBhY3Rpb24ubW9kZWxGb3IoJ3VzZXInKTtcbiAgdC5pcyhDb250YWluZXJVc2VyLnR5cGUsICd1c2VyJyk7XG59KTtcblxudGVzdCgnQWN0aW9uID4gI3NlcnZpY2UobmFtZSkgPiByZXR1cm5zIHRoZSBzZXJ2aWNlIGZvciBhIGdpdmVuIHNlcnZpY2UgbmFtZScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBtb2NrID0gbW9ja1JlcVJlcygpO1xuICBjbGFzcyBNeVNlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlIHt9XG4gIG1vY2suY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJ2aWNlOm1pbmUnLCBNeVNlcnZpY2UpO1xuICBjbGFzcyBUZXN0QWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICByZXNwb25kKCkge31cbiAgfVxuICBsZXQgYWN0aW9uID0gbmV3IFRlc3RBY3Rpb24obW9jayk7XG5cbiAgbGV0IHNlcnZpY2UgPSBhY3Rpb24uc2VydmljZSgnbWluZScpO1xuICB0LnRydWUoc2VydmljZSBpbnN0YW5jZW9mIE15U2VydmljZSk7XG59KTtcbiJdfQ==