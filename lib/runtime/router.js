"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ware = require("ware");
const inflection_1 = require("inflection");
const bluebird_1 = require("bluebird");
const typeis = require("type-is");
const createDebug = require("debug");
const errors_1 = require("./errors");
const route_1 = require("./route");
const request_1 = require("./request");
const ensureArray = require("arrify");
const object_1 = require("../metal/object");
const lodash_1 = require("lodash");
const debug = createDebug('denali:router');
;
/**
 * The Router handles incoming requests, sending them to the appropriate action. It's also
 * responsible for defining routes in the first place - it's passed into the `config/routes.js`
 * file's exported function as the first argument.
 *
 * @package runtime
 * @since 0.1.0
 */
class Router extends object_1.default {
    constructor(options) {
        super();
        /**
         * The cache of available routes.
         */
        this.routes = {
            get: [],
            post: [],
            put: [],
            patch: [],
            delete: [],
            head: [],
            options: []
        };
        /**
         * The internal generic middleware handler, responsible for building and executing the middleware
         * chain.
         */
        this.middleware = ware();
        this.container = options.container;
        this.logger = options.logger;
    }
    /**
     * Helper method to invoke the function exported by `config/routes.js` in the context of the
     * current router instance.
     *
     * @since 0.1.0
     */
    map(fn) {
        debug('mapping routes');
        fn(this);
    }
    /**
     * Takes an incoming request and it's response from an HTTP server, prepares them, runs the
     * generic middleware first, hands them off to the appropriate action given the incoming URL, and
     * finally renders the response.
     */
    handle(req, res) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let response;
            let request = new request_1.default(req);
            try {
                debug(`[${request.id}]: ${request.method.toUpperCase()} ${request.path}`);
                yield bluebird_1.fromNode((cb) => this.middleware.run(request, res, cb));
                debug(`[${request.id}]: routing request`);
                let routes = this.routes[request.method];
                for (let i = 0; i < routes.length; i += 1) {
                    request.params = routes[i].match(request.path);
                    if (request.params) {
                        request.route = routes[i];
                        break;
                    }
                }
                if (!request.route) {
                    debug(`[${request.id}]: ${request.method} ${request.path} did match any route. Available ${request.method} routes:\n${routes.map((r) => r.spec).join(',\n')}`);
                    throw new errors_1.default.NotFound('Route not recognized');
                }
                let action = new request.route.action({
                    request,
                    logger: this.logger,
                    container: this.container
                });
                let serializer;
                if (action.serializer != null) {
                    if (typeof action.serializer === 'string') {
                        serializer = this.container.lookup(`serializer:${action.serializer}`);
                    }
                    else if (action.serializer === false) {
                        serializer = null;
                    }
                    else {
                        serializer = action.serializer;
                    }
                }
                else {
                    serializer = this.container.lookup('serializer:application');
                }
                if (typeis.hasBody(request) && request.body && serializer) {
                    debug(`[${request.id}]: parsing request body`);
                    request.body = serializer.parse(request.body);
                }
                debug(`[${request.id}]: running action`);
                response = yield action.run();
            }
            catch (error) {
                response = yield this.handleError(request, res, error);
            }
            debug(`[${request.id}]: setting response status code to ${response.status}`);
            res.statusCode = response.status;
            res.setHeader('X-Request-Id', request.id);
            if (response.body) {
                debug(`[${request.id}]: writing response body`);
                res.setHeader('Content-type', response.contentType);
                if (this.container.config.environment !== 'production') {
                    res.write(JSON.stringify(response.body, null, 2));
                }
                else {
                    res.write(JSON.stringify(response.body));
                }
            }
            res.end();
            debug(`[${request.id}]: response finished`);
        });
    }
    /**
     * Takes a request, response, and an error and hands off to the generic application level error
     * action.
     */
    handleError(request, res, error) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            request.params = request.params || {};
            request.params.error = error;
            let ErrorAction = this.container.lookup('action:error');
            let errorAction = new ErrorAction({
                request,
                response: res,
                logger: this.logger,
                container: this.container
            });
            return errorAction.run();
        });
    }
    /**
     * Add the supplied middleware function to the generic middleware stack that runs prior to action
     * handling.
     *
     * @since 0.1.0
     */
    use(middleware) {
        this.middleware.use(middleware);
    }
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
    route(method, rawPattern, actionPath, params) {
        // Ensure leading slashes
        let normalizedPattern = rawPattern.replace(/^([^/])/, '/$1');
        // Remove hardcoded trailing slashes
        normalizedPattern = normalizedPattern.replace(/\/$/, '');
        // Ensure optional trailing slashes
        normalizedPattern = `${normalizedPattern}(/)`;
        // Add route
        let ActionClass = this.container.lookup(`action:${actionPath}`);
        let route = new route_1.default(normalizedPattern);
        route.actionPath = actionPath;
        route.action = ActionClass;
        route.additionalParams = params;
        if (!route.action) {
            throw new Error(`No action found at ${actionPath}`);
        }
        this.routes[method].push(route);
    }
    /**
     * Returns the URL for a given action. You can supply a params object which
     * will be used to fill in the dynamic segements of the action's route (if
     * any).
     */
    urlFor(action, data) {
        if (typeof action === 'string') {
            action = this.container.lookup(`action:${action}`);
        }
        if (!action) {
            return false;
        }
        let route;
        lodash_1.forEach(this.routes, (routes) => {
            route = lodash_1.find(routes, { action: action });
            return !route; // kill the iterator if we found the match
        });
        return route && route.reverse(data);
    }
    /**
     * Shorthand for `this.route('get', ...arguments)`
     *
     * @since 0.1.0
     */
    get(rawPattern, actionPath, params) {
        this.route('get', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('post', ...arguments)`
     *
     * @since 0.1.0
     */
    post(rawPattern, actionPath, params) {
        this.route('post', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('put', ...arguments)`
     *
     * @since 0.1.0
     */
    put(rawPattern, actionPath, params) {
        this.route('put', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('patch', ...arguments)`
     *
     * @since 0.1.0
     */
    patch(rawPattern, actionPath, params) {
        this.route('patch', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('delete', ...arguments)`
     *
     * @since 0.1.0
     */
    delete(rawPattern, actionPath, params) {
        this.route('delete', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('head', ...arguments)`
     *
     * @since 0.1.0
     */
    head(rawPattern, actionPath, params) {
        this.route('head', rawPattern, actionPath, params);
    }
    /**
     * Shorthand for `this.route('options', ...arguments)`
     *
     * @since 0.1.0
     */
    options(rawPattern, actionPath, params) {
        this.route('options', rawPattern, actionPath, params);
    }
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
    resource(resourceName, options = {}) {
        let plural = inflection_1.pluralize(resourceName);
        let collection = `/${plural}`;
        let resource = `${collection}/:id`;
        let relationship = `${resource}/relationships/:relation`;
        let related = `${resource}/:relation`;
        if (!options.related) {
            options.except = ['related', 'fetch-related', 'replace-related', 'add-related', 'remove-related'].concat(options.except);
        }
        let hasWhitelist = Boolean(options.only);
        options.only = ensureArray(options.only);
        options.except = ensureArray(options.except);
        /**
         * Check if the given action should be generated based on the whitelist/blacklist options
         */
        function include(action) {
            let whitelisted = options.only.includes(action);
            let blacklisted = options.except.includes(action);
            return !blacklisted && ((hasWhitelist && whitelisted) ||
                !hasWhitelist);
        }
        [
            ['list', 'get', collection],
            ['create', 'post', collection],
            ['show', 'get', resource],
            ['update', 'patch', resource],
            ['destroy', 'delete', resource],
            ['related', 'get', related],
            ['fetch-related', 'get', relationship],
            ['replace-related', 'patch', relationship],
            ['add-related', 'post', relationship],
            ['remove-related', 'delete', relationship]
        ].forEach((routeTemplate) => {
            let [action, method, url] = routeTemplate;
            if (include(action)) {
                let routeMethod = this[method];
                routeMethod.call(this, url, `${plural}/${action}`);
            }
        });
    }
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
    namespace(namespace, fn) {
        let router = this;
        if (namespace.endsWith('/')) {
            namespace = namespace.slice(0, namespace.length - 1);
        }
        // tslint:disable:completed-docs
        let wrapper = {
            get(pattern, actionPath, params) {
                router.route('get', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            post(pattern, actionPath, params) {
                router.route('post', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            put(pattern, actionPath, params) {
                router.route('put', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            patch(pattern, actionPath, params) {
                router.route('patch', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            delete(pattern, actionPath, params) {
                router.route('delete', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            head(pattern, actionPath, params) {
                router.route('head', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            options(pattern, actionPath, params) {
                router.route('options', `${namespace}/${pattern.replace(/^\//, '')}`, actionPath, params);
            },
            resource(resourceName, options) {
                router.resource.call(this, resourceName, options);
            }
        };
        // tslint:enable:completed-docs
        if (fn) {
            fn(wrapper);
        }
    }
}
exports.default = Router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9ydW50aW1lL3JvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBNkI7QUFFN0IsMkNBQXVDO0FBQ3ZDLHVDQUFvQztBQUNwQyxrQ0FBa0M7QUFDbEMscUNBQXFDO0FBQ3JDLHFDQUE4QjtBQUM5QixtQ0FBNEI7QUFDNUIsdUNBQTRDO0FBQzVDLHNDQUF1QztBQUN2Qyw0Q0FBMkM7QUFLM0MsbUNBR2lCO0FBRWpCLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQVcxQyxDQUFDO0FBb0NGOzs7Ozs7O0dBT0c7QUFDSCxZQUE0QixTQUFRLGdCQUFZO0lBK0I5QyxZQUFZLE9BQWlEO1FBQzNELEtBQUssRUFBRSxDQUFDO1FBOUJWOztXQUVHO1FBQ0ksV0FBTSxHQUFnQjtZQUMzQixHQUFHLEVBQUUsRUFBRTtZQUNQLElBQUksRUFBRSxFQUFFO1lBQ1IsR0FBRyxFQUFFLEVBQUU7WUFDUCxLQUFLLEVBQUUsRUFBRTtZQUNULE1BQU0sRUFBRSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEVBQUU7WUFDUixPQUFPLEVBQUUsRUFBRTtTQUNaLENBQUM7UUFFRjs7O1dBR0c7UUFDSyxlQUFVLEdBQW9CLElBQUssRUFBRSxDQUFDO1FBYzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksR0FBRyxDQUFDLEVBQTRCO1FBQ3JDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRDs7OztPQUlHO0lBQ1UsTUFBTSxDQUFDLEdBQW9CLEVBQUUs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RSxPQUFPLENBQUMsQ0FBQztZQUNwRCxDQUFDO1NBQ0YsQ0FBQztRQUNGLCtCQUErQjtRQUMvQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7Q0FFRjtBQTNZRCx5QkEyWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyB3YXJlIGZyb20gJ3dhcmUnO1xuaW1wb3J0IHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgcGx1cmFsaXplIH0gZnJvbSAnaW5mbGVjdGlvbic7XG5pbXBvcnQgeyBmcm9tTm9kZSB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCAqIGFzIHR5cGVpcyBmcm9tICd0eXBlLWlzJztcbmltcG9ydCAqIGFzIGNyZWF0ZURlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBFcnJvcnMgZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IFJvdXRlIGZyb20gJy4vcm91dGUnO1xuaW1wb3J0IFJlcXVlc3QsIHsgTWV0aG9kIH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCBlbnN1cmVBcnJheSA9IHJlcXVpcmUoJ2FycmlmeScpO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuLi9tZXRhbC9vYmplY3QnO1xuaW1wb3J0IExvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vY29udGFpbmVyJztcbmltcG9ydCBBY3Rpb24gZnJvbSAnLi9hY3Rpb24nO1xuaW1wb3J0IFNlcmlhbGl6ZXIgZnJvbSAnLi4vZGF0YS9zZXJpYWxpemVyJztcbmltcG9ydCB7XG4gIGZpbmQsXG4gIGZvckVhY2hcbiB9IGZyb20gJ2xvZGFzaCc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RlbmFsaTpyb3V0ZXInKTtcblxuZXhwb3J0IGludGVyZmFjZSBSb3V0ZXNDYWNoZSB7XG4gIGdldDogUm91dGVbXTtcbiAgcG9zdDogUm91dGVbXTtcbiAgcHV0OiBSb3V0ZVtdO1xuICBwYXRjaDogUm91dGVbXTtcbiAgZGVsZXRlOiBSb3V0ZVtdO1xuICBoZWFkOiBSb3V0ZVtdO1xuICBvcHRpb25zOiBSb3V0ZVtdO1xuICBbbWV0aG9kOiBzdHJpbmddOiBSb3V0ZVtdO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBNaWRkbGV3YXJlRm4ge1xuICAocmVxOiBJbmNvbWluZ01lc3NhZ2UsIHJlczogU2VydmVyUmVzcG9uc2UsIG5leHQ6IEZ1bmN0aW9uKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXNvdXJjZU9wdGlvbnMge1xuICAvKipcbiAgICogU2hvdWxkIHJvdXRlcyBmb3IgcmVsYXRlZCByZXNvdXJjZXMgYmUgZ2VuZXJhdGVkPyBJZiB0cnVlLCByb3V0ZXMgd2lsbCBiZSBnZW5lcmF0ZWQgZm9sbG93aW5nXG4gICAqIHRoZSBKU09OLUFQSSByZWNvbW1lbmRhdGlvbnMgZm9yIHJlbGF0aW9uc2hpcCBVUkxzLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBodHRwOi8vanNvbmFwaS5vcmcvcmVjb21tZW5kYXRpb25zLyN1cmxzLXJlbGF0aW9uc2hpcHN8SlNPTi1BUEkgVVJMXG4gICAqIFJlY29tbWVuZGF0aW9zbn1cbiAgICovXG4gIHJlbGF0ZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogQSBsaXN0IG9mIGFjdGlvbiB0eXBlcyB0byBfbm90XyBnZW5lcmF0ZS5cbiAgICovXG4gIGV4Y2VwdD86IHN0cmluZ1tdO1xuICAvKipcbiAgICogQSBsaXN0IG9mIGFjdGlvbiB0eXBlcyB0aGF0IHNob3VsZCBiZSB0aGUgX29ubHlfIG9uZXMgZ2VuZXJhdGVkLlxuICAgKi9cbiAgb25seT86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJvdXRlckRTTCB7XG4gIGdldChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgcG9zdChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgcHV0KHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtczoge30pOiB2b2lkO1xuICBwYXRjaChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nLCBwYXJhbXM6IHt9KTogdm9pZDtcbiAgZGVsZXRlKHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtczoge30pOiB2b2lkO1xuICBoZWFkKHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtczoge30pOiB2b2lkO1xuICBvcHRpb25zKHBhdHRlcm46IHN0cmluZywgYWN0aW9uOiBzdHJpbmcsIHBhcmFtczoge30pOiB2b2lkO1xuICByZXNvdXJjZShyZXNvdXJjZU5hbWU6IHN0cmluZywgb3B0aW9uczogUmVzb3VyY2VPcHRpb25zKTogdm9pZDtcbn1cblxuLyoqXG4gKiBUaGUgUm91dGVyIGhhbmRsZXMgaW5jb21pbmcgcmVxdWVzdHMsIHNlbmRpbmcgdGhlbSB0byB0aGUgYXBwcm9wcmlhdGUgYWN0aW9uLiBJdCdzIGFsc29cbiAqIHJlc3BvbnNpYmxlIGZvciBkZWZpbmluZyByb3V0ZXMgaW4gdGhlIGZpcnN0IHBsYWNlIC0gaXQncyBwYXNzZWQgaW50byB0aGUgYGNvbmZpZy9yb3V0ZXMuanNgXG4gKiBmaWxlJ3MgZXhwb3J0ZWQgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICpcbiAqIEBwYWNrYWdlIHJ1bnRpbWVcbiAqIEBzaW5jZSAwLjEuMFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBEZW5hbGlPYmplY3QgaW1wbGVtZW50cyBSb3V0ZXJEU0wge1xuXG4gIC8qKlxuICAgKiBUaGUgY2FjaGUgb2YgYXZhaWxhYmxlIHJvdXRlcy5cbiAgICovXG4gIHB1YmxpYyByb3V0ZXM6IFJvdXRlc0NhY2hlID0ge1xuICAgIGdldDogW10sXG4gICAgcG9zdDogW10sXG4gICAgcHV0OiBbXSxcbiAgICBwYXRjaDogW10sXG4gICAgZGVsZXRlOiBbXSxcbiAgICBoZWFkOiBbXSxcbiAgICBvcHRpb25zOiBbXVxuICB9O1xuXG4gIC8qKlxuICAgKiBUaGUgaW50ZXJuYWwgZ2VuZXJpYyBtaWRkbGV3YXJlIGhhbmRsZXIsIHJlc3BvbnNpYmxlIGZvciBidWlsZGluZyBhbmQgZXhlY3V0aW5nIHRoZSBtaWRkbGV3YXJlXG4gICAqIGNoYWluLlxuICAgKi9cbiAgcHJpdmF0ZSBtaWRkbGV3YXJlOiBhbnkgPSAoPCgpID0+IGFueT53YXJlKSgpO1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gbG9nZ2VyIGluc3RhbmNlXG4gICAqL1xuICBwcml2YXRlIGxvZ2dlcjogTG9nZ2VyO1xuXG4gIC8qKlxuICAgKiBUaGUgYXBwbGljYXRpb24gY29udGFpbmVyXG4gICAqL1xuICBwdWJsaWMgY29udGFpbmVyOiBDb250YWluZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogeyBjb250YWluZXI6IENvbnRhaW5lciwgbG9nZ2VyOiBMb2dnZXIgfSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICB0aGlzLmxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gaW52b2tlIHRoZSBmdW5jdGlvbiBleHBvcnRlZCBieSBgY29uZmlnL3JvdXRlcy5qc2AgaW4gdGhlIGNvbnRleHQgb2YgdGhlXG4gICAqIGN1cnJlbnQgcm91dGVyIGluc3RhbmNlLlxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBtYXAoZm46IChyb3V0ZXI6IFJvdXRlcikgPT4gdm9pZCk6IHZvaWQge1xuICAgIGRlYnVnKCdtYXBwaW5nIHJvdXRlcycpO1xuICAgIGZuKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGluY29taW5nIHJlcXVlc3QgYW5kIGl0J3MgcmVzcG9uc2UgZnJvbSBhbiBIVFRQIHNlcnZlciwgcHJlcGFyZXMgdGhlbSwgcnVucyB0aGVcbiAgICogZ2VuZXJpYyBtaWRkbGV3YXJlIGZpcnN0LCBoYW5kcyB0aGVtIG9mZiB0byB0aGUgYXBwcm9wcmlhdGUgYWN0aW9uIGdpdmVuIHRoZSBpbmNvbWluZyBVUkwsIGFuZFxuICAgKiBmaW5hbGx5IHJlbmRlcnMgdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGhhbmRsZShyZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCByZXNwb25zZTtcbiAgICBsZXQgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KHJlcSk7XG4gICAgdHJ5IHtcblxuICAgICAgZGVidWcoYFskeyByZXF1ZXN0LmlkIH1dOiAkeyByZXF1ZXN0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpIH0gJHsgcmVxdWVzdC5wYXRoIH1gKTtcbiAgICAgIGF3YWl0IGZyb21Ob2RlKChjYikgPT4gdGhpcy5taWRkbGV3YXJlLnJ1bihyZXF1ZXN0LCByZXMsIGNiKSk7XG5cbiAgICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogcm91dGluZyByZXF1ZXN0YCk7XG4gICAgICBsZXQgcm91dGVzID0gdGhpcy5yb3V0ZXNbcmVxdWVzdC5tZXRob2RdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3V0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgcmVxdWVzdC5wYXJhbXMgPSByb3V0ZXNbaV0ubWF0Y2gocmVxdWVzdC5wYXRoKTtcbiAgICAgICAgaWYgKHJlcXVlc3QucGFyYW1zKSB7XG4gICAgICAgICAgcmVxdWVzdC5yb3V0ZSA9IHJvdXRlc1tpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFyZXF1ZXN0LnJvdXRlKSB7XG4gICAgICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogJHsgcmVxdWVzdC5tZXRob2QgfSAkeyByZXF1ZXN0LnBhdGggfSBkaWQgbWF0Y2ggYW55IHJvdXRlLiBBdmFpbGFibGUgJHsgcmVxdWVzdC5tZXRob2QgfSByb3V0ZXM6XFxuJHsgcm91dGVzLm1hcCgocikgPT4gci5zcGVjKS5qb2luKCcsXFxuJykgfWApO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3JzLk5vdEZvdW5kKCdSb3V0ZSBub3QgcmVjb2duaXplZCcpO1xuICAgICAgfVxuXG4gICAgICBsZXQgYWN0aW9uOiBBY3Rpb24gPSBuZXcgKDxhbnk+cmVxdWVzdC5yb3V0ZS5hY3Rpb24pKHtcbiAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgbG9nZ2VyOiB0aGlzLmxvZ2dlcixcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLmNvbnRhaW5lclxuICAgICAgfSk7XG5cbiAgICAgIGxldCBzZXJpYWxpemVyOiBTZXJpYWxpemVyIHwgZmFsc2U7XG4gICAgICBpZiAoYWN0aW9uLnNlcmlhbGl6ZXIgIT0gbnVsbCkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbi5zZXJpYWxpemVyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHNlcmlhbGl6ZXIgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoYHNlcmlhbGl6ZXI6JHsgYWN0aW9uLnNlcmlhbGl6ZXIgfWApO1xuICAgICAgICB9IGVsc2UgaWYgKGFjdGlvbi5zZXJpYWxpemVyID09PSBmYWxzZSkge1xuICAgICAgICAgIHNlcmlhbGl6ZXIgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlcmlhbGl6ZXIgPSA8U2VyaWFsaXplciB8IGZhbHNlPmFjdGlvbi5zZXJpYWxpemVyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJpYWxpemVyID0gdGhpcy5jb250YWluZXIubG9va3VwKCdzZXJpYWxpemVyOmFwcGxpY2F0aW9uJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlaXMuaGFzQm9keShyZXF1ZXN0KSAmJiByZXF1ZXN0LmJvZHkgJiYgc2VyaWFsaXplcikge1xuICAgICAgICBkZWJ1ZyhgWyR7IHJlcXVlc3QuaWQgfV06IHBhcnNpbmcgcmVxdWVzdCBib2R5YCk7XG4gICAgICAgIHJlcXVlc3QuYm9keSA9IHNlcmlhbGl6ZXIucGFyc2UocmVxdWVzdC5ib2R5KTtcbiAgICAgIH1cblxuICAgICAgZGVidWcoYFskeyByZXF1ZXN0LmlkIH1dOiBydW5uaW5nIGFjdGlvbmApO1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBhY3Rpb24ucnVuKCk7XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmhhbmRsZUVycm9yKHJlcXVlc3QsIHJlcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogc2V0dGluZyByZXNwb25zZSBzdGF0dXMgY29kZSB0byAkeyByZXNwb25zZS5zdGF0dXMgfWApO1xuICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIHJlcy5zZXRIZWFkZXIoJ1gtUmVxdWVzdC1JZCcsIHJlcXVlc3QuaWQpO1xuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkpIHtcbiAgICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogd3JpdGluZyByZXNwb25zZSBib2R5YCk7XG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LXR5cGUnLCByZXNwb25zZS5jb250ZW50VHlwZSk7XG4gICAgICBpZiAodGhpcy5jb250YWluZXIuY29uZmlnLmVudmlyb25tZW50ICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgcmVzLndyaXRlKEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmJvZHksIG51bGwsIDIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy53cml0ZShKU09OLnN0cmluZ2lmeShyZXNwb25zZS5ib2R5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzLmVuZCgpO1xuICAgIGRlYnVnKGBbJHsgcmVxdWVzdC5pZCB9XTogcmVzcG9uc2UgZmluaXNoZWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHJlcXVlc3QsIHJlc3BvbnNlLCBhbmQgYW4gZXJyb3IgYW5kIGhhbmRzIG9mZiB0byB0aGUgZ2VuZXJpYyBhcHBsaWNhdGlvbiBsZXZlbCBlcnJvclxuICAgKiBhY3Rpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGhhbmRsZUVycm9yKHJlcXVlc3Q6IFJlcXVlc3QsIHJlczogU2VydmVyUmVzcG9uc2UsIGVycm9yOiBFcnJvcikge1xuICAgIHJlcXVlc3QucGFyYW1zID0gcmVxdWVzdC5wYXJhbXMgfHwge307XG4gICAgcmVxdWVzdC5wYXJhbXMuZXJyb3IgPSBlcnJvcjtcbiAgICBsZXQgRXJyb3JBY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoJ2FjdGlvbjplcnJvcicpO1xuICAgIGxldCBlcnJvckFjdGlvbiA9IG5ldyBFcnJvckFjdGlvbih7XG4gICAgICByZXF1ZXN0LFxuICAgICAgcmVzcG9uc2U6IHJlcyxcbiAgICAgIGxvZ2dlcjogdGhpcy5sb2dnZXIsXG4gICAgICBjb250YWluZXI6IHRoaXMuY29udGFpbmVyXG4gICAgfSk7XG4gICAgcmV0dXJuIGVycm9yQWN0aW9uLnJ1bigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgc3VwcGxpZWQgbWlkZGxld2FyZSBmdW5jdGlvbiB0byB0aGUgZ2VuZXJpYyBtaWRkbGV3YXJlIHN0YWNrIHRoYXQgcnVucyBwcmlvciB0byBhY3Rpb25cbiAgICogaGFuZGxpbmcuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHVzZShtaWRkbGV3YXJlOiBNaWRkbGV3YXJlRm4pOiB2b2lkIHtcbiAgICB0aGlzLm1pZGRsZXdhcmUudXNlKG1pZGRsZXdhcmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJvdXRlIHRvIHRoZSBhcHBsaWNhdGlvbi4gTWFwcyBhIG1ldGhvZCBhbmQgVVJMIHBhdHRlcm4gdG8gYW4gYWN0aW9uLCB3aXRoIG9wdGlvbmFsXG4gICAqIGFkZGl0aW9uYWwgcGFyYW1ldGVycy5cbiAgICpcbiAgICogVVJMIHBhdHRlcm5zIGNhbiB1c2U6XG4gICAqXG4gICAqICogRHluYW1pYyBzZWdtZW50cywgaS5lLiBgJ2Zvby86YmFyJ2AgKiBXaWxkY2FyZCBzZWdtZW50cywgaS5lLiBgJ2Zvby8qYmFyJ2AsIGNhcHR1cmVzIHRoZSByZXN0XG4gICAqIG9mIHRoZSBVUkwgdXBcbiAgICogICAgdG8gdGhlIHF1ZXJ5c3RyaW5nXG4gICAqICogT3B0aW9uYWwgZ3JvdXBzLCBpLmUuIGAnZm9vKC86YmFyKSdgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHJvdXRlKG1ldGhvZDogTWV0aG9kLCByYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KSB7XG4gICAgLy8gRW5zdXJlIGxlYWRpbmcgc2xhc2hlc1xuICAgIGxldCBub3JtYWxpemVkUGF0dGVybiA9IHJhd1BhdHRlcm4ucmVwbGFjZSgvXihbXi9dKS8sICcvJDEnKTtcbiAgICAvLyBSZW1vdmUgaGFyZGNvZGVkIHRyYWlsaW5nIHNsYXNoZXNcbiAgICBub3JtYWxpemVkUGF0dGVybiA9IG5vcm1hbGl6ZWRQYXR0ZXJuLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gICAgLy8gRW5zdXJlIG9wdGlvbmFsIHRyYWlsaW5nIHNsYXNoZXNcbiAgICBub3JtYWxpemVkUGF0dGVybiA9IGAkeyBub3JtYWxpemVkUGF0dGVybiB9KC8pYDtcbiAgICAvLyBBZGQgcm91dGVcbiAgICBsZXQgQWN0aW9uQ2xhc3MgPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoYGFjdGlvbjokeyBhY3Rpb25QYXRoIH1gKTtcbiAgICBsZXQgcm91dGUgPSBuZXcgUm91dGUobm9ybWFsaXplZFBhdHRlcm4pO1xuICAgIHJvdXRlLmFjdGlvblBhdGggPSBhY3Rpb25QYXRoO1xuICAgIHJvdXRlLmFjdGlvbiA9IEFjdGlvbkNsYXNzO1xuICAgIHJvdXRlLmFkZGl0aW9uYWxQYXJhbXMgPSBwYXJhbXM7XG4gICAgaWYgKCFyb3V0ZS5hY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gYWN0aW9uIGZvdW5kIGF0ICR7IGFjdGlvblBhdGggfWApO1xuICAgIH1cbiAgICB0aGlzLnJvdXRlc1ttZXRob2RdLnB1c2gocm91dGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFVSTCBmb3IgYSBnaXZlbiBhY3Rpb24uIFlvdSBjYW4gc3VwcGx5IGEgcGFyYW1zIG9iamVjdCB3aGljaFxuICAgKiB3aWxsIGJlIHVzZWQgdG8gZmlsbCBpbiB0aGUgZHluYW1pYyBzZWdlbWVudHMgb2YgdGhlIGFjdGlvbidzIHJvdXRlIChpZlxuICAgKiBhbnkpLlxuICAgKi9cbiAgcHVibGljIHVybEZvcihhY3Rpb246IHN0cmluZyB8IEFjdGlvbiwgZGF0YTogYW55KTogc3RyaW5nIHwgYm9vbGVhbiB7XG4gICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICBhY3Rpb24gPSB0aGlzLmNvbnRhaW5lci5sb29rdXAoYGFjdGlvbjokeyBhY3Rpb24gfWApO1xuICAgIH1cbiAgICBpZiAoIWFjdGlvbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCByb3V0ZTogUm91dGU7XG4gICAgZm9yRWFjaCh0aGlzLnJvdXRlcywgKHJvdXRlcykgPT4ge1xuICAgICAgcm91dGUgPSBmaW5kKHJvdXRlcywgeyBhY3Rpb246IDxBY3Rpb24+YWN0aW9uIH0pO1xuICAgICAgcmV0dXJuICFyb3V0ZTsgLy8ga2lsbCB0aGUgaXRlcmF0b3IgaWYgd2UgZm91bmQgdGhlIG1hdGNoXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcm91dGUgJiYgcm91dGUucmV2ZXJzZShkYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG9ydGhhbmQgZm9yIGB0aGlzLnJvdXRlKCdnZXQnLCAuLi5hcmd1bWVudHMpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBnZXQocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ2dldCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgncG9zdCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHBvc3QocmF3UGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoOiBzdHJpbmcsIHBhcmFtcz86IGFueSk6IHZvaWQge1xuICAgIHRoaXMucm91dGUoJ3Bvc3QnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ3B1dCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHB1dChyYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZSgncHV0JywgcmF3UGF0dGVybiwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG9ydGhhbmQgZm9yIGB0aGlzLnJvdXRlKCdwYXRjaCcsIC4uLmFyZ3VtZW50cylgXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHBhdGNoKHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdwYXRjaCcsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIGZvciBgdGhpcy5yb3V0ZSgnZGVsZXRlJywgLi4uYXJndW1lbnRzKWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlKHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdkZWxldGUnLCByYXdQYXR0ZXJuLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0aGFuZCBmb3IgYHRoaXMucm91dGUoJ2hlYWQnLCAuLi5hcmd1bWVudHMpYFxuICAgKlxuICAgKiBAc2luY2UgMC4xLjBcbiAgICovXG4gIHB1YmxpYyBoZWFkKHJhd1BhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aDogc3RyaW5nLCBwYXJhbXM/OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnJvdXRlKCdoZWFkJywgcmF3UGF0dGVybiwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG9ydGhhbmQgZm9yIGB0aGlzLnJvdXRlKCdvcHRpb25zJywgLi4uYXJndW1lbnRzKWBcbiAgICpcbiAgICogQHNpbmNlIDAuMS4wXG4gICAqL1xuICBwdWJsaWMgb3B0aW9ucyhyYXdQYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGg6IHN0cmluZywgcGFyYW1zPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yb3V0ZSgnb3B0aW9ucycsIHJhd1BhdHRlcm4sIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFsbCB0aGUgQ1JVRCByb3V0ZXMgZm9yIGEgZ2l2ZW4gcmVzb3VyY2UgYW5kIGl0J3MgcmVsYXRpb25zaGlwcy4gQmFzZWQgb24gdGhlIEpTT04tQVBJXG4gICAqIHJlY29tbWVuZGF0aW9ucyBmb3IgVVJMIGRlc2lnbi5cbiAgICpcbiAgICogVGhlIGBvcHRpb25zYCBhcmd1bWVudCBsZXRzIHlvdSBwYXNzIGluIGBvbmx5YCBvciBgZXhjZXB0YCBhcnJheXMgdG8gZGVmaW5lIGV4Y2VwdGlvbnMuIEFjdGlvblxuICAgKiBuYW1lcyBpbmNsdWRlZCBpbiBgb25seWAgd2lsbCBiZSB0aGUgb25seSBvbmVzIGdlbmVyYXRlZCwgd2hpbGUgbmFtZXMgaW5jbHVkZWQgaW4gYGV4Y2VwdGAgd2lsbFxuICAgKiBiZSBvbWl0dGVkLlxuICAgKlxuICAgKiBTZXQgYG9wdGlvbnMucmVsYXRlZCA9IGZhbHNlYCB0byBkaXNhYmxlIHJlbGF0aW9uc2hpcCByb3V0ZXMuXG4gICAqXG4gICAqIElmIG5vIG9wdGlvbnMgYXJlIHN1cHBsaWVkLCB0aGUgZm9sbG93aW5nIHJvdXRlcyBhcmUgZ2VuZXJhdGVkIChhc3N1bWluZyBhICdib29rcycgcmVzb3VyY2UgYXNcbiAgICogYW4gZXhhbXBsZSk6XG4gICAqXG4gICAqICAgKiBgR0VUIC9ib29rc2BcbiAgICogICAqIGBQT1NUIC9ib29rc2BcbiAgICogICAqIGBHRVQgL2Jvb2tzLzppZGBcbiAgICogICAqIGBQQVRDSCAvYm9va3MvOmlkYFxuICAgKiAgICogYERFTEVURSAvYm9va3MvOmlkYFxuICAgKiAgICogYEdFVCAvYm9va3MvOmlkLzpyZWxhdGlvbmBcbiAgICogICAqIGBHRVQgL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICogICAqIGBQQVRDSCAvYm9va3MvOmlkL3JlbGF0aW9uc2hpcHMvOnJlbGF0aW9uYFxuICAgKiAgICogYFBPU1QgL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICogICAqIGBERUxFVEUgL2Jvb2tzLzppZC9yZWxhdGlvbnNoaXBzLzpyZWxhdGlvbmBcbiAgICpcbiAgICogU2VlIGh0dHA6Ly9qc29uYXBpLm9yZy9yZWNvbW1lbmRhdGlvbnMvI3VybHMgZm9yIGRldGFpbHMuXG4gICAqXG4gICAqIEBzaW5jZSAwLjEuMFxuICAgKi9cbiAgcHVibGljIHJlc291cmNlKHJlc291cmNlTmFtZTogc3RyaW5nLCBvcHRpb25zOiBSZXNvdXJjZU9wdGlvbnMgPSB7fSk6IHZvaWQge1xuICAgIGxldCBwbHVyYWwgPSBwbHVyYWxpemUocmVzb3VyY2VOYW1lKTtcbiAgICBsZXQgY29sbGVjdGlvbiA9IGAvJHsgcGx1cmFsIH1gO1xuICAgIGxldCByZXNvdXJjZSA9IGAkeyBjb2xsZWN0aW9uIH0vOmlkYDtcbiAgICBsZXQgcmVsYXRpb25zaGlwID0gYCR7IHJlc291cmNlIH0vcmVsYXRpb25zaGlwcy86cmVsYXRpb25gO1xuICAgIGxldCByZWxhdGVkID0gYCR7IHJlc291cmNlIH0vOnJlbGF0aW9uYDtcblxuICAgIGlmICghb3B0aW9ucy5yZWxhdGVkKSB7XG4gICAgICBvcHRpb25zLmV4Y2VwdCA9IFsgJ3JlbGF0ZWQnLCAnZmV0Y2gtcmVsYXRlZCcsICdyZXBsYWNlLXJlbGF0ZWQnLCAnYWRkLXJlbGF0ZWQnLCAncmVtb3ZlLXJlbGF0ZWQnIF0uY29uY2F0KG9wdGlvbnMuZXhjZXB0KTtcbiAgICB9XG5cbiAgICBsZXQgaGFzV2hpdGVsaXN0ID0gQm9vbGVhbihvcHRpb25zLm9ubHkpO1xuICAgIG9wdGlvbnMub25seSA9IGVuc3VyZUFycmF5KG9wdGlvbnMub25seSk7XG4gICAgb3B0aW9ucy5leGNlcHQgPSBlbnN1cmVBcnJheShvcHRpb25zLmV4Y2VwdCk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgZ2l2ZW4gYWN0aW9uIHNob3VsZCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHdoaXRlbGlzdC9ibGFja2xpc3Qgb3B0aW9uc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluY2x1ZGUoYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgIGxldCB3aGl0ZWxpc3RlZCA9IG9wdGlvbnMub25seS5pbmNsdWRlcyhhY3Rpb24pO1xuICAgICAgbGV0IGJsYWNrbGlzdGVkID0gb3B0aW9ucy5leGNlcHQuaW5jbHVkZXMoYWN0aW9uKTtcbiAgICAgIHJldHVybiAhYmxhY2tsaXN0ZWQgJiYgKFxuICAgICAgICAoaGFzV2hpdGVsaXN0ICYmIHdoaXRlbGlzdGVkKSB8fFxuICAgICAgICAhaGFzV2hpdGVsaXN0XG4gICAgICApO1xuICAgIH1cblxuICAgIFtcbiAgICAgIFsgJ2xpc3QnLCAnZ2V0JywgY29sbGVjdGlvbiBdLFxuICAgICAgWyAnY3JlYXRlJywgJ3Bvc3QnLCBjb2xsZWN0aW9uIF0sXG4gICAgICBbICdzaG93JywgJ2dldCcsIHJlc291cmNlIF0sXG4gICAgICBbICd1cGRhdGUnLCAncGF0Y2gnLCByZXNvdXJjZSBdLFxuICAgICAgWyAnZGVzdHJveScsICdkZWxldGUnLCByZXNvdXJjZSBdLFxuICAgICAgWyAncmVsYXRlZCcsICdnZXQnLCByZWxhdGVkIF0sXG4gICAgICBbICdmZXRjaC1yZWxhdGVkJywgJ2dldCcsIHJlbGF0aW9uc2hpcCBdLFxuICAgICAgWyAncmVwbGFjZS1yZWxhdGVkJywgJ3BhdGNoJywgcmVsYXRpb25zaGlwIF0sXG4gICAgICBbICdhZGQtcmVsYXRlZCcsICdwb3N0JywgcmVsYXRpb25zaGlwIF0sXG4gICAgICBbICdyZW1vdmUtcmVsYXRlZCcsICdkZWxldGUnLCByZWxhdGlvbnNoaXAgXVxuICAgIF0uZm9yRWFjaCgocm91dGVUZW1wbGF0ZTogWyBzdHJpbmcsIE1ldGhvZCwgc3RyaW5nIF0pID0+IHtcbiAgICAgIGxldCBbIGFjdGlvbiwgbWV0aG9kLCB1cmwgXSA9IHJvdXRlVGVtcGxhdGU7XG4gICAgICBpZiAoaW5jbHVkZShhY3Rpb24pKSB7XG4gICAgICAgIGxldCByb3V0ZU1ldGhvZCA9IDwodXJsOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSA9PiB2b2lkPnRoaXNbbWV0aG9kXTtcbiAgICAgICAgcm91dGVNZXRob2QuY2FsbCh0aGlzLCB1cmwsIGAkeyBwbHVyYWwgfS8keyBhY3Rpb24gfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgW21ldGhvZE5hbWU6IHN0cmluZ106IGFueTtcblxuICAvKipcbiAgICogRW5hYmxlcyBlYXN5IHJvdXRlIG5hbWVzcGFjaW5nLiBZb3UgY2FuIHN1cHBseSBhIG1ldGhvZCB3aGljaCB0YWtlcyBhIHNpbmdsZSBhcmd1bWVudCB0aGF0XG4gICAqIHdvcmtzIGp1c3QgbGlrZSB0aGUgYHJvdXRlcmAgYXJndW1lbnQgaW4geW91ciBgY29uZmlnL3JvdXRlcy5qc2AsIG9yIHlvdSBjYW4gdXNlIHRoZSByZXR1cm5cbiAgICogdmFsdWUganVzdCBsaWtlIHRoZSByb3V0ZXIuXG4gICAqXG4gICAqICAgcm91dGVyLm5hbWVzcGFjZSgndXNlcnMnLCAobmFtZXNwYWNlKSA9PiB7XG4gICAqICAgICBuYW1lc3BhY2UuZ2V0KCdzaWduLWluJyk7XG4gICAqICAgfSk7XG4gICAqICAgLy8gb3IgLi4uXG4gICAqICAgbGV0IG5hbWVzcGFjZSA9IHJvdXRlci5uYW1lc3BhY2UoJ3VzZXJzJyk7XG4gICAqICAgbmFtZXNwYWNlLmdldCgnc2lnbi1pbicpO1xuICAgKi9cbiAgcHVibGljIG5hbWVzcGFjZShuYW1lc3BhY2U6IHN0cmluZywgZm46ICh3cmFwcGVyOiBSb3V0ZXJEU0wpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBsZXQgcm91dGVyID0gdGhpcztcbiAgICBpZiAobmFtZXNwYWNlLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIG5hbWVzcGFjZSA9IG5hbWVzcGFjZS5zbGljZSgwLCBuYW1lc3BhY2UubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIC8vIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzXG4gICAgbGV0IHdyYXBwZXI6IFJvdXRlckRTTCA9IHtcbiAgICAgIGdldChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ2dldCcsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgcG9zdChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ3Bvc3QnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIHB1dChwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ3B1dCcsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgcGF0Y2gocGF0dGVybjogc3RyaW5nLCBhY3Rpb25QYXRoLCBwYXJhbXMpIHtcbiAgICAgICAgcm91dGVyLnJvdXRlKCdwYXRjaCcsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgZGVsZXRlKHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgnZGVsZXRlJywgYCR7IG5hbWVzcGFjZSB9LyR7IHBhdHRlcm4ucmVwbGFjZSgvXlxcLy8sICcnKSB9YCwgYWN0aW9uUGF0aCwgcGFyYW1zKTtcbiAgICAgIH0sXG4gICAgICBoZWFkKHBhdHRlcm46IHN0cmluZywgYWN0aW9uUGF0aCwgcGFyYW1zKSB7XG4gICAgICAgIHJvdXRlci5yb3V0ZSgnaGVhZCcsIGAkeyBuYW1lc3BhY2UgfS8keyBwYXR0ZXJuLnJlcGxhY2UoL15cXC8vLCAnJykgfWAsIGFjdGlvblBhdGgsIHBhcmFtcyk7XG4gICAgICB9LFxuICAgICAgb3B0aW9ucyhwYXR0ZXJuOiBzdHJpbmcsIGFjdGlvblBhdGgsIHBhcmFtcykge1xuICAgICAgICByb3V0ZXIucm91dGUoJ29wdGlvbnMnLCBgJHsgbmFtZXNwYWNlIH0vJHsgcGF0dGVybi5yZXBsYWNlKC9eXFwvLywgJycpIH1gLCBhY3Rpb25QYXRoLCBwYXJhbXMpO1xuICAgICAgfSxcbiAgICAgIHJlc291cmNlKHJlc291cmNlTmFtZTogc3RyaW5nLCBvcHRpb25zOiBSZXNvdXJjZU9wdGlvbnMpIHtcbiAgICAgICAgcm91dGVyLnJlc291cmNlLmNhbGwodGhpcywgcmVzb3VyY2VOYW1lLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIC8vIHRzbGludDplbmFibGU6Y29tcGxldGVkLWRvY3NcbiAgICBpZiAoZm4pIHtcbiAgICAgIGZuKHdyYXBwZXIpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=