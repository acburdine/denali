"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Bluebird = require("bluebird");
const cmdExists = require("command-exists");
const denali_cli_1 = require("denali-cli");
const child_process_1 = require("child_process");
const commandExists = Bluebird.promisify(cmdExists);
/**
 * Install an addon in your app.
 *
 * @package commands
 */
class InstallCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.installAddon(argv.addonName);
            }
            catch (err) {
                yield this.fail(err.stack || err);
            }
        });
    }
    installAddon(addonName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Find the package info first to confirm it exists and is a denali addon
            let pkgManager = (yield commandExists('yarn')) ? 'yarn' : 'npm';
            yield denali_cli_1.spinner.start(`Searching for "${addonName}" addon ...`);
            let pkgInfo;
            let pkg;
            try {
                pkgInfo = child_process_1.execSync(`npm info ${addonName} --json`);
                pkg = JSON.parse(pkgInfo.toString());
            }
            catch (e) {
                this.fail('Lookup failed: ' + e.stack);
            }
            let isAddon = pkg.keywords.includes('denali-addon');
            if (!isAddon) {
                this.fail(`${addonName} is not a Denali addon.`);
            }
            yield denali_cli_1.spinner.succeed('Addon package found');
            // Install the package
            yield denali_cli_1.spinner.start(`Installing ${pkg.name}@${pkg.version}`);
            let installCommand = pkgManager === 'yarn' ? 'yarn add --mutex network' : 'npm install --save';
            try {
                child_process_1.execSync(`${installCommand} ${addonName}`, { stdio: 'pipe' });
            }
            catch (e) {
                this.fail('Install failed: ' + e.stack);
            }
            yield denali_cli_1.spinner.succeed('Addon package installed');
            // Run the installation blueprint
            let blueprints = denali_cli_1.Blueprint.findBlueprints(true);
            if (blueprints[addonName]) {
                denali_cli_1.ui.info('Running default blueprint for addon');
                let blueprint = new blueprints[addonName]();
                yield blueprint.generate({});
                yield denali_cli_1.spinner.succeed('Addon installed');
            }
        });
    }
    fail(msg) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield denali_cli_1.spinner.fail(`Install failed: ${msg}`);
            yield process.exit(1);
        });
    }
}
/* tslint:disable:completed-docs typedef */
InstallCommand.commandName = 'install';
InstallCommand.description = 'Install an addon in your app.';
InstallCommand.longDescription = denali_cli_1.unwrap `
    Installs the supplied addon in the project. Essentially a shortcut for \`npm install --save
    <addon>\`, with sanity checking that the project actually is a Denali addon.`;
