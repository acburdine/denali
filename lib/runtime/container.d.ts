import DenaliObject from '../metal/object';
import Logger from './logger';
/**
 * The Container houses all the various classes that makeup a Denali app's
 *
 * runtime. It holds references to the modules themselves, as well as managing lookup logic (i.e.
 * some types of classes fall back to a generic "application" class if a more specific one is not
 * found.
 *
 * @package runtime
 * @since 0.1.0
 */
export default class Container extends DenaliObject {
    /**
     * An internal cache of lookups and their resolved values
     */
    private _cache;
    /**
     * The internal cache of available references
     */
    private _registry;
    /**
     * A reference to the application config
     *
     * @since 0.1.0
     */
    readonly config: any;
    /**
     * A reference to the application logger
     *
     * @since 0.1.0
     */
    readonly logger: Logger;
    /**
     * Register a value under the given `fullName` for later use.
     *
     * @since 0.1.0
     */
    register(name: string, value: any): void;
    /**
     * Lookup a value in the container. Uses type specific lookup logic if available.
     *
     * @since 0.1.0
     */
    lookup(name: string): any;
    [key: string]: any;
    /**
     * Lookup all modules of a specific type in the container. Returns an object of all the modules
     * keyed by their module path (i.e. `role:employees/manager` would be found under
     * `lookupAll('role')['employees/manager']`
     *
     * @since 0.1.0
     */
    lookupAll(type: string): {
        [moduleName: string]: any;
    };
    /**
     * The base lookup method that most other lookup methods delegate to. Attempts to lookup a cached
     * resolution for the parsedName provided. If none is found, performs the lookup and caches it
     * for future retrieval
     */
    private _lookupOther(parsedName, options?);
    /**
     * Lookup an ORM adapter. If not found, falls back to the application ORM adapter as determined
     * by the `ormAdapter` config property.
     */
    private lookupOrmAdapter(parsedName);
    /**
     * Lookup a serializer. Falls back to the application serializer if not found.
     */
    private lookupSerializer(parsedName);
    /**
     * Take the supplied name which can come in several forms, and normalize it.
     */
    private parseName(name);
    /**
     * For a given type, returns the names of all the available modules under that
     * type. Primarily used for debugging purposes (i.e. to show available modules
     * when a lookup of that type fails).
     */
    availableForType(type: string): string[];
}
