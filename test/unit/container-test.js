"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('Container > #register(type, value) > registers a value on the container', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container();
    container.register('foo:bar', { buzz: true });
    t.true(container.lookup('foo:bar').buzz);
}));
ava_1.default('Container > #lookup(type) > looks up a module', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container();
    container.register('foo:bar', { buzz: true });
    t.true(container.lookup('foo:bar').buzz);
}));
ava_1.default('Container > #lookupAll(type) > returns an object with all the modules of the given type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container();
    container.register('foo:bar', { buzz: true });
    container.register('foo:buzz', { bat: true });
    let type = container.lookupAll('foo');
    t.truthy(type.bar);
    t.true(type.bar.buzz);
    t.truthy(type.buzz);
    t.true(type.buzz.bat);
}));
ava_1.default('Container > singletons > should instantiate a singleton', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container();
    class Class {
    }
    Class.singleton = true;
    container.register('foo:bar', new Class());
    let classInstance = container.lookup('foo:bar');
    let classInstanceTwo = container.lookup('foo:bar');
    t.true(classInstance instanceof Class);
    t.is(classInstanceTwo, classInstance);
}));
ava_1.default('Container > singletons > lazily instantiates singletons (i.e. on lookup)', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container();
    function Class() {
        t.fail('Class should not have been instantiated.');
    }
    Class.singleton = true;
    container.register('foo:bar', Class);
}));
ava_1.default('Container > #availableForType() > returns all registered instances of a type', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = new denali_1.Container();
    container.register('foo:a', { a: true });
    container.register('foo:b', { b: true });
    container.register('foo:c', { c: true });
    container.register('foo:d', { d: true });
    t.deepEqual(container.availableForType('foo'), ['a', 'b', 'c', 'd']);
}));
ava_1.default.todo('Container > #lookupSerializer() > injects all serializer singletons into each serializer');
// let container = new Container();
// class SerializerOne {
//   static singleton = true
// }
// class SerializerTwo {
//   static singleton = true
// }
// container.register('serializer:one', new SerializerOne());
// container.register('serializer:two', new SerializerTwo());
//
// let serializerOne = container.lookup('serializer:one');
// expect(serializerOne).to.be.an.instanceof(SerializerOne);
// expect(serializerOne.serializers).to.have.keys([ 'one', 'two' ]);
// expect(serializerOne.serializers.two).to.be.an.instanceof(SerializerTwo);
ava_1.default.todo('Container > #lookupAdapter > injects all adapter singletons into each adapter');
// let container = new Container();
// class AdapterOne {
//   static singleton = true
// }
// class AdapterTwo {
//   static singleton = true
// }
// container.register('adapter:one', new AdapterOne());
// container.register('adapter:two', new AdapterTwo());
//
// let adapterOne = container.lookup('adapter:one');
// expect(adapterOne).to.be.an.instanceof(AdapterOne);
// expect(adapterOne.adapters).to.have.keys([ 'one', 'two' ]);
// expect(adapterOne.adapters.two).to.be.an.instanceof(AdapterTwo);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC91bml0L2NvbnRhaW5lci10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsbUNBQW1DO0FBRW5DLGFBQUksQ0FBQyx5RUFBeUUsRUFBRSxDQUFPLENBQUM7SUFDdEYsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7SUFDaEMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQywrQ0FBK0MsRUFBRSxDQUFPLENBQUM7SUFDNUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7SUFDaEMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyx5RkFBeUYsRUFBRSxDQUFPLENBQUM7SUFDdEcsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7SUFDaEMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM5QyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLEdB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QTRCO0FBQzVCLElBQUk7QUFDSixxQkFBcUI7QUFDckIsNEJBQTRCO0FBQzVCLElBQUk7QUFDSix1REFBdUQ7QUFDdkQsdURBQXVEO0FBQ3ZELEVBQUU7QUFDRixvREFBb0Q7QUFDcEQsc0RBQXNEO0FBQ3RELDhEQUE4RDtBQUM5RCxtRUFBbUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCB7IENvbnRhaW5lciB9IGZyb20gJ2RlbmFsaSc7XG5cbnRlc3QoJ0NvbnRhaW5lciA+ICNyZWdpc3Rlcih0eXBlLCB2YWx1ZSkgPiByZWdpc3RlcnMgYSB2YWx1ZSBvbiB0aGUgY29udGFpbmVyJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdmb286YmFyJywgeyBidXp6OiB0cnVlIH0pO1xuICB0LnRydWUoY29udGFpbmVyLmxvb2t1cCgnZm9vOmJhcicpLmJ1enopO1xufSk7XG5cbnRlc3QoJ0NvbnRhaW5lciA+ICNsb29rdXAodHlwZSkgPiBsb29rcyB1cCBhIG1vZHVsZScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOmJhcicsIHsgYnV6ejogdHJ1ZSB9KTtcbiAgdC50cnVlKGNvbnRhaW5lci5sb29rdXAoJ2ZvbzpiYXInKS5idXp6KTtcbn0pO1xuXG50ZXN0KCdDb250YWluZXIgPiAjbG9va3VwQWxsKHR5cGUpID4gcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG1vZHVsZXMgb2YgdGhlIGdpdmVuIHR5cGUnLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzpiYXInLCB7IGJ1eno6IHRydWUgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOmJ1enonLCB7IGJhdDogdHJ1ZSB9KTtcbiAgbGV0IHR5cGUgPSAoPGFueT4gY29udGFpbmVyLmxvb2t1cEFsbCgnZm9vJykpO1xuICB0LnRydXRoeSh0eXBlLmJhcik7XG4gIHQudHJ1ZSh0eXBlLmJhci5idXp6KTtcbiAgdC50cnV0aHkodHlwZS5idXp6KTtcbiAgdC50cnVlKHR5cGUuYnV6ei5iYXQpO1xufSk7XG5cbnRlc3QoJ0NvbnRhaW5lciA+IHNpbmdsZXRvbnMgPiBzaG91bGQgaW5zdGFudGlhdGUgYSBzaW5nbGV0b24nLCBhc3luYyAodCkgPT4ge1xuICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcigpO1xuICBjbGFzcyBDbGFzcyB7XG4gICAgc3RhdGljIHNpbmdsZXRvbiA9IHRydWU7XG4gIH1cbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdmb286YmFyJywgbmV3IENsYXNzKCkpO1xuXG4gIGxldCBjbGFzc0luc3RhbmNlID0gY29udGFpbmVyLmxvb2t1cCgnZm9vOmJhcicpO1xuICBsZXQgY2xhc3NJbnN0YW5jZVR3byA9IGNvbnRhaW5lci5sb29rdXAoJ2ZvbzpiYXInKTtcbiAgdC50cnVlKGNsYXNzSW5zdGFuY2UgaW5zdGFuY2VvZiBDbGFzcyk7XG4gIHQuaXMoY2xhc3NJbnN0YW5jZVR3bywgY2xhc3NJbnN0YW5jZSk7XG59KTtcblxudGVzdCgnQ29udGFpbmVyID4gc2luZ2xldG9ucyA+IGxhemlseSBpbnN0YW50aWF0ZXMgc2luZ2xldG9ucyAoaS5lLiBvbiBsb29rdXApJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgZnVuY3Rpb24gQ2xhc3MoKSB7XG4gICAgdC5mYWlsKCdDbGFzcyBzaG91bGQgbm90IGhhdmUgYmVlbiBpbnN0YW50aWF0ZWQuJyk7XG4gIH1cbiAgKDxhbnk+Q2xhc3MpLnNpbmdsZXRvbiA9IHRydWU7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOmJhcicsIENsYXNzKTtcbn0pO1xuXG50ZXN0KCdDb250YWluZXIgPiAjYXZhaWxhYmxlRm9yVHlwZSgpID4gcmV0dXJucyBhbGwgcmVnaXN0ZXJlZCBpbnN0YW5jZXMgb2YgYSB0eXBlJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcblxuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzphJywge2E6IHRydWV9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdmb286YicsIHtiOiB0cnVlfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignZm9vOmMnLCB7YzogdHJ1ZX0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ2ZvbzpkJywge2Q6IHRydWV9KTtcblxuICB0LmRlZXBFcXVhbChjb250YWluZXIuYXZhaWxhYmxlRm9yVHlwZSgnZm9vJyksIFsnYScsICdiJywgJ2MnLCAnZCddKTtcbn0pO1xuXG50ZXN0LnRvZG8oJ0NvbnRhaW5lciA+ICNsb29rdXBTZXJpYWxpemVyKCkgPiBpbmplY3RzIGFsbCBzZXJpYWxpemVyIHNpbmdsZXRvbnMgaW50byBlYWNoIHNlcmlhbGl6ZXInKTtcbi8vIGxldCBjb250YWluZXIgPSBuZXcgQ29udGFpbmVyKCk7XG4vLyBjbGFzcyBTZXJpYWxpemVyT25lIHtcbi8vICAgc3RhdGljIHNpbmdsZXRvbiA9IHRydWVcbi8vIH1cbi8vIGNsYXNzIFNlcmlhbGl6ZXJUd28ge1xuLy8gICBzdGF0aWMgc2luZ2xldG9uID0gdHJ1ZVxuLy8gfVxuLy8gY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOm9uZScsIG5ldyBTZXJpYWxpemVyT25lKCkpO1xuLy8gY29udGFpbmVyLnJlZ2lzdGVyKCdzZXJpYWxpemVyOnR3bycsIG5ldyBTZXJpYWxpemVyVHdvKCkpO1xuLy9cbi8vIGxldCBzZXJpYWxpemVyT25lID0gY29udGFpbmVyLmxvb2t1cCgnc2VyaWFsaXplcjpvbmUnKTtcbi8vIGV4cGVjdChzZXJpYWxpemVyT25lKS50by5iZS5hbi5pbnN0YW5jZW9mKFNlcmlhbGl6ZXJPbmUpO1xuLy8gZXhwZWN0KHNlcmlhbGl6ZXJPbmUuc2VyaWFsaXplcnMpLnRvLmhhdmUua2V5cyhbICdvbmUnLCAndHdvJyBdKTtcbi8vIGV4cGVjdChzZXJpYWxpemVyT25lLnNlcmlhbGl6ZXJzLnR3bykudG8uYmUuYW4uaW5zdGFuY2VvZihTZXJpYWxpemVyVHdvKTtcblxudGVzdC50b2RvKCdDb250YWluZXIgPiAjbG9va3VwQWRhcHRlciA+IGluamVjdHMgYWxsIGFkYXB0ZXIgc2luZ2xldG9ucyBpbnRvIGVhY2ggYWRhcHRlcicpO1xuLy8gbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbi8vIGNsYXNzIEFkYXB0ZXJPbmUge1xuLy8gICBzdGF0aWMgc2luZ2xldG9uID0gdHJ1ZVxuLy8gfVxuLy8gY2xhc3MgQWRhcHRlclR3byB7XG4vLyAgIHN0YXRpYyBzaW5nbGV0b24gPSB0cnVlXG4vLyB9XG4vLyBjb250YWluZXIucmVnaXN0ZXIoJ2FkYXB0ZXI6b25lJywgbmV3IEFkYXB0ZXJPbmUoKSk7XG4vLyBjb250YWluZXIucmVnaXN0ZXIoJ2FkYXB0ZXI6dHdvJywgbmV3IEFkYXB0ZXJUd28oKSk7XG4vL1xuLy8gbGV0IGFkYXB0ZXJPbmUgPSBjb250YWluZXIubG9va3VwKCdhZGFwdGVyOm9uZScpO1xuLy8gZXhwZWN0KGFkYXB0ZXJPbmUpLnRvLmJlLmFuLmluc3RhbmNlb2YoQWRhcHRlck9uZSk7XG4vLyBleHBlY3QoYWRhcHRlck9uZS5hZGFwdGVycykudG8uaGF2ZS5rZXlzKFsgJ29uZScsICd0d28nIF0pO1xuLy8gZXhwZWN0KGFkYXB0ZXJPbmUuYWRhcHRlcnMudHdvKS50by5iZS5hbi5pbnN0YW5jZW9mKEFkYXB0ZXJUd28pO1xuIl19