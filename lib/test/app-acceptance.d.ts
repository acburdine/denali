import DenaliObject from '../metal/object';
import Application from '../runtime/application';
/**
 * The AppAcceptance class represents an app acceptance test. It spins up an in-memory instance of
 * the application under test, and exposes methods to submit simulated requests to the application,
 * and get the response. This helps keep acceptance tests lightweight and easily parallelizable,
 * since they don't need to bind to an actual port.
 *
 * @package test
 * @since 0.1.0
 */
export declare class AppAcceptance extends DenaliObject {
    /**
     * The application instance under test
     */
    application: Application;
    /**
     * Default headers that are applied to each request. Useful for handling API-wide content-types,
     * sessions, etc.
     *
     * @since 0.1.0
     */
    headers: {
        [name: string]: string;
    };
    /**
     * An internal registry of container injections.
     */
    protected _injections: {
        [fullName: string]: any;
    };
    constructor();
    /**
     * Start the application (note: this won't actually start the HTTP server, but performs all the
     * other startup work for you).
     *
     * @since 0.1.0
     */
    start(): Promise<void>;
    /**
     * Submit a simulated HTTP request to the application.
     *
     * @since 0.1.0
     */
    request(options: {
        method: string;
        url: string;
        body?: any;
        headers?: {
            [key: string]: string;
        };
    }): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Send a simulated GET request
     *
     * @since 0.1.0
     */
    get(url: string, options?: {}): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Send a simulated HEAD request
     *
     * @since 0.1.0
     */
    head(url: string, options?: {}): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Send a simulated DELETE request
     *
     * @since 0.1.0
     */
    delete(url: string, options?: {}): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Send a simulated POST request
     *
     * @since 0.1.0
     */
    post(url: string, body: any, options?: {}): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Send a simulated PUT request
     *
     * @since 0.1.0
     */
    put(url: string, body: any, options?: {}): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Send a simulated PATCH request
     *
     * @since 0.1.0
     */
    patch(url: string, body: string, options?: {}): Promise<{
        status: number;
        body: any;
    }>;
    /**
     * Get the current value of a default header
     *
     * @since 0.1.0
     */
    getHeader(name: string): string;
    /**
     * Set a default header value
     *
     * @since 0.1.0
     */
    setHeader(name: string, value: string): void;
    /**
     * Remove a default header value
     *
     * @since 0.1.0
     */
    removeHeader(name: string): void;
    /**
     * Lookup an entry in the test application container
     *
     * @since 0.1.0
     */
    lookup(name: string): any;
    /**
     * Overwrite an entry in the test application container. Use `restore()` to restore the original
     * container entry later.
     *
     * @since 0.1.0
     */
    inject(name: string, value: any): void;
    /**
     * Restore the original container entry for an entry that was previously overwritten by `inject()`
     *
     * @since 0.1.0
     */
    restore(name: string): void;
    /**
     * Shut down the test application, cleaning up any resources in use
     *
     * @since 0.1.0
     */
    shutdown(): Promise<void>;
}
/**
 * A helper method for setting up an app acceptance test. Adds beforeEach/afterEach hooks to the
 * current ava test suite which will setup and teardown the acceptance test. They also setup a test
 * transaction and roll it back once the test is finished (for the ORM adapters that support it), so
 * your test data won't pollute the database.
 *
 * @package test
 * @since 0.1.0
 */
export default function appAcceptanceTest(ava: any): void;
