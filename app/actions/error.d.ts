import Action from '../../lib/runtime/action';
import Response from '../../lib/runtime/response';
/**
 * The default error action. When Denali encounters an error while processing a request, it will
 * attempt to hand off that error to the `error` action, which can determine how to respond. This is
 * a good spot to do things like report the error to an error-tracking service, sanitize the error
 * response based on environment (i.e. a full stack trace in dev, but limited info in prod), etc.
 *
 * @export
 * @class ErrorAction
 * @extends {Action}
 */
export default class ErrorAction extends Action {
    readonly originalAction: string;
    /**
     * Respond with JSON by default
     */
    respond(params: any): Response;
    /**
     * Render an HTML template with the error details
     */
    respondWithHtml(params: any): Response;
    /**
     * Render the error details as a JSON payload
     */
    respondWithJson(params: any): Response;
    /**
     * Prepare the error for rendering. Santize the details of the error in production.
     */
    protected prepareError(error: any): Response;
    /**
     * Should the response include details about the error (i.e. a full stack trace)?
     */
    protected includeDebugInfo(): boolean;
}
