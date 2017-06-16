"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const assert = require("assert");
const resolver_1 = require("./resolver");
const inject_1 = require("./inject");
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
class Container {
    /**
     * Create a new container with a base (highest precedence) resolver at the given directory.
     */
    constructor(root) {
        /**
         * Manual registrations that should override resolver retrieved values
         */
        this.registry = {};
        /**
         * An array of resolvers used to retrieve container members. Resolvers are tried in order, first
         * to find the member wins. Normally, each addon will supply it's own resolver, allowing for
         * addon order and precedence when looking up container entries.
         */
        this.resolvers = [];
        /**
         * Internal cache of lookup values
         */
        this.lookups = {};
        /**
         * Internal cache of classes
         */
        this.classLookups = {};
        /**
         * Internal cache of factories
         */
        this.factoryLookups = {};
        /**
         * Options for container entries. Keyed on specifier or type. See ContainerOptions.
         */
        this.options = {
            action: { singleton: false, instantiate: true },
            config: { singleton: true, instantiate: false },
            initializer: { singleton: true, instantiate: false },
            'orm-adapter': { singleton: true, instantiate: true },
            model: { singleton: false, instantiate: false },
            serializer: { singleton: true, instantiate: true },
            service: { singleton: true, instantiate: true }
        };
        /**
         * Internal cache of injections per class, so we can avoid redoing expensive for..in loops on,
         * every instance, and instead do a fast Object.assign
         */
        this.injectionsCache = new Map();
        /**
         * Internal metadata store. See `metaFor()`
         */
        this.meta = new Map();
        this.resolvers.push(new resolver_1.default(root));
    }
    /**
     * Add a resolver to the container to use for lookups. New resolvers are added at lowest priority,
     * so all previously added resolvers will take precedence.
     */
    addResolver(resolver) {
        this.resolvers.push(resolver);
    }
    /**
     * Add a manual registration that will take precedence over any resolved lookups.
     */
    register(specifier, entry, options) {
        this.registry[specifier] = entry;
        if (options) {
            lodash_1.forOwn(options, (value, key) => {
                this.setOption(specifier, key, value);
            });
        }
    }
    /**
     * Return the factory for the given specifier. Typically only used when you need to control when
     * an object is instantiated.
     */
    factoryFor(specifier, options = {}) {
        let factory = this.factoryLookups[specifier];
        if (!factory) {
            let klass = this.classLookups[specifier];
            if (!klass) {
                klass = this.registry[specifier];
                if (!klass) {
                    lodash_1.forEach(this.resolvers, (resolver) => {
                        klass = resolver.retrieve(specifier);
                        if (klass) {
                            return false;
                        }
                    });
                }
                if (klass) {
                    this.classLookups[specifier] = klass;
                }
            }
            if (!klass) {
                if (options.loose) {
                    return;
                }
                throw new Error(`No class found for ${specifier}`);
            }
            factory = this.factoryLookups[specifier] = this.buildFactory(specifier, klass);
        }
        return factory;
    }
    /**
     * Lookup the given specifier in the container. If options.loose is true, failed lookups will
     * return undefined rather than throw.
     */
    lookup(specifier, options = {}) {
        let singleton = this.getOption(specifier, 'singleton') !== false;
        if (singleton) {
            let lookup = this.lookups[specifier];
            if (lookup) {
                return lookup.instance;
            }
        }
        let factory = this.factoryFor(specifier, options);
        if (!factory) {
            return;
        }
        if (this.getOption(specifier, 'instantiate') === false) {
            return factory.class;
        }
        let instance = factory.create();
        if (singleton && instance) {
            this.lookups[specifier] = { factory, instance };
        }
        return instance;
    }
    /**
     * Lookup all the entries for a given type in the container. This will ask all resolvers to
     * eagerly load all classes for this type. Returns an object whose keys are container specifiers
     * and values are the looked up values for those specifiers.
     */
    lookupAll(type) {
        let entries = this.availableForType(type);
        let values = entries.map((entry) => this.lookup(`${type}:${entry}`));
        return lodash_1.zipObject(entries, values);
    }
    /**
     * Returns an array of entry names for all entries under this type. Entries are eagerly looked up,
     * so resolvers will actively scan for all matching files, for example. Use sparingly.
     */
    availableForType(type) {
        let registrations = Object.keys(this.registry).filter((specifier) => {
            return specifier.startsWith(type);
        });
        let resolved = this.resolvers.reduce((entries, resolver) => {
            return entries.concat(resolver.availableForType(type));
        }, []);
        return lodash_1.uniq(registrations.concat(resolved)).map((specifier) => specifier.split(':')[1]);
    }
    /**
     * Return the value for the given option on the given specifier. Specifier may be a full specifier
     * or just a type.
     */
    getOption(specifier, optionName) {
        let [type] = specifier.split(':');
        let options = lodash_1.defaults(this.options[specifier], this.options[type]);
        return options[optionName];
    }
    /**
     * Set the give option for the given specifier or type.
     */
    setOption(specifier, optionName, value) {
        if (!this.options[specifier]) {
            this.options[specifier] = { singleton: false, instantiate: false };
        }
        this.options[specifier][optionName] = value;
    }
    /**
     * Allow consumers to store metadata on the container. This is useful if you want to store data
     * tied to the lifetime of the container. For example, you may have an expensive calculation that
     * you can cache once per class. Rather than storing that cached value on `this.constructor`,
     * which is shared across containers, you can store it on `container.metaFor(this.constructor)`,
     * ensuring that your container doesn't pollute others.
     */
    metaFor(key) {
        if (!this.meta.has(key)) {
            this.meta.set(key, {});
        }
        return this.meta.get(key);
    }
    /**
     * Given an instance, iterate through all it's properties, lookup any injections, and apply them.
     * Cache injections discovered for classes so we can avoid the expensive property search on every
     * instance. We can't just apply injections to the class prototype because injections are created
     * via class properties, which are not enumerable.
     */
    applyInjections(instance) {
        if (instance.constructor) {
            if (!this.injectionsCache.has(instance.constructor)) {
                let injections = {};
                for (let key in instance) {
                    let value = instance[key];
                    if (inject_1.isInjection(value)) {
                        injections[key] = this.lookup(value.lookup);
                    }
                }
                this.injectionsCache.set(instance.constructor, injections);
            }
            Object.assign(instance, this.injectionsCache.get(instance.constructor));
        }
        else {
            for (let key in instance) {
                let value = instance[key];
                if (inject_1.isInjection(value)) {
                    instance[key] = this.lookup(value.lookup);
                }
            }
        }
    }
    /**
     * Build the factory wrapper for a given container member
     */
    buildFactory(specifier, klass) {
        // Static injections
        this.applyInjections(klass);
        let container = this;
        return {
            class: klass,
            create(...args) {
                assert(typeof klass === 'function', `Unable to instantiate ${specifier} (it's not a constructor). Try setting the 'instantiate: false' option on this container entry to avoid instantiating it`);
                let instance = new klass(...args);
                instance.container = container;
                container.applyInjections(instance);
                return instance;
            }
        };
    }
}
exports.default = Container;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hYnVyZGluZS9Qcm9qZWN0cy9kZW5hbGkvbWFpbi8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FNZ0I7QUFDaEIsaUNBQWlDO0FBQ2pDLHlDQUFrQztBQUVsQyxxQ0FBdUM7QUFxQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNIO0lBcURFOztPQUVHO0lBQ0gsWUFBWSxJQUFZO1FBdER4Qjs7V0FFRztRQUNLLGFBQVEsR0FBMkIsRUFBRSxDQUFDO1FBRTlDOzs7O1dBSUc7UUFDSyxjQUFTLEdBQWUsRUFBRSxDQUFDO1FBRW5DOztXQUVHO1FBQ0ssWUFBTyxHQUFtRCxFQUFFLENBQUM7UUFFckU7O1dBRUc7UUFDSyxpQkFBWSxHQUEyQixFQUFFLENBQUM7UUFFbEQ7O1dBRUc7UUFDSyxtQkFBYyxHQUF1QixFQUFFLENBQUM7UUFFaEQ7O1dBRUc7UUFDSyxZQUFPLEdBQTJCO1lBQ3hDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtZQUMvQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7WUFDL0MsV0FBVyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO1lBQ3BELGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtZQUNyRCxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7WUFDL0MsVUFBVSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO1lBQ2xELE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFF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QUM7WUFDbEIsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUE5UEQsNEJBOFBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZGVmYXVsdHMsXG4gIGZvckVhY2gsXG4gIGZvck93bixcbiAgdW5pcSxcbiAgemlwT2JqZWN0XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBSZXNvbHZlciBmcm9tICcuL3Jlc29sdmVyJztcbmltcG9ydCB7IERpY3QsIENvbnN0cnVjdG9yIH0gZnJvbSAnLi4vdXRpbHMvdHlwZXMnO1xuaW1wb3J0IHsgaXNJbmplY3Rpb24gfSBmcm9tICcuL2luamVjdCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFpbmVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgY29udGFpbmVyIHNob3VsZCB0cmVhdCB0aGUgbWVtYmVyIGFzIGEgc2luZ2xldG9uLiBJZiBwYWlyZWQgd2l0aCBgaW5zdGFudGlhdGVgLCB0aGVcbiAgICogY29udGFpbmVyIHdpbGwgY3JlYXRlIHRoYXQgc2luZ2xldG9uIG9uIHRoZSBmaXJzdCBsb29rdXAuIElmIG5vdCwgdGhlbiB0aGUgY29udGFpbmVyIHdpbGxcbiAgICogYXNzdW1lIHRvIG1lbWJlciBpcyBhbHJlYWR5IGEgc2luZ2xldG9uXG4gICAqL1xuICBzaW5nbGV0b24/OiBib29sZWFuO1xuICAvKipcbiAgICogVGhlIGNvbnRhaW5lciBzaG91bGQgY3JlYXRlIGFuIGluc3RhbmNlIG9uIGxvb2t1cC4gSWYgYHNpbmdsZXRvbmAgaXMgYWxzbyB0cnVlLCBvbmx5IG9uZVxuICAgKiBpbnN0YW5jZSB3aWxsIGJlIGNyZWF0ZWRcbiAgICovXG4gIGluc3RhbnRpYXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIEZhY3RvcnkgaXMgYSB3cmFwcGVyIG9iamVjdCBhcm91bmQgYSBjb250YWluZXJlZCBjbGFzcy4gSXQgaW5jbHVkZXMgdGhlIG9yaWdpbmFsIGNsYXNzLCBwbHVzIGFcbiAqIGBjcmVhdGUoKWAgbWV0aG9kIHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGEgbmV3IGluc3RhbmNlIGFuZCBhcHBseWluZyBhbnkgYXBwcm9wcmlhdGVcbiAqIGluamVjdGlvbnMuXG4gKlxuICogVGhlIEZhY3Rvcnkgb2JqZWN0IGlzIHVzZWQgdG8gaXNvbGF0ZSB0aGlzIGluamVjdGlvbiBsb2dpYyB0byBhIHNpbmdsZSBzcG90LiBUaGUgY29udGFpbmVyIHVzZXNcbiAqIHRoaXMgRmFjdG9yeSBvYmplY3QgaW50ZXJuYWxseSB3aGVuIGluc3RhbnRpYXRpbmcgZHVyaW5nIGEgYGxvb2t1cGAgY2FsbC4gVXNlcnMgY2FuIGFsc28gZmV0Y2hcbiAqIHRoaXMgRmFjdG9yeSB2aWEgYGZhY3RvcnlGb3IoKWAgaWYgdGhleSB3YW50IHRvIGNvbnRyb2wgaW5zdGFudGlhdGlvbi4gQSBnb29kIGV4YW1wbGUgaGVyZSBpc1xuICogTW9kZWxzLiBXZSBjb3VsZCBhbGxvdyB0aGUgY29udGFpbmVyIHRvIGluc3RhbnRpYXRlIG1vZGVscyBieSBzZXR0aW5nIGBpbnN0YW50aWF0ZTogdHJ1ZWAsIGJ1dFxuICogdGhhdCBpcyBpbmNvbnZlbmllbnQgLSBNb2RlbHMgdHlwaWNhbGx5IHRha2UgY29uc3RydWN0b3IgYXJndW1lbnRzIChjb250YWluZXIgaW5zdGFudGlhdGlvblxuICogZG9lc24ndCBzdXBwb3J0IHRoYXQpLCBhbmQgd2UgZnJlcXVlbnRseSB3YW50IHRvIGZldGNoIHRoZSBNb2RlbCBjbGFzcyBpdHNlbGYsIHdoaWNoIGlzXG4gKiBjdW1iZXJzb21lIHdpdGggYGluc3RhbnRpYXRlOiB0cnVlYC5cbiAqXG4gKiBJbnN0ZWFkLCB1c2VycyBjYW4gc2ltcGx5IHVzZSBgZmFjdG9yeUZvcmAgdG8gZmV0Y2ggdGhpcyBGYWN0b3J5IHdyYXBwZXIuIFRoZW4gdGhleSBjYW5cbiAqIGluc3RhbnRpYXRlIHRoZSBvYmplY3QgaG93ZXZlciB0aGV5IGxpa2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFjdG9yeTxUPiB7XG4gIGNsYXNzOiBDb25zdHJ1Y3RvcjxUPjtcbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogVDtcbn1cblxuLyoqXG4gKiBUaGUgY29udGFpbmVyIGlzIHRoZSBkZXBlbmRlbmN5IGluamVjdGlvbiBzb2x1dGlvbiBmb3IgRGVuYWxpLiBJdCBpcyByZXNwb25zaWJsZSBmb3IgYWJzdHJhY3RpbmdcbiAqIGF3YXkgd2hlcmUgYSBjbGFzcyBjYW1lIGZyb20uIFRoaXMgYWxsb3dzIHNldmVyYWwgdGhpbmdzOlxuICpcbiAqICAgKiBBcHBzIGNhbiBjb25zdW1lIGNsYXNzZXMgdGhhdCBvcmlnaW5hdGUgZnJvbSBhbnl3aGVyZSBpbiB0aGUgYWRkb24gZGVwZW5kZW5jeSB0cmVlLCB3aXRob3V0XG4gKiAgICAgbmVlZGluZyB0byBjYXJlL3NwZWNpZnkgd2hlcmUuXG4gKiAgICogV2UgY2FuIG1vcmUgZWFzaWx5IHRlc3QgcGFydHMgb2YgdGhlIGZyYW1ld29yayBieSBtb2NraW5nIG91dCBjb250YWluZXIgZW50cmllcyBpbnN0ZWFkIG9mXG4gKiAgICAgZGVhbGluZyB3aXRoIGhhcmRjb2RpbmcgZGVwZW5kZW5jaWVzXG4gKiAgICogU3VwcG9ydCBjbGVhbiBpbmplY3Rpb24gc3ludGF4LCBpLmUuIGBtYWlsZXIgPSBzZXJ2aWNlKCk7YC5cbiAqXG4gKiBJbiBvcmRlciB0byBkbyB0aGVzZSwgdGhlIGNvbnRhaW5lciBtdXN0IGNvbnRyb2wgY3JlYXRpbmcgaW5zdGFuY2VzIG9mIGFueSBjbGFzc2VzIGl0IGhvbGRzLiBUaGlzXG4gKiBhbGxvd3MgdXMgdG8gZW5zdXJlIGluamVjdGlvbnMgYXJlIGFwcGxpZWQgdG8gZXZlcnkgaW5zdGFuY2UuIElmIHlvdSBuZWVkIHRvIGNyZWF0ZSB5b3VyIG93blxuICogaW5zdGFuY2Ugb2YgYSBjbGFzcywgeW91IGNhbiB1c2UgdGhlIGBmYWN0b3J5Rm9yYCBtZXRob2Qgd2hpY2ggYWxsb3dzIHlvdSB0byBjcmVhdGUgeW91ciBvd25cbiAqIGluc3RhbmNlIHdpdGggaW5qZWN0aW9ucyBwcm9wZXJseSBhcHBsaWVkLlxuICpcbiAqIEhvd2V2ZXIsIHRoaXMgc2hvdWxkIGJlIHJlbGF0aWVseSByYXJlIC0gbW9zdCBvZiB0aGUgdGltZSB5b3UnbGwgYmUgZGVhbGluZyB3aXRoIG9iamVjdHMgdGhhdFxuICogYXJlIGNvbnRyb2xsZWQgYnkgdGhlIGZyYW1ld29yay5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIHtcblxuICAvKipcbiAgICogTWFudWFsIHJlZ2lzdHJhdGlvbnMgdGhhdCBzaG91bGQgb3ZlcnJpZGUgcmVzb2x2ZXIgcmV0cmlldmVkIHZhbHVlc1xuICAgKi9cbiAgcHJpdmF0ZSByZWdpc3RyeTogRGljdDxDb25zdHJ1Y3Rvcjxhbnk+PiA9IHt9O1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiByZXNvbHZlcnMgdXNlZCB0byByZXRyaWV2ZSBjb250YWluZXIgbWVtYmVycy4gUmVzb2x2ZXJzIGFyZSB0cmllZCBpbiBvcmRlciwgZmlyc3RcbiAgICogdG8gZmluZCB0aGUgbWVtYmVyIHdpbnMuIE5vcm1hbGx5LCBlYWNoIGFkZG9uIHdpbGwgc3VwcGx5IGl0J3Mgb3duIHJlc29sdmVyLCBhbGxvd2luZyBmb3JcbiAgICogYWRkb24gb3JkZXIgYW5kIHByZWNlZGVuY2Ugd2hlbiBsb29raW5nIHVwIGNvbnRhaW5lciBlbnRyaWVzLlxuICAgKi9cbiAgcHJpdmF0ZSByZXNvbHZlcnM6IFJlc29sdmVyW10gPSBbXTtcblxuICAvKipcbiAgICogSW50ZXJuYWwgY2FjaGUgb2YgbG9va3VwIHZhbHVlc1xuICAgKi9cbiAgcHJpdmF0ZSBsb29rdXBzOiBEaWN0PHsgZmFjdG9yeTogRmFjdG9yeTxhbnk+LCBpbnN0YW5jZTogYW55IH0+ID0ge307XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGNhY2hlIG9mIGNsYXNzZXNcbiAgICovXG4gIHByaXZhdGUgY2xhc3NMb29rdXBzOiBEaWN0PENvbnN0cnVjdG9yPGFueT4+ID0ge307XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGNhY2hlIG9mIGZhY3Rvcmllc1xuICAgKi9cbiAgcHJpdmF0ZSBmYWN0b3J5TG9va3VwczogRGljdDxGYWN0b3J5PGFueT4+ID0ge307XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIGNvbnRhaW5lciBlbnRyaWVzLiBLZXllZCBvbiBzcGVjaWZpZXIgb3IgdHlwZS4gU2VlIENvbnRhaW5lck9wdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIG9wdGlvbnM6IERpY3Q8Q29udGFpbmVyT3B0aW9ucz4gPSB7XG4gICAgYWN0aW9uOiB7IHNpbmdsZXRvbjogZmFsc2UsIGluc3RhbnRpYXRlOiB0cnVlIH0sXG4gICAgY29uZmlnOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0sXG4gICAgaW5pdGlhbGl6ZXI6IHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSxcbiAgICAnb3JtLWFkYXB0ZXInOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICBtb2RlbDogeyBzaW5nbGV0b246IGZhbHNlLCBpbnN0YW50aWF0ZTogZmFsc2UgfSxcbiAgICBzZXJpYWxpemVyOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICBzZXJ2aWNlOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBjYWNoZSBvZiBpbmplY3Rpb25zIHBlciBjbGFzcywgc28gd2UgY2FuIGF2b2lkIHJlZG9pbmcgZXhwZW5zaXZlIGZvci4uaW4gbG9vcHMgb24sXG4gICAqIGV2ZXJ5IGluc3RhbmNlLCBhbmQgaW5zdGVhZCBkbyBhIGZhc3QgT2JqZWN0LmFzc2lnblxuICAgKi9cbiAgcHJpdmF0ZSBpbmplY3Rpb25zQ2FjaGU6IE1hcDxhbnksIERpY3Q8YW55Pj4gPSBuZXcgTWFwKCk7XG5cbiAgLyoqXG4gICAqIEludGVybmFsIG1ldGFkYXRhIHN0b3JlLiBTZWUgYG1ldGFGb3IoKWBcbiAgICovXG4gIHByaXZhdGUgbWV0YTogTWFwPGFueSwgRGljdDxhbnk+PiA9IG5ldyBNYXAoKTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGNvbnRhaW5lciB3aXRoIGEgYmFzZSAoaGlnaGVzdCBwcmVjZWRlbmNlKSByZXNvbHZlciBhdCB0aGUgZ2l2ZW4gZGlyZWN0b3J5LlxuICAgKi9cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5yZXNvbHZlcnMucHVzaChuZXcgUmVzb2x2ZXIocm9vdCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlc29sdmVyIHRvIHRoZSBjb250YWluZXIgdG8gdXNlIGZvciBsb29rdXBzLiBOZXcgcmVzb2x2ZXJzIGFyZSBhZGRlZCBhdCBsb3dlc3QgcHJpb3JpdHksXG4gICAqIHNvIGFsbCBwcmV2aW91c2x5IGFkZGVkIHJlc29sdmVycyB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAgICovXG4gIGFkZFJlc29sdmVyKHJlc29sdmVyOiBSZXNvbHZlcikge1xuICAgIHRoaXMucmVzb2x2ZXJzLnB1c2gocmVzb2x2ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIG1hbnVhbCByZWdpc3RyYXRpb24gdGhhdCB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIGFueSByZXNvbHZlZCBsb29rdXBzLlxuICAgKi9cbiAgcmVnaXN0ZXIoc3BlY2lmaWVyOiBzdHJpbmcsIGVudHJ5OiBhbnksIG9wdGlvbnM/OiBDb250YWluZXJPcHRpb25zKSB7XG4gICAgdGhpcy5yZWdpc3RyeVtzcGVjaWZpZXJdID0gZW50cnk7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvck93bihvcHRpb25zLCAodmFsdWUsIGtleToga2V5b2YgQ29udGFpbmVyT3B0aW9ucykgPT4ge1xuICAgICAgICB0aGlzLnNldE9wdGlvbihzcGVjaWZpZXIsIGtleSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgZmFjdG9yeSBmb3IgdGhlIGdpdmVuIHNwZWNpZmllci4gVHlwaWNhbGx5IG9ubHkgdXNlZCB3aGVuIHlvdSBuZWVkIHRvIGNvbnRyb2wgd2hlblxuICAgKiBhbiBvYmplY3QgaXMgaW5zdGFudGlhdGVkLlxuICAgKi9cbiAgZmFjdG9yeUZvcjxUID0gYW55PihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uczogeyBsb29zZT86IGJvb2xlYW4gfSA9IHt9KTogRmFjdG9yeTxUPiB7XG4gICAgbGV0IGZhY3RvcnkgPSB0aGlzLmZhY3RvcnlMb29rdXBzW3NwZWNpZmllcl07XG4gICAgaWYgKCFmYWN0b3J5KSB7XG4gICAgICBsZXQga2xhc3MgPSB0aGlzLmNsYXNzTG9va3Vwc1tzcGVjaWZpZXJdO1xuXG4gICAgICBpZiAoIWtsYXNzKSB7XG4gICAgICAgIGtsYXNzID0gdGhpcy5yZWdpc3RyeVtzcGVjaWZpZXJdO1xuXG4gICAgICAgIGlmICgha2xhc3MpIHtcbiAgICAgICAgICBmb3JFYWNoKHRoaXMucmVzb2x2ZXJzLCAocmVzb2x2ZXIpID0+IHtcbiAgICAgICAgICAgIGtsYXNzID0gcmVzb2x2ZXIucmV0cmlldmUoc3BlY2lmaWVyKTtcbiAgICAgICAgICAgIGlmIChrbGFzcykge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2xhc3MpIHtcbiAgICAgICAgICB0aGlzLmNsYXNzTG9va3Vwc1tzcGVjaWZpZXJdID0ga2xhc3M7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFrbGFzcykge1xuICAgICAgICBpZiAob3B0aW9ucy5sb29zZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGNsYXNzIGZvdW5kIGZvciAkeyBzcGVjaWZpZXIgfWApO1xuICAgICAgfVxuXG4gICAgICBmYWN0b3J5ID0gdGhpcy5mYWN0b3J5TG9va3Vwc1tzcGVjaWZpZXJdID0gdGhpcy5idWlsZEZhY3Rvcnkoc3BlY2lmaWVyLCBrbGFzcyk7XG4gICAgfVxuICAgIHJldHVybiBmYWN0b3J5O1xuICB9XG5cbiAgLyoqXG4gICAqIExvb2t1cCB0aGUgZ2l2ZW4gc3BlY2lmaWVyIGluIHRoZSBjb250YWluZXIuIElmIG9wdGlvbnMubG9vc2UgaXMgdHJ1ZSwgZmFpbGVkIGxvb2t1cHMgd2lsbFxuICAgKiByZXR1cm4gdW5kZWZpbmVkIHJhdGhlciB0aGFuIHRocm93LlxuICAgKi9cbiAgbG9va3VwPFQgPSBhbnk+KHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb25zOiB7IGxvb3NlPzogYm9vbGVhbiB9ID0ge30pOiBUIHtcbiAgICBsZXQgc2luZ2xldG9uID0gdGhpcy5nZXRPcHRpb24oc3BlY2lmaWVyLCAnc2luZ2xldG9uJykgIT09IGZhbHNlO1xuXG4gICAgaWYgKHNpbmdsZXRvbikge1xuICAgICAgbGV0IGxvb2t1cCA9IHRoaXMubG9va3Vwc1tzcGVjaWZpZXJdO1xuICAgICAgaWYgKGxvb2t1cCkge1xuICAgICAgICByZXR1cm4gbG9va3VwLmluc3RhbmNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBmYWN0b3J5ID0gdGhpcy5mYWN0b3J5Rm9yPFQ+KHNwZWNpZmllciwgb3B0aW9ucyk7XG4gICAgaWYgKCFmYWN0b3J5KSB7IHJldHVybjsgfVxuXG4gICAgaWYgKHRoaXMuZ2V0T3B0aW9uKHNwZWNpZmllciwgJ2luc3RhbnRpYXRlJykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gKDxhbnk+ZmFjdG9yeSkuY2xhc3M7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gZmFjdG9yeS5jcmVhdGUoKTtcblxuICAgIGlmIChzaW5nbGV0b24gJiYgaW5zdGFuY2UpIHtcbiAgICAgIHRoaXMubG9va3Vwc1tzcGVjaWZpZXJdID0geyBmYWN0b3J5LCBpbnN0YW5jZSB9O1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgYWxsIHRoZSBlbnRyaWVzIGZvciBhIGdpdmVuIHR5cGUgaW4gdGhlIGNvbnRhaW5lci4gVGhpcyB3aWxsIGFzayBhbGwgcmVzb2x2ZXJzIHRvXG4gICAqIGVhZ2VybHkgbG9hZCBhbGwgY2xhc3NlcyBmb3IgdGhpcyB0eXBlLiBSZXR1cm5zIGFuIG9iamVjdCB3aG9zZSBrZXlzIGFyZSBjb250YWluZXIgc3BlY2lmaWVyc1xuICAgKiBhbmQgdmFsdWVzIGFyZSB0aGUgbG9va2VkIHVwIHZhbHVlcyBmb3IgdGhvc2Ugc3BlY2lmaWVycy5cbiAgICovXG4gIGxvb2t1cEFsbDxUID0gYW55Pih0eXBlOiBzdHJpbmcpOiBEaWN0PFQ+IHtcbiAgICBsZXQgZW50cmllcyA9IHRoaXMuYXZhaWxhYmxlRm9yVHlwZSh0eXBlKTtcbiAgICBsZXQgdmFsdWVzID0gZW50cmllcy5tYXAoKGVudHJ5KSA9PiB0aGlzLmxvb2t1cChgJHsgdHlwZSB9OiR7IGVudHJ5IH1gKSk7XG4gICAgcmV0dXJuIDxEaWN0PFQ+PnppcE9iamVjdChlbnRyaWVzLCB2YWx1ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgZW50cnkgbmFtZXMgZm9yIGFsbCBlbnRyaWVzIHVuZGVyIHRoaXMgdHlwZS4gRW50cmllcyBhcmUgZWFnZXJseSBsb29rZWQgdXAsXG4gICAqIHNvIHJlc29sdmVycyB3aWxsIGFjdGl2ZWx5IHNjYW4gZm9yIGFsbCBtYXRjaGluZyBmaWxlcywgZm9yIGV4YW1wbGUuIFVzZSBzcGFyaW5nbHkuXG4gICAqL1xuICBhdmFpbGFibGVGb3JUeXBlKHR5cGU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICBsZXQgcmVnaXN0cmF0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMucmVnaXN0cnkpLmZpbHRlcigoc3BlY2lmaWVyKSA9PiB7XG4gICAgICByZXR1cm4gc3BlY2lmaWVyLnN0YXJ0c1dpdGgodHlwZSk7XG4gICAgfSk7XG4gICAgbGV0IHJlc29sdmVkID0gdGhpcy5yZXNvbHZlcnMucmVkdWNlKChlbnRyaWVzLCByZXNvbHZlcikgPT4ge1xuICAgICAgcmV0dXJuIGVudHJpZXMuY29uY2F0KHJlc29sdmVyLmF2YWlsYWJsZUZvclR5cGUodHlwZSkpO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4gdW5pcShyZWdpc3RyYXRpb25zLmNvbmNhdChyZXNvbHZlZCkpLm1hcCgoc3BlY2lmaWVyKSA9PiBzcGVjaWZpZXIuc3BsaXQoJzonKVsxXSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB2YWx1ZSBmb3IgdGhlIGdpdmVuIG9wdGlvbiBvbiB0aGUgZ2l2ZW4gc3BlY2lmaWVyLiBTcGVjaWZpZXIgbWF5IGJlIGEgZnVsbCBzcGVjaWZpZXJcbiAgICogb3IganVzdCBhIHR5cGUuXG4gICAqL1xuICBnZXRPcHRpb24oc3BlY2lmaWVyOiBzdHJpbmcsIG9wdGlvbk5hbWU6IGtleW9mIENvbnRhaW5lck9wdGlvbnMpOiBhbnkge1xuICAgIGxldCBbIHR5cGUgXSA9IHNwZWNpZmllci5zcGxpdCgnOicpO1xuICAgIGxldCBvcHRpb25zID0gZGVmYXVsdHModGhpcy5vcHRpb25zW3NwZWNpZmllcl0sIHRoaXMub3B0aW9uc1t0eXBlXSk7XG4gICAgcmV0dXJuIG9wdGlvbnNbb3B0aW9uTmFtZV07XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBnaXZlIG9wdGlvbiBmb3IgdGhlIGdpdmVuIHNwZWNpZmllciBvciB0eXBlLlxuICAgKi9cbiAgc2V0T3B0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb25OYW1lOiBrZXlvZiBDb250YWluZXJPcHRpb25zLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnNbc3BlY2lmaWVyXSkge1xuICAgICAgdGhpcy5vcHRpb25zW3NwZWNpZmllcl0gPSB7IHNpbmdsZXRvbjogZmFsc2UsIGluc3RhbnRpYXRlOiBmYWxzZSB9O1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnNbc3BlY2lmaWVyXVtvcHRpb25OYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IGNvbnN1bWVycyB0byBzdG9yZSBtZXRhZGF0YSBvbiB0aGUgY29udGFpbmVyLiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBzdG9yZSBkYXRhXG4gICAqIHRpZWQgdG8gdGhlIGxpZmV0aW1lIG9mIHRoZSBjb250YWluZXIuIEZvciBleGFtcGxlLCB5b3UgbWF5IGhhdmUgYW4gZXhwZW5zaXZlIGNhbGN1bGF0aW9uIHRoYXRcbiAgICogeW91IGNhbiBjYWNoZSBvbmNlIHBlciBjbGFzcy4gUmF0aGVyIHRoYW4gc3RvcmluZyB0aGF0IGNhY2hlZCB2YWx1ZSBvbiBgdGhpcy5jb25zdHJ1Y3RvcmAsXG4gICAqIHdoaWNoIGlzIHNoYXJlZCBhY3Jvc3MgY29udGFpbmVycywgeW91IGNhbiBzdG9yZSBpdCBvbiBgY29udGFpbmVyLm1ldGFGb3IodGhpcy5jb25zdHJ1Y3RvcilgLFxuICAgKiBlbnN1cmluZyB0aGF0IHlvdXIgY29udGFpbmVyIGRvZXNuJ3QgcG9sbHV0ZSBvdGhlcnMuXG4gICAqL1xuICBtZXRhRm9yKGtleTogYW55KSB7XG4gICAgaWYgKCF0aGlzLm1ldGEuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMubWV0YS5zZXQoa2V5LCB7fSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1ldGEuZ2V0KGtleSk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYW4gaW5zdGFuY2UsIGl0ZXJhdGUgdGhyb3VnaCBhbGwgaXQncyBwcm9wZXJ0aWVzLCBsb29rdXAgYW55IGluamVjdGlvbnMsIGFuZCBhcHBseSB0aGVtLlxuICAgKiBDYWNoZSBpbmplY3Rpb25zIGRpc2NvdmVyZWQgZm9yIGNsYXNzZXMgc28gd2UgY2FuIGF2b2lkIHRoZSBleHBlbnNpdmUgcHJvcGVydHkgc2VhcmNoIG9uIGV2ZXJ5XG4gICAqIGluc3RhbmNlLiBXZSBjYW4ndCBqdXN0IGFwcGx5IGluamVjdGlvbnMgdG8gdGhlIGNsYXNzIHByb3RvdHlwZSBiZWNhdXNlIGluamVjdGlvbnMgYXJlIGNyZWF0ZWRcbiAgICogdmlhIGNsYXNzIHByb3BlcnRpZXMsIHdoaWNoIGFyZSBub3QgZW51bWVyYWJsZS5cbiAgICovXG4gIHByaXZhdGUgYXBwbHlJbmplY3Rpb25zKGluc3RhbmNlOiBhbnkpIHtcbiAgICBpZiAoaW5zdGFuY2UuY29uc3RydWN0b3IpIHtcbiAgICAgIGlmICghdGhpcy5pbmplY3Rpb25zQ2FjaGUuaGFzKGluc3RhbmNlLmNvbnN0cnVjdG9yKSkge1xuICAgICAgICBsZXQgaW5qZWN0aW9uczogRGljdDxhbnk+ID0ge307XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBpbnN0YW5jZSkge1xuICAgICAgICAgIGxldCB2YWx1ZSA9IGluc3RhbmNlW2tleV07XG4gICAgICAgICAgaWYgKGlzSW5qZWN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgICAgaW5qZWN0aW9uc1trZXldID0gdGhpcy5sb29rdXAodmFsdWUubG9va3VwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmplY3Rpb25zQ2FjaGUuc2V0KGluc3RhbmNlLmNvbnN0cnVjdG9yLCBpbmplY3Rpb25zKTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5hc3NpZ24oaW5zdGFuY2UsIHRoaXMuaW5qZWN0aW9uc0NhY2hlLmdldChpbnN0YW5jZS5jb25zdHJ1Y3RvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gaW5zdGFuY2UpIHtcbiAgICAgICAgbGV0IHZhbHVlID0gaW5zdGFuY2Vba2V5XTtcbiAgICAgICAgaWYgKGlzSW5qZWN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgICg8YW55Pmluc3RhbmNlKVtrZXldID0gdGhpcy5sb29rdXAodmFsdWUubG9va3VwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgZmFjdG9yeSB3cmFwcGVyIGZvciBhIGdpdmVuIGNvbnRhaW5lciBtZW1iZXJcbiAgICovXG4gIHByaXZhdGUgYnVpbGRGYWN0b3J5PFQ+KHNwZWNpZmllcjogc3RyaW5nLCBrbGFzczogQ29uc3RydWN0b3I8VD4pOiBGYWN0b3J5PFQ+IHtcbiAgICAvLyBTdGF0aWMgaW5qZWN0aW9uc1xuICAgIHRoaXMuYXBwbHlJbmplY3Rpb25zKGtsYXNzKTtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcztcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3M6IGtsYXNzLFxuICAgICAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGFzc2VydCh0eXBlb2Yga2xhc3MgPT09ICdmdW5jdGlvbicsIGBVbmFibGUgdG8gaW5zdGFudGlhdGUgJHsgc3BlY2lmaWVyIH0gKGl0J3Mgbm90IGEgY29uc3RydWN0b3IpLiBUcnkgc2V0dGluZyB0aGUgJ2luc3RhbnRpYXRlOiBmYWxzZScgb3B0aW9uIG9uIHRoaXMgY29udGFpbmVyIGVudHJ5IHRvIGF2b2lkIGluc3RhbnRpYXRpbmcgaXRgKTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gbmV3IGtsYXNzKC4uLmFyZ3MpO1xuICAgICAgICAoPGFueT5pbnN0YW5jZSkuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICBjb250YWluZXIuYXBwbHlJbmplY3Rpb25zKGluc3RhbmNlKTtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cbiJdfQ==