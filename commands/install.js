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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJjb21tYW5kcy9pbnN0YWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdEQUF5QztBQUN6QyxxQ0FBcUM7QUFDckMsNENBQTRDO0FBQzVDLDJDQUE2RDtBQUM3RCxpREFBZ0Q7QUFFaEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBa0IsU0FBUyxDQUFDLENBQUM7QUFFckU7Ozs7R0FJRztBQUNILG9CQUFvQyxTQUFRLG9CQUFPO0lBYTNDLEdBQUcsQ0FBQyxJQUFTOztZQUNqQixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDYixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRUssWUFBWSxDQUFDLFNBQWlCOztZQUNsQyx5RUFBeUU7WUFDekUsSUFBSSxVQUFVLEdBQUcsQ0FBQSxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBRyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQzlELE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsa0JBQW1CLFNBQVUsYUFBYSxDQUFDLENBQUM7WUFDaEUsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJLEdBQUcsQ0FBQztZQUNSLElBQUksQ0FBQztnQkFDSCxPQUFPLEdBQUcsd0JBQUcsQ0FBQyxZQUFhLFNBQVUsU0FBUyxDQUFDLENBQUM7Z0JBQ2hELEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFJLFNBQVUseUJBQXlCLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRTdDLHNCQUFzQjtZQUN0QixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLGNBQWUsR0FBRyxDQUFDLElBQUssSUFBSyxHQUFHLENBQUMsT0FBUSxFQUFFLENBQUMsQ0FBQztZQUNqRSxJQUFJLGNBQWMsR0FBRyxVQUFVLEtBQUssTUFBTSxHQUFHLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDO1lBQy9GLElBQUksQ0FBQztnQkFDSCx3QkFBRyxDQUFDLEdBQUksY0FBZSxJQUFLLFNBQVUsRUFBRSxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUVqRCxpQ0FBaUM7WUFDakMsSUFBSSxVQUFVLEdBQUcsc0JBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsZUFBRSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzQyxDQUFDO1FBRUgsQ0FBQztLQUFBO0lBRWEsSUFBSSxDQUFDLEdBQVc7O1lBQzVCLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW9CLEdBQUksRUFBRSxDQUFDLENBQUM7WUFDL0MsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7S0FBQTs7QUE3REQsMkNBQTJDO0FBQ3BDLDBCQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLDBCQUFXLEdBQUcsK0JBQStCLENBQUM7QUFDOUMsOEJBQWUsR0FBRyxnQkFBTSxDQUFBOztpRkFFZ0QsQ0FBQztBQUV6RSx3QkFBUyxHQUFHLElBQUksQ0FBQztBQUVqQixxQkFBTSxHQUFHLGFBQWEsQ0FBQztBQVhoQyxpQ0FpRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdW53cmFwIGZyb20gJy4uL2xpYi91dGlscy91bndyYXAnO1xuaW1wb3J0ICogYXMgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0ICogYXMgY21kRXhpc3RzIGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcbmltcG9ydCB7IHVpLCBzcGlubmVyLCBDb21tYW5kLCBCbHVlcHJpbnQgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCB7IGV4ZWNTeW5jIGFzIHJ1biB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBjb21tYW5kRXhpc3RzID0gQmx1ZWJpcmQucHJvbWlzaWZ5PGJvb2xlYW4sIHN0cmluZz4oY21kRXhpc3RzKTtcblxuLyoqXG4gKiBJbnN0YWxsIGFuIGFkZG9uIGluIHlvdXIgYXBwLlxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluc3RhbGxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAnaW5zdGFsbCc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdJbnN0YWxsIGFuIGFkZG9uIGluIHlvdXIgYXBwLic7XG4gIHN0YXRpYyBsb25nRGVzY3JpcHRpb24gPSB1bndyYXBgXG4gICAgSW5zdGFsbHMgdGhlIHN1cHBsaWVkIGFkZG9uIGluIHRoZSBwcm9qZWN0LiBFc3NlbnRpYWxseSBhIHNob3J0Y3V0IGZvciBcXGBucG0gaW5zdGFsbCAtLXNhdmVcbiAgICA8YWRkb24+XFxgLCB3aXRoIHNhbml0eSBjaGVja2luZyB0aGF0IHRoZSBwcm9qZWN0IGFjdHVhbGx5IGlzIGEgRGVuYWxpIGFkZG9uLmA7XG5cbiAgc3RhdGljIHJ1bnNJbkFwcCA9IHRydWU7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICc8YWRkb25OYW1lPic7XG5cbiAgYXN5bmMgcnVuKGFyZ3Y6IGFueSkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmluc3RhbGxBZGRvbihhcmd2LmFkZG9uTmFtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBhd2FpdCB0aGlzLmZhaWwoZXJyLnN0YWNrIHx8IGVycik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaW5zdGFsbEFkZG9uKGFkZG9uTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gRmluZCB0aGUgcGFja2FnZSBpbmZvIGZpcnN0IHRvIGNvbmZpcm0gaXQgZXhpc3RzIGFuZCBpcyBhIGRlbmFsaSBhZGRvblxuICAgIGxldCBwa2dNYW5hZ2VyID0gYXdhaXQgY29tbWFuZEV4aXN0cygneWFybicpID8gJ3lhcm4nIDogJ25wbSc7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydChgU2VhcmNoaW5nIGZvciBcIiR7IGFkZG9uTmFtZSB9XCIgYWRkb24gLi4uYCk7XG4gICAgbGV0IHBrZ0luZm87XG4gICAgbGV0IHBrZztcbiAgICB0cnkge1xuICAgICAgcGtnSW5mbyA9IHJ1bihgbnBtIGluZm8gJHsgYWRkb25OYW1lIH0gLS1qc29uYCk7XG4gICAgICBwa2cgPSBKU09OLnBhcnNlKHBrZ0luZm8udG9TdHJpbmcoKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5mYWlsKCdMb29rdXAgZmFpbGVkOiAnICsgZS5zdGFjayk7XG4gICAgfVxuICAgIGxldCBpc0FkZG9uID0gcGtnLmtleXdvcmRzLmluY2x1ZGVzKCdkZW5hbGktYWRkb24nKTtcbiAgICBpZiAoIWlzQWRkb24pIHtcbiAgICAgIHRoaXMuZmFpbChgJHsgYWRkb25OYW1lIH0gaXMgbm90IGEgRGVuYWxpIGFkZG9uLmApO1xuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0FkZG9uIHBhY2thZ2UgZm91bmQnKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHBhY2thZ2VcbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KGBJbnN0YWxsaW5nICR7IHBrZy5uYW1lIH1AJHsgcGtnLnZlcnNpb24gfWApO1xuICAgIGxldCBpbnN0YWxsQ29tbWFuZCA9IHBrZ01hbmFnZXIgPT09ICd5YXJuJyA/ICd5YXJuIGFkZCAtLW11dGV4IG5ldHdvcmsnIDogJ25wbSBpbnN0YWxsIC0tc2F2ZSc7XG4gICAgdHJ5IHtcbiAgICAgIHJ1bihgJHsgaW5zdGFsbENvbW1hbmQgfSAkeyBhZGRvbk5hbWUgfWApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuZmFpbCgnSW5zdGFsbCBmYWlsZWQ6ICcgKyBlLnN0YWNrKTtcbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdBZGRvbiBwYWNrYWdlIGluc3RhbGxlZCcpO1xuXG4gICAgLy8gUnVuIHRoZSBpbnN0YWxsYXRpb24gYmx1ZXByaW50XG4gICAgbGV0IGJsdWVwcmludHMgPSBCbHVlcHJpbnQuZmluZEJsdWVwcmludHModHJ1ZSk7XG4gICAgaWYgKGJsdWVwcmludHNbYWRkb25OYW1lXSkge1xuICAgICAgdWkuaW5mbygnUnVubmluZyBkZWZhdWx0IGJsdWVwcmludCBmb3IgYWRkb24nKTtcbiAgICAgIGxldCBibHVlcHJpbnQgPSBuZXcgYmx1ZXByaW50c1thZGRvbk5hbWVdKCk7XG4gICAgICBhd2FpdCBibHVlcHJpbnQuZ2VuZXJhdGUoe30pO1xuICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdBZGRvbiBpbnN0YWxsZWQnKTtcbiAgICB9XG5cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmFpbChtc2c6IHN0cmluZykge1xuICAgIGF3YWl0IHNwaW5uZXIuZmFpbChgSW5zdGFsbCBmYWlsZWQ6ICR7IG1zZyB9YCk7XG4gICAgYXdhaXQgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbn1cbiJdfQ==