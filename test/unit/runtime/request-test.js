"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
const lodash_1 = require("lodash");
function mockRequest(options) {
    return new denali_1.Request(new denali_1.MockRequest(options));
}
function mockBasic(mockMessage) {
    // Create a stub url so that the Request instantiation won't fail
    mockMessage.url = 'example.com';
    // Cast object to an IncomingMessage to satisfy tsc
    return new denali_1.Request(mockMessage);
}
ava_1.default('method returns correct method', (t) => {
    let request = mockRequest({
        method: 'put'
    });
    t.is(request.method, 'put');
});
ava_1.default('hostname returns Host header without port number', (t) => {
    let request = mockRequest({
        headers: {
            host: 'example.com:1234'
        }
    });
    t.is(request.hostname, 'example.com');
});
ava_1.default('hostname doesn\'t fail when host header is not defined', (t) => {
    let request = mockRequest();
    t.is(request.hostname, '');
});
ava_1.default('ip returns remote address of socket', (t) => {
    let request = mockRequest();
    t.is(request.ip, '123.45.67.89');
});
ava_1.default('originalUrl returns the pathname of the url', (t) => {
    let request = mockRequest({
        url: 'https://example.com/a/b/c/d/'
    });
    t.is(request.originalUrl, '/a/b/c/d/');
});
ava_1.default('protocol', (t) => {
    let request = mockRequest({
        url: 'https://example.com/'
    });
    let request2 = mockRequest({
        url: 'http://example.com/'
    });
    t.is(request.protocol, 'https:');
    t.is(request2.protocol, 'http:');
});
ava_1.default('secure returns true for https', (t) => {
    let request = mockRequest({
        url: 'https://example.com/'
    });
    t.is(request.secure, true);
});
ava_1.default('xhr returns true for ajax requests', (t) => {
    let request = mockRequest({
        headers: {
            'x-requested-with': 'XMLHttpRequest'
        }
    });
    t.is(request.xhr, true);
});
ava_1.default('subdomains return an array of subdomains from request url', (t) => {
    let request = mockRequest({
        headers: {
            host: 'a.example.com'
        }
    });
    let request2 = mockRequest({
        headers: {
            host: 'a.b.c.example.com'
        }
    });
    t.deepEqual(request.subdomains, ['a']);
    t.deepEqual(request2.subdomains, ['a', 'b', 'c']);
});
ava_1.default('get returns header value', (t) => {
    let request = mockRequest({
        headers: {
            foo: 'bar',
            baz: 'qux'
        }
    });
    t.is(request.get('foo'), 'bar');
    t.is(request.get('baz'), 'qux');
});
ava_1.default('headers returns all request headers', (t) => {
    let request = mockRequest({
        headers: {
            foo: 'bar',
            baz: 'qux'
        }
    });
    t.deepEqual(request.headers, {
        foo: 'bar',
        baz: 'qux'
    });
});
ava_1.default('accepts returns correct type', (t) => {
    let request = mockRequest({
        headers: {
            accept: 'text/html'
        }
    });
    let request2 = mockRequest({
        headers: {
            accept: 'application/json'
        }
    });
    t.is(request.accepts(['json', 'html']), 'html');
    t.is(request2.accepts(['json', 'html']), 'json');
});
ava_1.default('is returns correct values', (t) => {
    let request = mockRequest({
        method: 'post',
        headers: {
            'content-type': 'application/json',
            'content-length': 2
        }
    });
    let request2 = mockRequest({
        method: 'post',
        headers: {
            'content-type': 'text/html',
            'content-length': 7
        }
    });
    t.is(request.is('html'), false);
    t.is(request.is('json'), 'json');
    t.is(request2.is('json'), false);
});
// The following tests are basic coverage-boosting tests for the Request class
// They only test whether or not the method/property calls are passed through
// to the IncomingMessage object
ava_1.default('incoming message properties are passed through', (t) => {
    t.plan(8);
    let props = {
        httpVersion: 0,
        rawHeaders: 1,
        rawTrailers: 2,
        socket: 3,
        statusCode: 4,
        statusMessage: 5,
        trailers: 6,
        connection: 7
    };
    // Use cloneDeep because props is mutated
    let req = mockBasic(lodash_1.cloneDeep(props));
    Object.keys(props).forEach((prop, i) => {
        t.is(req[prop], i);
    });
});
// self-returning methods
const selfReturningMethods = [
    'addListener',
    'on',
    'once',
    'prependListener',
    'prependOnceListener',
    'removeAllListeners',
    'removeListener',
    'setMaxListeners',
    'pause',
    'resume',
    'setEncoding',
    'setTimeout'
];
// Normal-returning methods
const normalReturningMethods = [
    'emit',
    'eventNames',
    'getMaxListeners',
    'listenerCount',
    'listeners',
    'isPaused',
    'pipe',
    'read',
    'unpipe',
    'unshift',
    'wrap',
    'destroy'
];
selfReturningMethods.forEach((method) => {
    ava_1.default(`self-returning pass through method > ${method}`, (t) => {
        t.plan(2);
        let req = mockBasic({
            [method]() { t.pass(); }
        });
        t.deepEqual(req[method](), req, `${method} returns the Request object`);
    });
});
normalReturningMethods.forEach((method, i) => {
    ava_1.default(`pass through method > ${method}`, (t) => {
        t.plan(2);
        let req = mockBasic({
            [method]() { t.pass(); return i; }
        });
        t.is(req[method](), i, `${method} returns the value from the passed through method`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC10ZXN0LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbInRlc3QvdW5pdC9ydW50aW1lL3JlcXVlc3QtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFFdkIsbUNBQThDO0FBQzlDLG1DQUFtQztBQUVuQyxxQkFBcUIsT0FBYTtJQUNoQyxNQUFNLENBQUMsSUFBSSxnQkFBTyxDQUFNLElBQUksb0JBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFFRCxtQkFBbUIsV0FBaUI7SUFDbEMsaUVBQWlFO0lBQ2pFLFdBQVcsQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDO0lBQ2hDLG1EQUFtRDtJQUNuRCxNQUFNLENBQUMsSUFBSSxnQkFBTyxDQUFtQixXQUFZLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRUQsYUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQztJQUN0QyxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUM7UUFDeEIsTUFBTSxFQUFFLEtBQUs7S0FDZCxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUIsQ0FBQyxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsa0RBQWtELEVBQUUsQ0FBQyxDQUFDO0lBQ3pELElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQztRQUN4QixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsa0JBQWtCO1NBQ3pCO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHdEQUF3RCxFQUFFLENBQUMsQ0FBQztJQUMvRCxJQUFJLE9BQU8sR0FB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QUFDLENBQUMsQ0FBQyxDQUFDO1FBRVYsSUFBSSxHQUFHLEdBQVMsU0FBUyxDQUFDO1lBQ3hCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkMsQ0FBRSxDQUFDO1FBRUosQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBSSxNQUFPLG1EQUFtRCxDQUFDLENBQUM7SUFDekYsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgSW5jb21pbmdNZXNzYWdlIH0gZnJvbSAnaHR0cCc7XG5pbXBvcnQgeyBSZXF1ZXN0LCBNb2NrUmVxdWVzdCB9IGZyb20gJ2RlbmFsaSc7XG5pbXBvcnQgeyBjbG9uZURlZXAgfSBmcm9tICdsb2Rhc2gnO1xuXG5mdW5jdGlvbiBtb2NrUmVxdWVzdChvcHRpb25zPzogYW55KTogUmVxdWVzdCB7XG4gIHJldHVybiBuZXcgUmVxdWVzdCg8YW55Pm5ldyBNb2NrUmVxdWVzdChvcHRpb25zKSk7XG59XG5cbmZ1bmN0aW9uIG1vY2tCYXNpYyhtb2NrTWVzc2FnZT86IGFueSk6IFJlcXVlc3Qge1xuICAvLyBDcmVhdGUgYSBzdHViIHVybCBzbyB0aGF0IHRoZSBSZXF1ZXN0IGluc3RhbnRpYXRpb24gd29uJ3QgZmFpbFxuICBtb2NrTWVzc2FnZS51cmwgPSAnZXhhbXBsZS5jb20nO1xuICAvLyBDYXN0IG9iamVjdCB0byBhbiBJbmNvbWluZ01lc3NhZ2UgdG8gc2F0aXNmeSB0c2NcbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KCg8SW5jb21pbmdNZXNzYWdlPm1vY2tNZXNzYWdlKSk7XG59XG5cbnRlc3QoJ21ldGhvZCByZXR1cm5zIGNvcnJlY3QgbWV0aG9kJywgKHQpID0+IHtcbiAgbGV0IHJlcXVlc3QgPSBtb2NrUmVxdWVzdCh7XG4gICAgbWV0aG9kOiAncHV0J1xuICB9KTtcbiAgdC5pcyhyZXF1ZXN0Lm1ldGhvZCwgJ3B1dCcpO1xufSk7XG5cbnRlc3QoJ2hvc3RuYW1lIHJldHVybnMgSG9zdCBoZWFkZXIgd2l0aG91dCBwb3J0IG51bWJlcicsICh0KSA9PiB7XG4gIGxldCByZXF1ZXN0ID0gbW9ja1JlcXVlc3Qoe1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIGhvc3Q6ICdleGFtcGxlLmNvbToxMjM0J1xuICAgIH1cbiAgfSk7XG4gIHQuaXMocmVxdWVzdC5ob3N0bmFtZSwgJ2V4YW1wbGUuY29tJyk7XG59KTtcblxudGVzdCgnaG9zdG5hbWUgZG9lc25cXCd0IGZhaWwgd2hlbiBob3N0IGhlYWRlciBpcyBub3QgZGVmaW5lZCcsICh0KSA9PiB7XG4gIGxldCByZXF1ZXN0ID0gbW9ja1JlcXVlc3QoKTtcbiAgdC5pcyhyZXF1ZXN0Lmhvc3RuYW1lLCAnJyk7XG59KTtcblxudGVzdCgnaXAgcmV0dXJucyByZW1vdGUgYWRkcmVzcyBvZiBzb2NrZXQnLCAodCkgPT4ge1xuICBsZXQgcmVxdWVzdCA9IG1vY2tSZXF1ZXN0KCk7XG4gIHQuaXMocmVxdWVzdC5pcCwgJzEyMy40NS42Ny44OScpO1xufSk7XG5cbnRlc3QoJ29yaWdpbmFsVXJsIHJldHVybnMgdGhlIHBhdGhuYW1lIG9mIHRoZSB1cmwnLCAodCkgPT4ge1xuICBsZXQgcmVxdWVzdCA9IG1vY2tSZXF1ZXN0KHtcbiAgICB1cmw6ICdodHRwczovL2V4YW1wbGUuY29tL2EvYi9jL2QvJ1xuICB9KTtcbiAgdC5pcyhyZXF1ZXN0Lm9yaWdpbmFsVXJsLCAnL2EvYi9jL2QvJyk7XG59KTtcblxudGVzdCgncHJvdG9jb2wnLCAodCkgPT4ge1xuICBsZXQgcmVxdWVzdCA9IG1vY2tSZXF1ZXN0KHtcbiAgICB1cmw6ICdodHRwczovL2V4YW1wbGUuY29tLydcbiAgfSk7XG4gIGxldCByZXF1ZXN0MiA9IG1vY2tSZXF1ZXN0KHtcbiAgICB1cmw6ICdodHRwOi8vZXhhbXBsZS5jb20vJ1xuICB9KTtcblxuICB0LmlzKHJlcXVlc3QucHJvdG9jb2wsICdodHRwczonKTtcbiAgdC5pcyhyZXF1ZXN0Mi5wcm90b2NvbCwgJ2h0dHA6Jyk7XG59KTtcblxudGVzdCgnc2VjdXJlIHJldHVybnMgdHJ1ZSBmb3IgaHR0cHMnLCAodCkgPT4ge1xuICBsZXQgcmVxdWVzdCA9IG1vY2tSZXF1ZXN0KHtcbiAgICB1cmw6ICdodHRwczovL2V4YW1wbGUuY29tLydcbiAgfSk7XG5cbiAgdC5pcyhyZXF1ZXN0LnNlY3VyZSwgdHJ1ZSk7XG59KTtcblxudGVzdCgneGhyIHJldHVybnMgdHJ1ZSBmb3IgYWpheCByZXF1ZXN0cycsICh0KSA9PiB7XG4gIGxldCByZXF1ZXN0ID0gbW9ja1JlcXVlc3Qoe1xuICAgIGhlYWRlcnM6IHtcbiAgICAgICd4LXJlcXVlc3RlZC13aXRoJzogJ1hNTEh0dHBSZXF1ZXN0J1xuICAgIH1cbiAgfSk7XG5cbiAgdC5pcyhyZXF1ZXN0LnhociwgdHJ1ZSk7XG59KTtcblxudGVzdCgnc3ViZG9tYWlucyByZXR1cm4gYW4gYXJyYXkgb2Ygc3ViZG9tYWlucyBmcm9tIHJlcXVlc3QgdXJsJywgKHQpID0+IHtcbiAgbGV0IHJlcXVlc3QgPSBtb2NrUmVxdWVzdCh7XG4gICAgaGVhZGVyczoge1xuICAgICAgaG9zdDogJ2EuZXhhbXBsZS5jb20nXG4gICAgfVxuICB9KTtcbiAgbGV0IHJlcXVlc3QyID0gbW9ja1JlcXVlc3Qoe1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIGhvc3Q6ICdhLmIuYy5leGFtcGxlLmNvbSdcbiAgICB9XG4gIH0pO1xuXG4gIHQuZGVlcEVxdWFsKHJlcXVlc3Quc3ViZG9tYWlucywgWydhJ10pO1xuICB0LmRlZXBFcXVhbChyZXF1ZXN0Mi5zdWJkb21haW5zLCBbJ2EnLCAnYicsICdjJ10pO1xufSk7XG5cbnRlc3QoJ2dldCByZXR1cm5zIGhlYWRlciB2YWx1ZScsICh0KSA9PiB7XG4gIGxldCByZXF1ZXN0ID0gbW9ja1JlcXVlc3Qoe1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIGZvbzogJ2JhcicsXG4gICAgICBiYXo6ICdxdXgnXG4gICAgfVxuICB9KTtcblxuICB0LmlzKHJlcXVlc3QuZ2V0KCdmb28nKSwgJ2JhcicpO1xuICB0LmlzKHJlcXVlc3QuZ2V0KCdiYXonKSwgJ3F1eCcpO1xufSk7XG5cbnRlc3QoJ2hlYWRlcnMgcmV0dXJucyBhbGwgcmVxdWVzdCBoZWFkZXJzJywgKHQpID0+IHtcbiAgbGV0IHJlcXVlc3QgPSBtb2NrUmVxdWVzdCh7XG4gICAgaGVhZGVyczoge1xuICAgICAgZm9vOiAnYmFyJyxcbiAgICAgIGJhejogJ3F1eCdcbiAgICB9XG4gIH0pO1xuXG4gIHQuZGVlcEVxdWFsKHJlcXVlc3QuaGVhZGVycywge1xuICAgIGZvbzogJ2JhcicsXG4gICAgYmF6OiAncXV4J1xuICB9KTtcbn0pO1xuXG50ZXN0KCdhY2NlcHRzIHJldHVybnMgY29ycmVjdCB0eXBlJywgKHQpID0+IHtcbiAgbGV0IHJlcXVlc3QgPSBtb2NrUmVxdWVzdCh7XG4gICAgaGVhZGVyczoge1xuICAgICAgYWNjZXB0OiAndGV4dC9odG1sJ1xuICAgIH1cbiAgfSk7XG4gIGxldCByZXF1ZXN0MiA9IG1vY2tSZXF1ZXN0KHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIH1cbiAgfSk7XG5cbiAgdC5pcyhyZXF1ZXN0LmFjY2VwdHMoWydqc29uJywgJ2h0bWwnXSksICdodG1sJyk7XG4gIHQuaXMocmVxdWVzdDIuYWNjZXB0cyhbJ2pzb24nLCAnaHRtbCddKSwgJ2pzb24nKTtcbn0pO1xuXG50ZXN0KCdpcyByZXR1cm5zIGNvcnJlY3QgdmFsdWVzJywgKHQpID0+IHtcbiAgbGV0IHJlcXVlc3QgPSBtb2NrUmVxdWVzdCh7XG4gICAgbWV0aG9kOiAncG9zdCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdjb250ZW50LWxlbmd0aCc6IDJcbiAgICB9XG4gIH0pO1xuICBsZXQgcmVxdWVzdDIgPSBtb2NrUmVxdWVzdCh7XG4gICAgbWV0aG9kOiAncG9zdCcsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ2NvbnRlbnQtdHlwZSc6ICd0ZXh0L2h0bWwnLFxuICAgICAgJ2NvbnRlbnQtbGVuZ3RoJzogN1xuICAgIH1cbiAgfSk7XG5cbiAgdC5pcyhyZXF1ZXN0LmlzKCdodG1sJyksIGZhbHNlKTtcbiAgdC5pcyhyZXF1ZXN0LmlzKCdqc29uJyksICdqc29uJyk7XG4gIHQuaXMocmVxdWVzdDIuaXMoJ2pzb24nKSwgZmFsc2UpO1xufSk7XG5cbi8vIFRoZSBmb2xsb3dpbmcgdGVzdHMgYXJlIGJhc2ljIGNvdmVyYWdlLWJvb3N0aW5nIHRlc3RzIGZvciB0aGUgUmVxdWVzdCBjbGFzc1xuLy8gVGhleSBvbmx5IHRlc3Qgd2hldGhlciBvciBub3QgdGhlIG1ldGhvZC9wcm9wZXJ0eSBjYWxscyBhcmUgcGFzc2VkIHRocm91Z2hcbi8vIHRvIHRoZSBJbmNvbWluZ01lc3NhZ2Ugb2JqZWN0XG5cbnRlc3QoJ2luY29taW5nIG1lc3NhZ2UgcHJvcGVydGllcyBhcmUgcGFzc2VkIHRocm91Z2gnLCAodCkgPT4ge1xuICB0LnBsYW4oOCk7XG5cbiAgbGV0IHByb3BzID0ge1xuICAgIGh0dHBWZXJzaW9uOiAwLFxuICAgIHJhd0hlYWRlcnM6IDEsXG4gICAgcmF3VHJhaWxlcnM6IDIsXG4gICAgc29ja2V0OiAzLFxuICAgIHN0YXR1c0NvZGU6IDQsXG4gICAgc3RhdHVzTWVzc2FnZTogNSxcbiAgICB0cmFpbGVyczogNixcbiAgICBjb25uZWN0aW9uOiA3XG4gIH07XG4gIC8vIFVzZSBjbG9uZURlZXAgYmVjYXVzZSBwcm9wcyBpcyBtdXRhdGVkXG4gIGxldCByZXEgPSAoPGFueT5tb2NrQmFzaWMoY2xvbmVEZWVwKHByb3BzKSkpO1xuXG4gIE9iamVjdC5rZXlzKHByb3BzKS5mb3JFYWNoKChwcm9wLCBpKSA9PiB7XG4gICAgdC5pcyhyZXFbcHJvcF0sIGkpO1xuICB9KTtcbn0pO1xuXG4vLyBzZWxmLXJldHVybmluZyBtZXRob2RzXG5jb25zdCBzZWxmUmV0dXJuaW5nTWV0aG9kcyA9IFtcbiAgJ2FkZExpc3RlbmVyJyxcbiAgJ29uJyxcbiAgJ29uY2UnLFxuICAncHJlcGVuZExpc3RlbmVyJyxcbiAgJ3ByZXBlbmRPbmNlTGlzdGVuZXInLFxuICAncmVtb3ZlQWxsTGlzdGVuZXJzJyxcbiAgJ3JlbW92ZUxpc3RlbmVyJyxcbiAgJ3NldE1heExpc3RlbmVycycsXG4gICdwYXVzZScsXG4gICdyZXN1bWUnLFxuICAnc2V0RW5jb2RpbmcnLFxuICAnc2V0VGltZW91dCdcbl07XG5cbi8vIE5vcm1hbC1yZXR1cm5pbmcgbWV0aG9kc1xuY29uc3Qgbm9ybWFsUmV0dXJuaW5nTWV0aG9kcyA9IFtcbiAgJ2VtaXQnLFxuICAnZXZlbnROYW1lcycsXG4gICdnZXRNYXhMaXN0ZW5lcnMnLFxuICAnbGlzdGVuZXJDb3VudCcsXG4gICdsaXN0ZW5lcnMnLFxuICAnaXNQYXVzZWQnLFxuICAncGlwZScsXG4gICdyZWFkJyxcbiAgJ3VucGlwZScsXG4gICd1bnNoaWZ0JyxcbiAgJ3dyYXAnLFxuICAnZGVzdHJveSdcbl07XG5cbnNlbGZSZXR1cm5pbmdNZXRob2RzLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICB0ZXN0KGBzZWxmLXJldHVybmluZyBwYXNzIHRocm91Z2ggbWV0aG9kID4gJHsgbWV0aG9kIH1gLCAodCkgPT4ge1xuICAgIHQucGxhbigyKTtcblxuICAgIGxldCByZXEgPSAoPGFueT5tb2NrQmFzaWMoe1xuICAgICAgW21ldGhvZF0oKSB7IHQucGFzcygpOyB9XG4gICAgfSkpO1xuXG4gICAgdC5kZWVwRXF1YWwocmVxW21ldGhvZF0oKSwgcmVxLCBgJHsgbWV0aG9kIH0gcmV0dXJucyB0aGUgUmVxdWVzdCBvYmplY3RgKTtcbiAgfSk7XG59KTtcblxubm9ybWFsUmV0dXJuaW5nTWV0aG9kcy5mb3JFYWNoKChtZXRob2QsIGkpID0+IHtcbiAgdGVzdChgcGFzcyB0aHJvdWdoIG1ldGhvZCA+ICR7IG1ldGhvZCB9YCwgKHQpID0+IHtcbiAgICB0LnBsYW4oMik7XG5cbiAgICBsZXQgcmVxID0gKDxhbnk+bW9ja0Jhc2ljKHtcbiAgICAgIFttZXRob2RdKCkgeyB0LnBhc3MoKTsgcmV0dXJuIGk7IH1cbiAgICB9KSk7XG5cbiAgICB0LmlzKHJlcVttZXRob2RdKCksIGksIGAkeyBtZXRob2QgfSByZXR1cm5zIHRoZSB2YWx1ZSBmcm9tIHRoZSBwYXNzZWQgdGhyb3VnaCBtZXRob2RgKTtcbiAgfSk7XG59KVxuIl19