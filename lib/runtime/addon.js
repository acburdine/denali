"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const findup = require("findup-sync");
const each_dir_1 = require("../utils/each-dir");
const is_directory_1 = require("is-directory");
const require_dir_1 = require("../utils/require-dir");
const tryRequire = require("try-require");
const stripExtension = require("strip-extension");
const lodash_1 = require("lodash");
const inflection_1 = require("inflection");
const createDebug = require("debug");
const object_1 = require("../metal/object");
const debug = createDebug('denali:runtime:addon');
/**
 * Addons are the fundamental unit of organization for Denali apps. The Application class is just a
 * specialized Addon, and each Addon can contain any amount of functionality.
 *
 * ## Structure
 *
 * Addons are packaged as npm modules for easy sharing. When Denali boots up, it searches your
 * node_modules for available Denali Addons (identified by the `denali-addon` keyword in the
 * package.json). Addons can be nested (i.e. an addon can itself depend on another addon).
 *
 * Each addon can be composed of one or several of the following parts:
 *
 *   * Config
 *   * Initializers
 *   * Middleware
 *   * App classes
 *   * Routes
 *
 * ## Load order
 *
 * After Denali discovers the available addons, it then merges them to form a unified application.
 * Addons higher in the dependency tree take precedence, and sibling addons can specify load order
 * via their package.json files:
 *
 *     "denali": {
 *       "before": [ "another-addon-name" ],
 *       "after": [ "cool-addon-name" ]
 *     }
 *
 * @package runtime
 * @since 0.1.0
 */
