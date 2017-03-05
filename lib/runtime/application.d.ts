import Addon from './addon';
import Router from './router';
import Logger from './logger';
import Container from './container';
/**
 * Options for instantiating an application
 */
export interface ApplicationOptions {
    router?: Router;
    addons?: string[];
    container?: Container;
    environment: string;
    dir: string;
    logger?: Logger;
    pkg?: any;
}
/**
 * Initializers are run before the application starts up. You are given the application instance,
 * and if you need to perform async operations, you can return a Promise. You can configure
 * initializer order by specifying the names of initializers that should come before or after your
 * initializer.
 *
 * @since 0.1.0
 */
export interface Initializer {
    name: string;
    initialize(application: Application): Promise<any>;
    before?: string | string[];
    after?: string | string[];
}
/**
 * Application instances are specialized Addons, designed to kick off the loading, mounting, and
 * launching stages of booting up.
 *
 * @package runtime
 */
export default class Application extends Addon {
    /**
     * The Router instance for this Application.
     */
    router: Router;
    /**
     * The application config
     *
     * @since 0.1.0
     */
    config: any;
    /**
     * The container instance for the entire application
     *
     * @since 0.1.0
     */
    container: Container;
    protected drainers: (() => Promise<void>)[];
    constructor(options: ApplicationOptions);
    /**
     * Given a directory that contains an addon, load that addon and instantiate it's Addon class.
     */
    private buildAddons(preseededAddons);
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
    private generateConfig();
    /**
     * Assemble middleware and routes
     */
    private compileRouter();
    /**
     * Start the Denali server. Runs all initializers, creates an HTTP server, and binds to the port
     * to handle incoming HTTP requests.
     *
     * @since 0.1.0
     */
    start(): Promise<void>;
    /**
     * Creates an HTTP or HTTPS server, depending on whether or not SSL configuration is present in
     * config/environment.js
     */
    private createServer(port);
    /**
     * Lookup all initializers and run them in sequence. Initializers can override the default load
     * order by including `before` or `after` properties on the exported class (the name or array of
     * names of the other initializers it should run before/after).
     *
     * @since 0.1.0
     */
    runInitializers(): Promise<void>;
    /**
     * Shutdown the application gracefully (i.e. close external database connections, drain in-flight
     * requests, etc)
     *
     * @since 0.1.0
     */
    shutdown(): Promise<void>;
}
