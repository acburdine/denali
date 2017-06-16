"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
function mockRequest(body) {
    let mocked = new denali_1.MockRequest({
        method: 'POST',
        headers: {
            'Content-type': 'application/vnd.api+json'
        }
    });
    let req = new denali_1.Request(mocked);
    req.body = body;
    return req;
}
ava_1.default('returns responder params with primary request data flattened', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let parser = new denali_1.JSONAPIParser();
    let result = parser.parse(mockRequest({
        data: {
            type: 'bar',
            attributes: {
                foo: true
            }
        }
    }));
    t.true(result.body.foo);
}));
ava_1.default('returns responder params with included records', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let parser = new denali_1.JSONAPIParser();
    let result = parser.parse(mockRequest({
        data: {
            type: 'bar',
            attributes: {
                foo: true
            }
        },
        included: [
            {
                type: 'fizz',
                attributes: {
                    buzz: true
                }
            }
        ]
    }));
    t.true(result.body.foo);
    t.true(result.included[0].buzz);
}));
ava_1.default('doesn\'t attempt to parse and returns no body if request body empty', (t) => {
    let parser = new denali_1.JSONAPIParser();
    let mocked = new denali_1.MockRequest({
        method: 'GET'
    });
    let req = new denali_1.Request(mocked);
    let result = parser.parse(req);
    t.true(typeof result.body === 'undefined');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1hcGktdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvcGFyc2UvanNvbi1hcGktdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQUE2RDtBQUU3RCxxQkFBcUIsSUFBVTtJQUM3QixJQUFJLE1BQU0sR0FBRyxJQUFJLG9CQUFXLENBQUM7UUFDM0IsTUFBTSxFQUFFLE1BQU07UUFDZCxPQUFPLEVBQUU7WUFDUCxjQUFjLEVBQUUsMEJBQTBCO1NBQzNDO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxHQUFHLEdBQUcsSUFBSSxnQkFBTyxDQUFNLE1BQU0sQ0FBQyxDQUFDO0lBQ25DLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDYixDQUFDO0FBRUQsYUFBSSxDQUFDLDhEQUE4RCxFQUFFLENBQU8sQ0FBQztJQUMzRSxJQUFJLE1BQU0sR0FBRyxJQUFJLHNCQUFhLEVBQUUsQ0FBQztJQUNqQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsS0FBSztZQUNYLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsSUFBSTthQUNWO1NBQ0Y7S0FDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLGdEQUFnRCxFQUFFLENBQU8sQ0FBQztJQUM3RCxJQUFJLE1BQU0sR0FBRyxJQUFJLHNCQUFhLEVBQUUsQ0FBQztJQUNqQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLEVBQUU7WUFDSixJQUFJLEVBQUUsS0FBSztZQUNYLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsSUFBSTthQUNWO1NBQ0Y7UUFDRCxRQUFRLEVBQUU7WUFDUjtnQkFDRSxJQUFJLEVBQUUsTUFBTTtnQkFDWixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLElBQUk7aUJBQ1g7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMscUVBQXFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVFLElBQUksTUFBTSxHQUFHLElBQUksc0JBQWEsRUFBRSxDQUFDO0lBQ2pDLElBQUksTUFBTSxHQUFHLElBQUksb0JBQVcsQ0FBQztRQUMzQixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUMsQ0FBQztJQUNILElBQUksR0FBRyxHQUFHLElBQUksZ0JBQU8sQ0FBTSxNQUFNLENBQUMsQ0FBQztJQUNuQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQzdDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgeyBKU09OQVBJUGFyc2VyLCBNb2NrUmVxdWVzdCwgUmVxdWVzdCB9IGZyb20gJ2RlbmFsaSc7XG5cbmZ1bmN0aW9uIG1vY2tSZXF1ZXN0KGJvZHk/OiBhbnkpIHtcbiAgbGV0IG1vY2tlZCA9IG5ldyBNb2NrUmVxdWVzdCh7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi92bmQuYXBpK2pzb24nXG4gICAgfVxuICB9KTtcbiAgbGV0IHJlcSA9IG5ldyBSZXF1ZXN0KDxhbnk+bW9ja2VkKTtcbiAgcmVxLmJvZHkgPSBib2R5O1xuICByZXR1cm4gcmVxO1xufVxuXG50ZXN0KCdyZXR1cm5zIHJlc3BvbmRlciBwYXJhbXMgd2l0aCBwcmltYXJ5IHJlcXVlc3QgZGF0YSBmbGF0dGVuZWQnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgcGFyc2VyID0gbmV3IEpTT05BUElQYXJzZXIoKTtcbiAgbGV0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShtb2NrUmVxdWVzdCh7XG4gICAgZGF0YToge1xuICAgICAgdHlwZTogJ2JhcicsXG4gICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgIGZvbzogdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfSkpO1xuICB0LnRydWUocmVzdWx0LmJvZHkuZm9vKTtcbn0pO1xuXG50ZXN0KCdyZXR1cm5zIHJlc3BvbmRlciBwYXJhbXMgd2l0aCBpbmNsdWRlZCByZWNvcmRzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IHBhcnNlciA9IG5ldyBKU09OQVBJUGFyc2VyKCk7XG4gIGxldCByZXN1bHQgPSBwYXJzZXIucGFyc2UobW9ja1JlcXVlc3Qoe1xuICAgIGRhdGE6IHtcbiAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICBmb286IHRydWVcbiAgICAgIH1cbiAgICB9LFxuICAgIGluY2x1ZGVkOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdmaXp6JyxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIGJ1eno6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF1cbiAgfSkpO1xuICB0LnRydWUocmVzdWx0LmJvZHkuZm9vKTtcbiAgdC50cnVlKHJlc3VsdC5pbmNsdWRlZFswXS5idXp6KTtcbn0pO1xuXG50ZXN0KCdkb2VzblxcJ3QgYXR0ZW1wdCB0byBwYXJzZSBhbmQgcmV0dXJucyBubyBib2R5IGlmIHJlcXVlc3QgYm9keSBlbXB0eScsICh0KSA9PiB7XG4gIGxldCBwYXJzZXIgPSBuZXcgSlNPTkFQSVBhcnNlcigpO1xuICBsZXQgbW9ja2VkID0gbmV3IE1vY2tSZXF1ZXN0KHtcbiAgICBtZXRob2Q6ICdHRVQnXG4gIH0pO1xuICBsZXQgcmVxID0gbmV3IFJlcXVlc3QoPGFueT5tb2NrZWQpO1xuICBsZXQgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKHJlcSk7XG4gIHQudHJ1ZSh0eXBlb2YgcmVzdWx0LmJvZHkgPT09ICd1bmRlZmluZWQnKTtcbn0pO1xuIl19