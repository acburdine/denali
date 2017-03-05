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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hcHAvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBRWdCO0FBQ2hCLHFDQUFxQztBQUNyQyxpREFBa0Q7QUFDbEQsNENBQTRDO0FBQzVDLDJDQUFvRDtBQUNwRCwwQ0FBMkM7QUFDM0MsbURBQTRDO0FBRTVDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQTBDLG9CQUFJLENBQUMsQ0FBQztBQUM5RSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFrQixTQUFTLENBQUMsQ0FBQztBQUNyRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDcEIsTUFBTSxTQUFTLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUUvQjs7OztHQUlHO0FBQ0gsa0JBQWtDLFNBQVEsc0JBQVM7SUE2QjFDLE1BQU0sQ0FBQyxJQUFTO1FBQ3JCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsTUFBTSxDQUFDO1lBQ0wsSUFBSTtZQUNKLFNBQVMsRUFBRSxrQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzdDLGFBQWEsRUFBRSxrQkFBUyxDQUFDLElBQUksQ0FBQztZQUM5QixhQUFhLEVBQVEsR0FBSSxDQUFDLE9BQU87U0FDbEMsQ0FBQztJQUNKLENBQUM7SUFFWSxXQUFXLENBQUMsSUFBUzs7WUFDaEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUM7b0JBQ0gsSUFBSSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzdDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7d0JBQ3pELE1BQU0sR0FBRyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUN0RSxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNOLE1BQU0sb0JBQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQzt3QkFDeEQsTUFBTSxHQUFHLENBQUMsOEJBQThCLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQ3RFLENBQUM7b0JBQ0QsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2YsZUFBRSxDQUFDLEtBQUssQ0FBQyx5RkFBeUYsQ0FBQyxDQUFDO29CQUNwRyxlQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztnQkFDbEQsQ0FBQztZQUNILENBQUM7WUFDRCxNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLEdBQUcsQ0FBQyxrREFBa0QsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDeEYsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztnQkFDckQsZUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUNELGVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBUSxJQUFLLFdBQVcsQ0FBQyxDQUFDO1lBQ2xDLGVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDWixlQUFFLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7WUFDakQsZUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNaLGVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVyxJQUFLLG1CQUFtQixDQUFDLENBQUM7WUFDN0MsZUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNkLENBQUM7S0FBQTs7QUF2RUQsMkNBQTJDO0FBQzdCLDBCQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLHdCQUFXLEdBQUcsOERBQThELENBQUM7QUFDN0UsNEJBQWUsR0FBRyxnQkFBTSxDQUFBOzs7Ozs7O0dBT3JDLENBQUM7QUFFWSxtQkFBTSxHQUFHLFFBQVEsQ0FBQztBQUVsQixrQkFBSyxHQUFHO0lBQ3BCLFFBQVEsRUFBRTtRQUNSLFdBQVcsRUFBRSx3Q0FBd0M7UUFDckQsWUFBWSxFQUFFLEtBQUs7UUFDbkIsSUFBSSxFQUFPLFNBQVM7S0FDckI7SUFDRCxNQUFNLEVBQUU7UUFDTixXQUFXLEVBQUUsNERBQTREO1FBQ3pFLFlBQVksRUFBRSxLQUFLO1FBQ25CLElBQUksRUFBTyxTQUFTO0tBQ3JCO0NBQ0YsQ0FBQztBQTNCSiwrQkEyRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBzdGFydENhc2Vcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCAqIGFzIEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGV4ZWMsIEV4ZWNPcHRpb25zIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBjbWRFeGlzdHMgZnJvbSAnY29tbWFuZC1leGlzdHMnO1xuaW1wb3J0IHsgQmx1ZXByaW50LCB1aSwgc3Bpbm5lciB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0IHBrZyA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpO1xuaW1wb3J0IHVud3JhcCBmcm9tICcuLi8uLi9saWIvdXRpbHMvdW53cmFwJztcblxuY29uc3QgcnVuID0gQmx1ZWJpcmQucHJvbWlzaWZ5PFsgc3RyaW5nLCBzdHJpbmcgXSwgc3RyaW5nLCBFeGVjT3B0aW9ucz4oZXhlYyk7XG5jb25zdCBjb21tYW5kRXhpc3RzID0gQmx1ZWJpcmQucHJvbWlzaWZ5PGJvb2xlYW4sIHN0cmluZz4oY21kRXhpc3RzKTtcbmNvbnN0IE9ORV9LQiA9IDEwMjQ7XG5jb25zdCBtYXhCdWZmZXIgPSA0MDAgKiBPTkVfS0I7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBhcHAsIGluaXRpYWxpemVzIGdpdCBhbmQgaW5zdGFsbHMgZGVwZW5kZW5jaWVzLlxuICpcbiAqIEBwYWNrYWdlIGJsdWVwcmludHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwQmx1ZXByaW50IGV4dGVuZHMgQmx1ZXByaW50IHtcblxuICAvKiB0c2xpbnQ6ZGlzYWJsZTpjb21wbGV0ZWQtZG9jcyB0eXBlZGVmICovXG4gIHB1YmxpYyBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdhcHAnO1xuICBwdWJsaWMgc3RhdGljIGRlc2NyaXB0aW9uID0gJ0NyZWF0ZXMgYSBuZXcgYXBwLCBpbml0aWFsaXplcyBnaXQgYW5kIGluc3RhbGxzIGRlcGVuZGVuY2llcyc7XG4gIHB1YmxpYyBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFVzYWdlOiBkZW5hbGkgZ2VuZXJhdGUgYXBwIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIFNjYWZmb2xkcyBhIG5ldyBhcHAuIFNldHMgdXAgdGhlIGNvcnJlY3QgZGlyZWN0b3J5IHN0cnVjdHVyZSwgaW5pdGlhbGl6ZXMgYSBnaXQgcmVwbywgYW5kXG4gICAgaW5zdGFsbHMgdGhlIG5lY2Vzc2FyeSBkZXBlbmRlbmNpZXMuXG5cbiAgICBHdWlkZXM6IGh0dHA6Ly9kZW5hbGlqcy5vcmcvbWFzdGVyL2d1aWRlcy9vdmVydmlldy9hcHAtc3RydWN0dXJlL1xuICBgO1xuXG4gIHB1YmxpYyBzdGF0aWMgcGFyYW1zID0gJzxuYW1lPic7XG5cbiAgcHVibGljIHN0YXRpYyBmbGFncyA9IHtcbiAgICBza2lwRGVwczoge1xuICAgICAgZGVzY3JpcHRpb246ICdEbyBub3QgaW5zdGFsbCBkZXBlbmRlbmNpZXMgb24gbmV3IGFwcCcsXG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgICAgdHlwZTogPGFueT4nYm9vbGVhbidcbiAgICB9LFxuICAgIHVzZU5wbToge1xuICAgICAgZGVzY3JpcHRpb246ICdVc2UgbnBtIHRvIGluc3RhbGwgZGVwZW5kZW5jaWVzLCBldmVuIGlmIHlhcm4gaXMgYXZhaWxhYmxlJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH1cbiAgfTtcblxuICBwdWJsaWMgbG9jYWxzKGFyZ3Y6IGFueSkge1xuICAgIGxldCBuYW1lID0gYXJndi5uYW1lO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lLFxuICAgICAgY2xhc3NOYW1lOiBzdGFydENhc2UobmFtZSkucmVwbGFjZSgvXFxzL2csICcnKSxcbiAgICAgIGh1bWFuaXplZE5hbWU6IHN0YXJ0Q2FzZShuYW1lKSxcbiAgICAgIGRlbmFsaVZlcnNpb246ICg8YW55PnBrZykudmVyc2lvblxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcG9zdEluc3RhbGwoYXJndjogYW55KSB7XG4gICAgbGV0IG5hbWUgPSBhcmd2Lm5hbWU7XG4gICAgaWYgKCFhcmd2LnNraXBEZXBzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgeWFybkV4aXN0cyA9IGF3YWl0IGNvbW1hbmRFeGlzdHMoJ3lhcm4nKTtcbiAgICAgICAgaWYgKHlhcm5FeGlzdHMgJiYgIWFyZ3YudXNlTnBtKSB7XG4gICAgICAgICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnSW5zdGFsbGluZyBkZXBlbmRlbmNpZXMgd2l0aCB5YXJuJyk7XG4gICAgICAgICAgYXdhaXQgcnVuKCd5YXJuIGluc3RhbGwgLS1tdXRleCBuZXR3b3JrJywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdJbnN0YWxsaW5nIGRlcGVuZGVuY2llcyB3aXRoIG5wbScpO1xuICAgICAgICAgIGF3YWl0IHJ1bignbnBtIGluc3RhbGwgLS1sb2dsZXZlbD1lcnJvcicsIHsgY3dkOiBuYW1lLCBtYXhCdWZmZXIgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdEZXBlbmRlbmNpZXMgaW5zdGFsbGVkJyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB1aS5lcnJvcignRGVuYWxpIGVuY291bnRlcmVkIGEgcHJvYmxlbSB3aGlsZSB0cnlpbmcgdG8gaW5zdGFsbCB0aGUgZGVwZW5kZW5jaWVzIGZvciB5b3VyIG5ldyBhcHA6Jyk7XG4gICAgICAgIHVpLmVycm9yKGVycm9yLnN0YWNrIHx8IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdTZXR0aW5nIHVwIGdpdCByZXBvJyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bignZ2l0IGluaXQnLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgYXdhaXQgcnVuKCdnaXQgYWRkIC4nLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgYXdhaXQgcnVuKCdnaXQgY29tbWl0IC1hbSBcIkluaXRpYWwgZGVuYWxpIHByb2plY3Qgc2NhZmZvbGRcIicsIHsgY3dkOiBuYW1lLCBtYXhCdWZmZXIgfSk7XG4gICAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0dpdCByZXBvIGluaXRpYWxpemVkJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXdhaXQgc3Bpbm5lci5mYWlsKCdVbmFibGUgdG8gaW5pdGlhbGl6ZSBnaXQgcmVwbzonKTtcbiAgICAgIHVpLmVycm9yKGUuc3RhY2spO1xuICAgIH1cbiAgICB1aS5pbmZvKGDtoL3ts6YgICR7IG5hbWUgfSBjcmVhdGVkIWApO1xuICAgIHVpLmluZm8oJycpO1xuICAgIHVpLmluZm8oJ1RvIGxhdW5jaCB5b3VyIGFwcGxpY2F0aW9uLCBqdXN0IHJ1bjonKTtcbiAgICB1aS5pbmZvKCcnKTtcbiAgICB1aS5pbmZvKGAgICQgY2QgJHsgbmFtZSB9ICYmIGRlbmFsaSBzZXJ2ZXJgKTtcbiAgICB1aS5pbmZvKCcnKTtcbiAgfVxuXG59XG4iXX0=