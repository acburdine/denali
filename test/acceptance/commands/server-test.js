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
ava_1.default('server command > launches a server', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let server = new denali_1.CommandAcceptanceTest('server --port 3001', { name: 'server-command' });
    return server.spawn({
        failOnStderr: true,
        env: {
            DEBUG: null
        },
        checkOutput(stdout) {
            return stdout.indexOf('dummy@0.0.0 server up') > -1;
        }
    });
}));
ava_1.default('server command > launches a server based on the dummy app in an addon', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            return stdout.indexOf('dummy@0.0.0 server up') > -1;
        }
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLXRlc3QuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsidGVzdC9hY2NlcHRhbmNlL2NvbW1hbmRzL3NlcnZlci10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSw2QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsaUNBQWlDO0FBQ2pDLG1DQUErQztBQUUvQyx3QkFBd0IsTUFBYyxFQUFFLGNBQXNCLEVBQUUsYUFBcUI7SUFDbkYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzdELGVBQWU7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCxhQUFJLENBQUMsb0NBQW9DLEVBQUU7SUFDekMsSUFBSSxNQUFNLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFFekYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsR0FBRyxFQUFFO1lBQ0gsS0FBSyxFQUFFLElBQUk7U0FDWjtRQUNELFdBQVcsQ0FBQyxNQUFNO1lBQ2hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFSCxhQUFJLENBQUMsdUVBQXVFLEVBQUU7SUFDNUUsSUFBSSxhQUFhLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxnQ0FBZ0MsRUFBRSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2hKLE1BQU0sYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUgsSUFBSSxNQUFNLEdBQUcsSUFBSSw4QkFBcUIsQ0FBQyxvQkFBb0IsRUFBRTtRQUMzRCxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLGlCQUFpQixDQUFDO1FBQ3BELGlCQUFpQixFQUFFLEtBQUs7S0FDekIsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDbEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNO1lBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyBuby1lbXB0eSBuby1pbnZhbGlkLXRoaXMgbWVtYmVyLWFjY2VzcyAqL1xuaW1wb3J0IHRlc3QgZnJvbSAnYXZhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCAqIGFzIHJpbXJhZiBmcm9tICdyaW1yYWYnO1xuaW1wb3J0IHsgQ29tbWFuZEFjY2VwdGFuY2VUZXN0IH0gZnJvbSAnZGVuYWxpJztcblxuZnVuY3Rpb24gbGlua0RlcGVuZGVuY3kocGtnRGlyOiBzdHJpbmcsIGRlcGVuZGVuY3lOYW1lOiBzdHJpbmcsIGRlcGVuZGVuY3lEaXI6IHN0cmluZykge1xuICBsZXQgZGVzdCA9IHBhdGguam9pbihwa2dEaXIsICdub2RlX21vZHVsZXMnLCBkZXBlbmRlbmN5TmFtZSk7XG4gIC8vIHVzZSBmcy1leHRyYVxuICBta2RpcnAuc3luYyhwYXRoLmRpcm5hbWUoZGVzdCkpO1xuICByaW1yYWYuc3luYyhkZXN0KTtcbiAgZnMuc3ltbGlua1N5bmMoZGVwZW5kZW5jeURpciwgZGVzdCk7XG59XG5cbnRlc3QoJ3NlcnZlciBjb21tYW5kID4gbGF1bmNoZXMgYSBzZXJ2ZXInLCBhc3luYyAoKSA9PiB7XG4gIGxldCBzZXJ2ZXIgPSBuZXcgQ29tbWFuZEFjY2VwdGFuY2VUZXN0KCdzZXJ2ZXIgLS1wb3J0IDMwMDEnLCB7IG5hbWU6ICdzZXJ2ZXItY29tbWFuZCcgfSk7XG5cbiAgcmV0dXJuIHNlcnZlci5zcGF3bih7XG4gICAgZmFpbE9uU3RkZXJyOiB0cnVlLFxuICAgIGVudjoge1xuICAgICAgREVCVUc6IG51bGxcbiAgICB9LFxuICAgIGNoZWNrT3V0cHV0KHN0ZG91dCkge1xuICAgICAgcmV0dXJuIHN0ZG91dC5pbmRleE9mKCdkdW1teUAwLjAuMCBzZXJ2ZXIgdXAnKSA+IC0xO1xuICAgIH1cbiAgfSk7XG59KTtcblxudGVzdCgnc2VydmVyIGNvbW1hbmQgPiBsYXVuY2hlcyBhIHNlcnZlciBiYXNlZCBvbiB0aGUgZHVtbXkgYXBwIGluIGFuIGFkZG9uJywgYXN5bmMgKCkgPT4ge1xuICBsZXQgZ2VuZXJhdGVBZGRvbiA9IG5ldyBDb21tYW5kQWNjZXB0YW5jZVRlc3QoJ2dlbmVyYXRlIGFkZG9uIG15LWRlbmFsaS1hZGRvbicsIHsgbmFtZTogJ3NlcnZlci1jb21tYW5kLWR1bW15LWFwcCcsIHBvcHVsYXRlV2l0aER1bW15OiBmYWxzZSB9KTtcbiAgYXdhaXQgZ2VuZXJhdGVBZGRvbi5ydW4oeyBmYWlsT25TdGRlcnI6IHRydWUgfSk7XG4gIGxpbmtEZXBlbmRlbmN5KHBhdGguam9pbihnZW5lcmF0ZUFkZG9uLmRpciwgJ215LWRlbmFsaS1hZGRvbicpLCAnZGVuYWxpJywgcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMnLCAnZGVuYWxpJykpO1xuICBsZXQgc2VydmVyID0gbmV3IENvbW1hbmRBY2NlcHRhbmNlVGVzdCgnc2VydmVyIC0tcG9ydCAzMDAyJywge1xuICAgIGRpcjogcGF0aC5qb2luKGdlbmVyYXRlQWRkb24uZGlyLCAnbXktZGVuYWxpLWFkZG9uJyksXG4gICAgcG9wdWxhdGVXaXRoRHVtbXk6IGZhbHNlXG4gIH0pO1xuXG4gIHJldHVybiBzZXJ2ZXIuc3Bhd24oe1xuICAgIGZhaWxPblN0ZGVycjogdHJ1ZSxcbiAgICBjaGVja091dHB1dChzdGRvdXQsIHN0ZGVycikge1xuICAgICAgcmV0dXJuIHN0ZG91dC5pbmRleE9mKCdkdW1teUAwLjAuMCBzZXJ2ZXIgdXAnKSA+IC0xO1xuICAgIH1cbiAgfSk7XG59KTtcbiJdfQ==