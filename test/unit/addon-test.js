"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ava_1 = require("ava");
const path = require("path");
const denali_1 = require("denali");
ava_1.default('Addon > #loadApp > Singletons are instantiated', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let dir = path.join(__dirname, '..', 'fixtures', 'addon');
    let container = new denali_1.Container();
    let logger = new denali_1.Logger();
    let addon = new denali_1.Addon({
        environment: 'development',
        logger,
        container,
        dir
    });
    addon.loadApp();
    let service = container.lookup('service:test');
    t.true(service instanceof denali_1.Service, 'Has correct baseclass');
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb24tdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvYWRkb24tdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLG1DQUEyRDtBQUUzRCxhQUFJLENBQUMsZ0RBQWdELEVBQUUsQ0FBTyxDQUFDO0lBQzdELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxrQkFBUyxFQUFFLENBQUM7SUFDaEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztJQUMxQixJQUFJLEtBQUssR0FBRyxJQUFJLGNBQUssQ0FBQztRQUNwQixXQUFXLEVBQUUsYUFBYTtRQUMxQixNQUFNO1FBQ04sU0FBUztRQUNULEdBQUc7S0FDSixDQUFDLENBQUM7SUFFRyxLQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUUvQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxnQkFBTyxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFDOUQsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgTG9nZ2VyLCBBZGRvbiwgQ29udGFpbmVyLCBTZXJ2aWNlIH0gZnJvbSAnZGVuYWxpJztcblxudGVzdCgnQWRkb24gPiAjbG9hZEFwcCA+IFNpbmdsZXRvbnMgYXJlIGluc3RhbnRpYXRlZCcsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBkaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnZml4dHVyZXMnLCAnYWRkb24nKTtcbiAgbGV0IGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgbGV0IGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcbiAgbGV0IGFkZG9uID0gbmV3IEFkZG9uKHtcbiAgICBlbnZpcm9ubWVudDogJ2RldmVsb3BtZW50JyxcbiAgICBsb2dnZXIsXG4gICAgY29udGFpbmVyLFxuICAgIGRpclxuICB9KTtcblxuICAoPGFueT5hZGRvbikubG9hZEFwcCgpO1xuICBsZXQgc2VydmljZSA9IGNvbnRhaW5lci5sb29rdXAoJ3NlcnZpY2U6dGVzdCcpO1xuXG4gIHQudHJ1ZShzZXJ2aWNlIGluc3RhbmNlb2YgU2VydmljZSwgJ0hhcyBjb3JyZWN0IGJhc2VjbGFzcycpO1xufSk7XG4iXX0=