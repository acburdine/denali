"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: 'unhandled-promises',
    initialize() {
        process.on('unhandledRejection', (reason) => {
            // tslint:disable-next-line:no-console
            console.error(reason.stack || reason.message || reason);
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5oYW5kbGVkLXByb21pc2VzLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImNvbmZpZy9pbml0aWFsaXplcnMvdW5oYW5kbGVkLXByb21pc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBQWU7SUFDYixJQUFJLEVBQUUsb0JBQW9CO0lBQzFCLFVBQVU7UUFDUixPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBVztZQUMzQyxzQ0FBc0M7WUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ3VuaGFuZGxlZC1wcm9taXNlcycsXG4gIGluaXRpYWxpemUoKTogdm9pZCB7XG4gICAgcHJvY2Vzcy5vbigndW5oYW5kbGVkUmVqZWN0aW9uJywgKHJlYXNvbjogYW55KSA9PiB7XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgICAgY29uc29sZS5lcnJvcihyZWFzb24uc3RhY2sgfHwgcmVhc29uLm1lc3NhZ2UgfHwgcmVhc29uKTtcbiAgICB9KTtcbiAgfVxufTsiXX0=