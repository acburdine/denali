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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUM3QixnREFBeUM7QUFDekMscUNBQXFDO0FBQ3JDLDJDQUE4QztBQUM5QyxpREFBa0Q7QUFFbEQsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBMEMsb0JBQUksQ0FBQyxDQUFDO0FBRTlFOzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxvQkFBTztJQW1CM0MsR0FBRyxDQUFDLElBQVM7O1lBQ2pCLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hCLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixDQUFDO0tBQUE7SUFFZSxRQUFROztZQUN0QixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLEtBQUssQ0FBQztZQUNkLENBQUM7WUFDRCxNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7S0FBQTtJQUVlLEtBQUs7O1lBQ25CLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLG9CQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsQ0FBQztLQUFBO0lBRWUsT0FBTzs7WUFDckIsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RSxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLG9CQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsR0FBSSxHQUFHLENBQUMsSUFBSyxJQUFLLEdBQUcsQ0FBQyxPQUFRLGFBQWEsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FBQTs7QUF6REQsMkNBQTJDO0FBQ3BDLDBCQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcsdUNBQXVDLENBQUM7QUFDdEQsOEJBQWUsR0FBRyxnQkFBTSxDQUFBOzs4REFFNkIsQ0FBQztBQUV0RCx3QkFBUyxHQUFHLElBQUksQ0FBQztBQUVqQixvQkFBSyxHQUFHO0lBQ2IsU0FBUyxFQUFFO1FBQ1QsV0FBVyxFQUFFLG9DQUFvQztRQUNqRCxPQUFPLEVBQUUsS0FBSztRQUNkLElBQUksRUFBTyxTQUFTO0tBQ3JCO0NBQ0YsQ0FBQztBQWpCSixpQ0E2REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi9saWIvdXRpbHMvdW53cmFwJztcbmltcG9ydCAqIGFzIEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IHNwaW5uZXIsIENvbW1hbmQgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB7IGV4ZWMsIEV4ZWNPcHRpb25zIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IHJ1biA9IEJsdWViaXJkLnByb21pc2lmeTxbIHN0cmluZywgc3RyaW5nIF0sIHN0cmluZywgRXhlY09wdGlvbnM+KGV4ZWMpO1xuXG4vKipcbiAqIFB1Ymxpc2ggYW4gYWRkb24gdG8gdGhlIG5wbSByZWdpc3RyeS5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQdWJsaXNoQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ3B1Ymxpc2gnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnUHVibGlzaCBhbiBhZGRvbiB0byB0aGUgbnBtIHJlZ2lzdHJ5Lic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgUHVibGlzaGVzIGFuIGFkZG9uIHRvIHRoZSBucG0gcmVnaXN0cnkuIFJ1bnMgdGVzdHMgYnVpbGRzIHRoZVxuICAgIGFkZG9uLCBhbmQgcHVibGlzaGVzIHRoZSBkaXN0LyBkaXJlY3RvcnkgdG8gdGhlIHJlZ2lzdHJ5LmA7XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIHNraXBUZXN0czoge1xuICAgICAgZGVzY3JpcHRpb246ICdEbyBub3QgcnVuIHRlc3RzIGJlZm9yZSBwdWJsaXNoaW5nJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIGF3YWl0IHRoaXMuYnVpbGQoKTtcbiAgICBpZiAoIWFyZ3Yuc2tpcFRlc3RzKSB7XG4gICAgICBhd2FpdCB0aGlzLnJ1blRlc3RzKCk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMucHVibGlzaCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1blRlc3RzKCkge1xuICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ1J1bm5pbmcgdGVzdHMnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuKCducG0gdGVzdCcsIHt9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgc3Bpbm5lci5mYWlsKCdUZXN0cyBmYWlsZWQsIGhhbHRpbmcgcHVibGlzaCcpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZCgnVGVzdHMgcGFzc2VkJyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGQoKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnQnVpbGRpbmcnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuKCducG0gcnVuIGJ1aWxkJywge30pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ0J1aWxkIGZhaWxlZCwgaGFsdGluZyBwdWJsaXNoJyk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdBZGRvbiBidWlsdCcpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHB1Ymxpc2goKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnUHVibGlzaGluZycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ25wbSBwdWJsaXNoJywgeyBjd2Q6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZGlzdCcpIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ1B1Ymxpc2ggZmFpbGVkJyk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgbGV0IHBrZyA9IHJlcXVpcmUocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwYWNrYWdlLmpzb24nKSk7XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKGAkeyBwa2cubmFtZSB9ICR7IHBrZy52ZXJzaW9uIH0gcHVibGlzaGVkIWApO1xuICB9XG5cbn1cbiJdfQ==