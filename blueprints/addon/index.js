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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsiYmx1ZXByaW50cy9hZGRvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsaURBQWtEO0FBQ2xELG1DQUVnQjtBQUNoQiw0Q0FBNEM7QUFDNUMsMkNBQW9EO0FBQ3BELDBDQUEwQztBQUMxQyxtREFBNEM7QUFFNUMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBMEMsb0JBQUksQ0FBQyxDQUFDO0FBQzlFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQWtCLFNBQVMsQ0FBQyxDQUFDO0FBQ3JFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQztBQUNwQixNQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDO0FBRS9COzs7O0dBSUc7QUFDSCxvQkFBb0MsU0FBUSxzQkFBUztJQTZCbkQsTUFBTSxDQUFDLElBQVM7UUFDZCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQztZQUNMLElBQUk7WUFDSixTQUFTLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM3QyxhQUFhLEVBQUUsa0JBQVMsQ0FBQyxJQUFJLENBQUM7WUFDOUIsYUFBYSxFQUFFLEdBQUcsQ0FBQyxPQUFPO1NBQzNCLENBQUM7SUFDSixDQUFDO0lBRUssV0FBVyxDQUFDLElBQVM7O1lBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDckIsZUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksVUFBVSxHQUFZLE1BQU0sYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0RCxFQUFFLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxvQkFBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO29CQUN6RCxNQUFNLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7b0JBQ3hELE1BQU0sR0FBRyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO1lBQ0gsQ0FBQztZQUNELE1BQU0sb0JBQU8sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNoRCxNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDO2dCQUNILE1BQU0sR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLEdBQUcsQ0FBQyxrREFBa0QsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDeEYsTUFBTSxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE1BQU0sb0JBQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztnQkFDckQsZUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEIsQ0FBQztZQUNELE1BQU0sZUFBRSxDQUFDLElBQUksQ0FBQyxPQUFRLElBQUssaUJBQWlCLENBQUMsQ0FBQztRQUNoRCxDQUFDO0tBQUE7O0FBOURELDJDQUEyQztBQUNwQyw0QkFBYSxHQUFHLE9BQU8sQ0FBQztBQUN4QiwwQkFBVyxHQUFHLHdFQUF3RSxDQUFDO0FBQ3ZGLDhCQUFlLEdBQUcsZ0JBQU0sQ0FBQTs7Ozs7OztHQU85QixDQUFDO0FBRUsscUJBQU0sR0FBRyxRQUFRLENBQUM7QUFFbEIsb0JBQUssR0FBRztJQUNiLFdBQVcsRUFBRTtRQUNYLFdBQVcsRUFBRSwwQ0FBMEM7UUFDdkQsWUFBWSxFQUFFLEtBQUs7UUFDbkIsSUFBSSxFQUFPLFNBQVM7S0FDckI7SUFDRCxTQUFTLEVBQUU7UUFDVCxXQUFXLEVBQUUsNERBQTREO1FBQ3pFLFlBQVksRUFBRSxLQUFLO1FBQ25CLElBQUksRUFBTyxTQUFTO0tBQ3JCO0NBQ0YsQ0FBQztBQTNCSixpQ0FrRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgeyBleGVjLCBFeGVjT3B0aW9ucyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtcbiAgc3RhcnRDYXNlXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBjbWRFeGlzdHMgZnJvbSAnY29tbWFuZC1leGlzdHMnO1xuaW1wb3J0IHsgQmx1ZXByaW50LCB1aSwgc3Bpbm5lciB9IGZyb20gJ2RlbmFsaS1jbGknO1xuaW1wb3J0ICogYXMgcGtnIGZyb20gJy4uLy4uL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgdW53cmFwIGZyb20gJy4uLy4uL2xpYi91dGlscy91bndyYXAnO1xuXG5jb25zdCBydW4gPSBCbHVlYmlyZC5wcm9taXNpZnk8WyBzdHJpbmcsIHN0cmluZyBdLCBzdHJpbmcsIEV4ZWNPcHRpb25zPihleGVjKTtcbmNvbnN0IGNvbW1hbmRFeGlzdHMgPSBCbHVlYmlyZC5wcm9taXNpZnk8Ym9vbGVhbiwgc3RyaW5nPihjbWRFeGlzdHMpO1xuY29uc3QgT05FX0tCID0gMTAyNDtcbmNvbnN0IG1heEJ1ZmZlciA9IDQwMCAqIE9ORV9LQjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGFkZG9uIHByb2plY3QsIGluaXRpYWxpemVzIGdpdCBhbmQgaW5zdGFsbHMgZGVwZW5kZW5jaWVzXG4gKlxuICogQHBhY2thZ2UgYmx1ZXByaW50c1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGRvbkJsdWVwcmludCBleHRlbmRzIEJsdWVwcmludCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgYmx1ZXByaW50TmFtZSA9ICdhZGRvbic7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdDcmVhdGVzIGEgbmV3IGFkZG9uIHByb2plY3QsIGluaXRpYWxpemVzIGdpdCBhbmQgaW5zdGFsbHMgZGVwZW5kZW5jaWVzJztcbiAgc3RhdGljIGxvbmdEZXNjcmlwdGlvbiA9IHVud3JhcGBcbiAgICBVc2FnZTogZGVuYWxpIGdlbmVyYXRlIGFkZG9uIDxuYW1lPiBbb3B0aW9uc11cblxuICAgIFNjYWZmb2xkcyBhIG5ldyBhZGRvbi4gU2V0cyB1cCB0aGUgY29ycmVjdCBkaXJlY3Rvcnkgc3RydWN0dXJlLCBpbml0aWFsaXplcyBhIGdpdCByZXBvLCBhbmRcbiAgICBpbnN0YWxscyB0aGUgbmVjZXNzYXJ5IGRlcGVuZGVuY2llcy5cblxuICAgIEd1aWRlczogaHR0cDovL2RlbmFsaWpzLm9yZy9tYXN0ZXIvZ3VpZGVzL3V0aWxpdGllcy9hZGRvbnMvXG4gIGA7XG5cbiAgc3RhdGljIHBhcmFtcyA9ICc8bmFtZT4nO1xuXG4gIHN0YXRpYyBmbGFncyA9IHtcbiAgICAnc2tpcC1kZXBzJzoge1xuICAgICAgZGVzY3JpcHRpb246ICdEbyBub3QgaW5zdGFsbCBkZXBlbmRlbmNpZXMgb24gbmV3IGFkZG9uJyxcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgJ3VzZS1ucG0nOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1VzZSBucG0gdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMsIGV2ZW4gaWYgeWFybiBpcyBhdmFpbGFibGUnLFxuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIGxvY2Fscyhhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGNsYXNzTmFtZTogc3RhcnRDYXNlKG5hbWUpLnJlcGxhY2UoL1xccy9nLCAnJyksXG4gICAgICBodW1hbml6ZWROYW1lOiBzdGFydENhc2UobmFtZSksXG4gICAgICBkZW5hbGlWZXJzaW9uOiBwa2cudmVyc2lvblxuICAgIH07XG4gIH1cblxuICBhc3luYyBwb3N0SW5zdGFsbChhcmd2OiBhbnkpIHtcbiAgICBsZXQgbmFtZSA9IGFyZ3YubmFtZTtcbiAgICB1aS5pbmZvKCcnKTtcbiAgICBpZiAoIWFyZ3Yuc2tpcERlcHMpIHtcbiAgICAgIGxldCB5YXJuRXhpc3RzOiBib29sZWFuID0gYXdhaXQgY29tbWFuZEV4aXN0cygneWFybicpO1xuICAgICAgaWYgKHlhcm5FeGlzdHMgJiYgIWFyZ3YudXNlTnBtKSB7XG4gICAgICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ0luc3RhbGxpbmcgZGVwZW5kZW5jaWVzIHdpdGggeWFybicpO1xuICAgICAgICBhd2FpdCBydW4oJ3lhcm4gaW5zdGFsbCAtLW11dGV4IG5ldHdvcmsnLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnSW5zdGFsbGluZyBkZXBlbmRlbmNpZXMgd2l0aCBucG0nKTtcbiAgICAgICAgYXdhaXQgcnVuKCducG0gaW5zdGFsbCAtLWxvZ2xldmVsPWVycm9yJywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdEZXBlbmRlbmNpZXMgaW5zdGFsbGVkJyk7XG4gICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnU2V0dGluZyB1cCBnaXQgcmVwbycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW4oJ2dpdCBpbml0JywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgIGF3YWl0IHJ1bignZ2l0IGFkZCAuJywgeyBjd2Q6IG5hbWUsIG1heEJ1ZmZlciB9KTtcbiAgICAgIGF3YWl0IHJ1bignZ2l0IGNvbW1pdCAtYW0gXCJJbml0aWFsIGRlbmFsaSBwcm9qZWN0IHNjYWZmb2xkXCInLCB7IGN3ZDogbmFtZSwgbWF4QnVmZmVyIH0pO1xuICAgICAgYXdhaXQgc3Bpbm5lci5zdWNjZWVkKCdHaXQgcmVwbyBpbml0aWFsaXplZCcpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuZmFpbCgnVW5hYmxlIHRvIGluaXRpYWxpemUgZ2l0IHJlcG86Jyk7XG4gICAgICB1aS5lcnJvcihlLnN0YWNrKTtcbiAgICB9XG4gICAgYXdhaXQgdWkuaW5mbyhg7aC97bOmICAkeyBuYW1lIH0gYWRkb24gY3JlYXRlZCFgKTtcbiAgfVxuXG59XG4iXX0=