"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const denali_1 = require("denali");
ava_1.default('Model > #eachAttribute > iterates over each attribute', (t) => {
    class TestModel extends denali_1.Model {
    }
    TestModel.foo = denali_1.attr('text');
    TestModel.bar = denali_1.attr('text');
    let names = [];
    TestModel.eachAttribute((name) => {
        names.push(name);
    });
    t.deepEqual(names, ['foo', 'bar']);
});
ava_1.default('Model > #eachAttribute > iterating over parent classes should not impact child classes', (t) => {
    class Parent extends denali_1.Model {
    }
    class Child extends Parent {
    }
    Child.foo = denali_1.attr('text');
    Child.bar = denali_1.attr('text');
    let names = [];
    Parent.eachAttribute((name) => {
        names.push(name);
    });
    t.deepEqual(names, []);
    Child.eachAttribute((name) => {
        names.push(name);
    });
    t.deepEqual(names, ['foo', 'bar']);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvbW9kZWwtdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsbUNBQXFDO0FBRXJDLGFBQUksQ0FBQyx1REFBdUQsRUFBRSxDQUFDLENBQUM7SUFDOUQsZUFBZ0IsU0FBUSxjQUFLOztJQUNwQixhQUFHLEdBQUcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25CLGFBQUcsR0FBRyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFNUIsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJO1FBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFFLEtBQUssRUFBRSxLQUFLLENBQUUsQ0FBQyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQyxDQUFDO0FBRUgsYUFBSSxDQUFDLHdGQUF3RixFQUFFLENBQUMsQ0FBQztJQUMvRixZQUFhLFNBQVEsY0FBSztLQUFHO0lBQzdCLFdBQVksU0FBUSxNQUFNOztJQUNqQixTQUFHLEdBQUcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25CLFNBQUcsR0FBRyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFNUIsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJO1FBQ3hCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QixLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSTtRQUN2QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgdGVzdCBmcm9tICdhdmEnO1xuaW1wb3J0IHsgTW9kZWwsIGF0dHIgfSBmcm9tICdkZW5hbGknO1xuXG50ZXN0KCdNb2RlbCA+ICNlYWNoQXR0cmlidXRlID4gaXRlcmF0ZXMgb3ZlciBlYWNoIGF0dHJpYnV0ZScsICh0KSA9PiB7XG4gIGNsYXNzIFRlc3RNb2RlbCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgZm9vID0gYXR0cigndGV4dCcpO1xuICAgIHN0YXRpYyBiYXIgPSBhdHRyKCd0ZXh0Jyk7XG4gIH1cbiAgbGV0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICBUZXN0TW9kZWwuZWFjaEF0dHJpYnV0ZSgobmFtZSkgPT4ge1xuICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gIH0pO1xuICB0LmRlZXBFcXVhbChuYW1lcywgWyAnZm9vJywgJ2JhcicgXSk7XG59KTtcblxudGVzdCgnTW9kZWwgPiAjZWFjaEF0dHJpYnV0ZSA+IGl0ZXJhdGluZyBvdmVyIHBhcmVudCBjbGFzc2VzIHNob3VsZCBub3QgaW1wYWN0IGNoaWxkIGNsYXNzZXMnLCAodCkgPT4ge1xuICBjbGFzcyBQYXJlbnQgZXh0ZW5kcyBNb2RlbCB7fVxuICBjbGFzcyBDaGlsZCBleHRlbmRzIFBhcmVudCB7XG4gICAgc3RhdGljIGZvbyA9IGF0dHIoJ3RleHQnKTtcbiAgICBzdGF0aWMgYmFyID0gYXR0cigndGV4dCcpO1xuICB9XG4gIGxldCBuYW1lczogc3RyaW5nW10gPSBbXTtcbiAgUGFyZW50LmVhY2hBdHRyaWJ1dGUoKG5hbWUpID0+IHtcbiAgICBuYW1lcy5wdXNoKG5hbWUpO1xuICB9KTtcbiAgdC5kZWVwRXF1YWwobmFtZXMsIFtdKTtcbiAgQ2hpbGQuZWFjaEF0dHJpYnV0ZSgobmFtZSkgPT4ge1xuICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gIH0pO1xuICB0LmRlZXBFcXVhbChuYW1lcywgWyAnZm9vJywgJ2JhcicgXSk7XG59KTtcbiJdfQ==