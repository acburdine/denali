"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert = require("assert");
const path = require("path");
const denali_cli_1 = require("denali-cli");
const tryRequire = require("try-require");
const cmdExists = require("command-exists");
const Bluebird = require("bluebird");
const child_process_1 = require("child_process");
const run = Bluebird.promisify(child_process_1.exec);
const commandExists = Bluebird.promisify(cmdExists);
/**
 * Run migrations to update your database schema
 *
 * @package commands
 */
class MigrateCommand extends denali_cli_1.Command {
    run(argv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let knex = tryRequire('knex');
            if (!knex) {
                yield denali_cli_1.spinner.start('Installing knex (required for migrations)');
                let yarnExists = yield commandExists('yarn');
                if (yarnExists) {
                    yield run('yarn add knex --mutex network');
                }
                else {
                    yield run('npm install --save knex');
                }
                knex = require('knex');
                yield denali_cli_1.spinner.succeed('Knex installed');
            }
            let project = new denali_cli_1.Project({
                environment: argv.environment,
                buildDummy: true
            });
            let application = yield project.createApplication();
            assert(application.config.migrations && application.config.migrations.db, 'DB connection info is missing. You must supply the knex connection info in config.migrations.db.');
            let db = knex(application.config.migrations.db);
            let migrationsDir = path.join(application.dir, 'config', 'migrations');
            try {
                if (argv.rollback) {
                    yield denali_cli_1.spinner.start('Rolling back last migration');
                    yield db.migrate.rollback({ directory: migrationsDir });
                }
                else if (argv.redo) {
                    yield denali_cli_1.spinner.start('Rolling back and replaying last migration');
                    yield db.migrate.rollback({ directory: migrationsDir });
                    yield db.migrate.latest({ directory: migrationsDir });
                }
                else {
                    yield denali_cli_1.spinner.start('Running migrations to latest');
                    yield db.migrate.latest({ directory: migrationsDir });
                }
                let newVersion = yield db.migrate.currentVersion();
                yield denali_cli_1.spinner.succeed(`Migrated to ${newVersion}`);
            }
            catch (error) {
                yield denali_cli_1.spinner.fail(`Migrations failed:\n${error.stack}`);
            }
            finally {
                yield db.destroy();
            }
        });
    }
}
/* tslint:disable:completed-docs typedef */
MigrateCommand.commandName = 'migrate';
MigrateCommand.description = 'Run migrations to update your database schema';
MigrateCommand.longDescription = denali_cli_1.unwrap `
    Runs (or rolls back) schema migrations for your database. Typically only
    applies when use SQL-based databases.`;
