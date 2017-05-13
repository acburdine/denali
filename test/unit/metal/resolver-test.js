"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const denali_1 = require("denali");
const dummyAppPath = path.join(__dirname, '..', '..', '..');
ava_1.default('registered entries take precedence over resolved entries', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let resolver = new denali_1.Resolver(dummyAppPath);
    t.is(Object.getPrototypeOf(resolver.retrieve('action:application')), denali_1.Action);
    resolver.register('action:application', { foo: true });
    t.true(resolver.retrieve('action:application').foo);
}));
ava_1.default('retrieve tries type-specific retrieval methods if present', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class TestResolver extends denali_1.Resolver {
        retrieveFoo(type, entry) {
            t.pass();
        }
    }
    let resolver = new TestResolver(dummyAppPath);
    resolver.retrieve('foo:main');
}));
ava_1.default('availableForType returns array of available entries for given type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let resolver = new denali_1.Resolver(dummyAppPath);
    resolver.register('foo:1', {});
    resolver.register('foo:2', {});
    resolver.register('foo:3', {});
    t.deepEqual(resolver.availableForType('foo'), ['foo:1', 'foo:2', 'foo:3']);
}));
ava_1.default('availableForType tries type-specific retrieval methods if present', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    class TestResolver extends denali_1.Resolver {
        availableForFoo(type) {
            t.pass();
            return [];
        }
    }
    let resolver = new TestResolver(dummyAppPath);
    resolver.availableForType('foo');
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZXItdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvbWV0YWwvcmVzb2x2ZXItdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLDZCQUE2QjtBQUM3QixtQ0FBMEM7QUFFMUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUU1RCxhQUFJLENBQUMsMERBQTBELEVBQUUsQ0FBTyxDQUFDO0lBQ3ZFLElBQUksUUFBUSxHQUFHLElBQUksaUJBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsZUFBTSxDQUFDLENBQUM7SUFDN0UsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RELENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsMkRBQTJELEVBQUUsQ0FBTyxDQUFDO0lBQ3hFLGtCQUFtQixTQUFRLGlCQUFRO1FBQ2pDLFdBQVcsQ0FBQyxJQUFZLEVBQUUsS0FBYTtZQUNyQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDO0tBQ0Y7SUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsb0VBQW9FLEVBQUUsQ0FBTyxDQUFDO0lBQ2pGLElBQUksUUFBUSxHQUFHLElBQUksaUJBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMxQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQixRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQixRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFFLENBQUMsQ0FBQztBQUMvRSxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLG1FQUFtRSxFQUFFLENBQU8sQ0FBQztJQUNoRixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1Ysa0JBQW1CLFNBQVEsaUJBQVE7UUFDakMsZUFBZSxDQUFDLElBQVk7WUFDMUIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1QsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNaLENBQUM7S0FDRjtJQUNELElBQUksUUFBUSxHQUFHLElBQUksWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQWN0aW9uLCBSZXNvbHZlciB9IGZyb20gJ2RlbmFsaSc7XG5cbmNvbnN0IGR1bW15QXBwUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicpO1xuXG50ZXN0KCdyZWdpc3RlcmVkIGVudHJpZXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgcmVzb2x2ZWQgZW50cmllcycsIGFzeW5jICh0KSA9PiB7XG4gIGxldCByZXNvbHZlciA9IG5ldyBSZXNvbHZlcihkdW1teUFwcFBhdGgpO1xuICB0LmlzKE9iamVjdC5nZXRQcm90b3R5cGVPZihyZXNvbHZlci5yZXRyaWV2ZSgnYWN0aW9uOmFwcGxpY2F0aW9uJykpLCBBY3Rpb24pO1xuICByZXNvbHZlci5yZWdpc3RlcignYWN0aW9uOmFwcGxpY2F0aW9uJywgeyBmb286IHRydWUgfSk7XG4gIHQudHJ1ZShyZXNvbHZlci5yZXRyaWV2ZSgnYWN0aW9uOmFwcGxpY2F0aW9uJykuZm9vKTtcbn0pO1xuXG50ZXN0KCdyZXRyaWV2ZSB0cmllcyB0eXBlLXNwZWNpZmljIHJldHJpZXZhbCBtZXRob2RzIGlmIHByZXNlbnQnLCBhc3luYyAodCkgPT4ge1xuICBjbGFzcyBUZXN0UmVzb2x2ZXIgZXh0ZW5kcyBSZXNvbHZlciB7XG4gICAgcmV0cmlldmVGb28odHlwZTogc3RyaW5nLCBlbnRyeTogc3RyaW5nKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICB9XG4gIH1cbiAgbGV0IHJlc29sdmVyID0gbmV3IFRlc3RSZXNvbHZlcihkdW1teUFwcFBhdGgpO1xuICByZXNvbHZlci5yZXRyaWV2ZSgnZm9vOm1haW4nKTtcbn0pO1xuXG50ZXN0KCdhdmFpbGFibGVGb3JUeXBlIHJldHVybnMgYXJyYXkgb2YgYXZhaWxhYmxlIGVudHJpZXMgZm9yIGdpdmVuIHR5cGUnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgcmVzb2x2ZXIgPSBuZXcgUmVzb2x2ZXIoZHVtbXlBcHBQYXRoKTtcbiAgcmVzb2x2ZXIucmVnaXN0ZXIoJ2ZvbzoxJywge30pO1xuICByZXNvbHZlci5yZWdpc3RlcignZm9vOjInLCB7fSk7XG4gIHJlc29sdmVyLnJlZ2lzdGVyKCdmb286MycsIHt9KTtcbiAgdC5kZWVwRXF1YWwocmVzb2x2ZXIuYXZhaWxhYmxlRm9yVHlwZSgnZm9vJyksIFsgJ2ZvbzoxJywgJ2ZvbzoyJywgJ2ZvbzozJyBdKTtcbn0pO1xuXG50ZXN0KCdhdmFpbGFibGVGb3JUeXBlIHRyaWVzIHR5cGUtc3BlY2lmaWMgcmV0cmlldmFsIG1ldGhvZHMgaWYgcHJlc2VudCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgY2xhc3MgVGVzdFJlc29sdmVyIGV4dGVuZHMgUmVzb2x2ZXIge1xuICAgIGF2YWlsYWJsZUZvckZvbyh0eXBlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cbiAgbGV0IHJlc29sdmVyID0gbmV3IFRlc3RSZXNvbHZlcihkdW1teUFwcFBhdGgpO1xuICByZXNvbHZlci5hdmFpbGFibGVGb3JUeXBlKCdmb28nKTtcbn0pO1xuIl19