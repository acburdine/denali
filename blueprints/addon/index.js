"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Bluebird = require("bluebird");
const child_process_1 = require("child_process");
const lodash_1 = require("lodash");
const cmdExists = require("command-exists");
const denali_cli_1 = require("denali-cli");
const pkg = require("../../package.json");
const unwrap_1 = require("../../lib/utils/unwrap");
const run = Bluebird.promisify(child_process_1.exec);
const commandExists = Bluebird.promisify(cmdExists);
const ONE_KB = 1024;
const maxBuffer = 400 * ONE_KB;
/**
 * Creates a new addon project, initializes git and installs dependencies
 *
 * @package blueprints
 */
class AddonBlueprint extends denali_cli_1.Blueprint {
    locals(argv) {
        let name = argv.name;
        return {
            name,
            className: lodash_1.startCase(name).replace(/\s/g, ''),
            humanizedName: lodash_1.startCase(name),
            denaliVersion: pkg.version
        };
    }
    postInstall(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let name = argv.name;
            denali_cli_1.ui.info('');
            if (!argv.skipDeps) {
                let yarnExists = yield commandExists('yarn');
                if (yarnExists && !argv.useNpm) {
                    yield denali_cli_1.spinner.start('Installing dependencies with yarn');
                    yield run('yarn install --mutex network', { cwd: name, maxBuffer });
                }
                else {
                    yield denali_cli_1.spinner.start('Installing dependencies with npm');
                    yield run('npm install --loglevel=error', { cwd: name, maxBuffer });
                }
            }
            yield denali_cli_1.spinner.succeed('Dependencies installed');
            yield denali_cli_1.spinner.start('Setting up git repo');
            try {
                yield run('git init', { cwd: name, maxBuffer });
                yield run('git add .', { cwd: name, maxBuffer });
                yield run('git commit -am "Initial denali project scaffold"', { cwd: name, maxBuffer });
                yield denali_cli_1.spinner.succeed('Git repo initialized');
            }
            catch (e) {
                yield denali_cli_1.spinner.fail('Unable to initialize git repo:');
                denali_cli_1.ui.error(e.stack);
            }
            yield denali_cli_1.ui.info(`📦  ${name} addon created!`);
        });
    }
}
/* tslint:disable:completed-docs typedef */
AddonBlueprint.blueprintName = 'addon';
AddonBlueprint.description = 'Creates a new addon project, initializes git and installs dependencies';
AddonBlueprint.longDescription = unwrap_1.default `
    Usage: denali generate addon <name> [options]

    Scaffolds a new addon. Sets up the correct directory structure, initializes a git repo, and
    installs the necessary dependencies.

    Guides: http://denalijs.org/master/guides/utilities/addons/
  `;
