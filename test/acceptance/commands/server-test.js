"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const fs = require("fs-extra");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const denali_cli_1 = require("denali-cli");
function linkDependency(pkgDir, dependencyName, dependencyDir) {
    let dest = path.join(pkgDir, 'node_modules', dependencyName);
    // use fs-extra
    mkdirp.sync(path.dirname(dest));
    rimraf.sync(dest);
    fs.symlinkSync(dependencyDir, dest);
}
ava_1.default('launches a server', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let server = new denali_cli_1.CommandAcceptanceTest('server --port 3001', { name: 'server-command' });
    return server.spawn({
        failOnStderr: true,
        env: {
            DEBUG: null
        },
        checkOutput(stdout) {
            let started = stdout.indexOf('dummy@0.0.0 server up') > -1;
            if (started) {
                t.pass();
            }
            return started;
        }
    });
}));
ava_1.default('launches a server based on the dummy app in an addon', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let generateAddon = new denali_cli_1.CommandAcceptanceTest('addon my-denali-addon', { name: 'server-command-dummy-app', populateWithDummy: false });
    yield generateAddon.run({ failOnStderr: true });
    linkDependency(path.join(generateAddon.dir, 'my-denali-addon'), 'denali', path.join(process.cwd(), 'node_modules', 'denali'));
    let server = new denali_cli_1.CommandAcceptanceTest('server --port 3002', {
        dir: path.join(generateAddon.dir, 'my-denali-addon'),
        populateWithDummy: false
    });
    return server.spawn({
        failOnStderr: true,
        checkOutput(stdout, stderr) {
            let started = stdout.indexOf('dummy@0.0.0 server up') > -1;
            if (started) {
                t.pass();
            }
            return started;
        }
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2NvbW1hbmRzL3NlcnZlci10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsaUNBQWlDO0FBQ2pDLDJDQUFtRDtBQUVuRCx3QkFBd0IsTUFBYyxFQUFFLGNBQXNCLEVBQUUsYUFBcUI7SUFDbkYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzdELGVBQWU7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCxhQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBTyxDQUFDO0lBQ2hDLElBQUksTUFBTSxHQUFHLElBQUksa0NBQXFCLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBRXpGLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2xCLFlBQVksRUFBRSxJQUFJO1FBQ2xCLEdBQUcsRUFBRTtZQUNILEtBQUssRUFBRSxJQUFJO1NBQ1o7UUFDRCxXQUFXLENBQUMsTUFBTTtZQUNoQixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDWixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxzREFBc0QsRUFBRSxDQUFPLENBQUM7SUFDbkUsSUFBSSxhQUFhLEdBQUcsSUFBSSxrQ0FBcUIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZJLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUgsSUFBSSxNQUFNLEdBQUcsSUFBSSxrQ0FBcUIsQ0FBQyxvQkFBb0IsRUFBRTtRQUMzRCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDO1FBQ3BELGlCQUFpQixFQUFFLEtBQUs7S0FDekIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNO1lBQ3hCLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNaLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgKiBhcyByaW1yYWYgZnJvbSAncmltcmFmJztcbmltcG9ydCB7IENvbW1hbmRBY2NlcHRhbmNlVGVzdCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuXG5mdW5jdGlvbiBsaW5rRGVwZW5kZW5jeShwa2dEaXI6IHN0cmluZywgZGVwZW5kZW5jeU5hbWU6IHN0cmluZywgZGVwZW5kZW5jeURpcjogc3RyaW5nKSB7XG4gIGxldCBkZXN0ID0gcGF0aC5qb2luKHBrZ0RpciwgJ25vZGVfbW9kdWxlcycsIGRlcGVuZGVuY3lOYW1lKTtcbiAgLy8gdXNlIGZzLWV4dHJhXG4gIG1rZGlycC5zeW5jKHBhdGguZGlybmFtZShkZXN0KSk7XG4gIHJpbXJhZi5zeW5jKGRlc3QpO1xuICBmcy5zeW1saW5rU3luYyhkZXBlbmRlbmN5RGlyLCBkZXN0KTtcbn1cblxudGVzdCgnbGF1bmNoZXMgYSBzZXJ2ZXInLCBhc3luYyAodCkgPT4ge1xuICBsZXQgc2VydmVyID0gbmV3IENvbW1hbmRBY2NlcHRhbmNlVGVzdCgnc2VydmVyIC0tcG9ydCAzMDAxJywgeyBuYW1lOiAnc2VydmVyLWNvbW1hbmQnIH0pO1xuXG4gIHJldHVybiBzZXJ2ZXIuc3Bhd24oe1xuICAgIGZhaWxPblN0ZGVycjogdHJ1ZSxcbiAgICBlbnY6IHtcbiAgICAgIERFQlVHOiBudWxsXG4gICAgfSxcbiAgICBjaGVja091dHB1dChzdGRvdXQpIHtcbiAgICAgIGxldCBzdGFydGVkID0gc3Rkb3V0LmluZGV4T2YoJ2R1bW15QDAuMC4wIHNlcnZlciB1cCcpID4gLTE7XG4gICAgICBpZiAoc3RhcnRlZCkge1xuICAgICAgICB0LnBhc3MoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGFydGVkO1xuICAgIH1cbiAgfSk7XG59KTtcblxudGVzdCgnbGF1bmNoZXMgYSBzZXJ2ZXIgYmFzZWQgb24gdGhlIGR1bW15IGFwcCBpbiBhbiBhZGRvbicsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBnZW5lcmF0ZUFkZG9uID0gbmV3IENvbW1hbmRBY2NlcHRhbmNlVGVzdCgnYWRkb24gbXktZGVuYWxpLWFkZG9uJywgeyBuYW1lOiAnc2VydmVyLWNvbW1hbmQtZHVtbXktYXBwJywgcG9wdWxhdGVXaXRoRHVtbXk6IGZhbHNlIH0pO1xuICBhd2FpdCBnZW5lcmF0ZUFkZG9uLnJ1bih7IGZhaWxPblN0ZGVycjogdHJ1ZSB9KTtcbiAgbGlua0RlcGVuZGVuY3kocGF0aC5qb2luKGdlbmVyYXRlQWRkb24uZGlyLCAnbXktZGVuYWxpLWFkZG9uJyksICdkZW5hbGknLCBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcycsICdkZW5hbGknKSk7XG4gIGxldCBzZXJ2ZXIgPSBuZXcgQ29tbWFuZEFjY2VwdGFuY2VUZXN0KCdzZXJ2ZXIgLS1wb3J0IDMwMDInLCB7XG4gICAgZGlyOiBwYXRoLmpvaW4oZ2VuZXJhdGVBZGRvbi5kaXIsICdteS1kZW5hbGktYWRkb24nKSxcbiAgICBwb3B1bGF0ZVdpdGhEdW1teTogZmFsc2VcbiAgfSk7XG5cbiAgcmV0dXJuIHNlcnZlci5zcGF3bih7XG4gICAgZmFpbE9uU3RkZXJyOiB0cnVlLFxuICAgIGNoZWNrT3V0cHV0KHN0ZG91dCwgc3RkZXJyKSB7XG4gICAgICBsZXQgc3RhcnRlZCA9IHN0ZG91dC5pbmRleE9mKCdkdW1teUAwLjAuMCBzZXJ2ZXIgdXAnKSA+IC0xO1xuICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgdC5wYXNzKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhcnRlZDtcbiAgICB9XG4gIH0pO1xufSk7XG4iXX0=