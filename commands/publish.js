"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const unwrap_1 = require("../lib/utils/unwrap");
const Bluebird = require("bluebird");
const denali_cli_1 = require("denali-cli");
const child_process_1 = require("child_process");
const run = Bluebird.promisify(child_process_1.exec);
/**
 * Publish an addon to the npm registry.
 *
 * @package commands
 */
class PublishCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.build();
            if (!argv.skipTests) {
                yield this.runTests();
            }
            yield this.publish();
        });
    }
    runTests() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.start('Running tests');
            try {
                yield run('npm test', {});
            }
            catch (error) {
                yield denali_cli_1.spinner.fail('Tests failed, halting publish');
                throw error;
            }
            yield denali_cli_1.spinner.succeed('Tests passed');
        });
    }
    build() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.start('Building');
            try {
                yield run('npm run build', {});
            }
            catch (error) {
                yield denali_cli_1.spinner.fail('Build failed, halting publish');
                throw error;
            }
            yield denali_cli_1.spinner.succeed('Addon built');
        });
    }
    publish() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.start('Publishing');
            try {
                yield run('npm publish', { cwd: path.join(process.cwd(), 'dist') });
            }
            catch (error) {
                yield denali_cli_1.spinner.fail('Publish failed');
                throw error;
            }
            let pkg = require(path.join(process.cwd(), 'package.json'));
            yield denali_cli_1.spinner.succeed(`${pkg.name} ${pkg.version} published!`);
        });
    }
}
/* tslint:disable:completed-docs typedef */
PublishCommand.commandName = 'publish';
PublishCommand.description = 'Publish an addon to the npm registry.';
PublishCommand.longDescription = unwrap_1.default `
    Publishes an addon to the npm registry. Runs tests builds the
    addon, and publishes the dist/ directory to the registry.`;
PublishCommand.runsInApp = true;
PublishCommand.flags = {
    skipTests: {
        description: 'Do not run tests before publishing',
        default: false,
        type: 'boolean'
    }
};
exports.default = PublishCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUM3QixnREFBeUM7QUFDekMscUNBQXFDO0FBQ3JDLDJDQUEyRDtBQUMzRCxpREFBa0Q7QUFFbEQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBMEMsb0JBQUksQ0FBQyxDQUFDO0FBRTlFOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxvQkFBTztJQW1CcEMsR0FBRyxDQUFDLElBQVM7O1lBQ3hCLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hCLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDO0tBQUE7SUFFZSxRQUFROztZQUN0QixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7S0FBQTtJQUVlLEtBQUs7O1lBQ25CLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLG9CQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsQ0FBQztLQUFBO0lBRWUsT0FBTzs7WUFDckIsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLG9CQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsR0FBSSxHQUFHLENBQUMsSUFBSyxJQUFLLEdBQUcsQ0FBQyxPQUFRLGFBQWEsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FBQTs7QUF6REQsMkNBQTJDO0FBQzdCLDBCQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcsdUNBQXVDLENBQUM7QUFDdEQsOEJBQWUsR0FBRyxnQkFBTSxDQUFBOzs4REFFc0IsQ0FBQztBQUUvQyx3QkFBUyxHQUFHLElBQUksQ0FBQztBQUVqQixvQkFBSyxHQUFHO0lBQ3BCLFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSxvQ0FBb0M7UUFDakQsT0FBTyxFQUFFLEtBQUs7UUFDZCxJQUFJLEVBQU8sU0FBUztLQUNyQjtDQUNGLENBQUM7QUFqQkosaUNBNkRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5pbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyB1aSwgc3Bpbm5lciwgQ29tbWFuZCwgUHJvamVjdCB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHsgZXhlYywgRXhlY09wdGlvbnMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgcnVuID0gQmx1ZWJpcmQucHJvbWlzaWZ5PFsgc3RyaW5nLCBzdHJpbmcgXSwgc3RyaW5nLCBFeGVjT3B0aW9ucz4oZXhlYyk7XG5cbi8qKlxuICogUHVibGlzaCBhbiBhZGRvbiB0byB0aGUgbnBtIHJlZ2lzdHJ5LlxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1Ymxpc2hDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBwdWJsaWMgc3RhdGljIGNvbW1hbmROYW1lID0gJ3B1Ymxpc2gnO1xuICBwdWJsaWMgc3RhdGljIGRlc2NyaXB0aW9uID0gJ1B1Ymxpc2ggYW4gYWRkb24gdG8gdGhlIG5wbSByZWdpc3RyeS4nO1xuICBwdWJsaWMgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBQdWJsaXNoZXMgYW4gYWRkb24gdG8gdGhlIG5wbSByZWdpc3RyeS4gUnVucyB0ZXN0cyBidWlsZHMgdGhlXG4gICAgYWRkb24sIGFuZCBwdWJsaXNoZXMgdGhlIGRpc3QvIGRpcmVjdG9yeSB0byB0aGUgcmVnaXN0cnkuYDtcblxuICBwdWJsaWMgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgcHVibGljIHN0YXRpYyBmbGFncyA9IHtcbiAgICBza2lwVGVzdHM6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRG8gbm90IHJ1biB0ZXN0cyBiZWZvcmUgcHVibGlzaGluZycsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIHB1YmxpYyBhc3luYyBydW4oYXJndjogYW55KSB7XG4gICAgYXdhaXQgdGhpcy5idWlsZCgpO1xuICAgIGlmICghYXJndi5za2lwVGVzdHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucnVuVGVzdHMoKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5wdWJsaXNoKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgcnVuVGVzdHMoKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnUnVubmluZyB0ZXN0cycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ25wbSB0ZXN0Jywge30pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ1Rlc3RzIGZhaWxlZCwgaGFsdGluZyBwdWJsaXNoJyk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdUZXN0cyBwYXNzZWQnKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZCgpIHtcbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdCdWlsZGluZycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ25wbSBydW4gYnVpbGQnLCB7fSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuZmFpbCgnQnVpbGQgZmFpbGVkLCBoYWx0aW5nIHB1Ymxpc2gnKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0FkZG9uIGJ1aWx0Jyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgcHVibGlzaCgpIHtcbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdQdWJsaXNoaW5nJyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bignbnBtIHB1Ymxpc2gnLCB7IGN3ZDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdkaXN0JykgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuZmFpbCgnUHVibGlzaCBmYWlsZWQnKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBsZXQgcGtnID0gcmVxdWlyZShwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3BhY2thZ2UuanNvbicpKTtcbiAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoYCR7IHBrZy5uYW1lIH0gJHsgcGtnLnZlcnNpb24gfSBwdWJsaXNoZWQhYCk7XG4gIH1cblxufVxuIl19