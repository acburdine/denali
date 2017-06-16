"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
const lodash_1 = require("lodash");
const ava_1 = require("ava");
const denali_1 = require("denali");
// Ensure a given finder method invokes it's corresponding adapter method
function finderInvokesAdapter(t, finder, adapterReturn, ...args) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        t.plan(1);
        let container = t.context.container;
        container.register('model:post', class Post extends denali_1.Model {
        });
        container.register('orm-adapter:post', {
            buildRecord() { return {}; },
            [finder]() {
                t.pass();
                return adapterReturn;
            },
            getAttribute() { return null; }
        }, { instantiate: false, singleton: true });
        let klass = container.factoryFor('model:post').class;
        yield klass[finder](container, ...args);
    });
}
finderInvokesAdapter.title = (providedTitle, finder) => `${finder} invokes the ${finder} method on the adapter`;
// Check the results of a finder method call, and stub out the corresponding adapter method
function finderReturns(t, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        t.plan(1);
        let container = t.context.container;
        container.register('model:post', class Post extends denali_1.Model {
        });
        container.register('orm-adapter:post', {
            buildRecord() { return {}; },
            [options.finder]: options.adapterMethod,
            getAttribute() { return null; },
        }, { instantiate: false, singleton: true });
        let klass = container.factoryFor('model:post').class;
        let result = yield klass[options.finder](container, options.arg);
        options.assert(t, result);
    });
}
ava_1.default.beforeEach((t) => {
    t.context.container = new denali_1.Container(__dirname);
});
ava_1.default('type returns the dasherized class name of the model', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class BlogPost extends denali_1.Model {
    }
    t.is(BlogPost.type, 'blog-post');
}));
ava_1.default('type omits trailing "Model" from class name if present', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class BlogPostModel extends denali_1.Model {
    }
    t.is(BlogPostModel.type, 'blog-post');
}));
ava_1.default('adapter uses model-specific one if found', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', class Post extends denali_1.Model {
    });
    container.register('orm-adapter:application', {}, { instantiate: false, singleton: true });
    let PostAdapter = {};
    container.register('orm-adapter:post', PostAdapter, { instantiate: false, singleton: true });
    let klass = container.factoryFor('model:post').class;
    t.is(klass.getAdapter(container), PostAdapter);
}));
ava_1.default('adapter falls back to application if model specific not found', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', class Post extends denali_1.Model {
    });
    let ApplicationAdapter = {};
    container.register('orm-adapter:application', ApplicationAdapter, { instantiate: false, singleton: true });
    let klass = container.factoryFor('model:post').class;
    t.is(klass.getAdapter(container), ApplicationAdapter);
}));
ava_1.default(finderInvokesAdapter, 'find', {}, 1);
ava_1.default(finderInvokesAdapter, 'queryOne', {}, { foo: true });
ava_1.default(finderInvokesAdapter, 'all', []);
ava_1.default(finderInvokesAdapter, 'query', [], { foo: true });
ava_1.default('find returns model instance', finderReturns, {
    finder: 'find',
    arg: 1,
    adapterMethod() { return {}; },
    assert(t, result) {
        t.true(result instanceof denali_1.Model);
    }
});
ava_1.default('find returns null if adapter does', finderReturns, {
    finder: 'find',
    arg: 1,
    adapterMethod() { return null; },
    assert(t, result) {
        t.is(result, null);
    }
});
ava_1.default('queryOne returns model instance', finderReturns, {
    finder: 'queryOne',
    arg: { foo: true },
    adapterMethod() { return {}; },
    assert(t, result) {
        t.true(result instanceof denali_1.Model);
    }
});
ava_1.default('queryOne returns null if adapter does', finderReturns, {
    finder: 'queryOne',
    arg: { foo: true },
    adapterMethod() { return null; },
    assert(t, result) {
        t.is(result, null);
    }
});
ava_1.default('all returns an array', finderReturns, {
    finder: 'all',
    arg: undefined,
    adapterMethod() { return []; },
    assert(t, result) {
        t.true(lodash_1.isArray(result));
    }
});
ava_1.default('query returns an array', finderReturns, {
    finder: 'query',
    arg: { foo: true },
    adapterMethod() { return []; },
    assert(t, result) {
        t.true(lodash_1.isArray(result));
    }
});
ava_1.default('get<RelationshipName> invokes adapter', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', class Comment extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
        getRelated(model, relationship, descriptor, query) {
            t.pass();
            return super.getRelated(model, relationship, descriptor, query);
        }
    });
    let Post = container.factoryFor('model:post');
    let post = yield Post.create(container);
    yield post.getComments();
    var _a;
}));
ava_1.default('get<RelationshipName> throws for non-existent relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', class Post extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
    let Post = container.factoryFor('model:post');
    let post = yield Post.create(container);
    t.throws(function () {
        post.getComments();
    });
}));
ava_1.default('get<RelationshipName> returns related model instances', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', class Comment extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let post = yield Post.create(container).save();
    yield post.setComments([yield Comment.create(container).save()]);
    let comments = yield post.getComments();
    t.true(lodash_1.isArray(comments), 'comments is an array');
    t.is(comments.length, 1, 'has the correct number of comments');
    var _a;
}));
ava_1.default('getRelated allows queries for has many relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let container = t.context.container;
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', (_b = class Comment extends denali_1.Model {
        },
        _b.foo = denali_1.attr('boolean'),
        _b));
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let post = yield Post.create(container).save();
    let commentOne = yield Comment.create(container, { foo: true }).save();
    let commentTwo = yield Comment.create(container, { foo: false }).save();
    yield post.setComments([commentOne, commentTwo]);
    let comments = yield post.getComments({ foo: true });
    t.true(lodash_1.isArray(comments), 'comments is an array');
    t.is(comments.length, 1, 'has the correct number of comments');
    var _a, _b;
}));
ava_1.default('set<RelationshipName> invokes adapter', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', class Comment extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
        setRelated(model, relationship, descriptor, relatedModels) {
            t.pass();
            return super.setRelated(model, relationship, descriptor, relatedModels);
        }
    });
    let Post = container.factoryFor('model:post');
    let post = yield Post.create(container);
    yield post.setComments([]);
    var _a;
}));
ava_1.default('set<RelationshipName> throws for non-existent relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', class Post extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
    let Post = container.factoryFor('model:post');
    let post = yield Post.create(container);
    t.throws(function () {
        post.setComments();
    });
}));
ava_1.default('add<RelationshipName> invokes adapter', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', class Comment extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
        addRelated(model, relationship, descriptor, relatedModel) {
            t.pass();
            return super.setRelated(model, relationship, descriptor, relatedModel);
        }
    });
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let post = yield Post.create(container);
    let comment = yield Comment.create(container);
    yield post.addComment(comment);
    var _a;
}));
ava_1.default('add<RelationshipName> throws for non-existent relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', class Post extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
    let Post = container.factoryFor('model:post');
    let post = yield Post.create(container);
    t.throws(function () {
        post.addComment();
    });
}));
ava_1.default('remove<RelationshipName> invokes adapter', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', (_a = class Post extends denali_1.Model {
        },
        _a.comments = denali_1.hasMany('comment'),
        _a));
    container.register('model:comment', class Comment extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
        removeRelated(model, relationship, descriptor, relatedModel) {
            t.pass();
            return super.removeRelated(model, relationship, descriptor, relatedModel);
        }
    });
    let Post = container.factoryFor('model:post');
    let Comment = container.factoryFor('model:comment');
    let post = yield Post.create(container);
    let comment = yield Comment.create(container);
    yield post.addComment(comment);
    yield post.removeComment(comment);
    var _a;
}));
ava_1.default('remove<RelationshipName> throws for non-existent relationships', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    let container = t.context.container;
    container.register('model:post', class Post extends denali_1.Model {
    });
    container.register('orm-adapter:application', class extends denali_1.MemoryAdapter {
    });
    let Post = container.factoryFor('model:post');
    let post = yield Post.create(container);
    t.throws(function () {
        post.removeComment();
    });
}));
ava_1.default('mapAttributes maps over each attribute', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class Post extends denali_1.Model {
    }
    Post.title = denali_1.attr('string');
    Post.publishedAt = denali_1.attr('date');
    let container = t.context.container;
    container.register('model:post', Post);
    container.register('orm-adapter:post', denali_1.MemoryAdapter);
    let attributes = Post.mapAttributes(container, (descriptor, name) => {
        return { name, value: descriptor.type };
    });
    t.deepEqual(attributes, [
        { name: 'title', value: 'string' },
        { name: 'publishedAt', value: 'date' }
    ]);
}));
ava_1.default('mapRelationships maps over each relationship', (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    class Post extends denali_1.Model {
    }
    Post.author = denali_1.hasOne('user');
    Post.comments = denali_1.hasMany('comment');
    let container = t.context.container;
    container.register('model:post', Post);
    container.register('orm-adapter:post', denali_1.MemoryAdapter);
    let relationships = Post.mapRelationships(container, (descriptor, name) => {
        return { name };
    });
    t.deepEqual(relationships, [
        { name: 'author' },
        { name: 'comments' }
    ]);
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtdGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYWJ1cmRpbmUvUHJvamVjdHMvZGVuYWxpL21haW4vIiwic291cmNlcyI6WyJ0ZXN0L3VuaXQvZGF0YS9tb2RlbC10ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDBFQUEwRTtBQUMxRSxtQ0FBaUM7QUFDakMsNkJBQWlEO0FBQ2pELG1DQUFnRjtBQUVoRix5RUFBeUU7QUFDekUsOEJBQW9DLENBQTZCLEVBQUUsTUFBYyxFQUFFLGFBQWtCLEVBQUUsR0FBRyxJQUFXOztRQUNuSCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxTQUFTLEdBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDL0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsVUFBVyxTQUFRLGNBQUs7U0FBRyxDQUFDLENBQUM7UUFDOUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtZQUNyQyxXQUFXLEtBQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxNQUFNLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNULE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDdkIsQ0FBQztZQUNELFlBQVksS0FBVSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNyQyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLEtBQUssR0FBaUIsU0FBUyxDQUFDLFVBQVUsQ0FBUSxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDMUUsTUFBWSxLQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUFBO0FBQ0ssb0JBQXFCLENBQUMsS0FBSyxHQUFHLENBQUMs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Q0FBQztJQUMzRCxVQUFXLFNBQVEsY0FBSzs7SUFDZixXQUFNLEdBQUcsZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLGFBQVEsR0FBRyxnQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXZDLElBQUksU0FBUyxHQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQy9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsc0JBQWEsQ0FBQyxDQUFDO0lBRXRELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxVQUFlLEVBQUUsSUFBWTtRQUNqRixNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztJQUVILENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO1FBQ3pCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUNsQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7S0FDckIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHRzbGludDpkaXNhYmxlOmNvbXBsZXRlZC1kb2NzIG5vLWVtcHR5IG5vLWludmFsaWQtdGhpcyBtZW1iZXItYWNjZXNzICovXG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB0ZXN0LCB7IFRlc3RDb250ZXh0LCBDb250ZXh0IH0gZnJvbSAnYXZhJztcbmltcG9ydCB7IE1vZGVsLCBhdHRyLCBoYXNNYW55LCBoYXNPbmUsIENvbnRhaW5lciwgTWVtb3J5QWRhcHRlciB9IGZyb20gJ2RlbmFsaSc7XG5cbi8vIEVuc3VyZSBhIGdpdmVuIGZpbmRlciBtZXRob2QgaW52b2tlcyBpdCdzIGNvcnJlc3BvbmRpbmcgYWRhcHRlciBtZXRob2RcbmFzeW5jIGZ1bmN0aW9uIGZpbmRlckludm9rZXNBZGFwdGVyKHQ6IFRlc3RDb250ZXh0ICYgQ29udGV4dDxhbnk+LCBmaW5kZXI6IHN0cmluZywgYWRhcHRlclJldHVybjogYW55LCAuLi5hcmdzOiBhbnlbXSkge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6cG9zdCcsIHtcbiAgICBidWlsZFJlY29yZCgpIHsgcmV0dXJuIHt9OyB9LFxuICAgIFtmaW5kZXJdKCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4gYWRhcHRlclJldHVybjtcbiAgICB9LFxuICAgIGdldEF0dHJpYnV0ZSgpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB9LCB7IGluc3RhbnRpYXRlOiBmYWxzZSwgc2luZ2xldG9uOiB0cnVlIH0pO1xuICBsZXQga2xhc3MgPSA8dHlwZW9mIE1vZGVsPmNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPignbW9kZWw6cG9zdCcpLmNsYXNzO1xuICBhd2FpdCAoPGFueT5rbGFzcylbZmluZGVyXShjb250YWluZXIsIC4uLmFyZ3MpO1xufVxuKDxhbnk+ZmluZGVySW52b2tlc0FkYXB0ZXIpLnRpdGxlID0gKHByb3ZpZGVkVGl0bGU6IHN0cmluZywgZmluZGVyOiBzdHJpbmcpID0+IGAkeyBmaW5kZXIgfSBpbnZva2VzIHRoZSAkeyBmaW5kZXIgfSBtZXRob2Qgb24gdGhlIGFkYXB0ZXJgO1xuXG4vLyBDaGVjayB0aGUgcmVzdWx0cyBvZiBhIGZpbmRlciBtZXRob2QgY2FsbCwgYW5kIHN0dWIgb3V0IHRoZSBjb3JyZXNwb25kaW5nIGFkYXB0ZXIgbWV0aG9kXG5hc3luYyBmdW5jdGlvbiBmaW5kZXJSZXR1cm5zKHQ6IFRlc3RDb250ZXh0ICYgQ29udGV4dDxhbnk+LCBvcHRpb25zOiB7XG4gIGZpbmRlcjogc3RyaW5nLFxuICBhcmc6IGFueSxcbiAgYWRhcHRlck1ldGhvZCgpOiBhbnksXG4gIGFzc2VydCh0OiBUZXN0Q29udGV4dCwgcmVzdWx0OiBhbnkpOiB2b2lkXG59KSB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHt9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdvcm0tYWRhcHRlcjpwb3N0Jywge1xuICAgIGJ1aWxkUmVjb3JkKCkgeyByZXR1cm4ge307IH0sXG4gICAgW29wdGlvbnMuZmluZGVyXTogb3B0aW9ucy5hZGFwdGVyTWV0aG9kLFxuICAgIGdldEF0dHJpYnV0ZSgpOiBhbnkgeyByZXR1cm4gbnVsbDsgfSxcbiAgfSwgeyBpbnN0YW50aWF0ZTogZmFsc2UsIHNpbmdsZXRvbjogdHJ1ZSB9KTtcbiAgbGV0IGtsYXNzID0gPHR5cGVvZiBNb2RlbD5jb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOnBvc3QnKS5jbGFzcztcbiAgbGV0IHJlc3VsdCA9IGF3YWl0ICg8YW55PmtsYXNzKVtvcHRpb25zLmZpbmRlcl0oY29udGFpbmVyLCBvcHRpb25zLmFyZyk7XG4gIG9wdGlvbnMuYXNzZXJ0KHQsIHJlc3VsdCk7XG59XG5cblxudGVzdC5iZWZvcmVFYWNoKCh0KSA9PiB7XG4gIHQuY29udGV4dC5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyKF9fZGlybmFtZSk7XG59KTtcblxudGVzdCgndHlwZSByZXR1cm5zIHRoZSBkYXNoZXJpemVkIGNsYXNzIG5hbWUgb2YgdGhlIG1vZGVsJywgYXN5bmMgKHQpID0+IHtcbiAgY2xhc3MgQmxvZ1Bvc3QgZXh0ZW5kcyBNb2RlbCB7fVxuICB0LmlzKEJsb2dQb3N0LnR5cGUsICdibG9nLXBvc3QnKTtcbn0pO1xuXG50ZXN0KCd0eXBlIG9taXRzIHRyYWlsaW5nIFwiTW9kZWxcIiBmcm9tIGNsYXNzIG5hbWUgaWYgcHJlc2VudCcsIGFzeW5jICh0KSA9PiB7XG4gIGNsYXNzIEJsb2dQb3N0TW9kZWwgZXh0ZW5kcyBNb2RlbCB7fVxuICB0LmlzKEJsb2dQb3N0TW9kZWwudHlwZSwgJ2Jsb2ctcG9zdCcpO1xufSk7XG5cbnRlc3QoJ2FkYXB0ZXIgdXNlcyBtb2RlbC1zcGVjaWZpYyBvbmUgaWYgZm91bmQnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCB7fSwgeyBpbnN0YW50aWF0ZTogZmFsc2UsIHNpbmdsZXRvbjogdHJ1ZSB9KTtcbiAgbGV0IFBvc3RBZGFwdGVyID0ge307XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6cG9zdCcsIFBvc3RBZGFwdGVyLCB7IGluc3RhbnRpYXRlOiBmYWxzZSwgc2luZ2xldG9uOiB0cnVlIH0pO1xuXG4gIGxldCBrbGFzcyA9IDx0eXBlb2YgTW9kZWw+Y29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KCdtb2RlbDpwb3N0JykuY2xhc3NcbiAgdC5pcyhrbGFzcy5nZXRBZGFwdGVyKGNvbnRhaW5lciksIFBvc3RBZGFwdGVyKTtcbn0pO1xuXG50ZXN0KCdhZGFwdGVyIGZhbGxzIGJhY2sgdG8gYXBwbGljYXRpb24gaWYgbW9kZWwgc3BlY2lmaWMgbm90IGZvdW5kJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge30pO1xuICBsZXQgQXBwbGljYXRpb25BZGFwdGVyID0ge307XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBBcHBsaWNhdGlvbkFkYXB0ZXIsIHsgaW5zdGFudGlhdGU6IGZhbHNlLCBzaW5nbGV0b246IHRydWUgfSk7XG5cbiAgbGV0IGtsYXNzID0gPHR5cGVvZiBNb2RlbD5jb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOnBvc3QnKS5jbGFzcztcbiAgdC5pcyhrbGFzcy5nZXRBZGFwdGVyKGNvbnRhaW5lciksIEFwcGxpY2F0aW9uQWRhcHRlcik7XG59KTtcblxudGVzdChmaW5kZXJJbnZva2VzQWRhcHRlciwgJ2ZpbmQnLCB7fSwgMSk7XG5cbnRlc3QoZmluZGVySW52b2tlc0FkYXB0ZXIsICdxdWVyeU9uZScsIHt9LCB7IGZvbzogdHJ1ZSB9KTtcblxudGVzdChmaW5kZXJJbnZva2VzQWRhcHRlciwgJ2FsbCcsIFtdKTtcblxudGVzdChmaW5kZXJJbnZva2VzQWRhcHRlciwgJ3F1ZXJ5JywgW10sIHsgZm9vOiB0cnVlIH0pO1xuXG50ZXN0KCdmaW5kIHJldHVybnMgbW9kZWwgaW5zdGFuY2UnLCBmaW5kZXJSZXR1cm5zLCB7XG4gIGZpbmRlcjogJ2ZpbmQnLFxuICBhcmc6IDEsXG4gIGFkYXB0ZXJNZXRob2QoKSB7IHJldHVybiB7fTsgfSxcbiAgYXNzZXJ0KHQ6IFRlc3RDb250ZXh0LCByZXN1bHQ6IGFueSkge1xuICAgIHQudHJ1ZShyZXN1bHQgaW5zdGFuY2VvZiBNb2RlbCk7XG4gIH1cbn0pO1xuXG50ZXN0KCdmaW5kIHJldHVybnMgbnVsbCBpZiBhZGFwdGVyIGRvZXMnLCBmaW5kZXJSZXR1cm5zLCB7XG4gIGZpbmRlcjogJ2ZpbmQnLFxuICBhcmc6IDEsXG4gIGFkYXB0ZXJNZXRob2QoKTogbnVsbCB7IHJldHVybiBudWxsOyB9LFxuICBhc3NlcnQodDogVGVzdENvbnRleHQsIHJlc3VsdDogYW55KSB7XG4gICAgdC5pcyhyZXN1bHQsIG51bGwpO1xuICB9XG59KTtcblxudGVzdCgncXVlcnlPbmUgcmV0dXJucyBtb2RlbCBpbnN0YW5jZScsIGZpbmRlclJldHVybnMsIHtcbiAgZmluZGVyOiAncXVlcnlPbmUnLFxuICBhcmc6IHsgZm9vOiB0cnVlIH0sXG4gIGFkYXB0ZXJNZXRob2QoKSB7IHJldHVybiB7fTsgfSxcbiAgYXNzZXJ0KHQ6IFRlc3RDb250ZXh0LCByZXN1bHQ6IGFueSkge1xuICAgIHQudHJ1ZShyZXN1bHQgaW5zdGFuY2VvZiBNb2RlbCk7XG4gIH1cbn0pO1xuXG50ZXN0KCdxdWVyeU9uZSByZXR1cm5zIG51bGwgaWYgYWRhcHRlciBkb2VzJywgZmluZGVyUmV0dXJucywge1xuICBmaW5kZXI6ICdxdWVyeU9uZScsXG4gIGFyZzogeyBmb286IHRydWUgfSxcbiAgYWRhcHRlck1ldGhvZCgpOiBudWxsIHsgcmV0dXJuIG51bGw7IH0sXG4gIGFzc2VydCh0OiBUZXN0Q29udGV4dCwgcmVzdWx0OiBhbnkpIHtcbiAgICB0LmlzKHJlc3VsdCwgbnVsbCk7XG4gIH1cbn0pO1xuXG50ZXN0KCdhbGwgcmV0dXJucyBhbiBhcnJheScsIGZpbmRlclJldHVybnMsIHtcbiAgZmluZGVyOiAnYWxsJyxcbiAgYXJnOiB1bmRlZmluZWQsXG4gIGFkYXB0ZXJNZXRob2QoKTogYW55W10geyByZXR1cm4gW107IH0sXG4gIGFzc2VydCh0OiBUZXN0Q29udGV4dCwgcmVzdWx0OiBhbnkpIHtcbiAgICB0LnRydWUoaXNBcnJheShyZXN1bHQpKTtcbiAgfVxufSk7XG5cbnRlc3QoJ3F1ZXJ5IHJldHVybnMgYW4gYXJyYXknLCBmaW5kZXJSZXR1cm5zLCB7XG4gIGZpbmRlcjogJ3F1ZXJ5JyxcbiAgYXJnOiB7IGZvbzogdHJ1ZSB9LFxuICBhZGFwdGVyTWV0aG9kKCk6IGFueVtdIHsgcmV0dXJuIFtdOyB9LFxuICBhc3NlcnQodDogVGVzdENvbnRleHQsIHJlc3VsdDogYW55KSB7XG4gICAgdC50cnVlKGlzQXJyYXkocmVzdWx0KSk7XG4gIH1cbn0pO1xuXG50ZXN0KCdnZXQ8UmVsYXRpb25zaGlwTmFtZT4gaW52b2tlcyBhZGFwdGVyJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyBjb21tZW50cyA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6Y29tbWVudCcsIGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBleHRlbmRzIE1lbW9yeUFkYXB0ZXIge1xuICAgIGdldFJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogYW55LCBxdWVyeTogYW55KSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiBzdXBlci5nZXRSZWxhdGVkKG1vZGVsLCByZWxhdGlvbnNoaXAsIGRlc2NyaXB0b3IsIHF1ZXJ5KTtcbiAgICB9XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPignbW9kZWw6cG9zdCcpO1xuICBsZXQgcG9zdCA9IGF3YWl0ICg8YW55PlBvc3QpLmNyZWF0ZShjb250YWluZXIpO1xuICBhd2FpdCBwb3N0LmdldENvbW1lbnRzKCk7XG59KTtcblxudGVzdCgnZ2V0PFJlbGF0aW9uc2hpcE5hbWU+IHRocm93cyBmb3Igbm9uLWV4aXN0ZW50IHJlbGF0aW9uc2hpcHMnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBleHRlbmRzIE1lbW9yeUFkYXB0ZXIge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPignbW9kZWw6cG9zdCcpO1xuICBsZXQgcG9zdCA9IGF3YWl0ICg8YW55PlBvc3QpLmNyZWF0ZShjb250YWluZXIpO1xuICB0LnRocm93cyhmdW5jdGlvbigpIHtcbiAgICBwb3N0LmdldENvbW1lbnRzKCk7XG4gIH0pO1xufSk7XG5cbnRlc3QoJ2dldDxSZWxhdGlvbnNoaXBOYW1lPiByZXR1cm5zIHJlbGF0ZWQgbW9kZWwgaW5zdGFuY2VzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge30pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgY2xhc3MgZXh0ZW5kcyBNZW1vcnlBZGFwdGVyIHt9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOnBvc3QnKTtcbiAgbGV0IENvbW1lbnQgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOmNvbW1lbnQnKTtcbiAgbGV0IHBvc3QgPSBhd2FpdCAoPGFueT5Qb3N0KS5jcmVhdGUoY29udGFpbmVyKS5zYXZlKCk7XG4gIGF3YWl0IHBvc3Quc2V0Q29tbWVudHMoWyBhd2FpdCBDb21tZW50LmNyZWF0ZShjb250YWluZXIpLnNhdmUoKSBdKTtcbiAgbGV0IGNvbW1lbnRzID0gYXdhaXQgcG9zdC5nZXRDb21tZW50cygpO1xuICB0LnRydWUoaXNBcnJheShjb21tZW50cyksICdjb21tZW50cyBpcyBhbiBhcnJheScpO1xuICB0LmlzKGNvbW1lbnRzLmxlbmd0aCwgMSwgJ2hhcyB0aGUgY29ycmVjdCBudW1iZXIgb2YgY29tbWVudHMnKTtcbn0pO1xuXG50ZXN0KCdnZXRSZWxhdGVkIGFsbG93cyBxdWVyaWVzIGZvciBoYXMgbWFueSByZWxhdGlvbnNoaXBzJywgYXN5bmMgKHQpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyBmb28gPSBhdHRyKCdib29sZWFuJyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgY2xhc3MgZXh0ZW5kcyBNZW1vcnlBZGFwdGVyIHt9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOnBvc3QnKTtcbiAgbGV0IENvbW1lbnQgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOmNvbW1lbnQnKTtcbiAgbGV0IHBvc3QgPSBhd2FpdCAoPGFueT5Qb3N0KS5jcmVhdGUoY29udGFpbmVyKS5zYXZlKCk7XG4gIGxldCBjb21tZW50T25lID0gYXdhaXQgQ29tbWVudC5jcmVhdGUoY29udGFpbmVyLCB7IGZvbzogdHJ1ZSB9KS5zYXZlKCk7XG4gIGxldCBjb21tZW50VHdvID0gYXdhaXQgQ29tbWVudC5jcmVhdGUoY29udGFpbmVyLCB7IGZvbzogZmFsc2UgfSkuc2F2ZSgpO1xuICBhd2FpdCBwb3N0LnNldENvbW1lbnRzKFsgY29tbWVudE9uZSwgY29tbWVudFR3byBdKTtcbiAgbGV0IGNvbW1lbnRzID0gYXdhaXQgcG9zdC5nZXRDb21tZW50cyh7IGZvbzogdHJ1ZSB9KTtcbiAgdC50cnVlKGlzQXJyYXkoY29tbWVudHMpLCAnY29tbWVudHMgaXMgYW4gYXJyYXknKTtcbiAgdC5pcyhjb21tZW50cy5sZW5ndGgsIDEsICdoYXMgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIGNvbW1lbnRzJyk7XG59KTtcblxudGVzdCgnc2V0PFJlbGF0aW9uc2hpcE5hbWU+IGludm9rZXMgYWRhcHRlcicsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge30pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgY2xhc3MgZXh0ZW5kcyBNZW1vcnlBZGFwdGVyIHtcbiAgICBzZXRSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IGFueSwgcmVsYXRlZE1vZGVsczogTW9kZWx8TW9kZWxbXSkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4gc3VwZXIuc2V0UmVsYXRlZChtb2RlbCwgcmVsYXRpb25zaGlwLCBkZXNjcmlwdG9yLCByZWxhdGVkTW9kZWxzKTtcbiAgICB9XG4gIH0pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPignbW9kZWw6cG9zdCcpO1xuICBsZXQgcG9zdCA9IGF3YWl0ICg8YW55PlBvc3QpLmNyZWF0ZShjb250YWluZXIpO1xuICBhd2FpdCBwb3N0LnNldENvbW1lbnRzKFtdKTtcbn0pO1xuXG50ZXN0KCdzZXQ8UmVsYXRpb25zaGlwTmFtZT4gdGhyb3dzIGZvciBub24tZXhpc3RlbnQgcmVsYXRpb25zaGlwcycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHt9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdvcm0tYWRhcHRlcjphcHBsaWNhdGlvbicsIGNsYXNzIGV4dGVuZHMgTWVtb3J5QWRhcHRlciB7fSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBwb3N0ID0gYXdhaXQgKDxhbnk+UG9zdCkuY3JlYXRlKGNvbnRhaW5lcik7XG4gIHQudGhyb3dzKGZ1bmN0aW9uKCkge1xuICAgIHBvc3Quc2V0Q29tbWVudHMoKTtcbiAgfSk7XG59KTtcblxudGVzdCgnYWRkPFJlbGF0aW9uc2hpcE5hbWU+IGludm9rZXMgYWRhcHRlcicsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgY29tbWVudHMgPSBoYXNNYW55KCdjb21tZW50Jyk7XG4gIH0pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOmNvbW1lbnQnLCBjbGFzcyBDb21tZW50IGV4dGVuZHMgTW9kZWwge30pO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOmFwcGxpY2F0aW9uJywgY2xhc3MgZXh0ZW5kcyBNZW1vcnlBZGFwdGVyIHtcbiAgICBhZGRSZWxhdGVkKG1vZGVsOiBNb2RlbCwgcmVsYXRpb25zaGlwOiBzdHJpbmcsIGRlc2NyaXB0b3I6IGFueSwgcmVsYXRlZE1vZGVsOiBNb2RlbCkge1xuICAgICAgdC5wYXNzKCk7XG4gICAgICByZXR1cm4gc3VwZXIuc2V0UmVsYXRlZChtb2RlbCwgcmVsYXRpb25zaGlwLCBkZXNjcmlwdG9yLCByZWxhdGVkTW9kZWwpO1xuICAgIH1cbiAgfSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBDb21tZW50ID0gY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KCdtb2RlbDpjb21tZW50Jyk7XG4gIGxldCBwb3N0ID0gYXdhaXQgKDxhbnk+UG9zdCkuY3JlYXRlKGNvbnRhaW5lcik7XG4gIGxldCBjb21tZW50ID0gYXdhaXQgKDxhbnk+Q29tbWVudCkuY3JlYXRlKGNvbnRhaW5lcik7XG4gIGF3YWl0IHBvc3QuYWRkQ29tbWVudChjb21tZW50KTtcbn0pO1xuXG50ZXN0KCdhZGQ8UmVsYXRpb25zaGlwTmFtZT4gdGhyb3dzIGZvciBub24tZXhpc3RlbnQgcmVsYXRpb25zaGlwcycsIGFzeW5jICh0KSA9PiB7XG4gIHQucGxhbigxKTtcbiAgbGV0IGNvbnRhaW5lcjogQ29udGFpbmVyID0gdC5jb250ZXh0LmNvbnRhaW5lcjtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdtb2RlbDpwb3N0JywgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHt9KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdvcm0tYWRhcHRlcjphcHBsaWNhdGlvbicsIGNsYXNzIGV4dGVuZHMgTWVtb3J5QWRhcHRlciB7fSk7XG4gIGxldCBQb3N0ID0gY29udGFpbmVyLmZhY3RvcnlGb3I8TW9kZWw+KCdtb2RlbDpwb3N0Jyk7XG4gIGxldCBwb3N0ID0gYXdhaXQgKDxhbnk+UG9zdCkuY3JlYXRlKGNvbnRhaW5lcik7XG4gIHQudGhyb3dzKGZ1bmN0aW9uKCkge1xuICAgIHBvc3QuYWRkQ29tbWVudCgpO1xuICB9KTtcbn0pO1xuXG50ZXN0KCdyZW1vdmU8UmVsYXRpb25zaGlwTmFtZT4gaW52b2tlcyBhZGFwdGVyJywgYXN5bmMgKHQpID0+IHtcbiAgdC5wbGFuKDEpO1xuICBsZXQgY29udGFpbmVyOiBDb250YWluZXIgPSB0LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyBjb21tZW50cyA9IGhhc01hbnkoJ2NvbW1lbnQnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6Y29tbWVudCcsIGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBleHRlbmRzIE1lbW9yeUFkYXB0ZXIge1xuICAgIHJlbW92ZVJlbGF0ZWQobW9kZWw6IE1vZGVsLCByZWxhdGlvbnNoaXA6IHN0cmluZywgZGVzY3JpcHRvcjogYW55LCByZWxhdGVkTW9kZWw6IE1vZGVsKSB7XG4gICAgICB0LnBhc3MoKTtcbiAgICAgIHJldHVybiBzdXBlci5yZW1vdmVSZWxhdGVkKG1vZGVsLCByZWxhdGlvbnNoaXAsIGRlc2NyaXB0b3IsIHJlbGF0ZWRNb2RlbCk7XG4gICAgfVxuICB9KTtcbiAgbGV0IFBvc3QgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOnBvc3QnKTtcbiAgbGV0IENvbW1lbnQgPSBjb250YWluZXIuZmFjdG9yeUZvcjxNb2RlbD4oJ21vZGVsOmNvbW1lbnQnKTtcbiAgbGV0IHBvc3QgPSBhd2FpdCAoPGFueT5Qb3N0KS5jcmVhdGUoY29udGFpbmVyKTtcbiAgbGV0IGNvbW1lbnQgPSBhd2FpdCAoPGFueT5Db21tZW50KS5jcmVhdGUoY29udGFpbmVyKTtcbiAgYXdhaXQgcG9zdC5hZGRDb21tZW50KGNvbW1lbnQpO1xuICBhd2FpdCBwb3N0LnJlbW92ZUNvbW1lbnQoY29tbWVudCk7XG59KTtcblxudGVzdCgncmVtb3ZlPFJlbGF0aW9uc2hpcE5hbWU+IHRocm93cyBmb3Igbm9uLWV4aXN0ZW50IHJlbGF0aW9uc2hpcHMnLCBhc3luYyAodCkgPT4ge1xuICB0LnBsYW4oMSk7XG4gIGxldCBjb250YWluZXI6IENvbnRhaW5lciA9IHQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIGNsYXNzIFBvc3QgZXh0ZW5kcyBNb2RlbCB7fSk7XG4gIGNvbnRhaW5lci5yZWdpc3Rlcignb3JtLWFkYXB0ZXI6YXBwbGljYXRpb24nLCBjbGFzcyBleHRlbmRzIE1lbW9yeUFkYXB0ZXIge30pO1xuICBsZXQgUG9zdCA9IGNvbnRhaW5lci5mYWN0b3J5Rm9yPE1vZGVsPignbW9kZWw6cG9zdCcpO1xuICBsZXQgcG9zdCA9IGF3YWl0ICg8YW55PlBvc3QpLmNyZWF0ZShjb250YWluZXIpO1xuICB0LnRocm93cyhmdW5jdGlvbigpIHtcbiAgICBwb3N0LnJlbW92ZUNvbW1lbnQoKTtcbiAgfSk7XG59KTtcblxudGVzdCgnbWFwQXR0cmlidXRlcyBtYXBzIG92ZXIgZWFjaCBhdHRyaWJ1dGUnLCBhc3luYyAodCkgPT4ge1xuICBjbGFzcyBQb3N0IGV4dGVuZHMgTW9kZWwge1xuICAgIHN0YXRpYyB0aXRsZSA9IGF0dHIoJ3N0cmluZycpO1xuICAgIHN0YXRpYyBwdWJsaXNoZWRBdCA9IGF0dHIoJ2RhdGUnKTtcbiAgfVxuICBsZXQgY29udGFpbmVyID0gPENvbnRhaW5lcj50LmNvbnRleHQuY29udGFpbmVyO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ21vZGVsOnBvc3QnLCBQb3N0KTtcbiAgY29udGFpbmVyLnJlZ2lzdGVyKCdvcm0tYWRhcHRlcjpwb3N0JywgTWVtb3J5QWRhcHRlcik7XG5cbiAgbGV0IGF0dHJpYnV0ZXMgPSBQb3N0Lm1hcEF0dHJpYnV0ZXMoY29udGFpbmVyLCAoZGVzY3JpcHRvcjogYW55LCBuYW1lOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4geyBuYW1lLCB2YWx1ZTogZGVzY3JpcHRvci50eXBlIH07XG4gIH0pO1xuXG4gIHQuZGVlcEVxdWFsKGF0dHJpYnV0ZXMsIFtcbiAgICB7IG5hbWU6ICd0aXRsZScsIHZhbHVlOiAnc3RyaW5nJyB9LFxuICAgIHsgbmFtZTogJ3B1Ymxpc2hlZEF0JywgdmFsdWU6ICdkYXRlJyB9XG4gIF0pO1xufSk7XG5cbnRlc3QoJ21hcFJlbGF0aW9uc2hpcHMgbWFwcyBvdmVyIGVhY2ggcmVsYXRpb25zaGlwJywgYXN5bmMgKHQpID0+IHtcbiAgY2xhc3MgUG9zdCBleHRlbmRzIE1vZGVsIHtcbiAgICBzdGF0aWMgYXV0aG9yID0gaGFzT25lKCd1c2VyJyk7XG4gICAgc3RhdGljIGNvbW1lbnRzID0gaGFzTWFueSgnY29tbWVudCcpO1xuICB9XG4gIGxldCBjb250YWluZXIgPSA8Q29udGFpbmVyPnQuY29udGV4dC5jb250YWluZXI7XG4gIGNvbnRhaW5lci5yZWdpc3RlcignbW9kZWw6cG9zdCcsIFBvc3QpO1xuICBjb250YWluZXIucmVnaXN0ZXIoJ29ybS1hZGFwdGVyOnBvc3QnLCBNZW1vcnlBZGFwdGVyKTtcblxuICBsZXQgcmVsYXRpb25zaGlwcyA9IFBvc3QubWFwUmVsYXRpb25zaGlwcyhjb250YWluZXIsIChkZXNjcmlwdG9yOiBhbnksIG5hbWU6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB7IG5hbWUgfTtcbiAgfSk7XG5cbiAgdC5kZWVwRXF1YWwocmVsYXRpb25zaGlwcywgW1xuICAgIHsgbmFtZTogJ2F1dGhvcicgfSxcbiAgICB7IG5hbWU6ICdjb21tZW50cycgfVxuICBdKTtcbn0pO1xuIl19