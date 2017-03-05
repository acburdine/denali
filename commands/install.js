"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const unwrap_1 = require("../lib/utils/unwrap");
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
                child_process_1.execSync(`${installCommand} ${addonName}`);
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
InstallCommand.longDescription = unwrap_1.default `
    Installs the supplied addon in the project. Essentially a shortcut for \`npm install --save
    <addon>\`, with sanity checking that the project actually is a Denali addon.`;
InstallCommand.runsInApp = true;
InstallCommand.params = '<addonName>';
exports.default = InstallCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9pbnN0YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdEQUF5QztBQUN6QyxxQ0FBcUM7QUFDckMsNENBQTRDO0FBQzVDLDJDQUFzRTtBQUN0RSxpREFBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBa0IsU0FBUyxDQUFDLENBQUM7QUFFckU7Ozs7R0FJRztBQUNILG9CQUFvQyxTQUFRLG9CQUFPO0lBYXBDLEdBQUcsQ0FBQyxJQUFTOztZQUN4QixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRVksWUFBWSxDQUFDLFNBQWlCOztZQUN6Qyx5RUFBeUU7WUFDekUsSUFBSSxVQUFVLEdBQUcsQ0FBQSxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBRyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzlELE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsa0JBQW1CLFNBQVUsYUFBYSxDQUFDLENBQUM7WUFDaEUsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJLEdBQUcsQ0FBQztZQUNSLElBQUksQ0FBQztnQkFDSCxPQUFPLEdBQUcsd0JBQUcsQ0FBQyxZQUFhLFNBQVUsU0FBUyxDQUFDLENBQUM7Z0JBQ2hELEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFJLFNBQVUseUJBQXlCLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRTdDLHNCQUFzQjtZQUN0QixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLGNBQWUsR0FBRyxDQUFDLElBQUssSUFBSyxHQUFHLENBQUMsT0FBUSxFQUFFLENBQUMsQ0FBQztZQUNqRSxJQUFJLGNBQWMsR0FBRyxVQUFVLEtBQUssTUFBTSxHQUFHLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDO1lBQy9GLElBQUksQ0FBQztnQkFDSCx3QkFBRyxDQUFDLEdBQUksY0FBZSxJQUFLLFNBQVUsRUFBRSxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUVqRCxpQ0FBaUM7WUFDakMsSUFBSSxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsZUFBRSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBRUgsQ0FBQztLQUFBO0lBRWEsSUFBSSxDQUFDLEdBQVc7O1lBQzVCLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW9CLEdBQUksRUFBRSxDQUFDLENBQUM7WUFDL0MsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7S0FBQTs7QUE3REQsMkNBQTJDO0FBQzdCLDBCQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcsK0JBQStCLENBQUM7QUFDOUMsOEJBQWUsR0FBRyxnQkFBTSxDQUFBOztpRkFFeUMsQ0FBQztBQUVsRSx3QkFBUyxHQUFHLElBQUksQ0FBQztBQUVqQixxQkFBTSxHQUFHLGFBQWEsQ0FBQztBQVh2QyxpQ0FpRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdW53cmFwIGZyb20gJy4uL2xpYi91dGlscy91bndyYXAnO1xuaW1wb3J0ICogYXMgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0ICogYXMgY21kRXhpc3RzIGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcbmltcG9ydCB7IHVpLCBzcGlubmVyLCBDb21tYW5kLCBQcm9qZWN0LCBCbHVlcHJpbnQgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB7IGV4ZWNTeW5jIGFzIHJ1biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBjb21tYW5kRXhpc3RzID0gQmx1ZWJpcmQucHJvbWlzaWZ5PGJvb2xlYW4sIHN0cmluZz4oY21kRXhpc3RzKTtcblxuLyoqXG4gKiBJbnN0YWxsIGFuIGFkZG9uIGluIHlvdXIgYXBwLlxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluc3RhbGxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBwdWJsaWMgc3RhdGljIGNvbW1hbmROYW1lID0gJ2luc3RhbGwnO1xuICBwdWJsaWMgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0luc3RhbGwgYW4gYWRkb24gaW4geW91ciBhcHAuJztcbiAgcHVibGljIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgSW5zdGFsbHMgdGhlIHN1cHBsaWVkIGFkZG9uIGluIHRoZSBwcm9qZWN0LiBFc3NlbnRpYWxseSBhIHNob3J0Y3V0IGZvciBcXGBucG0gaW5zdGFsbCAtLXNhdmVcbiAgICA8YWRkb24+XFxgLCB3aXRoIHNhbml0eSBjaGVja2luZyB0aGF0IHRoZSBwcm9qZWN0IGFjdHVhbGx5IGlzIGEgRGVuYWxpIGFkZG9uLmA7XG5cbiAgcHVibGljIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIHB1YmxpYyBzdGF0aWMgcGFyYW1zID0gJzxhZGRvbk5hbWU+JztcblxuICBwdWJsaWMgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmluc3RhbGxBZGRvbihhcmd2LmFkZG9uTmFtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBhd2FpdCB0aGlzLmZhaWwoZXJyLnN0YWNrIHx8IGVycik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGluc3RhbGxBZGRvbihhZGRvbk5hbWU6IHN0cmluZykge1xuICAgIC8vIEZpbmQgdGhlIHBhY2thZ2UgaW5mbyBmaXJzdCB0byBjb25maXJtIGl0IGV4aXN0cyBhbmQgaXMgYSBkZW5hbGkgYWRkb25cbiAgICBsZXQgcGtnTWFuYWdlciA9IGF3YWl0IGNvbW1hbmRFeGlzdHMoJ3lhcm4nKSA/ICd5YXJuJyA6ICducG0nO1xuICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoYFNlYXJjaGluZyBmb3IgXCIkeyBhZGRvbk5hbWUgfVwiIGFkZG9uIC4uLmApO1xuICAgIGxldCBwa2dJbmZvO1xuICAgIGxldCBwa2c7XG4gICAgdHJ5IHtcbiAgICAgIHBrZ0luZm8gPSBydW4oYG5wbSBpbmZvICR7IGFkZG9uTmFtZSB9IC0tanNvbmApO1xuICAgICAgcGtnID0gSlNPTi5wYXJzZShwa2dJbmZvLnRvU3RyaW5nKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZmFpbCgnTG9va3VwIGZhaWxlZDogJyArIGUuc3RhY2spO1xuICAgIH1cbiAgICBsZXQgaXNBZGRvbiA9IHBrZy5rZXl3b3Jkcy5pbmNsdWRlcygnZGVuYWxpLWFkZG9uJyk7XG4gICAgaWYgKCFpc0FkZG9uKSB7XG4gICAgICB0aGlzLmZhaWwoYCR7IGFkZG9uTmFtZSB9IGlzIG5vdCBhIERlbmFsaSBhZGRvbi5gKTtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdBZGRvbiBwYWNrYWdlIGZvdW5kJyk7XG5cbiAgICAvLyBJbnN0YWxsIHRoZSBwYWNrYWdlXG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydChgSW5zdGFsbGluZyAkeyBwa2cubmFtZSB9QCR7IHBrZy52ZXJzaW9uIH1gKTtcbiAgICBsZXQgaW5zdGFsbENvbW1hbmQgPSBwa2dNYW5hZ2VyID09PSAneWFybicgPyAneWFybiBhZGQgLS1tdXRleCBuZXR3b3JrJyA6ICducG0gaW5zdGFsbCAtLXNhdmUnO1xuICAgIHRyeSB7XG4gICAgICBydW4oYCR7IGluc3RhbGxDb21tYW5kIH0gJHsgYWRkb25OYW1lIH1gKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLmZhaWwoJ0luc3RhbGwgZmFpbGVkOiAnICsgZS5zdGFjayk7XG4gICAgfVxuICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZCgnQWRkb24gcGFja2FnZSBpbnN0YWxsZWQnKTtcblxuICAgIC8vIFJ1biB0aGUgaW5zdGFsbGF0aW9uIGJsdWVwcmludFxuICAgIGxldCBibHVlcHJpbnRzID0gQmx1ZXByaW50LmZpbmRCbHVlcHJpbnRzKHRydWUpO1xuICAgIGlmIChibHVlcHJpbnRzW2FkZG9uTmFtZV0pIHtcbiAgICAgIHVpLmluZm8oJ1J1bm5pbmcgZGVmYXVsdCBibHVlcHJpbnQgZm9yIGFkZG9uJyk7XG4gICAgICBsZXQgYmx1ZXByaW50ID0gbmV3IGJsdWVwcmludHNbYWRkb25OYW1lXSgpO1xuICAgICAgYXdhaXQgYmx1ZXByaW50LmdlbmVyYXRlKHt9KTtcbiAgICAgIGF3YWl0IHNwaW5uZXIuc3VjY2VlZCgnQWRkb24gaW5zdGFsbGVkJyk7XG4gICAgfVxuXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZhaWwobXNnOiBzdHJpbmcpIHtcbiAgICBhd2FpdCBzcGlubmVyLmZhaWwoYEluc3RhbGwgZmFpbGVkOiAkeyBtc2cgfWApO1xuICAgIGF3YWl0IHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG59XG4iXX0=