MigrateCommand.flags = {
    environment: {
        description: 'The target environment to build for.',
        default: process.env.NODE_ENV || 'development',
        type: 'string'
    },
    rollback: {
        description: 'Rollback the latest migration, or latest --step migrations. Defaults to 1 step.',
        default: false,
        type: 'boolean'
    },
    redo: {
        description: 'Shortcut for rolling back then migrating up again. If used with --step, it will replay that many migrations. If used with --version, it will roll back to that version then replay. If neither, defaults to --step 1',
        default: false,
        type: 'boolean'
    }
};
MigrateCommand.runsInApp = true;
exports.default = MigrateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWNidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9kZW5hbGkvIiwic291cmNlcyI6WyJjb21tYW5kcy9taWdyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFpQztBQUNqQyw2QkFBNkI7QUFDN0IsMkNBQStEO0FBQy9ELDBDQUEwQztBQUMxQyw0Q0FBNEM7QUFDNUMscUNBQXFDO0FBQ3JDLGlEQUFxQztBQUVyQyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUE2QixvQkFBSSxDQUFDLENBQUM7QUFDakUsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBa0IsU0FBUyxDQUFDLENBQUM7QUFFckU7Ozs7R0FJRztBQUNILG9CQUFvQyxTQUFRLG9CQUFPO0lBNkIzQyxHQUFHLENBQUMsSUFBUzs7WUFDakIsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDVixNQUFNLG9CQUFPLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7Z0JBQ2pFLElBQUksVUFBVSxHQUFHLE1BQU0sYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNmLE1BQU0sR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQzdDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ04sTUFBTSxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztnQkFDRCxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QixNQUFNLG9CQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELElBQUksT0FBTyxHQUFHLElBQUksb0JB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SSxDQUFDO0FBM0IxQixpQ0F1RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzcGlubmVyLCBDb21tYW5kLCBQcm9qZWN0LCB1bndyYXAgfSBmcm9tICdkZW5hbGktY2xpJztcbmltcG9ydCAqIGFzIHRyeVJlcXVpcmUgZnJvbSAndHJ5LXJlcXVpcmUnO1xuaW1wb3J0ICogYXMgY21kRXhpc3RzIGZyb20gJ2NvbW1hbmQtZXhpc3RzJztcbmltcG9ydCAqIGFzIEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgcnVuID0gQmx1ZWJpcmQucHJvbWlzaWZ5PFsgc3RyaW5nLCBzdHJpbmcgXSwgc3RyaW5nPihleGVjKTtcbmNvbnN0IGNvbW1hbmRFeGlzdHMgPSBCbHVlYmlyZC5wcm9taXNpZnk8Ym9vbGVhbiwgc3RyaW5nPihjbWRFeGlzdHMpO1xuXG4vKipcbiAqIFJ1biBtaWdyYXRpb25zIHRvIHVwZGF0ZSB5b3VyIGRhdGFiYXNlIHNjaGVtYVxuICpcbiAqIEBwYWNrYWdlIGNvbW1hbmRzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZ3JhdGVDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cbiAgLyogdHNsaW50OmRpc2FibGU6Y29tcGxldGVkLWRvY3MgdHlwZWRlZiAqL1xuICBzdGF0aWMgY29tbWFuZE5hbWUgPSAnbWlncmF0ZSc7XG4gIHN0YXRpYyBkZXNjcmlwdGlvbiA9ICdSdW4gbWlncmF0aW9ucyB0byB1cGRhdGUgeW91ciBkYXRhYmFzZSBzY2hlbWEnO1xuICBzdGF0aWMgbG9uZ0Rlc2NyaXB0aW9uID0gdW53cmFwYFxuICAgIFJ1bnMgKG9yIHJvbGxzIGJhY2spIHNjaGVtYSBtaWdyYXRpb25zIGZvciB5b3VyIGRhdGFiYXNlLiBUeXBpY2FsbHkgb25seVxuICAgIGFwcGxpZXMgd2hlbiB1c2UgU1FMLWJhc2VkIGRhdGFiYXNlcy5gO1xuXG4gIHN0YXRpYyBmbGFncyA9IHtcbiAgICBlbnZpcm9ubWVudDoge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgdGFyZ2V0IGVudmlyb25tZW50IHRvIGJ1aWxkIGZvci4nLFxuICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JyxcbiAgICAgIHR5cGU6IDxhbnk+J3N0cmluZydcbiAgICB9LFxuICAgIHJvbGxiYWNrOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1JvbGxiYWNrIHRoZSBsYXRlc3QgbWlncmF0aW9uLCBvciBsYXRlc3QgLS1zdGVwIG1pZ3JhdGlvbnMuIERlZmF1bHRzIHRvIDEgc3RlcC4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB0eXBlOiA8YW55Pidib29sZWFuJ1xuICAgIH0sXG4gICAgcmVkbzoge1xuICAgICAgZGVzY3JpcHRpb246ICdTaG9ydGN1dCBmb3Igcm9sbGluZyBiYWNrIHRoZW4gbWlncmF0aW5nIHVwIGFnYWluLiBJZiB1c2VkIHdpdGggLS1zdGVwLCBpdCB3aWxsIHJlcGxheSB0aGF0IG1hbnkgbWlncmF0aW9ucy4gSWYgdXNlZCB3aXRoIC0tdmVyc2lvbiwgaXQgd2lsbCByb2xsIGJhY2sgdG8gdGhhdCB2ZXJzaW9uIHRoZW4gcmVwbGF5LiBJZiBuZWl0aGVyLCBkZWZhdWx0cyB0byAtLXN0ZXAgMScsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHR5cGU6IDxhbnk+J2Jvb2xlYW4nXG4gICAgfVxuICB9O1xuXG4gIHN0YXRpYyBydW5zSW5BcHAgPSB0cnVlO1xuXG4gIGFzeW5jIHJ1bihhcmd2OiBhbnkpIHtcbiAgICBsZXQga25leCA9IHRyeVJlcXVpcmUoJ2tuZXgnKTtcbiAgICBpZiAoIWtuZXgpIHtcbiAgICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ0luc3RhbGxpbmcga25leCAocmVxdWlyZWQgZm9yIG1pZ3JhdGlvbnMpJyk7XG4gICAgICBsZXQgeWFybkV4aXN0cyA9IGF3YWl0IGNvbW1hbmRFeGlzdHMoJ3lhcm4nKTtcbiAgICAgIGlmICh5YXJuRXhpc3RzKSB7XG4gICAgICAgIGF3YWl0IHJ1bigneWFybiBhZGQga25leCAtLW11dGV4IG5ldHdvcmsnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF3YWl0IHJ1bignbnBtIGluc3RhbGwgLS1zYXZlIGtuZXgnKTtcbiAgICAgIH1cbiAgICAgIGtuZXggPSByZXF1aXJlKCdrbmV4Jyk7XG4gICAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoJ0tuZXggaW5zdGFsbGVkJyk7XG4gICAgfVxuICAgIGxldCBwcm9qZWN0ID0gbmV3IFByb2plY3Qoe1xuICAgICAgZW52aXJvbm1lbnQ6IGFyZ3YuZW52aXJvbm1lbnQsXG4gICAgICBidWlsZER1bW15OiB0cnVlXG4gICAgfSk7XG4gICAgbGV0IGFwcGxpY2F0aW9uID0gYXdhaXQgcHJvamVjdC5jcmVhdGVBcHBsaWNhdGlvbigpO1xuICAgIGFzc2VydChhcHBsaWNhdGlvbi5jb25maWcubWlncmF0aW9ucyAmJiBhcHBsaWNhdGlvbi5jb25maWcubWlncmF0aW9ucy5kYiwgJ0RCIGNvbm5lY3Rpb24gaW5mbyBpcyBtaXNzaW5nLiBZb3UgbXVzdCBzdXBwbHkgdGhlIGtuZXggY29ubmVjdGlvbiBpbmZvIGluIGNvbmZpZy5taWdyYXRpb25zLmRiLicpO1xuICAgIGxldCBkYiA9IGtuZXgoYXBwbGljYXRpb24uY29uZmlnLm1pZ3JhdGlvbnMuZGIpO1xuICAgIGxldCBtaWdyYXRpb25zRGlyID0gcGF0aC5qb2luKGFwcGxpY2F0aW9uLmRpciwgJ2NvbmZpZycsICdtaWdyYXRpb25zJyk7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChhcmd2LnJvbGxiYWNrKSB7XG4gICAgICAgIGF3YWl0IHNwaW5uZXIuc3RhcnQoJ1JvbGxpbmcgYmFjayBsYXN0IG1pZ3JhdGlvbicpO1xuICAgICAgICBhd2FpdCBkYi5taWdyYXRlLnJvbGxiYWNrKHsgZGlyZWN0b3J5OiBtaWdyYXRpb25zRGlyIH0pO1xuICAgICAgfSBlbHNlIGlmIChhcmd2LnJlZG8pIHtcbiAgICAgICAgYXdhaXQgc3Bpbm5lci5zdGFydCgnUm9sbGluZyBiYWNrIGFuZCByZXBsYXlpbmcgbGFzdCBtaWdyYXRpb24nKTtcbiAgICAgICAgYXdhaXQgZGIubWlncmF0ZS5yb2xsYmFjayh7IGRpcmVjdG9yeTogbWlncmF0aW9uc0RpciB9KTtcbiAgICAgICAgYXdhaXQgZGIubWlncmF0ZS5sYXRlc3QoeyBkaXJlY3Rvcnk6IG1pZ3JhdGlvbnNEaXIgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzcGlubmVyLnN0YXJ0KCdSdW5uaW5nIG1pZ3JhdGlvbnMgdG8gbGF0ZXN0Jyk7XG4gICAgICAgIGF3YWl0IGRiLm1pZ3JhdGUubGF0ZXN0KHsgZGlyZWN0b3J5OiBtaWdyYXRpb25zRGlyIH0pO1xuICAgICAgfVxuICAgICAgbGV0IG5ld1ZlcnNpb24gPSBhd2FpdCBkYi5taWdyYXRlLmN1cnJlbnRWZXJzaW9uKCk7XG4gICAgICBhd2FpdCBzcGlubmVyLnN1Y2NlZWQoYE1pZ3JhdGVkIHRvICR7IG5ld1ZlcnNpb24gfWApO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhd2FpdCBzcGlubmVyLmZhaWwoYE1pZ3JhdGlvbnMgZmFpbGVkOlxcbiR7IGVycm9yLnN0YWNrIH1gKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgZGIuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=