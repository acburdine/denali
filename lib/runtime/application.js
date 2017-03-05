"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const http = require("http");
const https = require("https");
const bluebird_1 = require("bluebird");
const lodash_1 = require("lodash");
const addon_1 = require("./addon");
const topsort_1 = require("../utils/topsort");
const router_1 = require("./router");
const logger_1 = require("./logger");
const container_1 = require("./container");
const find_plugins_1 = require("find-plugins");
const tryRequire = require("try-require");
const createDebug = require("debug");
const debug = createDebug('denali:application');
/**
 * Application instances are specialized Addons, designed to kick off the loading, mounting, and
 * launching stages of booting up.
 *
 * @package runtime
 */
class Application extends addon_1.default {
    constructor(options) {
        if (!options.container) {
            options.container = new container_1.default();
            options.logger = options.logger || new logger_1.default();
            options.router = options.router || new router_1.default({
                container: options.container,
                logger: options.logger
            });
            options.container.register('router:main', options.router);
            options.container.register('logger:main', options.logger);
        }
        super(options);
        this.drainers = [];
        this.container.register('application:main', this);
        this.router = this.container.lookup('router:main');
        this.logger = this.container.lookup('logger:main');
        this.addons = this.buildAddons(options.addons || []);
        // Generate config first, since the loading process may need it
        this.config = this.generateConfig();
        this.addons.forEach((addon) => {
            addon.load();
        });
        this.load();
        this.compileRouter();
    }
    /**
     * Given a directory that contains an addon, load that addon and instantiate it's Addon class.
     */
    buildAddons(preseededAddons) {
        return find_plugins_1.default({
            dir: this.dir,
            keyword: 'denali-addon',
            include: preseededAddons
        }).map((plugin) => {
            let AddonClass;
            try {
                AddonClass = tryRequire(path.join(plugin.dir, 'app', 'addon.js'));
                AddonClass = AddonClass || addon_1.default;
            }
            catch (e) {
                /* tslint:disable:no-console */
                console.error(`Error loading an addon from ${plugin.dir}:`);
                console.error(e);
                /* tslint:enable:no-console */
                throw e;
            }
            AddonClass = (AddonClass.default || AddonClass);
            let addon = new AddonClass({
                environment: this.environment,
                container: this.container,
                logger: this.logger,
                dir: plugin.dir,
                pkg: plugin.pkg
            });
            debug(`Addon: ${addon.pkg.name}@${addon.pkg.version} (${addon.dir}) `);
            return addon;
        });
    }
    /**
     * Take the loaded environment config functions, and execute them. Application config is executed
     * first, and the returned config object is handed off to the addon config files, which add their
     * configuration by mutating that same object.
     *
     * The resulting final config is stored at `application.config`, and is registered in the
     * container under `config:environment`.
     *
     * This is invoked before the rest of the addons are loaded for 2 reasons:
     *
     * - The config values for the application could theoretically impact the addon loading process
     * - Addons are given a chance to modify the application config, so it must be loaded before they
     *   are.
     */
    generateConfig() {
        let config = this._config(this.environment);
        config.environment = this.environment;
        this.container.register('config:environment', config);
        this.addons.forEach((addon) => {
            addon._config(this.environment, config);
        });
        return config;
    }
    /**
     * Assemble middleware and routes
     */
    compileRouter() {
        this.addons.forEach((addon) => {
            addon._middleware(this.router, this);
        });
        this._middleware(this.router, this);
        this._routes(this.router);
        this.addons.reverse().forEach((addon) => {
            addon._routes(this.router);
        });
    }
    /**
     * Start the Denali server. Runs all initializers, creates an HTTP server, and binds to the port
     * to handle incoming HTTP requests.
     *
     * @since 0.1.0
     */
    start() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let port = this.config.server.port || 3000;
            try {
                yield this.runInitializers();
                if (!this.config.server.detached) {
                    yield this.createServer(port);
                    this.logger.info(`${this.pkg.name}@${this.pkg.version} server up on port ${port}`);
                }
            }
            catch (error) {
                this.logger.error('Problem starting app ...');
                this.logger.error(error.stack || error);
            }
        });
    }
    /**
     * Creates an HTTP or HTTPS server, depending on whether or not SSL configuration is present in
     * config/environment.js
     */
    createServer(port) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => {
                let handler = this.router.handle.bind(this.router);
                let server;
                if (this.config.server.ssl) {
                    server = https.createServer(this.config.server.ssl, handler).listen(port, resolve);
                }
                else {
                    server = http.createServer(handler).listen(port, resolve);
                }
                this.drainers.push(function drainHttp() {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolveDrainer) => {
                            server.close(resolveDrainer);
                            setTimeout(resolveDrainer, 60 * 1000);
                        });
                    });
                });
            });
        });
    }
    /**
     * Lookup all initializers and run them in sequence. Initializers can override the default load
     * order by including `before` or `after` properties on the exported class (the name or array of
     * names of the other initializers it should run before/after).
     *
     * @since 0.1.0
     */
    runInitializers() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let initializers = topsort_1.default(lodash_1.values(this.container.lookupAll('initializer')));
            yield bluebird_1.each(initializers, (initializer) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield initializer.initialize(this);
            }));
        });
    }
    /**
     * Shutdown the application gracefully (i.e. close external database connections, drain in-flight
     * requests, etc)
     *
     * @since 0.1.0
     */
    shutdown() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield bluebird_1.all(this.drainers.map((drainer) => drainer()));
            yield bluebird_1.all(this.addons.map((addon) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield addon.shutdown(this);
            })));
        });
    }
}
exports.default = Application;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3J1bnRpbWUvYXBwbGljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsdUNBQXFDO0FBQ3JDLG1DQUVnQjtBQUNoQixtQ0FBOEM7QUFDOUMsOENBQXVDO0FBQ3ZDLHFDQUE4QjtBQUM5QixxQ0FBOEI7QUFDOUIsMkNBQW9DO0FBQ3BDLCtDQUF1QztBQUN2QywwQ0FBMEM7QUFDMUMscUNBQXFDO0FBRXJDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBOEJoRDs7Ozs7R0FLRztBQUNILGlCQUFpQyxTQUFRLGVBQUs7SUF1QjVDLFlBQVksT0FBMkI7UUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLGdCQUFNLEVBQUUsQ0FBQztZQUNoRCxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxnQkFBTSxDQUFDO2dCQUM1QyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7Z0JBQzVCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTthQUN2QixDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFELE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNE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QUUsR0FBRyxJQUFJLENBQUMsQ0FBQzt3QkFDeEMsQ0FBQyxDQUFDLENBQUE7b0JBQ0osQ0FBQztpQkFBQSxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNVLGVBQWU7O1lBQzFCLElBQUksWUFBWSxHQUFrQixpQkFBTyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsTUFBTSxlQUFJLENBQUMsWUFBWSxFQUFFLENBQU8sV0FBd0I7Z0JBQ3RELE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUQ7Ozs7O09BS0c7SUFDVSxRQUFROztZQUNuQixNQUFNLGNBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxjQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBTyxLQUFLO2dCQUNwQyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQztLQUFBO0NBRUY7QUE5TEQsOEJBOExDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgeyBlYWNoLCBhbGwgfSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQge1xuICB2YWx1ZXNcbn0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBBZGRvbiwgeyBBZGRvbk9wdGlvbnMgfSBmcm9tICcuL2FkZG9uJztcbmltcG9ydCB0b3Bzb3J0IGZyb20gJy4uL3V0aWxzL3RvcHNvcnQnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IGZpbmRQbHVnaW5zIGZyb20gJ2ZpbmQtcGx1Z2lucyc7XG5pbXBvcnQgKiBhcyB0cnlSZXF1aXJlIGZyb20gJ3RyeS1yZXF1aXJlJztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGVuYWxpOmFwcGxpY2F0aW9uJyk7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaW5zdGFudGlhdGluZyBhbiBhcHBsaWNhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uT3B0aW9ucyB7XG4gIHJvdXRlcj86IFJvdXRlcjtcbiAgYWRkb25zPzogc3RyaW5nW107XG4gIGNvbnRhaW5lcj86IENvbnRhaW5lcjtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIGxvZ2dlcj86IExvZ2dlcjtcbiAgcGtnPzogYW55O1xufVxuXG4vKipcbiAqIEluaXRpYWxpemVycyBhcmUgcnVuIGJlZm9yZSB0aGUgYXBwbGljYXRpb24gc3RhcnRzIHVwLiBZb3UgYXJlIGdpdmVuIHRoZSBhcHBsaWNhdGlvbiBpbnN0YW5jZSxcbiAqIGFuZCBpZiB5b3UgbmVlZCB0byBwZXJmb3JtIGFzeW5jIG9wZXJhdGlvbnMsIHlvdSBjYW4gcmV0dXJuIGEgUHJvbWlzZS4gWW91IGNhbiBjb25maWd1cmVcbiAqIGluaXRpYWxpemVyIG9yZGVyIGJ5IHNwZWNpZnlpbmcgdGhlIG5hbWVzIG9mIGluaXRpYWxpemVycyB0aGF0IHNob3VsZCBjb21lIGJlZm9yZSBvciBhZnRlciB5b3VyXG4gKiBpbml0aWFsaXplci5cbiAqXG4gKiBAc2luY2UgMC4xLjBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbml0aWFsaXplciB7XG4gIG5hbWU6IHN0cmluZztcbiAgaW5pdGlhbGl6ZShhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pOiBQcm9taXNlPGFueT47XG4gIGJlZm9yZT86IHN0cmluZyB8IHN0cmluZ1tdO1xuICBhZnRlcj86IHN0cmluZyB8IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIEFwcGxpY2F0aW9uIGluc3RhbmNlcyBhcmUgc3BlY2lhbGl6ZWQgQWRkb25zLCBkZXNpZ25lZCB0byBraWNrIG9mZiB0aGUgbG9hZGluZywgbW91bnRpbmcsIGFuZFxuICogbGF1bmNoaW5nIHN0YWdlcyBvZiBib290aW5nIHVwLlxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwbGljYXRpb24gZXh0ZW5kcyBBZGRvbiB7XG5cbiAgLyoqXG4gICAqIFRoZSBSb3V0ZXIgaW5zdGFuY2UgZm9yIHRoaXMgQXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgcm91dGVyOiBSb3V0ZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBhcHBsaWNhdGlvbiBjb25maWdcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgY29uZmlnOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBjb250YWluZXIgaW5zdGFuY2UgZm9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb25cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgY29udGFpbmVyOiBDb250YWluZXI7XG5cbiAgcHJvdGVjdGVkIGRyYWluZXJzOiAoKCkgPT4gUHJvbWlzZTx2b2lkPilbXTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBcHBsaWNhdGlvbk9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMuY29udGFpbmVyKSB7XG4gICAgICBvcHRpb25zLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoKTtcbiAgICAgIG9wdGlvbnMubG9nZ2VyID0gb3B0aW9ucy5sb2dnZXIgfHwgbmV3IExvZ2dlcigpO1xuICAgICAgb3B0aW9ucy5yb3V0ZXIgPSBvcHRpb25zLnJvdXRlciB8fCBuZXcgUm91dGVyKHtcbiAgICAgICAgY29udGFpbmVyOiBvcHRpb25zLmNvbnRhaW5lcixcbiAgICAgICAgbG9nZ2VyOiBvcHRpb25zLmxvZ2dlclxuICAgICAgfSk7XG4gICAgICBvcHRpb25zLmNvbnRhaW5lci5yZWdpc3Rlcigncm91dGVyOm1haW4nLCBvcHRpb25zLnJvdXRlcik7XG4gICAgICBvcHRpb25zLmNvbnRhaW5lci5yZWdpc3RlcignbG9nZ2VyOm1haW4nLCBvcHRpb25zLmxvZ2dlcik7XG4gICAgfVxuICAgIHN1cGVyKDxBZGRvbk9wdGlvbnM+b3B0aW9ucyk7XG4gICAgdGhpcy5kcmFpbmVycyA9IFtdO1xuICAgIHRoaXMuY29udGFpbmVyLnJlZ2lzdGVyKCdhcHBsaWNhdGlvbjptYWluJywgdGhpcyk7XG4gICAgdGhpcy5yb3V0ZXIgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ3JvdXRlcjptYWluJyk7XG4gICAgdGhpcy5sb2dnZXIgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ2xvZ2dlcjptYWluJyk7XG4gICAgdGhpcy5hZGRvbnMgPSB0aGlzLmJ1aWxkQWRkb25zKG9wdGlvbnMuYWRkb25zIHx8IFtdKTtcbiAgICAvLyBHZW5lcmF0ZSBjb25maWcgZmlyc3QsIHNpbmNlIHRoZSBsb2FkaW5nIHByb2Nlc3MgbWF5IG5lZWQgaXRcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZ2VuZXJhdGVDb25maWcoKTtcblxuICAgIHRoaXMuYWRkb25zLmZvckVhY2goKGFkZG9uKSA9PiB7XG4gICAgICBhZGRvbi5sb2FkKCk7XG4gICAgfSk7XG4gICAgdGhpcy5sb2FkKCk7XG4gICAgdGhpcy5jb21waWxlUm91dGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyBhbiBhZGRvbiwgbG9hZCB0aGF0IGFkZG9uIGFuZCBpbnN0YW50aWF0ZSBpdCdzIEFkZG9uIGNsYXNzLlxuICAgKi9cbiAgcHJpdmF0ZSBidWlsZEFkZG9ucyhwcmVzZWVkZWRBZGRvbnM6IHN0cmluZ1tdKTogQWRkb25bXSB7XG4gICAgcmV0dXJuIGZpbmRQbHVnaW5zKHtcbiAgICAgIGRpcjogdGhpcy5kaXIsXG4gICAgICBrZXl3b3JkOiAnZGVuYWxpLWFkZG9uJyxcbiAgICAgIGluY2x1ZGU6IHByZXNlZWRlZEFkZG9uc1xuICAgIH0pLm1hcCgocGx1Z2luKSA9PiB7XG4gICAgICBsZXQgQWRkb25DbGFzcztcbiAgICAgIHRyeSB7XG4gICAgICAgIEFkZG9uQ2xhc3MgPSB0cnlSZXF1aXJlKHBhdGguam9pbihwbHVnaW4uZGlyLCAnYXBwJywgJ2FkZG9uLmpzJykpO1xuICAgICAgICBBZGRvbkNsYXNzID0gQWRkb25DbGFzcyB8fCBBZGRvbjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogdHNsaW50OmRpc2FibGU6bm8tY29uc29sZSAqL1xuICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBsb2FkaW5nIGFuIGFkZG9uIGZyb20gJHsgcGx1Z2luLmRpciB9OmApO1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAvKiB0c2xpbnQ6ZW5hYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICAgIEFkZG9uQ2xhc3MgPSA8dHlwZW9mIEFkZG9uPihBZGRvbkNsYXNzLmRlZmF1bHQgfHwgQWRkb25DbGFzcyk7XG4gICAgICBsZXQgYWRkb24gPSBuZXcgQWRkb25DbGFzcyh7XG4gICAgICAgIGVudmlyb25tZW50OiB0aGlzLmVudmlyb25tZW50LFxuICAgICAgICBjb250YWluZXI6IHRoaXMuY29udGFpbmVyLFxuICAgICAgICBsb2dnZXI6IHRoaXMubG9nZ2VyLFxuICAgICAgICBkaXI6IHBsdWdpbi5kaXIsXG4gICAgICAgIHBrZzogcGx1Z2luLnBrZ1xuICAgICAgfSk7XG4gICAgICBkZWJ1ZyhgQWRkb246ICR7IGFkZG9uLnBrZy5uYW1lIH1AJHsgYWRkb24ucGtnLnZlcnNpb24gfSAoJHsgYWRkb24uZGlyIH0pIGApO1xuICAgICAgcmV0dXJuIGFkZG9uO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgdGhlIGxvYWRlZCBlbnZpcm9ubWVudCBjb25maWcgZnVuY3Rpb25zLCBhbmQgZXhlY3V0ZSB0aGVtLiBBcHBsaWNhdGlvbiBjb25maWcgaXMgZXhlY3V0ZWRcbiAgICogZmlyc3QsIGFuZCB0aGUgcmV0dXJuZWQgY29uZmlnIG9iamVjdCBpcyBoYW5kZWQgb2ZmIHRvIHRoZSBhZGRvbiBjb25maWcgZmlsZXMsIHdoaWNoIGFkZCB0aGVpclxuICAgKiBjb25maWd1cmF0aW9uIGJ5IG11dGF0aW5nIHRoYXQgc2FtZSBvYmplY3QuXG4gICAqXG4gICAqIFRoZSByZXN1bHRpbmcgZmluYWwgY29uZmlnIGlzIHN0b3JlZCBhdCBgYXBwbGljYXRpb24uY29uZmlnYCwgYW5kIGlzIHJlZ2lzdGVyZWQgaW4gdGhlXG4gICAqIGNvbnRhaW5lciB1bmRlciBgY29uZmlnOmVudmlyb25tZW50YC5cbiAgICpcbiAgICogVGhpcyBpcyBpbnZva2VkIGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgYWRkb25zIGFyZSBsb2FkZWQgZm9yIDIgcmVhc29uczpcbiAgICpcbiAgICogLSBUaGUgY29uZmlnIHZhbHVlcyBmb3IgdGhlIGFwcGxpY2F0aW9uIGNvdWxkIHRoZW9yZXRpY2FsbHkgaW1wYWN0IHRoZSBhZGRvbiBsb2FkaW5nIHByb2Nlc3NcbiAgICogLSBBZGRvbnMgYXJlIGdpdmVuIGEgY2hhbmNlIHRvIG1vZGlmeSB0aGUgYXBwbGljYXRpb24gY29uZmlnLCBzbyBpdCBtdXN0IGJlIGxvYWRlZCBiZWZvcmUgdGhleVxuICAgKiAgIGFyZS5cbiAgICovXG4gIHByaXZhdGUgZ2VuZXJhdGVDb25maWcoKTogYW55IHtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5fY29uZmlnKHRoaXMuZW52aXJvbm1lbnQpO1xuICAgIGNvbmZpZy5lbnZpcm9ubWVudCA9IHRoaXMuZW52aXJvbm1lbnQ7XG4gICAgdGhpcy5jb250YWluZXIucmVnaXN0ZXIoJ2NvbmZpZzplbnZpcm9ubWVudCcsIGNvbmZpZyk7XG4gICAgdGhpcy5hZGRvbnMuZm9yRWFjaCgoYWRkb24pID0+IHtcbiAgICAgIGFkZG9uLl9jb25maWcodGhpcy5lbnZpcm9ubWVudCwgY29uZmlnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VtYmxlIG1pZGRsZXdhcmUgYW5kIHJvdXRlc1xuICAgKi9cbiAgcHJpdmF0ZSBjb21waWxlUm91dGVyKCk6IHZvaWQge1xuICAgIHRoaXMuYWRkb25zLmZvckVhY2goKGFkZG9uKSA9PiB7XG4gICAgICBhZGRvbi5fbWlkZGxld2FyZSh0aGlzLnJvdXRlciwgdGhpcyk7XG4gICAgfSk7XG4gICAgdGhpcy5fbWlkZGxld2FyZSh0aGlzLnJvdXRlciwgdGhpcyk7XG4gICAgdGhpcy5fcm91dGVzKHRoaXMucm91dGVyKTtcbiAgICB0aGlzLmFkZG9ucy5yZXZlcnNlKCkuZm9yRWFjaCgoYWRkb24pID0+IHtcbiAgICAgIGFkZG9uLl9yb3V0ZXModGhpcy5yb3V0ZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHRoZSBEZW5hbGkgc2VydmVyLiBSdW5zIGFsbCBpbml0aWFsaXplcnMsIGNyZWF0ZXMgYW4gSFRUUCBzZXJ2ZXIsIGFuZCBiaW5kcyB0byB0aGUgcG9ydFxuICAgKiB0byBoYW5kbGUgaW5jb21pbmcgSFRUUCByZXF1ZXN0cy5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHBvcnQgPSB0aGlzLmNvbmZpZy5zZXJ2ZXIucG9ydCB8fCAzMDAwO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnJ1bkluaXRpYWxpemVycygpO1xuICAgICAgaWYgKCF0aGlzLmNvbmZpZy5zZXJ2ZXIuZGV0YWNoZWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVTZXJ2ZXIocG9ydCk7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oYCR7IHRoaXMucGtnLm5hbWUgfUAkeyB0aGlzLnBrZy52ZXJzaW9uIH0gc2VydmVyIHVwIG9uIHBvcnQgJHsgcG9ydCB9YCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdQcm9ibGVtIHN0YXJ0aW5nIGFwcCAuLi4nKTtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGVycm9yLnN0YWNrIHx8IGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBIVFRQIG9yIEhUVFBTIHNlcnZlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgb3Igbm90IFNTTCBjb25maWd1cmF0aW9uIGlzIHByZXNlbnQgaW5cbiAgICogY29uZmlnL2Vudmlyb25tZW50LmpzXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGNyZWF0ZVNlcnZlcihwb3J0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGhhbmRsZXIgPSB0aGlzLnJvdXRlci5oYW5kbGUuYmluZCh0aGlzLnJvdXRlcik7XG4gICAgICBsZXQgc2VydmVyOiBhbnk7XG4gICAgICBpZiAodGhpcy5jb25maWcuc2VydmVyLnNzbCkge1xuICAgICAgICBzZXJ2ZXIgPSBodHRwcy5jcmVhdGVTZXJ2ZXIodGhpcy5jb25maWcuc2VydmVyLnNzbCwgaGFuZGxlcikubGlzdGVuKHBvcnQsIHJlc29sdmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoaGFuZGxlcikubGlzdGVuKHBvcnQsIHJlc29sdmUpO1xuICAgICAgfVxuICAgICAgdGhpcy5kcmFpbmVycy5wdXNoKGFzeW5jIGZ1bmN0aW9uIGRyYWluSHR0cCgpIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmVEcmFpbmVyKSA9PiB7XG4gICAgICAgICAgc2VydmVyLmNsb3NlKHJlc29sdmVEcmFpbmVyKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmVEcmFpbmVyLCA2MCAqIDEwMDApO1xuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTG9va3VwIGFsbCBpbml0aWFsaXplcnMgYW5kIHJ1biB0aGVtIGluIHNlcXVlbmNlLiBJbml0aWFsaXplcnMgY2FuIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGxvYWRcbiAgICogb3JkZXIgYnkgaW5jbHVkaW5nIGBiZWZvcmVgIG9yIGBhZnRlcmAgcHJvcGVydGllcyBvbiB0aGUgZXhwb3J0ZWQgY2xhc3MgKHRoZSBuYW1lIG9yIGFycmF5IG9mXG4gICAqIG5hbWVzIG9mIHRoZSBvdGhlciBpbml0aWFsaXplcnMgaXQgc2hvdWxkIHJ1biBiZWZvcmUvYWZ0ZXIpLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBydW5Jbml0aWFsaXplcnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGluaXRpYWxpemVycyA9IDxJbml0aWFsaXplcltdPnRvcHNvcnQodmFsdWVzKHRoaXMuY29udGFpbmVyLmxvb2t1cEFsbCgnaW5pdGlhbGl6ZXInKSkpO1xuICAgIGF3YWl0IGVhY2goaW5pdGlhbGl6ZXJzLCBhc3luYyAoaW5pdGlhbGl6ZXI6IEluaXRpYWxpemVyKSA9PiB7XG4gICAgICBhd2FpdCBpbml0aWFsaXplci5pbml0aWFsaXplKHRoaXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNodXRkb3duIHRoZSBhcHBsaWNhdGlvbiBncmFjZWZ1bGx5IChpLmUuIGNsb3NlIGV4dGVybmFsIGRhdGFiYXNlIGNvbm5lY3Rpb25zLCBkcmFpbiBpbi1mbGlnaHRcbiAgICogcmVxdWVzdHMsIGV0YylcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgYWxsKHRoaXMuZHJhaW5lcnMubWFwKChkcmFpbmVyKSA9PiBkcmFpbmVyKCkpKTtcbiAgICBhd2FpdCBhbGwodGhpcy5hZGRvbnMubWFwKGFzeW5jIChhZGRvbikgPT4ge1xuICAgICAgYXdhaXQgYWRkb24uc2h1dGRvd24odGhpcyk7XG4gICAgfSkpO1xuICB9XG5cbn1cbiJdfQ==