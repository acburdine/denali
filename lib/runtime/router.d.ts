/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
import Route from './route';
import { Method } from './request';
import DenaliObject from '../metal/object';
import Container from '../metal/container';
export interface RoutesCache {
    get: Route[];
    post: Route[];
    put: Route[];
    patch: Route[];
    delete: Route[];
    head: Route[];
    options: Route[];
    [method: string]: Route[];
}
export interface MiddlewareFn {
    (req: IncomingMessage, res: ServerResponse, next: Function): void;
}
export interface ResourceOptions {
    /**
     * Should routes for related resources be generated? If true, routes will be generated following
     * the JSON-API recommendations for relationship URLs.
     *
     * @see {@link http://jsonapi.org/recommendations/#urls-relationships|JSON-API URL
     * Recommendatiosn}
     */
    related?: boolean;
    /**
     * A list of action types to _not_ generate.
     */
    except?: string[];
    /**
     * A list of action types that should be the _only_ ones generated.
     */
    only?: string[];
}
export interface RouterDSL {
    get(pattern: string, action: string, params: {}): void;
    post(pattern: string, action: string, params: {}): void;
    put(pattern: string, action: string, params: {}): void;
    patch(pattern: string, action: string, params: {}): void;
    delete(pattern: string, action: string, params: {}): void;
    head(pattern: string, action: string, params: {}): void;
    options(pattern: string, action: string, params: {}): void;
    resource(resourceName: string, options: ResourceOptions): void;
}
/**
 * The Router handles incoming requests, sending them to the appropriate action. It's also
 * responsible for defining routes in the first place - it's passed into the `config/routes.js`
 * file's exported function as the first argument.
 *
 * @package runtime
 * @since 0.1.0
 */
export default class Router extends DenaliObject implements RouterDSL {
    /**
     * The cache of available routes.
     */
    routes: RoutesCache;
    /**
     * The internal generic middleware handler, responsible for building and executing the middleware
     * chain.
     */
    private middleware;
    /**
     * The application container
     */
    container: Container;
    /**
     * Helper method to invoke the function exported by `config/routes.js` in the context of the
     * current router instance.
     *
     * @since 0.1.0
     */
    map(fn: (router: Router) => void): void;
    /**
     * Takes an incoming request and it's response from an HTTP server, prepares them, runs the
     * generic middleware first, hands them off to the appropriate action given the incoming URL, and
     * finally renders the response.
     */
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
    /**
     * Takes a request, response, and an error and hands off to the generic application level error
     * action.
     */
    private handleError(request, res, error);
    /**
     * Add the supplied middleware function to the generic middleware stack that runs prior to action
     * handling.
     *
     * @since 0.1.0
     */
    use(middleware: MiddlewareFn): void;
    /**
     * Add a route to the application. Maps a method and URL pattern to an action, with optional
     * additional parameters.
     *
     * URL patterns can use:
     *
     * * Dynamic segments, i.e. `'foo/:bar'` * Wildcard segments, i.e. `'foo/*bar'`, captures the rest
     * of the URL up
     *    to the querystring
     * * Optional groups, i.e. `'foo(/:bar)'`
     *
     * @since 0.1.0
     */
    route(method: Method, rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Returns the URL for a given action. You can supply a params object which
     * will be used to fill in the dynamic segements of the action's route (if
     * any).
     */
    urlFor(actionPath: string, data: any): string | boolean;
    /**
     * Shorthand for `this.route('get', ...arguments)`
     *
     * @since 0.1.0
     */
    get(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Shorthand for `this.route('post', ...arguments)`
     *
     * @since 0.1.0
     */
    post(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Shorthand for `this.route('put', ...arguments)`
     *
     * @since 0.1.0
     */
    put(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Shorthand for `this.route('patch', ...arguments)`
     *
     * @since 0.1.0
     */
    patch(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Shorthand for `this.route('delete', ...arguments)`
     *
     * @since 0.1.0
     */
    delete(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Shorthand for `this.route('head', ...arguments)`
     *
     * @since 0.1.0
     */
    head(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Shorthand for `this.route('options', ...arguments)`
     *
     * @since 0.1.0
     */
    options(rawPattern: string, actionPath: string, params?: any): void;
    /**
     * Create all the CRUD routes for a given resource and it's relationships. Based on the JSON-API
     * recommendations for URL design.
     *
     * The `options` argument lets you pass in `only` or `except` arrays to define exceptions. Action
     * names included in `only` will be the only ones generated, while names included in `except` will
     * be omitted.
     *
     * Set `options.related = false` to disable relationship routes.
     *
     * If no options are supplied, the following routes are generated (assuming a 'books' resource as
     * an example):
     *
     *   * `GET /books`
     *   * `POST /books`
     *   * `GET /books/:id`
     *   * `PATCH /books/:id`
     *   * `DELETE /books/:id`
     *   * `GET /books/:id/:relation`
     *   * `GET /books/:id/relationships/:relation`
     *   * `PATCH /books/:id/relationships/:relation`
     *   * `POST /books/:id/relationships/:relation`
     *   * `DELETE /books/:id/relationships/:relation`
     *
     * See http://jsonapi.org/recommendations/#urls for details.
     *
     * @since 0.1.0
     */
    resource(resourceName: string, options?: ResourceOptions): void;
    [methodName: string]: any;
    /**
     * Enables easy route namespacing. You can supply a method which takes a single argument that
     * works just like the `router` argument in your `config/routes.js`, or you can use the return
     * value just like the router.
     *
     *   router.namespace('users', (namespace) => {
     *     namespace.get('sign-in');
     *   });
     *   // or ...
     *   let namespace = router.namespace('users');
     *   namespace.get('sign-in');
     */
    namespace(namespace: string, fn: (wrapper: RouterDSL) => void): void;
}
