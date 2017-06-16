"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const Bluebird = require("bluebird");
const child_process_1 = require("child_process");
const cmdExists = require("command-exists");
const denali_cli_1 = require("denali-cli");
const pkg = require("../../package.json");
const unwrap_1 = require("../../lib/utils/unwrap");
const run = Bluebird.promisify(child_process_1.exec);
const commandExists = Bluebird.promisify(cmdExists);
const ONE_KB = 1024;
const maxBuffer = 400 * ONE_KB;
/**
 * Creates a new app, initializes git and installs dependencies.
 *
 * @package blueprints
 */
class AppBlueprint extends denali_cli_1.Blueprint {
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
            if (!argv.skipDeps) {
                try {
                    let yarnExists = yield commandExists('yarn');
                    if (yarnExists && !argv.useNpm) {
                        yield denali_cli_1.spinner.start('Installing dependencies with yarn');
                        yield run('yarn install --mutex network', { cwd: name, maxBuffer });
                    }
                    else {
                        yield denali_cli_1.spinner.start('Installing dependencies with npm');
                        yield run('npm install --loglevel=error', { cwd: name, maxBuffer });
                    }
                    yield denali_cli_1.spinner.succeed('Dependencies installed');
                }
                catch (error) {
                    denali_cli_1.ui.error('Denali encountered a problem while trying to install the dependencies for your new app:');
                    denali_cli_1.ui.error(error.stack || error.message || error);
                }
            }
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
            denali_cli_1.ui.info(`📦  ${name} created!`);
            denali_cli_1.ui.info('');
            denali_cli_1.ui.info('To launch your application, just run:');
            denali_cli_1.ui.info('');
            denali_cli_1.ui.info(`  $ cd ${name} && denali server`);
            denali_cli_1.ui.info('');
        });
    }
}
/* tslint:disable:completed-docs typedef */
AppBlueprint.blueprintName = 'app';
AppBlueprint.description = 'Creates a new app, initializes git and installs dependencies';
AppBlueprint.longDescription = unwrap_1.default `
    Usage: denali generate app <name> [options]

    Scaffolds a new app. Sets up the correct directory structure, initializes a git repo, and
    installs the necessary dependencies.

    Guides: http://denalijs.org/master/guides/overview/app-structure/
  `;
