"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const ava_1 = require("ava");
const path = require("path");
const fs = require("fs-extra");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const denali_1 = require("denali");
function linkDependency(pkgDir, dependencyName, dependencyDir) {
    let dest = path.join(pkgDir, 'node_modules', dependencyName);
    // use fs-extra
    mkdirp.sync(path.dirname(dest));
    rimraf.sync(dest);
    fs.symlinkSync(dependencyDir, dest);
}
ava_1.default('launches a server', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let server = new denali_1.CommandAcceptanceTest('server --port 3001', { name: 'server-command' });
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
    let generateAddon = new denali_1.CommandAcceptanceTest('generate addon my-denali-addon', { name: 'server-command-dummy-app', populateWithDummy: false });
    yield generateAddon.run({ failOnStderr: true });
    linkDependency(path.join(generateAddon.dir, 'my-denali-addon'), 'denali', path.join(process.cwd(), 'node_modules', 'denali'));
    let server = new denali_1.CommandAcceptanceTest('server --port 3002', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2NvbW1hbmRzL3NlcnZlci10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsaUNBQWlDO0FBQ2pDLG1DQUErQztBQUUvQyx3QkFBd0IsTUFBYyxFQUFFLGNBQXNCLEVBQUUsYUFBcUI7SUFDbkYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzdELGVBQWU7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCxhQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBTyxDQUFDO0lBQ2hDLElBQUksTUFBTSxHQUFHLElBQUksOEJBQXFCLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBRXpGLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2xCLFlBQVksRUFBRSxJQUFJO1FBQ2xCLEdBQUcsRUFBRTtZQUNILEtBQUssRUFBRSxJQUFJO1NBQ1o7UUFDRCxXQUFXLENBQUMsTUFBTTtZQUNoQixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDWixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWCxDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqQixDQUFDO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxzREFBc0QsRUFBRSxDQUFPLENBQUM7SUFDbkUsSUFBSSxhQUFhLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxnQ0FBZ0MsRUFBRSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2hKLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUgsSUFBSSxNQUFNLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxvQkFBb0IsRUFBRTtRQUMzRCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDO1FBQ3BELGlCQUFpQixFQUFFLEtBQUs7S0FDekIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNO1lBQ3hCLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNaLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUEsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3Mgbm8tZW1wdHkgbm8taW52YWxpZC10aGlzIG1lbWJlci1hY2Nlc3MgKi9cbmltcG9ydCB0ZXN0IGZyb20gJ2F2YSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0ICogYXMgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgKiBhcyByaW1yYWYgZnJvbSAncmltcmFmJztcbmltcG9ydCB7IENvbW1hbmRBY2NlcHRhbmNlVGVzdCB9IGZyb20gJ2RlbmFsaSc7XG5cbmZ1bmN0aW9uIGxpbmtEZXBlbmRlbmN5KHBrZ0Rpcjogc3RyaW5nLCBkZXBlbmRlbmN5TmFtZTogc3RyaW5nLCBkZXBlbmRlbmN5RGlyOiBzdHJpbmcpIHtcbiAgbGV0IGRlc3QgPSBwYXRoLmpvaW4ocGtnRGlyLCAnbm9kZV9tb2R1bGVzJywgZGVwZW5kZW5jeU5hbWUpO1xuICAvLyB1c2UgZnMtZXh0cmFcbiAgbWtkaXJwLnN5bmMocGF0aC5kaXJuYW1lKGRlc3QpKTtcbiAgcmltcmFmLnN5bmMoZGVzdCk7XG4gIGZzLnN5bWxpbmtTeW5jKGRlcGVuZGVuY3lEaXIsIGRlc3QpO1xufVxuXG50ZXN0KCdsYXVuY2hlcyBhIHNlcnZlcicsIGFzeW5jICh0KSA9PiB7XG4gIGxldCBzZXJ2ZXIgPSBuZXcgQ29tbWFuZEFjY2VwdGFuY2VUZXN0KCdzZXJ2ZXIgLS1wb3J0IDMwMDEnLCB7IG5hbWU6ICdzZXJ2ZXItY29tbWFuZCcgfSk7XG5cbiAgcmV0dXJuIHNlcnZlci5zcGF3bih7XG4gICAgZmFpbE9uU3RkZXJyOiB0cnVlLFxuICAgIGVudjoge1xuICAgICAgREVCVUc6IG51bGxcbiAgICB9LFxuICAgIGNoZWNrT3V0cHV0KHN0ZG91dCkge1xuICAgICAgbGV0IHN0YXJ0ZWQgPSBzdGRvdXQuaW5kZXhPZignZHVtbXlAMC4wLjAgc2VydmVyIHVwJykgPiAtMTtcbiAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgIHQucGFzcygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXJ0ZWQ7XG4gICAgfVxuICB9KTtcbn0pO1xuXG50ZXN0KCdsYXVuY2hlcyBhIHNlcnZlciBiYXNlZCBvbiB0aGUgZHVtbXkgYXBwIGluIGFuIGFkZG9uJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGdlbmVyYXRlQWRkb24gPSBuZXcgQ29tbWFuZEFjY2VwdGFuY2VUZXN0KCdnZW5lcmF0ZSBhZGRvbiBteS1kZW5hbGktYWRkb24nLCB7IG5hbWU6ICdzZXJ2ZXItY29tbWFuZC1kdW1teS1hcHAnLCBwb3B1bGF0ZVdpdGhEdW1teTogZmFsc2UgfSk7XG4gIGF3YWl0IGdlbmVyYXRlQWRkb24ucnVuKHsgZmFpbE9uU3RkZXJyOiB0cnVlIH0pO1xuICBsaW5rRGVwZW5kZW5jeShwYXRoLmpvaW4oZ2VuZXJhdGVBZGRvbi5kaXIsICdteS1kZW5hbGktYWRkb24nKSwgJ2RlbmFsaScsIHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzJywgJ2RlbmFsaScpKTtcbiAgbGV0IHNlcnZlciA9IG5ldyBDb21tYW5kQWNjZXB0YW5jZVRlc3QoJ3NlcnZlciAtLXBvcnQgMzAwMicsIHtcbiAgICBkaXI6IHBhdGguam9pbihnZW5lcmF0ZUFkZG9uLmRpciwgJ215LWRlbmFsaS1hZGRvbicpLFxuICAgIHBvcHVsYXRlV2l0aER1bW15OiBmYWxzZVxuICB9KTtcblxuICByZXR1cm4gc2VydmVyLnNwYXduKHtcbiAgICBmYWlsT25TdGRlcnI6IHRydWUsXG4gICAgY2hlY2tPdXRwdXQoc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgIGxldCBzdGFydGVkID0gc3Rkb3V0LmluZGV4T2YoJ2R1bW15QDAuMC4wIHNlcnZlciB1cCcpID4gLTE7XG4gICAgICBpZiAoc3RhcnRlZCkge1xuICAgICAgICB0LnBhc3MoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGFydGVkO1xuICAgIH1cbiAgfSk7XG59KTtcbiJdfQ==