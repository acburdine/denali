"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = require("lodash");
const path = require("path");
const http = require("http");
const https = require("https");
const bluebird_1 = require("bluebird");
const addon_1 = require("./addon");
const topsort_1 = require("../utils/topsort");
const container_1 = require("../metal/container");
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
        let container = new container_1.default(options.dir);
        super(Object.assign(options, { container }));
        this.drainers = [];
        // Setup some helpful container shortcuts
        this.container.register('app:main', this, { singleton: true, instantiate: false });
        // Find addons for this application
        this.addons = this.buildAddons(options.addons || []);
        this.router = this.container.lookup('app:router');
        this.logger = this.container.lookup('app:logger');
        // Generate config first, since the loading process may need it
        this.config = this.generateConfig();
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
        let appConfig = this.resolver.retrieve('config:environment') || lodash_1.constant({});
        let config = appConfig(this.environment);
        config.environment = this.environment;
        this.container.register('config:environment', config);
        this.addons.forEach((addon) => {
            let addonConfig = addon.resolver.retrieve('config:environment');
            if (addonConfig) {
                addonConfig(this.environment, config);
            }
        });
        return config;
    }
    /**
     * Assemble middleware and routes
     */
    compileRouter() {
        // Load addon middleware first
        this.addons.forEach((addon) => {
            let addonMiddleware = addon.resolver.retrieve('config:middleware') || lodash_1.noop;
            addonMiddleware(this.router, this);
        });
        // Then load app middleware
        let appMiddleware = this.resolver.retrieve('config:middleware') || lodash_1.noop;
        appMiddleware(this.router, this);
        // Load app routes first so they have precedence
        let appRoutes = this.resolver.retrieve('config:routes') || lodash_1.noop;
        appRoutes(this.router, this);
        // Load addon routes in reverse order so routing precedence matches addon load order
        this.addons.reverse().forEach((addon) => {
            let addonRoutes = addon.resolver.retrieve('config:routes') || lodash_1.noop;
            addonRoutes(this.router);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FidXJkaW5lL1Byb2plY3RzL2RlbmFsaS9tYWluLyIsInNvdXJjZXMiOlsibGliL3J1bnRpbWUvYXBwbGljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBSWdCO0FBQ2hCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLHVDQUFxQztBQUNyQyxtQ0FBNEI7QUFDNUIsOENBQXVDO0FBR3ZDLGtEQUEyQztBQUMzQywrQ0FBdUM7QUFDdkMsMENBQTBDO0FBQzFDLHFDQUFxQztBQUdyQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQTZCaEQ7Ozs7O0dBS0c7QUFDSCxpQkFBaUMsU0FBUSxlQUFLO0lBd0M1QyxZQUFZLE9BQTJCO1FBQ3JDLElBQUksU0FBUyxHQUFHLElBQUksbUJBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRW5CLHlDQUF5QztRQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVuRixtQ0FBbUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FB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S0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUM3QixVQUFVLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQzt3QkFDeEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQztpQkFBQSxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVEOzs7Ozs7T0FNRztJQUNHLGVBQWU7O1lBQ25CLElBQUksWUFBWSxHQUFrQixpQkFBTyxDQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckcsTUFBTSxlQUFJLENBQUMsWUFBWSxFQUFFLENBQU8sV0FBd0I7Z0JBQ3RELE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUQ7Ozs7O09BS0c7SUFDRyxRQUFROztZQUNaLE1BQU0sY0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxNQUFNLGNBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFPLEtBQUs7Z0JBQ3BDLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDO0tBQUE7Q0FFRjtBQXBORCw4QkFvTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB2YWx1ZXMsXG4gIGNvbnN0YW50LFxuICBub29wXG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCAqIGFzIGh0dHBzIGZyb20gJ2h0dHBzJztcbmltcG9ydCB7IGVhY2gsIGFsbCB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBBZGRvbiBmcm9tICcuL2FkZG9uJztcbmltcG9ydCB0b3Bzb3J0IGZyb20gJy4uL3V0aWxzL3RvcHNvcnQnO1xuaW1wb3J0IFJvdXRlciBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi4vbWV0YWwvY29udGFpbmVyJztcbmltcG9ydCBmaW5kUGx1Z2lucyBmcm9tICdmaW5kLXBsdWdpbnMnO1xuaW1wb3J0ICogYXMgdHJ5UmVxdWlyZSBmcm9tICd0cnktcmVxdWlyZSc7XG5pbXBvcnQgKiBhcyBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgeyBWZXJ0ZXggfSBmcm9tICcuLi91dGlscy90b3Bzb3J0JztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGVuYWxpOmFwcGxpY2F0aW9uJyk7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaW5zdGFudGlhdGluZyBhbiBhcHBsaWNhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uT3B0aW9ucyB7XG4gIHJvdXRlcj86IFJvdXRlcjtcbiAgYWRkb25zPzogc3RyaW5nW107XG4gIGNvbnRhaW5lcj86IENvbnRhaW5lcjtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIHBrZz86IGFueTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplcnMgYXJlIHJ1biBiZWZvcmUgdGhlIGFwcGxpY2F0aW9uIHN0YXJ0cyB1cC4gWW91IGFyZSBnaXZlbiB0aGUgYXBwbGljYXRpb24gaW5zdGFuY2UsXG4gKiBhbmQgaWYgeW91IG5lZWQgdG8gcGVyZm9ybSBhc3luYyBvcGVyYXRpb25zLCB5b3UgY2FuIHJldHVybiBhIFByb21pc2UuIFlvdSBjYW4gY29uZmlndXJlXG4gKiBpbml0aWFsaXplciBvcmRlciBieSBzcGVjaWZ5aW5nIHRoZSBuYW1lcyBvZiBpbml0aWFsaXplcnMgdGhhdCBzaG91bGQgY29tZSBiZWZvcmUgb3IgYWZ0ZXIgeW91clxuICogaW5pdGlhbGl6ZXIuXG4gKlxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5pdGlhbGl6ZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIGJlZm9yZT86IHN0cmluZyB8IHN0cmluZ1tdO1xuICBhZnRlcj86IHN0cmluZyB8IHN0cmluZ1tdO1xuICBpbml0aWFsaXplKGFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbik6IFByb21pc2U8YW55Pjtcbn1cblxuLyoqXG4gKiBBcHBsaWNhdGlvbiBpbnN0YW5jZXMgYXJlIHNwZWNpYWxpemVkIEFkZG9ucywgZGVzaWduZWQgdG8ga2ljayBvZmYgdGhlIGxvYWRpbmcsIG1vdW50aW5nLCBhbmRcbiAqIGxhdW5jaGluZyBzdGFnZXMgb2YgYm9vdGluZyB1cC5cbiAqXG4gKiBAcGFja2FnZSBydW50aW1lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcGxpY2F0aW9uIGV4dGVuZHMgQWRkb24ge1xuXG4gIC8qKlxuICAgKiBUaGUgUm91dGVyIGluc3RhbmNlIGZvciB0aGlzIEFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcm91dGVyOiBSb3V0ZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBhcHBsaWNhdGlvbiBjb25maWdcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBjb25maWc6IGFueTtcblxuICAvKipcbiAgICogVGhlIGNvbnRhaW5lciBpbnN0YW5jZSBmb3IgdGhlIGVudGlyZSBhcHBsaWNhdGlvblxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuXG4gIC8qKlxuICAgKiBUcmFjayBzZXJ2ZXJzIHRoYXQgbmVlZCB0byBkcmFpbiBiZWZvcmUgYXBwbGljYXRpb24gc2h1dGRvd25cbiAgICovXG4gIHByb3RlY3RlZCBkcmFpbmVyczogKCgpID0+IFByb21pc2U8dm9pZD4pW107XG5cbiAgLyoqXG4gICAqIFRoZSBsb2dnZXIgaW5zdGFuY2UgZm9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb25cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBsb2dnZXI6IExvZ2dlcjtcblxuICAvKipcbiAgICogTGlzdCBvZiBjaGlsZCBhZGRvbnMgZm9yIHRoaXMgYXBwIChvbmUtbGV2ZWwgZGVlcCBvbmx5LCBpLmUuIG5vIGFkZG9ucy1vZi1hZGRvbnMgYXJlIGluY2x1ZGVkKVxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIGFkZG9uczogQWRkb25bXTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBcHBsaWNhdGlvbk9wdGlvbnMpIHtcbiAgICBsZXQgY29udGFpbmVyID0gbmV3IENvbnRhaW5lcihvcHRpb25zLmRpcik7XG4gICAgc3VwZXIoT2JqZWN0LmFzc2lnbihvcHRpb25zLCB7IGNvbnRhaW5lciB9KSk7XG5cbiAgICB0aGlzLmRyYWluZXJzID0gW107XG5cbiAgICAvLyBTZXR1cCBzb21lIGhlbHBmdWwgY29udGFpbmVyIHNob3J0Y3V0c1xuICAgIHRoaXMuY29udGFpbmVyLnJlZ2lzdGVyKCdhcHA6bWFpbicsIHRoaXMsIHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSk7XG5cbiAgICAvLyBGaW5kIGFkZG9ucyBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgIHRoaXMuYWRkb25zID0gdGhpcy5idWlsZEFkZG9ucyhvcHRpb25zLmFkZG9ucyB8fCBbXSk7XG5cbiAgICB0aGlzLnJvdXRlciA9IHRoaXMuY29udGFpbmVyLmxvb2t1cCgnYXBwOnJvdXRlcicpO1xuICAgIHRoaXMubG9nZ2VyID0gdGhpcy5jb250YWluZXIubG9va3VwKCdhcHA6bG9nZ2VyJyk7XG5cbiAgICAvLyBHZW5lcmF0ZSBjb25maWcgZmlyc3QsIHNpbmNlIHRoZSBsb2FkaW5nIHByb2Nlc3MgbWF5IG5lZWQgaXRcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZ2VuZXJhdGVDb25maWcoKTtcblxuICAgIHRoaXMuY29tcGlsZVJvdXRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgZGlyZWN0b3J5IHRoYXQgY29udGFpbnMgYW4gYWRkb24sIGxvYWQgdGhhdCBhZGRvbiBhbmQgaW5zdGFudGlhdGUgaXQncyBBZGRvbiBjbGFzcy5cbiAgICovXG4gIHByaXZhdGUgYnVpbGRBZGRvbnMocHJlc2VlZGVkQWRkb25zOiBzdHJpbmdbXSk6IEFkZG9uW10ge1xuICAgIHJldHVybiBmaW5kUGx1Z2lucyh7XG4gICAgICBkaXI6IHRoaXMuZGlyLFxuICAgICAga2V5d29yZDogJ2RlbmFsaS1hZGRvbicsXG4gICAgICBpbmNsdWRlOiBwcmVzZWVkZWRBZGRvbnNcbiAgICB9KS5tYXAoKHBsdWdpbikgPT4ge1xuICAgICAgbGV0IEFkZG9uQ2xhc3M7XG4gICAgICB0cnkge1xuICAgICAgICBBZGRvbkNsYXNzID0gdHJ5UmVxdWlyZShwYXRoLmpvaW4ocGx1Z2luLmRpciwgJ2FwcCcsICdhZGRvbi5qcycpKTtcbiAgICAgICAgQWRkb25DbGFzcyA9IEFkZG9uQ2xhc3MgfHwgQWRkb247XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qIHRzbGludDpkaXNhYmxlOm5vLWNvbnNvbGUgKi9cbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgbG9hZGluZyBhbiBhZGRvbiBmcm9tICR7IHBsdWdpbi5kaXIgfTpgKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgLyogdHNsaW50OmVuYWJsZTpuby1jb25zb2xlICovXG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICBBZGRvbkNsYXNzID0gPHR5cGVvZiBBZGRvbj4oQWRkb25DbGFzcy5kZWZhdWx0IHx8IEFkZG9uQ2xhc3MpO1xuICAgICAgbGV0IGFkZG9uID0gbmV3IEFkZG9uQ2xhc3Moe1xuICAgICAgICBlbnZpcm9ubWVudDogdGhpcy5lbnZpcm9ubWVudCxcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLmNvbnRhaW5lcixcbiAgICAgICAgZGlyOiBwbHVnaW4uZGlyLFxuICAgICAgICBwa2c6IHBsdWdpbi5wa2dcbiAgICAgIH0pO1xuICAgICAgZGVidWcoYEFkZG9uOiAkeyBhZGRvbi5wa2cubmFtZSB9QCR7IGFkZG9uLnBrZy52ZXJzaW9uIH0gKCR7IGFkZG9uLmRpciB9KSBgKTtcbiAgICAgIHJldHVybiBhZGRvbjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIHRoZSBsb2FkZWQgZW52aXJvbm1lbnQgY29uZmlnIGZ1bmN0aW9ucywgYW5kIGV4ZWN1dGUgdGhlbS4gQXBwbGljYXRpb24gY29uZmlnIGlzIGV4ZWN1dGVkXG4gICAqIGZpcnN0LCBhbmQgdGhlIHJldHVybmVkIGNvbmZpZyBvYmplY3QgaXMgaGFuZGVkIG9mZiB0byB0aGUgYWRkb24gY29uZmlnIGZpbGVzLCB3aGljaCBhZGQgdGhlaXJcbiAgICogY29uZmlndXJhdGlvbiBieSBtdXRhdGluZyB0aGF0IHNhbWUgb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgcmVzdWx0aW5nIGZpbmFsIGNvbmZpZyBpcyBzdG9yZWQgYXQgYGFwcGxpY2F0aW9uLmNvbmZpZ2AsIGFuZCBpcyByZWdpc3RlcmVkIGluIHRoZVxuICAgKiBjb250YWluZXIgdW5kZXIgYGNvbmZpZzplbnZpcm9ubWVudGAuXG4gICAqXG4gICAqIFRoaXMgaXMgaW52b2tlZCBiZWZvcmUgdGhlIHJlc3Qgb2YgdGhlIGFkZG9ucyBhcmUgbG9hZGVkIGZvciAyIHJlYXNvbnM6XG4gICAqXG4gICAqIC0gVGhlIGNvbmZpZyB2YWx1ZXMgZm9yIHRoZSBhcHBsaWNhdGlvbiBjb3VsZCB0aGVvcmV0aWNhbGx5IGltcGFjdCB0aGUgYWRkb24gbG9hZGluZyBwcm9jZXNzXG4gICAqIC0gQWRkb25zIGFyZSBnaXZlbiBhIGNoYW5jZSB0byBtb2RpZnkgdGhlIGFwcGxpY2F0aW9uIGNvbmZpZywgc28gaXQgbXVzdCBiZSBsb2FkZWQgYmVmb3JlIHRoZXlcbiAgICogICBhcmUuXG4gICAqL1xuICBwcml2YXRlIGdlbmVyYXRlQ29uZmlnKCk6IGFueSB7XG4gICAgbGV0IGFwcENvbmZpZyA9IHRoaXMucmVzb2x2ZXIucmV0cmlldmUoJ2NvbmZpZzplbnZpcm9ubWVudCcpIHx8IGNvbnN0YW50KHt9KTtcbiAgICBsZXQgY29uZmlnID0gYXBwQ29uZmlnKHRoaXMuZW52aXJvbm1lbnQpO1xuICAgIGNvbmZpZy5lbnZpcm9ubWVudCA9IHRoaXMuZW52aXJvbm1lbnQ7XG4gICAgdGhpcy5jb250YWluZXIucmVnaXN0ZXIoJ2NvbmZpZzplbnZpcm9ubWVudCcsIGNvbmZpZyk7XG4gICAgdGhpcy5hZGRvbnMuZm9yRWFjaCgoYWRkb24pID0+IHtcbiAgICAgIGxldCBhZGRvbkNvbmZpZyA9IGFkZG9uLnJlc29sdmVyLnJldHJpZXZlKCdjb25maWc6ZW52aXJvbm1lbnQnKTtcbiAgICAgIGlmIChhZGRvbkNvbmZpZykge1xuICAgICAgICBhZGRvbkNvbmZpZyh0aGlzLmVudmlyb25tZW50LCBjb25maWcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICAvKipcbiAgICogQXNzZW1ibGUgbWlkZGxld2FyZSBhbmQgcm91dGVzXG4gICAqL1xuICBwcml2YXRlIGNvbXBpbGVSb3V0ZXIoKTogdm9pZCB7XG4gICAgLy8gTG9hZCBhZGRvbiBtaWRkbGV3YXJlIGZpcnN0XG4gICAgdGhpcy5hZGRvbnMuZm9yRWFjaCgoYWRkb24pID0+IHtcbiAgICAgIGxldCBhZGRvbk1pZGRsZXdhcmUgPSBhZGRvbi5yZXNvbHZlci5yZXRyaWV2ZSgnY29uZmlnOm1pZGRsZXdhcmUnKSB8fCBub29wO1xuICAgICAgYWRkb25NaWRkbGV3YXJlKHRoaXMucm91dGVyLCB0aGlzKTtcbiAgICB9KTtcbiAgICAvLyBUaGVuIGxvYWQgYXBwIG1pZGRsZXdhcmVcbiAgICBsZXQgYXBwTWlkZGxld2FyZSA9IHRoaXMucmVzb2x2ZXIucmV0cmlldmUoJ2NvbmZpZzptaWRkbGV3YXJlJykgfHwgbm9vcDtcbiAgICBhcHBNaWRkbGV3YXJlKHRoaXMucm91dGVyLCB0aGlzKTtcbiAgICAvLyBMb2FkIGFwcCByb3V0ZXMgZmlyc3Qgc28gdGhleSBoYXZlIHByZWNlZGVuY2VcbiAgICBsZXQgYXBwUm91dGVzID0gdGhpcy5yZXNvbHZlci5yZXRyaWV2ZSgnY29uZmlnOnJvdXRlcycpIHx8IG5vb3A7XG4gICAgYXBwUm91dGVzKHRoaXMucm91dGVyLCB0aGlzKTtcbiAgICAvLyBMb2FkIGFkZG9uIHJvdXRlcyBpbiByZXZlcnNlIG9yZGVyIHNvIHJvdXRpbmcgcHJlY2VkZW5jZSBtYXRjaGVzIGFkZG9uIGxvYWQgb3JkZXJcbiAgICB0aGlzLmFkZG9ucy5yZXZlcnNlKCkuZm9yRWFjaCgoYWRkb24pID0+IHtcbiAgICAgIGxldCBhZGRvblJvdXRlcyA9IGFkZG9uLnJlc29sdmVyLnJldHJpZXZlKCdjb25maWc6cm91dGVzJykgfHwgbm9vcDtcbiAgICAgIGFkZG9uUm91dGVzKHRoaXMucm91dGVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB0aGUgRGVuYWxpIHNlcnZlci4gUnVucyBhbGwgaW5pdGlhbGl6ZXJzLCBjcmVhdGVzIGFuIEhUVFAgc2VydmVyLCBhbmQgYmluZHMgdG8gdGhlIHBvcnRcbiAgICogdG8gaGFuZGxlIGluY29taW5nIEhUVFAgcmVxdWVzdHMuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgc3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHBvcnQgPSB0aGlzLmNvbmZpZy5zZXJ2ZXIucG9ydCB8fCAzMDAwO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnJ1bkluaXRpYWxpemVycygpO1xuICAgICAgaWYgKCF0aGlzLmNvbmZpZy5zZXJ2ZXIuZGV0YWNoZWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVTZXJ2ZXIocG9ydCk7XG4gICAgICAgIHRoaXMubG9nZ2VyLmluZm8oYCR7IHRoaXMucGtnLm5hbWUgfUAkeyB0aGlzLnBrZy52ZXJzaW9uIH0gc2VydmVyIHVwIG9uIHBvcnQgJHsgcG9ydCB9YCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdQcm9ibGVtIHN0YXJ0aW5nIGFwcCAuLi4nKTtcbiAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGVycm9yLnN0YWNrIHx8IGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBIVFRQIG9yIEhUVFBTIHNlcnZlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgb3Igbm90IFNTTCBjb25maWd1cmF0aW9uIGlzIHByZXNlbnQgaW5cbiAgICogY29uZmlnL2Vudmlyb25tZW50LmpzXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGNyZWF0ZVNlcnZlcihwb3J0OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGhhbmRsZXIgPSB0aGlzLnJvdXRlci5oYW5kbGUuYmluZCh0aGlzLnJvdXRlcik7XG4gICAgICBsZXQgc2VydmVyOiBhbnk7XG4gICAgICBpZiAodGhpcy5jb25maWcuc2VydmVyLnNzbCkge1xuICAgICAgICBzZXJ2ZXIgPSBodHRwcy5jcmVhdGVTZXJ2ZXIodGhpcy5jb25maWcuc2VydmVyLnNzbCwgaGFuZGxlcikubGlzdGVuKHBvcnQsIHJlc29sdmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoaGFuZGxlcikubGlzdGVuKHBvcnQsIHJlc29sdmUpO1xuICAgICAgfVxuICAgICAgdGhpcy5kcmFpbmVycy5wdXNoKGFzeW5jIGZ1bmN0aW9uIGRyYWluSHR0cCgpIHtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmVEcmFpbmVyKSA9PiB7XG4gICAgICAgICAgc2VydmVyLmNsb3NlKHJlc29sdmVEcmFpbmVyKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KHJlc29sdmVEcmFpbmVyLCA2MCAqIDEwMDApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2t1cCBhbGwgaW5pdGlhbGl6ZXJzIGFuZCBydW4gdGhlbSBpbiBzZXF1ZW5jZS4gSW5pdGlhbGl6ZXJzIGNhbiBvdmVycmlkZSB0aGUgZGVmYXVsdCBsb2FkXG4gICAqIG9yZGVyIGJ5IGluY2x1ZGluZyBgYmVmb3JlYCBvciBgYWZ0ZXJgIHByb3BlcnRpZXMgb24gdGhlIGV4cG9ydGVkIGNsYXNzICh0aGUgbmFtZSBvciBhcnJheSBvZlxuICAgKiBuYW1lcyBvZiB0aGUgb3RoZXIgaW5pdGlhbGl6ZXJzIGl0IHNob3VsZCBydW4gYmVmb3JlL2FmdGVyKS5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBhc3luYyBydW5Jbml0aWFsaXplcnMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGluaXRpYWxpemVycyA9IDxJbml0aWFsaXplcltdPnRvcHNvcnQoPFZlcnRleFtdPnZhbHVlcyh0aGlzLmNvbnRhaW5lci5sb29rdXBBbGwoJ2luaXRpYWxpemVyJykpKTtcbiAgICBhd2FpdCBlYWNoKGluaXRpYWxpemVycywgYXN5bmMgKGluaXRpYWxpemVyOiBJbml0aWFsaXplcikgPT4ge1xuICAgICAgYXdhaXQgaW5pdGlhbGl6ZXIuaW5pdGlhbGl6ZSh0aGlzKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaHV0ZG93biB0aGUgYXBwbGljYXRpb24gZ3JhY2VmdWxseSAoaS5lLiBjbG9zZSBleHRlcm5hbCBkYXRhYmFzZSBjb25uZWN0aW9ucywgZHJhaW4gaW4tZmxpZ2h0XG4gICAqIHJlcXVlc3RzLCBldGMpXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgYXN5bmMgc2h1dGRvd24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgYWxsKHRoaXMuZHJhaW5lcnMubWFwKChkcmFpbmVyKSA9PiBkcmFpbmVyKCkpKTtcbiAgICBhd2FpdCBhbGwodGhpcy5hZGRvbnMubWFwKGFzeW5jIChhZGRvbikgPT4ge1xuICAgICAgYXdhaXQgYWRkb24uc2h1dGRvd24odGhpcyk7XG4gICAgfSkpO1xuICB9XG5cbn1cbiJdfQ==