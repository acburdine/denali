import DenaliObject from '../metal/object';
/**
 * The Response class represents a response to an incoming request. You can return an instance of
 * this class from your action's responder method to render a response with a custom status code,
 * headers, or body.
 *
 * @package runtime
 * @since 0.1.0
 */
export default class Response extends DenaliObject {
    /**
     * The HTTP status code to send in the response
     *
     * @since 0.1.0
     */
    status: number;
    /**
     * The response body
     *
     * @since 0.1.0
     */
    body: any;
    /**
     * Any custom options for this response. This object is available to the serializer as it attempts
     * to serialize this response, so you can pass through serializer specific options here.
     *
     * @since 0.1.0
     */
    options: any;
    constructor(status: number, body?: any, options?: any);
    /**
     * The content type of the response. Set via the `options` argument of the Response constructor.
     *
     * @since 0.1.0
     */
    contentType: string;
}
