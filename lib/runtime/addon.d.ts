import DenaliObject from '../metal/object';
import Container from './container';
import Logger from './logger';
import Router from './router';
import Application from './application';
/**
 * Constructor options for Addon class
 *
 * @package runtime
 * @since 0.1.0
 */
export interface AddonOptions {
    environment: string;
    dir: string;
    container: Container;
    logger: Logger;
    pkg?: any;
}
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
export default class Addon extends DenaliObject {
    /**
     * The current environment for the app, i.e. 'development'
     *
     * @since 0.1.0
     */
    environment: string;
    /**
     * The root directory on the filesystem for this addon
     *
     * @since 0.1.0
     */
    dir: string;
    /**
     * The list of child addons that this addon contains
     */
    addons: Addon[];
    /**
     * The application logger instance
     *
     * @since 0.1.0
     */
    protected logger: Logger;
    /**
     * The package.json for this addon
     */
    pkg: any;
    /**
     * Internal cache of the configuration that is specific to this addon
     */
    _config: any;
    constructor(options: AddonOptions);
    /**
     * The app directory for this addon. Override to customize where the app directory is stored in
     * your addon.
     *
     * @since 0.1.0
     */
    readonly appDir: string;
    /**
     * The config directory for this addon. Override this to customize where the config files are
     * stored in your addon.
     *
     * @since 0.1.0
     */
    readonly configDir: string;
    /**
     * The name of the addon. Override this to use a different name than the package name for your
     * addon.
     *
     * @since 0.1.0
     */
    readonly name: string;
    /**
     * Load the config for this addon. The standard `config/environment.js` file is loaded by default.
     * `config/middleware.js` and `config/routes.js` are ignored. All other userland config files are
     * loaded into the container under their filenames.
     *
     * Config files are all .js files, so just the exported functions are loaded here. The functions
     * are run later, during application initialization, to generate the actual runtime configuration.
     */
    protected loadConfig(): any;
    /**
     * Load the addon's various assets. Loads child addons first, meaning that addon loading is
     * depth-first recursive.
     */
    load(): void;
    /**
     * Load the initializers for this addon. Initializers live in `config/initializers`.
     */
    protected loadInitializers(): void;
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
    protected loadMiddleware(): void;
    /**
     * The middleware factory for this addon.
     */
    _middleware: (router: Router, application: Application) => void;
    /**
     * Loads the routes for this addon. Routes are defined in `config/routes.js`. The file should
     * export a function that defines routes. See the Routing guide for details on how to define
     * routes.
     */
    protected loadRoutes(): void;
    /**
     * The routes factory for this addon.
     */
    _routes: (router: Router) => void;
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
    protected loadApp(): void;
    /**
     * Helper to load a file from the config directory
     */
    protected loadConfigFile(filename: string): any;
    /**
     * A hook to perform any shutdown actions necessary to gracefully exit the application, i.e. close
     * database/socket connections.
     *
     * @since 0.1.0
     */
    shutdown(application: Application): Promise<void>;
}
