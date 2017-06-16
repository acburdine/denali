"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('mixins apply in order', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class Base {
    }
    let MixinOne = denali_1.createMixin((BaseClass) => { return _a = class MixinOne extends BaseClass {
        },
        _a.foo = 'one',
        _a; var _a; });
    let MixinTwo = denali_1.createMixin((BaseClass) => { return _a = class MixinOne extends BaseClass {
        },
        _a.foo = 'two',
        _a; var _a; });
    let Result = denali_1.mixin(Base, MixinOne, MixinTwo);
    t.is(Result.foo, 'two');
}));
ava_1.default('mixins accumulate options until applied', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    class Base {
    }
    let Mixin = denali_1.createMixin((BaseClass, optionsOne, optionsTwo) => {
        t.is(optionsOne, 'one');
        t.is(optionsTwo, 'two');
        return class MixinOne extends BaseClass {
        };
    });
    Mixin('one');
    Mixin('two');
    denali_1.mixin(Base, Mixin);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4tdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvbWV0YWwvbWl4aW4tdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQUE0QztBQUU1QyxhQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBTyxDQUFDO0lBQ3BDO0tBQWE7SUFDYixJQUFJLFFBQVEsR0FBRyxvQkFBVyxDQUFDLENBQUMsU0FBdUIsbUJBQ2pELGNBQWUsU0FBUSxTQUFTO1NBRS9CO1FBRFEsTUFBRyxHQUFHLEtBQU07cUJBQ3BCLENBQ0YsQ0FBQztJQUNGLElBQUksUUFBUSxHQUFHLG9CQUFXLENBQUMsQ0FBQyxTQUF1QixtQkFDakQsY0FBZSxTQUFRLFNBQVM7U0FFL0I7UUFEUSxNQUFHLEdBQUcsS0FBTTtxQkFDcEIsQ0FDRixDQUFDO0lBRUYsSUFBSSxNQUFNLEdBQUcsY0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMseUNBQXlDLEVBQUUsQ0FBTyxDQUFDO0lBQ3RELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDVjtLQUFhO0lBQ2IsSUFBSSxLQUFLLEdBQUcsb0JBQVcsQ0FBQyxDQUFDLFNBQXVCLEVBQUUsVUFBVSxFQUFFLFVBQVU7UUFDdEUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEIsTUFBTSxDQUFDLGNBQWUsU0FBUSxTQUFTO1NBQUcsQ0FBQztJQUM3QyxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNiLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNiLGNBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgbWl4aW4sIGNyZWF0ZU1peGluIH0gZnJvbSAnZGVuYWxpJztcblxudGVzdCgnbWl4aW5zIGFwcGx5IGluIG9yZGVyJywgYXN5bmMgKHQpID0+IHtcbiAgY2xhc3MgQmFzZSB7fVxuICBsZXQgTWl4aW5PbmUgPSBjcmVhdGVNaXhpbigoQmFzZUNsYXNzOiBuZXcoKSA9PiBhbnkpID0+XG4gICAgY2xhc3MgTWl4aW5PbmUgZXh0ZW5kcyBCYXNlQ2xhc3Mge1xuICAgICAgc3RhdGljIGZvbyA9ICdvbmUnO1xuICAgIH1cbiAgKTtcbiAgbGV0IE1peGluVHdvID0gY3JlYXRlTWl4aW4oKEJhc2VDbGFzczogbmV3KCkgPT4gYW55KSA9PlxuICAgIGNsYXNzIE1peGluT25lIGV4dGVuZHMgQmFzZUNsYXNzIHtcbiAgICAgIHN0YXRpYyBmb28gPSAndHdvJztcbiAgICB9XG4gICk7XG5cbiAgbGV0IFJlc3VsdCA9IG1peGluKEJhc2UsIE1peGluT25lLCBNaXhpblR3byk7XG4gIHQuaXMoUmVzdWx0LmZvbywgJ3R3bycpO1xufSk7XG5cbnRlc3QoJ21peGlucyBhY2N1bXVsYXRlIG9wdGlvbnMgdW50aWwgYXBwbGllZCcsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigyKTtcbiAgY2xhc3MgQmFzZSB7fVxuICBsZXQgTWl4aW4gPSBjcmVhdGVNaXhpbigoQmFzZUNsYXNzOiBuZXcoKSA9PiBhbnksIG9wdGlvbnNPbmUsIG9wdGlvbnNUd28pID0+IHtcbiAgICB0LmlzKG9wdGlvbnNPbmUsICdvbmUnKTtcbiAgICB0LmlzKG9wdGlvbnNUd28sICd0d28nKTtcbiAgICByZXR1cm4gY2xhc3MgTWl4aW5PbmUgZXh0ZW5kcyBCYXNlQ2xhc3Mge307XG4gIH0pO1xuXG4gIE1peGluKCdvbmUnKTtcbiAgTWl4aW4oJ3R3bycpO1xuICBtaXhpbihCYXNlLCBNaXhpbik7XG59KTtcbiJdfQ==