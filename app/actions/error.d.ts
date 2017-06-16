import Action from '../../lib/runtime/action';
import Logger from '../../lib/runtime/logger';
import FlatParser from '../../lib/parse/flat';
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
    logger: Logger;
    parser: FlatParser;
    /**
     * Respond with JSON by default
     */
    respond({params}: any): Promise<void>;
}
