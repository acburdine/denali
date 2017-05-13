"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
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
PublishCommand.longDescription = denali_cli_1.unwrap `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUE2QjtBQUM3QixxQ0FBcUM7QUFDckMsMkNBQXNEO0FBQ3RELGlEQUFrRDtBQUVsRCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUEwQyxvQkFBSSxDQUFDLENBQUM7QUFFOUU7Ozs7R0FJRztBQUNILG9CQUFvQyxTQUFRLG9CQUFPO0lBbUIzQyxHQUFHLENBQUMsSUFBUzs7WUFDakIsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDeEIsQ0FBQztZQUNELE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLENBQUM7S0FBQTtJQUVlLFFBQVE7O1lBQ3RCLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1QixDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLG9CQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUFBO0lBRWUsS0FBSzs7WUFDbkIsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2QyxDQUFDO0tBQUE7SUFFZSxPQUFPOztZQUNyQixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDckMsTUFBTSxLQUFLLENBQUM7WUFDZCxDQUFDO1lBQ0QsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxHQUFJLEdBQUcsQ0FBQyxJQUFLLElBQUssR0FBRyxDQUFDLE9BQVEsYUFBYSxDQUFDLENBQUM7UUFDckUsQ0FBQztLQUFBOztBQXpERCwyQ0FBMkM7QUFDcEMsMEJBQVcsR0FBRyxTQUFTLENBQUM7QUFDeEIsMEJBQVcsR0FBRyx1Q0FBdUMsQ0FBQztBQUN0RCw4QkFBZSxHQUFHLG1CQUFNLENBQUE7OzhEQUU2QixDQUFDO0FBRXRELHdCQUFTLEdBQUcsSUFBSSxDQUFDO0FBRWpCLG9CQUFLLEdBQUc7SUFDYixTQUFTLEVBQUU7UUFDVCxXQUFXLEVBQUUsb0NBQW9DO1FBQ2pELE9BQU8sRUFBRSxLQUFLO1FBQ2QsSUFBSSxFQUFPLFNBQVM7S0FDckI7Q0FDRixDQUFDO0FBakJKLGlDQTZEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyBzcGlubmVyLCBDb21tYW5kLCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB7IGV4ZWMsIEV4ZWNPcHRpb25zIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IHJ1biA9IEJsdWViaXJkLnByb21pc2lmeTxbIHN0cmluZywgc3RyaW5nIF0sIHN0cmluZywgRXhlY09wdGlvbnM+KGV4ZWMpO1xuXG4vKipcbiAqIFB1Ymxpc2ggYW4gYWRkb24gdG8gdGhlIG5wbSByZWdpc3RyeS5cbiAqXG4gKiBAcGFja2FnZSBjb21tYW5kc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQdWJsaXNoQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXG4gIC8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIHR5cGVkZWYgKi9cbiAgc3RhdGljIGNvbW1hbmROYW1lID0gJ3B1Ymxpc2gnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnUHVibGlzaCBhbiBhZGRvbiB0byB0aGUgbnBtIHJlZ2lzdHJ5Lic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgUHVibGlzaGVzIGFuIGFkZG9uIHRvIHRoZSBucG0gcmVnaXN0cnkuIFJ1bnMgdGVzdHMgYnVpbGRzIHRoZVxuICAgIGFkZG9uLCBhbmQgcHVibGlzaGVzIHRoZSBkaXN0LyBkaXJlY3RvcnkgdG8gdGhlIHJlZ2lzdHJ5LmA7XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIHNraXBUZXN0czoge1xuICAgICAgZGVzY3JpcHRpb246ICdEbyBub3QgcnVuIHRlc3RzIGJlZm9yZSBwdWJsaXNoaW5nJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9XG4gIH07XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIGF3YWl0IHRoaXMuYnVpbGQoKTtcbiAgICBpZiAoIWFyZ3Yuc2tpcFRlc3RzKSB7XG4gICAgICBhd2FpdCB0aGlzLnJ1blRlc3RzKCk7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMucHVibGlzaCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1blRlc3RzKCkge1xuICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ1J1bm5pbmcgdGVzdHMnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuKCducG0gdGVzdCcsIHt9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQgc3Bpbm5lci5mYWlsKCdUZXN0cyBmYWlsZWQsIGhhbHRpbmcgcHVibGlzaCcpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZCgnVGVzdHMgcGFzc2VkJyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGQoKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnQnVpbGRpbmcnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuKCducG0gcnVuIGJ1aWxkJywge30pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ0J1aWxkIGZhaWxlZCwgaGFsdGluZyBwdWJsaXNoJyk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdBZGRvbiBidWlsdCcpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHB1Ymxpc2goKSB7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnUHVibGlzaGluZycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ25wbSBwdWJsaXNoJywgeyBjd2Q6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZGlzdCcpIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoJ1B1Ymxpc2ggZmFpbGVkJyk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgbGV0IHBrZyA9IHJlcXVpcmUocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwYWNrYWdlLmpzb24nKSk7XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKGAkeyBwa2cubmFtZSB9ICR7IHBrZy52ZXJzaW9uIH0gcHVibGlzaGVkIWApO1xuICB9XG5cbn1cbiJdfQ==