"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const assert = require("assert");
const resolver_1 = require("./resolver");
const inject_1 = require("./inject");
const DEFAULT_OPTIONS = {
    instantiate: false,
    singleton: true
};
/**
 * Anytime the container first looks up a particular entry, if that entry defines a method under the
 * `onLoad` symbol, it will invoke that method with the looked up entry value.
 *
 * This is useful for simulating pseudo-design-time logic. For example, Model classes use this to
 * create getter and setter methods for attributes which forward to the underlying ORM instance. The
 * result is that we can programmatically customize the class prototype based on static
 * declarations, loosely analagous to Ruby's `included` hook.
 *
 * Warning: this is a very low-level API, and should be used sparingly! Since the onLoad hook is
 * invoked with the _static_ class, take care to avoid sharing any container-specific state on that
 * static class, lest you pollute across containers (since containers share the static class
 * reference)
 */
exports.onLoad = Symbol('container onLoad method');
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
            app: { singleton: true, instantiate: true },
            action: { singleton: false, instantiate: true },
            config: { singleton: true, instantiate: false },
            initializer: { singleton: true, instantiate: false },
            'orm-adapter': { singleton: true, instantiate: true },
            model: { singleton: false, instantiate: false },
            parser: { singleton: true, instantiate: true },
            serializer: { singleton: true, instantiate: true },
            service: { singleton: true, instantiate: true },
            view: { singleton: true, instantiate: true }
        };
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
                    this.onFirstLookup(specifier, klass);
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
     * Run some logic anytime an entry is first looked up in the container. Here, we add some metadata
     * so the class can know what specifier it was looked up under, as well as running the special
     * onLoad hook, allowing classes to run some psuedo-design-time logic.
     */
    onFirstLookup(specifier, klass) {
        this.metaFor(klass).containerName = specifier.split(':')[1];
        if (klass[exports.onLoad]) {
            klass[exports.onLoad](klass);
        }
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
            let klass = factory.class;
            if (!singleton) {
                return klass;
            }
            let instance = klass;
            inject_1.injectInstance(instance, this);
            this.lookups[specifier] = { factory, instance };
            return klass;
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
        let options = lodash_1.defaults(this.options[specifier], this.options[type], DEFAULT_OPTIONS);
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
     * Clear any cached lookups for this specifier. You probably don't want to use this. The only
     * significant use case is for testing to allow test containers to override an already looked up
     * value.
     */
    clearCache(specifier) {
        delete this.lookups[specifier];
        delete this.classLookups[specifier];
        delete this.factoryLookups[specifier];
    }
    /**
     * Build the factory wrapper for a given container member
     */
    buildFactory(specifier, klass) {
        let container = this;
        return {
            class: klass,
            create(...args) {
                assert(typeof klass === 'function', `Unable to instantiate ${specifier} (it's not a constructor). Try setting the 'instantiate: false' option on this container entry to avoid instantiating it`);
                let instance = new klass();
                inject_1.injectInstance(instance, container);
                if (typeof instance.init === 'function') {
                    instance.init(...args);
                }
                return instance;
            }
        };
    }
}
exports.default = Container;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9hY2J1cmRpbmUvUHJvamVjdHMvZGVuYWxpL2RlbmFsaS8iLCJzb3VyY2VzIjpbImxpYi9tZXRhbC9jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FNZ0I7QUFDaEIsaUNBQWlDO0FBQ2pDLHlDQUFrQztBQUdsQyxxQ0FBMEM7QUFFMUMsTUFBTSxlQUFlLEdBQUc7SUFDdEIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsU0FBUyxFQUFFLElBQUk7Q0FDaEIsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDVSxRQUFBLE1BQU0sR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQXFDeEQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJHO0FBQ0g7SUFrREU7O09BRUc7SUFDSCxZQUFZLElBQVk7UUFuRHhCOztXQUVHO1FBQ0ssYUFBUSxHQUEyQixFQUFFLENBQUM7UUFFOUM7Ozs7V0FJRztRQUNLLGNBQVMsR0FBZSxFQUFFLENBQUM7UUFFbkM7O1dBRUc7UUFDSyxZQUFPLEdBQW1ELEVBQUUsQ0FBQztRQUVyRTs7V0FFRztRQUNLLGlCQUFZLEdBQTJCLEVBQUUsQ0FBQztRQUVsRDs7V0FFRztRQUNLLG1CQUFjLEdBQXVCLEVBQUUsQ0FBQztRQUVoRDs7V0FFRztRQUNLLFlBQU8sR0FBMkI7WUFDeEMsR0FBRyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFO1lBQzNDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTtZQUMvQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUU7WUFDL0MsV0FBVyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFO1lBQ3BELGFBQWEsRUFBRSxFQUFFLFNBQVMs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QUFJLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDeEMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUN6QixDQUFDO2dCQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDbEIsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUE3UEQsNEJBNlBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgZGVmYXVsdHMsXG4gIGZvckVhY2gsXG4gIGZvck93bixcbiAgdW5pcSxcbiAgemlwT2JqZWN0XG59IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBSZXNvbHZlciBmcm9tICcuL3Jlc29sdmVyJztcbmltcG9ydCB7IERpY3QsIENvbnN0cnVjdG9yIH0gZnJvbSAnLi4vdXRpbHMvdHlwZXMnO1xuaW1wb3J0IERlbmFsaU9iamVjdCBmcm9tICcuL29iamVjdCc7XG5pbXBvcnQgeyBpbmplY3RJbnN0YW5jZSB9IGZyb20gJy4vaW5qZWN0JztcblxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBpbnN0YW50aWF0ZTogZmFsc2UsXG4gIHNpbmdsZXRvbjogdHJ1ZVxufTtcblxuLyoqXG4gKiBBbnl0aW1lIHRoZSBjb250YWluZXIgZmlyc3QgbG9va3MgdXAgYSBwYXJ0aWN1bGFyIGVudHJ5LCBpZiB0aGF0IGVudHJ5IGRlZmluZXMgYSBtZXRob2QgdW5kZXIgdGhlXG4gKiBgb25Mb2FkYCBzeW1ib2wsIGl0IHdpbGwgaW52b2tlIHRoYXQgbWV0aG9kIHdpdGggdGhlIGxvb2tlZCB1cCBlbnRyeSB2YWx1ZS5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3Igc2ltdWxhdGluZyBwc2V1ZG8tZGVzaWduLXRpbWUgbG9naWMuIEZvciBleGFtcGxlLCBNb2RlbCBjbGFzc2VzIHVzZSB0aGlzIHRvXG4gKiBjcmVhdGUgZ2V0dGVyIGFuZCBzZXR0ZXIgbWV0aG9kcyBmb3IgYXR0cmlidXRlcyB3aGljaCBmb3J3YXJkIHRvIHRoZSB1bmRlcmx5aW5nIE9STSBpbnN0YW5jZS4gVGhlXG4gKiByZXN1bHQgaXMgdGhhdCB3ZSBjYW4gcHJvZ3JhbW1hdGljYWxseSBjdXN0b21pemUgdGhlIGNsYXNzIHByb3RvdHlwZSBiYXNlZCBvbiBzdGF0aWNcbiAqIGRlY2xhcmF0aW9ucywgbG9vc2VseSBhbmFsYWdvdXMgdG8gUnVieSdzIGBpbmNsdWRlZGAgaG9vay5cbiAqXG4gKiBXYXJuaW5nOiB0aGlzIGlzIGEgdmVyeSBsb3ctbGV2ZWwgQVBJLCBhbmQgc2hvdWxkIGJlIHVzZWQgc3BhcmluZ2x5ISBTaW5jZSB0aGUgb25Mb2FkIGhvb2sgaXNcbiAqIGludm9rZWQgd2l0aCB0aGUgX3N0YXRpY18gY2xhc3MsIHRha2UgY2FyZSB0byBhdm9pZCBzaGFyaW5nIGFueSBjb250YWluZXItc3BlY2lmaWMgc3RhdGUgb24gdGhhdFxuICogc3RhdGljIGNsYXNzLCBsZXN0IHlvdSBwb2xsdXRlIGFjcm9zcyBjb250YWluZXJzIChzaW5jZSBjb250YWluZXJzIHNoYXJlIHRoZSBzdGF0aWMgY2xhc3NcbiAqIHJlZmVyZW5jZSlcbiAqL1xuZXhwb3J0IGNvbnN0IG9uTG9hZCA9IFN5bWJvbCgnY29udGFpbmVyIG9uTG9hZCBtZXRob2QnKTtcblxuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSBjb250YWluZXIgc2hvdWxkIHRyZWF0IHRoZSBtZW1iZXIgYXMgYSBzaW5nbGV0b24uIElmIHBhaXJlZCB3aXRoIGBpbnN0YW50aWF0ZWAsIHRoZVxuICAgKiBjb250YWluZXIgd2lsbCBjcmVhdGUgdGhhdCBzaW5nbGV0b24gb24gdGhlIGZpcnN0IGxvb2t1cC4gSWYgbm90LCB0aGVuIHRoZSBjb250YWluZXIgd2lsbFxuICAgKiBhc3N1bWUgdG8gbWVtYmVyIGlzIGFscmVhZHkgYSBzaW5nbGV0b25cbiAgICovXG4gIHNpbmdsZXRvbj86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBUaGUgY29udGFpbmVyIHNob3VsZCBjcmVhdGUgYW4gaW5zdGFuY2Ugb24gbG9va3VwLiBJZiBgc2luZ2xldG9uYCBpcyBhbHNvIHRydWUsIG9ubHkgb25lXG4gICAqIGluc3RhbmNlIHdpbGwgYmUgY3JlYXRlZFxuICAgKi9cbiAgaW5zdGFudGlhdGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEEgRmFjdG9yeSBpcyBhIHdyYXBwZXIgb2JqZWN0IGFyb3VuZCBhIGNvbnRhaW5lcmVkIGNsYXNzLiBJdCBpbmNsdWRlcyB0aGUgb3JpZ2luYWwgY2xhc3MsIHBsdXMgYVxuICogYGNyZWF0ZSgpYCBtZXRob2QgdGhhdCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgYSBuZXcgaW5zdGFuY2UgYW5kIGFwcGx5aW5nIGFueSBhcHByb3ByaWF0ZVxuICogaW5qZWN0aW9ucy5cbiAqXG4gKiBUaGUgRmFjdG9yeSBvYmplY3QgaXMgdXNlZCB0byBpc29sYXRlIHRoaXMgaW5qZWN0aW9uIGxvZ2ljIHRvIGEgc2luZ2xlIHNwb3QuIFRoZSBjb250YWluZXIgdXNlc1xuICogdGhpcyBGYWN0b3J5IG9iamVjdCBpbnRlcm5hbGx5IHdoZW4gaW5zdGFudGlhdGluZyBkdXJpbmcgYSBgbG9va3VwYCBjYWxsLiBVc2VycyBjYW4gYWxzbyBmZXRjaFxuICogdGhpcyBGYWN0b3J5IHZpYSBgZmFjdG9yeUZvcigpYCBpZiB0aGV5IHdhbnQgdG8gY29udHJvbCBpbnN0YW50aWF0aW9uLiBBIGdvb2QgZXhhbXBsZSBoZXJlIGlzXG4gKiBNb2RlbHMuIFdlIGNvdWxkIGFsbG93IHRoZSBjb250YWluZXIgdG8gaW5zdGFudGlhdGUgbW9kZWxzIGJ5IHNldHRpbmcgYGluc3RhbnRpYXRlOiB0cnVlYCwgYnV0XG4gKiB0aGF0IGlzIGluY29udmVuaWVudCAtIE1vZGVscyB0eXBpY2FsbHkgdGFrZSBjb25zdHJ1Y3RvciBhcmd1bWVudHMgKGNvbnRhaW5lciBpbnN0YW50aWF0aW9uXG4gKiBkb2Vzbid0IHN1cHBvcnQgdGhhdCksIGFuZCB3ZSBmcmVxdWVudGx5IHdhbnQgdG8gZmV0Y2ggdGhlIE1vZGVsIGNsYXNzIGl0c2VsZiwgd2hpY2ggaXNcbiAqIGN1bWJlcnNvbWUgd2l0aCBgaW5zdGFudGlhdGU6IHRydWVgLlxuICpcbiAqIEluc3RlYWQsIHVzZXJzIGNhbiBzaW1wbHkgdXNlIGBmYWN0b3J5Rm9yYCB0byBmZXRjaCB0aGlzIEZhY3Rvcnkgd3JhcHBlci4gVGhlbiB0aGV5IGNhblxuICogaW5zdGFudGlhdGUgdGhlIG9iamVjdCBob3dldmVyIHRoZXkgbGlrZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWN0b3J5PFQ+IHtcbiAgY2xhc3M6IENvbnN0cnVjdG9yPFQ+O1xuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiBUO1xufVxuXG4vKipcbiAqIFRoZSBjb250YWluZXIgaXMgdGhlIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHNvbHV0aW9uIGZvciBEZW5hbGkuIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBhYnN0cmFjdGluZ1xuICogYXdheSB3aGVyZSBhIGNsYXNzIGNhbWUgZnJvbS4gVGhpcyBhbGxvd3Mgc2V2ZXJhbCB0aGluZ3M6XG4gKlxuICogICAqIEFwcHMgY2FuIGNvbnN1bWUgY2xhc3NlcyB0aGF0IG9yaWdpbmF0ZSBmcm9tIGFueXdoZXJlIGluIHRoZSBhZGRvbiBkZXBlbmRlbmN5IHRyZWUsIHdpdGhvdXRcbiAqICAgICBuZWVkaW5nIHRvIGNhcmUvc3BlY2lmeSB3aGVyZS5cbiAqICAgKiBXZSBjYW4gbW9yZSBlYXNpbHkgdGVzdCBwYXJ0cyBvZiB0aGUgZnJhbWV3b3JrIGJ5IG1vY2tpbmcgb3V0IGNvbnRhaW5lciBlbnRyaWVzIGluc3RlYWQgb2ZcbiAqICAgICBkZWFsaW5nIHdpdGggaGFyZGNvZGluZyBkZXBlbmRlbmNpZXNcbiAqICAgKiBTdXBwb3J0IGNsZWFuIGluamVjdGlvbiBzeW50YXgsIGkuZS4gYG1haWxlciA9IHNlcnZpY2UoKTtgLlxuICpcbiAqIEluIG9yZGVyIHRvIGRvIHRoZXNlLCB0aGUgY29udGFpbmVyIG11c3QgY29udHJvbCBjcmVhdGluZyBpbnN0YW5jZXMgb2YgYW55IGNsYXNzZXMgaXQgaG9sZHMuIFRoaXNcbiAqIGFsbG93cyB1cyB0byBlbnN1cmUgaW5qZWN0aW9ucyBhcmUgYXBwbGllZCB0byBldmVyeSBpbnN0YW5jZS4gSWYgeW91IG5lZWQgdG8gY3JlYXRlIHlvdXIgb3duXG4gKiBpbnN0YW5jZSBvZiBhIGNsYXNzLCB5b3UgY2FuIHVzZSB0aGUgYGZhY3RvcnlGb3JgIG1ldGhvZCB3aGljaCBhbGxvd3MgeW91IHRvIGNyZWF0ZSB5b3VyIG93blxuICogaW5zdGFuY2Ugd2l0aCBpbmplY3Rpb25zIHByb3Blcmx5IGFwcGxpZWQuXG4gKlxuICogSG93ZXZlciwgdGhpcyBzaG91bGQgYmUgcmVsYXRpZWx5IHJhcmUgLSBtb3N0IG9mIHRoZSB0aW1lIHlvdSdsbCBiZSBkZWFsaW5nIHdpdGggb2JqZWN0cyB0aGF0XG4gKiBhcmUgY29udHJvbGxlZCBieSB0aGUgZnJhbWV3b3JrLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIge1xuXG4gIC8qKlxuICAgKiBNYW51YWwgcmVnaXN0cmF0aW9ucyB0aGF0IHNob3VsZCBvdmVycmlkZSByZXNvbHZlciByZXRyaWV2ZWQgdmFsdWVzXG4gICAqL1xuICBwcml2YXRlIHJlZ2lzdHJ5OiBEaWN0PENvbnN0cnVjdG9yPGFueT4+ID0ge307XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHJlc29sdmVycyB1c2VkIHRvIHJldHJpZXZlIGNvbnRhaW5lciBtZW1iZXJzLiBSZXNvbHZlcnMgYXJlIHRyaWVkIGluIG9yZGVyLCBmaXJzdFxuICAgKiB0byBmaW5kIHRoZSBtZW1iZXIgd2lucy4gTm9ybWFsbHksIGVhY2ggYWRkb24gd2lsbCBzdXBwbHkgaXQncyBvd24gcmVzb2x2ZXIsIGFsbG93aW5nIGZvclxuICAgKiBhZGRvbiBvcmRlciBhbmQgcHJlY2VkZW5jZSB3aGVuIGxvb2tpbmcgdXAgY29udGFpbmVyIGVudHJpZXMuXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVyczogUmVzb2x2ZXJbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBjYWNoZSBvZiBsb29rdXAgdmFsdWVzXG4gICAqL1xuICBwcml2YXRlIGxvb2t1cHM6IERpY3Q8eyBmYWN0b3J5OiBGYWN0b3J5PGFueT4sIGluc3RhbmNlOiBhbnkgfT4gPSB7fTtcblxuICAvKipcbiAgICogSW50ZXJuYWwgY2FjaGUgb2YgY2xhc3Nlc1xuICAgKi9cbiAgcHJpdmF0ZSBjbGFzc0xvb2t1cHM6IERpY3Q8Q29uc3RydWN0b3I8YW55Pj4gPSB7fTtcblxuICAvKipcbiAgICogSW50ZXJuYWwgY2FjaGUgb2YgZmFjdG9yaWVzXG4gICAqL1xuICBwcml2YXRlIGZhY3RvcnlMb29rdXBzOiBEaWN0PEZhY3Rvcnk8YW55Pj4gPSB7fTtcblxuICAvKipcbiAgICogT3B0aW9ucyBmb3IgY29udGFpbmVyIGVudHJpZXMuIEtleWVkIG9uIHNwZWNpZmllciBvciB0eXBlLiBTZWUgQ29udGFpbmVyT3B0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgb3B0aW9uczogRGljdDxDb250YWluZXJPcHRpb25zPiA9IHtcbiAgICBhcHA6IHsgc2luZ2xldG9uOiB0cnVlLCBpbnN0YW50aWF0ZTogdHJ1ZSB9LFxuICAgIGFjdGlvbjogeyBzaW5nbGV0b246IGZhbHNlLCBpbnN0YW50aWF0ZTogdHJ1ZSB9LFxuICAgIGNvbmZpZzogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiBmYWxzZSB9LFxuICAgIGluaXRpYWxpemVyOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0sXG4gICAgJ29ybS1hZGFwdGVyJzogeyBzaW5nbGV0b246IHRydWUsIGluc3RhbnRpYXRlOiB0cnVlIH0sXG4gICAgbW9kZWw6IHsgc2luZ2xldG9uOiBmYWxzZSwgaW5zdGFudGlhdGU6IGZhbHNlIH0sXG4gICAgcGFyc2VyOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICBzZXJpYWxpemVyOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICBzZXJ2aWNlOiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfSxcbiAgICB2aWV3OiB7IHNpbmdsZXRvbjogdHJ1ZSwgaW5zdGFudGlhdGU6IHRydWUgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBtZXRhZGF0YSBzdG9yZS4gU2VlIGBtZXRhRm9yKClgXG4gICAqL1xuICBwcml2YXRlIG1ldGE6IE1hcDxhbnksIERpY3Q8YW55Pj4gPSBuZXcgTWFwKCk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBjb250YWluZXIgd2l0aCBhIGJhc2UgKGhpZ2hlc3QgcHJlY2VkZW5jZSkgcmVzb2x2ZXIgYXQgdGhlIGdpdmVuIGRpcmVjdG9yeS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHJvb3Q6IHN0cmluZykge1xuICAgIHRoaXMucmVzb2x2ZXJzLnB1c2gobmV3IFJlc29sdmVyKHJvb3QpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByZXNvbHZlciB0byB0aGUgY29udGFpbmVyIHRvIHVzZSBmb3IgbG9va3Vwcy4gTmV3IHJlc29sdmVycyBhcmUgYWRkZWQgYXQgbG93ZXN0IHByaW9yaXR5LFxuICAgKiBzbyBhbGwgcHJldmlvdXNseSBhZGRlZCByZXNvbHZlcnMgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gICAqL1xuICBhZGRSZXNvbHZlcihyZXNvbHZlcjogUmVzb2x2ZXIpIHtcbiAgICB0aGlzLnJlc29sdmVycy5wdXNoKHJlc29sdmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBtYW51YWwgcmVnaXN0cmF0aW9uIHRoYXQgd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciBhbnkgcmVzb2x2ZWQgbG9va3Vwcy5cbiAgICovXG4gIHJlZ2lzdGVyKHNwZWNpZmllcjogc3RyaW5nLCBlbnRyeTogYW55LCBvcHRpb25zPzogQ29udGFpbmVyT3B0aW9ucykge1xuICAgIHRoaXMucmVnaXN0cnlbc3BlY2lmaWVyXSA9IGVudHJ5O1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBmb3JPd24ob3B0aW9ucywgKHZhbHVlLCBrZXk6IGtleW9mIENvbnRhaW5lck9wdGlvbnMpID0+IHtcbiAgICAgICAgdGhpcy5zZXRPcHRpb24oc3BlY2lmaWVyLCBrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGZhY3RvcnkgZm9yIHRoZSBnaXZlbiBzcGVjaWZpZXIuIFR5cGljYWxseSBvbmx5IHVzZWQgd2hlbiB5b3UgbmVlZCB0byBjb250cm9sIHdoZW5cbiAgICogYW4gb2JqZWN0IGlzIGluc3RhbnRpYXRlZC5cbiAgICovXG4gIGZhY3RvcnlGb3I8VCA9IGFueT4oc3BlY2lmaWVyOiBzdHJpbmcsIG9wdGlvbnM6IHsgbG9vc2U/OiBib29sZWFuIH0gPSB7fSk6IEZhY3Rvcnk8VD4ge1xuICAgIGxldCBmYWN0b3J5ID0gdGhpcy5mYWN0b3J5TG9va3Vwc1tzcGVjaWZpZXJdO1xuICAgIGlmICghZmFjdG9yeSkge1xuICAgICAgbGV0IGtsYXNzID0gdGhpcy5jbGFzc0xvb2t1cHNbc3BlY2lmaWVyXTtcblxuICAgICAgaWYgKCFrbGFzcykge1xuICAgICAgICBrbGFzcyA9IHRoaXMucmVnaXN0cnlbc3BlY2lmaWVyXTtcblxuICAgICAgICBpZiAoIWtsYXNzKSB7XG4gICAgICAgICAgZm9yRWFjaCh0aGlzLnJlc29sdmVycywgKHJlc29sdmVyKSA9PiB7XG4gICAgICAgICAgICBrbGFzcyA9IHJlc29sdmVyLnJldHJpZXZlKHNwZWNpZmllcik7XG4gICAgICAgICAgICBpZiAoa2xhc3MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtsYXNzKSB7XG4gICAgICAgICAgdGhpcy5jbGFzc0xvb2t1cHNbc3BlY2lmaWVyXSA9IGtsYXNzO1xuICAgICAgICAgIHRoaXMub25GaXJzdExvb2t1cChzcGVjaWZpZXIsIGtsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWtsYXNzKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmxvb3NlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gY2xhc3MgZm91bmQgZm9yICR7IHNwZWNpZmllciB9YCk7XG4gICAgICB9XG5cbiAgICAgIGZhY3RvcnkgPSB0aGlzLmZhY3RvcnlMb29rdXBzW3NwZWNpZmllcl0gPSB0aGlzLmJ1aWxkRmFjdG9yeShzcGVjaWZpZXIsIGtsYXNzKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhY3Rvcnk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHNvbWUgbG9naWMgYW55dGltZSBhbiBlbnRyeSBpcyBmaXJzdCBsb29rZWQgdXAgaW4gdGhlIGNvbnRhaW5lci4gSGVyZSwgd2UgYWRkIHNvbWUgbWV0YWRhdGFcbiAgICogc28gdGhlIGNsYXNzIGNhbiBrbm93IHdoYXQgc3BlY2lmaWVyIGl0IHdhcyBsb29rZWQgdXAgdW5kZXIsIGFzIHdlbGwgYXMgcnVubmluZyB0aGUgc3BlY2lhbFxuICAgKiBvbkxvYWQgaG9vaywgYWxsb3dpbmcgY2xhc3NlcyB0byBydW4gc29tZSBwc3VlZG8tZGVzaWduLXRpbWUgbG9naWMuXG4gICAqL1xuICBvbkZpcnN0TG9va3VwKHNwZWNpZmllcjogc3RyaW5nLCBrbGFzczogYW55KSB7XG4gICAgdGhpcy5tZXRhRm9yKGtsYXNzKS5jb250YWluZXJOYW1lID0gc3BlY2lmaWVyLnNwbGl0KCc6JylbMV07XG4gICAgaWYgKGtsYXNzW29uTG9hZF0pIHtcbiAgICAgIGtsYXNzW29uTG9hZF0oa2xhc3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb29rdXAgdGhlIGdpdmVuIHNwZWNpZmllciBpbiB0aGUgY29udGFpbmVyLiBJZiBvcHRpb25zLmxvb3NlIGlzIHRydWUsIGZhaWxlZCBsb29rdXBzIHdpbGxcbiAgICogcmV0dXJuIHVuZGVmaW5lZCByYXRoZXIgdGhhbiB0aHJvdy5cbiAgICovXG4gIGxvb2t1cDxUID0gYW55PihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uczogeyBsb29zZT86IGJvb2xlYW4gfSA9IHt9KTogVCB7XG4gICAgbGV0IHNpbmdsZXRvbiA9IHRoaXMuZ2V0T3B0aW9uKHNwZWNpZmllciwgJ3NpbmdsZXRvbicpICE9PSBmYWxzZTtcblxuICAgIGlmIChzaW5nbGV0b24pIHtcbiAgICAgIGxldCBsb29rdXAgPSB0aGlzLmxvb2t1cHNbc3BlY2lmaWVyXTtcbiAgICAgIGlmIChsb29rdXApIHtcbiAgICAgICAgcmV0dXJuIGxvb2t1cC5pbnN0YW5jZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZmFjdG9yeSA9IHRoaXMuZmFjdG9yeUZvcjxUPihzcGVjaWZpZXIsIG9wdGlvbnMpO1xuICAgIGlmICghZmFjdG9yeSkgeyByZXR1cm47IH1cblxuICAgIGlmICh0aGlzLmdldE9wdGlvbihzcGVjaWZpZXIsICdpbnN0YW50aWF0ZScpID09PSBmYWxzZSkge1xuICAgICAgbGV0IGtsYXNzID0gKDxhbnk+ZmFjdG9yeSkuY2xhc3M7XG4gICAgICBpZiAoIXNpbmdsZXRvbikge1xuICAgICAgICByZXR1cm4ga2xhc3M7XG4gICAgICB9XG4gICAgICBsZXQgaW5zdGFuY2UgPSBrbGFzcztcbiAgICAgIGluamVjdEluc3RhbmNlKGluc3RhbmNlLCB0aGlzKTtcbiAgICAgIHRoaXMubG9va3Vwc1tzcGVjaWZpZXJdID0geyBmYWN0b3J5LCBpbnN0YW5jZSB9O1xuICAgICAgcmV0dXJuIGtsYXNzO1xuICAgIH1cblxuICAgIGxldCBpbnN0YW5jZSA9IGZhY3RvcnkuY3JlYXRlKCk7XG5cbiAgICBpZiAoc2luZ2xldG9uICYmIGluc3RhbmNlKSB7XG4gICAgICB0aGlzLmxvb2t1cHNbc3BlY2lmaWVyXSA9IHsgZmFjdG9yeSwgaW5zdGFuY2UgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogTG9va3VwIGFsbCB0aGUgZW50cmllcyBmb3IgYSBnaXZlbiB0eXBlIGluIHRoZSBjb250YWluZXIuIFRoaXMgd2lsbCBhc2sgYWxsIHJlc29sdmVycyB0b1xuICAgKiBlYWdlcmx5IGxvYWQgYWxsIGNsYXNzZXMgZm9yIHRoaXMgdHlwZS4gUmV0dXJucyBhbiBvYmplY3Qgd2hvc2Uga2V5cyBhcmUgY29udGFpbmVyIHNwZWNpZmllcnNcbiAgICogYW5kIHZhbHVlcyBhcmUgdGhlIGxvb2tlZCB1cCB2YWx1ZXMgZm9yIHRob3NlIHNwZWNpZmllcnMuXG4gICAqL1xuICBsb29rdXBBbGw8VCA9IGFueT4odHlwZTogc3RyaW5nKTogRGljdDxUPiB7XG4gICAgbGV0IGVudHJpZXMgPSB0aGlzLmF2YWlsYWJsZUZvclR5cGUodHlwZSk7XG4gICAgbGV0IHZhbHVlcyA9IGVudHJpZXMubWFwKChlbnRyeSkgPT4gdGhpcy5sb29rdXAoYCR7IHR5cGUgfTokeyBlbnRyeSB9YCkpO1xuICAgIHJldHVybiA8RGljdDxUPj56aXBPYmplY3QoZW50cmllcywgdmFsdWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGVudHJ5IG5hbWVzIGZvciBhbGwgZW50cmllcyB1bmRlciB0aGlzIHR5cGUuIEVudHJpZXMgYXJlIGVhZ2VybHkgbG9va2VkIHVwLFxuICAgKiBzbyByZXNvbHZlcnMgd2lsbCBhY3RpdmVseSBzY2FuIGZvciBhbGwgbWF0Y2hpbmcgZmlsZXMsIGZvciBleGFtcGxlLiBVc2Ugc3BhcmluZ2x5LlxuICAgKi9cbiAgYXZhaWxhYmxlRm9yVHlwZSh0eXBlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJlZ2lzdHJhdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLnJlZ2lzdHJ5KS5maWx0ZXIoKHNwZWNpZmllcikgPT4ge1xuICAgICAgcmV0dXJuIHNwZWNpZmllci5zdGFydHNXaXRoKHR5cGUpO1xuICAgIH0pO1xuICAgIGxldCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZXJzLnJlZHVjZSgoZW50cmllcywgcmVzb2x2ZXIpID0+IHtcbiAgICAgIHJldHVybiBlbnRyaWVzLmNvbmNhdChyZXNvbHZlci5hdmFpbGFibGVGb3JUeXBlKHR5cGUpKTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHVuaXEocmVnaXN0cmF0aW9ucy5jb25jYXQocmVzb2x2ZWQpKS5tYXAoKHNwZWNpZmllcikgPT4gc3BlY2lmaWVyLnNwbGl0KCc6JylbMV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgdmFsdWUgZm9yIHRoZSBnaXZlbiBvcHRpb24gb24gdGhlIGdpdmVuIHNwZWNpZmllci4gU3BlY2lmaWVyIG1heSBiZSBhIGZ1bGwgc3BlY2lmaWVyXG4gICAqIG9yIGp1c3QgYSB0eXBlLlxuICAgKi9cbiAgZ2V0T3B0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb25OYW1lOiBrZXlvZiBDb250YWluZXJPcHRpb25zKTogYW55IHtcbiAgICBsZXQgWyB0eXBlIF0gPSBzcGVjaWZpZXIuc3BsaXQoJzonKTtcbiAgICBsZXQgb3B0aW9ucyA9IGRlZmF1bHRzKHRoaXMub3B0aW9uc1tzcGVjaWZpZXJdLCB0aGlzLm9wdGlvbnNbdHlwZV0sIERFRkFVTFRfT1BUSU9OUyk7XG4gICAgcmV0dXJuIG9wdGlvbnNbb3B0aW9uTmFtZV07XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBnaXZlIG9wdGlvbiBmb3IgdGhlIGdpdmVuIHNwZWNpZmllciBvciB0eXBlLlxuICAgKi9cbiAgc2V0T3B0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb25OYW1lOiBrZXlvZiBDb250YWluZXJPcHRpb25zLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnNbc3BlY2lmaWVyXSkge1xuICAgICAgdGhpcy5vcHRpb25zW3NwZWNpZmllcl0gPSB7IHNpbmdsZXRvbjogZmFsc2UsIGluc3RhbnRpYXRlOiBmYWxzZSB9O1xuICAgIH1cbiAgICB0aGlzLm9wdGlvbnNbc3BlY2lmaWVyXVtvcHRpb25OYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IGNvbnN1bWVycyB0byBzdG9yZSBtZXRhZGF0YSBvbiB0aGUgY29udGFpbmVyLiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBzdG9yZSBkYXRhXG4gICAqIHRpZWQgdG8gdGhlIGxpZmV0aW1lIG9mIHRoZSBjb250YWluZXIuIEZvciBleGFtcGxlLCB5b3UgbWF5IGhhdmUgYW4gZXhwZW5zaXZlIGNhbGN1bGF0aW9uIHRoYXRcbiAgICogeW91IGNhbiBjYWNoZSBvbmNlIHBlciBjbGFzcy4gUmF0aGVyIHRoYW4gc3RvcmluZyB0aGF0IGNhY2hlZCB2YWx1ZSBvbiBgdGhpcy5jb25zdHJ1Y3RvcmAsXG4gICAqIHdoaWNoIGlzIHNoYXJlZCBhY3Jvc3MgY29udGFpbmVycywgeW91IGNhbiBzdG9yZSBpdCBvbiBgY29udGFpbmVyLm1ldGFGb3IodGhpcy5jb25zdHJ1Y3RvcilgLFxuICAgKiBlbnN1cmluZyB0aGF0IHlvdXIgY29udGFpbmVyIGRvZXNuJ3QgcG9sbHV0ZSBvdGhlcnMuXG4gICAqL1xuICBtZXRhRm9yKGtleTogYW55KSB7XG4gICAgaWYgKCF0aGlzLm1ldGEuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMubWV0YS5zZXQoa2V5LCB7fSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1ldGEuZ2V0KGtleSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYW55IGNhY2hlZCBsb29rdXBzIGZvciB0aGlzIHNwZWNpZmllci4gWW91IHByb2JhYmx5IGRvbid0IHdhbnQgdG8gdXNlIHRoaXMuIFRoZSBvbmx5XG4gICAqIHNpZ25pZmljYW50IHVzZSBjYXNlIGlzIGZvciB0ZXN0aW5nIHRvIGFsbG93IHRlc3QgY29udGFpbmVycyB0byBvdmVycmlkZSBhbiBhbHJlYWR5IGxvb2tlZCB1cFxuICAgKiB2YWx1ZS5cbiAgICovXG4gIGNsZWFyQ2FjaGUoc3BlY2lmaWVyOiBzdHJpbmcpIHtcbiAgICBkZWxldGUgdGhpcy5sb29rdXBzW3NwZWNpZmllcl07XG4gICAgZGVsZXRlIHRoaXMuY2xhc3NMb29rdXBzW3NwZWNpZmllcl07XG4gICAgZGVsZXRlIHRoaXMuZmFjdG9yeUxvb2t1cHNbc3BlY2lmaWVyXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgZmFjdG9yeSB3cmFwcGVyIGZvciBhIGdpdmVuIGNvbnRhaW5lciBtZW1iZXJcbiAgICovXG4gIHByaXZhdGUgYnVpbGRGYWN0b3J5PFQgZXh0ZW5kcyBEZW5hbGlPYmplY3Q+KHNwZWNpZmllcjogc3RyaW5nLCBrbGFzczogQ29uc3RydWN0b3I8VD4pOiBGYWN0b3J5PFQ+IHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcztcbiAgICByZXR1cm4ge1xuICAgICAgY2xhc3M6IGtsYXNzLFxuICAgICAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGFzc2VydCh0eXBlb2Yga2xhc3MgPT09ICdmdW5jdGlvbicsIGBVbmFibGUgdG8gaW5zdGFudGlhdGUgJHsgc3BlY2lmaWVyIH0gKGl0J3Mgbm90IGEgY29uc3RydWN0b3IpLiBUcnkgc2V0dGluZyB0aGUgJ2luc3RhbnRpYXRlOiBmYWxzZScgb3B0aW9uIG9uIHRoaXMgY29udGFpbmVyIGVudHJ5IHRvIGF2b2lkIGluc3RhbnRpYXRpbmcgaXRgKTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gPFQ+bmV3IGtsYXNzKCk7XG4gICAgICAgIGluamVjdEluc3RhbmNlKGluc3RhbmNlLCBjb250YWluZXIpO1xuICAgICAgICBpZiAodHlwZW9mIGluc3RhbmNlLmluaXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpbnN0YW5jZS5pbml0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG4iXX0=