class Addon extends object_1.default {
    constructor(options) {
        super();
        this.environment = options.environment;
        this.dir = options.dir;
        this.container = options.container;
        this.logger = options.logger;
        this.pkg = options.pkg || tryRequire(findup('package.json', { cwd: this.dir }));
        this.container.register(`addon:${this.pkg.name}@${this.pkg.version}`, this);
        this._config = this.loadConfig();
    }
    /**
     * The app directory for this addon. Override to customize where the app directory is stored in
     * your addon.
     *
     * @since 0.1.0
     */
    get appDir() {
        return path.join(this.dir, 'app');
    }
    /**
     * The config directory for this addon. Override this to customize where the config files are
     * stored in your addon.
     *
     * @since 0.1.0
     */
    get configDir() {
        return path.join(this.dir, 'config');
    }
    /**
     * The name of the addon. Override this to use a different name than the package name for your
     * addon.
     *
     * @since 0.1.0
     */
    get name() {
        return (this.pkg && this.pkg.name) || 'anonymous-addon';
    }
    /**
     * Load the config for this addon. The standard `config/environment.js` file is loaded by default.
     * `config/middleware.js` and `config/routes.js` are ignored. All other userland config files are
     * loaded into the container under their filenames.
     *
     * Config files are all .js files, so just the exported functions are loaded here. The functions
     * are run later, during application initialization, to generate the actual runtime configuration.
     */
    loadConfig() {
        let config = this.loadConfigFile('environment') || function () {
            return {};
        };
        if (is_directory_1.sync(this.configDir)) {
            let allConfigFiles = require_dir_1.default(this.configDir, { recurse: false });
            let extraConfigFiles = lodash_1.omit(allConfigFiles, 'environment', 'middleware', 'routes');
            lodash_1.forEach(extraConfigFiles, (configModule, configFilename) => {
                let configModulename = stripExtension(configFilename);
                this.container.register(`config:${configModulename}`, configModule);
            });
        }
        return config;
    }
    /**
     * Load the addon's various assets. Loads child addons first, meaning that addon loading is
     * depth-first recursive.
     */
    load() {
        debug(`loading ${this.pkg.name}`);
        this.loadInitializers();
        this.loadMiddleware();
        this.loadApp();
        this.loadRoutes();
    }
    /**
     * Load the initializers for this addon. Initializers live in `config/initializers`.
     */
    loadInitializers() {
        let initializersDir = path.join(this.configDir, 'initializers');
        if (is_directory_1.sync(initializersDir)) {
            let initializers = require_dir_1.default(initializersDir);
            lodash_1.forEach(initializers, (initializer, name) => {
                this.container.register(`initializer:${name}`, initializer);
            });
        }
    }
    /**
     * Load the middleware for this addon. Middleware is specified in `config/middleware.js`. The file
     * should export a function that accepts the router as it's single argument. You can then attach
     * any middleware you'd like to that router, and it will execute before any route handling by
     * Denali.
     *
     * Typically this is useful to register global middleware, i.e. a CORS handler, cookie parser,
     * etc.
     *
     * If you want to run some logic before certain routes only, try using filters on your actions
     * instead.
     */
    loadMiddleware() {
        this._middleware = this.loadConfigFile('middleware') || lodash_1.noop;
    }
    /**
     * Loads the routes for this addon. Routes are defined in `config/routes.js`. The file should
     * export a function that defines routes. See the Routing guide for details on how to define
     * routes.
     */
    loadRoutes() {
        this._routes = this.loadConfigFile('routes') || lodash_1.noop;
    }
    /**
     * Load the app assets for this addon. These are the various classes that live under `app/`,
     * including actions, models, etc., as well as any custom class types.
     *
     * Files are loaded into the container under their folder's namespace, so `app/roles/admin.js`
     * would be registered as 'role:admin' in the container. Deeply nested folders become part of the
     * module name, i.e. `app/roles/employees/manager.js` becomes 'role:employees/manager'.
     *
     * Non-JS files are loaded as well, and their container names include the extension, so
     * `app/mailer/welcome.html` becomes `mail:welcome.html`.
     */
    loadApp() {
        debug(`loading app for ${this.pkg.name}`);
        if (fs.existsSync(this.appDir)) {
            each_dir_1.default(this.appDir, (dirname) => {
                debug(`loading ${dirname} for ${this.pkg.name}`);
                let dir = path.join(this.appDir, dirname);
                let type = inflection_1.singularize(dirname);
                glob.sync('**/*', { cwd: dir }).forEach((filepath) => {
                    let modulepath = stripExtension(filepath);
                    if (filepath.endsWith('.js')) {
                        let Class = require(path.join(dir, filepath));
                        Class = Class.default || Class;
                        this.container.register(`${type}:${modulepath}`, Class);
                    }
                    else if (filepath.endsWith('.json')) {
                        let mod = require(path.join(dir, filepath));
                        this.container.register(`${type}:${modulepath}`, mod.default || mod);
                    }
                });
            });
        }
    }
    /**
     * Helper to load a file from the config directory
     */
    loadConfigFile(filename) {
        let configModule = tryRequire(path.join(this.configDir, `${filename}.js`));
        return configModule && (configModule.default || configModule);
    }
    /**
     * A hook to perform any shutdown actions necessary to gracefully exit the application, i.e. close
     * database/socket connections.
     *
     * @since 0.1.0
     */
    shutdown(application) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // defaults to noop
        });
    }
}
exports.default = Addon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb24uanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2FjYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvZGVuYWxpLyIsInNvdXJjZXMiOlsibGliL3J1bnRpbWUvYWRkb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0Isc0NBQXVDO0FBQ3ZDLGdEQUF3QztBQUN4QywrQ0FBbUQ7QUFDbkQsc0RBQThDO0FBQzlDLDBDQUEwQztBQUMxQyxrREFBa0Q7QUFDbEQsbUNBSWlCO0FBQ2pCLDJDQUF5QztBQUN6QyxxQ0FBcUM7QUFDckMsNENBQTJDO0FBTTNDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBZ0JsRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStCRztBQUNILFdBQTJCLFNBQVEsZ0JBQVk7SUFzQzdDLFlBQVksT0FBcUI7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFN0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBVSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUssSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQUksTUFBTTtRQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBVyxTQUFTO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBVyxJQUFJO1FBQ2IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ08sVUFBVTtRQUNsQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJO1lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDWixDQUFDLENBQUM7UUFDRixFQUFFLENBQUMsQ0FBQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxjQUFjLEdBQUcscUJBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEUsSUFBSSxnQkFBZ0IsR0FBRyxhQUFJLENBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkYsZ0JBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFlBQVksRUFBRSxjQUFjO2dCQUNyRCxJQUFJLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVyxnQkFBaUIsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3hFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLElBQUk7UUFDVCxLQUFLLENBQUMsV0FBWSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUssRUFBRSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDTyxnQkFBZ0I7UUFDeEIsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hFLEVBQUUsQ0FBQyxDQUFDLG1CQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksWUFBWSxHQUFHLHFCQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0MsZ0JBQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSTtnQkFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZ0IsSUFBSyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDaEUsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ08sY0FBYztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksYUFBSSxDQUFDO0lBQy9ELENBQUM7SUFPRDs7OztPQUlHO0lBQ08sVUFBVTtRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksYUFBSSxDQUFDO0lBQ3ZELENBQUM7SUFPRDs7Ozs7Ozs7OztPQVVHO0lBQ08sT0FBTztRQUNmLEtBQUssQ0FBQyxtQkFBb0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixrQkFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPO2dCQUMzQixLQUFLLENBQUMsV0FBWSxPQUFRLFFBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLElBQUksSUFBSSxHQUFHLHdCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRWhDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUTtvQkFDL0MsSUFBSSxVQUFVLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMxQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7d0JBQzlDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBSSxJQUFLLElBQUssVUFBVyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzlELENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN0QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBSSxJQUFLLElBQUssVUFBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQztvQkFDM0UsQ0FBQztnQkFDSCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNPLGNBQWMsQ0FBQyxRQUFnQjtRQUN2QyxJQUFJLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUksUUFBUyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzdFLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNVLFFBQVEsQ0FBQyxXQUF3Qjs7WUFDNUMsbUJBQW1CO1FBQ3JCLENBQUM7S0FBQTtDQUVGO0FBdk5ELHdCQXVOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IGZpbmR1cCA9IHJlcXVpcmUoJ2ZpbmR1cC1zeW5jJyk7XG5pbXBvcnQgZWFjaERpciBmcm9tICcuLi91dGlscy9lYWNoLWRpcic7XG5pbXBvcnQgeyBzeW5jIGFzIGlzRGlyZWN0b3J5IH0gZnJvbSAnaXMtZGlyZWN0b3J5JztcbmltcG9ydCByZXF1aXJlRGlyIGZyb20gJy4uL3V0aWxzL3JlcXVpcmUtZGlyJztcbmltcG9ydCAqIGFzIHRyeVJlcXVpcmUgZnJvbSAndHJ5LXJlcXVpcmUnO1xuaW1wb3J0ICogYXMgc3RyaXBFeHRlbnNpb24gZnJvbSAnc3RyaXAtZXh0ZW5zaW9uJztcbmltcG9ydCB7XG4gIGZvckVhY2gsXG4gIG9taXQsXG4gIG5vb3BcbiB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBzaW5ndWxhcml6ZSB9IGZyb20gJ2luZmxlY3Rpb24nO1xuaW1wb3J0ICogYXMgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL2NvbnRhaW5lcic7XG5pbXBvcnQgTG9nZ2VyIGZyb20gJy4vbG9nZ2VyJztcbmltcG9ydCBSb3V0ZXIgZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IEFwcGxpY2F0aW9uIGZyb20gJy4vYXBwbGljYXRpb24nO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZW5hbGk6cnVudGltZTphZGRvbicpO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIG9wdGlvbnMgZm9yIEFkZG9uIGNsYXNzXG4gKlxuICogQHBhY2thZ2UgcnVudGltZVxuICogQHNpbmNlIDAuMS4wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWRkb25PcHRpb25zIHtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgZGlyOiBzdHJpbmc7XG4gIGNvbnRhaW5lcjogQ29udGFpbmVyO1xuICBsb2dnZXI6IExvZ2dlcjtcbiAgcGtnPzogYW55O1xufVxuXG4vKipcbiAqIEFkZG9ucyBhcmUgdGhlIGZ1bmRhbWVudGFsIHVuaXQgb2Ygb3JnYW5pemF0aW9uIGZvciBEZW5hbGkgYXBwcy4gVGhlIEFwcGxpY2F0aW9uIGNsYXNzIGlzIGp1c3QgYVxuICogc3BlY2lhbGl6ZWQgQWRkb24sIGFuZCBlYWNoIEFkZG9uIGNhbiBjb250YWluIGFueSBhbW91bnQgb2YgZnVuY3Rpb25hbGl0eS5cbiAqXG4gKiAjIyBTdHJ1Y3R1cmVcbiAqXG4gKiBBZGRvbnMgYXJlIHBhY2thZ2VkIGFzIG5wbSBtb2R1bGVzIGZvciBlYXN5IHNoYXJpbmcuIFdoZW4gRGVuYWxpIGJvb3RzIHVwLCBpdCBzZWFyY2hlcyB5b3VyXG4gKiBub2RlX21vZHVsZXMgZm9yIGF2YWlsYWJsZSBEZW5hbGkgQWRkb25zIChpZGVudGlmaWVkIGJ5IHRoZSBgZGVuYWxpLWFkZG9uYCBrZXl3b3JkIGluIHRoZVxuICogcGFja2FnZS5qc29uKS4gQWRkb25zIGNhbiBiZSBuZXN0ZWQgKGkuZS4gYW4gYWRkb24gY2FuIGl0c2VsZiBkZXBlbmQgb24gYW5vdGhlciBhZGRvbikuXG4gKlxuICogRWFjaCBhZGRvbiBjYW4gYmUgY29tcG9zZWQgb2Ygb25lIG9yIHNldmVyYWwgb2YgdGhlIGZvbGxvd2luZyBwYXJ0czpcbiAqXG4gKiAgICogQ29uZmlnXG4gKiAgICogSW5pdGlhbGl6ZXJzXG4gKiAgICogTWlkZGxld2FyZVxuICogICAqIEFwcCBjbGFzc2VzXG4gKiAgICogUm91dGVzXG4gKlxuICogIyMgTG9hZCBvcmRlclxuICpcbiAqIEFmdGVyIERlbmFsaSBkaXNjb3ZlcnMgdGhlIGF2YWlsYWJsZSBhZGRvbnMsIGl0IHRoZW4gbWVyZ2VzIHRoZW0gdG8gZm9ybSBhIHVuaWZpZWQgYXBwbGljYXRpb24uXG4gKiBBZGRvbnMgaGlnaGVyIGluIHRoZSBkZXBlbmRlbmN5IHRyZWUgdGFrZSBwcmVjZWRlbmNlLCBhbmQgc2libGluZyBhZGRvbnMgY2FuIHNwZWNpZnkgbG9hZCBvcmRlclxuICogdmlhIHRoZWlyIHBhY2thZ2UuanNvbiBmaWxlczpcbiAqXG4gKiAgICAgXCJkZW5hbGlcIjoge1xuICogICAgICAgXCJiZWZvcmVcIjogWyBcImFub3RoZXItYWRkb24tbmFtZVwiIF0sXG4gKiAgICAgICBcImFmdGVyXCI6IFsgXCJjb29sLWFkZG9uLW5hbWVcIiBdXG4gKiAgICAgfVxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBZGRvbiBleHRlbmRzIERlbmFsaU9iamVjdCB7XG5cbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGVudmlyb25tZW50IGZvciB0aGUgYXBwLCBpLmUuICdkZXZlbG9wbWVudCdcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZW52aXJvbm1lbnQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIHJvb3QgZGlyZWN0b3J5IG9uIHRoZSBmaWxlc3lzdGVtIGZvciB0aGlzIGFkZG9uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGRpcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbGlzdCBvZiBjaGlsZCBhZGRvbnMgdGhhdCB0aGlzIGFkZG9uIGNvbnRhaW5zXG4gICAqL1xuICBwdWJsaWMgYWRkb25zOiBBZGRvbltdO1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gbG9nZ2VyIGluc3RhbmNlXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHJvdGVjdGVkIGxvZ2dlcjogTG9nZ2VyO1xuXG4gIC8qKlxuICAgKiBUaGUgcGFja2FnZS5qc29uIGZvciB0aGlzIGFkZG9uXG4gICAqL1xuICBwdWJsaWMgcGtnOiBhbnk7XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGNhY2hlIG9mIHRoZSBjb25maWd1cmF0aW9uIHRoYXQgaXMgc3BlY2lmaWMgdG8gdGhpcyBhZGRvblxuICAgKi9cbiAgcHVibGljIF9jb25maWc6IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBBZGRvbk9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZW52aXJvbm1lbnQgPSBvcHRpb25zLmVudmlyb25tZW50O1xuICAgIHRoaXMuZGlyID0gb3B0aW9ucy5kaXI7XG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICB0aGlzLmxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuXG4gICAgdGhpcy5wa2cgPSBvcHRpb25zLnBrZyB8fCB0cnlSZXF1aXJlKGZpbmR1cCgncGFja2FnZS5qc29uJywgeyBjd2Q6IHRoaXMuZGlyIH0pKTtcbiAgICB0aGlzLmNvbnRhaW5lci5yZWdpc3RlcihgYWRkb246JHsgdGhpcy5wa2cubmFtZSB9QCR7IHRoaXMucGtnLnZlcnNpb24gfWAsIHRoaXMpO1xuICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMubG9hZENvbmZpZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBhcHAgZGlyZWN0b3J5IGZvciB0aGlzIGFkZG9uLiBPdmVycmlkZSB0byBjdXN0b21pemUgd2hlcmUgdGhlIGFwcCBkaXJlY3RvcnkgaXMgc3RvcmVkIGluXG4gICAqIHlvdXIgYWRkb24uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgZ2V0IGFwcERpcigpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5kaXIsICdhcHAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgY29uZmlnIGRpcmVjdG9yeSBmb3IgdGhpcyBhZGRvbi4gT3ZlcnJpZGUgdGhpcyB0byBjdXN0b21pemUgd2hlcmUgdGhlIGNvbmZpZyBmaWxlcyBhcmVcbiAgICogc3RvcmVkIGluIHlvdXIgYWRkb24uXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIGdldCBjb25maWdEaXIoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuZGlyLCAnY29uZmlnJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIGFkZG9uLiBPdmVycmlkZSB0aGlzIHRvIHVzZSBhIGRpZmZlcmVudCBuYW1lIHRoYW4gdGhlIHBhY2thZ2UgbmFtZSBmb3IgeW91clxuICAgKiBhZGRvbi5cbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZ2V0IG5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMucGtnICYmIHRoaXMucGtnLm5hbWUpIHx8ICdhbm9ueW1vdXMtYWRkb24nO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIGNvbmZpZyBmb3IgdGhpcyBhZGRvbi4gVGhlIHN0YW5kYXJkIGBjb25maWcvZW52aXJvbm1lbnQuanNgIGZpbGUgaXMgbG9hZGVkIGJ5IGRlZmF1bHQuXG4gICAqIGBjb25maWcvbWlkZGxld2FyZS5qc2AgYW5kIGBjb25maWcvcm91dGVzLmpzYCBhcmUgaWdub3JlZC4gQWxsIG90aGVyIHVzZXJsYW5kIGNvbmZpZyBmaWxlcyBhcmVcbiAgICogbG9hZGVkIGludG8gdGhlIGNvbnRhaW5lciB1bmRlciB0aGVpciBmaWxlbmFtZXMuXG4gICAqXG4gICAqIENvbmZpZyBmaWxlcyBhcmUgYWxsIC5qcyBmaWxlcywgc28ganVzdCB0aGUgZXhwb3J0ZWQgZnVuY3Rpb25zIGFyZSBsb2FkZWQgaGVyZS4gVGhlIGZ1bmN0aW9uc1xuICAgKiBhcmUgcnVuIGxhdGVyLCBkdXJpbmcgYXBwbGljYXRpb24gaW5pdGlhbGl6YXRpb24sIHRvIGdlbmVyYXRlIHRoZSBhY3R1YWwgcnVudGltZSBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxvYWRDb25maWcoKTogYW55IHtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5sb2FkQ29uZmlnRmlsZSgnZW52aXJvbm1lbnQnKSB8fCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9O1xuICAgIGlmIChpc0RpcmVjdG9yeSh0aGlzLmNvbmZpZ0RpcikpIHtcbiAgICAgIGxldCBhbGxDb25maWdGaWxlcyA9IHJlcXVpcmVEaXIodGhpcy5jb25maWdEaXIsIHsgcmVjdXJzZTogZmFsc2UgfSk7XG4gICAgICBsZXQgZXh0cmFDb25maWdGaWxlcyA9IG9taXQoYWxsQ29uZmlnRmlsZXMsICdlbnZpcm9ubWVudCcsICdtaWRkbGV3YXJlJywgJ3JvdXRlcycpO1xuICAgICAgZm9yRWFjaChleHRyYUNvbmZpZ0ZpbGVzLCAoY29uZmlnTW9kdWxlLCBjb25maWdGaWxlbmFtZSkgPT4ge1xuICAgICAgICBsZXQgY29uZmlnTW9kdWxlbmFtZSA9IHN0cmlwRXh0ZW5zaW9uKGNvbmZpZ0ZpbGVuYW1lKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIucmVnaXN0ZXIoYGNvbmZpZzokeyBjb25maWdNb2R1bGVuYW1lIH1gLCBjb25maWdNb2R1bGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0aGUgYWRkb24ncyB2YXJpb3VzIGFzc2V0cy4gTG9hZHMgY2hpbGQgYWRkb25zIGZpcnN0LCBtZWFuaW5nIHRoYXQgYWRkb24gbG9hZGluZyBpc1xuICAgKiBkZXB0aC1maXJzdCByZWN1cnNpdmUuXG4gICAqL1xuICBwdWJsaWMgbG9hZCgpOiB2b2lkIHtcbiAgICBkZWJ1ZyhgbG9hZGluZyAkeyB0aGlzLnBrZy5uYW1lIH1gKTtcbiAgICB0aGlzLmxvYWRJbml0aWFsaXplcnMoKTtcbiAgICB0aGlzLmxvYWRNaWRkbGV3YXJlKCk7XG4gICAgdGhpcy5sb2FkQXBwKCk7XG4gICAgdGhpcy5sb2FkUm91dGVzKCk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0aGUgaW5pdGlhbGl6ZXJzIGZvciB0aGlzIGFkZG9uLiBJbml0aWFsaXplcnMgbGl2ZSBpbiBgY29uZmlnL2luaXRpYWxpemVyc2AuXG4gICAqL1xuICBwcm90ZWN0ZWQgbG9hZEluaXRpYWxpemVycygpOiB2b2lkIHtcbiAgICBsZXQgaW5pdGlhbGl6ZXJzRGlyID0gcGF0aC5qb2luKHRoaXMuY29uZmlnRGlyLCAnaW5pdGlhbGl6ZXJzJyk7XG4gICAgaWYgKGlzRGlyZWN0b3J5KGluaXRpYWxpemVyc0RpcikpIHtcbiAgICAgIGxldCBpbml0aWFsaXplcnMgPSByZXF1aXJlRGlyKGluaXRpYWxpemVyc0Rpcik7XG4gICAgICBmb3JFYWNoKGluaXRpYWxpemVycywgKGluaXRpYWxpemVyLCBuYW1lKSA9PiB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLnJlZ2lzdGVyKGBpbml0aWFsaXplcjokeyBuYW1lIH1gLCBpbml0aWFsaXplcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZCB0aGUgbWlkZGxld2FyZSBmb3IgdGhpcyBhZGRvbi4gTWlkZGxld2FyZSBpcyBzcGVjaWZpZWQgaW4gYGNvbmZpZy9taWRkbGV3YXJlLmpzYC4gVGhlIGZpbGVcbiAgICogc2hvdWxkIGV4cG9ydCBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB0aGUgcm91dGVyIGFzIGl0J3Mgc2luZ2xlIGFyZ3VtZW50LiBZb3UgY2FuIHRoZW4gYXR0YWNoXG4gICAqIGFueSBtaWRkbGV3YXJlIHlvdSdkIGxpa2UgdG8gdGhhdCByb3V0ZXIsIGFuZCBpdCB3aWxsIGV4ZWN1dGUgYmVmb3JlIGFueSByb3V0ZSBoYW5kbGluZyBieVxuICAgKiBEZW5hbGkuXG4gICAqXG4gICAqIFR5cGljYWxseSB0aGlzIGlzIHVzZWZ1bCB0byByZWdpc3RlciBnbG9iYWwgbWlkZGxld2FyZSwgaS5lLiBhIENPUlMgaGFuZGxlciwgY29va2llIHBhcnNlcixcbiAgICogZXRjLlxuICAgKlxuICAgKiBJZiB5b3Ugd2FudCB0byBydW4gc29tZSBsb2dpYyBiZWZvcmUgY2VydGFpbiByb3V0ZXMgb25seSwgdHJ5IHVzaW5nIGZpbHRlcnMgb24geW91ciBhY3Rpb25zXG4gICAqIGluc3RlYWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgbG9hZE1pZGRsZXdhcmUoKTogdm9pZCB7XG4gICAgdGhpcy5fbWlkZGxld2FyZSA9IHRoaXMubG9hZENvbmZpZ0ZpbGUoJ21pZGRsZXdhcmUnKSB8fCBub29wO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtaWRkbGV3YXJlIGZhY3RvcnkgZm9yIHRoaXMgYWRkb24uXG4gICAqL1xuICBwdWJsaWMgX21pZGRsZXdhcmU6IChyb3V0ZXI6IFJvdXRlciwgYXBwbGljYXRpb246IEFwcGxpY2F0aW9uKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBMb2FkcyB0aGUgcm91dGVzIGZvciB0aGlzIGFkZG9uLiBSb3V0ZXMgYXJlIGRlZmluZWQgaW4gYGNvbmZpZy9yb3V0ZXMuanNgLiBUaGUgZmlsZSBzaG91bGRcbiAgICogZXhwb3J0IGEgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIHJvdXRlcy4gU2VlIHRoZSBSb3V0aW5nIGd1aWRlIGZvciBkZXRhaWxzIG9uIGhvdyB0byBkZWZpbmVcbiAgICogcm91dGVzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxvYWRSb3V0ZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fcm91dGVzID0gdGhpcy5sb2FkQ29uZmlnRmlsZSgncm91dGVzJykgfHwgbm9vcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgcm91dGVzIGZhY3RvcnkgZm9yIHRoaXMgYWRkb24uXG4gICAqL1xuICBwdWJsaWMgX3JvdXRlczogKHJvdXRlcjogUm91dGVyKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBMb2FkIHRoZSBhcHAgYXNzZXRzIGZvciB0aGlzIGFkZG9uLiBUaGVzZSBhcmUgdGhlIHZhcmlvdXMgY2xhc3NlcyB0aGF0IGxpdmUgdW5kZXIgYGFwcC9gLFxuICAgKiBpbmNsdWRpbmcgYWN0aW9ucywgbW9kZWxzLCBldGMuLCBhcyB3ZWxsIGFzIGFueSBjdXN0b20gY2xhc3MgdHlwZXMuXG4gICAqXG4gICAqIEZpbGVzIGFyZSBsb2FkZWQgaW50byB0aGUgY29udGFpbmVyIHVuZGVyIHRoZWlyIGZvbGRlcidzIG5hbWVzcGFjZSwgc28gYGFwcC9yb2xlcy9hZG1pbi5qc2BcbiAgICogd291bGQgYmUgcmVnaXN0ZXJlZCBhcyAncm9sZTphZG1pbicgaW4gdGhlIGNvbnRhaW5lci4gRGVlcGx5IG5lc3RlZCBmb2xkZXJzIGJlY29tZSBwYXJ0IG9mIHRoZVxuICAgKiBtb2R1bGUgbmFtZSwgaS5lLiBgYXBwL3JvbGVzL2VtcGxveWVlcy9tYW5hZ2VyLmpzYCBiZWNvbWVzICdyb2xlOmVtcGxveWVlcy9tYW5hZ2VyJy5cbiAgICpcbiAgICogTm9uLUpTIGZpbGVzIGFyZSBsb2FkZWQgYXMgd2VsbCwgYW5kIHRoZWlyIGNvbnRhaW5lciBuYW1lcyBpbmNsdWRlIHRoZSBleHRlbnNpb24sIHNvXG4gICAqIGBhcHAvbWFpbGVyL3dlbGNvbWUuaHRtbGAgYmVjb21lcyBgbWFpbDp3ZWxjb21lLmh0bWxgLlxuICAgKi9cbiAgcHJvdGVjdGVkIGxvYWRBcHAoKTogdm9pZCB7XG4gICAgZGVidWcoYGxvYWRpbmcgYXBwIGZvciAkeyB0aGlzLnBrZy5uYW1lIH1gKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyh0aGlzLmFwcERpcikpIHtcbiAgICAgIGVhY2hEaXIodGhpcy5hcHBEaXIsIChkaXJuYW1lKSA9PiB7XG4gICAgICAgIGRlYnVnKGBsb2FkaW5nICR7IGRpcm5hbWUgfSBmb3IgJHsgdGhpcy5wa2cubmFtZSB9YCk7XG4gICAgICAgIGxldCBkaXIgPSBwYXRoLmpvaW4odGhpcy5hcHBEaXIsIGRpcm5hbWUpO1xuICAgICAgICBsZXQgdHlwZSA9IHNpbmd1bGFyaXplKGRpcm5hbWUpO1xuXG4gICAgICAgIGdsb2Iuc3luYygnKiovKicsIHsgY3dkOiBkaXIgfSkuZm9yRWFjaCgoZmlsZXBhdGgpID0+IHtcbiAgICAgICAgICBsZXQgbW9kdWxlcGF0aCA9IHN0cmlwRXh0ZW5zaW9uKGZpbGVwYXRoKTtcbiAgICAgICAgICBpZiAoZmlsZXBhdGguZW5kc1dpdGgoJy5qcycpKSB7XG4gICAgICAgICAgICBsZXQgQ2xhc3MgPSByZXF1aXJlKHBhdGguam9pbihkaXIsIGZpbGVwYXRoKSk7XG4gICAgICAgICAgICBDbGFzcyA9IENsYXNzLmRlZmF1bHQgfHwgQ2xhc3M7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5yZWdpc3RlcihgJHsgdHlwZSB9OiR7IG1vZHVsZXBhdGggfWAsIENsYXNzKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGZpbGVwYXRoLmVuZHNXaXRoKCcuanNvbicpKSB7XG4gICAgICAgICAgICBsZXQgbW9kID0gcmVxdWlyZShwYXRoLmpvaW4oZGlyLCBmaWxlcGF0aCkpO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIucmVnaXN0ZXIoYCR7IHR5cGUgfTokeyBtb2R1bGVwYXRoIH1gLCBtb2QuZGVmYXVsdCB8fCBtb2QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIHRvIGxvYWQgYSBmaWxlIGZyb20gdGhlIGNvbmZpZyBkaXJlY3RvcnlcbiAgICovXG4gIHByb3RlY3RlZCBsb2FkQ29uZmlnRmlsZShmaWxlbmFtZTogc3RyaW5nKTogYW55IHtcbiAgICBsZXQgY29uZmlnTW9kdWxlID0gdHJ5UmVxdWlyZShwYXRoLmpvaW4odGhpcy5jb25maWdEaXIsIGAkeyBmaWxlbmFtZSB9LmpzYCkpO1xuICAgIHJldHVybiBjb25maWdNb2R1bGUgJiYgKGNvbmZpZ01vZHVsZS5kZWZhdWx0IHx8IGNvbmZpZ01vZHVsZSk7XG4gIH1cblxuICAvKipcbiAgICogQSBob29rIHRvIHBlcmZvcm0gYW55IHNodXRkb3duIGFjdGlvbnMgbmVjZXNzYXJ5IHRvIGdyYWNlZnVsbHkgZXhpdCB0aGUgYXBwbGljYXRpb24sIGkuZS4gY2xvc2VcbiAgICogZGF0YWJhc2Uvc29ja2V0IGNvbm5lY3Rpb25zLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzaHV0ZG93bihhcHBsaWNhdGlvbjogQXBwbGljYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBkZWZhdWx0cyB0byBub29wXG4gIH1cblxufVxuIl19