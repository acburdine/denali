"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('walks prototype chain of object', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class Grandparent {
    }
    class Parent extends Grandparent {
    }
    class Child extends Parent {
    }
    let prototypes = [];
    denali_1.eachPrototype(Child, (prototype) => {
        prototypes.push(prototype);
    });
    t.deepEqual(prototypes, [Child, Parent, Grandparent, Object.getPrototypeOf(Function), Object.getPrototypeOf({})]);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWFjaC1wcm90b3R5cGUtdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvbWV0YWwvZWFjaC1wcm90b3R5cGUtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBMEU7QUFDMUUsNkJBQXVCO0FBQ3ZCLG1DQUF1QztBQUV2QyxhQUFJLENBQUMsaUNBQWlDLEVBQUUsQ0FBTyxDQUFDO0lBQzlDO0tBQW9CO0lBQ3BCLFlBQWEsU0FBUSxXQUFXO0tBQUc7SUFDbkMsV0FBWSxTQUFRLE1BQU07S0FBRztJQUU3QixJQUFJLFVBQVUsR0FBVSxFQUFFLENBQUM7SUFDM0Isc0JBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxTQUFTO1FBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUM7QUFDdEgsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgZWFjaFByb3RvdHlwZSB9IGZyb20gJ2RlbmFsaSc7XG5cbnRlc3QoJ3dhbGtzIHByb3RvdHlwZSBjaGFpbiBvZiBvYmplY3QnLCBhc3luYyAodCkgPT4ge1xuICBjbGFzcyBHcmFuZHBhcmVudCB7fVxuICBjbGFzcyBQYXJlbnQgZXh0ZW5kcyBHcmFuZHBhcmVudCB7fVxuICBjbGFzcyBDaGlsZCBleHRlbmRzIFBhcmVudCB7fVxuXG4gIGxldCBwcm90b3R5cGVzOiBhbnlbXSA9IFtdO1xuICBlYWNoUHJvdG90eXBlKENoaWxkLCAocHJvdG90eXBlKSA9PiB7XG4gICAgcHJvdG90eXBlcy5wdXNoKHByb3RvdHlwZSk7XG4gIH0pO1xuXG4gIHQuZGVlcEVxdWFsKHByb3RvdHlwZXMsIFsgQ2hpbGQsIFBhcmVudCwgR3JhbmRwYXJlbnQsIE9iamVjdC5nZXRQcm90b3R5cGVPZihGdW5jdGlvbiksIE9iamVjdC5nZXRQcm90b3R5cGVPZih7fSkgXSk7XG59KTtcbiJdfQ==