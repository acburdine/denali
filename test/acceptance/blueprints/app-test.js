"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ava_1 = require("ava");
const fs = require("fs-extra");
const path = require("path");
const denali_1 = require("denali");
ava_1.default('app blueprint > generates correctly', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let blueprint = new denali_1.BlueprintAcceptanceTest('app');
    t.context.dir = blueprint.dir;
    t.context.gitignore = path.join(blueprint.dir, 'test', '.gitignore');
    yield blueprint.generate('test');
    t.true(fs.existsSync(t.context.gitignore), '.gitignore file should exist');
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2JsdWVwcmludHMvYXBwLXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQXVCO0FBQ3ZCLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IsbUNBQWlEO0FBRWpELGFBQUksQ0FBQyxxQ0FBcUMsRUFBRSxDQUFPLENBQUM7SUFDbEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxnQ0FBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuRCxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQzlCLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFFckUsTUFBTSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLDhCQUE4QixDQUFDLENBQUM7QUFDN0UsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQmx1ZXByaW50QWNjZXB0YW5jZVRlc3QgfSBmcm9tICdkZW5hbGknO1xuXG50ZXN0KCdhcHAgYmx1ZXByaW50ID4gZ2VuZXJhdGVzIGNvcnJlY3RseScsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBibHVlcHJpbnQgPSBuZXcgQmx1ZXByaW50QWNjZXB0YW5jZVRlc3QoJ2FwcCcpO1xuICB0LmNvbnRleHQuZGlyID0gYmx1ZXByaW50LmRpcjtcbiAgdC5jb250ZXh0LmdpdGlnbm9yZSA9IHBhdGguam9pbihibHVlcHJpbnQuZGlyLCAndGVzdCcsICcuZ2l0aWdub3JlJyk7XG5cbiAgYXdhaXQgYmx1ZXByaW50LmdlbmVyYXRlKCd0ZXN0Jyk7XG4gIHQudHJ1ZShmcy5leGlzdHNTeW5jKHQuY29udGV4dC5naXRpZ25vcmUpLCAnLmdpdGlnbm9yZSBmaWxlIHNob3VsZCBleGlzdCcpO1xufSk7XG4iXX0=