AddonBlueprint.params = '<name>';
AddonBlueprint.flags = {
    'skip-deps': {
        description: 'Do not install dependencies on new addon',
        defaultValue: false,
        type: 'boolean'
    },
    'use-npm': {
        description: 'Use npm to install dependencies, even if yarn is available',
        defaultValue: false,
        type: 'boolean'
    }
};
exports.default = AddonBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hZGRvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsaURBQWtEO0FBQ2xELG1DQUVnQjtBQUNoQiw0Q0FBNEM7QUFDNUMsMkNBQW9EO0FBQ3BELDBDQUEwQztBQUMxQyxtREFBNEM7QUFFNUMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBMEMsb0JBQUksQ0FBQyxDQUFDO0FBQzlFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQWtCLFNBQVMsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQztBQUNwQixNQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBRS9COzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxzQkFBUztJQTZCNUMsTUFBTSxDQUFDLElBQVM7UUFDckIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDN0MsYUFBYSxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1lBQzlCLGFBQWEsRUFBRSxHQUFHLENBQUMsT0FBTztTQUMzQixDQUFDO0lBQ0osQ0FBQztJQUVZLFdBQVcsQ0FBQyxJQUFTOztZQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3JCLGVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLFVBQVUsR0FBWSxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEQsRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQy9CLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztvQkFDekQsTUFBTSxHQUFHLENBQUMsOEJBQThCLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RFLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO29CQUN4RCxNQUFNLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztZQUNILENBQUM7WUFDRCxNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDaEQsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDakQsTUFBTSxHQUFHLENBQUMsa0RBQWtELEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hGLE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNoRCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxNQUFNLG9CQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7Z0JBQ3JELGVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BCLENBQUM7WUFDRCxNQUFNLGVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBUSxJQUFLLGlCQUFpQixDQUFDLENBQUM7UUFDaEQsQ0FBQztLQUFBOztBQTlERCwyQ0FBMkM7QUFDN0IsNEJBQWEsR0FBRyxPQUFPLENBQUM7QUFDeEIsMEJBQVcsR0FBRyx3RUFBd0UsQ0FBQztBQUN2Riw4QkFBZSxHQUFHLGdCQUFNLENBQUE7Ozs7Ozs7R0FPckMsQ0FBQztBQUVZLHFCQUFNLEdBQUcsUUFBUSxDQUFDO0FBRWxCLG9CQUFLLEdBQUc7SUFDcEIsV0FBVyxFQUFFO1FBQ1gsV0FBVyxFQUFFLDBDQUEwQztRQUN2RCxZQUFZLEVBQUUsS0FBSztRQUNuQixJQUFJLEVBQU8sU0FBUztLQUNyQjtJQUNELFNBQVMsRUFBRTtRQUNULFdBQVcsRUFBRSw0REFBNEQ7UUFDekUsWUFBWSxFQUFFLEtBQUs7UUFDbkIsSUFBSSxFQUFPLFNBQVM7S0FDckI7Q0FDRixDQUFDO0FBM0JKLGlDQWtFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGV4ZWMsIEV4ZWNPcHRpb25zIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge1xuICBzdGFydENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIGNtZEV4aXN0cyBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgeyBCbHVlcHJpbnQsIHVpLCBzcGlubmVyIH0gZnJvbSAnZGVuYWxpLWNsaSc7XG5pbXBvcnQgKiBhcyBwa2cgZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5cbmNvbnN0IHJ1biA9IEJsdWViaXJkLnByb21pc2lmeTxbIHN0cmluZywgc3RyaW5nIF0sIHN0cmluZywgRXhlY09wdGlvbnM+KGV4ZWMpO1xuY29uc3QgY29tbWFuZEV4aXN0cyA9IEJsdWViaXJkLnByb21pc2lmeTxib29sZWFuLCBzdHJpbmc+KGNtZEV4aXN0cyk7XG5jb25zdCBPTkVfS0IgPSAxMDI0O1xuY29uc3QgbWF4QnVmZmVyID0gNDAwICogT05FX0tCO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYWRkb24gcHJvamVjdCwgaW5pdGlhbGl6ZXMgZ2l0IGFuZCBpbnN0YWxscyBkZXBlbmRlbmNpZXNcbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZG9uQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHB1YmxpYyBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdhZGRvbic7XG4gIHB1YmxpYyBzdGF0aWMgZGVzY3JpcHRpb24gPSAnQ3JlYXRlcyBhIG5ldyBhZGRvbiBwcm9qZWN0LCBpbml0aWFsaXplcyBnaXQgYW5kIGluc3RhbGxzIGRlcGVuZGVuY2llcyc7XG4gIHB1YmxpYyBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgYWRkb24gPG5hbWU+IFtvcHRpb25zXVxuXG4gICAgU2NhZmZvbGRzIGEgbmV3IGFkZG9uLiBTZXRzIHVwIHRoZSBjb3JyZWN0IGRpcmVjdG9yeSBzdHJ1Y3R1cmUsIGluaXRpYWxpemVzIGEgZ2l0IHJlcG8sIGFuZFxuICAgIGluc3RhbGxzIHRoZSBuZWNlc3NhcnkgZGVwZW5kZW5jaWVzLlxuXG4gICAgR3VpZGVzOiBodHRwOi8vZGVuYWxpanMub3JnL21hc3Rlci9ndWlkZXMvdXRpbGl0aWVzL2FkZG9ucy9cbiAgYDtcblxuICBwdWJsaWMgc3RhdGljIHBhcmFtcyA9ICc8bmFtZT4nO1xuXG4gIHB1YmxpYyBzdGF0aWMgZmxhZ3MgPSB7XG4gICAgJ3NraXAtZGVwcyc6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnRG8gbm90IGluc3RhbGwgZGVwZW5kZW5jaWVzIG9uIG5ldyBhZGRvbicsXG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgICd1c2UtbnBtJzoge1xuICAgICAgZGVzY3JpcHRpb246ICdVc2UgbnBtIHRvIGluc3RhbGwgZGVwZW5kZW5jaWVzLCBldmVuIGlmIHlhcm4gaXMgYXZhaWxhYmxlJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBwdWJsaWMgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiBzdGFydENhc2UobmFtZSkucmVwbGFjZSgvXFxzL2csICcnKSxcbiAgICAgIGh1bWFuaXplZE5hbWU6IHN0YXJ0Q2FzZShuYW1lKSxcbiAgICAgIGRlbmFsaVZlcnNpb246IHBrZy52ZXJzaW9uXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwb3N0SW5zdGFsbChhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICB1aS5pbmZvKCcnKTtcbiAgICBpZiAoIWFyZ3Yuc2tpcERlcHMpIHtcbiAgICAgIGxldCB5YXJuRXhpc3RzOiBib29sZWFuID0gYXdhaXQgY29tbWFuZEV4aXN0cygneWFybicpO1xuICAgICAgaWYgKHlhcm5FeGlzdHMgJiYgIWFyZ3YudXNlTnBtKSB7XG4gICAgICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ0luc3RhbGxpbmcgZGVwZW5kZW5jaWVzIHdpdGggeWFybicpO1xuICAgICAgICBhd2FpdCBydW4oJ3lhcm4gaW5zdGFsbCAtLW11dGV4IG5ldHdvcmsnLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnSW5zdGFsbGluZyBkZXBlbmRlbmNpZXMgd2l0aCBucG0nKTtcbiAgICAgICAgYXdhaXQgcnVuKCducG0gaW5zdGFsbCAtLWxvZ2xldmVsPWVycm9yJywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdEZXBlbmRlbmNpZXMgaW5zdGFsbGVkJyk7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnU2V0dGluZyB1cCBnaXQgcmVwbycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ2dpdCBpbml0JywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgIGF3YWl0IHJ1bignZ2l0IGFkZCAuJywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgIGF3YWl0IHJ1bignZ2l0IGNvbW1pdCAtYW0gXCJJbml0aWFsIGRlbmFsaSBwcm9qZWN0IHNjYWZmb2xkXCInLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdHaXQgcmVwbyBpbml0aWFsaXplZCcpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuZmFpbCgnVW5hYmxlIHRvIGluaXRpYWxpemUgZ2l0IHJlcG86Jyk7XG4gICAgICB1aS5lcnJvcihlLnN0YWNrKTtcbiAgICB9XG4gICAgYXdhaXQgdWkuaW5mbyhg7aC97bOmICAkeyBuYW1lIH0gYWRkb24gY3JlYXRlZCFgKTtcbiAgfVxuXG59XG4iXX0=