InstallCommand.runsInApp = true;
InstallCommand.params = '<addonName>';
exports.default = InstallCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9pbnN0YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyw0Q0FBNEM7QUFDNUMsMkNBQXFFO0FBQ3JFLGlEQUFnRDtBQUVoRCxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFrQixTQUFTLENBQUMsQ0FBQztBQUVyRTs7OztHQUlHO0FBQ0gsb0JBQW9DLFNBQVEsb0JBQU87SUFhM0MsR0FBRyxDQUFDLElBQVM7O1lBQ2pCLElBQUksQ0FBQztnQkFDSCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNiLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDSCxDQUFDO0tBQUE7SUFFSyxZQUFZLENBQUMsU0FBaUI7O1lBQ2xDLHlFQUF5RTtZQUN6RSxJQUFJLFVBQVUsR0FBRyxDQUFBLE1BQU0sYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFHLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDOUQsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxrQkFBbUIsU0FBVSxhQUFhLENBQUMsQ0FBQztZQUNoRSxJQUFJLE9BQU8sQ0FBQztZQUNaLElBQUksR0FBRyxDQUFDO1lBQ1IsSUFBSSxDQUFDO2dCQUNILE9BQU8sR0FBRyx3QkFBRyxDQUFDLFlBQWEsU0FBVSxTQUFTLENBQUMsQ0FBQztnQkFDaEQsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdkMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUksU0FBVSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFDRCxNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFFN0Msc0JBQXNCO1lBQ3RCLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsY0FBZSxHQUFHLENBQUMsSUFBSyxJQUFLLEdBQUcsQ0FBQyxPQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLElBQUksY0FBYyxHQUFHLFVBQVUsS0FBSyxNQUFNLEdBQUcsMEJBQTBCLEdBQUcsb0JBQW9CLENBQUM7WUFDL0YsSUFBSSxDQUFDO2dCQUNILHdCQUFHLENBQUMsR0FBSSxjQUFlLElBQUssU0FBVSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBRWpELGlDQUFpQztZQUNqQyxJQUFJLFVBQVUsR0FBRyxzQkFBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixlQUFFLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7Z0JBQy9DLElBQUksU0FBUyxHQUFHLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0IsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzNDLENBQUM7UUFFSCxDQUFDO0tBQUE7SUFFYSxJQUFJLENBQUMsR0FBVzs7WUFDNUIsTUFBTSxvQkFBTyxDQUFDLElBQUksQ0FBQyxtQkFBb0IsR0FBSSxFQUFFLENBQUMsQ0FBQztZQUMvQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQztLQUFBOztBQTdERCwyQ0FBMkM7QUFDcEMsMEJBQVcsR0FBRyxTQUFTLENBQUM7QUFDeEIsMEJBQVcsR0FBRywrQkFBK0IsQ0FBQztBQUM5Qyw4QkFBZSxHQUFHLG1CQUFNLENBQUE7O2lGQUVnRCxDQUFDO0FBRXpFLHdCQUFTLEdBQUcsSUFBSSxDQUFDO0FBRWpCLHFCQUFNLEdBQUcsYUFBYSxDQUFDO0FBWGhDLGlDQWlFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAqIGFzIGNtZEV4aXN0cyBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgeyB1aSwgc3Bpbm5lciwgQ29tbWFuZCwgQmx1ZXByaW50LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB7IGV4ZWNTeW5jIGFzIHJ1biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBjb21tYW5kRXhpc3RzID0gQmx1ZWJpcmQucHJvbWlzaWZ5PGJvb2xlYW4sIHN0cmluZz4oY21kRXhpc3RzKTtcblxuLyoqXG4gKiBJbnN0YWxsIGFuIGFkZG9uIGluIHlvdXIgYXBwLlxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluc3RhbGxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAnaW5zdGFsbCc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdJbnN0YWxsIGFuIGFkZG9uIGluIHlvdXIgYXBwLic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgSW5zdGFsbHMgdGhlIHN1cHBsaWVkIGFkZG9uIGluIHRoZSBwcm9qZWN0LiBFc3NlbnRpYWxseSBhIHNob3J0Y3V0IGZvciBcXGBucG0gaW5zdGFsbCAtLXNhdmVcbiAgICA8YWRkb24+XFxgLCB3aXRoIHNhbml0eSBjaGVja2luZyB0aGF0IHRoZSBwcm9qZWN0IGFjdHVhbGx5IGlzIGEgRGVuYWxpIGFkZG9uLmA7XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICc8YWRkb25OYW1lPic7XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmluc3RhbGxBZGRvbihhcmd2LmFkZG9uTmFtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBhd2FpdCB0aGlzLmZhaWwoZXJyLnN0YWNrIHx8IGVycik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaW5zdGFsbEFkZG9uKGFkZG9uTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gRmluZCB0aGUgcGFja2FnZSBpbmZvIGZpcnN0IHRvIGNvbmZpcm0gaXQgZXhpc3RzIGFuZCBpcyBhIGRlbmFsaSBhZGRvblxuICAgIGxldCBwa2dNYW5hZ2VyID0gYXdhaXQgY29tbWFuZEV4aXN0cygneWFybicpID8gJ3lhcm4nIDogJ25wbSc7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydChgU2VhcmNoaW5nIGZvciBcIiR7IGFkZG9uTmFtZSB9XCIgYWRkb24gLi4uYCk7XG4gICAgbGV0IHBrZ0luZm87XG4gICAgbGV0IHBrZztcbiAgICB0cnkge1xuICAgICAgcGtnSW5mbyA9IHJ1bihgbnBtIGluZm8gJHsgYWRkb25OYW1lIH0gLS1qc29uYCk7XG4gICAgICBwa2cgPSBKU09OLnBhcnNlKHBrZ0luZm8udG9TdHJpbmcoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5mYWlsKCdMb29rdXAgZmFpbGVkOiAnICsgZS5zdGFjayk7XG4gICAgfVxuICAgIGxldCBpc0FkZG9uID0gcGtnLmtleXdvcmRzLmluY2x1ZGVzKCdkZW5hbGktYWRkb24nKTtcbiAgICBpZiAoIWlzQWRkb24pIHtcbiAgICAgIHRoaXMuZmFpbChgJHsgYWRkb25OYW1lIH0gaXMgbm90IGEgRGVuYWxpIGFkZG9uLmApO1xuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0FkZG9uIHBhY2thZ2UgZm91bmQnKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHBhY2thZ2VcbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KGBJbnN0YWxsaW5nICR7IHBrZy5uYW1lIH1AJHsgcGtnLnZlcnNpb24gfWApO1xuICAgIGxldCBpbnN0YWxsQ29tbWFuZCA9IHBrZ01hbmFnZXIgPT09ICd5YXJuJyA/ICd5YXJuIGFkZCAtLW11dGV4IG5ldHdvcmsnIDogJ25wbSBpbnN0YWxsIC0tc2F2ZSc7XG4gICAgdHJ5IHtcbiAgICAgIHJ1bihgJHsgaW5zdGFsbENvbW1hbmQgfSAkeyBhZGRvbk5hbWUgfWAsIHsgc3RkaW86ICdwaXBlJyB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmZhaWwoJ0luc3RhbGwgZmFpbGVkOiAnICsgZS5zdGFjayk7XG4gICAgfVxuICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZCgnQWRkb24gcGFja2FnZSBpbnN0YWxsZWQnKTtcblxuICAgIC8vIFJ1biB0aGUgaW5zdGFsbGF0aW9uIGJsdWVwcmludFxuICAgIGxldCBibHVlcHJpbnRzID0gQmx1ZXByaW50LmZpbmRCbHVlcHJpbnRzKHRydWUpO1xuICAgIGlmIChibHVlcHJpbnRzW2FkZG9uTmFtZV0pIHtcbiAgICAgIHVpLmluZm8oJ1J1bm5pbmcgZGVmYXVsdCBibHVlcHJpbnQgZm9yIGFkZG9uJyk7XG4gICAgICBsZXQgYmx1ZXByaW50ID0gbmV3IGJsdWVwcmludHNbYWRkb25OYW1lXSgpO1xuICAgICAgYXdhaXQgYmx1ZXByaW50LmdlbmVyYXRlKHt9KTtcbiAgICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZCgnQWRkb24gaW5zdGFsbGVkJyk7XG4gICAgfVxuXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZhaWwobXNnOiBzdHJpbmcpIHtcbiAgICBhd2FpdCBzcGlubmVyLmZhaWwoYEluc3RhbGwgZmFpbGVkOiAkeyBtc2cgfWApO1xuICAgIGF3YWl0IHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG59XG4iXX0=