AppBlueprint.params = '<name>';
AppBlueprint.flags = {
    skipDeps: {
        description: 'Do not install dependencies on new app',
        defaultValue: false,
        type: 'boolean'
    },
    useNpm: {
        description: 'Use npm to install dependencies, even if yarn is available',
        defaultValue: false,
        type: 'boolean'
    }
};
exports.default = AppBlueprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hcHAvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBRWdCO0FBQ2hCLHFDQUFxQztBQUNyQyxpREFBa0Q7QUFDbEQsNENBQTRDO0FBQzVDLDJDQUFvRDtBQUNwRCwwQ0FBMkM7QUFDM0MsbURBQTRDO0FBRTVDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQTBDLG9CQUFJLENBQUMsQ0FBQztBQUM5RSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFrQixTQUFTLENBQUMsQ0FBQztBQUNyRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDcEIsTUFBTSxTQUFTLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUUvQjs7OztHQUlHO0FBQ0gsa0JBQWtDLFNBQVEsc0JBQVM7SUE2QmpELE1BQU0sQ0FBQyxJQUFTO1FBQ2QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixNQUFNLENBQUM7WUFDTCxJQUFJO1lBQ0osU0FBUyxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDN0MsYUFBYSxFQUFFLGtCQUFTLENBQUMsSUFBSSxDQUFDO1lBQzlCLGFBQWEsRUFBUSxHQUFJLENBQUMsT0FBTztTQUNsQyxDQUFDO0lBQ0osQ0FBQztJQUVLLFdBQVcsQ0FBQyxJQUFTOztZQUN6QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQztvQkFDSCxJQUFJLFVBQVUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFD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IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyBleGVjLCBFeGVjT3B0aW9ucyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0ICogYXMgY21kRXhpc3RzIGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcbmltcG9ydCB7IEJsdWVwcmludCwgdWksIHNwaW5uZXIgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCBwa2cgPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKTtcbmltcG9ydCB1bndyYXAgZnJvbSAnLi4vLi4vbGliL3V0aWxzL3Vud3JhcCc7XG5cbmNvbnN0IHJ1biA9IEJsdWViaXJkLnByb21pc2lmeTxbIHN0cmluZywgc3RyaW5nIF0sIHN0cmluZywgRXhlY09wdGlvbnM+KGV4ZWMpO1xuY29uc3QgY29tbWFuZEV4aXN0cyA9IEJsdWViaXJkLnByb21pc2lmeTxib29sZWFuLCBzdHJpbmc+KGNtZEV4aXN0cyk7XG5jb25zdCBPTkVfS0IgPSAxMDI0O1xuY29uc3QgbWF4QnVmZmVyID0gNDAwICogT05FX0tCO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYXBwLCBpbml0aWFsaXplcyBnaXQgYW5kIGluc3RhbGxzIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBAcGFja2FnZSBibHVlcHJpbnRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcEJsdWVwcmludCBleHRlbmRzIEJsdWVwcmludCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdhcHAnO1xuICBzdGF0aWMgZGVzY3JpcHRpb24gPSAnQ3JlYXRlcyBhIG5ldyBhcHAsIGluaXRpYWxpemVzIGdpdCBhbmQgaW5zdGFsbHMgZGVwZW5kZW5jaWVzJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIGFwcCA8bmFtZT4gW29wdGlvbnNdXG5cbiAgICBTY2FmZm9sZHMgYSBuZXcgYXBwLiBTZXRzIHVwIHRoZSBjb3JyZWN0IGRpcmVjdG9yeSBzdHJ1Y3R1cmUsIGluaXRpYWxpemVzIGEgZ2l0IHJlcG8sIGFuZFxuICAgIGluc3RhbGxzIHRoZSBuZWNlc3NhcnkgZGVwZW5kZW5jaWVzLlxuXG4gICAgR3VpZGVzOiBodHRwOi8vZGVuYWxpanMub3JnL21hc3Rlci9ndWlkZXMvb3ZlcnZpZXcvYXBwLXN0cnVjdHVyZS9cbiAgYDtcblxuICBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgc3RhdGljIGZsYWdzID0ge1xuICAgIHNraXBEZXBzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0RvIG5vdCBpbnN0YWxsIGRlcGVuZGVuY2llcyBvbiBuZXcgYXBwJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgdXNlTnBtOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1VzZSBucG0gdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMsIGV2ZW4gaWYgeWFybiBpcyBhdmFpbGFibGUnLFxuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIGxvY2Fscyhhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGNsYXNzTmFtZTogc3RhcnRDYXNlKG5hbWUpLnJlcGxhY2UoL1xccy9nLCAnJyksXG4gICAgICBodW1hbml6ZWROYW1lOiBzdGFydENhc2UobmFtZSksXG4gICAgICBkZW5hbGlWZXJzaW9uOiAoPGFueT5wa2cpLnZlcnNpb25cbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgcG9zdEluc3RhbGwoYXJndjogYW55KSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgaWYgKCFhcmd2LnNraXBEZXBzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgeWFybkV4aXN0cyA9IGF3YWl0IGNvbW1hbmRFeGlzdHMoJ3lhcm4nKTtcbiAgICAgICAgaWYgKHlhcm5FeGlzdHMgJiYgIWFyZ3YudXNlTnBtKSB7XG4gICAgICAgICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnSW5zdGFsbGluZyBkZXBlbmRlbmNpZXMgd2l0aCB5YXJuJyk7XG4gICAgICAgICAgYXdhaXQgcnVuKCd5YXJuIGluc3RhbGwgLS1tdXRleCBuZXR3b3JrJywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdJbnN0YWxsaW5nIGRlcGVuZGVuY2llcyB3aXRoIG5wbScpO1xuICAgICAgICAgIGF3YWl0IHJ1bignbnBtIGluc3RhbGwgLS1sb2dsZXZlbD1lcnJvcicsIHsgY3dkOiBuYW1lLCBtYXhCdWZmZXIgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdEZXBlbmRlbmNpZXMgaW5zdGFsbGVkJyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB1aS5lcnJvcignRGVuYWxpIGVuY291bnRlcmVkIGEgcHJvYmxlbSB3aGlsZSB0cnlpbmcgdG8gaW5zdGFsbCB0aGUgZGVwZW5kZW5jaWVzIGZvciB5b3VyIG5ldyBhcHA6Jyk7XG4gICAgICAgIHVpLmVycm9yKGVycm9yLnN0YWNrIHx8IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdTZXR0aW5nIHVwIGdpdCByZXBvJyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bignZ2l0IGluaXQnLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgYXdhaXQgcnVuKCdnaXQgYWRkIC4nLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgYXdhaXQgcnVuKCdnaXQgY29tbWl0IC1hbSBcIkluaXRpYWwgZGVuYWxpIHByb2plY3Qgc2NhZmZvbGRcIicsIHsgY3dkOiBuYW1lLCBtYXhCdWZmZXIgfSk7XG4gICAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0dpdCByZXBvIGluaXRpYWxpemVkJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXdhaXQgc3Bpbm5lci5mYWlsKCdVbmFibGUgdG8gaW5pdGlhbGl6ZSBnaXQgcmVwbzonKTtcbiAgICAgIHVpLmVycm9yKGUuc3RhY2spO1xuICAgIH1cbiAgICB1aS5pbmZvKGDtoL3ts6YgICR7IG5hbWUgfSBjcmVhdGVkIWApO1xuICAgIHVpLmluZm8oJycpO1xuICAgIHVpLmluZm8oJ1RvIGxhdW5jaCB5b3VyIGFwcGxpY2F0aW9uLCBqdXN0IHJ1bjonKTtcbiAgICB1aS5pbmZvKCcnKTtcbiAgICB1aS5pbmZvKGAgICQgY2QgJHsgbmFtZSB9ICYmIGRlbmFsaSBzZXJ2ZXJgKTtcbiAgICB1aS5pbmZvKCcnKTtcbiAgfVxuXG59XG4iXX0=