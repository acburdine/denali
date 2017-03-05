/// <reference types="node" />
import Model from '../data/model';
import Response from './response';
import * as http from 'http';
import DenaliObject from '../metal/object';
import Request from './request';
import Logger from './logger';
import Container from './container';
import Service from './service';
/**
 * Constructor options for Action class
 *
 * @package runtime
 */
export interface ActionOptions {
    request: Request;
    response: http.ServerResponse;
    logger: Logger;
    container: Container;
}
export interface Responder {
    (params: any): Response | {
        [key: string]: any;
    } | void;
}
/**
 * Actions form the core of interacting with a Denali application. They are the controller layer in
 * the MVC architecture, taking in incoming requests, performing business logic, and handing off to
 * the renderer to send the response.
 *
 * When a request comes in, Denali will invoke the `respond` method (or `respondWith__` for content
 * negotiated requests) on the matching Action class. The return value (or resolved return value) of
 * this method is used to render the response.
 *
 * Actions also support filters. Simply define a method on your action, and add the method name to
 * the `before` or `after` array. Filters behave similar to responders in that they receive the
 * request params and can return a promise which will be waited on before continuing. Filters are
 * inheritable, so child classes will run filters added by parent classes.
 *
 * @package runtime
 * @since 0.1.0
 */
declare abstract class Action extends DenaliObject {
    /**
     * Cached list of responder formats this action class supports.
     */
    private static _formats;
    /**
     * Cache the list of available formats this action can respond to.
     */
    private static formats();
    /**
     * Invoked before the `respond()` method. The framework will invoke filters from parent classes
     * and mixins in the same order the mixins were applied.
     *
     * Filters can be synchronous, or return a promise (which will pause the before/respond/after
     * chain until it resolves).
     *
     * If a before filter returns any value (or returns a promise which resolves to any value) other
     * than null or undefined, Denali will attempt to render that response and halt further processing
     * of the request (including remaining before filters).
     *
     * @since 0.1.0
     */
    static before: string[];
    /**
     * Invoked after the `respond()` method. The framework will invoke filters from parent classes and
     * mixins in the same order the mixins were applied.
     *
     * Filters can be synchronous, or return a promise (which will pause the before/respond/after
     * chain until it resolves).
     *
     * @since 0.1.0
     */
    static after: string[];
    /**
     * Force which serializer should be used for the rendering of the response.
     *
     * By default if the response is of type Error it will use the 'error' serializer. On the other
     * hand if it's a Model, it will use that model's serializer. Otherwise, it will use the
     * 'application' serializer.
     *
     * @since 0.1.0
     */
    serializer: string | boolean;
    /**
     * The application config
     *
     * @since 0.1.0
     */
    config: any;
    /**
     * The incoming Request that this Action is responding to.
     *
     * @since 0.1.0
     */
    request: Request;
    /**
     * The application logger instance
     *
     * @since 0.1.0
     */
    logger: Logger;
    /**
     * The application container
     *
     * @since 0.1.0
     */
    container: Container;
    /**
     * Creates an Action that will respond to the given Request.
     */
    constructor(options: ActionOptions);
    /**
     * Fetch a model class by it's type string, i.e. 'post' => PostModel
     *
     * @since 0.1.0
     */
    modelFor(type: string): Model;
    /**
     * Fetch a service by it's container name, i.e. 'email' => 'services/email.js'
     *
     * @since 0.1.0
     */
    service(type: string): Service;
    /**
     * Render some supplied data to the response. Data can be:
     *
     *   * a Model instance
     *   * an array of Model instances
     *   * a Denali.Response instance
     */
    private render(response);
    /**
     * Invokes the action. Determines the best responder method for content negotiation, then executes
     * the filter/responder chain in sequence, handling errors and rendering the response.
     *
     * You shouldn't invoke this directly - Denali will automatically wire up your routes to this
     * method.
     */
    run(): Promise<Response>;
    /**
     * Find the best responder method for the incoming request, given the incoming request's Accept
     * header.
     *
     * If the Accept header is "Accept: * / *", then the generic `respond()` method is selected.
     * Otherwise, attempt to find the best responder method based on the mime types.
     */
    _pickBestResponder(): Responder;
    [key: string]: any;
    /**
     * The default responder method. You should override this method with whatever logic is needed to
     * respond to the incoming request.
     *
     * @since 0.1.0
     */
    abstract respond(params: any): Response | {
        [key: string]: any;
    } | void;
    /**
     * Cached list of before filters that should be executed.
     */
    protected static _before: string[];
    /**
     * Cached list of after filters that should be executed.
     */
    protected static _after: string[];
    /**
     * Walk the prototype chain of this Action instance to find all the `before` and `after` arrays to
     * build the complete filter chains.
     *
     * Caches the result on the child Action class to avoid the potentially expensive prototype walk
     * on each request.
     *
     * Throws if it encounters the name of a filter method that doesn't exist.
     */
    private _buildFilterChains();
    /**
     * Invokes the filters in the supplied chain in sequence.
     */
    private _invokeFilters(chain, params, haltable);
}
export default Action;
