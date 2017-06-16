export interface AvailableForTypeMethod {
    (type: string): {
        [modulePath: string]: any;
    };
}
export declare type Registry = Map<string, any>;
export default class Resolver {
    [key: string]: any;
    /**
     * The root directory for this resolver to start from when searching for files
     */
    root: string;
    /**
     * The internal cache of available references
     */
    private registry;
    constructor(root: string);
    /**
     * Manually add a member to this resolver. Manually registered members take precedence over any
     * retrieved from the filesystem.
     */
    register(specifier: string, value: any): void;
    /**
     * Fetch the member matching the given parsedName. First checks for any manually registered
     * members, then falls back to type specific retrieve methods that typically find the matching
     * file on the filesystem.
     */
    retrieve(specifier: string): any;
    /**
     * Unknown types are assumed to exist underneath the `app/` folder
     */
    protected retrieveOther(type: string, entry: string): any;
    /**
     * App files are found in `app/*`
     */
    protected retrieveApp(type: string, entry: string): any;
    /**
     * Config files are found in `config/`
     */
    protected retrieveConfig(type: string, entry: string): any;
    /**
     * Initializer files are found in `config/initializers/`
     */
    protected retrieveInitializer(type: string, entry: string): any;
    /**
     * Retrieve all the entries for a given type. First checks for all manual registrations matching
     * that type, then retrieves all members for that type (typically from the filesystem).
     */
    availableForType(type: string): string[];
    /**
     * Unknown types are assumed to exist in the `app/` folder
     */
    protected availableForOther(type: string): string[];
    /**
     * App files are found in `app/*`
     */
    protected availableForApp(type: string, entry: string): string[];
    /**
     * Config files are found in the `config/` folder. Initializers are _not_ included in this group
     */
    protected availableForConfig(type: string): string[];
    /**
     * Initializers files are found in the `config/initializers/` folder
     */
    protected availableForInitializer(type: string): string[];
}
