import Resolver from './resolver';
import { Dict, Constructor } from '../utils/types';
export interface ContainerOptions {
    /**
     * The container should treat the member as a singleton. If paired with `instantiate`, the
     * container will create that singleton on the first lookup. If not, then the container will
     * assume to member is already a singleton
     */
    singleton?: boolean;
    /**
     * The container should create an instance on lookup. If `singleton` is also true, only one
     * instance will be created
     */
    instantiate?: boolean;
}
/**
 * A Factory is a wrapper object around a containered class. It includes the original class, plus a
 * `create()` method that is responsible for creating a new instance and applying any appropriate
 * injections.
 *
 * The Factory object is used to isolate this injection logic to a single spot. The container uses
 * this Factory object internally when instantiating during a `lookup` call. Users can also fetch
 * this Factory via `factoryFor()` if they want to control instantiation. A good example here is
 * Models. We could allow the container to instantiate models by setting `instantiate: true`, but
 * that is inconvenient - Models typically take constructor arguments (container instantiation
 * doesn't support that), and we frequently want to fetch the Model class itself, which is
 * cumbersome with `instantiate: true`.
 *
 * Instead, users can simply use `factoryFor` to fetch this Factory wrapper. Then they can
 * instantiate the object however they like.
 */
export interface Factory<T> {
    class: Constructor<T>;
    create(...args: any[]): T;
}
/**
 * The container is the dependency injection solution for Denali. It is responsible for abstracting
 * away where a class came from. This allows several things:
 *
 *   * Apps can consume classes that originate from anywhere in the addon dependency tree, without
 *     needing to care/specify where.
 *   * We can more easily test parts of the framework by mocking out container entries instead of
 *     dealing with hardcoding dependencies
 *   * Support clean injection syntax, i.e. `mailer = service();`.
 *
 * In order to do these, the container must control creating instances of any classes it holds. This
 * allows us to ensure injections are applied to every instance. If you need to create your own
 * instance of a class, you can use the `factoryFor` method which allows you to create your own
 * instance with injections properly applied.
 *
 * However, this should be relatiely rare - most of the time you'll be dealing with objects that
 * are controlled by the framework.
 */
export default class Container {
    /**
     * Manual registrations that should override resolver retrieved values
     */
    private registry;
    /**
     * An array of resolvers used to retrieve container members. Resolvers are tried in order, first
     * to find the member wins. Normally, each addon will supply it's own resolver, allowing for
     * addon order and precedence when looking up container entries.
     */
    private resolvers;
    /**
     * Internal cache of lookup values
     */
    private lookups;
    /**
     * Internal cache of classes
     */
    private classLookups;
    /**
     * Internal cache of factories
     */
    private factoryLookups;
    /**
     * Options for container entries. Keyed on specifier or type. See ContainerOptions.
     */
    private options;
    /**
     * Internal cache of injections per class, so we can avoid redoing expensive for..in loops on,
     * every instance, and instead do a fast Object.assign
     */
    private injectionsCache;
    /**
     * Internal metadata store. See `metaFor()`
     */
    private meta;
    /**
     * Create a new container with a base (highest precedence) resolver at the given directory.
     */
    constructor(root: string);
    /**
     * Add a resolver to the container to use for lookups. New resolvers are added at lowest priority,
     * so all previously added resolvers will take precedence.
     */
    addResolver(resolver: Resolver): void;
    /**
     * Add a manual registration that will take precedence over any resolved lookups.
     */
    register(specifier: string, entry: any, options?: ContainerOptions): void;
    /**
     * Return the factory for the given specifier. Typically only used when you need to control when
     * an object is instantiated.
     */
    factoryFor<T = any>(specifier: string, options?: {
        loose?: boolean;
    }): Factory<T>;
    /**
     * Lookup the given specifier in the container. If options.loose is true, failed lookups will
     * return undefined rather than throw.
     */
    lookup<T = any>(specifier: string, options?: {
        loose?: boolean;
    }): T;
    /**
     * Lookup all the entries for a given type in the container. This will ask all resolvers to
     * eagerly load all classes for this type. Returns an object whose keys are container specifiers
     * and values are the looked up values for those specifiers.
     */
    lookupAll<T = any>(type: string): Dict<T>;
    /**
     * Returns an array of entry names for all entries under this type. Entries are eagerly looked up,
     * so resolvers will actively scan for all matching files, for example. Use sparingly.
     */
    availableForType(type: string): string[];
    /**
     * Return the value for the given option on the given specifier. Specifier may be a full specifier
     * or just a type.
     */
    getOption(specifier: string, optionName: keyof ContainerOptions): any;
    /**
     * Set the give option for the given specifier or type.
     */
    setOption(specifier: string, optionName: keyof ContainerOptions, value: any): void;
    /**
     * Allow consumers to store metadata on the container. This is useful if you want to store data
     * tied to the lifetime of the container. For example, you may have an expensive calculation that
     * you can cache once per class. Rather than storing that cached value on `this.constructor`,
     * which is shared across containers, you can store it on `container.metaFor(this.constructor)`,
     * ensuring that your container doesn't pollute others.
     */
    metaFor(key: any): Dict<any>;
    /**
     * Given an instance, iterate through all it's properties, lookup any injections, and apply them.
     * Cache injections discovered for classes so we can avoid the expensive property search on every
     * instance. We can't just apply injections to the class prototype because injections are created
     * via class properties, which are not enumerable.
     */
    private applyInjections(instance);
    /**
     * Build the factory wrapper for a given container member
     */
    private buildFactory<T>(specifier, klass);
}
