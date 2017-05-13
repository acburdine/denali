import { MixinApplicator } from './mixin';
import Container from './container';
/**
 * The base object class for Denali classes. Adds mixin support.
 *
 * @package metal
 */
export default class DenaliObject {
    /**
     * Prevent people from introducing subtle and difficult to diagnose bugs by sharing container
     * state statically
     */
    protected static container: any;
    /**
     * Apply mixins using this class as the base class. Pure syntactic sugar for the `mixin` helper.
     */
    static mixin(...mixins: MixinApplicator<any, any>[]): any;
    /**
     * The application container instance
     */
    protected container: Container;
    /**
     * A hook that users should override for constructor-time logic so they don't have to worry about
     * correctly handling super and container references.
     */
    init(...args: any[]): void;
}
