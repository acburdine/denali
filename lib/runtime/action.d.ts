/// <reference types="node" />
import Parser from '../parse/parser';
import DenaliObject from '../metal/object';
import Request from './request';
import { ServerResponse } from 'http';
import { Dict } from '../utils/types';
import DatabaseService from '../data/database';
import Logger from './logger';
export interface Responder {
    (params: ResponderParams): any;
}
/**
 * The parser determines the exact shape and structure of the arguments object passed into your
 * Action's respond method. However, the common convention is to at least expose the properties
 * listed below.
 *
 * *Note for Typescript users:*
 *
 * It's possible to have a parser that returns a query object with non-string properties (i.e. your
 * parser automatically converts the `page=4` query param into a number). In that case, you should
 * probably define your own interface that extends from this, and use that interface to type your
 * respond method argument.
 */
export interface ResponderParams {
    body?: any;
    query?: Dict<string>;
    headers?: Dict<string>;
    params?: Dict<string>;
    [key: string]: any;
}
export interface RenderOptions {
    /**
     * The view class that should be used to render this response. Overrides the `serializer` setting.
     * This is useful if you want complete, low-level control over the rendering process - you'll have
     * direct access to the response object, and can use it to render however you want. Render with
     * a streaming JSON renderer, use an HTML templating engine, a binary protocol, etc.
     */
    view?: string;
    /**
     * Explicitly set the name of the serializer that should be used to render this response. If not
     * provided, and the response body is a Model or array of Models, it will try to find a matching
     * serializer and use that. If it can't find the matching serializer, or if the response body is
     * another kind of object, it will fall back to the application serializer.
     */
    serializer?: string;
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
export default abstract class Action extends DenaliObject {
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
     * Filters must be defined as static properties to allow Denali to extract the values. Instance
     * fields are not visible until instantiation, so there's no way to build an "accumulated" value
     * from each step in the inheritance chain.
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
     * Filters must be defined as static properties to allow Denali to extract the values. Instance
     * fields are not visible until instantiation, so there's no way to build an "accumulated" value
     * from each step in the inheritance chain.
     *
     * @since 0.1.0
     */
    static after: string[];
    /**
     * Application config
     */
    config: any;
    /**
     * Force which parser should be used for parsing the incoming request.
     *
     * By default it uses the application parser, but you can override with the name of the parser
     * you'd rather use instead.
     *
     * @since 0.1.0
     */
    parser: Parser;
    /**
     * Automatically inject the db service into all actions
     *
     * @since 0.1.0
     */
    db: DatabaseService;
    /**
     * Automatically inject the logger into all actions
     *
     * @since 0.1.0
     */
    logger: Logger;
    /**
     * The incoming Request that this Action is responding to.
     *
     * @since 0.1.0
     */
    request: Request;
    /**
     * The outgoing HTTP server response
     *
     * @since 0.1.0
     */
    response: ServerResponse;
    /**
     * Track whether or not we have rendered yet
     */
    private hasRendered;
    /**
     * The path to this action, i.e. 'users/create'
     */
    actionPath: string;
    /**
     * Automatically inject the db service
     */
    /**
     * Render the response body
     */
    render(body: any, options?: RenderOptions): Promise<void>;
    render(status: number, body?: any, options?: RenderOptions): Promise<void>;
    /**
     * Invokes the action. Determines the best responder method for content negotiation, then executes
     * the filter/responder chain in sequence, handling errors and rendering the response.
     *
     * You shouldn't invoke this directly - Denali will automatically wire up your routes to this
     * method.
     */
    run(request: Request, response: ServerResponse): Promise<void>;
    /**
     * The default responder method. You should override this method with whatever logic is needed to
     * respond to the incoming request.
     *
     * @since 0.1.0
     */
    abstract respond(params: ResponderParams): any;
    /**
     * Invokes the filters in the supplied chain in sequence.
     */
    private _invokeFilters(chain, parsedRequest);
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
}
